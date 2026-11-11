import { Router, Request, Response, NextFunction } from 'express';
import { AnalyticsQuerySchema, AnalyticsExportQuerySchema } from '@meditrack/shared';
import { AnalyticsService } from '../services/analytics.service';
import { requireAuth, requireOrgMembership } from '../middleware/auth.middleware';
import { logger } from '../logger';

export const analyticsRouter = Router();

/**
 * GET /api/v1/organizations/:id/analytics
 * Retrieve complete analytics dashboard dataset for an authorized organization.
 */
analyticsRouter.get(
  '/organizations/:id/analytics',
  requireAuth,
  requireOrgMembership(),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const organizationId = req.params.id;
      const filters = AnalyticsQuerySchema.parse(req.query);

      logger.info(
        { organizationId, filters, userId: req.user?.id },
        'Healthcare analytics dashboard data requested'
      );

      const data = await AnalyticsService.getDashboardAnalytics(organizationId, filters);

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      return next(error);
    }
  }
);

/**
 * GET /api/v1/organizations/:id/analytics/export
 * Export analytics reports in CSV format for an authorized organization.
 */
analyticsRouter.get(
  '/organizations/:id/analytics/export',
  requireAuth,
  requireOrgMembership(),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const organizationId = req.params.id;
      const exportParams = AnalyticsExportQuerySchema.parse(req.query);

      logger.info(
        { organizationId, reportType: exportParams.reportType, userId: req.user?.id },
        'Healthcare analytics CSV export requested'
      );

      const csvContent = await AnalyticsService.generateCsvReport(
        organizationId,
        {
          startDate: exportParams.startDate,
          endDate: exportParams.endDate,
          granularity: 'daily',
          facilityId: exportParams.facilityId,
          department: exportParams.department,
        },
        exportParams.reportType
      );

      const filename = `meditrack-analytics-${exportParams.reportType}-${Date.now()}.csv`;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      return res.status(200).send(csvContent);
    } catch (error) {
      return next(error);
    }
  }
);

/**
 * GET /api/v1/analytics
 * Convenience endpoint for active organization context.
 */
analyticsRouter.get(
  '/analytics',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const activeOrgId =
        req.session?.activeOrganizationId ||
        (req.user as any)?.memberships?.[0]?.organizationId;

      if (!activeOrgId) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_ORG_CONTEXT',
            message: 'Target organization context is missing.',
          },
        });
      }

      // Check membership
      if (req.user?.role !== 'SYSTEM_ADMIN') {
        const isMember = (req.user as any)?.memberships?.some(
          (m: any) => m.organizationId === activeOrgId
        );
        if (!isMember) {
          return res.status(403).json({
            success: false,
            error: {
              code: 'CROSS_TENANT_ACCESS_DENIED',
              message: 'Access denied. You are not a member of this healthcare organization.',
            },
          });
        }
      }

      const filters = AnalyticsQuerySchema.parse(req.query);
      const data = await AnalyticsService.getDashboardAnalytics(activeOrgId, filters);

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      return next(error);
    }
  }
);
