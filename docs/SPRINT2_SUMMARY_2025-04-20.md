 # Project Status – 2025-04-20

 ## Sprint 1 (✅ Complete)
 - Database schema & migrations: initial Prisma schema, `init` migration, `@prisma/client` generated.
 - Auth routes wired to DB: `/signup`, `/login`, `/me` with bcrypt hashing and JWT cookies.
 - Statement upload endpoint: multipart → S3 → BullMQ queue enqueues OCR jobs.
 - Job status polling endpoint: `/jobs/:id` returns BullMQ status.
 - OCR worker skeleton: BullMQ `Worker` stub logging “TODO: OCR” and marking jobs succeeded.
 - Tests: Jest with Prisma/queue stubs; integration test for signup; all tests green.
 - CI pipeline: GitHub Actions workflow runs migrate, lint, and tests on push/PR.

 ## Sprint 2, Milestone 1 (🛠 In Progress)
 - Schema update: added `pages` and `symbolsFound` fields to `Job` model and created `add_job_fields` migration.
 - OCR worker extended:
   - Downloads PDF from S3.
   - Performs OCR via AWS Textract (sync) or Tesseract CLI fallback (`USE_TESSERACT=1`).
   - Parses text blocks to count pages and symbol occurrences.
   - Parses lines matching `<name> <value>` → upserts into `Asset` table (default type “Other”).
   - Updates `Job` record with `status`, `pages`, and `symbolsFound`.
 - TypeScript support: local `.d.ts` declarations for Textract SDK; TS build and existing tests still pass.

 ## Next Steps
 1. **Integration Test**: end-to-end test uploading a sample PDF in `sample_data/`, polling job until `succeeded`, and asserting asset rows created in DB.
 2. **Parsing Refinement**: improve regex and mapping for real statement formats (detect asset type, currency, multi-page statements).
 3. **Sprint 2 Milestones**:
    - Asset/Liability CRUD endpoints with Zod validation.
    - Dashboard UI for net‑worth chart.
    - Retirement goal Monte‑Carlo service and slider.
    - AI coach `/coach/chat` with RAG and rate limits.