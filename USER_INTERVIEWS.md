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
The biggest surprise was how far he goes to avoid paying for tokens. He actively juggles multiple free accounts just to bypass the rate limits. Also, when I pitched the idea of a centralized dashboard to track AI subscriptions, he said he actually knows a similar tool exists but refuses to use it. He prefers keeping all his payments completely manual because he deeply distrusts third-party "Autopay" systems having access to his financials.

**What it changed about my design:**
This made me realize that user trust is a massive barrier for this app. If devs are already paranoid about autopay, a tool asking for their SaaS spend needs to look incredibly secure. It totally validated my decision to build a clean, premium fintech-style UI (navy/slate) instead of a flashy, neon AI template. More importantly, it directly changes my `LANDING_COPY.md` plan. I'm going to add explicit micro-copy right below the main CTA button that says "100% manual entry" and "No credit card or Autopay access required" so users actually feel safe hitting submit.

## Interview 2: "The Enterprise Engineer"
**Name:** D.S. (Initials used for anonymity)
**Role:** Software Developer
**Company Stage:** Enterprise (Grab)
**Date:** May 23, 2026

### 3+ Direct Quotes:
1. *"I'm not much into AI shit apart from making it write my code"*
2. *"I believe Grab has the subscription for all of the employees, they pay for it."*
3. *"They must have this, enterprise level subscription which offers pool usages... the account of that employee is deactivated and offboarded completely"*
4. *"And I'm actually not sure where the leftovers go."*

### The most surprising thing they said:
The most surprising insight was how different enterprise AI provisioning is compared to startups. I assumed tech giants bled cash on individual ghost seats. Instead, he revealed Grab uses "pool usages" tied to central employee accounts, meaning offboarding is automated. However, he surprisingly noted he wasn't sure "where the leftovers go," highlighting that even with pool licenses, companies are likely locked into paying for empty, inactive slots in their negotiated contracts (Shelfware).

### What it changed about my design/strategy:
This conversation completely changed my GTM strategy and my tool's error handling. 
First, it proved SubTract should not target Enterprise giants like Grab (who have pool licenses), but rather Series A/B startups who rely on decentralized corporate credit cards where Ghost Seats thrive. 
Second, he mentioned non-devs use an internal wrapper ("GrabGPT") for daily tasks. This validated my design decision in the Audit Engine to categorize API-direct tools as a "Review/Flag" rather than trying to calculate per-seat downgrades, since API spend powers these internal company tools.