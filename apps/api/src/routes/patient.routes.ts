import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.middleware';
import { PatientService } from '../services/patient.service';
import {
  UpdatePatientProfileSchema,
  CreatePatientRecordSchema,
  PatientAllergySchema,
  PatientConditionSchema,
  PatientMedicationSchema,
  PatientMedicalHistorySchema,
  PatientSearchQuerySchema,
} from '@meditrack/shared';
import { db } from '@meditrack/database';

export const patientRouter = Router();

// ==========================================
// 1. PATIENT SELF-SERVICE ENDPOINTS
// ==========================================

// Get Current Logged-in Patient Profile
patientRouter.get('/me', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await PatientService.getPatientProfileByUserId(req.user!.id);
    return res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    return next(error);
  }
});

// Update Permitted Profile Fields for Logged-in Patient
patientRouter.put('/me', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = UpdatePatientProfileSchema.parse(req.body);
    const updatedProfile = await PatientService.updatePatientProfile(
      req.user!.id,
      validatedData,
      req.ip,
      req.headers['user-agent']
    );

    return res.status(200).json({
      success: true,
      message: 'Patient profile updated successfully.',
      data: updatedProfile,
    });
  } catch (error) {
    return next(error);
  }
});

// Get Patient Dashboard Overview
patientRouter.get('/me/dashboard', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dashboardData = await PatientService.getPatientDashboard(req.user!.id);
    return res.status(200).json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    return next(error);
  }
});

// Get Patient Health Profile
patientRouter.get('/me/health-profile', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await PatientService.getPatientProfileByUserId(req.user!.id);
    const healthProfile = await PatientService.getPatientHealthProfile(profile.id);

    return res.status(200).json({
      success: true,
      data: healthProfile,
    });
  } catch (error) {
    return next(error);
  }
});

// Add Patient-Entered Allergy
patientRouter.post('/me/health-profile/allergies', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = PatientAllergySchema.parse(req.body);
    const profile = await PatientService.getPatientProfileByUserId(req.user!.id);

    const allergy = await PatientService.addAllergy(
      profile.id,
      validated,
      false,
      undefined,
      req.ip,
      req.headers['user-agent']
    );

    return res.status(201).json({
      success: true,
      message: 'Allergy added to health profile.',
      data: allergy,
    });
  } catch (error) {
    return next(error);
  }
});

// Delete Patient-Entered Allergy
patientRouter.delete('/me/health-profile/allergies/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await PatientService.getPatientProfileByUserId(req.user!.id);
    await PatientService.deleteAllergy(profile.id, req.params.id, req.user!.id);

    return res.status(200).json({
      success: true,
      message: 'Allergy record deleted successfully.',
    });
  } catch (error: any) {
    if (error.code === 'CLINICIAN_VERIFIED_RECORD') {
      return res.status(403).json({
        success: false,
        error: { code: 'CLINICIAN_VERIFIED_RECORD', message: error.message },
      });
    }
    return next(error);
  }
});

// Add Patient-Entered Condition
patientRouter.post('/me/health-profile/conditions', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = PatientConditionSchema.parse(req.body);
    const profile = await PatientService.getPatientProfileByUserId(req.user!.id);

    const condition = await PatientService.addCondition(
      profile.id,
      validated,
      false,
      undefined,
      req.ip,
      req.headers['user-agent']
    );

    return res.status(201).json({
      success: true,
      message: 'Medical condition added to health profile.',
      data: condition,
    });
  } catch (error) {
    return next(error);
  }
});

// Delete Patient-Entered Condition
patientRouter.delete('/me/health-profile/conditions/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await PatientService.getPatientProfileByUserId(req.user!.id);
    await PatientService.deleteCondition(profile.id, req.params.id, req.user!.id);

    return res.status(200).json({
      success: true,
      message: 'Medical condition record deleted successfully.',
    });
  } catch (error: any) {
    if (error.code === 'CLINICIAN_VERIFIED_RECORD') {
      return res.status(403).json({
        success: false,
        error: { code: 'CLINICIAN_VERIFIED_RECORD', message: error.message },
      });
    }
    return next(error);
  }
});

// Add Patient-Entered Medication
patientRouter.post('/me/health-profile/medications', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = PatientMedicationSchema.parse(req.body);
    const profile = await PatientService.getPatientProfileByUserId(req.user!.id);

    const medication = await PatientService.addMedication(
      profile.id,
      validated,
      false,
      undefined,
      req.ip,
      req.headers['user-agent']
    );

    return res.status(201).json({
      success: true,
      message: 'Medication added to health profile.',
      data: medication,
    });
  } catch (error) {
    return next(error);
  }
});

// Delete Patient-Entered Medication
patientRouter.delete('/me/health-profile/medications/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await PatientService.getPatientProfileByUserId(req.user!.id);
    await PatientService.deleteMedication(profile.id, req.params.id, req.user!.id);

    return res.status(200).json({
      success: true,
      message: 'Medication record deleted successfully.',
    });
  } catch (error: any) {
    if (error.code === 'CLINICIAN_VERIFIED_RECORD') {
      return res.status(403).json({
        success: false,
        error: { code: 'CLINICIAN_VERIFIED_RECORD', message: error.message },
      });
    }
    return next(error);
  }
});

// Add Patient-Entered Medical History
patientRouter.post('/me/health-profile/history', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = PatientMedicalHistorySchema.parse(req.body);
    const profile = await PatientService.getPatientProfileByUserId(req.user!.id);

    const history = await PatientService.addMedicalHistory(
      profile.id,
      validated,
      false,
      undefined,
      req.ip,
      req.headers['user-agent']
    );

    return res.status(201).json({
      success: true,
      message: 'Medical history entry added.',
      data: history,
    });
  } catch (error) {
    return next(error);
  }
});

// Delete Patient-Entered Medical History
patientRouter.delete('/me/health-profile/history/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await PatientService.getPatientProfileByUserId(req.user!.id);
    await PatientService.deleteMedicalHistory(profile.id, req.params.id, req.user!.id);

    return res.status(200).json({
      success: true,
      message: 'Medical history entry deleted successfully.',
    });
  } catch (error: any) {
    if (error.code === 'CLINICIAN_VERIFIED_RECORD') {
      return res.status(403).json({
        success: false,
        error: { code: 'CLINICIAN_VERIFIED_RECORD', message: error.message },
      });
    }
    return next(error);
  }
});


// ==========================================
// 2. STAFF PATIENT MANAGEMENT ENDPOINTS
// ==========================================

// Helper middleware for staff tenant active context verification
const requireStaffOrgContext = async (req: Request, res: Response, next: NextFunction) => {
  const activeOrgId =
    req.session?.activeOrganizationId ||
    (req.headers['x-organization-id'] as string) ||
    (req.query.organizationId as string);

  if (req.user?.role === 'SYSTEM_ADMIN' && activeOrgId) {
    (req as any).activeOrgId = activeOrgId;
    return next();
  }

  if (!activeOrgId) {
    // Check if staff belongs to an org
    const userMembership = await db.membership.findFirst({
      where: { userId: req.user!.id },
    });
    if (!userMembership) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'TENANT_ACCESS_DENIED',
          message: 'You are not assigned to an active healthcare organization.',
        },
      });
    }
    (req as any).activeOrgId = userMembership.organizationId;
    return next();
  }

  // Check user is a member of target org
  const membership = await db.membership.findUnique({
    where: {
      userId_organizationId: {
        userId: req.user!.id,
        organizationId: activeOrgId,
      },
    },
  });

  if (!membership && req.user?.role !== 'SYSTEM_ADMIN') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'TENANT_ACCESS_DENIED',
        message: 'Access denied. You are not a member of the specified healthcare organization.',
      },
    });
  }

  (req as any).activeOrgId = activeOrgId;
  return next();
};

// Helper middleware to verify clinician has access to specific patient's record
const requirePatientOrgAccess = async (req: Request, res: Response, next: NextFunction) => {
  const activeOrgId = (req as any).activeOrgId;
  const patientId = req.params.id;

  const patient = await db.patient.findUnique({ where: { id: patientId } });
  if (!patient) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Patient record not found.' },
    });
  }

  const hasAccess =
    req.user!.role === 'SYSTEM_ADMIN' ||
    patient.organizationId === activeOrgId ||
    (await db.appointment.findFirst({
      where: { patientId: patient.id, organizationId: activeOrgId },
    }));

  if (!hasAccess) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'TENANT_ACCESS_DENIED',
        message: 'Access denied. Patient is not associated with your healthcare organization.',
      },
    });
  }

  return next();
};

// Search & Filter Patients
patientRouter.get(
  '/',
  requireAuth,
  requireRole('FACILITY_STAFF', 'FACILITY_ADMIN', 'SYSTEM_ADMIN'),
  requireStaffOrgContext,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const activeOrgId = (req as any).activeOrgId;
      const parsedQuery = PatientSearchQuerySchema.parse(req.query);

      const result = await PatientService.searchPatients(
        activeOrgId,
        parsedQuery.query,
        parsedQuery.completionStatus,
        parsedQuery.gender,
        parsedQuery.page,
        parsedQuery.limit
      );

      return res.status(200).json({
        success: true,
        data: result.patients,
        pagination: result.pagination,
      });
    } catch (error) {
      return next(error);
    }
  }
);

// Register New Patient Record by Staff
patientRouter.post(
  '/',
  requireAuth,
  requireRole('FACILITY_STAFF', 'FACILITY_ADMIN', 'SYSTEM_ADMIN'),
  requireStaffOrgContext,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const activeOrgId = (req as any).activeOrgId;
      const validatedData = CreatePatientRecordSchema.parse(req.body);

      const newRecord = await PatientService.createPatientRecord(
        activeOrgId,
        req.user!.id,
        validatedData,
        req.ip,
        req.headers['user-agent']
      );

      return res.status(201).json({
        success: true,
        message: 'Patient record created successfully.',
        data: newRecord,
      });
    } catch (error: any) {
      if (error.code === 'DUPLICATE_PATIENT_RECORD') {
        return res.status(409).json({
          success: false,
          error: {
            code: 'DUPLICATE_PATIENT_RECORD',
            message: error.message,
          },
        });
      }
      return next(error);
    }
  }
);

// Get Specific Patient Profile by Staff
patientRouter.get(
  '/:id',
  requireAuth,
  requireRole('FACILITY_STAFF', 'FACILITY_ADMIN', 'SYSTEM_ADMIN'),
  requireStaffOrgContext,
  requirePatientOrgAccess,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const patient = await db.patient.findUnique({
        where: { id: req.params.id },
        include: { user: true },
      });

      const formatted = PatientService.formatPatientProfile(patient);
      return res.status(200).json({
        success: true,
        data: formatted,
      });
    } catch (error) {
      return next(error);
    }
  }
);

// Update Patient Profile by Staff
patientRouter.put(
  '/:id',
  requireAuth,
  requireRole('FACILITY_STAFF', 'FACILITY_ADMIN', 'SYSTEM_ADMIN'),
  requireStaffOrgContext,
  requirePatientOrgAccess,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const patient = await db.patient.findUnique({ where: { id: req.params.id } });
      const validatedData = UpdatePatientProfileSchema.parse(req.body);
      const updatedProfile = await PatientService.updatePatientProfile(
        patient!.userId,
        validatedData,
        req.ip,
        req.headers['user-agent']
      );

      return res.status(200).json({
        success: true,
        message: 'Patient record updated successfully by staff.',
        data: updatedProfile,
      });
    } catch (error) {
      return next(error);
    }
  }
);

// Get Health Profile of a Patient by Staff
patientRouter.get(
  '/:id/health-profile',
  requireAuth,
  requireRole('FACILITY_STAFF', 'FACILITY_ADMIN', 'SYSTEM_ADMIN'),
  requireStaffOrgContext,
  requirePatientOrgAccess,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const healthProfile = await PatientService.getPatientHealthProfile(req.params.id);

      return res.status(200).json({
        success: true,
        data: healthProfile,
      });
    } catch (error) {
      return next(error);
    }
  }
);

// Clinician Add Verified Allergy
patientRouter.post(
  '/:id/health-profile/allergies',
  requireAuth,
  requireRole('FACILITY_STAFF', 'FACILITY_ADMIN', 'SYSTEM_ADMIN'),
  requireStaffOrgContext,
  requirePatientOrgAccess,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = PatientAllergySchema.parse(req.body);
      const allergy = await PatientService.addAllergy(
        req.params.id,
        validated,
        true,
        req.user!.id,
        req.ip,
        req.headers['user-agent']
      );

      return res.status(201).json({
        success: true,
        message: 'Clinician-verified allergy recorded.',
        data: allergy,
      });
    } catch (error) {
      return next(error);
    }
  }
);

// Clinician Add Verified Condition
patientRouter.post(
  '/:id/health-profile/conditions',
  requireAuth,
  requireRole('FACILITY_STAFF', 'FACILITY_ADMIN', 'SYSTEM_ADMIN'),
  requireStaffOrgContext,
  requirePatientOrgAccess,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = PatientConditionSchema.parse(req.body);
      const condition = await PatientService.addCondition(
        req.params.id,
        validated,
        true,
        req.user!.id,
        req.ip,
        req.headers['user-agent']
      );

      return res.status(201).json({
        success: true,
        message: 'Clinician-verified condition recorded.',
        data: condition,
      });
    } catch (error) {
      return next(error);
    }
  }
);

// Clinician Add Verified Medication
patientRouter.post(
  '/:id/health-profile/medications',
  requireAuth,
  requireRole('FACILITY_STAFF', 'FACILITY_ADMIN', 'SYSTEM_ADMIN'),
  requireStaffOrgContext,
  requirePatientOrgAccess,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = PatientMedicationSchema.parse(req.body);
      const medication = await PatientService.addMedication(
        req.params.id,
        validated,
        true,
        req.user!.id,
        req.ip,
        req.headers['user-agent']
      );

      return res.status(201).json({
        success: true,
        message: 'Clinician-verified medication recorded.',
        data: medication,
      });
    } catch (error) {
      return next(error);
    }
  }
);

// Clinician Add Verified Medical History
patientRouter.post(
  '/:id/health-profile/history',
  requireAuth,
  requireRole('FACILITY_STAFF', 'FACILITY_ADMIN', 'SYSTEM_ADMIN'),
  requireStaffOrgContext,
  requirePatientOrgAccess,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = PatientMedicalHistorySchema.parse(req.body);
      const history = await PatientService.addMedicalHistory(
        req.params.id,
        validated,
        true,
        req.user!.id,
        req.ip,
        req.headers['user-agent']
      );

      return res.status(201).json({
        success: true,
        message: 'Clinician-verified medical history entry recorded.',
        data: history,
      });
    } catch (error) {
      return next(error);
    }
  }
);

// Clinician Verify Patient-Entered Item
patientRouter.patch(
  '/:id/health-profile/:type/:itemId/verify',
  requireAuth,
  requireRole('FACILITY_STAFF', 'FACILITY_ADMIN', 'SYSTEM_ADMIN'),
  requireStaffOrgContext,
  requirePatientOrgAccess,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const itemType = req.params.type as 'allergy' | 'condition' | 'medication' | 'history';
      const updatedHealthProfile = await PatientService.verifyHealthItem(
        req.params.id,
        itemType,
        req.params.itemId,
        req.user!.id,
        req.ip,
        req.headers['user-agent']
      );

      return res.status(200).json({
        success: true,
        message: `Health profile ${itemType} item successfully verified by clinician.`,
        data: updatedHealthProfile,
      });
    } catch (error) {
      return next(error);
    }
  }
);
