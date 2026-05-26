/**
 * @file auditEngine.ts
 * @description Core audit engine for SubTract. Implements the five business
 * rules validated by the TDD suite in `auditEngine.test.ts`.
 *
 * Rule priority applied per tool (first match wins):
 *   1. FLAG        — reported spend > 120% of (published price × seats)
 *   2. DOWNGRADE   — current plan is NOT the cheapest; a cheaper same-tool plan exists
 *   3. SWITCH      — a cheaper alternative tool covers the same primary use-case
 *   4. OPTIMIZE    — redundant subscription: another enabled tool in the stack
 *                    already covers the same use-case at equal or lower cost
 *   5. ALREADY-OPTIMAL — none of the above apply
 */

import type {
  AuditFormData,
  AuditResult,
  ToolAuditResult,
  ToolInput,
  ToolName,
} from '@/lib/types';

import {
  PRICING,
  TOOL_CAPABILITIES,
  TOOL_DISPLAY_NAMES,
} from '@/lib/pricingData';

import { generateId, nowISO } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Returns the published per-seat price for the plan the user claims to be on.
 * Falls back to the lowest non-null plan price if the plan name is not matched.
 * Returns `null` for usage-based tools (all plans have `monthlyPerSeat: null`).
 */
function getPublishedPricePerSeat(tool: ToolInput): number | null {
  const plans = PRICING[tool.toolName].plans;

  // Exact match on plan name (case-insensitive)
  const matched = plans.find(
    p => p.name.toLowerCase() === tool.plan.toLowerCase(),
  );
  if (matched) return matched.monthlyPerSeat;

  // Fallback: first plan with a non-null price
  const fallback = plans.find(p => p.monthlyPerSeat !== null);
  return fallback ? fallback.monthlyPerSeat : null;
}

/**
 * Returns true when the team's use-case overlaps with the tool's primary uses.
 * 'mixed' use-case always overlaps with every tool.
 */
function matchesUseCase(toolName: ToolName, useCase: string): boolean {
  if (useCase === 'mixed') return true;
  return TOOL_CAPABILITIES[toolName].primaryUse.includes(useCase);
}

/**
 * Among all ToolNames NOT in `excludeTools`, find the alternative whose
 * cheapest *paid* plan is cheaper than the current price per seat AND
 * covers the given use-case.
 *
 * Selection strategy: pick the **closest cheaper** alternative — i.e. the
 * one with the highest per-seat price that is still below `currentPricePerSeat`.
 * This minimises disruption: the user switches to a comparable tier, not the
 * absolute bottom of the market.
 *
 * Rules:
 * - Free-tier alternatives ($0/seat) are excluded.
 * - For multi-seat teams (seats > 1), plans named 'Individual' are skipped.
 */
function findCheaperAlternative(
  currentToolName: ToolName,
  currentPricePerSeat: number,
  useCase: string,
  excludeTools: Set<ToolName>,
  seats: number,
): { toolName: ToolName; planName: string; pricePerSeat: number } | null {
  let best: { toolName: ToolName; planName: string; pricePerSeat: number } | null = null;

  for (const toolName of Object.keys(PRICING) as ToolName[]) {
    if (toolName === currentToolName) continue;
    if (excludeTools.has(toolName)) continue;
    if (!matchesUseCase(toolName, useCase)) continue;

    // Find the cheapest PAID plan (> $0) appropriate for the team size
    const paidPlans = PRICING[toolName].plans.filter(p => {
      if (p.monthlyPerSeat === null || p.monthlyPerSeat === 0) return false;
      if (seats > 1 && p.name.toLowerCase() === 'individual') return false;
      return true;
    });
    if (paidPlans.length === 0) continue;

    const cheapestPaid = paidPlans.reduce((a, b) =>
      (a.monthlyPerSeat as number) < (b.monthlyPerSeat as number) ? a : b,
    );

    const paidPrice = cheapestPaid.monthlyPerSeat as number;
    if (paidPrice < currentPricePerSeat) {
      // Closest cheaper = highest price that is still below current
      if (!best || paidPrice > best.pricePerSeat) {
        best = {
          toolName,
          planName: cheapestPaid.name,
          pricePerSeat: paidPrice,
        };
      }
    }
  }

  return best;
}

// ---------------------------------------------------------------------------
// Per-tool evaluation
// ---------------------------------------------------------------------------

/**
 * Evaluates a single enabled tool against all five business rules.
 *
 * @param tool           - The tool input to evaluate
 * @param useCase        - Team's primary use-case from the form
 * @param stackToolNames - Set of OTHER enabled tool names (for overlap detection)
 * @param isRedundant    - Whether the pre-pass identified this tool as redundant
 *                         (a second tool covering a use-case already handled by
 *                         another tool earlier in the form).
 */
function evaluateTool(
  tool: ToolInput,
  useCase: string,
  stackToolNames: Set<ToolName>,
  redundantPrimaryTool: ToolName | null,
  teamSize: number,
): ToolAuditResult {
  const displayName = TOOL_DISPLAY_NAMES[tool.toolName];
  const publishedPricePerSeat = getPublishedPricePerSeat(tool);

  // ── Rule 1: GHOST SEATS (Highest Priority) ──────────────────────────────
  if (teamSize && teamSize > 0 && tool.seats > teamSize) {
    const extraSeats = tool.seats - teamSize;
    const saving = extraSeats * (tool.monthlySpend / tool.seats);
    if (saving > 0) {
      return {
        toolName: tool.toolName,
        currentSpend: tool.monthlySpend,
        recommendationType: 'optimize',
        recommendedAction: `Cancel ${extraSeats} unused seat${extraSeats > 1 ? 's' : ''}`,
        savings: Math.round(saving * 100) / 100,
        annualSavings: Math.round(saving * 12 * 100) / 100,
        reason: `You are paying for ${extraSeats} ghost seats. Your team size is ${teamSize}, but you have ${tool.seats} seats billed. Cancel the unused seats immediately.`,
      };
    }
  }

  // ── Rule 2: REDUNDANT TOOL (Second Priority) ────────────────────────────
  if (redundantPrimaryTool && tool.monthlySpend > 0) {
    const primaryDisplayName = TOOL_DISPLAY_NAMES[redundantPrimaryTool];
    return {
      toolName: tool.toolName,
      currentSpend: tool.monthlySpend,
      recommendationType: 'optimize',
      recommendedAction: `Drop ${displayName}`,
      savings: Math.round(tool.monthlySpend * 100) / 100,
      annualSavings: Math.round(tool.monthlySpend * 12 * 100) / 100,
      alternativeTool: redundantPrimaryTool,
      reason: `Consolidate your stack. You are already paying for ${primaryDisplayName}; you do not need ${displayName} for the same use case.`,
    };
  }

  // ── Usage-based tools (monthlyPerSeat === null) ──────────────────────────
  // We cannot compare seat costs, so we simply flag the spend for review.
  if (publishedPricePerSeat === null) {
    if (tool.monthlySpend > 500) {
      return {
        toolName: tool.toolName,
        currentSpend: tool.monthlySpend,
        recommendationType: 'flag',
        recommendedAction: `Apply for Cloud AI Credits`,
        savings: Math.round(tool.monthlySpend * 100) / 100,
        annualSavings: Math.round(tool.monthlySpend * 12 * 100) / 100,
        reason: `You are paying retail ($${tool.monthlySpend}/mo) for ${displayName}. Startups can often secure $250k+ in free AI credits via AWS/Google/Microsoft. Let Credex help you apply for these instead of paying out of pocket.`,
      };
    } else {
      return {
        toolName: tool.toolName,
        currentSpend: tool.monthlySpend,
        recommendationType: 'already-optimal',
        recommendedAction: `Continue using ${displayName}`,
        savings: 0,
        annualSavings: 0,
        reason:
          `${displayName} uses usage-based (pay-per-token) billing. ` +
          `Your spend is reasonable. SubTract cannot automatically compare this against seat-based plans.`,
      };
    }
  }

  const expectedMonthlySpend = publishedPricePerSeat * tool.seats;

  // ── Rule 1: FLAG — unexplained overspend (>20% above published price) ────
  if (
    expectedMonthlySpend > 0 &&
    tool.monthlySpend > expectedMonthlySpend * 1.2
  ) {
    const overspendPct = Math.round(
      ((tool.monthlySpend - expectedMonthlySpend) / expectedMonthlySpend) * 100,
    );
    return {
      toolName: tool.toolName,
      currentSpend: tool.monthlySpend,
      recommendationType: 'flag',
      recommendedAction: `Audit your ${displayName} invoice`,
      savings: 0,
      annualSavings: 0,
      reason:
        `Your reported spend ($${tool.monthlySpend}/mo) exceeds the published ` +
        `${tool.plan} plan price ($${publishedPricePerSeat}/seat × ${tool.seats} seats = ` +
        `$${expectedMonthlySpend}/mo) by ${overspendPct}%. ` +
        `This overspend anomaly requires human review — check for hidden seats, ` +
        `add-ons, or a billing error.`,
    };
  }

  const plans = PRICING[tool.toolName].plans;

  // ── Rule 2: DOWNGRADE — cheaper PAID plan on the same tool ─────────────
  // Applies when the user is not on the cheapest paid plan and moving to a
  // lower PAID tier saves money. We deliberately skip free plans here — if a
  // free plan exists the switch/optimize rules will handle the cross-tool
  // redundancy more accurately (e.g. ChatGPT Plus user with Claude overlap).
  const currentPlanIndex = plans.findIndex(
    p => p.name.toLowerCase() === tool.plan.toLowerCase(),
  );

  if (currentPlanIndex > 0) {
    // Walk plans below the current tier, skip free ($0) options
    for (let i = currentPlanIndex - 1; i >= 0; i--) {
      const candidatePlan = plans[i];
      if (candidatePlan.monthlyPerSeat === null) continue;
      if (candidatePlan.monthlyPerSeat === 0) continue; // skip free — let switch/optimize handle it

      const candidateMonthly = candidatePlan.monthlyPerSeat * tool.seats;
      const saving = tool.monthlySpend - candidateMonthly;

      if (saving > 0) {
        return {
          toolName: tool.toolName,
          currentSpend: tool.monthlySpend,
          recommendationType: 'downgrade',
          recommendedAction: `Downgrade ${displayName} to ${candidatePlan.name}`,
          savings: Math.round(saving * 100) / 100,
          annualSavings: Math.round(saving * 12 * 100) / 100,
          alternativePlan: candidatePlan.name,
          reason:
            `You have ${tool.seats} seat${tool.seats !== 1 ? 's' : ''} on ${displayName} ${tool.plan} ` +
            `($${publishedPricePerSeat}/seat = $${tool.monthlySpend}/mo). ` +
            `The ${candidatePlan.name} plan ($${candidatePlan.monthlyPerSeat}/seat) ` +
            `covers the same needs at $${candidateMonthly}/mo — ` +
            `saving $${Math.round(saving)}/mo ($${Math.round(saving * 12)}/yr).`,
        };
      }
    }
  }



  // ── Rule 4: SWITCH — cheaper alternative tool for the same use-case ─────
  // Only runs when no in-stack overlap was found (optimize didn't fire) and
  // the current per-seat cost is > $0.
  // Minimum saving threshold: $1/mo — ignore trivial price differences
  // (e.g. Gemini $19.99 vs ChatGPT $20 = $0.01) that aren't worth switching for.
  const SWITCH_MIN_SAVING_PER_SEAT = 1;
  if (publishedPricePerSeat > 0 && matchesUseCase(tool.toolName, useCase)) {
    const alternative = findCheaperAlternative(
      tool.toolName,
      publishedPricePerSeat,
      useCase,
      stackToolNames,
      tool.seats,
    );

    if (alternative) {
      const alternativeMonthly = alternative.pricePerSeat * tool.seats;
      const saving = tool.monthlySpend - alternativeMonthly;
      const savingPerSeat = publishedPricePerSeat - alternative.pricePerSeat;

      if (saving > 0 && savingPerSeat >= SWITCH_MIN_SAVING_PER_SEAT) {
        const altDisplayName = TOOL_DISPLAY_NAMES[alternative.toolName];
        return {
          toolName: tool.toolName,
          currentSpend: tool.monthlySpend,
          recommendationType: 'switch',
          recommendedAction: `Switch from ${displayName} to ${altDisplayName} ${alternative.planName}`,
          savings: Math.round(saving * 100) / 100,
          annualSavings: Math.round(saving * 12 * 100) / 100,
          alternativeTool: alternative.toolName,
          alternativePlan: alternative.planName,
          reason:
            `${displayName} ${tool.plan} costs $${publishedPricePerSeat}/seat ($${tool.monthlySpend}/mo for ${tool.seats} seat${tool.seats !== 1 ? 's' : ''}). ` +
            `${altDisplayName} ${alternative.planName} covers the same ${useCase} use-case ` +
            `at $${alternative.pricePerSeat}/seat ($${alternativeMonthly}/mo) — ` +
            `saving $${Math.round(saving)}/mo ($${Math.round(saving * 12)}/yr).`,
        };
      }
    }
  }

  // ── Rule 5: ALREADY-OPTIMAL ──────────────────────────────────────────────
  return {
    toolName: tool.toolName,
    currentSpend: tool.monthlySpend,
    recommendationType: 'already-optimal',
    recommendedAction: `${displayName} spend is optimal`,
    savings: 0,
    annualSavings: 0,
    reason:
      `${displayName} ${tool.plan} is already the most cost-effective option ` +
      `for your ${useCase} use-case. No cheaper alternative or lower plan was found.`,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Runs a full spend audit against the supplied form data.
 *
 * Processes each enabled tool in priority order:
 *   flag → downgrade → switch → optimize → already-optimal
 *
 * @param formData - Validated audit form submission
 * @returns        Fully-populated AuditResult with per-tool findings and totals
 */
export function runAudit(formData: AuditFormData): AuditResult {
  const enabledTools = formData.tools.filter(t => t.enabled);

  const allEnabledNames = new Set<ToolName>(enabledTools.map(t => t.toolName));

  // ── Pre-pass: identify redundant tools via static categories ────────────
  const CATEGORIES: Record<ToolName, string> = {
    chatgpt: 'General LLMs',
    claude: 'General LLMs',
    gemini: 'General LLMs',
    cursor: 'Coding Assistants',
    'github-copilot': 'Coding Assistants',
    windsurf: 'Coding Assistants',
    'openai-api': 'APIs',
    'anthropic-api': 'APIs',
  };

  const redundantPrimaryMap = new Map<ToolName, ToolName>();
  const categorySurvivor = new Map<string, ToolName>();

  for (const tool of enabledTools) {
    const category = CATEGORIES[tool.toolName];
    if (!category) continue;

    const existing = categorySurvivor.get(category);
    if (existing && existing !== tool.toolName) {
      redundantPrimaryMap.set(tool.toolName, existing);
    } else if (!existing) {
      categorySurvivor.set(category, tool.toolName);
    }
  }

  const toolResults: ToolAuditResult[] = enabledTools.map(tool => {
    const otherTools = new Set(allEnabledNames);
    otherTools.delete(tool.toolName);

    const redundantPrimary = redundantPrimaryMap.get(tool.toolName) || null;
    return evaluateTool(tool, formData.useCase, otherTools, redundantPrimary, formData.teamSize);
  });

  const totalMonthlySavings =
    Math.round(
      toolResults.reduce((sum, r) => sum + r.savings, 0) * 100,
    ) / 100;

  const totalAnnualSavings = Math.round(totalMonthlySavings * 12 * 100) / 100;

  const isOptimal = toolResults.every(
    r => r.recommendationType === 'already-optimal',
  );

  return {
    id: generateId(),
    formData,
    toolResults,
    totalMonthlySavings,
    totalAnnualSavings,
    isOptimal,
    createdAt: nowISO(),
  };
}
