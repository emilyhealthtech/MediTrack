import { Router, Request, Response, NextFunction } from 'express';
import { db } from '@meditrack/database';
import { SetActiveContextSchema } from '@meditrack/shared';
import { requireAuth } from '../middleware/auth.middleware';

export const meRouter = Router();

// 1. Get User Memberships
meRouter.get('/memberships', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    const memberships = await db.membership.findMany({
      where: { userId },
      include: {
        organization: {
          include: {
            facilities: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: memberships,
    });
  } catch (error) {
    return next(error);
  }
});

// 2. Set Active Organization / Facility Context on Session
meRouter.post('/active-context', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { organizationId, facilityId } = SetActiveContextSchema.parse(req.body);
    const userId = req.user!.id;

    if (req.user!.role !== 'SYSTEM_ADMIN') {
      const membership = await db.membership.findUnique({
        where: {
          userId_organizationId: {
            userId,
            organizationId,
          },
        },
      });

      if (!membership) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'TENANT_ACCESS_DENIED',
            message: 'You are not a verified member of this healthcare organization.',
          },
        });
      }
    }

    if (facilityId) {
      const facility = await db.facility.findFirst({
        where: {
          id: facilityId,
          organizationId,
        },
      });

      if (!facility) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_FACILITY_CONTEXT',
            message: 'The selected facility does not belong to the target organization.',
          },
        });
      }
    }

    await db.session.update({
      where: { id: req.session!.id },
      data: {
        activeOrganizationId: organizationId,
        activeFacilityId: facilityId || null,
      },
    });

    await db.auditEvent.create({
      data: {
        userId,
        organizationId,
        action: 'ACTIVE_CONTEXT_CHANGED',
        entity: 'Session',
        entityId: req.session!.id,
        detailsJson: JSON.stringify({ activeOrganizationId: organizationId, activeFacilityId: facilityId }),
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Active organization/facility context updated successfully.',
      data: {
        activeOrganizationId: organizationId,
        activeFacilityId: facilityId || null,
      },
    });
  } catch (error) {
    return next(error);
  }
});
