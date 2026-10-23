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
        return data;
      }),
    },
  },
}));

describe('Phase 4 — Appointment Scheduling & Availability Unit Tests', () => {
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
});
