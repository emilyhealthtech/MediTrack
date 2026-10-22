# MediTrack AI System Design — Change Summary
**Version:** 2.0 proposed documentation package  
**Date:** 2026-10-22

## Review status
- **Reviewed:** Prior system-design decisions summarized in the existing ChatGPT conversation.
- **Repository files inspected:** None could be verified in the available file library; no live repository connection or repository archive was attached.
- **Important limitation:** This is a recreated and extended design based on the conversation baseline, not a verified edit to an existing GitHub file. Reconcile it with the actual repository before implementation.

## Files created in this documentation package
- `SYSTEM_DESIGN.md`
- `AI_ARCHITECTURE_AND_DATA_FLOW.md`
- `AI_THREAT_MODEL.md`
- `AI_API_AND_TOOL_CONTRACTS.md`
- `RESPONSIBLE_AI_REQUIREMENTS.md`
- `AI_EVALUATION_AND_TESTING_PLAN.md`
- `AI_IMPLEMENTATION_ROADMAP.md`
- `ADR/ADR-001-external-ai-provider.md`
- `ADR/ADR-002-provider-adapter.md`
- `ADR/ADR-003-controlled-ai-tools.md`
- `ADR/ADR-004-human-approval.md`
- `ADR/ADR-005-patient-data-handling.md`
- `ADR/ADR-006-ai-audit-retention.md`
- `ADR/ADR-007-ai-failure-fallback.md`

## Existing files updated
None. No repository was accessible to edit, and no original file was overwritten.

## Key decisions proposed
1. Preserve the multi-tenant modular-monolith architecture and existing TypeScript/Node/PostgreSQL direction, subject to repository verification.
2. Keep AI orchestration inside the existing backend boundary initially.
3. Use an external provider only after contractual, security, privacy and transfer due diligence.
4. Keep provider calls behind an adapter.
5. Give the model narrow, allowlisted tools only; no direct database access.
6. Require explicit confirmation for AI-initiated booking, cancellation, rescheduling and external dispatch in MVP.
7. Minimize provider payloads and avoid raw prompt/response logging by default.
8. Keep generated summaries separate from authoritative records.
9. Keep core workflows operational when AI is disabled or unavailable.
10. Exclude diagnosis, prescribing and autonomous clinical decision-making from MVP.

## Unresolved questions
See section 20 of `SYSTEM_DESIGN.md`. Highest priority: actual repository baseline; staff-only vs patient-facing first release; permission matrix; provider contract/regions/retention; privacy/legal assessment; appointment business rules; audit retention; RPO/RTO and cost/latency ceilings.

## Risks requiring review
- A mismatch may exist between this reconstructed baseline and current repository code.
- External processing of health data may require additional contractual and legal safeguards.
- Summaries can omit context even when source references are valid.
- Tenant isolation and confirmation race conditions are high-severity engineering risks.
- Provider model changes can degrade quality.
- User over-trust and sensitive content in reminders require staff training and UX safeguards.

## Implementation status
Documentation only. No API endpoints, database migrations, AI provider integration, UI, or application source code were implemented by this task.
