# User Interviews

## Interview 1
**Date:** May 22, 2026
**Profile:** Atharv P. (Developer / Indie Hacker)
**Current AI Stack:** Cursor (Free tier), ChatGPT Go, Gemini Pro (Student), Claude Code (Open-source)

**Direct Quotes:**
* "Yeah just 3-4 prompts in and I just hit the limit. So gotta use some tricks and squeeze most out of the ai models."
* "Yeah caveman tricks, switching acc using plugins etc."
* "Plus I like to keep most of the payment things manual. I dont trust the Autopay systems etc."

**The most surprising thing they said:**
The biggest surprise was how far he goes to avoid paying for tokens. He actively juggles multiple free accounts (which he called "caveman tricks") just to bypass the rate limits. Also, when I pitched the idea of a centralized dashboard to track AI subscriptions, he said he actually knows a similar tool exists but refuses to use it. He prefers keeping all his payments completely manual because he deeply distrusts third-party "Autopay" systems having access to his financials.

**What it changed about my design:**
This made me realize that user trust is a massive barrier for this app. If devs are already paranoid about autopay, a tool asking for their SaaS spend needs to look incredibly secure. It totally validated my decision to build a clean, premium fintech-style UI (navy/slate) instead of a flashy, neon AI template. More importantly, it directly changes my `LANDING_COPY.md` plan. I'm going to add explicit micro-copy right below the main CTA button that says "100% manual entry" and "No credit card or Autopay access required" so users actually feel safe hitting submit.