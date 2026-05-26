# Final Reflection

## 1. Hardest Technical Bug
The hardest technical bug was ensuring the shareable `[id]` URLs worked securely without triggering an infinite React state loop. Initially, the `AuditResults` component strictly relied on calculating savings directly from the user's form input state. When I built the viral sharing feature (fetching a saved JSON result from Supabase via a server component), passing that static JSON into the `AuditResults` component caused Next.js to crash. The component was trying to re-calculate the audit on a frozen database snapshot. The fix was refactoring `AuditResults` to accept an optional `preCalculatedResult` prop, which bypassed the `auditEngine` entirely and safely hydrated the UI for public viewers.

## 2. Decision Reversed During the Build
Initially, I planned to have the Gemini AI calculate the savings and write the entire audit result. I reversed this decision on Day 4. LLMs are incredibly unreliable at deterministic math, and they constantly hallucinated pricing tiers (e.g., inventing a "$10 Claude Free Tier"). I reversed course and built a strict, test-driven TypeScript `auditEngine.ts` to handle 100% of the math and financial logic. The AI is now only used at the very end to format the *already calculated* data into a CFO-style summary paragraph. 

## 3. What I Would Do with a "Week 2"
If I had one more week, I would build the "Benchmark Mode" out into a full database-backed feature. Right now, the benchmarks are static (1-10 devs, 11-50 devs, etc.). I would create an aggregated, anonymized view in Supabase that dynamically calculates the median spend of all users in the system, so the benchmark gets smarter and more accurate with every user who completes an audit.

## 4. AI Usage Transparency
I used Claude Opus and Gemini Pro heavily throughout this build. 
- **Code:** Used as a pair-programmer for rapid scaffolding of Shadcn UI components and writing the initial Vitest TDD fixtures. 
- **Debugging:** Used to decipher obscure Next.js 15 App Router hydration errors.
- **Copywriting:** Used to bounce ideas for the GTM strategy and refine the hero copywriting.
- **What I didn't use it for:** I did not let AI write the core business logic of the `auditEngine.ts` without strict oversight. I manually wrote the business rules and forced the AI to adhere to the Vitest test suite.

## 5. Self-Rating
* **Discipline (10/10):** I maintained a strict, daily commit schedule across 7 days, balancing engineering deep-dives with rigorous business documentation without burning out.
* **Code Quality (9/10):** The codebase is strongly typed, Vitest-driven, and relies on strict semantic components, though a few components like `AuditResults` could be further abstracted.
* **Design Sense (10/10):** I deliberately bypassed generic "AI neon" templates to engineer a premium, trustworthy B2B fintech aesthetic that reassures enterprise users about data security.
* **Problem-solving (10/10):** I successfully debugged complex Next.js 15 hydration issues with `localStorage` and built a resilient API architecture that gracefully handles LLM rate limits without breaking the UI.
* **Entrepreneurial Thinking (10/10):** I treated this not as a coding test, but as a real product launch—validating my pricing data, interviewing users, engineering a $0-CAC viral loop, and calculating the exact math to $1M ARR.
