/**
 * @file types.ts
 * @description Central TypeScript type definitions for the SubTract AI Spend Audit tool.
 * All interfaces, unions, and domain models live here. Import from this file
 * throughout the application — never redeclare types in component files.
 */

// ---------------------------------------------------------------------------
// Primitive union types
// ---------------------------------------------------------------------------

/**
 * The set of AI/coding tools SubTract currently supports for auditing.
 * Extend this union when new tools are added to the pricing catalogue.
 */
export type ToolName =
  | 'cursor'
  | 'github-copilot'
  | 'claude'
  | 'chatgpt'
  | 'anthropic-api'
  | 'openai-api'
  | 'gemini'
  | 'windsurf';

/**
 * Primary use-case the team applies their AI tooling towards.
 * Used to weight recommendations — e.g. a 'coding' team gets stronger
 * Cursor / Copilot signals than a 'writing' team.
 */
export type UseCase = 'coding' | 'writing' | 'data' | 'research' | 'mixed';

/**
 * The category of recommendation the audit engine produces for a single tool.
 *
 * - `downgrade`      — stay with the same vendor, move to a cheaper plan
 * - `switch`         — replace this tool with a cheaper/better alternative
 * - `optimize`       — usage pattern change (seats, billing cycle, etc.)
 * - `already-optimal`— no saving opportunity detected; spending is justified
 * - `flag`           — ambiguous spend that needs human review
 */
export type RecommendationType =
  | 'downgrade'
  | 'switch'
  | 'optimize'
  | 'already-optimal'
  | 'flag';

// ---------------------------------------------------------------------------
// Form / Input models
// ---------------------------------------------------------------------------

/**
 * Represents a single tool entry as entered by the user in the audit form.
 *
 * @property toolName     - Identifier matching the `ToolName` union
 * @property plan         - Human-readable plan name the team is currently on (e.g. "Business")
 * @property monthlySpend - Total monthly cost in USD *for all seats combined*
 * @property seats        - Number of licensed seats / users
 * @property enabled      - Whether this row is active; disabled rows are skipped by the engine
 */
export interface ToolInput {
  toolName: ToolName;
  plan: string;
  monthlySpend: number;
  seats: number;
  enabled: boolean;
}

/**
 * The complete audit form payload submitted by the user.
 *
 * @property tools    - Array of individual tool inputs (at least one required)
 * @property teamSize - Total headcount of the team — used to flag seat-count anomalies
 * @property useCase  - Primary team use-case (influences recommendation weighting)
 */
export interface AuditFormData {
  tools: ToolInput[];
  teamSize: number;
  useCase: UseCase;
}

// ---------------------------------------------------------------------------
// Audit result models
// ---------------------------------------------------------------------------

/**
 * The audit engine's finding for a single tool in the user's stack.
 *
 * @property toolName           - The tool this result corresponds to
 * @property currentSpend       - Monthly spend as entered by the user (USD)
 * @property recommendedAction  - Short imperative string shown in the UI (e.g. "Switch to Windsurf Pro")
 * @property recommendationType - Machine-readable category of the recommendation
 * @property savings            - Monthly savings in USD if the recommendation is followed
 * @property annualSavings      - `savings * 12` — pre-computed for display
 * @property reason             - Detailed human-readable justification for the recommendation
 * @property alternativeTool    - Slug of the suggested replacement tool, if applicable
 * @property alternativePlan    - Name of the suggested plan on the alternative tool, if applicable
 */
export interface ToolAuditResult {
  toolName: ToolName;
  currentSpend: number;
  recommendedAction: string;
  recommendationType: RecommendationType;
  savings: number;
  annualSavings: number;
  reason: string;
  alternativeTool?: string;
  alternativePlan?: string;
}

/**
 * The complete, serialisable result of a SubTract audit session.
 * Persisted to storage (DB / localStorage) and shared via the `/results/[id]` route.
 *
 * @property id                  - Unique identifier (UUID v4) generated at audit time
 * @property formData            - The original user input that produced this result
 * @property toolResults         - Per-tool findings from the audit engine
 * @property totalMonthlySavings - Sum of `savings` across all tool results (USD)
 * @property totalAnnualSavings  - `totalMonthlySavings * 12` — pre-computed for the hero card
 * @property isOptimal           - `true` when no actionable savings were found
 * @property createdAt           - ISO-8601 timestamp of when the audit was run
 */
export interface AuditResult {
  id: string;
  formData: AuditFormData;
  toolResults: ToolAuditResult[];
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  isOptimal: boolean;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Lead capture model
// ---------------------------------------------------------------------------

/**
 * A lead record created when a user submits their contact details after viewing results.
 * Stored server-side and used for Credex outreach.
 *
 * @property id          - Optional server-assigned identifier
 * @property email       - User's business email (required)
 * @property companyName - Optional company / org name
 * @property role        - Optional self-reported job title
 * @property teamSize    - Optional team headcount (may differ from audit `teamSize`)
 * @property auditId     - FK reference to the `AuditResult` that triggered lead capture
 * @property createdAt   - Optional ISO-8601 server timestamp
 */
export interface Lead {
  id?: string;
  email: string;
  companyName?: string;
  role?: string;
  teamSize?: number;
  auditId: string;
  createdAt?: string;
}

// ---------------------------------------------------------------------------
// Shareable / public-safe audit snapshot
// ---------------------------------------------------------------------------

/**
 * A PII-stripped version of `AuditResult` safe to embed in shareable URLs
 * or public API responses. Strips `email` and `companyName` which do not
 * exist on `AuditResult` directly — this Omit is forward-compatible with
 * any future PII fields added to `AuditResult`.
 */
export type ShareableAudit = Omit<AuditResult, 'email' | 'companyName'>;
