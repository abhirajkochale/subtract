## Day 1 2026-05-20
**Hours worked:** 2
**What I did:** Initialized the Next.js 14 App Router codebase with Tailwind and shadcn/ui. Scaffolded the complete `src/` architecture and all mandatory rubric markdown files. Built the strict TypeScript interfaces (`types.ts`) and manually verified the vendor URLs and pricing tiers in `pricingData.ts`.
**What I learned:** The importance of isolating domain data and interfaces from the business logic early in the project to avoid circular dependencies.
**Blockers / what I'm stuck on:** None. The data foundation is perfectly typed and stable.
**Plan for tomorrow:** Set up Vitest and execute Test-Driven Development (TDD) by writing the 5 required failing test cases before building the audit engine math.

## Day 2 2026-05-21
**Hours worked:** 4
**What I did:** Configured the Vitest testing environment and executed a strict Test-Driven Development (TDD) workflow. I wrote 5 unit tests mapping directly to the core business rules, verified they failed against a stubbed engine, and then built out the math logic in `src/lib/auditEngine.ts` to turn them green. I also engineered solutions for edge cases: filtering out "Individual" plans for multi-seat teams, adding a $1 minimum savings threshold, and using a pre-pass to prevent double-counting savings on overlapping tools. 

Following the strict "Pricing data accuracy matters" ground rule, I also conducted a comprehensive manual audit of all 8 vendor pricing pages. I discovered significant discrepancies in the provided spec due to recent rebrands (Windsurf, Gemini) and stealth pricing updates (Claude, ChatGPT). I updated `pricingData.ts` and refactored the test fixtures to ensure 100% compliance with live market data.

**Compliance Audit Log:**
* **Windsurf:** Updated Pro tier to the live $20 price and migrated domain to `windsurf.com`.
* **Cursor:** Updated domain to `cursor.com` and aligned tier nomenclature to "Individual" and "Teams".
* **Claude:** Verified Team plan is now $25/mo, added the new $100/mo 'Max' tier, and adjusted Vitest downgrade assertions to accurately reflect the new $10/mo savings margin.
* **ChatGPT:** Migrated URL to `chatgpt.com/pricing` and added their new $200/mo 'Pro' tier, ensuring all localized pricing was standardized to USD.
* **Anthropic & OpenAI APIs:** Verified usage-based `null` structures and updated canonical URLs to reflect domain migrations and current token pricing pages.
* **Gemini:** Audited major vendor rebrand, replacing the legacy "Advanced" tier with the live Plus ($5), Pro ($20), and Ultra ($65) USD tiers, updating legacy test fixtures to maintain a passing suite.

**What I learned:** Writing the tests first exposed how easily savings can be double-counted if rule execution order isn't strictly controlled. I also learned that SaaS vendor pricing is highly volatile; hardcoding assumptions without live verification URLs is a massive compliance risk for enterprise audits.

**Blockers / what I'm stuck on:** I initially ran into floating-point precision errors and tests failing because the engine recommended penny-shaving switches. I unblocked this by enforcing a strict $1 minimum threshold. I also had to untangle localized currency (INR to USD) and separate developer API usage from standard seat billing, ensuring the math engine didn't confuse usage-based tiers with fixed monthly seats.

**Plan for tomorrow:** Shift focus to the frontend (Phase 3). I will build the `useFormPersistence` hook to sync state with `localStorage`, and construct the interactive Spend Input Form and Results Dashboard using shadcn/ui.  

## Day 3 2026-05-22
**Hours worked:** 4
**What I did:** Built the React/Tailwind frontend foundation for the "SubTract" input form. Engineered a custom `useFormPersistence` hook to ensure form state persists across reloads via `localStorage` (a strict rubric requirement) while utilizing an `isMounted` flag to completely prevent Next.js SSR hydration mismatch errors. Configured dynamic, cascading dropdowns mapped strictly to the required 2026 tool/plan matrices (Cursor, Claude, Copilot, etc.). I also established the brand identity, replacing default components with a premium B2B fintech design system (deep navy accents, slate borders) and a custom geometric SVG logo to build high trust with startup founders.
**What I learned:** Handling client-side `localStorage` in a Next.js App Router environment requires a robust mount-check hook. I also learned how crucial `aria-labels`, `role="status"`, and semantic HTML are on dynamic UI array elements to guarantee we pass the >90 Lighthouse accessibility threshold required by the assignment.
**Blockers / what I'm stuck on:** Managing the cascading dropdown state—specifically ensuring that when a user switches a tool, the previously selected plan resets so the `<select>` never enters an invalid state—was tricky to handle within a dynamic React array, but I resolved it by wrapping the reset logic in the row component.
**Plan for tomorrow:** Connect this persisting frontend state directly to the Day 2 Audit Engine to calculate the math, and build out the comprehensive Audit Results Dashboard UI.

## Day 4 2026-05-23
**Hours worked:** 3
**What I did:** Executed a major refactor of `src/lib/auditEngine.ts` to enforce a strict evaluation hierarchy. I built the highest-priority "Ghost Seats" rule (evaluating if `tool.seats > teamSize`) and a strict category-based "Redundant Tool" check mapping tools into discrete buckets (General LLMs, Coding Assistants, APIs) via a pre-pass `redundantPrimaryMap`. I validated the new logic hierarchy by running the Vitest suite, keeping all 5 core tests green. Finally, I connected these refined outputs to the `<AuditResults />` dashboard to trigger the conditional UI warning banners.
**What I learned:** Enforcing a strict operational order (Ghost Seats → Redundancy → Downgrades) is critical for accurate financial auditing. Relying on strict category mapping is much safer than loose use-case matching to prevent false-positive redundancy flags.
**Blockers / what I'm stuck on:** None. The math engine is perfectly outputting the exact data models the frontend UI expects.
**Plan for tomorrow:** Implement MVP Feature 4 by integrating the Gemini API to generate a personalized CFO-style summary, ensuring a graceful template fallback is in place for API timeouts.

## Day 5 2026-05-24
**Hours worked:** 3.5
**What I did:** Implemented MVP Feature 4 by building the AI-generated CFO summary. I set up a robust backend API route (`src/app/api/summary/route.ts`) using the `@google/generative-ai` SDK. To maximize reliability against rate limits, I implemented an automated fallback waterfall array that iterates through available Gemini models (from `gemini-3.5-flash` down to `gemini-flash-latest`) if one fails. Additionally, I engineered a defensive `try/catch` pipeline that forces a hardcoded template string if all LLM requests fail or quotas are exceeded, ensuring 100% UI stability per the rubric requirements. Finally, I resolved persistent API 404 errors (due to deprecated model versioning) and 429 rate-limiting errors by disabling `reactStrictMode: false` in `next.config.ts` and implementing a `useRef` mounted lock in the frontend component.
**What I learned:** React Strict Mode causes `useEffect` to double-fire on mount in development, which instantly exhausts aggressive free-tier API quotas. Implementing a strict `useRef` mounted flag, combined with an automated multi-model fallback loop on the backend, is a highly effective pattern for protecting third-party LLM rate limits during local frontend development.
**Blockers / what I'm stuck on:** None. The API integration is fully stable and gracefully handles all edge case failure states.
**Plan for tomorrow:** Finalize the application by completing Phase 5. This includes building the backend API to persist audit results to a database, implementing the `/results/[id]` dynamic routing for shareable links, and adding the final Lead Capture email collection component.

## Day 6 2026-05-25
**Hours worked:** 3
**What I did:** Completed Phase 5 by transforming the app into a full-stack Next.js architecture. Initialized the `@supabase/supabase-js` client and built the `/api/capture` endpoint to securely save both generated `audits` and user `leads` to a PostgreSQL database. Designed and integrated the `LeadCapture` UI component with a hidden honeypot spam protection. I also built the public, shareable `/results/[id]` route leveraging Next.js 15+ async `params` to dynamically fetch and display raw audit JSON, generating Open Graph metadata for high-quality social sharing. Finally, integrated the `resend` SDK for transactional HTML emails.
**What I learned:** In Next.js 15+, dynamic route properties like `params` must be explicitly `await`ed as Promises. I also learned the hard way that Supabase Row-Level Security (RLS) silently blocks anon-key inserts by default, requiring explicit `CREATE POLICY` statements.
**Blockers / what I'm stuck on:** Hit a 500 Internal Server Error when testing the live form. By bubbling the exact error up to the UI, I discovered it was a PostgreSQL foreign key constraint violation (`leads_audit_id_fkey`) caused by failing to save the `audit_data` payload to the parent table. Unblocked this by running an `upsert` on the `audits` table immediately before inserting the lead.
**Plan for tomorrow:** Final deployment day! I will shift completely from engineering to product: conducting the 3 required user interviews, calculating the unit economics (`ECONOMICS.md`), and writing the GTM strategy. I will also write the 5 required automated tests and push the final Vercel deployment, ensuring >90 Lighthouse scores.
