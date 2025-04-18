Project Standards & Contribution Guide

Recommended repo location: docs/STANDARDS.md

This living document codifies how we write, review, test, and ship code in the Pocket Financial Advisor project. Follow it for every pull request.

⸻

1. Directory Structure

/                          # repo root
│
├─ src/                    # application source (front‑ & back‑end)
│   ├─ models/             # TypeScript domain interfaces
│   ├─ services/           # business logic (OCR, Monte Carlo, etc.)
│   ├─ api/                # controllers / route handlers
│   ├─ ui/                 # React Native components (if RN)
│   └─ …
├─ schemas/                # JSON Schema exports (auto‑generated)
├─ sample_data/            # redacted PDFs & fixtures
├─ seed/                   # DB seed scripts
├─ docs/                   # design spec, API contract, this standards doc, etc.
├─ .github/workflows/      # CI definitions
└─ .env.example            # env var template (no secrets!)

2. Language & Tooling

Layer	Language	Lint	Format	Test
Front‑end	TypeScript + React/React Native	ESLint (airbnb‑base + react)	Prettier	Jest + React Testing Library
Back‑end	TypeScript (Node, Express/Fastify)	ESLint (airbnb‑base)	Prettier	Jest + Supertest
Infrastructure	Docker / Terraform	—	—	terratest (future)

Node version: >=20  ·  Package manager: pnpm (faster installs, strict lockfile)

3. Formatting & Linting
	•	Prettier single‑quotes, trailing‑comma‑all, 120‑char print width.
	•	ESLint rules extend eslint-config-airbnb-base with TypeScript plugin.
	•	Husky pre‑commit hook runs pnpm lint + pnpm test:staged.

4. Naming Conventions

Entity	Style	Example
Files & folders	kebab‑case	asset-service.ts
Variables & functions	camelCase	calculateRiskScore
Classes & types	PascalCase	MonteCarloEngine
React components	PascalCase	NetWorthCard.tsx
Enums	PascalCase singular	enum TaxStatus { Taxable, Ira, Roth }

5. Git Workflow
	•	Default branch: main (always deployable)
	•	Feature branches: feat/<short-desc>  ·  Bugfix: fix/…  ·  Docs: docs/…
	•	Commit messages: Conventional Commits (feat:, fix:, docs:, etc.).
	•	Squash‑merge via PR; title becomes commit subject.

6. Pull Request Checklist
	•	Lint passes (pnpm lint)
	•	Unit tests pass (pnpm test)
	•	Added/updated tests for new code paths
	•	Updated relevant docs / schema migrations
	•	No secrets or credentials committed
	•	CI pipeline green

At least one reviewer other than the author must approve.

7. Testing Standards
	•	Unit test coverage ≥ 80 % lines for critical modules (Monte Carlo, OCR parser).(guide rails—flex during POC)
	•	Filename rule: *.spec.ts colocated with source.
	•	Mock external APIs (OpenAI, Plaid) via msw or nock.
	•	Snapshot tests allowed for UI components but keep snapshots under 300 lines.

8. Environment Variables & Secrets
	•	Commit .env.example only.
	•	Real .env files are ignored by Git (*.env* in .gitignore).
	•	Prod secrets injected via hosting provider’s Secrets / Parameters store.
	•	Rotate keys every 90 days where possible.

9. Code Documentation
	•	Use TSDoc comments for all exported functions & classes.
	•	High‑level module README files when logic > 300 LoC.
	•	Architecture Decision Records (ADRs) stored in docs/adr/ using adr-tools.

10. CI / CD Pipeline (GitHub Actions)
	1.	Install → pnpm install --frozen-lockfile
	2.	Lint → pnpm lint
	3.	Test → pnpm test --coverage
	4.	Build → pnpm build
	5.	Deploy (staging on push to main) → Docker image → Fly.io/Vercel.

11. Dependency Management
	•	Keep dependencies minimal; prefer native Node APIs and lightweight libs (e.g., zod over heavier validators).
	•	Use semantic versioning caret ranges (^) for libraries, exact versions for dev tools.
	•	Run pnpm audit weekly (CI scheduled job).

12. Security Practices
	•	Enforce OWASP Top‑10 checks via npm audit + Dependabot.
	•	Enable Snyk scan for container images.
	•	Review any new dependency with > 100 LoC or < 500 weekly downloads.

13. Release & Versioning
	•	App follows SemVer (1.0.0 at first public release).
	•	Each merge to main triggers an auto‑generated changelog from Conventional Commits and bumps version via standard-version (manual oversight allowed during POC).

14. License

Project uses MIT unless overwritten by client requirements. License file lives at repo root.

⸻

Guide owner: Lucas Whelan  · Created: Apr 16 2025  · This document is living—submit PRs for any updates.