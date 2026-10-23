import { db } from '@meditrack/database';
import {
  UpdatePatientProfileInput,
  CreatePatientRecordInput,
  PatientAllergyInput,
  PatientConditionInput,
  PatientMedicationInput,
  PatientMedicalHistoryInput,
  PatientCompletionStatusDTO,
  PatientProfileDTO,
  PatientHealthProfileDTO,
  PatientDashboardDTO,
} from '@meditrack/shared';
import crypto from 'crypto';

export class PatientService {
  /**
   * Helper to calculate patient profile completion status
   */
  static calculateCompletionStatus(patient: any, user: any): PatientCompletionStatusDTO {
    const fields = [
      { name: 'Full Name', value: user?.fullName },
      { name: 'Phone Number', value: user?.phoneNumber || patient?.emergencyContactPhone },
      { name: 'Date of Birth', value: patient?.dateOfBirth },
      { name: 'Gender', value: patient?.gender },
      { name: 'Blood Group', value: patient?.bloodGroup },
      { name: 'Genotype', value: patient?.genotype },
      {
        name: 'Emergency Contact',
        value: patient?.emergencyContact || patient?.emergencyContactName || patient?.emergencyContactPhone,
      },
      { name: 'Address / Location', value: patient?.address || patient?.city || patient?.state },
    ];

    const missingFields: string[] = [];
    let filledCount = 0;

    for (const field of fields) {
      if (field.value && String(field.value).trim().length > 0) {
        filledCount++;
      } else {
        missingFields.push(field.name);
      }
    }

    const completionPercentage = Math.round((filledCount / fields.length) * 100);
    const isComplete = completionPercentage === 100;

    return {
      isComplete,
      completionPercentage,
      missingFields,
    };
  }

  /**
   * Format patient profile object
   */
  static formatPatientProfile(patient: any): PatientProfileDTO {
    const user = patient.user;
    const completionStatus = this.calculateCompletionStatus(patient, user);

    return {
      id: patient.id,
      userId: patient.userId,
      organizationId: patient.organizationId,
      fullName: user?.fullName || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || null,
      dateOfBirth: patient.dateOfBirth ? patient.dateOfBirth.toISOString().split('T')[0] : null,
      gender: patient.gender || null,
      bloodGroup: patient.bloodGroup || null,
      genotype: patient.genotype || null,
      emergencyContact: patient.emergencyContact || null,
      emergencyContactName: patient.emergencyContactName || null,
      emergencyContactPhone: patient.emergencyContactPhone || null,
      emergencyContactRelationship: patient.emergencyContactRelationship || null,
      address: patient.address || null,
      city: patient.city || null,
      state: patient.state || null,
      completionStatus,
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt,
    };
  }

  /**
   * Get or initialize patient profile for current logged-in user
   */
  static async getPatientProfileByUserId(userId: string): Promise<PatientProfileDTO> {
    let patient = await db.patient.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!patient) {
      const user = await db.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new Error('User not found');
      }

      patient = await db.patient.create({
        data: { userId },
        include: { user: true },
      });
    }

    return this.formatPatientProfile(patient);
  }

  /**
   * Update permitted patient profile fields for logged in patient
   */
  static async updatePatientProfile(
    userId: string,
    data: UpdatePatientProfileInput,
    ipAddress?: string,
    userAgent?: string
  ): Promise<PatientProfileDTO> {
    const existingPatient = await db.patient.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!existingPatient) {
      throw new Error('Patient profile not found');
    }

    // Update User fields if provided
    if (data.fullName || data.phoneNumber !== undefined) {
      await db.user.update({
        where: { id: userId },
        data: {
          ...(data.fullName ? { fullName: data.fullName } : {}),
          ...(data.phoneNumber !== undefined ? { phoneNumber: data.phoneNumber } : {}),
        },
      });
    }

    // Update Patient fields
    const updatedPatient = await db.patient.update({
      where: { userId },
      data: {
        ...(data.dateOfBirth !== undefined
          ? { dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null }
          : {}),
        ...(data.gender !== undefined ? { gender: data.gender } : {}),
        ...(data.bloodGroup !== undefined ? { bloodGroup: data.bloodGroup } : {}),
        ...(data.genotype !== undefined ? { genotype: data.genotype } : {}),
        ...(data.emergencyContact !== undefined ? { emergencyContact: data.emergencyContact } : {}),
        ...(data.emergencyContactName !== undefined
          ? { emergencyContactName: data.emergencyContactName }
          : {}),
        ...(data.emergencyContactPhone !== undefined
          ? { emergencyContactPhone: data.emergencyContactPhone }
          : {}),
        ...(data.emergencyContactRelationship !== undefined
          ? { emergencyContactRelationship: data.emergencyContactRelationship }
          : {}),
        ...(data.address !== undefined ? { address: data.address } : {}),
        ...(data.city !== undefined ? { city: data.city } : {}),
        ...(data.state !== undefined ? { state: data.state } : {}),
      },
      include: { user: true },
    });

    await db.auditEvent.create({
      data: {
        userId,
        organizationId: updatedPatient.organizationId,
        action: 'PATIENT_PROFILE_UPDATED',
        entity: 'Patient',
        entityId: updatedPatient.id,
        ipAddress,
        userAgent,
        detailsJson: JSON.stringify({ updatedFields: Object.keys(data) }),
      },
    });

    return this.formatPatientProfile(updatedPatient);
  }

  /**
   * Get Patient Dashboard Overview
   */
  static async getPatientDashboard(userId: string): Promise<PatientDashboardDTO> {
    const profile = await this.getPatientProfileByUserId(userId);

    const healthProfile = await this.getPatientHealthProfile(profile.id);

    const unverifiedCount =
      healthProfile.allergies.filter((a: any) => !a.isVerifiedByClinician).length +
      healthProfile.conditions.filter((c: any) => !c.isVerifiedByClinician).length +
      healthProfile.medications.filter((m: any) => !m.isVerifiedByClinician).length +
      healthProfile.medicalHistory.filter((h: any) => !h.isVerifiedByClinician).length;

    // Retrieve real appointments from database for this patient
    const appointments = await db.appointment.findMany({
      where: {
        patientId: profile.id,
      },
      include: {
        facility: true,
        organization: true,
      },
      orderBy: { scheduledAt: 'asc' },
      take: 5,
    });

    // Retrieve real notifications for this patient's email
    const notifications = await db.notification.findMany({
      where: {
        recipient: profile.email,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return {
      profile,
      completionStatus: profile.completionStatus,
      healthSummary: {
        allergiesCount: healthProfile.allergies.length,
        conditionsCount: healthProfile.conditions.length,
        medicationsCount: healthProfile.medications.length,
        unverifiedCount,
      },
      upcomingAppointments: appointments,
      notifications,
      facilityConnectionsCount: 0,
    };
  }

  /**
   * Get Full Health Profile for a Patient
   */
  static async getPatientHealthProfile(patientId: string): Promise<PatientHealthProfileDTO> {
    const [allergies, conditions, medications, medicalHistory] = await Promise.all([
      db.patientAllergy.findMany({
        where: { patientId },
        orderBy: { createdAt: 'desc' },
      }),
      db.patientCondition.findMany({
        where: { patientId },
        orderBy: { createdAt: 'desc' },
      }),
      db.patientMedication.findMany({
        where: { patientId },
        orderBy: { createdAt: 'desc' },
      }),
      db.patientMedicalHistory.findMany({
        where: { patientId },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      patientId,
      allergies: allergies.map((a: any) => ({
        id: a.id,
        patientId: a.patientId,
        allergen: a.allergen,
        severity: a.severity as any,
        reaction: a.reaction,
        source: a.source as any,
        isVerifiedByClinician: a.isVerifiedByClinician,
        verifiedByUserId: a.verifiedByUserId,
        verifiedAt: a.verifiedAt ? a.verifiedAt.toISOString() : null,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
      })),
      conditions: conditions.map((c: any) => ({
        id: c.id,
        patientId: c.patientId,
        conditionName: c.conditionName,
        diagnosedDate: c.diagnosedDate ? c.diagnosedDate.toISOString().split('T')[0] : null,
        status: c.status as any,
        source: c.source as any,
        isVerifiedByClinician: c.isVerifiedByClinician,
        verifiedByUserId: c.verifiedByUserId,
        verifiedAt: c.verifiedAt ? c.verifiedAt.toISOString() : null,
        notes: c.notes,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
      medications: medications.map((m: any) => ({
        id: m.id,
        patientId: m.patientId,
        medicationName: m.medicationName,
        dosage: m.dosage,
        frequency: m.frequency,
        startDate: m.startDate ? m.startDate.toISOString().split('T')[0] : null,
        endDate: m.endDate ? m.endDate.toISOString().split('T')[0] : null,
        status: m.status as any,
        source: m.source as any,
        isVerifiedByClinician: m.isVerifiedByClinician,
        verifiedByUserId: m.verifiedByUserId,
        verifiedAt: m.verifiedAt ? m.verifiedAt.toISOString() : null,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
      })),
      medicalHistory: medicalHistory.map((h: any) => ({
        id: h.id,
        patientId: h.patientId,
        title: h.title,
        description: h.description,
        eventDate: h.eventDate ? h.eventDate.toISOString().split('T')[0] : null,
        category: h.category as any,
        source: h.source as any,
        isVerifiedByClinician: h.isVerifiedByClinician,
        verifiedByUserId: h.verifiedByUserId,
        verifiedAt: h.verifiedAt ? h.verifiedAt.toISOString() : null,
        createdAt: h.createdAt,
        updatedAt: h.updatedAt,
      })),
    };
  }

  // Allergy CRUD
  static async addAllergy(
    patientId: string,
    input: PatientAllergyInput,
    isClinician: boolean = false,
    clinicianUserId?: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    const allergy = await db.patientAllergy.create({
      data: {
        patientId,
        allergen: input.allergen,
        severity: input.severity as any,
        reaction: input.reaction,
        source: isClinician ? 'CLINICIAN_VERIFIED' : 'PATIENT_ENTERED',
        isVerifiedByClinician: isClinician,
        verifiedByUserId: isClinician ? clinicianUserId : null,
        verifiedAt: isClinician ? new Date() : null,
      },
    });

    await db.auditEvent.create({
      data: {
        userId: clinicianUserId,
        action: 'PATIENT_ALLERGY_ADDED',
        entity: 'PatientAllergy',
        entityId: allergy.id,
        ipAddress,
        userAgent,
        detailsJson: JSON.stringify({ patientId, allergen: input.allergen, source: allergy.source }),
      },
    });

    return allergy;
  }

  static async deleteAllergy(patientId: string, allergyId: string, actorUserId: string) {
    const existing = await db.patientAllergy.findFirst({
      where: { id: allergyId, patientId },
    });

    if (!existing) {
      throw new Error('Allergy record not found or access denied.');
    }

    if (existing.isVerifiedByClinician || existing.source === 'CLINICIAN_VERIFIED') {
      const error = new Error('Clinician-verified health records cannot be deleted to preserve statutory medical audit trails.');
      (error as any).code = 'CLINICIAN_VERIFIED_RECORD';
      throw error;
    }

    await db.patientAllergy.delete({ where: { id: allergyId } });

    await db.auditEvent.create({
      data: {
        userId: actorUserId,
        action: 'PATIENT_ALLERGY_DELETED',
        entity: 'PatientAllergy',
        entityId: allergyId,
        detailsJson: JSON.stringify({ patientId }),
      },
    });
  }

  // Condition CRUD
  static async addCondition(
    patientId: string,
    input: PatientConditionInput,
    isClinician: boolean = false,
    clinicianUserId?: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    const condition = await db.patientCondition.create({
      data: {
        patientId,
        conditionName: input.conditionName,
        diagnosedDate: input.diagnosedDate ? new Date(input.diagnosedDate) : null,
        status: input.status as any,
        notes: input.notes,
        source: isClinician ? 'CLINICIAN_VERIFIED' : 'PATIENT_ENTERED',
        isVerifiedByClinician: isClinician,
        verifiedByUserId: isClinician ? clinicianUserId : null,
        verifiedAt: isClinician ? new Date() : null,
      },
    });

    await db.auditEvent.create({
      data: {
        userId: clinicianUserId,
        action: 'PATIENT_CONDITION_ADDED',
        entity: 'PatientCondition',
        entityId: condition.id,
        ipAddress,
        userAgent,
        detailsJson: JSON.stringify({ patientId, conditionName: input.conditionName, source: condition.source }),
      },
    });

    return condition;
  }

  static async deleteCondition(patientId: string, conditionId: string, actorUserId: string) {
    const existing = await db.patientCondition.findFirst({
      where: { id: conditionId, patientId },
    });

    if (!existing) {
      throw new Error('Condition record not found or access denied.');
    }

    if (existing.isVerifiedByClinician || existing.source === 'CLINICIAN_VERIFIED') {
      const error = new Error('Clinician-verified health records cannot be deleted to preserve statutory medical audit trails.');
      (error as any).code = 'CLINICIAN_VERIFIED_RECORD';
      throw error;
    }

    await db.patientCondition.delete({ where: { id: conditionId } });

    await db.auditEvent.create({
      data: {
        userId: actorUserId,
        action: 'PATIENT_CONDITION_DELETED',
        entity: 'PatientCondition',
        entityId: conditionId,
        detailsJson: JSON.stringify({ patientId }),
      },
    });
  }

  // Medication CRUD
  static async addMedication(
    patientId: string,
    input: PatientMedicationInput,
    isClinician: boolean = false,
    clinicianUserId?: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    const medication = await db.patientMedication.create({
      data: {
        patientId,
        medicationName: input.medicationName,
        dosage: input.dosage,
        frequency: input.frequency,
        startDate: input.startDate ? new Date(input.startDate) : null,
        endDate: input.endDate ? new Date(input.endDate) : null,
        status: input.status as any,
        source: isClinician ? 'CLINICIAN_VERIFIED' : 'PATIENT_ENTERED',
        isVerifiedByClinician: isClinician,
        verifiedByUserId: isClinician ? clinicianUserId : null,
        verifiedAt: isClinician ? new Date() : null,
      },
    });

    await db.auditEvent.create({
      data: {
        userId: clinicianUserId,
        action: 'PATIENT_MEDICATION_ADDED',
        entity: 'PatientMedication',
        entityId: medication.id,
        ipAddress,
        userAgent,
        detailsJson: JSON.stringify({ patientId, medicationName: input.medicationName, source: medication.source }),
      },
    });

    return medication;
  }

  static async deleteMedication(patientId: string, medicationId: string, actorUserId: string) {
    const existing = await db.patientMedication.findFirst({
      where: { id: medicationId, patientId },
    });

    if (!existing) {
      throw new Error('Medication record not found or access denied.');
    }

    if (existing.isVerifiedByClinician || existing.source === 'CLINICIAN_VERIFIED') {
      const error = new Error('Clinician-verified health records cannot be deleted to preserve statutory medical audit trails.');
      (error as any).code = 'CLINICIAN_VERIFIED_RECORD';
      throw error;
    }

    await db.patientMedication.delete({ where: { id: medicationId } });

    await db.auditEvent.create({
      data: {
        userId: actorUserId,
        action: 'PATIENT_MEDICATION_DELETED',
        entity: 'PatientMedication',
        entityId: medicationId,
        detailsJson: JSON.stringify({ patientId }),
      },
    });
  }

  // Medical History CRUD
  static async addMedicalHistory(
    patientId: string,
    input: PatientMedicalHistoryInput,
    isClinician: boolean = false,
    clinicianUserId?: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    const history = await db.patientMedicalHistory.create({
      data: {
        patientId,
        title: input.title,
        description: input.description,
        eventDate: input.eventDate ? new Date(input.eventDate) : null,
        category: input.category as any,
        source: isClinician ? 'CLINICIAN_VERIFIED' : 'PATIENT_ENTERED',
        isVerifiedByClinician: isClinician,
        verifiedByUserId: isClinician ? clinicianUserId : null,
        verifiedAt: isClinician ? new Date() : null,
      },
    });

    await db.auditEvent.create({
      data: {
        userId: clinicianUserId,
        action: 'PATIENT_MEDICAL_HISTORY_ADDED',
        entity: 'PatientMedicalHistory',
        entityId: history.id,
        ipAddress,
        userAgent,
        detailsJson: JSON.stringify({ patientId, title: input.title, source: history.source }),
      },
    });

    return history;
  }

  static async deleteMedicalHistory(patientId: string, historyId: string, actorUserId: string) {
    const existing = await db.patientMedicalHistory.findFirst({
      where: { id: historyId, patientId },
    });

    if (!existing) {
      throw new Error('Medical history record not found or access denied.');
    }

    if (existing.isVerifiedByClinician || existing.source === 'CLINICIAN_VERIFIED') {
      const error = new Error('Clinician-verified health records cannot be deleted to preserve statutory medical audit trails.');
      (error as any).code = 'CLINICIAN_VERIFIED_RECORD';
      throw error;
    }

    await db.patientMedicalHistory.delete({ where: { id: historyId } });

    await db.auditEvent.create({
      data: {
        userId: actorUserId,
        action: 'PATIENT_MEDICAL_HISTORY_DELETED',
        entity: 'PatientMedicalHistory',
        entityId: historyId,
        detailsJson: JSON.stringify({ patientId }),
      },
    });
  }

  /**
   * Staff: Search & Filter Patient Records
   */
  static async searchPatients(
    organizationId: string,
    query?: string,
    completionStatus?: 'ALL' | 'COMPLETE' | 'INCOMPLETE',
    gender?: string,
    page: number = 1,
    limit: number = 20
  ) {
    const whereClause: any = {
      OR: [
        { organizationId },
        { appointments: { some: { organizationId } } },
      ],
    };

    if (gender && gender !== 'ALL') {
      whereClause.gender = gender;
    }

    if (query && query.trim().length > 0) {
      const q = query.trim();
      whereClause.AND = [
        {
          OR: [
            { user: { fullName: { contains: q, mode: 'insensitive' } } },
            { user: { email: { contains: q, mode: 'insensitive' } } },
            { user: { phoneNumber: { contains: q, mode: 'insensitive' } } },
            { id: { equals: q } },
          ],
        },
      ];
    }

    const rawPatients = await db.patient.findMany({
      where: whereClause,
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });

    let formatted = rawPatients.map((p: any) => this.formatPatientProfile(p));

    if (completionStatus === 'COMPLETE') {
      formatted = formatted.filter((p: PatientProfileDTO) => p.completionStatus.isComplete);
    } else if (completionStatus === 'INCOMPLETE') {
      formatted = formatted.filter((p: PatientProfileDTO) => !p.completionStatus.isComplete);
    }

    const total = formatted.length;
    const startIndex = (page - 1) * limit;
    const paginated = formatted.slice(startIndex, startIndex + limit);

    return {
      patients: paginated,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Staff: Create Patient Record with Duplicate Matching
   */
  static async createPatientRecord(
    organizationId: string,
    staffUserId: string,
    input: CreatePatientRecordInput,
    ipAddress?: string,
    userAgent?: string
  ): Promise<PatientProfileDTO> {
    const normalizedEmail = input.email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: normalizedEmail },
      include: { patientProfile: true },
    });

    if (existingUser && existingUser.patientProfile) {
      // Duplicate match rule triggered!
      if (existingUser.patientProfile.organizationId === organizationId) {
        const error = new Error('A patient record with this email address already exists in your organization.');
        (error as any).code = 'DUPLICATE_PATIENT_RECORD';
        throw error;
      }

      // Associate existing patient profile to current organization
      const updatedPatient = await db.patient.update({
        where: { id: existingUser.patientProfile.id },
        data: {
          organizationId,
          ...(input.phoneNumber ? { user: { update: { phoneNumber: input.phoneNumber } } } : {}),
          ...(input.dateOfBirth ? { dateOfBirth: new Date(input.dateOfBirth) } : {}),
          ...(input.gender ? { gender: input.gender } : {}),
          ...(input.bloodGroup ? { bloodGroup: input.bloodGroup } : {}),
          ...(input.genotype ? { genotype: input.genotype } : {}),
          ...(input.emergencyContactName ? { emergencyContactName: input.emergencyContactName } : {}),
          ...(input.emergencyContactPhone ? { emergencyContactPhone: input.emergencyContactPhone } : {}),
          ...(input.emergencyContactRelationship
            ? { emergencyContactRelationship: input.emergencyContactRelationship }
            : {}),
          ...(input.emergencyContact ? { emergencyContact: input.emergencyContact } : {}),
          ...(input.address ? { address: input.address } : {}),
          ...(input.city ? { city: input.city } : {}),
          ...(input.state ? { state: input.state } : {}),
        },
        include: { user: true },
      });

      await db.auditEvent.create({
        data: {
          userId: staffUserId,
          organizationId,
          action: 'EXISTING_PATIENT_LINKED_TO_ORG',
          entity: 'Patient',
          entityId: updatedPatient.id,
          ipAddress,
          userAgent,
        },
      });

      return this.formatPatientProfile(updatedPatient);
    }

    let user = existingUser;

    if (!user) {
      // Create new User account for patient
      const dummyPassword = crypto.randomBytes(16).toString('hex') + 'A1!';
      user = await db.user.create({
        data: {
          email: normalizedEmail,
          fullName: input.fullName,
          phoneNumber: input.phoneNumber || null,
          passwordHash: dummyPassword, // Staff-registered patient, account unverified
          role: 'PATIENT',
          isVerified: false,
        },
      });
    }

    const newPatient = await db.patient.create({
      data: {
        userId: user.id,
        organizationId,
        dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : null,
        gender: input.gender || null,
        bloodGroup: input.bloodGroup || null,
        genotype: input.genotype || null,
        emergencyContactName: input.emergencyContactName || null,
        emergencyContactPhone: input.emergencyContactPhone || null,
        emergencyContactRelationship: input.emergencyContactRelationship || null,
        emergencyContact: input.emergencyContact || null,
        address: input.address || null,
        city: input.city || null,
        state: input.state || null,
      },
      include: { user: true },
    });

    await db.auditEvent.create({
      data: {
        userId: staffUserId,
        organizationId,
        action: 'PATIENT_RECORD_CREATED_BY_STAFF',
        entity: 'Patient',
        entityId: newPatient.id,
        ipAddress,
        userAgent,
        detailsJson: JSON.stringify({ email: normalizedEmail }),
      },
    });

    return this.formatPatientProfile(newPatient);
  }

  /**
   * Clinician Verification of Patient-Entered Item
   */
  static async verifyHealthItem(
    patientId: string,
    itemType: 'allergy' | 'condition' | 'medication' | 'history',
    itemId: string,
    clinicianUserId: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    const now = new Date();

    if (itemType === 'allergy') {
      const allergy = await db.patientAllergy.findFirst({ where: { id: itemId, patientId } });
      if (!allergy) throw new Error('Allergy item not found');
      await db.patientAllergy.update({
        where: { id: itemId },
        data: {
          source: 'CLINICIAN_VERIFIED',
          isVerifiedByClinician: true,
          verifiedByUserId: clinicianUserId,
          verifiedAt: now,
        },
      });
    } else if (itemType === 'condition') {
      const condition = await db.patientCondition.findFirst({ where: { id: itemId, patientId } });
      if (!condition) throw new Error('Condition item not found');
      await db.patientCondition.update({
        where: { id: itemId },
        data: {
          source: 'CLINICIAN_VERIFIED',
          isVerifiedByClinician: true,
          verifiedByUserId: clinicianUserId,
          verifiedAt: now,
        },
      });
    } else if (itemType === 'medication') {
      const med = await db.patientMedication.findFirst({ where: { id: itemId, patientId } });
      if (!med) throw new Error('Medication item not found');
      await db.patientMedication.update({
        where: { id: itemId },
        data: {
          source: 'CLINICIAN_VERIFIED',
          isVerifiedByClinician: true,
          verifiedByUserId: clinicianUserId,
          verifiedAt: now,
        },
      });
    } else if (itemType === 'history') {
      const hist = await db.patientMedicalHistory.findFirst({ where: { id: itemId, patientId } });
      if (!hist) throw new Error('Medical history item not found');
      await db.patientMedicalHistory.update({
        where: { id: itemId },
        data: {
          source: 'CLINICIAN_VERIFIED',
          isVerifiedByClinician: true,
          verifiedByUserId: clinicianUserId,
          verifiedAt: now,
        },
      });
    }

    await db.auditEvent.create({
      data: {
        userId: clinicianUserId,
        action: 'HEALTH_ITEM_CLINICIAN_VERIFIED',
        entity: `Patient${itemType.charAt(0).toUpperCase() + itemType.slice(1)}`,
        entityId: itemId,
        ipAddress,
        userAgent,
        detailsJson: JSON.stringify({ patientId, itemType, itemId }),
      },
    });

    return this.getPatientHealthProfile(patientId);
  }
}
