/**
 * @file pricingData.ts
 * @description Verified pricing data for every AI tool SubTract supports.
 *
 * COMPLIANCE NOTICE:
 * All prices must be manually re-verified against vendor pricing pages before
 * each production release. Update the `verifiedAt` field on every record you touch.
 * Do NOT rely on this data for billing — always link users to the canonical `url`.
 *
 * @verifiedAt 2026-05-20
 */

import type { ToolName } from './types';

// ---------------------------------------------------------------------------
// Type helpers (local — not exported from types.ts to keep the model lean)
// ---------------------------------------------------------------------------

/** A single pricing tier offered by a vendor. */
interface PricingPlan {
  /** Marketing name of the plan as shown on the vendor's pricing page. */
  name: string;
  /**
   * Cost per seat per month in USD.
   * `null` indicates usage-based / pay-per-token billing with no fixed seat price.
   */
  monthlyPerSeat: number | null;
  /**
   * When `true`, pricing is negotiated enterprise-style and cannot be
   * compared directly against other plans. Treat as a `flag` recommendation.
   */
  isCustom?: boolean;
}

/** Full pricing record for a single tool. */
interface ToolPricing {
  /** All publicly listed plans, ordered cheapest → most expensive. */
  plans: PricingPlan[];
  /** Canonical vendor pricing page URL. Always surface this to the user. */
  url: string;
  /**
   * ISO-8601 date (YYYY-MM-DD) on which these prices were last verified
   * against the live vendor page. Required for Credex compliance audit.
   */
  verifiedAt: string;
}

// ---------------------------------------------------------------------------
// PRICING — the core pricing catalogue
// ---------------------------------------------------------------------------

/**
 * Verified pricing data for every `ToolName`.
 * Keyed by tool slug; values describe available plans, the canonical pricing URL,
 * and the date the data was last manually verified.
 *
 * @example
 * const cursorPlans = PRICING['cursor'].plans;
 * const cheapestCursorPlan = cursorPlans[0]; // { name: 'Hobby', monthlyPerSeat: 0 }
 */
export const PRICING: Record<ToolName, ToolPricing> = {
  cursor: {
    plans: [
      { name: 'Hobby',    monthlyPerSeat: 0  },
      { name: 'Pro',      monthlyPerSeat: 20 },
      { name: 'Business', monthlyPerSeat: 40 },
    ],
    url: 'https://cursor.sh/pricing',
    verifiedAt: '2026-05-20',
  },

  'github-copilot': {
    plans: [
      { name: 'Individual', monthlyPerSeat: 10 },
      { name: 'Business',   monthlyPerSeat: 19 },
      { name: 'Enterprise', monthlyPerSeat: 39 },
    ],
    url: 'https://github.com/pricing',
    verifiedAt: '2026-05-20',
  },

  claude: {
    plans: [
      { name: 'Free', monthlyPerSeat: 0  },
      { name: 'Pro',  monthlyPerSeat: 20 },
      { name: 'Team', monthlyPerSeat: 30 },
    ],
    url: 'https://anthropic.com/pricing',
    verifiedAt: '2026-05-20',
  },

  chatgpt: {
    plans: [
      { name: 'Free', monthlyPerSeat: 0  },
      { name: 'Plus', monthlyPerSeat: 20 },
      { name: 'Team', monthlyPerSeat: 30 },
    ],
    url: 'https://openai.com/chatgpt/pricing',
    verifiedAt: '2026-05-20',
  },

  'anthropic-api': {
    plans: [
      /**
       * Anthropic API is billed per-token (input + output).
       * `monthlyPerSeat: null` signals usage-based pricing to the audit engine —
       * it will flag high spend rather than comparing against seat costs.
       */
      { name: 'Pay-per-token', monthlyPerSeat: null },
    ],
    url: 'https://anthropic.com/api',
    verifiedAt: '2026-05-20',
  },

  'openai-api': {
    plans: [
      /**
       * OpenAI API is billed per-token per model.
       * `monthlyPerSeat: null` signals usage-based pricing to the audit engine.
       */
      { name: 'Pay-per-token', monthlyPerSeat: null },
    ],
    url: 'https://openai.com/api/pricing',
    verifiedAt: '2026-05-20',
  },

  gemini: {
    plans: [
      { name: 'Free',    monthlyPerSeat: 0     },
      { name: 'Advanced', monthlyPerSeat: 19.99 },
    ],
    url: 'https://gemini.google.com/advanced',
    verifiedAt: '2026-05-20',
  },

  windsurf: {
    plans: [
      { name: 'Free', monthlyPerSeat: 0  },
      { name: 'Pro',  monthlyPerSeat: 15 },
      { name: 'Team', monthlyPerSeat: 35 },
    ],
    url: 'https://codeium.com/windsurf/pricing',
    verifiedAt: '2026-05-20',
  },
} as const;

// ---------------------------------------------------------------------------
// TOOL_DISPLAY_NAMES — human-readable labels for the UI
// ---------------------------------------------------------------------------

/**
 * Maps each `ToolName` slug to the vendor's official marketing name.
 * Use this everywhere the tool name is rendered to the user — never render
 * raw slugs (e.g. render "GitHub Copilot", not "github-copilot").
 */
export const TOOL_DISPLAY_NAMES: Record<ToolName, string> = {
  'cursor':          'Cursor',
  'github-copilot':  'GitHub Copilot',
  'claude':          'Claude',
  'chatgpt':         'ChatGPT',
  'anthropic-api':   'Anthropic API',
  'openai-api':      'OpenAI API',
  'gemini':          'Gemini Advanced',
  'windsurf':        'Windsurf',
} as const;

// ---------------------------------------------------------------------------
// TOOL_CAPABILITIES — use-case & strength metadata for recommendation logic
// ---------------------------------------------------------------------------

/**
 * Describes each tool's primary use-cases and standout strengths.
 * The audit engine uses `primaryUse` to match tools against the team's `UseCase`
 * and surfaces relevant `strengths` in recommendation copy.
 *
 * @example
 * const { primaryUse } = TOOL_CAPABILITIES['cursor'];
 * const isCodingTool = primaryUse.includes('coding'); // true
 */
export const TOOL_CAPABILITIES: Record<
  ToolName,
  { primaryUse: string[]; strengths: string[] }
> = {
  cursor: {
    primaryUse: ['coding'],
    strengths: [
      'Native IDE integration with full codebase context',
      'Inline multi-line completions and edits',
      'Chat with repo-wide awareness',
      'Supports bring-your-own model (GPT-4, Claude, etc.)',
    ],
  },

  'github-copilot': {
    primaryUse: ['coding'],
    strengths: [
      'Deep GitHub / VS Code integration',
      'Copilot Chat for in-editor Q&A',
      'Pull-request summaries and code review assistance',
      'Enterprise security policy controls',
    ],
  },

  claude: {
    primaryUse: ['writing', 'research', 'coding', 'mixed'],
    strengths: [
      'Best-in-class long-context window (200k tokens)',
      'Nuanced instruction following',
      'Strong reasoning and analysis',
      'Low hallucination rate on factual tasks',
    ],
  },

  chatgpt: {
    primaryUse: ['writing', 'research', 'mixed'],
    strengths: [
      'Broad generalist capability',
      'Rich plugin / GPT ecosystem',
      'Image generation via DALL·E',
      'Voice mode for hands-free interaction',
    ],
  },

  'anthropic-api': {
    primaryUse: ['coding', 'data', 'research', 'mixed'],
    strengths: [
      'Programmatic access to Claude model family',
      'Fine-grained cost control via token budgeting',
      'Suitable for high-volume automated pipelines',
      'Tool / function calling support',
    ],
  },

  'openai-api': {
    primaryUse: ['coding', 'data', 'research', 'mixed'],
    strengths: [
      'Widest model selection (GPT-4o, o3, embeddings, Whisper, etc.)',
      'Mature ecosystem with extensive third-party integrations',
      'Fine-tuning support',
      'Batch API for cost-efficient async workloads',
    ],
  },

  gemini: {
    primaryUse: ['research', 'writing', 'mixed'],
    strengths: [
      'Native Google Workspace integration (Docs, Sheets, Gmail)',
      'Multimodal input (text, images, audio, video)',
      'Deep Search grounding with real-time web access',
      'Competitive pricing on the Pro tier',
    ],
  },

  windsurf: {
    primaryUse: ['coding'],
    strengths: [
      'Agentic "Cascade" mode for multi-step autonomous coding tasks',
      'Competitive pricing vs. Cursor on the Pro tier',
      'Built-in terminal and web-search awareness',
      'Generous free tier for evaluation',
    ],
  },
} as const;
