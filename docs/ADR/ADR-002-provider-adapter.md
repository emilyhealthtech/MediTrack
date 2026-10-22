# ADR-002: Isolate the AI Provider Behind an Adapter
**Status:** Proposed

## Context
Core domain logic should not depend on a provider-specific SDK, request schema or error model.

## Decision
Define a small internal provider-adapter contract in the existing backend architecture. The adapter translates normalized task inputs to provider requests and normalizes outputs, usage, timeouts and errors. Keep orchestration and domain rules outside provider-specific code.

## Consequences
- A provider can be replaced without rewriting appointment or patient services.
- Adapter contract tests are required.
- Avoid a generic multi-provider framework until a second provider or routing requirement exists.
- Provider-specific capabilities must be represented explicitly; unsupported behavior must fail safely.

## Revisit when
A second provider, multi-region routing or a concrete resilience requirement justifies additional complexity.
