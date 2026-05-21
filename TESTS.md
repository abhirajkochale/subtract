# TESTS.md — SubTract Test Documentation

## Test Command

```bash
npm run test
```

Runs the full Vitest suite in **non-interactive mode** (`vitest run`).  
For watch mode during development, use:

```bash
npx vitest
```

For the interactive UI:

```bash
npx vitest --ui
```

---

## Test Files

| File | Description |
|---|---|
| `src/lib/auditEngine.test.ts` | Unit tests for the core audit engine business rules |

---

## Test Suite: `src/lib/auditEngine.test.ts`

**Framework:** Vitest v4  
**Environment:** Node (no DOM)  
**Strategy:** Tests import the *real* `runAudit` function — no mocking of the SUT.  
While the engine is a stub, each test asserts the throw. Commented assertions  
document the exact contract the finished implementation must satisfy.

---

### Test 1 — DOWNGRADE: Team plan for small teams

**Test name:** `"Downgrade: Team plan for fewer than 3 users should recommend individual plans"`

**Business rule:**  
If a team of fewer than 3 users is subscribed to a vendor's "Team" tier, the per-seat cost exceeds the next plan down. The engine should detect this and produce a `downgrade` recommendation pointing to the cheaper individual/pro plan.

**Fixture:**  
- Tool: `claude` · Plan: `Team` ($30/seat) · Seats: `2` · Monthly spend: `$60`
- Claude Pro is $20/seat → $40/mo for 2 seats → **$20/mo saving, $240/yr**

**Expected engine output:**
- `recommendationType: 'downgrade'`
- `alternativePlan: 'Pro'`
- `savings: 20` · `annualSavings: 240`

---

### Test 2 — OPTIMIZE: Right-size coding tools for larger teams

**Test name:** `"Optimize: Coding use case with Cursor Pro (team > 5) should check if GitHub Copilot Business is cheaper"`

**Business rule:**  
For coding teams with more than 5 seats, the engine must evaluate whether GitHub Copilot Business ($19/seat) is cheaper than Cursor Pro ($20/seat) and surface a switch recommendation if so.

**Fixture:**
- Tool: `cursor` · Plan: `Pro` ($20/seat) · Seats: `6` · Monthly spend: `$120`
- GitHub Copilot Business: $19/seat × 6 = $114/mo → **$6/mo saving, $72/yr**

**Expected engine output:**
- `recommendationType: 'switch'` or `'optimize'`
- `alternativeTool: 'github-copilot'`
- `alternativePlan: 'Business'`
- `savings: 6`

---

### Test 3 — SWITCH: Eliminate duplicate tools for the same use-case

**Test name:** `"Switch: Writing use case on both ChatGPT Plus and Claude Pro should recommend picking one based on spend"`

**Business rule:**  
When a user subscribes to two tools that both cover the same `primaryUse`, the engine must identify the redundancy and recommend dropping the lower-priority one. For `writing`, both Claude and ChatGPT qualify — keeping only one saves the full cost of the other.

**Fixture:**
- Tool A: `chatgpt` · Plan: `Plus` · Spend: `$20/mo` · Seats: `1`
- Tool B: `claude` · Plan: `Pro` · Spend: `$20/mo` · Seats: `1`
- Total: `$40/mo` → optimal: `$20/mo` → **$20/mo saving, $240/yr**

**Expected engine output:**
- At least 1 result with `recommendationType: 'switch'` or `'optimize'`
- `totalMonthlySavings: 20` · `totalAnnualSavings: 240`

---

### Test 4 — FLAG: Overspend anomaly detection

**Test name:** `"Flag: Any tool where monthly spend > (plan price × seats) by more than 20% should trigger an overspend warning"`

**Business rule:**  
If a user's reported monthly spend exceeds `(planPrice × seats)` by more than **20%**, the engine cannot make a safe recommendation — the discrepancy may indicate billing errors, hidden usage, or undeclared seats. The engine must return a `flag` recommendation with a human-review prompt.

**Fixture:**
- Tool: `chatgpt` · Plan: `Plus` ($20/seat) · Seats: `2` · Monthly spend: `$60`
- Expected cost: `$20 × 2 = $40` · Actual: `$60` → **50% overspend (> 20% threshold)**

**Expected engine output:**
- `recommendationType: 'flag'`
- `reason` matches `/overspend|exceeds|above/i`

---

### Test 5 — ALREADY-OPTIMAL: No false positives on free/lowest plans

**Test name:** `"Optimal: User already on the cheapest plan for their usage should be marked as already-optimal"`

**Business rule:**  
The engine must never recommend a downgrade from a free or lowest-tier plan. When no cheaper alternative exists and there is no usage overlap, the result must be `already-optimal` and the top-level `isOptimal` flag must be `true`.

**Fixture:**
- Tool: `windsurf` · Plan: `Free` ($0/seat) · Seats: `1` · Monthly spend: `$0`
- No cheaper Windsurf plan exists. No other coding tools in the stack.

**Expected engine output:**
- `recommendationType: 'already-optimal'`
- `savings: 0`
- Top-level `isOptimal: true`

---

## Coverage Targets (Phase 3+)

| Metric | Target |
|---|---|
| Statements | ≥ 80% |
| Branches | ≥ 80% |
| Functions | ≥ 90% |
| Lines | ≥ 80% |

Run with coverage:
```bash
npx vitest run --coverage
```
