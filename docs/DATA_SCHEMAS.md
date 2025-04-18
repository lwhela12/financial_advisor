Financial Data Schemas

Recommended repo placement: docs/DATA_SCHEMAS.md

Alt. code placement: keep the TypeScript interfaces under src/models/ (one file per entity) and auto‑emit JSON Schema to schemas/*.schema.json using typescript-json-schema.

⸻

1 · TypeScript Domain Interfaces

// src/models/common.ts
export type CurrencyAmount = number;        // consider smallest‑unit storage (cents)
export type Frequency = 'weekly' | 'monthly' | 'annual' | 'one_off';

// src/models/asset.ts
export type AssetCategory =
  | 'market_investment'
  | 'real_estate'
  | 'primary_residence'
  | 'cash'
  | 'non_investment';

export type TaxStatus = 'taxable' | 'ira' | 'roth';

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  currentValue: CurrencyAmount;             // USD
  taxStatus: TaxStatus;                     // default "taxable" unless account says otherwise
  monthlyContribution?: CurrencyAmount;     // only cash & investment accounts
  createdAt: Date;
  updatedAt: Date;
}

// src/models/liability.ts
export type LiabilityType =
  | 'auto_loan'
  | 'credit_card'
  | 'mortgage'
  | 'line_of_credit';

export interface Liability {
  id: string;
  name: string;
  type: LiabilityType;
  currentBalance: CurrencyAmount;
  interestRate: number;                     // e.g. 0.199 for 19.9 %
  monthlyPayment: CurrencyAmount;
  createdAt: Date;
  updatedAt: Date;
}

// src/models/expense.ts
export interface Expense {
  id: string;
  category: string;                         // user‑defined ("utilities")
  name: string;                             // specific label ("PG&E")
  amount: CurrencyAmount;
  frequency: Frequency;
  createdAt: Date;
  updatedAt: Date;
}

// src/models/income.ts
export interface Income {
  id: string;
  source: string;                           // "salary", "rental"
  amount: CurrencyAmount;
  frequency: Exclude<Frequency, 'one_off'>; // weekly / monthly / annual
  createdAt: Date;
  updatedAt: Date;
}



⸻

2 · Generated JSON Schema (sample)

Asset

{
  "$id": "Asset",
  "type": "object",
  "required": ["id","name","category","currentValue","taxStatus","createdAt","updatedAt"],
  "properties": {
    "id":            { "type": "string", "format": "uuid" },
    "name":          { "type": "string", "minLength": 1 },
    "category":      { "enum": ["market_investment","real_estate","primary_residence","cash","non_investment"] },
    "currentValue":  { "type": "number", "minimum": 0 },
    "taxStatus":     { "enum": ["taxable","ira","roth"] },
    "monthlyContribution": { "type": "number", "minimum": 0 },
    "createdAt":     { "type": "string", "format": "date-time" },
    "updatedAt":     { "type": "string", "format": "date-time" }
  }
}

Liability (pattern)

{
  "$id": "Liability",
  "type": "object",
  "required": ["id","name","type","currentBalance","interestRate","monthlyPayment","createdAt","updatedAt"],
  "properties": {
    "id":            { "type": "string", "format": "uuid" },
    "name":          { "type": "string" },
    "type":          { "enum": ["auto_loan","credit_card","mortgage","line_of_credit"] },
    "currentBalance":{ "type": "number", "minimum": 0 },
    "interestRate":  { "type": "number", "minimum": 0, "maximum": 1 },
    "monthlyPayment":{ "type": "number", "minimum": 0 },
    "createdAt":     { "type": "string", "format": "date-time" },
    "updatedAt":     { "type": "string", "format": "date-time" }
  }
}

Generate the rest (Expense, Income) via CLI:

npx typescript-json-schema tsconfig.json Asset Liability Expense Income \
  --required --topRef --out schemas/



⸻

Tooling Tips
	•	Validation: Ajv (Node), fastjsonschema (Python) or certvalidator (Go).
	•	DB mapping: Use Prisma/Drizzle to convert these types into Postgres tables with enum columns for categories.
	•	Versioning: bump $id and file name (v1, v2) when breaking changes occur; keep migration scripts under migrations/.

⸻

Schemas owner: Lucas Whelan  · Created: Apr 16 2025