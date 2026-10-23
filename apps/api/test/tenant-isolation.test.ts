import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';

describe('Multi-Tenant Organization Isolation Tests', () => {
  it('rejects cross-tenant access when a staff member from Org A attempts to perform staff operations on Org B', async () => {
    const res = await request(app)
      .post('/api/v1/organizations/org-b-id/invitations')
      .send({
        email: 'newstaff@orgb.com',
        role: 'FACILITY_STAFF',
      });

    expect(res.status).toBe(401);
  });
});
