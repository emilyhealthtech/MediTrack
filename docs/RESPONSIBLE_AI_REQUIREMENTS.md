# Responsible AI Requirements
**Status:** Proposed requirements for design review and implementation tracking

## 1. Governing principle
“AI assists. Authorized humans decide. The application backend enforces permissions and business rules.” AI is an administrative assistant, not an autonomous clinician or an authority over patient records.

## 2. Requirement register

| ID | Requirement | Verification |
|---|---|---|
| RAI-001 | AI is optional; core workflows operate with AI disabled | Feature-off and provider-outage tests |
| RAI-002 | Every tool call enforces server-side authentication, authorization and tenant scope | Unit/integration and cross-tenant negative tests |
| RAI-003 | Model cannot query database directly or choose arbitrary tools | Architecture/code review; tool allowlist tests |
| RAI-004 | Only approved minimum-necessary context may leave the application | Payload inspection and privacy review |
| RAI-005 | Direct identifiers are omitted unless necessary and approved | Data-flow review and test fixtures |
| RAI-006 | Pseudonymized data is still handled as potentially personal data | Privacy assessment |
| RAI-007 | Provider training, retention, deletion, subprocessors and transfers are verified before real-data use | Contract/configuration checklist signed off |
| RAI-008 | AI output is schema-validated and treated as untrusted input | Invalid-output tests |
| RAI-009 | Patient summaries cite verified source records and state when information is missing | Evaluation and UI review |
| RAI-010 | Generated summaries are visibly labelled AI-generated | UI acceptance test |
| RAI-011 | AI-generated content never silently overwrites authoritative records | Write-path and database audit tests |
| RAI-012 | Mutating AI actions require valid confirmation under the default MVP policy | Confirmation bypass tests |
| RAI-013 | Confirmation is bound to actor, tenant, target, payload, expiry and one-time nonce | Tampering/replay tests |
| RAI-014 | All writes re-check permissions and domain rules at execution time | Integration tests |
| RAI-015 | Prompt injection in records cannot expand tool permissions | Red-team tests |
| RAI-016 | Logs exclude raw records, sensitive prompts and secrets by default | Log scanning tests |
| RAI-017 | AI usage, latency, errors and cost are monitored without logging unnecessary content | Observability review |
| RAI-018 | Quotas, timeouts and bounded retries prevent runaway cost and retry storms | Load/failure tests |
| RAI-019 | Patient-facing AI, if later introduced, receives separate safety and privacy review | Release gate |
| RAI-020 | AI diagnosis, autonomous prescribing and autonomous clinical decision-making remain out of MVP scope | Product scope and test review |
| RAI-021 | Users can correct or challenge AI summaries and report errors | UX review |
| RAI-022 | Staff are told when content is AI-generated and trained on limitations | Training and release checklist |
| RAI-023 | AI changes are versioned and evaluated before rollout | Prompt/model change workflow |
| RAI-024 | Data retention/deletion policies cover interaction metadata, proposals, logs and backups | Privacy and operations review |

## 3. Transparency and user experience
- Identify AI-generated text clearly.
- Explain when an answer is based on retrieved application data and link to authorized sources where practical.
- Do not imply certainty when data is incomplete or ambiguous.
- Ask for clarification when patient identity or appointment intent is ambiguous.
- Provide an accessible route to use the standard workflow instead.
- Provide a feedback/correction route for staff.
- Avoid anthropomorphic claims that imply clinical authority or guaranteed accuracy.

## 4. Privacy-by-design controls
- Establish purpose and lawful basis before processing personal data.
- Minimize fields, records, retention and recipients.
- Review controller/processor roles and provider contracts.
- Assess international transfer implications and processing regions.
- Define data-subject request, deletion and breach-response procedures.
- Use synthetic data for development and testing by default.
- Apply least privilege to operational/support access.
- Do not reuse patient data to improve models unless separately assessed, legally supported, transparently disclosed and contractually controlled.

## 5. Human oversight policy
- Booking, cancellation, rescheduling and external dispatch: explicit user confirmation in MVP.
- Read-only schedule summaries and administrative drafts: authorized user can review before use.
- Patient history summaries: source-grounded, AI-labelled, and reviewed before being copied into any consequential workflow.
- Ambiguous patient identity, missing critical details or inconsistent source records: stop and ask a human.
- Suspected clinical emergency or clinical decision request: do not provide diagnosis/treatment; direct the user to established clinical processes.

## 6. Nigeria legal and compliance review
The Nigeria Data Protection Act 2023 and applicable NDPC regulations/guidance must be assessed for the real processing context. Health data needs heightened safeguards. A qualified privacy/legal professional should determine lawful basis, transparency, data-subject rights, DPIA requirements, controller/processor allocation, security/breach obligations and international transfer conditions. Applicable professional confidentiality and sector-specific record obligations also require review.

This document is not legal advice and does not certify compliance. Compliance must be demonstrated through documented assessments, contracts, controls, evidence and operational practice.
