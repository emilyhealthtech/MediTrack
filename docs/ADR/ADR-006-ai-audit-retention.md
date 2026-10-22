# ADR-006: Audit AI Activity Without Creating a Second Patient Record Store
**Status:** Proposed

## Context
Security and cost monitoring require observability, but full prompts and outputs may duplicate sensitive records.

## Decision
Record minimal structured metadata: actor and tenant context, task, tool/source references, approval, outcome, provider/model and prompt-template versions, latency, usage/cost and safety failures. Do not log full records, raw prompts or full outputs by default. Retention and deletion are defined with privacy/legal owners and customer commitments.

## Consequences
- Redaction and log-access tests are release gates.
- Sensitive source references require access controls.
- Temporary debugging capture requires explicit, time-limited approval.
- Retention policies must cover logs, backups and vendor-held data where contractually possible.

## Revisit when
Audit obligations, incident learnings or monitoring needs change.
