# Dataland — AI Agent Instructions

This file provides global instructions for all AI agents working in the Dataland monorepo. It applies to GitHub Copilot, Claude, and any other AI assistant.

## Project Summary

Dataland is a multi-module monorepo providing a platform for ESG/sustainability data. It consists of ~20 Kotlin/Spring Boot backend services and a Vue 3/TypeScript frontend, orchestrated via Docker Compose.

**Tech stack**:
- Backend: Kotlin, Spring Boot, Gradle (multi-module), JPA/Hibernate, Flyway, RabbitMQ, Keycloak
- Frontend: Vue 3, TypeScript, Vite, Cypress
- Database: PostgreSQL (v1 and v2 clusters)
- Infrastructure: Docker, Nginx (inbound proxies), Loki, Grafana

## Non-Negotiable Rules

1. **Do not change indentation** unless the user explicitly asks.
2. **Do not edit generated OpenAPI client code** under any `openApiClient/` directory.
3. **Do not use `@ts-nocheck`** in any file (frontend or tests).
4. **Do not run `git push`** unless the user explicitly requests it.
5. **Do not `git commit --no-verify`** — pre-commit hooks must run.
6. **Any new or changed JPA entity requires a Flyway migration script** — never skip this.
7. **Framework data model changes require OTC deployment procedure** — flag with `⚠️ REQUIRES OTC`.

## Available Workflow Automation

### Recommended: Multi-Agent Workflow (Modular Approach)

Use the `/feature-workflow` skill for end-to-end feature development with approval gates:

```
/feature-workflow Add rate limiting to API key manager
```

This orchestrates 6 phases with internal agent coordination:
1. **Explore** → Identify affected modules and files
2. **Plan** (approval gate) → Create implementation plan + test strategy  
3. **Review** → Validate plan for completeness and risks
4. **Implement** → Execute approved changes with linting
5. **Test** → Assess coverage, create/amend tests, run them
6. **Commit** (approval gate) → Draft message and create commit
7. **Stack Refresh** (approval gate) → Restart local Docker stack

**Cost**: Multi-agent approach with model specialization (Opus for planning/review, Sonnet for implementation/testing, Haiku for commit)

**Approval gates** at Plan (Phase 2), Commit (Phase 6), and Stack Refresh (Phase 7)

### Alternative: Single-Phase Entry Points

Use these to skip earlier phases or run individual steps:

| Command | Purpose | Reads | Writes |
|---|---|---|---|
| `/explore-codebase <query>` | Explore only (read-only) | codebase | `01-exploration.md` |
| `/plan-changes <description>` | Jump to planning (skips explore) | `01-exploration.md` | `02-plan.md` |
| `/create-tests <file-list>` | Jump to testing (skips plan/implement) | `02-plan.md`, `04-implementation.md` | `05-tests.md` |
| `/commit` | Jump to commit (skips all earlier) | `05-tests.md` | `06-commit.md` |
| `/local-stack-refresh` | Refresh stack only | codebase | (none) |

## Internal Architecture

### Artifact-Based Handoff Pattern

To reduce token costs and enable clean phase separation, the orchestrator workflow uses **markdown artifacts** instead of context inheritance:

```
.github/artifacts/<feature-slug>/
├── 01-exploration.md      (what exists in codebase)
├── 02-plan.md              (implementation plan + test strategy)
├── 03-review.md            (plan validation result)
├── 04-implementation.md    (what was implemented)
├── 05-tests.md             (test execution results)
└── 06-commit.md            (commit hash + message)
```

**Why this pattern?**
- Each phase starts fresh with only relevant artifacts (better token efficiency)
- Previous work is saved on disk (resilient; if one phase fails, we don't lose earlier context)
- Debuggable (audit exactly what each phase saw)
- Enables human inspection between phases if needed

### Internal Agents (Called by Orchestrator)

These agents are **not invoked directly by users**, but run internally when using `/feature-development-orchestrator`:

| Agent | Model | Reads | Writes | Purpose |
|---|---|---|---|---|
| Planner | `claude-opus-4-6` | Exploration (if exists) | `02-plan.md` | Create detailed plan with test strategy |
| Plan Reviewer | `claude-opus-4-6` | `02-plan.md` | `03-review.md` | Validate plan completeness and risk |
| Implementer | `claude-sonnet-4-6` | `02-plan.md`, `03-review.md` | `04-implementation.md` | Execute approved plan |
| Test Engineer | `claude-sonnet-4-6` | `02-plan.md`, `04-implementation.md` | `05-tests.md` | Implement test strategy, assess coverage |
| Commit Agent | `claude-haiku-4-5` | `05-tests.md` | `06-commit.md` | Draft message and stage files |

**Model assignment rationale:**
- **Opus** for planning and review: Complex reasoning about architecture and edge cases
- **Sonnet** for implementation and testing: Good code quality, faster execution, reasonable cost balance
- **Haiku** for commits: Straightforward message formatting, minimal reasoning needed

### Skills (User-Invocable or Used by Orchestrator)

| Skill | Used by | Purpose |
|---|---|---|
| `exploration.skill.md` | User via `/explore-codebase` or Orchestrator Phase 1 | Read-only codebase analysis |
| `local-stack-refresh.skill.md` | User via `/local-stack-refresh` or Orchestrator Phase 7 | Refresh Docker stack after changes |

## Code Quality Gates

Before declaring any implementation complete:
- Kotlin: `./gradlew :<module>:ktlintCheck` and `./gradlew :<module>:compileKotlin`
- TypeScript/Vue: `cd dataland-frontend && npm run lintci && npm run typecheck`
- Tests must pass: `./gradlew :<module>:test` or `npm run testcomponent`

## PR Checklist (from `.github/pull_request_template.md`)

Key items the AI must help satisfy:
- At least one test for every new feature
- New test files included in CI test container
- No breaking API changes without team alignment
- DB entity changes have migration scripts
- Release notes understandable to a non-technical audience
