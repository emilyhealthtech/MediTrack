# Database Design Specification — MediTrack

## 1. Entity-Relationship Summary

### Core Entities
1. **User:** System identity (`email`, `passwordHash`, `role`).
2. **Organization:** Tenant entity representing a clinic/hospital (`name`, `slug`, `rcNumber`).
3. **Facility:** Physical branch location (`address`, `city`, `state`, `phone`).
4. **Membership:** Links a `User` to an `Organization` with specific permissions.
5. **Patient:** Demographic profile (`dateOfBirth`, `gender`, `bloodGroup`, `genotype`, `emergencyContact`).
6. **Appointment:** Scheduling record (`scheduledAt`, `department`, `status`, `reason`).
7. **SubscriptionPlan & Subscription:** SaaS plan tiering (STARTER, PROFESSIONAL, ENTERPRISE).
8. **AuditEvent:** Security log of user and admin actions.
9. **Notification:** Email/SMS dispatch log.

## 2. Multi-Tenant Partitioning
Every clinical and operational table (`Facility`, `Patient`, `Appointment`, `Subscription`) contains `organizationId` to ensure strict tenant boundaries.
