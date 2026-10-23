# Authorization & Multi-Tenant Isolation — MediTrack

## 1. Principles of Tenancy
- **Decoupled Identity:** Users and identities exist independently of organizations. A single user can hold memberships across multiple healthcare organizations.
- **Organization Ownership:** All clinical records (facilities, appointments, subscriptions, connections) belong strictly to an `Organization`.
- **Server-Side Validation:** Client-supplied organization IDs, facility IDs, or patient IDs are NEVER trusted as proof of permission. Every protected endpoint evaluates server-side memberships.
- **Active Context:** Users explicitly select an active organization context (`POST /api/v1/me/active-context`). The server validates that the user possesses a valid `Membership` in that organization before setting `session.activeOrganizationId`.

## 2. Membership Roles & Permissions
- **SYSTEM_ADMIN:** Platform administrator with global review and approval authority over organization applications.
- **FACILITY_ADMIN:** Practice manager with full administrative privileges within their specific organization (inviting staff, managing facilities).
- **FACILITY_STAFF:** Clinical/administrative staff member with operational privileges within their assigned organization.
- **PATIENT:** Self-registered user with access to their own profile, public facility search, and connection requests.

## 3. Patient Record Verification
- A patient self-registering or requesting a facility connection (`POST /api/v1/patients/facility-connections`) is NOT automatically linked to existing clinical records solely by matching name or email.
- Facility administrators must perform documented verification before associating historic medical records with a patient account.
