# Dataland Codebase — Exploration Report

**Topic:** General codebase explore

---

## 1. Relevant Modules

| Module | Role |
|---|---|
| `dataland-backend` | Core data platform: companies, framework datasets, data points, metadata, export |
| `dataland-backend-utils` | Shared Kotlin utilities, OpenAPI doc annotations, exception types, Keycloak auth helpers |
| `dataland-qa-service` | Quality-assurance workflows for datasets and data points; reviewer queue |
| `dataland-community-manager` | Data requests, company roles/rights, portfolio access, inherited-roles |
| `dataland-user-service` | User portfolios (CRUD, sharing, monitoring) |
| `dataland-api-key-manager` | API key generation, validation, revocation |
| `dataland-document-manager` | Document upload/download, metadata management |
| `dataland-data-sourcing-service` | Data-sourcing pipeline: requests, state machine, provider assignment |
| `dataland-internal-storage` | Backend-facing document storage adapter (OpenAPI client consumed by backend) |
| `dataland-external-storage` | External/EuroDaT storage adapter |
| `dataland-specification-lib` / `dataland-specification-service` | Framework specifications (JSON schema per framework) |
| `dataland-message-queue-utils` | RabbitMQ exchange/queue name constants + `CloudEventMessageHandler` |
| `dataland-keycloak-adapter` | `DatalandAuthentication`, `DatalandRealmRole`, JWT-auth Spring integration |
| `dataland-framework-toolbox` | Code-generation tooling for framework model classes |
| `dataland-batch-manager` | Batch-processing orchestration |
| `dataland-email-service` | Email dispatch (triggered via MQ) |
| `dataland-accounting-service` | Credits / billing |
| `dataland-frontend` | Vue 3 + TypeScript SPA; consumes generated OpenAPI clients for all services |
| `dataland-e2etests` | Kotlin-based E2E test suite (Cypress used separately in `dataland-frontend/tests/`) |

---

## 2. Key Files

### `dataland-backend`

| File | Purpose |
|---|---|
| `dataland-backend/src/main/kotlin/org/dataland/datalandbackend/DatalandBackend.kt` | Spring Boot entry point |
| `dataland-backend/src/main/kotlin/org/dataland/datalandbackend/api/DataApi.kt` | Generic typed REST API for uploading/downloading framework datasets |
| `dataland-backend/src/main/kotlin/org/dataland/datalandbackend/api/MetaDataApi.kt` | REST API for querying dataset metadata, sourceability |
| `dataland-backend/src/main/kotlin/org/dataland/datalandbackend/api/DataPointApi.kt` | REST API for individual data points (upload, retrieve, validate) |
| `dataland-backend/src/main/kotlin/org/dataland/datalandbackend/api/CompanyApi.kt` | Company CRUD, search, identifiers |
| `dataland-backend/src/main/kotlin/org/dataland/datalandbackend/controller/DataController.kt` | Generic dataset controller — upload, download, export jobs |
| `dataland-backend/src/main/kotlin/org/dataland/datalandbackend/controller/MetaDataController.kt` | Metadata search, sourceability, patching |
| `dataland-backend/src/main/kotlin/org/dataland/datalandbackend/controller/DataPointController.kt` | Data-point REST controller |
| `dataland-backend/src/main/kotlin/org/dataland/datalandbackend/controller/CompanyDataController.kt` | Company REST controller |
| `dataland-backend/src/main/kotlin/org/dataland/datalandbackend/services/DataManager.kt` | Core data storage orchestrator; writes metadata to DB, pushes to RabbitMQ |
| `dataland-backend/src/main/kotlin/org/dataland/datalandbackend/services/DataMetaInformationManager.kt` | JPA-backed metadata repository operations |
| `dataland-backend/src/main/kotlin/org/dataland/datalandbackend/services/DataExportService.kt` | CSV / Excel / JSON export logic |
| `dataland-backend/src/main/kotlin/org/dataland/datalandbackend/services/datapoints/AssembledDataManager.kt` | Splits uploaded datasets into individual data points; rebuilds assembled datasets |
| `dataland-backend/src/main/kotlin/org/dataland/datalandbackend/services/SourceabilityDataManager.kt` | Non-sourceability tracking per (company, dataType, reportingPeriod) |
| `dataland-backend/src/main/kotlin/org/dataland/datalandbackend/configurations/OpenAPIConfiguration.kt` | OpenAPI / Swagger-UI config, OAuth flows, served at `/api` |
| `dataland-backend/src/main/kotlin/org/dataland/datalandbackend/frameworks/` | Per-framework data model classes (lksg, sfdr, vsme, eutaxonomy-*, pcaf, nuclear-and-gas) |

### `dataland-qa-service`

| File | Purpose |
|---|---|
| `dataland-qa-service/src/main/kotlin/org/dataland/datalandqaservice/api/QaApi.kt` | Reviewer queue: get pending datasets, change QA status |
| `dataland-qa-service/src/main/kotlin/org/dataland/datalandqaservice/controller/QaController.kt` | QA REST controller |
| `dataland-qa-service/src/main/kotlin/org/dataland/datalandqaservice/services/QaReviewManager.kt` | QA review lifecycle; calls backend OpenAPI client; emits MQ status-change messages |
| `dataland-qa-service/src/main/kotlin/org/dataland/datalandqaservice/api/DataPointQaReportApi.kt` | Data-point-level QA reports API |
| `dataland-qa-service/src/main/kotlin/org/dataland/datalandqaservice/api/DatasetReviewApi.kt` | Dataset review workflow (assign reviewer, approve/reject datapoints, finalize) |
| `dataland-qa-service/src/main/kotlin/org/dataland/datalandqaservice/services/DatasetReviewService.kt` | Dataset review state machine with datapoint-level approval |

### `dataland-community-manager`

| File | Purpose |
|---|---|
| `dataland-community-manager/src/main/kotlin/org/dataland/datalandcommunitymanager/api/RequestApi.kt` | Data requests (bulk/single), aggregated open requests |
| `dataland-community-manager/src/main/kotlin/org/dataland/datalandcommunitymanager/api/CompanyRolesApi.kt` | Company role assignment (Owner, Admin, Uploader, Member) |
| `dataland-community-manager/src/main/kotlin/org/dataland/datalandcommunitymanager/api/CompanyRightsApi.kt` | Company-level rights (admin-only assignment) |
| `dataland-community-manager/src/main/kotlin/org/dataland/datalandcommunitymanager/api/InheritedRolesApi.kt` | Derived roles from company memberships |

### `dataland-user-service`

| File | Purpose |
|---|---|
| `dataland-user-service/src/main/kotlin/org/dataland/datalanduserservice/api/PortfolioApi.kt` | Portfolio CRUD, monitoring toggle |
| `dataland-user-service/src/main/kotlin/org/dataland/datalanduserservice/api/PortfolioSharingApi.kt` | Portfolio sharing between users |

### `dataland-document-manager`

| File | Purpose |
|---|---|
| `dataland-document-manager/src/main/kotlin/org/dataland/documentmanager/api/DocumentApi.kt` | Document upload/download/delete |
| `dataland-document-manager/src/main/kotlin/org/dataland/documentmanager/api/DocumentMetadataApi.kt` | Metadata patch/replace, company ID association |

### `dataland-data-sourcing-service`

| File | Purpose |
|---|---|
| `dataland-data-sourcing-service/src/main/kotlin/org/dataland/datasourcingservice/api/DataSourcingApi.kt` | DataSourcing object lifecycle (state machine, provider assignment) |
| `dataland-data-sourcing-service/src/main/kotlin/org/dataland/datasourcingservice/api/RequestApi.kt` | Data request creation, state patching |
| `dataland-data-sourcing-service/src/main/kotlin/org/dataland/datasourcingservice/api/EnhancedRequestApi.kt` | Admin search across all requests with full sourcing details |

### `dataland-message-queue-utils`

| File | Purpose |
|---|---|
| `dataland-message-queue-utils/src/main/kotlin/org/dataland/datalandmessagequeueutils/constants/ExchangeName.kt` | All RabbitMQ exchange name constants (canonical source of truth) |

### Frontend

| File | Purpose |
|---|---|
| `dataland-frontend/src/services/ApiClients.ts` | Central API client registry; wires all generated OpenAPI clients to Keycloak/Axios |
| `dataland-frontend/src/frameworks/` | Per-framework display logic (sfdr, lksg, vsme, eutaxonomy-*, pcaf, nuclear-and-gas, custom) |
| `dataland-frontend/src/router/` | Vue Router configuration |
| `dataland-frontend/src/components/` | Reusable Vue components |

---

## 3. Architecture Summary

```
Browser (Vue 3 SPA)
       │  HTTP via generated OpenAPI clients
       │
       ▼
Nginx Inbound Proxy  ──── routes by path prefix ──────────────────────────────────
  /api/*           → dataland-backend           (port 8080)
  /qa/*            → dataland-qa-service         (port 8080)
  /community/*     → dataland-community-manager  (port 8080)
  /documents/*     → dataland-document-manager   (port 8080)
  /api-keys/*      → dataland-api-key-manager    (port 8080)
  /users/*         → dataland-user-service       (port 8080)
  /data-sourcing/* → dataland-data-sourcing-service
  /keycloak/*      → Keycloak (realm: datalandsecurity)

Backend Services call each other via generated OpenAPI clients:
  - dataland-qa-service          → dataland-backend (MetaDataControllerApi,
                                     CompanyDataControllerApi, DataPointControllerApi)
  - dataland-qa-service          → dataland-community-manager (InheritedRolesControllerApi)
  - dataland-qa-service          → dataland-specification-service
  - dataland-backend             → dataland-internal-storage (StorageControllerApi)
  - dataland-community-manager   → dataland-backend (CompanyDataControllerApi)

RabbitMQ Exchanges (from ExchangeName.kt):
  backend.datasets               ← published by dataland-backend on dataset upload
  backend.dataPoints             ← published on data point upload/patch
  backend.dataNonSourceable      ← published when dataset marked non-sourceable
  qa-service.dataQuality         ← published by qa-service on QA status change
  internal-storage.itemStored    ← published by internal-storage on persistence
  sendEmail                      ← consumed by dataland-email-service
  user-service.portfolio         ← portfolio monitoring events
  data-sourcing-service.requests ← request lifecycle events

PostgreSQL:
  Two clusters (postgres-v1, postgres-v2)
  Flyway manages migrations per service (baseline-on-migrate)
```

### Dataset upload flow

1. Frontend → `POST /api/{framework}/` → `DataController.postCompanyAssociatedData()`
2. `AssembledDataManager.storeDataset()` splits the JSON into individual data points (one per framework field), validates each against the specification from `dataland-specification-service`
3. `DataManager` persists metadata to PostgreSQL, stores raw data to in-memory temp cache, publishes `backend.datasets` MQ message
4. `dataland-internal-storage` listens, persists data; publishes `internal-storage.itemStored`
5. `dataland-qa-service` listens to MQ, creates a `QaReviewEntity` (status `Pending`)
6. Reviewer calls `POST /qa/datasets/{dataId}` → `QaReviewManager.handleQaChange()` → publishes `qa-service.dataQuality` event → backend sets `QaStatus.Accepted` / `Rejected`

---

## 4. Notable Constraints

### Flyway Migrations Required
- **Every new or changed JPA entity in any backend service requires a Flyway migration.** The backend uses `spring.flyway.baseline-on-migrate=true` with a configurable baseline version (`BACKEND_MIGRATION_BASELINE_VERSION`). Never skip this.
- Each service has its own migration folder (e.g., `dataland-backend/src/main/resources/db/migration/`).

### Generated OpenAPI Clients — Do Not Edit
- All `openApiClient/` directories contain auto-generated code. **Never edit files under these paths.**
- Services consume each other exclusively via these generated clients. Changes to an API contract regenerate all dependents.

### Framework Data Model Changes → ⚠️ REQUIRES OTC
- Framework data model Kotlin classes under `dataland-backend/src/main/kotlin/org/dataland/datalandbackend/frameworks/` are also reflected in the frontend (`dataland-frontend/src/frameworks/`).
- Model changes require:
  1. Updating the Kotlin model class
  2. Updating the frontend framework display definition
  3. Running the **OTC (Over The Counter) deployment procedure**

### Data Point / Assembled Dataset Duality
- Datasets are stored in two modes: *stored* (legacy, raw JSON blob) and *assembled* (decomposed into individual data points per spec leaf). The `AssembledDataManager` handles the newer assembled path. Migration endpoints (`/assembled-dataset-migration/`) exist to convert stored→assembled.

### Security: Spring `@PreAuthorize` everywhere
- All endpoints use Spring Security `@PreAuthorize` with role checks and custom security beans (e.g., `@CompanyRoleChecker`, `@SecurityUtilsService`). Changing endpoint security must account for all these SpEL expressions.

### QA `bypassQa` Flag
- Uploaders with appropriate company roles can pass `bypassQa=true`, which auto-accepts datasets. The `QaBypass` utility produces the corresponding comment and `QaStatus.Accepted` automatically.

---

## 5. Suggested Implementation Entry Points

| Goal | Start Here |
|---|---|
| Add a new framework | `dataland-backend/.../frameworks/` + matching frontend dir + Flyway migration + ⚠️ OTC |
| Add a new API field to an existing framework | Framework model class in `frameworks/` + specification service schema + frontend definition |
| Change dataset upload logic | `DataController.kt` → `AssembledDataManager.kt` |
| Change QA review workflow | `QaController.kt` → `QaReviewManager.kt` |
| Add/change company roles | `CompanyRolesApi.kt` + Flyway migration |
| Change metadata search | `MetaDataController.kt` → `DataMetaInformationManager.kt` |
| Add export format | `DataExportService.kt` |
| Add a new frontend page/route | `dataland-frontend/src/router/` + new component in `components/` or `frameworks/` |
| Add a new API key feature | `ApiKeyAPI.kt` → `ApiKeyController.kt` |
| Add/change RabbitMQ event | `ExchangeName.kt` + corresponding producer + consumer listener |
