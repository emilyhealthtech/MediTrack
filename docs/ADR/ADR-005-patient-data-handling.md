# ADR-005: Minimize Patient Data Sent to AI
**Status:** Proposed — privacy review required

## Context
Patient and health information may be sensitive personal data. Pseudonymized data can remain identifiable.

## Decision
Default to sending no direct identifiers and only task-relevant fields. Use opaque references and source facts where practical. Do not send real patient data to an external provider until provider terms, purpose, lawful basis, transfer path, retention and safeguards have been approved by qualified reviewers.

## Consequences
- Data minimization is part of each task contract.
- Patient data must not be used in development/evaluation by default; use synthetic datasets.
- Raw prompts/responses are not retained by default.
- Any exception requires a documented purpose, approval, controls and retention limit.

## Revisit when
New data types, use cases, provider terms or international-transfer conditions arise.
