---
applyTo: "**/*.kt"
description: "Kotlin coding conventions for the Dataland monorepo. Applied automatically to all .kt files."
---

# Kotlin Coding Conventions — Dataland

## Style

- Formatter: **ktlint** — run `./gradlew ktlintFormat` to fix, `./gradlew ktlintCheck` to validate
- Indentation: 4 spaces (no tabs). Do **not** change indentation unless explicitly asked.
- Max line length: 120 chars (ktlint default)

## Structure

- Package: `org.dataland.<module-name>` — keep consistent with the folder name (hyphens become camelCase)
- One class per file (unless inner classes)
- Use `data class` for DTOs/value objects
- Prefer `val` over `var`; prefer immutability

## Spring Boot

- Controllers use `@RestController` + `@RequestMapping`
- Services annotated with `@Service`
- Inject via constructor injection (not `@Autowired` on fields)
- Use `@Transactional` on service methods that modify the DB, not on controllers

## Database

- JPA entities: annotate with `@Entity`, `@Table`
- Every new entity or schema change **requires a Flyway migration** in `src/main/resources/db/migration/V<n>__<description>.sql`
- Never rename Flyway scripts after they've been applied

## OpenAPI / Generated Code

- API specs live in `src/main/openapi/`
- Never edit files under `openApiClient/` — they are generated
- To change an API contract, edit the OpenAPI spec and regenerate

## Error Handling

- Use Spring's `@ControllerAdvice` / `@ExceptionHandler` for global error handling
- Throw typed exceptions; do not use bare `RuntimeException`
- Log errors at `logger.error(...)` with context; do not swallow exceptions silently

## Logging

- Use `private val logger = LoggerFactory.getLogger(this::class.java)`
- Log at appropriate levels: `debug` for tracing, `info` for lifecycle events, `warn`/`error` for problems
