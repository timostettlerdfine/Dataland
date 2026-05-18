---
description: "Stage changed files and create a git commit with a well-formed conventional commit message. Always pauses for approval before committing. Never pushes."
argument-hint: "Optional: brief description of what was done, used to seed the commit message draft"
agent: agent
tools: [read, execute]
---

Prepare a git commit for the current changes in the Dataland monorepo.

**Context** (optional): {{input}}

## Steps

1. Run `git diff --stat HEAD` to see all modified tracked files.
2. Run `git status` to see untracked files.
3. Read the diff of key changed files to understand what was done.
4. Draft a commit message using Dataland's conventional commit format:

```
<type>(<scope>): <short summary in imperative mood, ≤72 chars>

<optional body — explain WHY, not WHAT, wrap at 72 chars>

<optional footer: BREAKING CHANGE: ..., or closes #issue>
```

**Allowed types**: `feat`, `fix`, `refactor`, `test`, `chore`, `docs`, `style`, `ci`, `build`

**Scope**: primary module affected, e.g. `backend`, `frontend`, `qa-service`, `document-manager`, `e2etests`

5. **Present the draft commit message and the list of files to be staged. Stop and wait for approval.**

6. Only after explicit approval:
   - Stage files: `git add <each file explicitly>`
   - Commit: `git commit -m "<message>"` (or `-F` for multi-line)
   - Report the commit hash and one-line summary

## Hard rules

- **Never `git push`**
- **Never `git commit --no-verify`**
- **Never `git add .`** — stage files explicitly
- If unrelated changes are mixed in, list them separately and ask which to include in this commit
