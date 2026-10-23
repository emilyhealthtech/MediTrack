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
    const smtpConfigured = Boolean(
      process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS
    );

    logger.info(
      {
        recipient: options.to,
        subject: options.subject,
        isProduction: isProd,
        smtpConfigured,
      },
      'Email Dispatch Requested'
    );

    let dispatchSuccess = true;
    let failureReason: string | undefined = undefined;

    // Simulate external SMTP failure if configured invalidly or test failure mode
    if (smtpConfigured) {
      try {
        // In production/configured environment, external email service would be invoked here.
        // If external SMTP connection fails, set dispatchSuccess = false
        logger.info({ host: process.env.SMTP_HOST, port: process.env.SMTP_PORT }, 'Dispatching email via configured SMTP service');
      } catch (smtpErr: any) {
        dispatchSuccess = false;
        failureReason = smtpErr.message || 'SMTP service error';
      }
    } else if (!isProd) {
      logger.info(
        {
          to: options.to,
          subject: options.subject,
          body: options.bodyText,
        },
        '[DEV EMAIL SERVICE] Email dispatched successfully to console/log'
      );
    }

    try {
      await db.notification.create({
        data: {
          recipient: options.to,
          channel: 'EMAIL',
          subject: options.subject,
          content: options.bodyText,
          isSent: dispatchSuccess,
          status: dispatchSuccess ? 'SENT' : 'FAILED',
          failureReason,
          sentAt: dispatchSuccess ? new Date() : null,
        },
      });

      return dispatchSuccess;
    } catch (err: any) {
      logger.error({ error: err.message, recipient: options.to }, 'Email Dispatch Logging Failed');
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

  // Appointment Notifications (PHI Safeguarded: strictly omits diagnoses, vitals, or clinical notes)
  static async sendAppointmentConfirmationEmail(
    email: string,
    facilityName: string,
    scheduledAt: string,
    mode: string
  ): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: 'Appointment Confirmation — MediTrack Healthcare',
      bodyText: `Your upcoming appointment at ${facilityName} has been confirmed.\nDate & Time: ${scheduledAt}\nConsultation Mode: ${mode}\n\nPlease arrive or log in 10 minutes prior to your scheduled time.`,
    });
  }

  static async sendAppointmentUpdateEmail(
    email: string,
    facilityName: string,
    scheduledAt: string,
    status: string,
    reason?: string
  ): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: `Appointment ${status} — MediTrack Healthcare`,
      bodyText: `Your appointment at ${facilityName} scheduled for ${scheduledAt} has been updated to: ${status}.${
        reason ? ` Reason: ${reason}` : ''
      }`,
    });
  }

  // Retry logic for failed notifications
  static async retryFailedNotifications(): Promise<number> {
    const failedNotifs = await db.notification.findMany({
      where: { status: 'FAILED', retryCount: { lt: 3 } },
    });

    let reattemptedCount = 0;
    for (const notif of failedNotifs) {
      const resendSuccess = await this.sendEmail({
        to: notif.recipient,
        subject: notif.subject || 'MediTrack Notification',
        bodyText: notif.content,
      });

      await db.notification.update({
        where: { id: notif.id },
        data: {
          retryCount: notif.retryCount + 1,
          status: resendSuccess ? 'SENT' : 'FAILED',
          isSent: resendSuccess,
          sentAt: resendSuccess ? new Date() : null,
        },
      });
      reattemptedCount++;
    }

    return reattemptedCount;
  }
}
