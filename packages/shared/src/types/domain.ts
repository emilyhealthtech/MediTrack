export type UserRole = 'PATIENT' | 'FACILITY_STAFF' | 'FACILITY_ADMIN' | 'SYSTEM_ADMIN';

export type AppointmentStatus = 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export type SubscriptionPlanTier = 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';

export type HealthInfoSource = 'PATIENT_ENTERED' | 'CLINICIAN_VERIFIED';

export type AllergySeverity = 'MILD' | 'MODERATE' | 'SEVERE' | 'LIFE_THREATENING';

export type ConditionStatus = 'ACTIVE' | 'RESOLVED' | 'CHRONIC';

export type MedicationStatus = 'ACTIVE' | 'DISCONTINUED';

export type MedicalHistoryCategory = 'SURGERY' | 'HOSPITALIZATION' | 'IMMUNIZATION' | 'FAMILY_HISTORY' | 'GENERAL';

export interface UserDTO {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  phoneNumber?: string | null;
  createdAt: Date;
}

export interface OrganizationDTO {
  id: string;
  name: string;
  slug: string;
  rcNumber?: string;
  createdAt: Date;
}

export interface PatientCompletionStatusDTO {
  isComplete: boolean;
  completionPercentage: number;
  missingFields: string[];
}

export interface PatientProfileDTO {
  id: string;
  userId: string;
  organizationId?: string | null;
  fullName: string;
  email: string;
  phoneNumber?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  bloodGroup?: string | null;
  genotype?: string | null;
  emergencyContact?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  emergencyContactRelationship?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  completionStatus: PatientCompletionStatusDTO;
  createdAt: Date;
  updatedAt: Date;
}

export interface PatientAllergyDTO {
  id: string;
  patientId: string;
  allergen: string;
  severity: AllergySeverity;
  reaction?: string | null;
  source: HealthInfoSource;
  isVerifiedByClinician: boolean;
  verifiedByUserId?: string | null;
  verifiedAt?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PatientConditionDTO {
  id: string;
  patientId: string;
  conditionName: string;
  diagnosedDate?: string | null;
  status: ConditionStatus;
  source: HealthInfoSource;
  isVerifiedByClinician: boolean;
  verifiedByUserId?: string | null;
  verifiedAt?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PatientMedicationDTO {
  id: string;
  patientId: string;
  medicationName: string;
  dosage?: string | null;
  frequency?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  status: MedicationStatus;
  source: HealthInfoSource;
  isVerifiedByClinician: boolean;
  verifiedByUserId?: string | null;
  verifiedAt?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PatientMedicalHistoryDTO {
  id: string;
  patientId: string;
  title: string;
  description?: string | null;
  eventDate?: string | null;
  category: MedicalHistoryCategory;
  source: HealthInfoSource;
  isVerifiedByClinician: boolean;
  verifiedByUserId?: string | null;
  verifiedAt?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PatientHealthProfileDTO {
  patientId: string;
  allergies: PatientAllergyDTO[];
  conditions: PatientConditionDTO[];
  medications: PatientMedicationDTO[];
  medicalHistory: PatientMedicalHistoryDTO[];
}

export interface PatientDashboardDTO {
  profile: PatientProfileDTO;
  completionStatus: PatientCompletionStatusDTO;
  healthSummary: {
    allergiesCount: number;
    conditionsCount: number;
    medicationsCount: number;
    unverifiedCount: number;
  };
  upcomingAppointments: any[];
  notifications: any[];
  facilityConnectionsCount: number;
}

export interface AnalyticsSummaryStats {
  totalRegisteredPatients: number;
  newPatients: number;
  totalAppointments: number;
  completedAppointments: number;
  pendingAppointments: number;
  cancelledAppointments: number;
  missedAppointments: number;
  activeHealthcareProviders: number;
}

export interface TimeSeriesPoint {
  date: string; // ISO date or formatted period e.g. "2025-05-01" or "2025-W20"
  label: string;
  count: number;
}

export interface DemographicsDistribution {
  gender: {
    male: number;
    female: number;
    other: number;
    unspecified: number;
  };
  ageGroups: {
    group: string;
    count: number;
    percentage: number;
  }[];
}

export interface DepartmentPerformance {
  department: string;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  completionRate: number;
}

export interface RequestedServiceStat {
  service: string;
  type: 'department' | 'consultationMode';
  count: number;
  percentage: number;
}

export interface AppointmentVisitStatistics {
  overallCompletionRate: number;
  overallCancellationRate: number;
  overallNoShowRate: number;
  averageDurationMinutes: number;
  modeDistribution: {
    inPerson: number;
    virtual: number;
    telephone: number;
  };
}

export interface ProviderActivityStat {
  providerId: string;
  providerName: string;
  email: string;
  totalAppointments: number;
  completedAppointments: number;
  scheduledAppointments: number;
  completionRate: number;
}

export interface AnalyticsDashboardDTO {
  organizationId: string;
  organizationName: string;
  period: {
    startDate: string;
    endDate: string;
    granularity: 'daily' | 'weekly' | 'monthly' | 'yearly';
  };
  summaryStats: AnalyticsSummaryStats;
  patientRegistrationTrends: TimeSeriesPoint[];
  appointmentTrends: {
    total: TimeSeriesPoint[];
    completed: TimeSeriesPoint[];
    cancelled: TimeSeriesPoint[];
    missed: TimeSeriesPoint[];
  };
  patientDemographics: DemographicsDistribution;
  departmentPerformance: DepartmentPerformance[];
  mostRequestedServices: RequestedServiceStat[];
  visitStatistics: AppointmentVisitStatistics;
  providerActivity: ProviderActivityStat[];
}
