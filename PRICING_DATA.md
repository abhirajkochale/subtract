# Pricing Data Reference
*Verified: 2026-05-21*

This document serves as the single source of truth for the baseline prices used by the SubTract audit engine. All prices are in USD and represent the monthly cost per user/seat for standard commercial plans.

> **Compliance Note:** The engine compares these exact prices against the user's reported spend to calculate `downgrade`, `switch`, and `flag` (anomaly) recommendations.

## Coding Tools

### Cursor
* **URL:** [https://cursor.com/pricing](https://cursor.com/pricing)
* **Hobby:** $0/mo
* **Individual:** $20/mo
* **Teams:** $40/mo

### GitHub Copilot
* **URL:** [https://github.com/features/copilot/plans](https://github.com/features/copilot/plans)
* **Individual:** $10/mo
* **Business:** $19/mo
* **Enterprise:** $39/mo

### Windsurf
* **URL:** [https://windsurf.com/pricing](https://windsurf.com/pricing)
* **Free:** $0/mo
* **Pro:** $20/mo
* **Max:** $200/mo

## Writing & Research Assistants

### ChatGPT
* **URL:** [https://chatgpt.com/pricing](https://chatgpt.com/pricing)
* **Free:** $0/mo
* **Plus:** $20/mo
* **Team:** $30/mo
* **Pro:** $200/mo

### Claude
* **URL:** [https://claude.com/pricing](https://claude.com/pricing)
* **Free:** $0/mo
* **Pro:** $20/mo
* **Team:** $25/mo
* **Max:** $100/mo

### Google Gemini
* **URL:** [https://gemini.google.com/subscriptions/](https://gemini.google.com/subscriptions/)
* **Free:** $0/mo
* **Plus:** $5/mo
* **Pro:** $20/mo
* **Ultra:** $65/mo

## API & Infrastructure

### Anthropic API
* **URL:** [https://claude.com/pricing#api](https://claude.com/pricing#api)
* **Pricing Model:** Pay-per-token (usage-based)
* *Engine Note: Usage-based tools do not have a fixed monthly seat cost. SubTract analyzes them strictly for unexpected overspend anomalies.*

### OpenAI API
* **URL:** [https://openai.com/api/pricing/](https://openai.com/api/pricing/)
* **Pricing Model:** Pay-per-token (usage-based)
* *Engine Note: Usage-based tools do not have a fixed monthly seat cost. SubTract analyzes them strictly for unexpected overspend anomalies.*
