export type UserRole = 'PATIENT' | 'FACILITY_STAFF' | 'FACILITY_ADMIN' | 'SYSTEM_ADMIN';

export type AppointmentStatus = 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export type SubscriptionPlanTier = 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';

export interface UserDTO {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  createdAt: Date;
}

export interface OrganizationDTO {
  id: string;
  name: string;
  slug: string;
  rcNumber?: string;
  createdAt: Date;
}
