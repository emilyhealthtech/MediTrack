import { db } from '@meditrack/database';
import {
  CreateEncounterInput,
  UpdateEncounterInput,
  AmendEncounterInput,
} from '@meditrack/shared';

export class EncounterService {
  /**
   * Create Draft Clinical Encounter Record
   */
  static async createEncounter(
    organizationId: string,
    clinicianUserId: string,
    input: CreateEncounterInput,
    ipAddress?: string,
    userAgent?: string
  ) {
    const patient = await db.patient.findUnique({
      where: { id: input.patientId },
    });

    if (!patient) {
      throw new Error('Patient not found');
    }

    const facility = await db.facility.findFirst({
      where: { id: input.facilityId, organizationId },
    });

    if (!facility) {
      throw new Error('Facility not found or does not belong to organization');
    }

    if (input.appointmentId) {
      const appointment = await db.appointment.findUnique({
        where: { id: input.appointmentId },
      });
      if (!appointment || appointment.organizationId !== organizationId) {
        throw new Error('Associated appointment not found in this organization');
      }
    }

    const vitalsJson = input.vitals ? JSON.stringify(input.vitals) : null;

    const encounter = await db.encounter.create({
      data: {
        organizationId,
        facilityId: input.facilityId,
        patientId: input.patientId,
        appointmentId: input.appointmentId || null,
        clinicianId: clinicianUserId,
        status: 'DRAFT',
        encounterDate: input.encounterDate ? new Date(input.encounterDate) : new Date(),
        chiefComplaint: input.chiefComplaint || null,
        historyOfPresentIllness: input.historyOfPresentIllness || null,
        assessment: input.assessment || null,
        plan: input.plan || null,
        vitalsJson,
        isConfidential: input.isConfidential ?? false,
      },
      include: {
        facility: true,
        patient: { include: { user: true } },
        clinician: true,
        signedBy: true,
        amendments: { include: { amendedBy: true } },
      },
    });

    await db.auditEvent.create({
      data: {
        userId: clinicianUserId,
        organizationId,
        action: 'CLINICAL_ENCOUNTER_CREATED',
        entity: 'Encounter',
        entityId: encounter.id,
        ipAddress,
        userAgent,
        detailsJson: JSON.stringify({ patientId: encounter.patientId, status: encounter.status }),
      },
    });

    return encounter;
  }

  /**
   * Update Draft Clinical Encounter Record
   */
  static async updateEncounter(
    encounterId: string,
    clinicianUserId: string,
    input: UpdateEncounterInput,
    ipAddress?: string,
    userAgent?: string
  ) {
    const encounter = await db.encounter.findUnique({
      where: { id: encounterId },
    });

    if (!encounter) {
      throw new Error('Encounter record not found');
    }

    if (encounter.status !== 'DRAFT') {
      const error = new Error('Finalized or signed clinical records cannot be overwritten directly. Please use the clinical amendment workflow.');
      (error as any).code = 'ENCOUNTER_ALREADY_SIGNED';
      throw error;
    }

    const vitalsJson = input.vitals
      ? JSON.stringify(input.vitals)
      : encounter.vitalsJson;

    const updated = await db.encounter.update({
      where: { id: encounterId },
      data: {
        chiefComplaint: input.chiefComplaint !== undefined ? input.chiefComplaint : encounter.chiefComplaint,
        historyOfPresentIllness: input.historyOfPresentIllness !== undefined ? input.historyOfPresentIllness : encounter.historyOfPresentIllness,
        assessment: input.assessment !== undefined ? input.assessment : encounter.assessment,
        plan: input.plan !== undefined ? input.plan : encounter.plan,
        vitalsJson,
        isConfidential: input.isConfidential !== undefined ? input.isConfidential : encounter.isConfidential,
      },
      include: {
        facility: true,
        patient: { include: { user: true } },
        clinician: true,
        signedBy: true,
        amendments: { include: { amendedBy: true } },
      },
    });

    await db.auditEvent.create({
      data: {
        userId: clinicianUserId,
        organizationId: updated.organizationId,
        action: 'CLINICAL_ENCOUNTER_DRAFT_UPDATED',
        entity: 'Encounter',
        entityId: updated.id,
        ipAddress,
        userAgent,
      },
    });

    return updated;
  }

  /**
   * Sign / Finalize Clinical Record
   */
  static async signEncounter(
    encounterId: string,
    clinicianUserId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    const encounter = await db.encounter.findUnique({
      where: { id: encounterId },
    });

    if (!encounter) {
      throw new Error('Encounter record not found');
    }

    if (encounter.status !== 'DRAFT') {
      const error = new Error('Clinical record is already signed/finalized.');
      (error as any).code = 'ENCOUNTER_ALREADY_SIGNED';
      throw error;
    }

    const signedAt = new Date();

    const updated = await db.encounter.update({
      where: { id: encounterId },
      data: {
        status: 'SIGNED',
        signedAt,
        signedById: clinicianUserId,
      },
      include: {
        facility: true,
        patient: { include: { user: true } },
        clinician: true,
        signedBy: true,
        amendments: { include: { amendedBy: true } },
      },
    });

    await db.auditEvent.create({
      data: {
        userId: clinicianUserId,
        organizationId: updated.organizationId,
        action: 'CLINICAL_ENCOUNTER_SIGNED',
        entity: 'Encounter',
        entityId: updated.id,
        ipAddress,
        userAgent,
        detailsJson: JSON.stringify({ signedAt, signedById: clinicianUserId }),
      },
    });

    return updated;
  }

  /**
   * Amend Signed Clinical Record (Preserves original audit trail)
   */
  static async amendEncounter(
    encounterId: string,
    clinicianUserId: string,
    input: AmendEncounterInput,
    ipAddress?: string,
    userAgent?: string
  ) {
    const encounter = await db.encounter.findUnique({
      where: { id: encounterId },
    });

    if (!encounter) {
      throw new Error('Encounter record not found');
    }

    if (encounter.status === 'DRAFT') {
      const error = new Error('Draft clinical records can be updated directly without an amendment log.');
      (error as any).code = 'ENCOUNTER_STILL_DRAFT';
      throw error;
    }

    const previousData = {
      chiefComplaint: encounter.chiefComplaint,
      historyOfPresentIllness: encounter.historyOfPresentIllness,
      assessment: encounter.assessment,
      plan: encounter.plan,
      vitalsJson: encounter.vitalsJson,
      isConfidential: encounter.isConfidential,
    };

    const newVitalsJson = input.vitals ? JSON.stringify(input.vitals) : encounter.vitalsJson;

    const newData = {
      chiefComplaint: input.chiefComplaint !== undefined ? input.chiefComplaint : encounter.chiefComplaint,
      historyOfPresentIllness: input.historyOfPresentIllness !== undefined ? input.historyOfPresentIllness : encounter.historyOfPresentIllness,
      assessment: input.assessment !== undefined ? input.assessment : encounter.assessment,
      plan: input.plan !== undefined ? input.plan : encounter.plan,
      vitalsJson: newVitalsJson,
      isConfidential: input.isConfidential !== undefined ? input.isConfidential : encounter.isConfidential,
    };

    // Transaction to update encounter and record amendment log
    const [updatedEncounter] = await db.$transaction([
      db.encounter.update({
        where: { id: encounterId },
        data: {
          status: 'AMENDED',
          chiefComplaint: newData.chiefComplaint,
          historyOfPresentIllness: newData.historyOfPresentIllness,
          assessment: newData.assessment,
          plan: newData.plan,
          vitalsJson: newData.vitalsJson,
          isConfidential: newData.isConfidential,
        },
        include: {
          facility: true,
          patient: { include: { user: true } },
          clinician: true,
          signedBy: true,
          amendments: { include: { amendedBy: true } },
        },
      }),
      db.encounterAmendment.create({
        data: {
          encounterId,
          amendedById: clinicianUserId,
          reason: input.reason,
          previousDataJson: JSON.stringify(previousData),
          newDataJson: JSON.stringify(newData),
        },
      }),
    ]);

    await db.auditEvent.create({
      data: {
        userId: clinicianUserId,
        organizationId: updatedEncounter.organizationId,
        action: 'CLINICAL_ENCOUNTER_AMENDED',
        entity: 'Encounter',
        entityId: updatedEncounter.id,
        ipAddress,
        userAgent,
        detailsJson: JSON.stringify({ reason: input.reason }),
      },
    });

    return updatedEncounter;
  }

  /**
   * Get Patient Clinical Records for Patient Portal
   */
  static async getPatientEncountersForPatient(patientId: string) {
    // Patients can only view SIGNED or AMENDED encounters where isConfidential is false
    const encounters = await db.encounter.findMany({
      where: {
        patientId,
        status: { in: ['SIGNED', 'AMENDED'] },
        isConfidential: false,
      },
      include: {
        facility: true,
        clinician: true,
        signedBy: true,
      },
      orderBy: { encounterDate: 'desc' },
    });

    return encounters.map((e: any) => ({
      id: e.id,
      encounterDate: e.encounterDate,
      facilityName: e.facility?.name,
      clinicianName: e.clinician?.fullName,
      status: e.status,
      chiefComplaint: e.chiefComplaint,
      historyOfPresentIllness: e.historyOfPresentIllness,
      assessment: e.assessment,
      plan: e.plan,
      vitals: e.vitalsJson ? JSON.parse(e.vitalsJson) : null,
      signedAt: e.signedAt,
      signedByName: e.signedBy?.fullName,
    }));
  }

  /**
   * Get Encounters for Staff / Clinician
   */
  static async getEncountersForStaff(organizationId: string, patientId?: string) {
    const where: any = { organizationId };
    if (patientId) where.patientId = patientId;

    return db.encounter.findMany({
      where,
      include: {
        facility: true,
        patient: { include: { user: true } },
        clinician: true,
        signedBy: true,
        amendments: {
          include: { amendedBy: true },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { encounterDate: 'desc' },
    });
  }

  /**
   * Get Encounter by ID for Staff
   */
  static async getEncounterById(encounterId: string, organizationId: string) {
    const encounter = await db.encounter.findUnique({
      where: { id: encounterId },
      include: {
        facility: true,
        patient: { include: { user: true } },
        clinician: true,
        signedBy: true,
        amendments: {
          include: { amendedBy: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!encounter || (organizationId && encounter.organizationId !== organizationId)) {
      throw new Error('Encounter record not found or access denied.');
    }

    return encounter;
  }
}
