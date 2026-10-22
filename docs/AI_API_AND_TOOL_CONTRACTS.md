# AI API and Tool Contract Specification
**Status:** Proposed contracts only; not implemented. Route names should be reconciled with existing repository conventions.

## 1. Common rules
- HTTPS only; reuse existing session authentication.
- All endpoints derive actor, organization, facility and permissions from server-side context.
- Use the existing API error envelope and versioning once confirmed.
- Validate request bodies with the project's schema-validation standard.
- Apply per-user/tenant/global rate limits and request-size limits.
- Never accept provider credentials or trusted role/tenant claims from the client.
- Model outputs and tool arguments are untrusted.
- Use correlation IDs. Avoid logging raw patient content.
- Suggested error categories: `400 VALIDATION_ERROR`, `401 UNAUTHENTICATED`, `403 FORBIDDEN`, `404 NOT_FOUND`, `409 CONFLICT`, `410 PROPOSAL_EXPIRED`, `413 REQUEST_TOO_LARGE`, `422 UNSUPPORTED_TASK`, `429 RATE_LIMITED`, `502 AI_PROVIDER_ERROR`, `503 AI_UNAVAILABLE`, `504 AI_TIMEOUT`.

## 2. `POST /api/v1/ai/assist`
**Purpose:** Submit an administrative AI task.

**Authentication:** Existing authenticated session.  
**Authorization:** Feature enabled for tenant; role has access to requested task. Patient-record tasks require record-search/read permission.  
**Human approval:** Depends on task; mutations return a proposal and do not execute directly.  
**Idempotency:** Optional for read-only tasks; required or server-generated correlation for requests that may create a proposal.

Request example:
```json
{
  "task": "appointment.assist",
  "message": "Help me find an appointment next Tuesday afternoon for service X",
  "facilityId": "fac_opaque_id",
  "context": {
    "patientReference": "pat_opaque_id"
  },
  "locale": "en-NG",
  "clientRequestId": "opaque-client-request-id"
}
```
`facilityId` and patient reference are selectors, not proof of access. Backend validates scope. `context` is allowlisted and task-specific; unknown fields are rejected. Avoid including direct identifiers unless required and approved.

Response example:
```json
{
  "interactionId": "aii_opaque_id",
  "status": "completed",
  "task": "appointment.assist",
  "message": "I found two available slots. Please choose one.",
  "suggestions": [
    {
      "type": "appointment_slot",
      "slotReference": "slot_opaque_id",
      "startsAt": "2026-10-27T13:00:00+01:00",
      "endsAt": "2026-10-27T13:30:00+01:00",
      "source": "appointment.availability.read"
    }
  ],
  "actionProposal": null,
  "sources": [],
  "disclaimer": "AI-generated administrative assistance; verify details before confirming."
}
```
Example is illustrative; timestamps and slot data must come from the backend, not the model.

Validation:
- `task` must be an allowlisted task.
- `message` bounded in length and rate-limited.
- `facilityId` must resolve within authenticated membership.
- task-specific fields validated by strict schema.
- reject unsupported clinical requests or redirect to normal clinical workflows.
- response output schema and source references validated before returning.

Audit: task, actor, tenant/facility, tools, source references, status, provider/model metadata, prompt-template version, latency/cost and safety result. No raw prompt by default.

## 3. `GET /api/v1/ai/interactions/:interactionId`
**Purpose:** Retrieve a pending or completed interaction if the system supports asynchronous processing.

**Authentication/authorization:** Same actor/tenant access policy; tenant admins should not automatically gain access to sensitive content without a documented role rule.  
**Response:** interaction status, safe result, approved source references, and error category if failed.  
**Validation:** opaque identifier; verify tenant and actor/role access.  
**Audit:** access to sensitive results.  
**Approval/idempotency:** not applicable.

## 4. `POST /api/v1/ai/action-proposals/:proposalId/confirm`
**Purpose:** Confirm a previously proposed mutating operation.

Request:
```json
{
  "confirmation": true,
  "confirmationNonce": "single-use-opaque-nonce"
}
```
Do not accept a replacement action payload in this endpoint. The authoritative proposal payload is held server-side or integrity-protected and bound to the proposal.

**Authentication:** Active session.  
**Authorization:** Actor must be allowed to execute this action now; verify tenant/facility membership and target resource permission.  
**Validation:** proposal pending, unexpired, not previously consumed, target and relevant version still valid, nonce valid, and business rules pass.  
**Idempotency:** Required. Repeat confirmation must return the original outcome or safe current status, never execute twice.  
**Audit:** confirmation attempt and actor; execution outcome; reason category for rejection.  
**Errors:** `403`, `404`, `409`, `410`, `422`, `503` as applicable.

## 5. `POST /api/v1/ai/action-proposals/:proposalId/reject`
**Purpose:** Reject a pending action proposal.

**Authentication/authorization:** Same policy as confirmation.  
**Request:** optional bounded reason category; no free-form sensitive content required.  
**Validation:** proposal belongs to accessible tenant/context and is pending.  
**Audit:** actor, timestamp, proposal reference and status transition.  
**Idempotency:** Repeated rejection should be safe and not execute action.

## 6. `GET /api/v1/ai/usage`
**Purpose:** Optional organization-level AI usage and estimated cost reporting.

**Authentication:** Existing session.  
**Authorization:** Explicit billing/tenant-admin permission.  
**Response:** period, task counts, token/usage totals when available, estimated cost and limit status. Do not include patient content.  
**Validation:** bounded reporting period.  
**Audit:** administrative usage access.  
**Note:** implement only if usage reporting is a product requirement; reuse existing subscription/billing structures if suitable.

## 7. Internal controlled tool contracts

These tools are internal domain-service functions, not necessarily public HTTP endpoints. The actual function signatures should follow the repository's conventions.

| Tool | Purpose | Required authorization | Side effects |
|---|---|---|---|
| `patient.search` | Search existing patients by approved criteria | Patient search permission; tenant/facility scope | Read; audit sensitive access |
| `patient.history.read` | Retrieve selected historical visits | Patient record read permission | Read; audit |
| `appointment.availability.read` | Get real available slots | Appointment read permission; facility/service scope | Read |
| `appointment.create` | Create booking after confirmation | Appointment create permission; current membership | Write; transaction and idempotency |
| `appointment.cancel.request` | Prepare cancellation | Appointment manage permission | Proposal only |
| `appointment.reschedule.request` | Prepare reschedule | Appointment manage permission | Proposal only |
| `schedule.summary.read` | Summarize authorized schedule | Schedule read permission | Read |
| `admin.incomplete-records.read` | Return missing administrative fields | Specific admin permission | Read |
| `facility.faq.search` | Search approved facility information | Facility-content access | Read |
| `notification.draft.create` | Draft a reminder/confirmation | Appointment access; approved channel/recipient context | Draft only in MVP |

### Tool input/output rules
- Inputs use opaque identifiers and explicit date ranges; do not accept arbitrary SQL or free-form filter expressions.
- Search results are limited and paginated; ambiguous identity returns candidates for user disambiguation, not an automatic choice.
- Historical retrieval returns only authorized fields and bounded records.
- Availability response must include backend-generated slot reference, service, start/end, timezone and expiry/version if applicable.
- Booking requires selected slot reference, verified patient reference, required service/facility fields, idempotency key, and confirmed proposal.
- Cancellation/rescheduling require current appointment reference and version; backend checks policy, status and conflicts.
- All writes use domain services and transactional rules.
- Tools return a typed result or normalized error; model-visible error detail must not reveal protected record existence.

## 8. Example typed response contracts (illustrative TypeScript)
```ts
type AIInteractionStatus =
  | "completed"
  | "needs_clarification"
  | "awaiting_confirmation"
  | "failed";

type AISourceReference = {
  sourceType: "patient" | "visit" | "appointment" | "facility_document";
  sourceId: string; // opaque ID, exposed only if caller is authorized
  label: string;
  recordVersion?: string;
};

type AIActionProposal = {
  proposalId: string;
  actionType: "appointment.create" | "appointment.cancel" | "appointment.reschedule" | "notification.send";
  status: "awaiting_confirmation";
  expiresAt: string;
  summary: string;
};

type AIAssistResponse = {
  interactionId: string;
  status: AIInteractionStatus;
  task: string;
  message: string;
  sources: AISourceReference[];
  actionProposal?: AIActionProposal | null;
  disclaimer: string;
};
```
Do not copy this type into source code without reconciling it with existing API conventions and validation libraries.

## 9. Data minimization and error semantics
- Return only fields needed by the task.
- Distinguish unavailable, undocumented and access-denied information without leaking protected record existence.
- Do not include provider raw errors, prompt text, stack traces or secrets in client errors.
- When provider completion is uncertain, query application state before suggesting that a mutation failed.
