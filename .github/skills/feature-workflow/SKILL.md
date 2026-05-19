---
name: feature-workflow
description: "Full development workflow for Dataland. Use when: implementing a feature, fixing a bug, or making any planned change end-to-end. Orchestrates: codebase exploration → planning → implementation → testing → commit. Invoke with a description of the change, e.g. '/feature-workflow add export endpoint to qa-service'."
argument-hint: "Describe the feature or fix to implement"
---

# Feature Workflow

End-to-end development workflow for the Dataland monorepo. Guides you from understanding the codebase through to a reviewed, tested, committed change.

## When to Use

- Implementing a new feature
- Fixing a bug
- Making a refactor with non-trivial scope

For single-phase work (e.g. "just write tests" or "just commit"), use the individual prompts instead: `/explore-codebase`, `/plan-changes`, `/create-tests`, `/commit`.

## Phases

Work through each phase in order. Each phase produces an artifact used by the next.

---

### Phase 1 — Explore *(optional)*

**Goal**: Understand the relevant parts of the codebase before planning anything.

**First, check whether `.github/artifacts/<slug>/01-exploration.md` already exists.**

- **If it exists**: Read it, display a summary, and tell the user: *"Found an existing exploration report at `.github/artifacts/<slug>/01-exploration.md`. Using it for planning. Run `/explore-codebase` again if you want to refresh it."* Skip to Phase 2.
- **If it does not exist**: Check for a general exploration report at `.github/artifacts/general-codebase-explore/01-exploration.md`.
  - **If the general report exists**: Read it, display a summary, and tell the user: *"No feature-specific exploration found. Using the general codebase exploration at `.github/artifacts/general-codebase-explore/01-exploration.md`. Run `/explore-codebase <topic>` to create a more targeted report."* Skip to Phase 2.
  - **If neither exists**: Invoke `/explore-codebase` with the change description as input. The prompt will write the report to `.github/artifacts/<slug>/01-exploration.md` and display it in chat. Then ask the user: *"Does this cover all relevant areas? Anything to add before planning?"*

---

### Phase 2 — Plan

**Goal**: Produce a precise, step-by-step implementation plan.

**Invoke the planner subagent** with:
- The original change request
- The Exploration Report from `.github/artifacts/<slug>/01-exploration.md`

Produce: **Implementation Plan** (modules, file list, ordered steps, test plan, risks)

Pause and show the full Implementation Plan. Ask the user: *"Do you approve this plan? Any changes before implementation starts?"*

Do **not** proceed to Phase 3 without explicit approval.

---

### Phase 3 — Implement

**Goal**: Execute the approved plan.

**Invoke the implementer subagent** with the approved Implementation Plan.

The implementer will:
1. Apply each step
2. Run lint/type checks after each file change
3. Run a final compile check per affected module

Produce: **Implementation Report** (steps completed, deviations if any)

If deviations occurred, present them and confirm with the user before continuing.

---

### Phase 4 — Test

**Goal**: Assess coverage, then create/amend tests and run them.

**Invoke the test-engineer subagent** with:
- The list of changed production files from Phase 3
- The test plan section from the Implementation Plan

The test engineer will first produce a **Coverage Assessment**:
- For each changed production file: does a test file already exist?
- For existing test files: which test cases cover the changed code, and which are now stale/missing?
- Verdict per file: `NEW` (no test file exists), `AMEND` (test file exists but needs updates), or `COVERED` (existing tests are sufficient)

Present the Coverage Assessment. Then proceed to create/amend/run as needed.

Produce: **Test Report** (coverage assessment + pass/fail results)

If tests reveal a production bug, loop back to Phase 3 with a targeted fix. Do **not** skip or suppress failing tests.

---

### Phase 5 — Commit

**Goal**: Stage and commit the changes with a well-formed commit message.

**Invoke the commit-agent subagent**.

The commit agent will:
1. Summarize all changed files
2. Draft a commit message following Dataland's conventional commit format
3. **Show the draft and file list — pause for user approval**
4. Upon approval: stage files and commit

Produce: **Commit confirmation** (hash + summary)

---

### Phase 6 — Local Stack Refresh

**Goal**: Apply the committed changes to the running local development stack.

**Invoke the local-stack-refresh skill** with the list of changed modules.

The skill will:
1. Check whether a **full reset** is needed (Flyway migration or Keycloak changes) or a plain restart suffices
2. **Show the proposed command and — if full reset — warn that all local data will be lost. Pause for user approval.**
3. Upon approval — Restart: `./manageLocalStack.sh --stop --start --simple` or Full reset: `./manageLocalStack.sh --reset --simple`
4. Verify the stack is healthy via the actuator endpoint

Produce: **Stack status** (healthy / errors to investigate)

---

## References

- [Coding conventions](../../instructions/coding-conventions.instructions.md)
- [Testing conventions](../../instructions/testing-conventions.instructions.md)
- [PR template](../../pull_request_template.md)
