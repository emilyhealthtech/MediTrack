import { db } from '@meditrack/database';
import { logger } from '../logger.js';

export interface EmailOptions {
  to: string;
  subject: string;
  bodyText: string;
  bodyHtml?: string;
}

export class EmailService {
  static async sendEmail(options: EmailOptions): Promise<boolean> {
    const isProd = process.env.NODE_ENV === 'production';

    logger.info(
      {
        recipient: options.to,
        subject: options.subject,
        isProduction: isProd,
      },
      'Email Dispatch Requested'
    );

    try {
      await db.notification.create({
        data: {
          recipient: options.to,
          channel: 'EMAIL',
          subject: options.subject,
          content: options.bodyText,
          isSent: true,
          sentAt: new Date(),
        },
      });

      if (!isProd) {
        logger.info(
          {
            to: options.to,
            subject: options.subject,
            body: options.bodyText,
          },
          '[DEV EMAIL SERVICE] Email dispatched successfully to console/log'
        );
      }

      return true;
    } catch (err: any) {
      logger.error({ error: err.message, recipient: options.to }, 'Email Dispatch Failed');
      return false;
    }
  }

  static async sendVerificationEmail(email: string, rawToken: string): Promise<boolean> {
    const verifyUrl = `${process.env.CORS_ORIGIN || 'http://localhost:3000'}/auth/verify-email?token=${rawToken}`;
    return this.sendEmail({
      to: email,
      subject: 'Verify your MediTrack Account Email',
      bodyText: `Welcome to MediTrack! Please verify your email address by opening the following link: ${verifyUrl}`,
    });
  }

  static async sendPasswordResetEmail(email: string, rawToken: string): Promise<boolean> {
    const resetUrl = `${process.env.CORS_ORIGIN || 'http://localhost:3000'}/auth/reset-password?token=${rawToken}`;
    return this.sendEmail({
      to: email,
      subject: 'MediTrack Password Reset Request',
      bodyText: `You requested a password reset for your MediTrack account. Use this link within 1 hour: ${resetUrl}`,
    });
  }

  static async sendStaffInvitationEmail(
    email: string,
    rawToken: string,
    organizationName: string,
    role: string
  ): Promise<boolean> {
    const inviteUrl = `${process.env.CORS_ORIGIN || 'http://localhost:3000'}/invitations/accept?token=${rawToken}`;
    return this.sendEmail({
      to: email,
      subject: `Invitation to join ${organizationName} on MediTrack`,
      bodyText: `You have been invited to join ${organizationName} as ${role}. Accept your invitation here: ${inviteUrl}`,
    });
  }

  static async sendOrgApplicationStatusEmail(
    email: string,
    orgName: string,
    status: 'APPROVED' | 'REJECTED',
    notes?: string
  ): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: `MediTrack Organization Application Status: ${status}`,
      bodyText: `Your organization application for "${orgName}" has been ${status.toLowerCase()}.${
        notes ? ` Notes: ${notes}` : ''
      }`,
    });
  }
}
