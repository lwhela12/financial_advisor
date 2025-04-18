Pocket Financial Advisor – Product Design Document (v0.1)

1. Vision / Elevator Pitch

A friendly, always‑on pocket advisor that translates raw financial data into clear guidance, helping everyday investors make smarter decisions with as little friction as possible.

2. Guiding Principles
	1.	Clarity first – default to plain language; hide complexity until the user asks.
	2.	Coach over guru – nudge, explain, and educate rather than dictate trades.
	3.	Privacy by design – encrypt everything, minimize data collection, no dark patterns.
	4.	Modular & swappable – every integration (OAuth provider, OCR engine, LLM) lives behind an interface so we can swap vendors without rewriting the core.

3. Personas & Jobs‑To‑Be‑Done

Persona	Pain Points	Jobs the App Must Do
Side‑Hustle Sam (35, freelance)	Disorganized accounts, no time to read statements	Aggregate finances, show net‑worth, flag fee drag
Nearing‑Retirement Rita (58, mid‑career)	Unsure if savings will last, nervous about markets	Run retirement projections, translate statements, provide calm commentary
DIY Investor Dev (29, tech worker)	Loves tinkering but drowns in data	Scenario modeling, instant risk metrics, “what‑if” playground

4. MVP Feature Matrix

#	Feature	User Story	Acceptance Criteria
1	Manual Account Entry & Editing	As a user, I can add brokerage, bank, loan, and property accounts	CRUD screens; validation on account type/currency
2	Statement Upload (PDF/Image) + OCR	…so that I can just snap a picture of my statement instead of typing	90%+ key‑field extraction accuracy; auto‑link to existing account or prompt to create new
3	Net‑Worth Dashboard	…so I see my assets, liabilities, and trend over time	Displays current total, 3‑month sparkline, drill‑down per account
4	Retirement Goal Module	…so I know the probability I can retire on $X/mo by Date Y	Monte‑Carlo run ≥1,000 sims, probability %, recommended savings delta
5	Statement Review & Portfolio Analysis	…so I understand fees, risk, diversification	For every holding: expense ratio, beta, sector, style box; overall risk score
6	AI Coach Chat	…so I can ask “pay mortgage or card?” and get contextual advice	Chat retains user context; cites data fields used in reasoning
7	Daily Market Insight	…so I understand headlines without knee‑jerk reactions	Push notification ≤10 AM local with 3‑bullet summary & contextual comment
8	User Auth & Management	…so my data is secure	Email+password (Cognito/Auth0) + OAuth skeleton for future bank linking

5. Wow‑Factor (Stretch) Features
	1.	Interactive Scenario Slider – drag a slider to see how saving +$100/mo changes retirement probability in real time.
	2.	Voice Chat Mode – microphone icon activates speech‑to‑text to query the coach hands‑free.
	3.	Financial Time Machine – replay past months as an animated timeline showing key driver events.
	4.	Fee‑Haul Visualizer – stack‑chart of how much fees erode returns over 30 yrs.
	5.	Goal Celebration AR Confetti – small delight: on hitting savings milestone, phone AR bursts confetti.

6. User Journey (Happy Path)
	1.	Sign‑up → Onboarding quiz (income, age, risk tolerance).
	2.	Add Accounts – manually or via statement upload.
	3.	Dashboard renders net‑worth & “Retirement Probability 78%” chip.
	4.	Coach nudges: “Merge your 401(k) statements for deeper analysis”.
	5.	User uploads statement → OCR → Portfolio analysis card appears.
	6.	User asks: “Should I pay off my 18% credit card?” → Coach responds with quantified impact.

7. Information Architecture & Data Flow (Text Diagram)

Mobile/Web App
   │
   ├─► API Gateway ─► Auth Service (JWT)
   │                 │
   │                 └─► User DB (Postgres)
   ├─► Document Upload Service ─► S3 Bucket
   │                              │
   │                              └─► OCR Lambda ─► Parsed JSON
   ├─► Financial Engine Service (Monte‑Carlo, risk calc)
   ├─► LLM Service (RAG over user vectors + market data)
   └─► Notification Service (digest emails, push)

8. Technical Architecture Details

8.1 Front‑End
	•	Stack: React Native (Expo) or Next.js PWA
	•	Persistent Coach Panel: Bottom sheet chat overlay; context tokens fed from vector store.

8.2 Backend Services (Node or Python Micro‑services)
	•	Auth & User Mgmt: Auth0/Cognito
	•	Data Service: REST/GraphQL, rate‑limited to 50 rps per user
	•	OCR Pipeline: AWS Textract / Google Document AI pluggable adapter
	•	Computation Engine: Python (NumPy, pandas) w/ Monte‑Carlo; scheduled nightly batch
	•	LLM Adapter: Wrapper that can hit OpenAI, Anthropic, or local model via vLLM

8.3 Storage

Data	Store	Notes
Structured user data	Postgres (RDS/Supabase)	ACID, SQL-friendly
Raw documents	S3 (encrypted)	Link with user_id, versioning
Embeddings	pgvector or Pinecone	For RAG context

8.4 Security & Compliance
	•	AES‑256 at rest, TLS 1.3 in transit
	•	Role‑based access (admin, user)
	•	SOC2 roadmap; disclaimers: “Educational only, not investment advice…”

8.5 Non‑Functional Requirements
	•	P95 API latency < 1.5 s
	•	Scales to 10 k users with < $200/mo infra
	•	Offline mode caches last 30 days of data
	•	AA WCAG 2.1 accessibility

9. Integration & OAuth Roadmap

Phase	OAuth Scope
0 (Prototype)	Manual entry + statement OCR only
1	Plaid Link for bank balances & transactions
2	Brokerage OAuth (Fidelity, Schwab) via Plaid Investments Beta
3	Trade execution deep‑links (Schwab OAuth / Apex Clearing)

10. Open Questions / Assumptions
	1.	Will we operate as an RIA in production? Impacts advice wording.
	2.	Which market‑data provider covers our required global ETFs for free tier?
	3.	Do we need multi‑currency support in MVP?
	4.	What Monte‑Carlo engine accuracy is “good enough” for v1?

11. Future Roadmap Milestones

Milestone	Target Date	Notes
Alpha with manual entry & coach chat	Jul 30 2025	Test with 10 users
Beta adding OCR statement ingest	Sep 15 2025	Capture OCR accuracy KPI
OAuth bank linking + push digests	Nov 30 2025	Requires Plaid contract
Public launch v1.0	Feb 2026	Marketing push, App Store submit



⸻

Document owner: Lucas Whelan  ·  Last updated: Apr 16 2025