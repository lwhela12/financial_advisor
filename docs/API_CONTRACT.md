# Pocket Financial Advisor – API Contract (v0.1)

| Method | Route | Description | Auth | Returns |
|--------|-------|-------------|------|---------|
| POST   | /api/v1/auth/signup           | Create user account             | —       | 200 user JSON + JWT |
| GET    | /api/v1/accounts             | List user assets & liabilities | Bearer  | 200 Account[]       |
| POST   | /api/v1/statements/upload    | Upload statement PDF/JPEG      | Bearer  | 202 job_id          |
| GET    | /api/v1/jobs/{id}            | Poll OCR/analysis job          | Bearer  | 200 JobStatus       |
| POST   | /api/v1/goals/retirement     | Create or update retirement goal | Bearer | 200 Goal            |
| GET    | /api/v1/coach/chat?query=... | AI coach answer (contextual)   | Bearer  | 200 ChatResponse     |