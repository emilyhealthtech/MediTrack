import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';

describe('MediTrack API Foundation Tests', () => {
  it('GET /api/v1/health should return health status 200', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('MediTrack Core API');
  });

  it('GET /api/v1/readiness should return readiness status when database URL exists', async () => {
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/db';
    const res = await request(app).get('/api/v1/readiness');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ready');
  });

  it('POST /api/v1/contact should reject requests missing required fields', async () => {
    const res = await request(app).post('/api/v1/contact').send({
      fullName: 'A'
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /api/v1/contact should accept valid contact inquiry with consent', async () => {
    const res = await request(app).post('/api/v1/contact').send({
      fullName: 'Dr. John Doe',
      email: 'john@hospital.ng',
      organizationName: 'Lagos Care Facility',
      subject: 'Onboarding Inquiry',
      message: 'We would like to test MediTrack for our facility.',
      consent: true
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.referenceNumber).toContain('MDT-');
  });
});
