# PlayCraft Credit System Specification

**Created:** January 6, 2026
**Status:** Draft
**Priority:** P1 - Revenue Critical

---

## Executive Summary

Implement a hybrid credit system that combines **complexity-based pricing** (user-friendly) with **actual token tracking** (cost-accurate). Users see simple "credits" while the backend tracks real costs for margin management.

---

## Research Summary

### Industry Benchmarks

| Platform | Model | Free Tier | Entry Paid | Pro Tier |
|----------|-------|-----------|------------|----------|
| Lovable.dev | Complexity-based credits | 30/mo | $21/mo (100 credits) | $42/mo (200 credits) |
| Bolt.new | Raw token-based | 1M tokens/mo | $20/mo (10M tokens) | $50/mo (26M tokens) |
| Replit Agent | Effort-based ($) | Limited | $25/mo ($25 credits) | $40/mo ($40 credits) |
| Base44 | Dual-credit | 25 msg + 500 int | $16/mo | $40/mo |

### Key Insights

1. **Lovable** - Best UX: Users understand "credits" better than "tokens"
2. **Bolt.new** - Most transparent: Direct token pass-through
3. **Replit** - Best scaling: Effort-based adapts to complexity
4. **Base44** - Best for SaaS: Separates dev cost from runtime cost

---

## PlayCraft Credit Model

### Core Principles

1. **Simplicity**: Users see "credits" not "tokens"
2. **Fairness**: Complex requests cost more than simple ones
3. **Transparency**: Show cost before/after each generation
4. **Predictability**: Users can estimate costs before acting
5. **Profitability**: Maintain 40-60% margin on AI costs

### Credit Calculation Formula

```
credits_charged = base_credits × complexity_multiplier × model_weight

Where:
- base_credits = total_tokens / 10,000 (1 credit = 10K tokens)
- complexity_multiplier = 0.25 to 3.0 based on intent
- model_weight = 1.0 (Claude) or 0.3 (Gemini - cheaper)
```

### Complexity Multipliers

| Intent Type | Multiplier | Example | Typical Cost |
|-------------|------------|---------|--------------|
| `tweak` | 0.25 | "Change button color to blue" | 0.25 credits |
| `style` | 0.50 | "Make the UI more modern" | 0.5 credits |
| `explain` | 0.50 | "How does the score system work?" | 0.5 credits |
| `debug` | 0.75 | "Fix the collision detection bug" | 0.75 credits |
| `modify` | 1.00 | "Add a pause button" | 1.0 credits |
| `add` | 1.25 | "Add a power-up system" | 1.5 credits |
| `create` | 2.00 | "Create a new enemy type" | 2.0 credits |
| `generate` | 3.00 | "Build a complete snake game" | 5.0+ credits |

### Minimum Charge

- Minimum: **0.25 credits** per generation (prevents abuse)
- Free tier gets daily refresh to encourage return visits

---

## Pricing Tiers

### Free Plan - $0/month
- **30 credits/month** (refreshes monthly)
- **5 bonus credits/day** (use it or lose it)
- Public projects only
- "Made with PlayCraft" watermark
- Community support

### Starter Plan - $15/month
- **150 credits/month**
- Unused credits roll over (max 150)
- Private projects
- No watermark
- Email support

### Pro Plan - $35/month
- **500 credits/month**
- **+15 bonus credits/day**
- Unused credits roll over (max 500)
- Custom domain for published games
- Priority generation queue
- Priority support

### Team Plan - $75/month
- **1,500 credits/month**
- **+50 bonus credits/day**
- Unlimited rollover
- Team collaboration (5 seats)
- API access
- Dedicated support

### Enterprise - Custom
- Volume discounts
- SSO/SAML
- SLA guarantees
- Custom integrations

---

## Database Schema

### User Credits Table

```sql
CREATE TABLE playcraft_user_credits (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Plan info
  plan TEXT NOT NULL DEFAULT 'free'
    CHECK (plan IN ('free', 'starter', 'pro', 'team', 'enterprise')),
  plan_started_at TIMESTAMPTZ,
  plan_expires_at TIMESTAMPTZ,

  -- Credit balances
  credits_balance DECIMAL(10,4) NOT NULL DEFAULT 30,
  daily_bonus_remaining DECIMAL(10,4) DEFAULT 5,
  rollover_credits DECIMAL(10,4) DEFAULT 0,

  -- Usage tracking
  credits_used_today DECIMAL(10,4) DEFAULT 0,
  credits_used_this_month DECIMAL(10,4) DEFAULT 0,
  generations_today INTEGER DEFAULT 0,
  generations_this_month INTEGER DEFAULT 0,

  -- Billing cycle
  billing_cycle_start TIMESTAMPTZ DEFAULT NOW(),
  last_daily_refresh TIMESTAMPTZ DEFAULT NOW(),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_credits_plan ON playcraft_user_credits(plan);
CREATE INDEX idx_credits_balance ON playcraft_user_credits(credits_balance);
```

### Credit Transactions Ledger

```sql
CREATE TABLE playcraft_credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Transaction type
  type TEXT NOT NULL CHECK (type IN (
    'generation',      -- AI generation usage
    'monthly_grant',   -- Monthly credit refresh
    'daily_bonus',     -- Daily bonus credits
    'rollover',        -- Rolled over from previous month
    'purchase',        -- Bought credits
    'refund',          -- Refund for failed generation
    'adjustment',      -- Manual admin adjustment
    'upgrade_bonus'    -- Bonus for upgrading plan
  )),

  -- Amount (negative = deduction, positive = addition)
  amount DECIMAL(10,4) NOT NULL,
  balance_before DECIMAL(10,4) NOT NULL,
  balance_after DECIMAL(10,4) NOT NULL,

  -- Reference to generation (if applicable)
  generation_id UUID REFERENCES playcraft_generation_outcomes(id),

  -- Details
  description TEXT,
  metadata JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_transactions_user ON playcraft_credit_transactions(user_id, created_at DESC);
CREATE INDEX idx_transactions_type ON playcraft_credit_transactions(type);
CREATE INDEX idx_transactions_generation ON playcraft_credit_transactions(generation_id);
```

### Update Generation Outcomes Table

```sql
ALTER TABLE playcraft_generation_outcomes ADD COLUMN IF NOT EXISTS
  -- Token tracking
  input_tokens INTEGER,
  output_tokens INTEGER,
  claude_input_tokens INTEGER,
  claude_output_tokens INTEGER,
  gemini_input_tokens INTEGER,
  gemini_output_tokens INTEGER,

  -- Cost tracking
  complexity_multiplier DECIMAL(3,2) DEFAULT 1.0,
  credits_charged DECIMAL(10,4),
  estimated_cost_usd DECIMAL(10,6), -- Actual API cost

  -- For cost analysis
  model_used TEXT, -- 'claude+gemini', 'gemini-only', etc.
  cached_context_tokens INTEGER DEFAULT 0;
```

---

## API Endpoints

### Check Balance
```
GET /api/credits/balance
Response: {
  balance: 42.5,
  daily_bonus: 3,
  plan: "pro",
  usage_today: 7.5,
  usage_this_month: 157.5
}
```

### Get Usage History
```
GET /api/credits/history?limit=50
Response: {
  transactions: [
    { type: "generation", amount: -1.25, balance_after: 42.5, ... }
  ]
}
```

### Estimate Cost (Pre-generation)
```
POST /api/credits/estimate
Body: { prompt: "Add a leaderboard", context_size: 8 }
Response: {
  estimated_credits: 1.25,
  complexity: "add",
  confidence: 0.85
}
```

### Deduct Credits (Internal)
```
POST /api/credits/deduct
Body: { user_id, generation_id, credits, tokens_breakdown }
```

---

## UI Components

### 1. Credits Badge (Header)
```
┌──────────────────┐
│ ⚡ 42.5 credits  │  <- Click to expand
└──────────────────┘
```

### 2. Usage Tooltip (On hover)
```
┌─────────────────────────────────┐
│ Credits Balance: 42.5          │
│ Daily Bonus: 3 remaining       │
│ ─────────────────────────────  │
│ Used Today: 7.5                │
│ Used This Month: 157.5 / 500   │
│ ─────────────────────────────  │
│ [View History] [Upgrade]       │
└─────────────────────────────────┘
```

### 3. Pre-Generation Estimate
```
┌─────────────────────────────────┐
│ This will use ~1.25 credits    │
│ Balance after: 41.25           │
│ [Generate] [Cancel]            │
└─────────────────────────────────┘
```

### 4. Post-Generation Receipt
```
┌─────────────────────────────────┐
│ ✓ Generated successfully       │
│ Credits used: 1.25             │
│ • Claude (planning): 0.45      │
│ • Gemini (coding): 0.80        │
│ Remaining: 41.25               │
└─────────────────────────────────┘
```

### 5. Low Credit Warning
```
┌─────────────────────────────────┐
│ ⚠️ Low Credits                  │
│ You have 5 credits remaining.  │
│ [Buy Credits] [Upgrade Plan]   │
└─────────────────────────────────┘
```

### 6. Out of Credits Modal
```
┌─────────────────────────────────┐
│ 😢 Out of Credits              │
│                                 │
│ Your daily bonus refreshes in  │
│ 4 hours, or upgrade now:       │
│                                 │
│ [Upgrade to Pro - $35/mo]      │
│ [Buy 50 credits - $5]          │
│ [Wait for refresh]             │
└─────────────────────────────────┘
```

---

## Credit Flow

### Generation Flow
```
1. User submits prompt
2. Classify intent → get complexity_multiplier
3. Estimate tokens → calculate estimated_credits
4. Check user balance >= estimated_credits
   - If no: Show "insufficient credits" modal
   - If yes: Continue
5. Run generation (Claude + Gemini)
6. Calculate actual tokens used
7. Calculate final credits:
   actual_credits = (claude_tokens × 1.0 + gemini_tokens × 0.3) / 10000 × multiplier
8. Deduct credits from user balance
9. Record transaction in ledger
10. Update generation_outcomes with token breakdown
11. Show receipt to user
```

### Daily Bonus Refresh (Cron Job)
```
-- Run at midnight UTC
UPDATE playcraft_user_credits
SET
  daily_bonus_remaining = CASE plan
    WHEN 'free' THEN 5
    WHEN 'starter' THEN 0
    WHEN 'pro' THEN 15
    WHEN 'team' THEN 50
    ELSE 0
  END,
  credits_used_today = 0,
  generations_today = 0,
  last_daily_refresh = NOW()
WHERE last_daily_refresh < CURRENT_DATE;
```

### Monthly Refresh (Cron Job)
```
-- Run on billing cycle date
1. Calculate unused credits
2. Apply rollover (capped at monthly allowance)
3. Grant new monthly credits
4. Reset monthly counters
5. Record transactions in ledger
```

---

## Token-to-Cost Mapping

### Actual API Costs (for margin calculation)

| Model | Input | Output |
|-------|-------|--------|
| Claude 3.5 Sonnet | $3.00/1M | $15.00/1M |
| Gemini 1.5 Flash | $0.075/1M | $0.30/1M |

### Example Cost Breakdown

**Typical generation (10K context, 3K response):**
- Claude: 2K input, 500 output = $0.006 + $0.0075 = $0.0135
- Gemini: 10K input, 3K output = $0.00075 + $0.0009 = $0.00165
- **Total API cost: ~$0.015**
- **Credits charged: 1.0**
- **Revenue per credit: ~$0.07** (at $35/500 credits)
- **Margin: ~80%** ✓

---

## Implementation Phases

### Phase 1: Core Infrastructure (Week 1)
- [ ] Database migrations
- [ ] creditService.ts (balance, deduct, grant)
- [ ] Update edge function to return token counts
- [ ] Credit check before generation

### Phase 2: UI Integration (Week 2)
- [ ] Credits badge component
- [ ] Usage history panel
- [ ] Pre-generation estimate
- [ ] Post-generation receipt
- [ ] Low credit warnings

### Phase 3: Billing Integration (Week 3)
- [ ] Stripe subscription setup
- [ ] Plan upgrade/downgrade flow
- [ ] Credit pack purchases
- [ ] Webhook handlers

### Phase 4: Analytics & Optimization (Week 4)
- [ ] Usage analytics dashboard
- [ ] Margin monitoring
- [ ] Adjust multipliers based on data
- [ ] A/B test pricing

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Free → Paid conversion | >5% |
| Paid churn rate | <8%/month |
| Average revenue per user | >$15/month |
| Gross margin | >60% |
| Credit utilization rate | >70% |

---

## Open Questions

1. **Rollover cap**: Should Pro/Team have unlimited rollover?
2. **Refund policy**: Auto-refund on failed generations?
3. **Team sharing**: Can team members share a credit pool?
4. **API pricing**: Different rates for API access?
5. **Volume discounts**: Discount for buying 500+ credits?

---

## References

- [Lovable Plans and Credits](https://docs.lovable.dev/introduction/plans-and-credits)
- [Bolt.new Tokens](https://support.bolt.new/account-and-subscription/tokens)
- [Replit Effort-Based Pricing](https://blog.replit.com/effort-based-pricing)
- [Base44 Pricing](https://base44.com/blog/how-much-does-base44-cost)
