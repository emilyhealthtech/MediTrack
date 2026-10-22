# AI Implementation Roadmap
**Status:** Proposed; documentation only at this stage

## Phase A — Verify baseline and boundaries
**Scope:** Inspect the actual repository, confirm stack, API conventions, auth, tenant model, patient/appointment services, audit pipeline and deployment.  
**Dependencies:** Repository access and product owner.  
**Deliverables:** Architecture baseline checklist; discrepancy log; confirmed module boundaries.  
**Acceptance:** Every established decision is classified as confirmed, changed with rationale, or unresolved.  
**Security/testing:** Map every patient-data path and existing authorization test.  
**Risks:** Current repository may differ from conversation-based baseline.

## Phase B — Privacy, security and provider due diligence
**Scope:** Define data classes, permitted task matrix, minimum fields, role policy, retention, transfer assessment, provider contract and cost ceilings.  
**Dependencies:** Product, security, privacy/legal and healthcare operations review.  
**Deliverables:** Provider scorecard, privacy assessment/DPIA as applicable, data-flow approval, risk owners, release gates.  
**Acceptance:** No real patient data is sent externally until the provider and processing path are approved.  
**Security/testing:** Review terms for training, retention, deletion, regions, subprocessors, breach notice and security assurance.  
**Risks:** Contract or transfer requirements may rule out a candidate provider.

## Phase C — Internal contracts and safe integration foundation
**Scope:** Define provider adapter, orchestration boundary, fixed tool registry, schema validation, quotas, secret handling, metrics, feature flag and fallback.  
**Dependencies:** A/B.  
**Deliverables:** Adapter contract, task policy, provider mock, audit events and test harness.  
**Acceptance:** Mock-provider tests pass; no direct client-provider calls; invalid outputs cannot trigger tools; core flows unaffected with AI disabled.  
**Security/testing:** Secret scanning, request minimization tests, schema fuzzing, timeout/rate-limit tests.  
**Risks:** Over-abstraction; keep implementation minimal and within modular monolith unless justified.

## Phase D — AI Appointment Assistant
**Scope:** Natural-language request interpretation, availability lookup, slot suggestions, booking/cancellation/rescheduling proposals and confirmation.  
**Dependencies:** C and confirmed appointment rules.  
**Deliverables:** Appointment tools, proposal lifecycle, UI and audit trail.  
**Acceptance:** Availability only comes from domain service; mutations require valid confirmation and idempotency; conflicts handled safely.  
**Security/testing:** Race conditions, replay, altered proposal, tenant isolation and revoked permissions.  
**Risks:** Scheduling rules may vary by service/facility.

## Phase E — AI Administrative Assistant
**Scope:** Draft reminders, daily schedule summaries, incomplete-record flags and facility FAQ from approved content.  
**Dependencies:** C; notification and facility content rules.  
**Deliverables:** Draft workflows, authorized summary tools, staff review UI.  
**Acceptance:** Drafts are not dispatched without required approval; only approved facility sources are used; missing data is clearly represented.  
**Security/testing:** Recipient/consent checks, data minimization, output encoding and staff permissions.  
**Risks:** Message content may reveal sensitive information on shared devices.

## Phase F — Authorized patient retrieval and summaries
**Scope:** Patient search, ambiguity handling, historical visit retrieval, source-grounded summaries.  
**Dependencies:** C, approved provider/data path, record permission model, privacy review.  
**Deliverables:** Retrieval tools, source-reference model, AI-labelled summary UI and correction process.  
**Acceptance:** 100% source references resolve to authorized retrieved records; missing facts are not invented; no authoritative record overwritten.  
**Security/testing:** Identity confusion, cross-tenant attempts, injection in notes, output factuality and source correctness.  
**Risks:** Higher sensitivity and consequences than administrative scheduling.

## Phase G — Production readiness and controlled pilot
**Scope:** Evaluation, monitoring, incident response, quotas, rollback, staff training, support process and operational runbooks.  
**Dependencies:** D/E/F as applicable; approved release gates.  
**Deliverables:** Evaluation report, threat-model review, dashboards, incident runbook, release approval and pilot plan.  
**Acceptance:** All blocking gates in the evaluation plan pass; accountable owners accept documented residual risks.  
**Security/testing:** Penetration testing, outage drills, restore test, cost-exhaustion test and log review.  
**Risks:** Model drift, user over-trust and unexpected real-world phrasing.

## Recommended release order
Build and validate the shared safe integration foundation first. Appointment assistance and non-sensitive administrative drafts can be piloted before patient-history summarization, provided they pass the same access and safety gates. Patient-record summarization should be released only after separate privacy, provider and factuality approval. Patient-facing AI is outside the first implementation sequence unless explicitly approved later.
