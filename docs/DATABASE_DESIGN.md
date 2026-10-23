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
10. **Patient:** Demographic profile (`dateOfBirth`, `gender`, `bloodGroup`, `genotype`, `emergencyContact`).
11. **PatientFacilityConnection:** Connection request linking patient to facility (`status`, `verificationNotes`, `requestedAt`).
12. **Appointment:** Scheduling record (`scheduledAt`, `department`, `status`, `reason`).
13. **SubscriptionPlan & Subscription:** SaaS plan tiering (STARTER, PROFESSIONAL, ENTERPRISE).
14. **AuditEvent:** Security log of user and admin actions.
15. **Notification:** Email/SMS dispatch log.

## 2. Multi-Tenant Partitioning
Every clinical and operational table (`Facility`, `Patient`, `Appointment`, `Subscription`, `PatientFacilityConnection`) contains `organizationId` or `facilityId` to ensure strict tenant boundaries.
