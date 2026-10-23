import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EncounterService } from '../src/services/encounter.service';

const mockEncounters: any[] = [];
const mockAmendments: any[] = [];
const mockPatients: any[] = [];
const mockFacilities: any[] = [];
const mockAuditEvents: any[] = [];

vi.mock('@meditrack/database', () => ({
  db: {
    patient: {
      findUnique: vi.fn(async ({ where }: any) => {
        return mockPatients.find((p) => p.id === where.id) || null;
      }),
    },
    facility: {
      findFirst: vi.fn(async ({ where }: any) => {
        return mockFacilities.find((f) => f.id === where.id && f.organizationId === where.organizationId) || null;
      }),
    },
    encounter: {
      create: vi.fn(async ({ data }: any) => {
        const enc = {
          id: `enc-${Date.now()}-${Math.random()}`,
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        mockEncounters.push(enc);
        return enc;
      }),
      findUnique: vi.fn(async ({ where }: any) => {
        return mockEncounters.find((e) => e.id === where.id) || null;
      }),
      update: vi.fn(async ({ where, data }: any) => {
        const enc = mockEncounters.find((e) => e.id === where.id);
        if (enc) Object.assign(enc, data);
        return enc;
      }),
      findMany: vi.fn(async ({ where }: any) => {
        return mockEncounters.filter((e) => {
          if (where.patientId && e.patientId !== where.patientId) return false;
          if (where.isConfidential === false && e.isConfidential === true) return false;
          if (where.status?.in && !where.status.in.includes(e.status)) return false;
          return true;
        });
      }),
    },
    encounterAmendment: {
      create: vi.fn(async ({ data }: any) => {
        const amd = { id: `amd-${Date.now()}`, ...data, createdAt: new Date() };
        mockAmendments.push(amd);
        return amd;
      }),
    },
    auditEvent: {
      create: vi.fn(async ({ data }: any) => {
        mockAuditEvents.push(data);
        return data;
      }),
    },
    $transaction: vi.fn(async (promises: any[]) => {
      return Promise.all(promises);
    }),
  },
}));

describe('Phase 4 — Clinical Documentation & Encounter Unit Tests', () => {
  beforeEach(() => {
    mockEncounters.length = 0;
    mockAmendments.length = 0;
    mockPatients.length = 0;
    mockFacilities.length = 0;
    mockAuditEvents.length = 0;

    mockPatients.push({ id: 'pat-1', userId: 'usr-pat-1', organizationId: 'org-1' });
    mockFacilities.push({ id: 'fac-1', organizationId: 'org-1' });
  });

  it('should create a draft clinical encounter record', async () => {
    const enc = await EncounterService.createEncounter('org-1', 'usr-doc-1', {
      facilityId: 'fac-1',
      patientId: 'pat-1',
      chiefComplaint: 'Fever and headache',
      vitals: { temperatureCelsius: 38.5, bloodPressureSystolic: 120, bloodPressureDiastolic: 80 },
    });

    expect(enc.id).toBeDefined();
    expect(enc.status).toBe('DRAFT');
    expect(enc.chiefComplaint).toBe('Fever and headache');
  });

  it('should sign/finalize encounter and prevent direct overwrites on signed record', async () => {
    const enc = await EncounterService.createEncounter('org-1', 'usr-doc-1', {
      facilityId: 'fac-1',
      patientId: 'pat-1',
      chiefComplaint: 'Persistent cough',
    });

    const signed = await EncounterService.signEncounter(enc.id, 'usr-doc-1');
    expect(signed.status).toBe('SIGNED');
    expect(signed.signedAt).toBeDefined();

    // Direct update on signed record should fail
    await expect(
      EncounterService.updateEncounter(enc.id, 'usr-doc-1', { chiefComplaint: 'Updated complaint' })
    ).rejects.toThrow('Finalized or signed clinical records cannot be overwritten directly');
  });

  it('should record immutable amendment audit trail when amending a signed encounter', async () => {
    const enc = await EncounterService.createEncounter('org-1', 'usr-doc-1', {
      facilityId: 'fac-1',
      patientId: 'pat-1',
      chiefComplaint: 'Initial notes',
    });

    await EncounterService.signEncounter(enc.id, 'usr-doc-1');

    const amended = await EncounterService.amendEncounter(enc.id, 'usr-doc-1', {
      reason: 'Correcting patient symptom history',
      chiefComplaint: 'Corrected notes',
    });

    expect(amended.status).toBe('AMENDED');
    expect(mockAmendments.length).toBe(1);
    expect(mockAmendments[0].reason).toBe('Correcting patient symptom history');
  });

  it('should restrict patient view to signed, non-confidential encounters only', async () => {
    // Draft encounter
    await EncounterService.createEncounter('org-1', 'usr-doc-1', {
      facilityId: 'fac-1',
      patientId: 'pat-1',
      chiefComplaint: 'Draft note',
    });

    // Confidential signed encounter
    const confEnc = await EncounterService.createEncounter('org-1', 'usr-doc-1', {
      facilityId: 'fac-1',
      patientId: 'pat-1',
      chiefComplaint: 'Sensitive note',
      isConfidential: true,
    });
    await EncounterService.signEncounter(confEnc.id, 'usr-doc-1');

    // Regular signed encounter
    const regEnc = await EncounterService.createEncounter('org-1', 'usr-doc-1', {
      facilityId: 'fac-1',
      patientId: 'pat-1',
      chiefComplaint: 'Public signed note',
      isConfidential: false,
    });
    await EncounterService.signEncounter(regEnc.id, 'usr-doc-1');

    const patientView = await EncounterService.getPatientEncountersForPatient('pat-1');

    expect(patientView.length).toBe(1);
    expect(patientView[0].chiefComplaint).toBe('Public signed note');
  });
});
