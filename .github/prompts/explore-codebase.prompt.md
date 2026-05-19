---
description: "Explore the Dataland codebase to understand a specific area, module, or feature. Returns an exploration report: relevant modules, key files, architecture summary, and constraints. Use before planning any change."
argument-hint: "Area or feature to explore, e.g. 'QA service approval flow' or 'how documents are stored'"
agent: agent
tools: [read, search, edit]
---

Explore the Dataland codebase to produce a structured **Exploration Report** for the following topic:

**Topic**: {{input}}

## What to include in the report

1. **Relevant modules**: Which Gradle modules / frontend areas are involved. Reference the module list in `.github/agents/codebase-explorer.agent.md`.
2. **Key files**: Exact paths with a one-line purpose each (controllers, services, data models, OpenAPI specs, tests).
3. **Architecture summary**: How the pieces connect — API boundaries, data flow, inter-module calls via OpenAPI clients.
4. **Constraints**: Anything a developer must know before changing this area:
   - Flyway migrations required?
   - Generated code (OpenAPI clients) involved?
   - Breaking API changes possible?
   - Framework data model → OTC deployment needed?
5. **Suggested implementation entry points**: Files most likely to be touched.

Be thorough. Read actual source files, don't guess.

## Output

After producing the report:

1. Derive a **slug** from the topic: lowercase, replace spaces and special characters with hyphens, truncate to 50 characters (e.g. `"QA approval flow"` → `qa-approval-flow`).
2. Write the complete Exploration Report to `.github/artifacts/<slug>/01-exploration.md` (create the directory if needed).
3. Display the report in chat.
4. Tell the user the artifact was saved at `.github/artifacts/<slug>/01-exploration.md`.
