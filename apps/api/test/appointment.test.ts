import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AppointmentService } from '../src/services/appointment.service';

const mockAppointments: any[] = [];
const mockAvailabilities: any[] = [];
const mockFacilities: any[] = [];
const mockPatients: any[] = [];
const mockMemberships: any[] = [];
const mockAuditEvents: any[] = [];

vi.mock('@meditrack/database', () => ({
  db: {
    facility: {
      findFirst: vi.fn(async ({ where }: any) => {
        return mockFacilities.find((f) => f.id === where.id && f.organizationId === where.organizationId) || null;
      }),
      findUnique: vi.fn(async ({ where }: any) => {
        return mockFacilities.find((f) => f.id === where.id) || null;
      }),
    },
    patient: {
      findUnique: vi.fn(async ({ where }: any) => {
        return mockPatients.find((p) => p.id === where.id) || null;
      }),
    },
    membership: {
      findFirst: vi.fn(async ({ where }: any) => {
        return mockMemberships.find((m) => m.userId === where.userId && m.organizationId === where.organizationId) || null;
      }),
    },
    appointment: {
      findFirst: vi.fn(async ({ where }: any) => {
        return mockAppointments.find((a) => {
          if (where.id?.not && a.id === where.id.not) return false;
          if (where.providerId && a.providerId !== where.providerId) return false;
          if (where.patientId && a.patientId !== where.patientId) return false;
          if (where.status?.in && !where.status.in.includes(a.status)) return false;
          return true;
        }) || null;
      }),
      findUnique: vi.fn(async ({ where }: any) => {
        return mockAppointments.find((a) => a.id === where.id) || null;
      }),
      findMany: vi.fn(async ({ where }: any) => {
        return mockAppointments.filter((a) => {
          if (where.organizationId && a.organizationId !== where.organizationId) return false;
          if (where.patientId && a.patientId !== where.patientId) return false;
          if (where.providerId && a.providerId !== where.providerId) return false;
          return true;
        });
      }),
      create: vi.fn(async ({ data }: any) => {
        const item = {
          id: `appt-${Date.now()}-${Math.random()}`,
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockAppointments.push(item);
        return item;
      }),
      update: vi.fn(async ({ where, data }: any) => {
        const item = mockAppointments.find((a) => a.id === where.id);
        if (item) Object.assign(item, data);
        return item;
      }),
    },
    providerAvailability: {
      upsert: vi.fn(async ({ create, update }: any) => {
        const existing = mockAvailabilities.find(
          (a) => a.facilityId === create.facilityId && a.providerId === create.providerId && a.dayOfWeek === create.dayOfWeek
        );
        if (existing) {
          Object.assign(existing, update);
          return existing;
        } else {
          const item = { id: `avail-${Date.now()}`, ...create };
          mockAvailabilities.push(item);
          return item;
        }
      }),
      findUnique: vi.fn(async ({ where }: any) => {
        const key = where.facilityId_providerId_dayOfWeek;
        return (
          mockAvailabilities.find(
            (a) => a.facilityId === key.facilityId && a.providerId === key.providerId && a.dayOfWeek === key.dayOfWeek
          ) || null
        );
      }),
    },
    auditEvent: {
      create: vi.fn(async ({ data }: any) => {
        mockAuditEvents.push(data);
        return { id: `audit-${Date.now()}`, ...data, createdAt: new Date() };
      }),
      findMany: vi.fn(async ({ where }: any) => {
        return mockAuditEvents.filter((a) => {
          if (where.entity && a.entity !== where.entity) return false;
          if (where.entityId && a.entityId !== where.entityId) return false;
          return true;
        });
      }),
    },
  },
}));

describe('Phase 4 & Appointment Management Dashboard Unit Tests', () => {
  beforeEach(() => {
    mockAppointments.length = 0;
    mockAvailabilities.length = 0;
    mockFacilities.length = 0;
    mockPatients.length = 0;
    mockMemberships.length = 0;
    mockAuditEvents.length = 0;

    mockFacilities.push({ id: 'fac-1', organizationId: 'org-1', name: 'Lagos Central Clinic' });
    mockPatients.push({ id: 'pat-1', userId: 'usr-pat-1', organizationId: 'org-1' });
    mockMemberships.push({ id: 'mem-1', userId: 'usr-doc-1', organizationId: 'org-1' });
  });

  it('should successfully book an appointment when no conflicts exist', async () => {
    const appt = await AppointmentService.createAppointment(
      'org-1',
      {
        facilityId: 'fac-1',
        patientId: 'pat-1',
        providerId: 'usr-doc-1',
        scheduledAt: '2025-06-10T10:00:00Z',
        durationMinutes: 30,
        department: 'General Medicine',
        mode: 'IN_PERSON',
      },
      'usr-pat-1'
    );

    expect(appt.id).toBeDefined();
    expect(appt.status).toBe('SCHEDULED');
    expect(mockAppointments.length).toBe(1);
  });

  it('should prevent double-booking conflict for overlapping provider time slot', async () => {
    // Existing appointment from 10:00 to 10:30
    mockAppointments.push({
      id: 'appt-existing',
      organizationId: 'org-1',
      facilityId: 'fac-1',
      patientId: 'pat-2',
      providerId: 'usr-doc-1',
      scheduledAt: new Date('2025-06-10T10:00:00Z'),
      durationMinutes: 30,
      status: 'SCHEDULED',
    });

    await expect(
      AppointmentService.createAppointment(
        'org-1',
        {
          facilityId: 'fac-1',
          patientId: 'pat-1',
          providerId: 'usr-doc-1',
          scheduledAt: '2025-06-10T10:15:00Z', // Overlaps with 10:00-10:30
          durationMinutes: 30,
          department: 'General Medicine',
        },
        'usr-pat-1'
      )
    ).rejects.toThrow('Scheduling conflict detected');
  });

  it('should enforce status transition state machine rules', async () => {
    mockAppointments.push({
      id: 'appt-1',
      organizationId: 'org-1',
      status: 'COMPLETED',
    });

    // COMPLETED -> IN_PROGRESS is invalid
    await expect(
      AppointmentService.updateAppointmentStatus('appt-1', { status: 'IN_PROGRESS' }, 'usr-staff-1')
    ).rejects.toThrow('Invalid status transition');
  });

  it('should allow marking appointment as NO_SHOW (missed) from SCHEDULED or CONFIRMED', async () => {
    mockAppointments.push({
      id: 'appt-noshow',
      organizationId: 'org-1',
      status: 'SCHEDULED',
    });

    const updated = await AppointmentService.updateAppointmentStatus(
      'appt-noshow',
      { status: 'NO_SHOW', notes: 'Patient did not arrive for scheduled slot' },
      'usr-staff-1'
    );

    expect(updated.status).toBe('NO_SHOW');
  });

  it('should reschedule appointment with conflict checking and audit trail', async () => {
    mockAppointments.push({
      id: 'appt-resched',
      organizationId: 'org-1',
      facilityId: 'fac-1',
      patientId: 'pat-1',
      providerId: 'usr-doc-1',
      scheduledAt: new Date('2025-06-10T10:00:00Z'),
      durationMinutes: 30,
      status: 'SCHEDULED',
    });

    const rescheduled = await AppointmentService.rescheduleAppointment(
      'appt-resched',
      {
        scheduledAt: '2025-06-11T14:00:00Z',
        reason: 'Patient requested afternoon time',
      },
      'usr-staff-1'
    );

    expect(rescheduled.scheduledAt).toEqual(new Date('2025-06-11T14:00:00Z'));
    expect(mockAuditEvents.some((e) => e.action === 'APPOINTMENT_RESCHEDULED')).toBe(true);
  });

  it('should cancel appointment and log audit event', async () => {
    mockAppointments.push({
      id: 'appt-cancel',
      organizationId: 'org-1',
      facilityId: 'fac-1',
      patientId: 'pat-1',
      providerId: 'usr-doc-1',
      scheduledAt: new Date('2025-06-10T10:00:00Z'),
      durationMinutes: 30,
      status: 'SCHEDULED',
    });

    const cancelled = await AppointmentService.cancelAppointment(
      'appt-cancel',
      'Patient unwell and requested cancellation',
      'usr-staff-1'
    );

    expect(cancelled.status).toBe('CANCELLED');
    expect(cancelled.cancellationReason).toBe('Patient unwell and requested cancellation');
    expect(mockAuditEvents.some((e) => e.action === 'APPOINTMENT_CANCELLED')).toBe(true);
  });

  it('should retrieve appointment by ID including audit trail', async () => {
    mockAppointments.push({
      id: 'appt-detail-1',
      organizationId: 'org-1',
      facilityId: 'fac-1',
      patientId: 'pat-1',
      providerId: 'usr-doc-1',
      department: 'Cardiology',
      scheduledAt: new Date('2025-06-10T10:00:00Z'),
      durationMinutes: 30,
      status: 'CONFIRMED',
    });

    mockAuditEvents.push({
      id: 'audit-1',
      action: 'APPOINTMENT_CREATED',
      entity: 'Appointment',
      entityId: 'appt-detail-1',
      userId: 'usr-staff-1',
      createdAt: new Date(),
    });

    const result = await AppointmentService.getAppointmentById('appt-detail-1');
    expect(result).not.toBeNull();
    expect(result!.id).toBe('appt-detail-1');
    expect(result!.auditTrail).toBeDefined();
    expect(result!.auditTrail.length).toBe(1);
  });
});
