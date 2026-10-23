import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { db } from '@meditrack/database';

vi.mock('@meditrack/database', () => {
  const mockUsers: any[] = [];
  const mockSessions: any[] = [];
  const mockTokens: any[] = [];
  const mockResetTokens: any[] = [];
  const mockRecoveryCodes: any[] = [];

  return {
    db: {
      user: {
        findUnique: vi.fn(async ({ where }: any) => {
          if (where.email) return mockUsers.find((u) => u.email === where.email) || null;
          if (where.id) return mockUsers.find((u) => u.id === where.id) || null;
          return null;
        }),
        create: vi.fn(async ({ data }: any) => {
          const newUser = {
            id: `user-${Date.now()}-${Math.random()}`,
            email: data.email,
            passwordHash: data.passwordHash,
            fullName: data.fullName,
            phoneNumber: data.phoneNumber || null,
            role: data.role || 'PATIENT',
            isVerified: data.isVerified || false,
            mfaEnabled: data.mfaEnabled || false,
            mfaSecret: data.mfaSecret || null,
            createdAt: new Date(),
            updatedAt: new Date(),
            patientProfile: data.patientProfile?.create
              ? { id: `patient-${Date.now()}`, ...data.patientProfile.create }
              : null,
            memberships: [],
          };
          mockUsers.push(newUser);
          return newUser;
        }),
        update: vi.fn(async ({ where, data }: any) => {
          const u = mockUsers.find((user) => user.id === where.id);
          if (u) Object.assign(u, data);
          return u;
        }),
      },
      patientProfile: {
        create: vi.fn(async ({ data }: any) => ({ id: `p-${Date.now()}`, ...data })),
      },
      session: {
        create: vi.fn(async ({ data }: any) => {
          const u = mockUsers.find((user) => user.id === data.userId);
          const sess = {
            id: `sess-${Date.now()}`,
            tokenHash: data.tokenHash,
            userId: data.userId,
            activeOrganizationId: data.activeOrganizationId || null,
            activeFacilityId: data.activeFacilityId || null,
            isMfaVerified: data.isMfaVerified || false,
            expiresAt: data.expiresAt,
            revokedAt: null,
            user: u,
          };
          mockSessions.push(sess);
          return sess;
        }),
        findUnique: vi.fn(async ({ where }: any) => {
          return mockSessions.find((s) => s.tokenHash === where.tokenHash) || null;
        }),
        update: vi.fn(async ({ where, data }: any) => {
          const s = mockSessions.find((sess) => sess.id === where.id);
          if (s) Object.assign(s, data);
          return s;
        }),
        updateMany: vi.fn(async ({ where, data }: any) => {
          mockSessions
            .filter((sess) => sess.userId === where.userId)
            .forEach((sess) => Object.assign(sess, data));
          return { count: 1 };
        }),
      },
      emailVerificationToken: {
        create: vi.fn(async ({ data }: any) => {
          const t = { id: `vt-${Date.now()}`, ...data, usedAt: null };
          mockTokens.push(t);
          return t;
        }),
        findUnique: vi.fn(async ({ where }: any) => {
          const t = mockTokens.find((tok) => tok.tokenHash === where.tokenHash);
          if (t) {
            const u = mockUsers.find((usr) => usr.id === t.userId);
            return { ...t, user: u };
          }
          return null;
        }),
        update: vi.fn(async ({ where, data }: any) => {
          const t = mockTokens.find((tok) => tok.id === where.id);
          if (t) Object.assign(t, data);
          return t;
        }),
      },
      passwordResetToken: {
        create: vi.fn(async ({ data }: any) => {
          const t = { id: `prt-${Date.now()}`, ...data, usedAt: null };
          mockResetTokens.push(t);
          return t;
        }),
        findUnique: vi.fn(async ({ where }: any) => {
          const t = mockResetTokens.find((tok) => tok.tokenHash === where.tokenHash);
          if (t) {
            const u = mockUsers.find((usr) => usr.id === t.userId);
            return { ...t, user: u };
          }
          return null;
        }),
        update: vi.fn(async ({ where, data }: any) => {
          const t = mockResetTokens.find((tok) => tok.id === where.id);
          if (t) Object.assign(t, data);
          return t;
        }),
      },
      mfaRecoveryCode: {
        create: vi.fn(async ({ data }: any) => {
          const rc = { id: `rc-${Date.now()}`, ...data, usedAt: null };
          mockRecoveryCodes.push(rc);
          return rc;
        }),
        findFirst: vi.fn(async ({ where }: any) => {
          return (
            mockRecoveryCodes.find(
              (rc) => rc.userId === where.userId && rc.codeHash === where.codeHash && !rc.usedAt
            ) || null
          );
        }),
        update: vi.fn(async ({ where, data }: any) => {
          const rc = mockRecoveryCodes.find((c) => c.id === where.id);
          if (rc) Object.assign(rc, data);
          return rc;
        }),
      },
      notification: {
        create: vi.fn(async ({ data }: any) => ({ id: `notif-${Date.now()}`, ...data })),
      },
      auditEvent: {
        create: vi.fn(async ({ data }: any) => ({ id: `audit-${Date.now()}`, ...data })),
      },
      membership: {
        findMany: vi.fn(async () => []),
        findUnique: vi.fn(async () => null),
      },
      $transaction: vi.fn(async (ops: any) => {
        if (Array.isArray(ops)) {
          return Promise.all(ops);
        }
        if (typeof ops === 'function') {
          return ops(db);
        }
        return ops;
      }),
    },
    Role: {
      PATIENT: 'PATIENT',
      FACILITY_STAFF: 'FACILITY_STAFF',
      FACILITY_ADMIN: 'FACILITY_ADMIN',
      SYSTEM_ADMIN: 'SYSTEM_ADMIN',
    },
  };
});

describe('Authentication API Endpoints', () => {
  it('POST /api/v1/auth/register/patient should register a new patient', async () => {
    const res = await request(app).post('/api/v1/auth/register/patient').send({
      email: 'test.patient@example.com',
      password: 'SecurePassword123!',
      fullName: 'Amina Bello',
      phoneNumber: '+2348012345678',
      consent: true,
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('test.patient@example.com');
    expect(res.headers['set-cookie']).toBeDefined();
  });

  it('POST /api/v1/auth/login should authenticate registered patient', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'test.patient@example.com',
      password: 'SecurePassword123!',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('test.patient@example.com');
  });

  it('POST /api/v1/auth/login should reject invalid password', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'test.patient@example.com',
      password: 'WrongPassword!',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('POST /api/v1/auth/password/forgot should issue generic password recovery response', async () => {
    const res = await request(app).post('/api/v1/auth/password/forgot').send({
      email: 'nonexistent@example.com',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('If an account exists');
  });
});
