# ADR-003: Expose Only Narrow, Authorized AI Tools
**Status:** Proposed

## Context
A language model must not receive unrestricted database access or determine its own permissions.

## Decision
The model may request only task-allowlisted, schema-validated backend tools. Tools use existing domain services and independently enforce session actor, tenant/facility scope, resource permissions, validation, business rules and audit events.

## Consequences
- No raw SQL, ORM handle, arbitrary URL, shell, or general-purpose tool access.
- Every read and write must be authorized independently.
- Tool results return minimum-necessary fields.
- Tool tests include cross-tenant, malformed-input and prompt-injection cases.

## Revisit when
New tools or workflows are proposed; each requires a risk and permission review.
