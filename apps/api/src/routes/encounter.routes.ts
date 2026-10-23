import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.middleware';
import { EncounterService } from '../services/encounter.service';
import { PatientService } from '../services/patient.service';
import {
  CreateEncounterSchema,
  UpdateEncounterSchema,
  AmendEncounterSchema,
} from '@meditrack/shared';
import { db } from '@meditrack/database';

export const encounterRouter = Router();

// Helper middleware for staff active tenant context
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

// ==========================================
// 1. PATIENT SELF-SERVICE CLINICAL RECORDS
// ==========================================

// Get Patient's Authorized Clinical Records
encounterRouter.get('/me', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await PatientService.getPatientProfileByUserId(req.user!.id);
    const records = await EncounterService.getPatientEncountersForPatient(profile.id);

    return res.status(200).json({
      success: true,
      data: records,
    });
  } catch (error) {
    return next(error);
  }
});

// ==========================================
// 2. STAFF / CLINICIAN CLINICAL RECORDS
// ==========================================

// List Encounters for Patient or Organization (Staff)
encounterRouter.get(
  '/',
  requireAuth,
  requireRole('FACILITY_STAFF', 'FACILITY_ADMIN', 'SYSTEM_ADMIN'),
  requireStaffOrgContext,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const activeOrgId = (req as any).activeOrgId;
      const patientId = req.query.patientId as string;

      const encounters = await EncounterService.getEncountersForStaff(activeOrgId, patientId);

      return res.status(200).json({
        success: true,
        data: encounters,
      });
    } catch (error) {
      return next(error);
    }
  }
);

// Get Specific Encounter Details (Staff)
encounterRouter.get(
  '/:id',
  requireAuth,
  requireRole('FACILITY_STAFF', 'FACILITY_ADMIN', 'SYSTEM_ADMIN'),
  requireStaffOrgContext,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const activeOrgId = (req as any).activeOrgId;
      const encounter = await EncounterService.getEncounterById(req.params.id, activeOrgId);

      return res.status(200).json({
        success: true,
        data: encounter,
      });
    } catch (error) {
      return next(error);
    }
  }
);

// Create Draft Clinical Encounter (Staff / Clinician)
encounterRouter.post(
  '/',
  requireAuth,
  requireRole('FACILITY_STAFF', 'FACILITY_ADMIN', 'SYSTEM_ADMIN'),
  requireStaffOrgContext,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const activeOrgId = (req as any).activeOrgId;
      const validated = CreateEncounterSchema.parse(req.body);

      const encounter = await EncounterService.createEncounter(
        activeOrgId,
        req.user!.id,
        validated,
        req.ip,
        req.headers['user-agent']
      );

      return res.status(201).json({
        success: true,
        message: 'Draft clinical encounter record created successfully.',
        data: encounter,
      });
    } catch (error) {
      return next(error);
    }
  }
);

// Update Draft Clinical Encounter (Staff / Clinician)
encounterRouter.put(
  '/:id',
  requireAuth,
  requireRole('FACILITY_STAFF', 'FACILITY_ADMIN', 'SYSTEM_ADMIN'),
  requireStaffOrgContext,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = UpdateEncounterSchema.parse(req.body);

      const updated = await EncounterService.updateEncounter(
        req.params.id,
        req.user!.id,
        validated,
        req.ip,
        req.headers['user-agent']
      );

      return res.status(200).json({
        success: true,
        message: 'Draft clinical encounter updated.',
        data: updated,
      });
    } catch (error: any) {
      if (error.code === 'ENCOUNTER_ALREADY_SIGNED') {
        return res.status(403).json({
          success: false,
          error: { code: error.code, message: error.message },
        });
      }
      return next(error);
    }
  }
);

// Sign & Finalize Clinical Record (Staff / Clinician)
encounterRouter.post(
  '/:id/sign',
  requireAuth,
  requireRole('FACILITY_STAFF', 'FACILITY_ADMIN', 'SYSTEM_ADMIN'),
  requireStaffOrgContext,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const signed = await EncounterService.signEncounter(
        req.params.id,
        req.user!.id,
        req.ip,
        req.headers['user-agent']
      );

      return res.status(200).json({
        success: true,
        message: 'Clinical record signed and finalized.',
        data: signed,
      });
    } catch (error: any) {
      if (error.code === 'ENCOUNTER_ALREADY_SIGNED') {
        return res.status(400).json({
          success: false,
          error: { code: error.code, message: error.message },
        });
      }
      return next(error);
    }
  }
);

// Amend Signed Clinical Record (Staff / Clinician)
encounterRouter.post(
  '/:id/amend',
  requireAuth,
  requireRole('FACILITY_STAFF', 'FACILITY_ADMIN', 'SYSTEM_ADMIN'),
  requireStaffOrgContext,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = AmendEncounterSchema.parse(req.body);

      const amended = await EncounterService.amendEncounter(
        req.params.id,
        req.user!.id,
        validated,
        req.ip,
        req.headers['user-agent']
      );

      return res.status(200).json({
        success: true,
        message: 'Clinical record amended and audit history logged.',
        data: amended,
      });
    } catch (error: any) {
      if (error.code === 'ENCOUNTER_STILL_DRAFT') {
        return res.status(400).json({
          success: false,
          error: { code: error.code, message: error.message },
        });
      }
      return next(error);
    }
  }
);
