import { Request, Response, NextFunction } from 'express';
import { db } from '@meditrack/database';
import { AuthService } from '../services/auth.service';

const prisma = db as any;

declare global {
  namespace Express {
    interface Request {
      session?: any;
      user?: any;
      patientProfile?: any;
      membership?: any;
    }
  }
}

export const SESSION_COOKIE_NAME = 'meditrack_session';

export async function sessionMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    let token: string | undefined = req.cookies?.[SESSION_COOKIE_NAME];

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      req.session = null;
      req.user = null;
      return next();
    }

    const tokenHash = AuthService.hashToken(token);

    const session = await prisma.session.findUnique({
      where: { tokenHash },
      include: {
        user: {
          include: {
            patientProfile: true,
            memberships: {
              include: {
                organization: true,
              },
            },
          },
        },
      },
    });

    if (!session || session.revokedAt || new Date() > session.expiresAt) {
      req.session = null;
      req.user = null;
      return next();
    }

    req.session = session;
    req.user = session.user;
    req.patientProfile = session.user.patientProfile;

    if (session.activeOrganizationId && session.user.memberships) {
      req.membership =
        session.user.memberships.find(
          (m: any) => m.organizationId === session.activeOrganizationId
        ) || null;
    }

    return next();
  } catch (error) {
    req.session = null;
    req.user = null;
    return next();
  }
}
