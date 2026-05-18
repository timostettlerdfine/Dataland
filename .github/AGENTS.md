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

A full development workflow is available via the `/feature-workflow` skill and the following prompts:

| Command | Purpose |
|---|---|
| `/feature-workflow` | Full end-to-end: explore → plan → implement → test → commit → local refresh |
| `/explore-codebase` | Understand a specific area without making changes |
| `/plan-changes` | Produce a structured implementation plan |
| `/create-tests` | Write and run tests for implemented code |
| `/commit` | Draft and create a commit (with approval gate) |
| `/local-stack-refresh` | Rebuild affected Docker images and restart the local stack |

## Subagents

The following subagents are available for orchestration (not user-facing directly):

| Agent file | Role |
|---|---|
| `.github/agents/codebase-explorer.agent.md` | Read-only codebase analysis |
| `.github/agents/planner.agent.md` | Implementation planning (no code) |
| `.github/agents/implementer.agent.md` | Code execution per approved plan |
| `.github/agents/test-engineer.agent.md` | Test creation and execution |
| `.github/agents/commit-agent.agent.md` | Commit preparation with approval gate |

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
