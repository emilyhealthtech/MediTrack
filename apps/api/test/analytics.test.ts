import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';

// Mock database layer
vi.mock('@meditrack/database', () => {
  const now = new Date();
  const mockOrgs: any[] = [
    {
      id: 'org-test-1',
      name: 'Lagos City General Hospital',
      slug: 'lagos-city-general',
      rcNumber: 'RC-102030',
      isVerified: true,
      createdAt: new Date('2024-01-01T00:00:00Z'),
    },
    {
      id: 'org-test-2',
      name: 'Abuja Specialist Clinic',
      slug: 'abuja-specialist',
      rcNumber: 'RC-405060',
      isVerified: true,
      createdAt: new Date('2024-01-01T00:00:00Z'),
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
      id: 'user-doctor-1',
      email: 'dr.ngozi@lagosgen.ng',
      passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$mockhash',
      fullName: 'Dr. Ngozi Okonjo',
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
      user: mockUsers[0],
    },
    {
      id: 'mem-2',
      userId: 'user-doctor-1',
      organizationId: 'org-test-1',
      role: 'FACILITY_STAFF',
      isActive: true,
      user: mockUsers[1],
    },
  ];

  const mockPatients: any[] = [
    {
      id: 'pat-1',
      userId: 'pat-user-1',
      organizationId: 'org-test-1',
      gender: 'MALE',
      dateOfBirth: new Date('1990-05-15T00:00:00Z'),
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    },
    {
      id: 'pat-2',
      userId: 'pat-user-2',
      organizationId: 'org-test-1',
      gender: 'FEMALE',
      dateOfBirth: new Date('2000-02-10T00:00:00Z'),
      createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    },
    {
      id: 'pat-3',
      userId: 'pat-user-3',
      organizationId: 'org-test-1',
      gender: 'FEMALE',
      dateOfBirth: new Date('2015-08-20T00:00:00Z'),
      createdAt: new Date('2023-01-01T00:00:00Z'), // Old registration
    },
  ];

  const mockAppointments: any[] = [
    {
      id: 'apt-1',
      organizationId: 'org-test-1',
      facilityId: 'fac-1',
      patientId: 'pat-1',
      providerId: 'user-doctor-1',
      scheduledAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      durationMinutes: 45,
      department: 'Cardiology',
      mode: 'IN_PERSON',
      status: 'COMPLETED',
      facility: { id: 'fac-1', name: 'Main Campus' },
      provider: mockUsers[1],
      patient: mockPatients[0],
    },
    {
      id: 'apt-2',
      organizationId: 'org-test-1',
      facilityId: 'fac-1',
      patientId: 'pat-2',
      providerId: 'user-doctor-1',
      scheduledAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      durationMinutes: 30,
      department: 'General Medicine',
      mode: 'VIRTUAL',
      status: 'SCHEDULED',
      facility: { id: 'fac-1', name: 'Main Campus' },
      provider: mockUsers[1],
      patient: mockPatients[1],
    },
    {
      id: 'apt-3',
      organizationId: 'org-test-1',
      facilityId: 'fac-1',
      patientId: 'pat-3',
      providerId: 'user-doctor-1',
      scheduledAt: new Date(now.getTime() - 12 * 60 * 60 * 1000),
      durationMinutes: 30,
      department: 'Pediatrics',
      mode: 'TELEPHONE',
      status: 'CANCELLED',
      facility: { id: 'fac-1', name: 'Main Campus' },
      provider: mockUsers[1],
      patient: mockPatients[2],
    },
    {
      id: 'apt-4',
      organizationId: 'org-test-1',
      facilityId: 'fac-1',
      patientId: 'pat-1',
      providerId: 'user-doctor-1',
      scheduledAt: new Date(now.getTime() - 6 * 60 * 60 * 1000),
      durationMinutes: 30,
      department: 'Cardiology',
      mode: 'IN_PERSON',
      status: 'NO_SHOW',
      facility: { id: 'fac-1', name: 'Main Campus' },
      provider: mockUsers[1],
      patient: mockPatients[0],
    },
  ];

  return {
    db: {
      organization: {
        findUnique: vi.fn(async ({ where }: any) => {
          return mockOrgs.find((o) => o.id === where.id) || null;
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
        count: vi.fn(async ({ where }: any) => {
          return mockMemberships.filter(
            (m) =>
              m.organizationId === where.organizationId &&
              (where.isActive === undefined || m.isActive === where.isActive)
          ).length;
        }),
      },
      patient: {
        findMany: vi.fn(async ({ where }: any) => {
          return mockPatients.filter((p) => p.organizationId === where.organizationId);
        }),
        count: vi.fn(async ({ where }: any) => {
          return mockPatients.filter((p) => {
            if (p.organizationId !== where.organizationId) return false;
            if (where.createdAt?.gte && p.createdAt < where.createdAt.gte) return false;
            if (where.createdAt?.lte && p.createdAt > where.createdAt.lte) return false;
            return true;
          }).length;
        }),
      },
      appointment: {
        findMany: vi.fn(async ({ where }: any) => {
          return mockAppointments.filter((a) => {
            if (a.organizationId !== where.organizationId) return false;
            if (where.scheduledAt?.gte && a.scheduledAt < where.scheduledAt.gte) return false;
            if (where.scheduledAt?.lte && a.scheduledAt > where.scheduledAt.lte) return false;
            if (where.facilityId && a.facilityId !== where.facilityId) return false;
            if (where.department && a.department !== where.department) return false;
            if (where.providerId && a.providerId !== where.providerId) return false;
            return true;
          });
        }),
        count: vi.fn(async ({ where }: any) => {
          return mockAppointments.filter((a) => {
            if (a.organizationId !== where.organizationId) return false;
            if (where.scheduledAt?.gte && a.scheduledAt < where.scheduledAt.gte) return false;
            if (where.scheduledAt?.lte && a.scheduledAt > where.scheduledAt.lte) return false;
            if (where.status) {
              if (typeof where.status === 'string' && a.status !== where.status) return false;
              if (where.status.in && !where.status.in.includes(a.status)) return false;
            }
            if (where.facilityId && a.facilityId !== where.facilityId) return false;
            if (where.department && a.department !== where.department) return false;
            return true;
          }).length;
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

describe('MediTrack Healthcare Analytics Dashboard Engine & APIs', () => {
  it('GET /api/v1/organizations/:id/analytics should return full dashboard metrics', async () => {
    const res = await request(app)
      .get('/api/v1/organizations/org-test-1/analytics?granularity=daily')
      .set('Cookie', ['meditrack_session=mock-session-token']);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const data = res.body.data;
    expect(data.organizationId).toBe('org-test-1');
    expect(data.organizationName).toBe('Lagos City General Hospital');

    // Summary Statistics
    expect(data.summaryStats.totalRegisteredPatients).toBe(3);
    expect(data.summaryStats.newPatients).toBe(2);
    expect(data.summaryStats.totalAppointments).toBe(4);
    expect(data.summaryStats.completedAppointments).toBe(1);
    expect(data.summaryStats.pendingAppointments).toBe(1);
    expect(data.summaryStats.cancelledAppointments).toBe(1);
    expect(data.summaryStats.missedAppointments).toBe(1);
    expect(data.summaryStats.activeHealthcareProviders).toBe(2);

    // Demographics
    expect(data.patientDemographics.gender.male).toBe(1);
    expect(data.patientDemographics.gender.female).toBe(2);
    expect(data.patientDemographics.ageGroups.length).toBeGreaterThan(0);

    // Department Performance
    expect(data.departmentPerformance.length).toBeGreaterThan(0);
    const cardio = data.departmentPerformance.find((d: any) => d.department === 'Cardiology');
    expect(cardio).toBeDefined();
    expect(cardio.totalAppointments).toBe(2);

    // Most Requested Services
    expect(data.mostRequestedServices.length).toBeGreaterThan(0);

    // Visit Statistics
    expect(data.visitStatistics.overallCompletionRate).toBe(25); // 1 / 4 = 25%
    expect(data.visitStatistics.modeDistribution.inPerson).toBe(2);
    expect(data.visitStatistics.modeDistribution.virtual).toBe(1);
    expect(data.visitStatistics.modeDistribution.telephone).toBe(1);

    // Provider Activity
    expect(data.providerActivity.length).toBe(2);
    const doctor = data.providerActivity.find((p: any) => p.providerId === 'user-doctor-1');
    expect(doctor).toBeDefined();
    expect(doctor.totalAppointments).toBe(4);
  });

  it('GET /api/v1/organizations/:id/analytics should enforce cross-tenant authorization isolation', async () => {
    // Attempting to access another hospital's analytics where user has no membership
    const res = await request(app)
      .get('/api/v1/organizations/org-test-2/analytics')
      .set('Cookie', ['meditrack_session=mock-session-token']);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('CROSS_TENANT_ACCESS_DENIED');
  });

  it('GET /api/v1/analytics should resolve active organization session context', async () => {
    const res = await request(app)
      .get('/api/v1/analytics')
      .set('Cookie', ['meditrack_session=mock-session-token']);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.organizationId).toBe('org-test-1');
  });

  it('GET /api/v1/organizations/:id/analytics/export should generate CSV reports', async () => {
    const res = await request(app)
      .get('/api/v1/organizations/org-test-1/analytics/export?reportType=overview')
      .set('Cookie', ['meditrack_session=mock-session-token']);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');
    expect(res.text).toContain('"Organization Name","Lagos City General Hospital"');
    expect(res.text).toContain('"Total Registered Patients","3"');
    expect(res.text).toContain('"Total Appointments","4"');
  });

  it('GET /api/v1/organizations/:id/analytics/export should export department breakdown CSV', async () => {
    const res = await request(app)
      .get('/api/v1/organizations/org-test-1/analytics/export?reportType=departments')
      .set('Cookie', ['meditrack_session=mock-session-token']);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');
    expect(res.text).toContain('"Department","Total Appointments","Completed","Cancelled","Completion Rate (%)"');
    expect(res.text).toContain('"Cardiology"');
  });
});
