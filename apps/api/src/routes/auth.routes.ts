import { Router, Request, Response, NextFunction } from 'express';
import { db } from '@meditrack/database';
import {
  PatientRegisterSchema,
  LoginSchema,
  VerifyEmailSchema,
  ResendVerificationSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  ChangePasswordSchema,
  MfaVerifySchema,
  MfaChallengeSchema,
  MfaRecoverySchema,
} from '@meditrack/shared';
import { AuthService } from '../services/auth.service';
import { EmailService } from '../services/email.service';
import { SESSION_COOKIE_NAME } from '../middleware/session.middleware';
import { requireAuth, requireMfa } from '../middleware/auth.middleware';
import { rateLimiter } from '../middleware/rate-limit.middleware';
import { logger } from '../logger';

const prisma = db as any;

export const authRouter = Router();

/**
 * Helper to create a new session and set HttpOnly cookie
 */
async function createSessionAndSetCookie(
  res: Response,
  userId: string,
  ipAddress?: string,
  userAgent?: string,
  isMfaVerified: boolean = false
) {
  const rawSessionToken = AuthService.generateRandomToken(32);
  const tokenHash = AuthService.hashToken(rawSessionToken);
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  const session = await prisma.session.create({
    data: {
      userId,
      tokenHash,
      isMfaVerified,
      expiresAt,
      ipAddress,
      userAgent,
    },
    include: {
      user: {
        include: {
          patientProfile: true,
          memberships: {
            include: { organization: true },
          },
        },
      },
    },
  });

  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie(SESSION_COOKIE_NAME, rawSessionToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  });

  return { session, rawSessionToken };
}

// 1. Patient Self-Registration
authRouter.post(
  '/register/patient',
  rateLimiter(),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = PatientRegisterSchema.parse(req.body);

      const existingUser = await prisma.user.findUnique({
        where: { email: data.email.toLowerCase() },
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'EMAIL_ALREADY_EXISTS',
            message: 'An account with this email address already exists.',
          },
        });
      }

      const passwordHash = await AuthService.hashPassword(data.password);

      const user = await prisma.user.create({
        data: {
          email: data.email.toLowerCase(),
          passwordHash,
          fullName: data.fullName,
          phoneNumber: data.phoneNumber,
          role: 'PATIENT',
          isVerified: false,
          patientProfile: {
            create: {
              dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
              gender: data.gender || null,
              emergencyContact: data.emergencyContact || null,
            },
          },
        },
        include: {
          patientProfile: true,
        },
      });

      // Generate Email Verification Token
      const rawVerifyToken = AuthService.generateRandomToken(32);
      const tokenHash = AuthService.hashToken(rawVerifyToken);
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

      await prisma.emailVerificationToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      });

      // Dispatch Verification Email
      await EmailService.sendVerificationEmail(user.email, rawVerifyToken);

      // Log audit event
      await prisma.auditEvent.create({
        data: {
          userId: user.id,
          action: 'USER_REGISTERED',
          entity: 'User',
          entityId: user.id,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        },
      });

      // Automatically create session
      const { session } = await createSessionAndSetCookie(
        res,
        user.id,
        req.ip,
        req.headers['user-agent'] as string,
        false
      );

      return res.status(201).json({
        success: true,
        message: 'Registration successful! Verification email has been sent.',
        data: {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            isVerified: user.isVerified,
            mfaEnabled: user.mfaEnabled,
            createdAt: user.createdAt,
          },
          patientProfile: user.patientProfile,
          session: {
            sessionId: session.id,
            expiresAt: session.expiresAt,
          },
        },
      });
    } catch (error) {
      return next(error);
    }
  }
);

// 2. Login
authRouter.post(
  '/login',
  rateLimiter(),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = LoginSchema.parse(req.body);

      const user = await prisma.user.findUnique({
        where: { email: data.email.toLowerCase() },
        include: {
          patientProfile: true,
          memberships: {
            include: { organization: true },
          },
        },
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password.',
          },
        });
      }

      const isPasswordValid = await AuthService.verifyPassword(user.passwordHash, data.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password.',
          },
        });
      }

      // Check if MFA is required for FACILITY_ADMIN, SYSTEM_ADMIN or mfaEnabled
      const isAdmin = user.role === 'FACILITY_ADMIN' || user.role === 'SYSTEM_ADMIN';
      const isMfaRequired = isAdmin || user.mfaEnabled;

      if (isMfaRequired) {
        if (data.mfaCode && user.mfaSecret) {
          const isValidMfa = AuthService.verifyMfaToken(data.mfaCode, user.mfaSecret);
          if (!isValidMfa) {
            return res.status(401).json({
              success: false,
              error: {
                code: 'INVALID_MFA_CODE',
                message: 'Invalid multi-factor authentication code.',
              },
            });
          }
        } else {
          // Return mfaRequired challenge response
          const mfaToken = AuthService.generateRandomToken(32);
          return res.status(200).json({
            success: true,
            message: 'MFA challenge required.',
            data: {
              mfaRequired: true,
              mfaToken,
              userId: user.id,
              email: user.email,
            },
          });
        }
      }

      const { session } = await createSessionAndSetCookie(
        res,
        user.id,
        req.ip,
        req.headers['user-agent'] as string,
        isMfaRequired ? true : false
      );

      await prisma.auditEvent.create({
        data: {
          userId: user.id,
          action: 'USER_LOGIN',
          entity: 'Session',
          entityId: session.id,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        },
      });

      return res.status(200).json({
        success: true,
        message: 'Signed in successfully.',
        data: {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            isVerified: user.isVerified,
            mfaEnabled: user.mfaEnabled,
            createdAt: user.createdAt,
          },
          patientProfile: user.patientProfile,
          memberships: user.memberships,
          session: {
            sessionId: session.id,
            isMfaVerified: session.isMfaVerified,
            expiresAt: session.expiresAt,
          },
        },
      });
    } catch (error) {
      return next(error);
    }
  }
);

// 3. Logout
authRouter.post('/logout', async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.session) {
      await prisma.session.update({
        where: { id: req.session.id },
        data: { revokedAt: new Date() },
      });

      if (req.user) {
        await prisma.auditEvent.create({
          data: {
            userId: req.user.id,
            action: 'USER_LOGOUT',
            entity: 'Session',
            entityId: req.session.id,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
          },
        });
      }
    }

    res.clearCookie(SESSION_COOKIE_NAME, { path: '/' });

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (error) {
    return next(error);
  }
});

// 4. Session Info Endpoint
authRouter.get('/session', async (req: Request, res: Response) => {
  if (!req.user || !req.session) {
    return res.status(200).json({
      success: true,
      data: { authenticated: false, session: null },
    });
  }

  const userMemberships = await prisma.membership.findMany({
    where: { userId: req.user.id },
    include: { organization: true },
  });

  return res.status(200).json({
    success: true,
    data: {
      authenticated: true,
      session: {
        sessionId: req.session.id,
        isMfaVerified: req.session.isMfaVerified,
        activeOrganizationId: req.session.activeOrganizationId,
        activeFacilityId: req.session.activeFacilityId,
        expiresAt: req.session.expiresAt,
      },
      user: {
        id: req.user.id,
        email: req.user.email,
        fullName: req.user.fullName,
        phoneNumber: req.user.phoneNumber,
        role: req.user.role,
        isVerified: req.user.isVerified,
        mfaEnabled: req.user.mfaEnabled,
        createdAt: req.user.createdAt,
      },
      patientProfile: req.patientProfile || null,
      memberships: userMemberships,
    },
  });
});

// 5. Verify Email
authRouter.post('/email/verify', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = VerifyEmailSchema.parse(req.body);
    const tokenHash = AuthService.hashToken(token);

    const record = await prisma.emailVerificationToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!record || record.usedAt || new Date() > record.expiresAt) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_OR_EXPIRED_TOKEN',
          message: 'Email verification token is invalid, used, or expired.',
        },
      });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { isVerified: true },
      }),
      prisma.emailVerificationToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
      prisma.auditEvent.create({
        data: {
          userId: record.userId,
          action: 'EMAIL_VERIFIED',
          entity: 'User',
          entityId: record.userId,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Email address verified successfully!',
    });
  } catch (error) {
    return next(error);
  }
});

// 6. Resend Email Verification
authRouter.post('/email/verification/resend', rateLimiter(), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = ResendVerificationSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (user && !user.isVerified) {
      const rawToken = AuthService.generateRandomToken(32);
      const tokenHash = AuthService.hashToken(rawToken);
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await prisma.emailVerificationToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      });

      await EmailService.sendVerificationEmail(user.email, rawToken);
    }

    // Generic response to prevent account enumeration
    return res.status(200).json({
      success: true,
      message: 'If an unverified account exists for this email, a verification link has been sent.',
    });
  } catch (error) {
    return next(error);
  }
});

// 7. Forgot Password
authRouter.post('/password/forgot', rateLimiter(), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = ForgotPasswordSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (user) {
      const rawToken = AuthService.generateRandomToken(32);
      const tokenHash = AuthService.hashToken(rawToken);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      });

      await EmailService.sendPasswordResetEmail(user.email, rawToken);

      await prisma.auditEvent.create({
        data: {
          userId: user.id,
          action: 'PASSWORD_RESET_REQUESTED',
          entity: 'User',
          entityId: user.id,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        },
      });
    }

    // Generic response to prevent account enumeration
    return res.status(200).json({
      success: true,
      message: `If an account exists for ${email}, password reset instructions have been sent.`,
    });
  } catch (error) {
    return next(error);
  }
});

// 8. Reset Password
authRouter.post('/password/reset', rateLimiter(), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, newPassword } = ResetPasswordSchema.parse(req.body);
    const tokenHash = AuthService.hashToken(token);

    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!resetRecord || resetRecord.usedAt || new Date() > resetRecord.expiresAt) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_OR_EXPIRED_TOKEN',
          message: 'Password reset token is invalid, used, or expired.',
        },
      });
    }

    const passwordHash = await AuthService.hashPassword(newPassword);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRecord.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetRecord.id },
        data: { usedAt: new Date() },
      }),
      // Revoke all existing sessions for security
      prisma.session.updateMany({
        where: { userId: resetRecord.userId },
        data: { revokedAt: new Date() },
      }),
      prisma.auditEvent.create({
        data: {
          userId: resetRecord.userId,
          action: 'PASSWORD_RESET_COMPLETED',
          entity: 'User',
          entityId: resetRecord.userId,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully! Please sign in with your new password.',
    });
  } catch (error) {
    return next(error);
  }
});

// 9. Change Password (Authenticated)
authRouter.post('/password/change', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = ChangePasswordSchema.parse(req.body);
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED' } });
    }

    const isCurrentValid = await AuthService.verifyPassword(user.passwordHash, currentPassword);
    if (!isCurrentValid) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_CURRENT_PASSWORD',
          message: 'The current password provided is incorrect.',
        },
      });
    }

    const newHash = await AuthService.hashPassword(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    await prisma.auditEvent.create({
      data: {
        userId,
        action: 'PASSWORD_CHANGED',
        entity: 'User',
        entityId: userId,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (error) {
    return next(error);
  }
});

// 10. MFA Setup (Initiate)
authRouter.post('/mfa/setup', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user!;
    const secret = AuthService.generateMfaSecret();
    const otpAuthUrl = AuthService.generateMfaOtpAuthUrl(user.email, secret);

    // Temporarily save secret on user until verified
    await prisma.user.update({
      where: { id: user.id },
      data: { mfaSecret: secret },
    });

    return res.status(200).json({
      success: true,
      data: {
        secret,
        otpAuthUrl,
      },
    });
  } catch (error) {
    return next(error);
  }
});

// 11. MFA Verify & Enable
authRouter.post('/mfa/verify', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = MfaVerifySchema.parse(req.body);
    const user = req.user!;

    if (!user.mfaSecret) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MFA_NOT_INITIATED',
          message: 'MFA setup has not been initiated.',
        },
      });
    }

    const isValid = AuthService.verifyMfaToken(code, user.mfaSecret);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_MFA_CODE',
          message: 'Invalid MFA verification code.',
        },
      });
    }

    // Generate recovery codes
    const recoveryCodes = AuthService.generateRecoveryCodes(8);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { mfaEnabled: true },
      }),
      prisma.session.update({
        where: { id: req.session!.id },
        data: { isMfaVerified: true },
      }),
      // Store recovery code hashes
      ...recoveryCodes.map((rc) =>
        prisma.mfaRecoveryCode.create({
          data: {
            userId: user.id,
            codeHash: AuthService.hashToken(rc),
          },
        })
      ),
      prisma.auditEvent.create({
        data: {
          userId: user.id,
          action: 'MFA_ENABLED',
          entity: 'User',
          entityId: user.id,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        },
      }),
    ]);

    return res.status(200).json({
      success: true,
      message: 'MFA enabled successfully!',
      data: {
        recoveryCodes,
      },
    });
  } catch (error) {
    return next(error);
  }
});

// 12. MFA Challenge Verify (during sign-in)
authRouter.post('/mfa/challenge', rateLimiter(), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { mfaToken, code } = MfaChallengeSchema.parse(req.body);

    if (!req.session && !mfaToken) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Session or mfaToken required.' },
      });
    }

    // If session exists, verify for current session user
    let user = req.user;
    if (!user && req.session) {
      user = await prisma.user.findUnique({ where: { id: req.session.userId } });
    }

    if (!user || !user.mfaSecret) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_MFA_CHALLENGE', message: 'User or MFA secret not found.' },
      });
    }

    const isValid = AuthService.verifyMfaToken(code, user.mfaSecret);
    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_MFA_CODE', message: 'Invalid MFA verification code.' },
      });
    }

    if (req.session) {
      await prisma.session.update({
        where: { id: req.session.id },
        data: { isMfaVerified: true },
      });
    } else {
      await createSessionAndSetCookie(res, user.id, req.ip, req.headers['user-agent'] as string, true);
    }

    return res.status(200).json({
      success: true,
      message: 'MFA challenge verified successfully.',
    });
  } catch (error) {
    return next(error);
  }
});

// 13. MFA Recovery Code Login
authRouter.post('/mfa/recovery', rateLimiter(), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, recoveryCode } = MfaRecoverySchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials.' },
      });
    }

    const isPassValid = await AuthService.verifyPassword(user.passwordHash, password);
    if (!isPassValid) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials.' },
      });
    }

    const codeHash = AuthService.hashToken(recoveryCode.trim().toUpperCase());

    const unusedCode = await prisma.mfaRecoveryCode.findFirst({
      where: {
        userId: user.id,
        codeHash,
        usedAt: null,
      },
    });

    if (!unusedCode) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_RECOVERY_CODE',
          message: 'The recovery code provided is invalid or has already been used.',
        },
      });
    }

    await prisma.$transaction([
      prisma.mfaRecoveryCode.update({
        where: { id: unusedCode.id },
        data: { usedAt: new Date() },
      }),
      prisma.auditEvent.create({
        data: {
          userId: user.id,
          action: 'MFA_RECOVERY_CODE_USED',
          entity: 'MfaRecoveryCode',
          entityId: unusedCode.id,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        },
      }),
    ]);

    const { session } = await createSessionAndSetCookie(
      res,
      user.id,
      req.ip,
      req.headers['user-agent'] as string,
      true
    );

    return res.status(200).json({
      success: true,
      message: 'Signed in successfully via MFA recovery code.',
      data: {
        sessionId: session.id,
      },
    });
  } catch (error) {
    return next(error);
  }
});
