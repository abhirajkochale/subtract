/**
 * @file auditEngine.test.ts
 * @description TDD test suite for the SubTract audit engine.
 *
 * STATE: 5 RED tests. Every test calls runAudit() directly and asserts
 * the expected final output. While auditEngine.ts throws "Not yet implemented",
 * Vitest will report all 5 as FAILED. Implement runAudit() to turn them GREEN.
 *
 * Run: npm run test
 */

import { describe, it, expect } from 'vitest';
import { runAudit } from '@/lib/auditEngine';
import type { AuditFormData, ToolInput } from '@/lib/types';

// ─── Fixture helpers ──────────────────────────────────────────────────────────

function makeToolInput(overrides: Partial<ToolInput> & Pick<ToolInput, 'toolName'>): ToolInput {
  return {
    plan: 'Pro',
    monthlySpend: 20,
    seats: 1,
    enabled: true,
    ...overrides,
  };
}

function makeFormData(
  overrides: Partial<AuditFormData> & Pick<AuditFormData, 'tools'>,
): AuditFormData {
  return {
    teamSize: overrides.tools.length,
    useCase: 'mixed',
    ...overrides,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('runAudit — core business rules', () => {

  // ── Test 1: DOWNGRADE ──────────────────────────────────────────────────────
  it('Downgrade: Team plan for fewer than 3 users should recommend individual plans', () => {
    /**
     * 2 seats on Claude Team = $30 × 2 = $60/mo.
     * Claude Pro = $20 × 2 = $40/mo → $20/mo saving ($240/yr).
     * Engine must recommend downgrading to the Pro plan.
     */
    const formData = makeFormData({
      teamSize: 2,
      useCase: 'writing',
      tools: [
        makeToolInput({
          toolName: 'claude',
          plan: 'Team',
          monthlySpend: 60,
          seats: 2,
        }),
      ],
    });

    const result = runAudit(formData);
    const claudeResult = result.toolResults.find(r => r.toolName === 'claude')!;

    expect(claudeResult.recommendationType).toBe('downgrade');
    expect(claudeResult.alternativePlan).toBe('Pro');
    expect(claudeResult.savings).toBe(20);
    expect(claudeResult.annualSavings).toBe(240);
  });

  // ── Test 2: OPTIMIZE ───────────────────────────────────────────────────────
  it('Optimize: Coding use case with Cursor Pro (team > 5) should check if GitHub Copilot Business is cheaper', () => {
    /**
     * 6 seats on Cursor Individual = $20 × 6 = $120/mo.
     * GitHub Copilot Business = $19 × 6 = $114/mo → $6/mo saving ($72/yr).
     * Engine must surface Copilot Business as the cheaper coding alternative.
     */
    const formData = makeFormData({
      teamSize: 6,
      useCase: 'coding',
      tools: [
        makeToolInput({
          toolName: 'cursor',
          plan: 'Individual',
          monthlySpend: 120,
          seats: 6,
        }),
      ],
    });

    const result = runAudit(formData);
    const cursorResult = result.toolResults.find(r => r.toolName === 'cursor')!;

    expect(['switch', 'optimize']).toContain(cursorResult.recommendationType);
    expect(cursorResult.alternativeTool).toBe('github-copilot');
    expect(cursorResult.alternativePlan).toBe('Business');
    expect(cursorResult.savings).toBe(6);
    expect(cursorResult.annualSavings).toBe(72);
  });

  // ── Test 3: SWITCH ─────────────────────────────────────────────────────────
  it('Switch: Writing use case on both ChatGPT Plus and Claude Pro should recommend picking one based on spend', () => {
    /**
     * 1 user paying $20/mo for ChatGPT Plus AND $20/mo for Claude Pro.
     * Both cover 'writing' — full overlap.
     * Claude (second in list) → optimize: savings = $20/mo (drop redundant tool).
     * ChatGPT (survivor) → switch to Gemini Plus ($5/seat): savings = $15/mo.
     * Total monthly savings = $20 + $15 = $35/mo ($420/yr).
     */
    const formData = makeFormData({
      teamSize: 1,
      useCase: 'writing',
      tools: [
        makeToolInput({ toolName: 'chatgpt', plan: 'Plus', monthlySpend: 20, seats: 1 }),
        makeToolInput({ toolName: 'claude',  plan: 'Pro',  monthlySpend: 20, seats: 1 }),
      ],
    });

    const result = runAudit(formData);
    const redundantTools = result.toolResults.filter(
      r => r.recommendationType === 'switch' || r.recommendationType === 'optimize',
    );

    expect(redundantTools.length).toBeGreaterThanOrEqual(1);
    expect(result.totalMonthlySavings).toBe(35);
    expect(result.totalAnnualSavings).toBe(420);
  });

  // ── Test 4: FLAG ───────────────────────────────────────────────────────────
  it('Flag: Any tool where monthly spend > (plan price × seats) by more than 20% should trigger an overspend warning', () => {
    /**
     * ChatGPT Plus = $20/seat. 2 seats → expected $40/mo.
     * User reports $60/mo → 50% overspend, exceeds the 20% threshold.
     * Engine cannot safely recommend a plan change; must flag for human review.
     */
    const formData = makeFormData({
      teamSize: 2,
      useCase: 'writing',
      tools: [
        makeToolInput({
          toolName: 'chatgpt',
          plan: 'Plus',
          monthlySpend: 60, // expected: $40, actual: $60 → +50%
          seats: 2,
        }),
      ],
    });

    const result = runAudit(formData);
    const chatgptResult = result.toolResults.find(r => r.toolName === 'chatgpt')!;

    expect(chatgptResult.recommendationType).toBe('flag');
    expect(chatgptResult.reason).toMatch(/overspend|exceeds|above/i);
  });

  // ── Test 5: ALREADY-OPTIMAL ────────────────────────────────────────────────
  it('Optimal: User already on the cheapest plan for their usage should be marked as already-optimal', () => {
    /**
     * Windsurf Free = $0/seat. 1 seat. No cheaper plan exists.
     * No other coding tools in the stack → no overlap to flag.
     * Engine must return 'already-optimal' with zero savings.
     */
    const formData = makeFormData({
      teamSize: 1,
      useCase: 'coding',
      tools: [
        makeToolInput({ toolName: 'windsurf', plan: 'Free', monthlySpend: 0, seats: 1 }),
      ],
    });

    const result = runAudit(formData);
    const windsurfResult = result.toolResults.find(r => r.toolName === 'windsurf')!;

    expect(windsurfResult.recommendationType).toBe('already-optimal');
    expect(windsurfResult.savings).toBe(0);
    expect(windsurfResult.annualSavings).toBe(0);
    expect(result.totalMonthlySavings).toBe(0);
    expect(result.isOptimal).toBe(true);
  });
});
