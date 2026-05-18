---
applyTo: "**/*Test.kt,**/tests/**/*.ts,**/tests/**/*.cy.ts,**/test/**/*.kt"
description: "Testing conventions for the Dataland monorepo. Applied automatically to all test files."
---

# Testing Conventions — Dataland

## Backend (Kotlin + JUnit 5)

**Framework**: JUnit 5 (`org.junit.jupiter.api.Test`) — never use JUnit 4 annotations

**Mocking**: Mockito via `org.mockito.kotlin` — use `mock<T>()`, `whenever(...)`, `verify(...)`

**Spring integration tests**:
```kotlin
@SpringBootTest(classes = [MyService::class], properties = ["spring.profiles.active=nodb"])
@AutoConfigureMockMvc
class MyControllerTest {
    @Autowired lateinit var mockMvc: MockMvc
}
```

**Unit tests** (no Spring context):
```kotlin
class MyServiceTest {
    private val mockDep: MyDependency = mock()

    @Test
    fun `should return X when Y`() { ... }
}
```

**Naming**: Backtick-style descriptive names — `fun \`should throw exception when input is null\`()`

**File location**: `src/test/kotlin/org/dataland/<module>/` mirroring the production package

**Run**: `./gradlew :<module>:test`

**CI requirement**: New test files must be included in the test container configuration to run in CI.

## Frontend (Cypress)

**Component tests**: `dataland-frontend/tests/component/` — `*.cy.ts`

**E2E tests**: `dataland-frontend/tests/e2e/` and `dataland-e2etests/src/`

**Run component tests**: `cd dataland-frontend && npm run testcomponent`

**No `@ts-nocheck`** in test files

## Test Quality Standards

- Every new public method: at least one test
- Cover: happy path, edge cases (null/empty/boundary), error/failure scenarios
- Tests must be **deterministic** — no uncontrolled randomness, no real-clock assertions without mocking
- Test names must clearly describe the scenario: "should return empty list when no data exists"
- Do not use `Thread.sleep()` — use mocking or awaitility for async
- Do not assert on log output as a proxy for correctness — assert on return values and state

## PR Requirement

Per the PR template: *"At least one test exists testing the new feature"* and new test files must actually run in CI.
