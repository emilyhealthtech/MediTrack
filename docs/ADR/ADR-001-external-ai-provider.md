# ADR-001: Use an External AI API Provider
**Status:** Proposed — pending due diligence  
**Decision date:** 2026-10-22

## Context
MediTrack intends to use a paid external AI API for administrative assistance. Paid access alone does not establish privacy, non-retention, non-training or legal compliance.

## Decision
Use an external provider only after a documented evaluation. Do not select a vendor in this ADR. The provider must satisfy functional, security, privacy, contractual, operational and cost requirements for the approved data class.

## Required selection criteria
- Contractual training-use terms and available opt-out.
- Retention/deletion behavior for prompts, outputs, abuse monitoring and backups.
- DPA, subprocessors, regions and international-transfer safeguards.
- Encryption, access control, security assurance and breach notification.
- Model stability, version controls, availability, latency, limits and support.
- Cost predictability, usage metering, quotas and budget controls.
- Suitability for structured outputs and required language/task performance.
- Export/termination support and ability to switch providers.

## Consequences
- Provider choice is a release dependency for real patient data.
- The application must not call the provider from the browser.
- Provider claims must be verified against contract, configuration and evidence.
- If no candidate meets requirements, defer patient-data features or redesign the data flow; do not silently lower safeguards.

## Revisit when
Contract terms, processing regions, model behavior, pricing or intended data classes change.
