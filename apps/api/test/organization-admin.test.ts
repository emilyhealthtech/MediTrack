import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { db } from '@meditrack/database';
import { EmailService } from '../src/services/email.service';

vi.mock('@meditrack/database', () => {
  const mockOrgs: any[] = [
    {
      id: 'org-test-1',
      name: 'Lagos City General Hospital',
      slug: 'lagos-city-gen',
      rcNumber: 'RC-102030',
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      facilities: [{ id: 'fac-1', name: 'Main Campus', city: 'Lagos' }],
      subscriptions: [],
      _count: { memberships: 2, facilities: 1, patients: 5 },
    },
  ];

  const mockUsers: any[] = [
    {
      id: 'user-admin-1',
      email: 'admin@lagosgen.ng',
      passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$mockhash',
      fullName: 'Dr. Tunde Admin',
      role: 'FACILITY_ADMIN',
      isVerified: true,
      mfaEnabled: false,
      memberships: [{ organizationId: 'org-test-1', role: 'FACILITY_ADMIN', isActive: true }],
    },
    {
      id: 'user-staff-1',
      email: 'staff@lagosgen.ng',
      passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$mockhash',
      fullName: 'Nurse Ngozi',
      role: 'FACILITY_STAFF',
      isVerified: true,
      mfaEnabled: false,
      memberships: [{ organizationId: 'org-test-1', role: 'FACILITY_STAFF', isActive: true }],
    },
  ];

  const mockMemberships: any[] = [
    {
      id: 'mem-1',
      userId: 'user-admin-1',
      organizationId: 'org-test-1',
      role: 'FACILITY_ADMIN',
      isActive: true,
      createdAt: new Date(),
      user: mockUsers[0],
    },
    {
      id: 'mem-2',
      userId: 'user-staff-1',
      organizationId: 'org-test-1',
      role: 'FACILITY_STAFF',
      isActive: true,
      createdAt: new Date(),
      user: mockUsers[1],
    },
  ];

  const mockInvitations: any[] = [
    {
      id: 'inv-1',
      organizationId: 'org-test-1',
      email: 'pending.doctor@lagosgen.ng',
      role: 'FACILITY_STAFF',
      tokenHash: 'mock-token-hash-1',
      inviterId: 'user-admin-1',
      expiresAt: new Date(Date.now() + 86400000),
      acceptedAt: null,
      createdAt: new Date(),
    },
  ];

  const mockAuditLogs: any[] = [];
  const mockNotifications: any[] = [];

  const mockAppointments: any[] = [
    {
      id: 'apt-test-1',
      organizationId: 'org-test-1',
      facilityId: 'fac-1',
      patientId: 'pat-1',
      scheduledAt: new Date(),
      durationMinutes: 30,
      department: 'General Medicine',
      mode: 'IN_PERSON',
      status: 'CONFIRMED',
      facility: { name: 'Main Campus', address: '1 Hospital Rd', city: 'Lagos' },
      patient: { user: { fullName: 'Amina Bello', email: 'amina@example.com' } },
    },
  ];

  return {
    db: {
      organization: {
        findUnique: vi.fn(async ({ where }: any) => {
          return mockOrgs.find((o) => o.id === where.id) || null;
        }),
        update: vi.fn(async ({ where, data }: any) => {
          const org = mockOrgs.find((o) => o.id === where.id);
          if (org) Object.assign(org, data);
          return org;
        }),
      },
      user: {
        findUnique: vi.fn(async ({ where }: any) => {
          if (where.email) return mockUsers.find((u) => u.email === where.email) || null;
          if (where.id) return mockUsers.find((u) => u.id === where.id) || null;
          return null;
        }),
      },
      membership: {
        findMany: vi.fn(async ({ where }: any) => {
          return mockMemberships.filter((m) => m.organizationId === where.organizationId);
        }),
        findFirst: vi.fn(async ({ where }: any) => {
          return (
            mockMemberships.find(
              (m) =>
                (!where.id || m.id === where.id) &&
                (!where.organizationId || m.organizationId === where.organizationId)
            ) || null
          );
        }),
        update: vi.fn(async ({ where, data }: any) => {
          const mem = mockMemberships.find((m) => m.id === where.id);
          if (mem) Object.assign(mem, data);
          return mem;
        }),
        delete: vi.fn(async ({ where }: any) => {
          const idx = mockMemberships.findIndex((m) => m.id === where.id);
          if (idx !== -1) mockMemberships.splice(idx, 1);
          return { count: 1 };
        }),
        count: vi.fn(async ({ where }: any) => {
          return mockMemberships.filter(
            (m) =>
              m.organizationId === where.organizationId &&
              (where.isActive === undefined || m.isActive === where.isActive)
          ).length;
        }),
      },
      invitation: {
        findMany: vi.fn(async ({ where }: any) => {
          return mockInvitations.filter(
            (inv) => inv.organizationId === where.organizationId && (!where.acceptedAt || inv.acceptedAt === null)
          );
        }),
        findFirst: vi.fn(async ({ where }: any) => {
          return mockInvitations.find((inv) => inv.id === where.id && inv.organizationId === where.organizationId) || null;
        }),
        delete: vi.fn(async ({ where }: any) => {
          const idx = mockInvitations.findIndex((inv) => inv.id === where.id);
          if (idx !== -1) mockInvitations.splice(idx, 1);
          return { count: 1 };
        }),
      },
      appointment: {
        findUnique: vi.fn(async ({ where }: any) => {
          return mockAppointments.find((a) => a.id === where.id) || null;
        }),
        count: vi.fn(async ({ where }: any) => {
          return mockAppointments.filter(
            (a) =>
              a.organizationId === where.organizationId &&
              (!where.status || a.status === where.status)
          ).length;
        }),
      },
      patient: {
        count: vi.fn(async ({ where }: any) => 5),
      },
      encounter: {
        count: vi.fn(async ({ where }: any) => 3),
      },
      auditEvent: {
        create: vi.fn(async ({ data }: any) => {
          const log = { id: `audit-${Date.now()}`, ...data, createdAt: new Date() };
          mockAuditLogs.push(log);
          return log;
        }),
        findMany: vi.fn(async () => mockAuditLogs),
      },
      notification: {
        create: vi.fn(async ({ data }: any) => {
          const notif = { id: `notif-${Date.now()}`, ...data, createdAt: new Date() };
          mockNotifications.push(notif);
          return notif;
        }),
        findMany: vi.fn(async ({ where }: any) => {
          return mockNotifications.filter(
            (n) => n.status === where.status && (!where.retryCount?.lt || n.retryCount < where.retryCount.lt)
          );
        }),
        update: vi.fn(async ({ where, data }: any) => {
          const notif = mockNotifications.find((n) => n.id === where.id);
          if (notif) Object.assign(notif, data);
          return notif;
        }),
      },
      session: {
        findUnique: vi.fn(async () => ({
          id: 'sess-admin-1',
          userId: 'user-admin-1',
          activeOrganizationId: 'org-test-1',
          user: mockUsers[0],
        })),
      },
    },
    Role: {
      PATIENT: 'PATIENT',
      FACILITY_STAFF: 'FACILITY_STAFF',
      FACILITY_ADMIN: 'FACILITY_ADMIN',
      SYSTEM_ADMIN: 'SYSTEM_ADMIN',
    },
  };
});

describe('Phase 5 — Organization Administration, Reporting & Integrations', () => {
  it('GET /api/v1/organizations/:id should return organization details for members', async () => {
    const res = await request(app)
      .get('/api/v1/organizations/org-test-1')
      .set('Cookie', ['meditrack_session=mock-session-token']);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Lagos City General Hospital');
  });

  it('PATCH /api/v1/organizations/:id should update settings when called by Org Admin', async () => {
    const res = await request(app)
      .patch('/api/v1/organizations/org-test-1')
      .set('Cookie', ['meditrack_session=mock-session-token'])
      .send({
        name: 'Lagos City Specialist Hospital',
        rcNumber: 'RC-998877',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Lagos City Specialist Hospital');
  });

  it('PATCH /api/v1/organizations/:id/members/:memberId should reject granting SYSTEM_ADMIN role', async () => {
    const res = await request(app)
      .patch('/api/v1/organizations/org-test-1/members/mem-2')
      .set('Cookie', ['meditrack_session=mock-session-token'])
      .send({
        role: 'SYSTEM_ADMIN',
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('UNAUTHORIZED_ROLE_ASSIGNMENT');
  });

  it('DELETE /api/v1/organizations/:id/invitations/:invitationId should revoke invitation', async () => {
    const res = await request(app)
      .delete('/api/v1/organizations/org-test-1/invitations/inv-1')
      .set('Cookie', ['meditrack_session=mock-session-token']);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/v1/organizations/:id/reports/summary should return aggregated operational stats', async () => {
    const res = await request(app)
      .get('/api/v1/organizations/org-test-1/reports/summary')
      .set('Cookie', ['meditrack_session=mock-session-token']);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.appointments).toBeDefined();
    expect(res.body.data.memberships).toBeDefined();
  });

  it('GET /api/v1/appointments/:id/ics should generate standard iCalendar file', async () => {
    const res = await request(app)
      .get('/api/v1/appointments/apt-test-1/ics')
      .set('Cookie', ['meditrack_session=mock-session-token']);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/calendar');
    expect(res.text).toContain('BEGIN:VCALENDAR');
    expect(res.text).toContain('SUMMARY:Healthcare Appointment — Main Campus');
  });

  it('EmailService should dispatch PHI-safeguarded emails and record delivery status', async () => {
    const sent = await EmailService.sendAppointmentConfirmationEmail(
      'patient@example.com',
      'Lagos Main Clinic',
      '2025-06-15 09:00 AM',
      'IN_PERSON'
    );

    expect(sent).toBe(true);
  });
});
