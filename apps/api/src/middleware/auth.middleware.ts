import { Request, Response, NextFunction } from 'express';
import { Role } from '@meditrack/database';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user || !req.session) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication is required to access this resource.',
      },
    });
  }
  return next();
}

export function requireVerified(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required.' },
    });
  }

  if (!req.user.isVerified) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'EMAIL_NOT_VERIFIED',
        message: 'Please verify your email address before accessing this feature.',
      },
    });
  }

  return next();
}

export function requireMfa(req: Request, res: Response, next: NextFunction) {
  if (!req.user || !req.session) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required.' },
    });
  }

  const isAdminRole = req.user.role === 'FACILITY_ADMIN' || req.user.role === 'SYSTEM_ADMIN';
  const requiresMfa = isAdminRole || req.user.mfaEnabled;

  if (requiresMfa && !req.session.isMfaVerified) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'MFA_REQUIRED',
        message: 'Multi-factor authentication challenge must be completed.',
      },
    });
  }

  return next();
}

export function requireRole(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required.' },
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied. You do not have the required permissions for this action.',
        },
      });
    }

    return next();
  };
}

export function requireOrgMembership(requiredRole?: Role) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required.' },
      });
    }

    if (req.user.role === 'SYSTEM_ADMIN') {
      return next();
    }

    const targetOrgId =
      req.params.organizationId ||
      req.params.id ||
      req.body.organizationId ||
      req.session?.activeOrganizationId;

    if (!targetOrgId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_ORG_CONTEXT',
          message: 'Target organization context is missing.',
        },
      });
    }

    const membership = (req.user as any).memberships?.find(
      (m: any) => m.organizationId === targetOrgId
    );

    if (!membership) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'CROSS_TENANT_ACCESS_DENIED',
          message: 'Access denied. You are not a member of this healthcare organization.',
        },
      });
    }

    if (requiredRole && membership.role !== requiredRole && membership.role !== 'FACILITY_ADMIN') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_MEMBERSHIP_ROLE',
          message: 'Access denied. Higher organization role permissions required.',
        },
      });
    }

    return next();
  };
}
