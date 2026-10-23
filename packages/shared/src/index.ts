import { z } from 'zod';

export const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform((val) => parseInt(val, 10)).default('3001'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(8, 'JWT_SECRET must be at least 8 chars').default('dev-secret-key-12345'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  FROM_EMAIL: z.string().email().default('no-reply@meditrack.ng'),
});

export type EnvConfig = z.infer<typeof EnvSchema>;

export const ContactFormSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  organizationName: z.string().optional(),
  phone: z.string().optional(),
  subject: z.string().min(2, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters long'),
  consent: z.boolean().refine((val) => val === true, {
    message: 'You must consent to processing your contact request under NDPA rules',
  }),
});

export type ContactFormData = z.infer<typeof ContactFormSchema>;

// Authentication & Account Schemas
export const PatientRegisterSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
  fullName: z.string().min(2, 'Full name is required'),
  phoneNumber: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  emergencyContact: z.string().optional(),
  consent: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the Terms of Service and Privacy Policy',
  }),
});

export type PatientRegisterInput = z.infer<typeof PatientRegisterSchema>;

export const LoginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required'),
  mfaCode: z.string().optional(),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const VerifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

export type VerifyEmailInput = z.infer<typeof VerifyEmailSchema>;

export const ResendVerificationSchema = z.object({
  email: z.string().email('Valid email is required'),
});

export type ResendVerificationInput = z.infer<typeof ResendVerificationSchema>;

export const ForgotPasswordSchema = z.object({
  email: z.string().email('Valid email is required'),
});

export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
});

export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
});

export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;

// MFA Schemas
export const MfaVerifySchema = z.object({
  code: z.string().length(6, 'MFA code must be exactly 6 digits'),
});

export type MfaVerifyInput = z.infer<typeof MfaVerifySchema>;

export const MfaChallengeSchema = z.object({
  mfaToken: z.string().min(1, 'MFA token is required'),
  code: z.string().length(6, 'MFA code must be exactly 6 digits'),
});

export type MfaChallengeInput = z.infer<typeof MfaChallengeSchema>;

export const MfaRecoverySchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(1, 'Password is required'),
  recoveryCode: z.string().min(1, 'Recovery code is required'),
});

export type MfaRecoveryInput = z.infer<typeof MfaRecoverySchema>;

// Organization Application & Review
export const OrganizationApplySchema = z.object({
  organizationName: z.string().min(3, 'Organization name must be at least 3 characters'),
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  rcNumber: z.string().optional(),
  contactName: z.string().min(2, 'Contact name is required'),
  contactEmail: z.string().email('Valid contact email is required'),
  contactPhone: z.string().optional(),
  state: z.string().min(2, 'State is required'),
});

export type OrganizationApplyInput = z.infer<typeof OrganizationApplySchema>;

export const OrganizationReviewSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT']),
  notes: z.string().optional(),
});

export type OrganizationReviewInput = z.infer<typeof OrganizationReviewSchema>;

// Staff Invitations
export const StaffInviteSchema = z.object({
  email: z.string().email('Valid email address is required'),
  role: z.enum(['FACILITY_STAFF', 'FACILITY_ADMIN']),
});

export type StaffInviteInput = z.infer<typeof StaffInviteSchema>;

export const AcceptInviteSchema = z.object({
  token: z.string().min(1, 'Invitation token is required'),
  fullName: z.string().min(2, 'Full name is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
  phoneNumber: z.string().optional(),
});

export type AcceptInviteInput = z.infer<typeof AcceptInviteSchema>;

// Active Context Switching
export const SetActiveContextSchema = z.object({
  organizationId: z.string().min(1, 'Organization ID is required'),
  facilityId: z.string().optional(),
});

export type SetActiveContextInput = z.infer<typeof SetActiveContextSchema>;

// Patient Facility Connections
export const PatientFacilityConnectionSchema = z.object({
  facilityId: z.string().min(1, 'Facility ID is required'),
  verificationNotes: z.string().optional(),
});

export type PatientFacilityConnectionInput = z.infer<typeof PatientFacilityConnectionSchema>;

// API Response Standard Format
export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message?: string;
    details?: unknown;
  };
}

export * from './types/domain.js';
