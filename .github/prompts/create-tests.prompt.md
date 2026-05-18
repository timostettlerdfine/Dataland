---
description: "Create and run test cases for recently implemented code in the Dataland repo. Follows existing test patterns. Runs tests and reports results. Use after implementation is complete."
argument-hint: "List of changed production files, e.g. 'dataland-backend/src/main/kotlin/.../MyService.kt'"
agent: agent
tools: [read, edit, search, execute]
---

Create and run tests for the following changed files in the Dataland monorepo:

**Changed files**: {{input}}

## What to do

1. Read each changed production file to understand what was implemented.
2. Find or create the corresponding test file:
   - Kotlin: `src/test/kotlin/.../<ClassName>Test.kt` in the same module
   - Vue/TS: `dataland-frontend/tests/.../<ComponentName>.cy.ts`
3. Read existing tests in the same module to match patterns and style.
4. Write test cases covering:
   - Happy path / expected behavior
   - Edge cases (null, empty, boundary values)
   - Error/failure scenarios
5. Run the tests:
   - Kotlin: `./gradlew :<module>:test`
   - Frontend: `cd dataland-frontend && npm run testcomponent`
6. Report results.

## Test quality requirements

- Each new public method: at least one test
- Error paths covered
- Test names clearly describe what is being tested (`should return X when Y`)
- No `@ts-nocheck`
- JUnit 5 (`@Test`) — not JUnit 4
- Deterministic — no uncontrolled random data, no real-time assertions without mocking

## If tests fail

- Fix the test if the issue is in the test itself
- If a genuine production bug is found, report it clearly — do **not** silently modify production code
