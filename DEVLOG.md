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