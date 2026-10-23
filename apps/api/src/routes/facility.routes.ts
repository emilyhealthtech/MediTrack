import { Router, Request, Response, NextFunction } from 'express';
import { db } from '@meditrack/database';
import { PatientFacilityConnectionSchema } from '@meditrack/shared';
import { requireAuth } from '../middleware/auth.middleware';

const prisma = db as any;

export const facilityRouter = Router();

// 1. Search Public Facilities
facilityRouter.get('/public/facilities', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { query, state, city } = req.query;

    const whereClause: any = {
      organization: {
        isVerified: true,
      },
    };

    if (query && typeof query === 'string' && query.trim()) {
      whereClause.OR = [
        { name: { contains: query.trim(), mode: 'insensitive' } },
        { organization: { name: { contains: query.trim(), mode: 'insensitive' } } },
      ];
    }

    if (state && typeof state === 'string' && state.trim()) {
      whereClause.state = { equals: state.trim(), mode: 'insensitive' };
    }

    if (city && typeof city === 'string' && city.trim()) {
      whereClause.city = { equals: city.trim(), mode: 'insensitive' };
    }

    const facilities = await prisma.facility.findMany({
      where: whereClause,
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            isVerified: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return res.status(200).json({
      success: true,
      data: facilities,
    });
  } catch (error) {
    return next(error);
  }
});

// 2. Request Patient-Facility Connection
facilityRouter.post(
  '/patients/facility-connections',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { facilityId, verificationNotes } = PatientFacilityConnectionSchema.parse(req.body);

      if (!req.patientProfile) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'PATIENT_PROFILE_REQUIRED',
            message: 'Only registered patient profiles can request facility connections.',
          },
        });
      }

      const facility = await prisma.facility.findUnique({
        where: { id: facilityId },
      });

      if (!facility) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Target facility not found.' },
        });
      }

      // Check if connection request already exists
      const existing = await prisma.patientFacilityConnection.findUnique({
        where: {
          patientId_facilityId: {
            patientId: req.patientProfile.id,
            facilityId,
          },
        },
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'CONNECTION_ALREADY_EXISTS',
            message: `Facility connection request already exists with status: ${existing.status}.`,
          },
        });
      }

      // Create PENDING connection request
      const connection = await prisma.patientFacilityConnection.create({
        data: {
          patientId: req.patientProfile.id,
          facilityId,
          status: 'PENDING',
          verificationNotes: verificationNotes || null,
        },
        include: {
          facility: {
            include: { organization: true },
          },
        },
      });

      await prisma.auditEvent.create({
        data: {
          userId: req.user!.id,
          organizationId: facility.organizationId,
          action: 'PATIENT_FACILITY_CONNECTION_REQUESTED',
          entity: 'PatientFacilityConnection',
          entityId: connection.id,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        },
      });

      return res.status(201).json({
        success: true,
        message:
          'Facility connection requested successfully. Note: Access to existing medical records requires administrator verification.',
        data: connection,
      });
    } catch (error) {
      return next(error);
    }
  }
);

// 3. List Patient Facility Connections
facilityRouter.get(
  '/patients/facility-connections',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.patientProfile) {
        return res.status(400).json({
          success: false,
          error: { code: 'NO_PATIENT_PROFILE', message: 'No patient profile associated.' },
        });
      }

      const connections = await prisma.patientFacilityConnection.findMany({
        where: { patientId: req.patientProfile.id },
        include: {
          facility: {
            include: { organization: true },
          },
        },
        orderBy: { requestedAt: 'desc' },
      });

      return res.status(200).json({
        success: true,
        data: connections,
      });
    } catch (error) {
      return next(error);
    }
  }
);
