# SubTract Context Capsule

**Project:** SubTract (AI Spend Audit Tool)
**Goal:** Credex Intern Assignment
**Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Vitest, Lucide React
**Path:** `c:\Projects\subtract`

This document serves as a comprehensive snapshot of the project's state, business logic, architecture, and design decisions to bring any new developer or AI assistant fully up to speed.

---

## 1. Project Overview & Status

SubTract is a client-side heavy web application that takes a team's AI tool stack (like ChatGPT, Cursor, GitHub Copilot) as input and runs a mathematical engine to surface exact cost-saving recommendations (downgrade, switch, optimize, flag).

The project strictly follows a Test-Driven Development (TDD) approach, maintaining 100% test coverage on the core audit engine. 

### Current State
*   **Phase 1 & 2 (Data Foundation & TDD):** ✅ Complete. Verified pricing data and strict TypeScript interfaces established. Vitest suite with 5 core business rule tests is fully green.
*   **Phase 3 (Audit Engine):** ✅ Complete. Priority-based recommendation engine built and passing all tests.
*   **Phase 4 (Frontend UI - Form):** ✅ Complete. `useFormPersistence` hook created for hydration-safe `localStorage`. Accessible `SpendInputForm` built with a B2B light-mode UI.
*   **Next Steps (Phase 5):** 🔲 Build the `/audit` processing page, the `/api/audit` backend endpoint (to store results), and the `/results/[id]` dashboard.

---

## 2. File Inventory & Architecture

### Core Domain & Logic (`src/lib/`)
*   **`types.ts`**: The central source of truth for all data models. Contains `ToolName`, `UseCase`, `RecommendationType`, `ToolInput`, `AuditFormData`, `ToolAuditResult`, `AuditResult`, and `Lead`. No types should be redefined in components.
*   **`pricingData.ts`**: The verified catalogue of AI tools. Contains `PRICING` (plans, prices), `TOOL_CAPABILITIES` (primary use cases), and `TOOL_DISPLAY_NAMES`. (Prices verified May 2026).
*   **`auditEngine.ts`**: The core business logic. Exports `runAudit(formData: AuditFormData): AuditResult`.
*   **`auditEngine.test.ts`**: The Vitest test suite enforcing the 5 core rules. All 5 tests are passing.
*   **`utils.ts`**: Shared helpers (`generateId`, `nowISO`, `formatCurrency`).

### State Management (`src/hooks/`)
*   **`useFormPersistence.ts`**: A custom React hook managing the form state (`tools`, `teamSize`, `primaryUseCase`). It handles hydration safety by initializing with server-safe defaults and only hydrating from `localStorage` (`credex-audit-state`) after mount via `useEffect`.

### UI Components (`src/components/AuditForm/`)
*   **`index.tsx` (`SpendInputForm`)**: The main form orchestrator. Uses `useFormPersistence`. It is a Client Component but returns a `FormSkeleton` (loading state) until mounted to prevent hydration mismatches. Submits by storing data in `sessionStorage` and routing to `/audit`.
*   **`ToolRow.tsx`**: Renders a single tool input row. Handles dynamic plan `<select>` options based on the chosen tool.
*   **`UseCaseSelect.tsx`**: A standalone component for the primary use case dropdown.

### Pages (`src/app/`)
*   **`layout.tsx`**: Root layout. Configured with Geist font, SEO metadata, and a light-mode `bg-gray-50 text-gray-900` body.
*   **`page.tsx`**: The landing page. A Server Component that imports and renders `SpendInputForm`. Features a clean, B2B SaaS aesthetic (no neon/glows).

---

## 3. Core Business Logic: The Audit Engine

The engine (`src/lib/auditEngine.ts`) evaluates each enabled tool against 5 priority rules. The first rule to match wins.

### Pre-pass: Redundancy Detection
Before evaluating tools individually, the engine identifies overlapping tools in the same use-case. The **first** tool in the form for a given use-case "survives". Subsequent tools for the same use-case are marked as `isRedundant`. This prevents double-counting savings.

### The 5 Priority Rules:

1.  **FLAG (Unexplained Overspend):**
    *   **Trigger:** If the tool has a usage-based cost (`monthlyPerSeat === null`) OR if the user's reported `monthlySpend` is > 120% of the expected cost (`publishedPricePerSeat * seats`).
    *   **Action:** Flags the spend for human review. Savings: $0.
2.  **DOWNGRADE (Cheaper Same-Tool Plan):**
    *   **Trigger:** A cheaper *paid* plan exists on the same tool that covers the team's needs. (Free plans are skipped here to let Switch/Optimize handle them better).
    *   **Action:** Suggests moving to the cheaper plan. Savings: `currentSpend - (cheaperPlanPrice * seats)`.
3.  **OPTIMIZE (Redundant Subscription):**
    *   **Trigger:** The tool was marked `isRedundant` during the pre-pass (another tool already covers this use-case).
    *   **Action:** Suggests dropping the tool entirely. Savings: `currentSpend`.
4.  **SWITCH (Cheaper Alternative Tool):**
    *   **Trigger:** A cheaper alternative tool exists for the same primary use-case.
    *   **Logic:** Finds the **closest cheaper** paid alternative (the highest-priced plan that is still below the current price per seat). This minimizes disruption.
    *   **Threshold:** Must save at least **$1/seat**. Ignores $0.01 noise (e.g., Gemini $19.99 vs ChatGPT $20).
    *   **Constraint:** Excludes 'Individual' plans if `seats > 1`. Excludes Free plans.
    *   **Action:** Suggests switching tools. Savings: `currentSpend - (altPrice * seats)`.
5.  **ALREADY-OPTIMAL (Default):**
    *   **Trigger:** None of the above rules matched.
    *   **Action:** Confirms spend is justified. Savings: $0.

---

## 4. UI/UX & Design System

The application utilizes a premium, high-trust B2B SaaS aesthetic (inspired by Stripe, Linear, Vercel).

*   **Color Palette:** Crisp light mode. `bg-gray-50` for backgrounds, `bg-white` for cards. Text is `gray-900` (headings), `gray-500` (secondary), `gray-400` (hints).
*   **Borders & Shadows:** 1px `border-gray-200` with subtle `shadow-sm`.
*   **Primary CTA:** Solid authoritative charcoal (`bg-gray-900 hover:bg-gray-700`).
*   **Strict Rule:** No neon colors, no text gradients, no glowing box-shadows.
*   **Accessibility:** Strict Lighthouse >90 compliance. All inputs have `<label>`, icon buttons use `aria-label`, error/total states use `aria-live`, loading skeleton uses `role="status"` and `aria-busy`.

---

## 5. Important Bugs Fixed & Technical Decisions

*   **Rules of Hooks Violation:** Fixed an issue where `useCallback` hooks in `SpendInputForm` were declared *after* the `if (!isMounted)` early return. Hooks are now declared at the top, ensuring they run unconditionally.
*   **Hydration Safety:** `useFormPersistence` ensures the server renders a deterministic loading skeleton (`FormSkeleton`). The client only reads from `localStorage` inside a `useEffect` after mounting, preventing React hydration mismatch errors.
*   **Pricing Updates:** Test fixtures were updated to reflect 2026 pricing changes (e.g., Cursor "Pro" was renamed to "Individual", ChatGPT Plus vs Gemini Plus price war).
*   **Switch Logic Refinement:** `findCheaperAlternative` was updated to find the *closest* cheaper alternative, not the absolute cheapest, to provide realistic recommendations (e.g., suggesting Copilot Business over Windsurf Free).

---

## 6. Next Steps (What needs to be built)

The application flow currently stops when the user clicks "Run Audit". The next phase requires building the results pipeline:

1.  **`/app/audit/page.tsx` (Processing Page):**
    *   A Client Component that reads the `AuditFormData` from `sessionStorage` (saved by the form).
    *   Makes a `POST` request to `/api/audit` with the payload.
    *   Displays a loading spinner/animation.
    *   On success, redirects to `/results/[id]`.
2.  **`/app/api/audit/route.ts` (Backend Endpoint):**
    *   Receives the `AuditFormData`.
    *   Calls `runAudit(formData)` from `src/lib/auditEngine.ts`.
    *   Stores the resulting `AuditResult` (for now, an in-memory `Map<string, AuditResult>` is sufficient for the assignment).
    *   Returns `{ id: result.id }`.
3.  **`/app/results/[id]/page.tsx` (Results Dashboard):**
    *   Fetches the `AuditResult` using the `id` from the URL.
    *   Renders the `Results/` components (HeroSavings, ToolBreakdown, etc.) to display the savings.
4.  **`LeadCapture` Component:**
    *   Build a modal/drawer to capture the user's email, triggering either on page load or when attempting to view full details.

### End of Context Capsule
