# ADR-004: Risk-Based Human Approval for AI Actions
**Status:** Proposed

## Context
AI may propose actions but must not bypass business rules or silently alter operational data.

## Decision
In the MVP, AI-generated booking, cancellation, rescheduling and external message dispatch require explicit confirmation. Read-only retrieval and drafts may return directly after authorization and validation. Patient summaries are labelled AI-generated and must be reviewed before consequential reuse.

Confirmation is bound to the actor, tenant/facility, action, immutable normalized payload, target resource, expiry and one-time nonce. Backend authorization and business rules are rechecked at execution.

## Consequences
- Proposal state, expiry and idempotency must be designed.
- A stale or altered proposal is rejected.
- Product may change approval rules only through documented risk review, not model discretion.

## Revisit when
Usage evidence and a formal risk review support a narrower or broader automation policy.
