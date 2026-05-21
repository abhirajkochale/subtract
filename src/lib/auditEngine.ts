/**
 * @file auditEngine.ts
 * @description Core audit engine for SubTract.
 *
 * STATUS: Stub — business logic is not yet implemented.
 * The TDD test suite in `auditEngine.test.ts` defines all required behaviours.
 * Implement `runAudit` to make those tests pass.
 *
 * @see src/lib/auditEngine.test.ts — 5 failing tests that drive the implementation
 * @see src/lib/types.ts            — AuditFormData / AuditResult interfaces
 * @see src/lib/pricingData.ts      — PRICING, TOOL_DISPLAY_NAMES, TOOL_CAPABILITIES
 */

import type { AuditFormData, AuditResult } from '@/lib/types';

/**
 * Runs a full spend audit against the supplied form data.
 *
 * For each enabled tool in `formData.tools` the engine will:
 *  1. Detect overspend relative to the listed plan price × seats (`flag`)
 *  2. Suggest a cheaper plan on the same tool (`downgrade`)
 *  3. Suggest a cheaper alternative tool for the same use-case (`switch`)
 *  4. Flag duplicate tools covering the same use-case (`optimize`)
 *  5. Confirm the spend is already optimal (`already-optimal`)
 *
 * @param formData - Validated audit form submission from the user
 * @returns        A fully-populated AuditResult with per-tool findings and totals
 * @throws         Error('Not yet implemented') — replace with logic in Phase 3
 */
export function runAudit(formData: AuditFormData): AuditResult {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  void formData;
  throw new Error('Not yet implemented');
}
