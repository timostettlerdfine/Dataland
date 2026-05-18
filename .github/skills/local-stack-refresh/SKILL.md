---
name: local-stack-refresh
description: "Refresh the local Dataland development stack after code changes. Use when: you have committed or built changes and need to see them running locally. Handles targeted per-service image rebuilds, knows when a full reset is needed (DB migrations, Keycloak changes), and restarts the stack."
argument-hint: "Optional: list of changed modules, e.g. 'dataland-backend dataland-qa-service'"
---

# Local Stack Refresh

Applies your latest code changes to the running local Dataland development stack.

## Stack Overview

The local stack is managed via `./manageLocalStack.sh`. There are two modes:

| Mode | Command | When to use |
|---|---|---|
| **Restart** | `./manageLocalStack.sh --stop --start --simple` | Most changes (backend logic, frontend, API) |
| **Full reset** | `./manageLocalStack.sh --reset --simple` | DB schema changes (Flyway migrations), Keycloak config changes, or corrupt state |

`--start` already handles everything internally: it runs `./gradlew assemble` for all modules and rebuilds all Docker images in parallel (with hash-based caching, so unchanged images are skipped). No manual per-service steps needed.

## Procedure

### Step 1 — Decide: restart or full reset?

Check whether the changes include:
- A new or modified Flyway migration (`src/main/resources/db/migration/`) → **full reset required**
- Keycloak configuration changes → **full reset required**
- Anything else → **restart**

### Step 2 — Present and wait for approval

Show the user the command that will be run and what it does. For a full reset, explicitly state: **"This will wipe all local Docker volumes and data. Confirm to proceed."**

Do **not** run any command until the user approves.

### Step 3a — Restart (upon approval)

```bash
./manageLocalStack.sh --stop --start --simple
```

### Step 3b — Full reset (upon approval)

```bash
./manageLocalStack.sh --reset --simple
```

This wipes Docker volumes, cleans Gradle, reassembles everything, reinitializes Keycloak, and starts fresh. **All local data will be lost.**

### Step 3 — Verify

After restart, confirm the service is healthy:
```bash
curl -s https://local-dev.dataland.com/api/actuator/health | grep -i "UP\|DOWN"
```

Check the service-specific endpoint or UI to confirm the change is live.

## Common Flags for `manageLocalStack.sh`

| Flag | Effect |
|---|---|
| `--simple` | Shortcut: `--dev-env --self-signed-certs --container-backend` (recommended for local dev) |
| `--local-frontend` | Redirects frontend traffic to `localhost` (for `npm run dev`) |
| `--container-backend` | Runs backend in Docker instead of via `./gradlew bootRun` |
| `--reset` | Full wipe and rebuild (implies stop + start) |
| `--stop` | Stop the stack only |
| `--start` | Start the stack only |

## Frontend Development Mode

If you're iterating on the frontend only, skip Docker entirely:
```bash
cd dataland-frontend && npm run dev
```
Then start the stack with `--local-frontend` to route traffic to your local Vite dev server:
```bash
./manageLocalStack.sh --start --simple --local-frontend
```
