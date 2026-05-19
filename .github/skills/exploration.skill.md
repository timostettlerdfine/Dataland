---
name: Explore Codebase
description: |
  Standalone skill for exploring the Dataland codebase. Read-only analysis of modules, 
  files, architecture, patterns, and constraints. Produces structured exploration report
  saved as markdown for handoff to other agents or user consumption.

type: skill
applyTo: null
tools:
  read: true
  search: true
  edit: false
  execute: false
---

## Purpose

Understand a specific area of the Dataland codebase without making changes. Useful for:
- Learning architecture before planning a change
- Investigating where a feature already exists
- Understanding dependencies between services
- Answering architectural questions

## Workflow

### Input
User provides a query or area of interest:
- `"Where do tabs get registered in the frontend?"`
- `"How does the rate limiting work in API key manager?"`
- `"Show me the accounting service structure"`

### Exploration Steps

1. **Search for relevant files**
   - Use grep_search and file_search to locate modules, components, services
   - Identify key files based on naming patterns (e.g., `*Service.kt`, `*Page.vue`, `*Controller.kt`)

2. **Analyze structure**
   - Read key files to understand organization
   - Map out directory structure for the module/feature
   - Identify entry points (main class, router config, API endpoints)

3. **Document patterns**
   - Note architectural patterns (Spring Boot services, Vue components, database layers)
   - Identify external dependencies (RabbitMQ, database tables, API clients)
   - Flag constraints or special requirements (OTC, migrations, Keycloak integration)

4. **Produce exploration report**
   - Write to: `.github/artifacts/<query-slug>/exploration.md`
   - Include:
     - Module/component summary
     - Key files and their responsibilities
     - Architecture diagram (textual or ASCII)
     - Identified constraints
     - Relevant existing patterns
     - Implementation entry points

### Output Format

Structured markdown report with sections:
```markdown
# Exploration Report: [Query]

## Summary
[2-3 sentence overview]

## Modules/Components
- [Module 1]: [description]
- [Module 2]: [description]

## Key Files
- [path/file.ts]: [responsibility]
- [path/file.kt]: [responsibility]

## Architecture
[Textual description or diagram]

## Patterns & Conventions
- [Pattern 1]
- [Pattern 2]

## Constraints
- [Constraint 1]
- [Constraint 2]

## Implementation Entry Points
- [Where to add features]
- [Configuration files]
- [Test locations]
```

## Examples

```
/explore-codebase Where are frontend routes defined?
/explore-codebase How does the backend authentication flow work?
/explore-codebase Show me the structure of the accounting service
```

## Related Commands

- **Planning based on exploration**: `/plan-changes <description>` (can be run after or independently)
- **Full feature workflow**: `/feature-development-orchestrator <description>` (includes exploration internally)
