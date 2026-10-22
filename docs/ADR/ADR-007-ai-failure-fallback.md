# ADR-007: AI Failure Must Not Break Core Workflows
**Status:** Proposed

## Context
External providers can time out, rate-limit, fail or return invalid output. Retrying a mutation blindly can duplicate effects.

## Decision
AI remains optional. Core patient and appointment workflows continue through normal UI/API paths. Use bounded timeouts and retries, normalized errors, quotas, a kill switch and safe fallback. Mutations are executed only by domain services with idempotency and final state checks.

## Consequences
- Provider failure is surfaced as AI unavailable, not as an invented outcome.
- After an uncertain booking result, query authoritative application state before retry.
- No blind retry for non-idempotent operations.
- Outage, rate-limit, timeout and duplicate-request tests are mandatory.

## Revisit when
Availability goals, provider capabilities or domain transaction behavior change.
