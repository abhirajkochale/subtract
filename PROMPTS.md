# Prompts
*Verified: 2026-05-24*

## Feature: AI-Generated CFO Summary

**The Prompt:**
> "Act as a fractional CFO. Look at this startup's tech stack data: Team Size: ${teamSize}, Primary Use Case: ${primaryUseCase}, Total Monthly Savings: $${totalMonthlySavings}, Tool Results: ${JSON.stringify(toolResults)}. Write a highly professional, single-paragraph summary (~100 words) analyzing the user's stack. Note the specific dollar amount of overspend, and advise consolidation based on the provided tool data."

**Why I wrote it this way:**
I strictly defined the persona ("fractional CFO") to ensure the tone matches a B2B fintech product. By passing the exact dollar amounts and stringified JSON array of the audit results directly into the prompt context, I anchored the LLM to deterministic data. Constraining it to "~100 words" and a "single-paragraph summary" ensures it fits perfectly into the UI dashboard without breaking the layout. 

**What I tried that didn't work:**
Initially, I considered passing the raw user inputs to the LLM and asking it to calculate the savings and find the redundancies itself. However, LLMs are notoriously bad at deterministic math and frequently hallucinate pricing tiers. To fix this, I isolated the math to my TypeScript `auditEngine`, and only passed the *final calculated results* to the AI. Treating the AI strictly as a text-formatting engine rather than a calculator was the only way to guarantee 100% financial accuracy for the user.