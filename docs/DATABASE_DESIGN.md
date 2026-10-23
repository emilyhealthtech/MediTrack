# Database Design Specification — MediTrack

## 1. Entity-Relationship Summary

### Core Entities
1. **User:** System identity (`email`, `passwordHash`, `role`, `isVerified`, `mfaEnabled`, `mfaSecret`).
2. **Session:** Session persistence (`tokenHash`, `userId`, `activeOrganizationId`, `activeFacilityId`, `isMfaVerified`, `expiresAt`, `revokedAt`).
3. **EmailVerificationToken & PasswordResetToken:** Single-use account verification and recovery tokens stored as SHA-256 hashes (`tokenHash`, `userId`, `expiresAt`, `usedAt`).
4. **MfaRecoveryCode:** Emergency recovery code hashes (`userId`, `codeHash`, `usedAt`).
5. **OrganizationApplication:** Onboarding request submitted by healthcare facilities (`organizationName`, `slug`, `rcNumber`, `status`, `reviewNotes`, `reviewedByUserId`).
6. **Organization:** Tenant entity representing a clinic/hospital (`name`, `slug`, `rcNumber`, `isVerified`).
7. **Facility:** Physical branch location (`address`, `city`, `state`, `phone`, `email`).
8. **Membership:** Links a `User` to an `Organization` with specific role (`FACILITY_STAFF`, `FACILITY_ADMIN`).
9. **Invitation:** Staff invitation record (`email`, `role`, `tokenHash`, `expiresAt`, `acceptedAt`).
10. **Patient:** Demographic profile (`dateOfBirth`, `gender`, `bloodGroup`, `genotype`, `emergencyContact`, `emergencyContactName`, `emergencyContactPhone`, `emergencyContactRelationship`, `address`, `city`, `state`).
11. **PatientAllergy:** Patient allergy record (`allergen`, `severity`, `reaction`, `source`: PATIENT_ENTERED / CLINICIAN_VERIFIED, `isVerifiedByClinician`, `verifiedByUserId`, `verifiedAt`).
12. **PatientCondition:** Medical condition record (`conditionName`, `diagnosedDate`, `status`: ACTIVE / RESOLVED / CHRONIC, `source`, `isVerifiedByClinician`, `notes`).
13. **PatientMedication:** Prescription/medication record (`medicationName`, `dosage`, `frequency`, `startDate`, `endDate`, `status`: ACTIVE / DISCONTINUED, `source`, `isVerifiedByClinician`).
14. **PatientMedicalHistory:** Medical history entry (`title`, `description`, `eventDate`, `category`: SURGERY / HOSPITALIZATION / IMMUNIZATION / FAMILY_HISTORY / GENERAL, `source`, `isVerifiedByClinician`).
15. **PatientFacilityConnection:** Connection request linking patient to facility (`status`, `verificationNotes`, `requestedAt`).
16. **Appointment:** Scheduling record (`scheduledAt`, `department`, `status`, `reason`).
17. **SubscriptionPlan & Subscription:** SaaS plan tiering (STARTER, PROFESSIONAL, ENTERPRISE).
18. **AuditEvent:** Security log of user, admin, and clinician actions.
19. **Notification:** Email/SMS dispatch log.

## 2. Multi-Tenant Partitioning & Access Rules
Every clinical and operational table (`Facility`, `Patient`, `Appointment`, `Subscription`, `PatientFacilityConnection`) contains `organizationId` or links to `patientId` to ensure strict tenant boundaries and patient-level access controls.
