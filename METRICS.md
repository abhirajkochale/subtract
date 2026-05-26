# Metrics & Pivot Triggers

## The North Star Metric
**Qualified Leads Generated per Week**

A "Qualified Lead" is defined as a user who:
1. Ran an audit that found >$500 in monthly savings.
2. Submitted a valid work email address via the "Partner with Credex" CTA.

*Why this metric?* 
SubTract is a lead-generation tool. Tracking total website visitors or total audits run is a vanity metric. If a million junior developers run the audit but none of them are decision-makers who can hire Credex, the tool has failed its business objective. 

## Secondary Input Metrics
To diagnose why the North Star metric might be underperforming, we will track three supporting input metrics:

1. **Audit Completion Rate:** (Total Audits Run / Total Unique Visitors). This measures if the initial form (tools, seats, spend) is too much friction.
2. **Viral Coefficient (K-factor):** How many new audits are initiated directly from a shared `[id]` link. This measures if the social sharing feature is actually working.
3. **AI Fallback Rate:** How often the Gemini API fails and defaults to the template text. If this is >5%, we need to switch LLM providers to ensure quality.

## The Pivot Trigger
**We will pivot if the Lead Conversion Rate (Qualified Leads / Total Qualified Audits) remains below 1% after 1,000 completed audits.**

*The Rationale:* 
If 1,000 engineering leaders discover they are wasting thousands of dollars a year, but fewer than 10 of them ask for Credex's help to fix it, it means our core assumption is wrong. It means CTOs prefer to cancel the subscriptions manually rather than hiring a third-party negotiation firm. 

*The Pivot:* 
If this trigger is hit, we pivot SubTract from a lead-magnet into a standalone SaaS product. We would build out OAuth integrations (GitHub, Google Workspace) to automatically detect ghost seats, and charge a flat $49/mo subscription for the visibility dashboard, abandoning the percentage-based negotiation model entirely.
