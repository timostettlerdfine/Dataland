---
description: "Plan an implementation for a feature or bugfix in the Dataland repo. Produces a structured plan: affected modules, ordered steps, test plan, and risk flags. Use after exploring the codebase. Produces no code."
argument-hint: "Change request, e.g. 'add CSV export to the QA service' or 'fix null pointer in document retrieval'"
agent: agent
tools: [read, search, todo]
---

Produce a structured **Implementation Plan** for the following change in the Dataland monorepo:

**Change request**: {{input}}

## Plan structure required

### Summary
One paragraph: what changes, in which modules, and why.

### Affected Modules
Table: Module | Change Type (Create/Modify/Delete) | Reason

### Implementation Steps
Numbered, ordered steps. Each step must include:
- `[MODULE]` prefix (e.g. `[dataland-backend]`)
- Action: Create / Modify / Delete
- Exact file path (relative to repo root)
- What to do in 1-2 sentences

### Test Plan
- Backend unit tests: which classes to test, which test file to create/modify
- Frontend component tests (if applicable)
- E2E considerations

### Constraints & Risks
Flag any of:
- `⚠️ DB MIGRATION REQUIRED` — new or changed JPA entity
- `⚠️ GENERATED CODE` — OpenAPI spec changes needed (never edit `openApiClient/` directly)
- `⚠️ BREAKING API CHANGE` — changed endpoint, response body, or error code
- `⚠️ REQUIRES OTC` — framework data model changed
- Risk level: Low / Medium / High with justification

### Open Questions
Anything requiring developer confirmation before starting.

## Constraints to check before planning
- Read `src/main/kotlin/` entry points for affected modules
- Check if the module uses Flyway (`src/main/resources/db/migration/` exists)
- Check if any OpenAPI spec is involved (`src/main/openapi/`)
- Do **not** plan edits to `openApiClient/` generated files
