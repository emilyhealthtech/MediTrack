import { Router, Request, Response, NextFunction } from 'express';
import { db } from '@meditrack/database';
import {
  OrganizationApplySchema,
  OrganizationReviewSchema,
  StaffInviteSchema,
  AcceptInviteSchema,
  UpdateOrganizationSchema,
  UpdateMemberRoleSchema,
} from '@meditrack/shared';
import { AuthService } from '../services/auth.service';
import { EmailService } from '../services/email.service';
import { requireAuth, requireRole, requireOrgMembership } from '../middleware/auth.middleware';
import { logger } from '../logger';

export const organizationRouter = Router();

// 1. Submit Healthcare Organization Application (Public)
organizationRouter.post('/apply', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = OrganizationApplySchema.parse(req.body);

    const existingApp = await db.organizationApplication.findUnique({
      where: { slug: data.slug.toLowerCase() },
    });

    if (existingApp) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'SLUG_TAKEN',
          message: 'An organization application with this custom slug already exists.',
        },
      });
    }

    const application = await db.organizationApplication.create({
      data: {
        organizationName: data.organizationName,
        slug: data.slug.toLowerCase(),
        rcNumber: data.rcNumber || null,
        contactName: data.contactName,
        contactEmail: data.contactEmail.toLowerCase(),
        contactPhone: data.contactPhone || null,
        state: data.state,
        status: 'PENDING',
      },
    });

    await db.auditEvent.create({
      data: {
        action: 'ORG_APPLICATION_SUBMITTED',
        entity: 'OrganizationApplication',
        entityId: application.id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Healthcare organization application submitted for admin review.',
      data: application,
    });
  } catch (error) {
    return next(error);
  }
});

// 8. Get Organization Details
organizationRouter.get(
  '/:id',
  requireAuth,
  requireOrgMembership(),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orgId = req.params.id;
      const org = await db.organization.findUnique({
        where: { id: orgId },
        include: {
          facilities: true,
          subscriptions: { include: { plan: true } },
          _count: {
            select: {
              memberships: true,
              facilities: true,
              patients: true,
            },
          },
        },
      });

      if (!org) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Organization not found.' },
        });
      }

      return res.status(200).json({
        success: true,
        data: org,
      });
    } catch (error) {
      return next(error);
    }
  }
);

// 9. Update Organization Settings (Org Admin)
organizationRouter.patch(
  '/:id',
  requireAuth,
  requireOrgMembership('FACILITY_ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orgId = req.params.id;
      const updateData = UpdateOrganizationSchema.parse(req.body);

      const updatedOrg = await db.organization.update({
        where: { id: orgId },
        data: {
          ...(updateData.name && { name: updateData.name }),
          ...(updateData.rcNumber !== undefined && { rcNumber: updateData.rcNumber }),
        },
      });

      await db.auditEvent.create({
        data: {
          userId: req.user!.id,
          organizationId: orgId,
          action: 'ORG_SETTINGS_UPDATED',
          entity: 'Organization',
          entityId: orgId,
          detailsJson: JSON.stringify(updateData),
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        },
      });

      return res.status(200).json({
        success: true,
        message: 'Organization settings updated successfully.',
        data: updatedOrg,
      });
    } catch (error) {
      return next(error);
    }
  }
);

// 10. List Organization Members
organizationRouter.get(
  '/:id/members',
  requireAuth,
  requireOrgMembership(),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orgId = req.params.id;
      const memberships = await db.membership.findMany({
        where: { organizationId: orgId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
              phoneNumber: true,
              role: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return res.status(200).json({
        success: true,
        data: memberships,
      });
    } catch (error) {
      return next(error);
    }
  }
);

// 11. Update Member Role / Status (Org Admin)
organizationRouter.patch(
  '/:id/members/:memberId',
  requireAuth,
  requireOrgMembership('FACILITY_ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id: orgId, memberId } = req.params;

      // Security Check: Administrators CANNOT grant themselves or others permissions beyond authorized role model (e.g. SYSTEM_ADMIN)
      if ((req.body as any).role === 'SYSTEM_ADMIN') {
        return res.status(403).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED_ROLE_ASSIGNMENT',
            message: 'Organization administrators cannot grant system administration privileges.',
          },
        });
      }

      const { role, isActive } = UpdateMemberRoleSchema.parse(req.body);

      const membership = await db.membership.findFirst({
        where: { id: memberId, organizationId: orgId },
      });

      if (!membership) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Membership record not found.' },
        });
      }

      const updatedMembership = await db.membership.update({
        where: { id: memberId },
        data: {
          ...(role && { role: role as any }),
          ...(isActive !== undefined && { isActive }),
        },
        include: {
          user: {
            select: { id: true, email: true, fullName: true, role: true },
          },
        },
      });

      await db.auditEvent.create({
        data: {
          userId: req.user!.id,
          organizationId: orgId,
          action: 'MEMBER_ROLE_UPDATED',
          entity: 'Membership',
          entityId: memberId,
          detailsJson: JSON.stringify({ role, isActive }),
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        },
      });

      return res.status(200).json({
        success: true,
        message: 'Member updated successfully.',
        data: updatedMembership,
      });
    } catch (error) {
      return next(error);
    }
  }
);

// 12. Deactivate / Remove Member (Org Admin)
organizationRouter.delete(
  '/:id/members/:memberId',
  requireAuth,
  requireOrgMembership('FACILITY_ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id: orgId, memberId } = req.params;

      const membership = await db.membership.findFirst({
        where: { id: memberId, organizationId: orgId },
      });

      if (!membership) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Membership record not found.' },
        });
      }

      await db.membership.delete({
        where: { id: memberId },
      });

      await db.auditEvent.create({
        data: {
          userId: req.user!.id,
          organizationId: orgId,
          action: 'MEMBER_REMOVED',
          entity: 'Membership',
          entityId: memberId,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        },
      });

      return res.status(200).json({
        success: true,
        message: 'Member removed from organization.',
      });
    } catch (error) {
      return next(error);
    }
  }
);

// 13. List Pending Invitations (Org Admin)
organizationRouter.get(
  '/:id/invitations',
  requireAuth,
  requireOrgMembership('FACILITY_ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orgId = req.params.id;
      const invitations = await db.invitation.findMany({
        where: { organizationId: orgId, acceptedAt: null },
        orderBy: { createdAt: 'desc' },
      });

      return res.status(200).json({
        success: true,
        data: invitations,
      });
    } catch (error) {
      return next(error);
    }
  }
);

// 14. Revoke Invitation (Org Admin)
organizationRouter.delete(
  '/:id/invitations/:invitationId',
  requireAuth,
  requireOrgMembership('FACILITY_ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id: orgId, invitationId } = req.params;

      const invitation = await db.invitation.findFirst({
        where: { id: invitationId, organizationId: orgId },
      });

      if (!invitation) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Invitation not found.' },
        });
      }

      await db.invitation.delete({
        where: { id: invitationId },
      });

      await db.auditEvent.create({
        data: {
          userId: req.user!.id,
          organizationId: orgId,
          action: 'STAFF_INVITATION_REVOKED',
          entity: 'Invitation',
          entityId: invitationId,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        },
      });

      return res.status(200).json({
        success: true,
        message: 'Invitation revoked successfully.',
      });
    } catch (error) {
      return next(error);
    }
  }
);

// 15. Operational Reporting Summary
organizationRouter.get(
  '/:id/reports/summary',
  requireAuth,
  requireOrgMembership(),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orgId = req.params.id;

      // Aggregated totals
      const [
        totalAppointments,
        scheduledAppointments,
        completedAppointments,
        cancelledAppointments,
        noShowAppointments,
        totalPatients,
        totalMembers,
        activeMembers,
        totalEncounters,
      ] = await Promise.all([
        db.appointment.count({ where: { organizationId: orgId } }),
        db.appointment.count({ where: { organizationId: orgId, status: 'SCHEDULED' } }),
        db.appointment.count({ where: { organizationId: orgId, status: 'COMPLETED' } }),
        db.appointment.count({ where: { organizationId: orgId, status: 'CANCELLED' } }),
        db.appointment.count({ where: { organizationId: orgId, status: 'NO_SHOW' } }),
        db.patient.count({ where: { organizationId: orgId } }),
        db.membership.count({ where: { organizationId: orgId } }),
        db.membership.count({ where: { organizationId: orgId, isActive: true } }),
        db.encounter.count({ where: { organizationId: orgId } }),
      ]);

      return res.status(200).json({
        success: true,
        data: {
          organizationId: orgId,
          generatedAt: new Date().toISOString(),
          appointments: {
            total: totalAppointments,
            byStatus: {
              scheduled: scheduledAppointments,
              completed: completedAppointments,
              cancelled: cancelledAppointments,
              noShow: noShowAppointments,
            },
          },
          patients: {
            total: totalPatients,
          },
          memberships: {
            total: totalMembers,
            active: activeMembers,
            inactive: totalMembers - activeMembers,
          },
          clinicalActivity: {
            totalEncounters,
          },
        },
      });
    } catch (error) {
      return next(error);
    }
  }
);

// 16. Administrative Audit History
organizationRouter.get(
  '/:id/audit-logs',
  requireAuth,
  requireOrgMembership('FACILITY_ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orgId = req.params.id;
      const logs = await db.auditEvent.findMany({
        where: { organizationId: orgId },
        include: {
          user: { select: { id: true, fullName: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });

      return res.status(200).json({
        success: true,
        data: logs,
      });
    } catch (error) {
      return next(error);
    }
  }
);

// 2. List Applications (Platform Admin)
organizationRouter.get(
  '/applications',
  requireAuth,
  requireRole('SYSTEM_ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const applications = await db.organizationApplication.findMany({
        orderBy: { createdAt: 'desc' },
      });

      return res.status(200).json({
        success: true,
        data: applications,
      });
    } catch (error) {
      return next(error);
    }
  }
);

// 3. Get Application Details
organizationRouter.get(
  '/applications/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const application = await db.organizationApplication.findUnique({
        where: { id: req.params.id },
      });

      if (!application) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Organization application not found.',
          },
        });
      }

      return res.status(200).json({
        success: true,
        data: application,
      });
    } catch (error) {
      return next(error);
    }
  }
);

// 4. Platform Admin Review Application (Approve or Reject)
organizationRouter.post(
  '/admin/applications/:id/review',
  requireAuth,
  requireRole('SYSTEM_ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { action, notes } = OrganizationReviewSchema.parse(req.body);
      const appId = req.params.id;

      const application = await db.organizationApplication.findUnique({
        where: { id: appId },
      });

      if (!application) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Application not found.' },
        });
      }

      if (application.status !== 'PENDING') {
        return res.status(400).json({
          success: false,
          error: { code: 'ALREADY_PROCESSED', message: 'This application has already been processed.' },
        });
      }

      if (action === 'REJECT') {
        const updated = await db.organizationApplication.update({
          where: { id: appId },
          data: {
            status: 'REJECTED',
            reviewNotes: notes || null,
            reviewedByUserId: req.user!.id,
            reviewedAt: new Date(),
          },
        });

        await EmailService.sendOrgApplicationStatusEmail(
          application.contactEmail,
          application.organizationName,
          'REJECTED',
          notes
        );

        return res.status(200).json({
          success: true,
          message: 'Organization application rejected.',
          data: updated,
        });
      }

      // Approve workflow: Create Organization, Default Facility, and Admin User/Membership
      const createdOrg = await db.$transaction(async (tx: any) => {
        const org = await tx.organization.create({
          data: {
            name: application.organizationName,
            slug: application.slug,
            rcNumber: application.rcNumber,
            isVerified: true,
          },
        });

        // Create Default Facility
        await tx.facility.create({
          data: {
            organizationId: org.id,
            name: `${org.name} - Main Campus`,
            address: 'Main Facility Address',
            city: 'Lagos',
            state: application.state,
            phone: application.contactPhone || '+2348000000000',
            email: application.contactEmail,
          },
        });

        // Check or create admin user
        let user = await tx.user.findUnique({
          where: { email: application.contactEmail.toLowerCase() },
        });

        if (!user) {
          const initialPasswordHash = await AuthService.hashPassword('MediTrackPass#2025!');
          user = await tx.user.create({
            data: {
              email: application.contactEmail.toLowerCase(),
              passwordHash: initialPasswordHash,
              fullName: application.contactName,
              phoneNumber: application.contactPhone,
              role: 'FACILITY_ADMIN',
              isVerified: true,
            },
          });
        }

        // Create Membership
        await tx.membership.create({
          data: {
            userId: user.id,
            organizationId: org.id,
            role: 'FACILITY_ADMIN',
          },
        });

        // Update application
        await tx.organizationApplication.update({
          where: { id: appId },
          data: {
            status: 'APPROVED',
            reviewNotes: notes || null,
            reviewedByUserId: req.user!.id,
            reviewedAt: new Date(),
          },
        });

        await tx.auditEvent.create({
          data: {
            userId: req.user!.id,
            organizationId: org.id,
            action: 'ORG_APPLICATION_APPROVED',
            entity: 'Organization',
            entityId: org.id,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
          },
        });

        return org;
      });

      await EmailService.sendOrgApplicationStatusEmail(
        application.contactEmail,
        application.organizationName,
        'APPROVED',
        notes
      );

      return res.status(200).json({
        success: true,
        message: 'Organization approved successfully and tenant provisioned.',
        data: createdOrg,
      });
    } catch (error) {
      return next(error);
    }
  }
);

// 5. Create Staff Invitation (Org Admin)
organizationRouter.post(
  '/:id/invitations',
  requireAuth,
  requireOrgMembership('FACILITY_ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, role } = StaffInviteSchema.parse(req.body);
      const organizationId = req.params.id;

      const org = await db.organization.findUnique({
        where: { id: organizationId },
      });

      if (!org) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Organization not found.' },
        });
      }

      const rawToken = AuthService.generateRandomToken(32);
      const tokenHash = AuthService.hashToken(rawToken);
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      const invitation = await db.invitation.create({
        data: {
          organizationId,
          email: email.toLowerCase(),
          role: role as any,
          tokenHash,
          inviterId: req.user!.id,
          expiresAt,
        },
      });

      await EmailService.sendStaffInvitationEmail(email, rawToken, org.name, role);

      await db.auditEvent.create({
        data: {
          userId: req.user!.id,
          organizationId,
          action: 'STAFF_INVITATION_CREATED',
          entity: 'Invitation',
          entityId: invitation.id,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        },
      });

      return res.status(201).json({
        success: true,
        message: 'Staff invitation sent successfully.',
        data: {
          id: invitation.id,
          email: invitation.email,
          role: invitation.role,
          expiresAt: invitation.expiresAt,
          invitationToken: rawToken, // Provided for easy demo/testing
        },
      });
    } catch (error) {
      return next(error);
    }
  }
);

// 6. Get Invitation Info (Public by token)
organizationRouter.get('/invitations/:token', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const rawToken = req.params.token;
    const tokenHash = AuthService.hashToken(rawToken);

    const invitation = await db.invitation.findUnique({
      where: { tokenHash },
      include: { organization: true },
    });

    if (!invitation || invitation.acceptedAt || new Date() > invitation.expiresAt) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_OR_EXPIRED_INVITATION',
          message: 'Invitation is invalid, already accepted, or expired.',
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        organizationName: invitation.organization.name,
        expiresAt: invitation.expiresAt,
      },
    });
  } catch (error) {
    return next(error);
  }
});

// 7. Accept Staff Invitation
organizationRouter.post('/invitations/accept', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, fullName, password, phoneNumber } = AcceptInviteSchema.parse(req.body);
    const tokenHash = AuthService.hashToken(token);

    const invitation = await db.invitation.findUnique({
      where: { tokenHash },
      include: { organization: true },
    });

    if (!invitation || invitation.acceptedAt || new Date() > invitation.expiresAt) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_OR_EXPIRED_INVITATION',
          message: 'Invitation is invalid, already accepted, or expired.',
        },
      });
    }

    let user = await db.user.findUnique({
      where: { email: invitation.email.toLowerCase() },
    });

    if (!user) {
      const passwordHash = await AuthService.hashPassword(password);
      user = await db.user.create({
        data: {
          email: invitation.email.toLowerCase(),
          passwordHash,
          fullName,
          phoneNumber,
          role: invitation.role as any,
          isVerified: true,
        },
      });
    } else {
      if (invitation.role === 'FACILITY_ADMIN' && user.role !== 'SYSTEM_ADMIN') {
        await db.user.update({
          where: { id: user.id },
          data: { role: 'FACILITY_ADMIN', isVerified: true },
        });
      }
    }

    // Upsert Membership
    await db.membership.upsert({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId: invitation.organizationId,
        },
      },
      update: { role: invitation.role as any },
      create: {
        userId: user.id,
        organizationId: invitation.organizationId,
        role: invitation.role as any,
      },
    });

    // Mark invitation as accepted
    await db.invitation.update({
      where: { id: invitation.id },
      data: { acceptedAt: new Date() },
    });

    await db.auditEvent.create({
      data: {
        userId: user.id,
        organizationId: invitation.organizationId,
        action: 'INVITATION_ACCEPTED',
        entity: 'Invitation',
        entityId: invitation.id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    return res.status(200).json({
      success: true,
      message: `Successfully joined ${invitation.organization.name}!`,
    });
  } catch (error) {
    return next(error);
  }
});
