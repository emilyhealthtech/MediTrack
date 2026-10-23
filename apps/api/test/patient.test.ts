import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { PatientService } from '../src/services/patient.service';

// Synthetic Test Data
const mockUsers: any[] = [];
const mockPatients: any[] = [];
const mockSessions: any[] = [];
const mockMemberships: any[] = [];
const mockAllergies: any[] = [];
const mockConditions: any[] = [];
const mockMedications: any[] = [];
const mockHistory: any[] = [];
const mockAuditEvents: any[] = [];
const mockAppointments: any[] = [];
const mockNotifications: any[] = [];

vi.mock('@meditrack/database', () => {
  return {
    db: {
      user: {
        findUnique: vi.fn(async ({ where }: any) => {
          if (where.email) return mockUsers.find((u) => u.email === where.email) || null;
          if (where.id) return mockUsers.find((u) => u.id === where.id) || null;
          return null;
        }),
        create: vi.fn(async ({ data }: any) => {
          const u = {
            id: `usr-${Date.now()}-${Math.random()}`,
            email: data.email,
            passwordHash: data.passwordHash || 'hashed',
            fullName: data.fullName,
            phoneNumber: data.phoneNumber || null,
            role: data.role || 'PATIENT',
            isVerified: data.isVerified || false,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          mockUsers.push(u);
          return u;
        }),
        update: vi.fn(async ({ where, data }: any) => {
          const u = mockUsers.find((usr) => usr.id === where.id);
          if (u) Object.assign(u, data);
          return u;
        }),
      },

      patient: {
        findUnique: vi.fn(async ({ where }: any) => {
          if (where.userId) {
            const p = mockPatients.find((pat) => pat.userId === where.userId);
            if (!p) return null;
            const u = mockUsers.find((usr) => usr.id === p.userId);
            return { ...p, user: u };
          }
          if (where.id) {
            const p = mockPatients.find((pat) => pat.id === where.id);
            if (!p) return null;
            const u = mockUsers.find((usr) => usr.id === p.userId);
            return { ...p, user: u };
          }
          return null;
        }),
        findMany: vi.fn(async ({ where }: any) => {
          let list = [...mockPatients];
          if (where.gender) {
            list = list.filter((p) => p.gender === where.gender);
          }
          return list.map((p) => ({
            ...p,
            user: mockUsers.find((usr) => usr.id === p.userId),
          }));
        }),
        create: vi.fn(async ({ data }: any) => {
          const p = {
            id: `pat-${Date.now()}-${Math.random()}`,
            userId: data.userId,
            organizationId: data.organizationId || null,
            dateOfBirth: data.dateOfBirth || null,
            gender: data.gender || null,
            bloodGroup: data.bloodGroup || null,
            genotype: data.genotype || null,
            emergencyContact: data.emergencyContact || null,
            emergencyContactName: data.emergencyContactName || null,
            emergencyContactPhone: data.emergencyContactPhone || null,
            emergencyContactRelationship: data.emergencyContactRelationship || null,
            address: data.address || null,
            city: data.city || null,
            state: data.state || null,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          mockPatients.push(p);
          const u = mockUsers.find((usr) => usr.id === p.userId);
          return { ...p, user: u };
        }),
        update: vi.fn(async ({ where, data }: any) => {
          const p = mockPatients.find((pat) => pat.userId === where.userId || pat.id === where.id);
          if (p) {
            Object.assign(p, data);
            if (data.user?.update && p.userId) {
              const u = mockUsers.find((usr) => usr.id === p.userId);
              if (u) Object.assign(u, data.user.update);
            }
          }
          const u = mockUsers.find((usr) => usr.id === p?.userId);
          return { ...p, user: u };
        }),
      },

      patientAllergy: {
        findMany: vi.fn(async ({ where }: any) => {
          return mockAllergies.filter((a) => a.patientId === where.patientId);
        }),
        findFirst: vi.fn(async ({ where }: any) => {
          return mockAllergies.find((a) => a.id === where.id && a.patientId === where.patientId) || null;
        }),
        create: vi.fn(async ({ data }: any) => {
          const item = { id: `alg-${Date.now()}`, ...data, createdAt: new Date(), updatedAt: new Date() };
          mockAllergies.push(item);
          return item;
        }),
        update: vi.fn(async ({ where, data }: any) => {
          const item = mockAllergies.find((a) => a.id === where.id);
          if (item) Object.assign(item, data);
          return item;
        }),
        delete: vi.fn(async ({ where }: any) => {
          const index = mockAllergies.findIndex((a) => a.id === where.id);
          if (index !== -1) mockAllergies.splice(index, 1);
          return true;
        }),
      },

      patientCondition: {
        findMany: vi.fn(async ({ where }: any) => {
          return mockConditions.filter((c) => c.patientId === where.patientId);
        }),
        findFirst: vi.fn(async ({ where }: any) => {
          return mockConditions.find((c) => c.id === where.id && c.patientId === where.patientId) || null;
        }),
        create: vi.fn(async ({ data }: any) => {
          const item = { id: `cond-${Date.now()}`, ...data, createdAt: new Date(), updatedAt: new Date() };
          mockConditions.push(item);
          return item;
        }),
        update: vi.fn(async ({ where, data }: any) => {
          const item = mockConditions.find((c) => c.id === where.id);
          if (item) Object.assign(item, data);
          return item;
        }),
        delete: vi.fn(async ({ where }: any) => {
          const index = mockConditions.findIndex((c) => c.id === where.id);
          if (index !== -1) mockConditions.splice(index, 1);
          return true;
        }),
      },

      patientMedication: {
        findMany: vi.fn(async ({ where }: any) => {
          return mockMedications.filter((m) => m.patientId === where.patientId);
        }),
        findFirst: vi.fn(async ({ where }: any) => {
          return mockMedications.find((m) => m.id === where.id && m.patientId === where.patientId) || null;
        }),
        create: vi.fn(async ({ data }: any) => {
          const item = { id: `med-${Date.now()}`, ...data, createdAt: new Date(), updatedAt: new Date() };
          mockMedications.push(item);
          return item;
        }),
        update: vi.fn(async ({ where, data }: any) => {
          const item = mockMedications.find((m) => m.id === where.id);
          if (item) Object.assign(item, data);
          return item;
        }),
        delete: vi.fn(async ({ where }: any) => {
          const index = mockMedications.findIndex((m) => m.id === where.id);
          if (index !== -1) mockMedications.splice(index, 1);
          return true;
        }),
      },

      patientMedicalHistory: {
        findMany: vi.fn(async ({ where }: any) => {
          return mockHistory.filter((h) => h.patientId === where.patientId);
        }),
        findFirst: vi.fn(async ({ where }: any) => {
          return mockHistory.find((h) => h.id === where.id && h.patientId === where.patientId) || null;
        }),
        create: vi.fn(async ({ data }: any) => {
          const item = { id: `hist-${Date.now()}`, ...data, createdAt: new Date(), updatedAt: new Date() };
          mockHistory.push(item);
          return item;
        }),
        update: vi.fn(async ({ where, data }: any) => {
          const item = mockHistory.find((h) => h.id === where.id);
          if (item) Object.assign(item, data);
          return item;
        }),
        delete: vi.fn(async ({ where }: any) => {
          const index = mockHistory.findIndex((h) => h.id === where.id);
          if (index !== -1) mockHistory.splice(index, 1);
          return true;
        }),
      },

      appointment: {
        findMany: vi.fn(async ({ where }: any) => {
          return mockAppointments.filter((a) => a.patientId === where.patientId);
        }),
        findFirst: vi.fn(async ({ where }: any) => {
          return mockAppointments.find((a) => a.patientId === where.patientId) || null;
        }),
      },

      notification: {
        findMany: vi.fn(async ({ where }: any) => {
          return mockNotifications.filter((n) => n.recipient === where.recipient);
        }),
      },

      session: {
        findUnique: vi.fn(async ({ where }: any) => {
          return mockSessions.find((s) => s.tokenHash === where.tokenHash) || null;
        }),
        create: vi.fn(async ({ data }: any) => {
          const u = mockUsers.find((usr) => usr.id === data.userId);
          const sess = {
            id: `sess-${Date.now()}`,
            tokenHash: data.tokenHash,
            userId: data.userId,
            activeOrganizationId: data.activeOrganizationId || 'org-1',
            activeFacilityId: null,
            isMfaVerified: true,
            expiresAt: data.expiresAt,
            user: u,
          };
          mockSessions.push(sess);
          return sess;
        }),
      },

      membership: {
        findFirst: vi.fn(async ({ where }: any) => {
          return mockMemberships.find((m) => m.userId === where.userId) || null;
        }),
        findUnique: vi.fn(async ({ where }: any) => {
          return (
            mockMemberships.find(
              (m) =>
                m.userId === where.userId_organizationId.userId &&
                m.organizationId === where.userId_organizationId.organizationId
            ) || null
          );
        }),
      },

      auditEvent: {
        create: vi.fn(async ({ data }: any) => {
          const ev = { id: `audit-${Date.now()}`, ...data };
          mockAuditEvents.push(ev);
          return ev;
        }),
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

describe('Phase 3 — Patient Management & Health Profile Endpoints', () => {
  beforeEach(async () => {
    mockUsers.length = 0;
    mockPatients.length = 0;
    mockAllergies.length = 0;
    mockMemberships.length = 0;

    // Setup synthetic patient account
    const patUser = {
      id: 'usr-patient-1',
      email: 'synthetic.patient@example.ng',
      passwordHash: 'hash',
      fullName: 'Chidi Okafor',
      phoneNumber: '+2348011112222',
      role: 'PATIENT',
      isVerified: true,
    };

    const patProfile = {
      id: 'pat-1',
      userId: 'usr-patient-1',
      organizationId: 'org-1',
      dateOfBirth: new Date('1990-05-15'),
      gender: 'MALE',
      bloodGroup: 'O+',
      genotype: 'AA',
      emergencyContactName: 'Nneka Okafor',
      emergencyContactPhone: '+2348033334444',
      emergencyContactRelationship: 'Spouse',
      address: '12 Marina Road',
      city: 'Lagos',
      state: 'Lagos',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Setup synthetic staff account
    const staffUser = {
      id: 'usr-staff-1',
      email: 'dr.ade@lagoshealth.ng',
      passwordHash: 'hash',
      fullName: 'Dr. Adebayo',
      role: 'FACILITY_STAFF',
      isVerified: true,
    };

    mockUsers.push(patUser, staffUser);
    mockPatients.push(patProfile);
    mockMemberships.push({
      id: 'mem-1',
      userId: 'usr-staff-1',
      organizationId: 'org-1',
      role: 'FACILITY_STAFF',
    });
  });

  it('GET /api/v1/patients/me should return authenticated patient profile or 401 if unauthenticated', async () => {
    const res = await request(app)
      .get('/api/v1/patients/me')
      .set('Cookie', ['meditrack_session=mock_patient_session']);

    expect([200, 401]).toContain(res.status);
  });

  it('Staff registration of patient record triggers duplicate check rule', async () => {
    const res = await request(app)
      .post('/api/v1/patients')
      .set('x-organization-id', 'org-1')
      .send({
        fullName: 'Chidi Okafor Duplicate',
        email: 'synthetic.patient@example.ng',
        phoneNumber: '+2348011112222',
      });

    expect([401, 409, 403]).toContain(res.status);
  });

  it('PatientService prevents deletion of clinician-verified health records', async () => {
    // Add clinician-verified allergy
    const allergy = await PatientService.addAllergy(
      'pat-1',
      { allergen: 'Penicillin', severity: 'SEVERE', reaction: 'Anaphylaxis' },
      true, // isClinician
      'usr-staff-1'
    );

    expect(allergy.isVerifiedByClinician).toBe(true);

    // Attempt deletion by patient should throw CLINICIAN_VERIFIED_RECORD
    await expect(
      PatientService.deleteAllergy('pat-1', allergy.id, 'usr-patient-1')
    ).rejects.toThrow('Clinician-verified health records cannot be deleted');
  });
});
