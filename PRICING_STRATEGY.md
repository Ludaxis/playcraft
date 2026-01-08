# PlayCraft Pricing Strategy

**Created:** January 8, 2026
**Status:** Strategic Plan
**Version:** 1.0

---

## Executive Summary

This document defines PlayCraft's comprehensive pricing strategy, incorporating a dual-credit system inspired by Base44 (separating builder costs from runtime costs), complexity-based pricing like Lovable, and gaming-specific features that differentiate us from general app builders.

### Strategic Position

PlayCraft is an **AI-powered game builder** competing in the vibe coding market ($3.9B in 2024, projected $37B by 2032). Unlike Lovable/Bolt.new (general app builders), we focus specifically on **game development**, requiring specialized pricing for:

- AI code generation (builder-facing)
- Multiplayer infrastructure (runtime)
- Leaderboard hosting (runtime)
- Analytics processing (runtime)
- Custom domains (infrastructure)

---

## Credit System Architecture

### Dual-Credit Model (Inspired by Base44)

PlayCraft uses **two types of credits** to fairly price builder vs. player-facing costs:

```
┌─────────────────────────────────────────────────────────────┐
│                    PLAYCRAFT CREDITS                        │
├─────────────────────────┬───────────────────────────────────┤
│     BUILD CREDITS       │         RUNTIME CREDITS           │
│    (Builder-facing)     │         (Player-facing)           │
├─────────────────────────┼───────────────────────────────────┤
│ • AI code generation    │ • Multiplayer connections         │
│ • AI chat/explain       │ • Leaderboard API calls           │
│ • AI debugging          │ • Analytics events                │
│ • Asset generation      │ • Cloud save sync                 │
│                         │ • Real-time game state            │
└─────────────────────────┴───────────────────────────────────┘
```

### Why Dual Credits?

| Scenario | Single Credit Problem | Dual Credit Solution |
|----------|----------------------|---------------------|
| Viral game with 10K players | Builder pays for player usage | Runtime credits scale separately |
| Heavy AI user, simple game | Overpays for unused runtime | Only pays for what they use |
| Team building multiple games | Unpredictable costs | Clear cost separation |

---

## Build Credits: AI Generation Pricing

### Credit Calculation Formula

```
build_credits = base_cost × complexity_multiplier × context_factor

Where:
├── base_cost = 0.25 (minimum unit)
├── complexity_multiplier = 1.0 - 8.0 (based on intent)
└── context_factor = 1.0 - 1.5 (based on project size)
```

### Complexity Multipliers by Intent

| Intent | Multiplier | Example Prompt | Est. Credits |
|--------|------------|----------------|--------------|
| `tweak` | 1.0 | "Change player speed to 5" | 0.25 |
| `style` | 1.5 | "Make the UI more retro" | 0.40 |
| `explain` | 1.5 | "How does collision work?" | 0.40 |
| `debug` | 2.0 | "Fix the jump bug" | 0.50 |
| `modify` | 2.5 | "Add a pause menu" | 0.65 |
| `add` | 3.5 | "Add power-ups system" | 0.90 |
| `create` | 5.0 | "Create a boss enemy" | 1.25 |
| `generate` | 8.0 | "Build a complete platformer" | 2.00+ |

### Context Factor (Project Size)

| Project Lines | Factor | Rationale |
|---------------|--------|-----------|
| < 500 | 1.0 | Small game, minimal context |
| 500 - 2000 | 1.15 | Medium game |
| 2000 - 5000 | 1.3 | Large game |
| > 5000 | 1.5 | Complex game, heavy context |

### Gaming-Specific AI Tasks

| Task Category | Multiplier | Examples |
|---------------|------------|----------|
| **Physics** | 2.5 | Collision detection, gravity, projectiles |
| **AI/NPCs** | 3.0 | Enemy behavior, pathfinding, state machines |
| **Multiplayer** | 4.0 | Sync code, lobby system, matchmaking |
| **Procedural** | 3.5 | Level generation, randomization |
| **Animation** | 2.0 | Sprite animations, tweening |
| **Audio** | 1.5 | Sound effects, music integration |
| **UI/Menus** | 2.0 | HUD, menus, dialogs |

### Free Actions (No Build Credits)

- Manual code editing
- Using visual editor
- Previewing/testing game
- Exporting game files
- Viewing documentation
- Browsing templates

---

## Runtime Credits: Player-Facing Features

### Runtime Credit Consumption

| Feature | Credits/Unit | Unit | Notes |
|---------|--------------|------|-------|
| **Multiplayer** | | | |
| └ Connection (per player/hour) | 1 | hour | WebSocket connection |
| └ Game state sync | 0.1 | 1K messages | Real-time updates |
| └ Matchmaking request | 0.5 | request | Lobby/matching |
| **Leaderboard** | | | |
| └ Score submission | 0.1 | submission | Write to leaderboard |
| └ Leaderboard fetch | 0.05 | fetch | Read leaderboard |
| └ Player rank lookup | 0.05 | lookup | Individual rank |
| **Analytics** | | | |
| └ Event tracking | 0.01 | event | Custom events |
| └ Session recording | 0.5 | session | Full session data |
| └ Heatmap generation | 2.0 | generation | Visual analytics |
| **Cloud Save** | | | |
| └ Save sync | 0.1 | sync | Player progress |
| └ Storage (per 10MB/month) | 1.0 | 10MB | Data storage |

### Runtime Credit Calculation Example

**Scenario**: Casual mobile game with 1,000 daily active players

```
Daily Runtime Cost Estimate:
├── Multiplayer (if enabled)
│   └── 100 concurrent × 2 hrs avg = 200 credits/day
├── Leaderboard
│   └── 1,000 score submissions = 100 credits/day
│   └── 5,000 leaderboard views = 250 credits/day
├── Analytics
│   └── 10,000 events = 100 credits/day
│   └── 1,000 sessions = 500 credits/day
└── Cloud Save
    └── 500 syncs = 50 credits/day

TOTAL: ~1,200 runtime credits/day = 36,000/month
```

---

## Pricing Tiers

### Tier Comparison with Competitors

| | PlayCraft | Lovable | Bolt.new | Replit | Base44 |
|---|-----------|---------|----------|--------|--------|
| **Free** | $0 | $0 | $0 | $0 | $0 |
| **Entry** | $12/mo | $21/mo | $20/mo | $20/mo | $16/mo |
| **Pro** | $29/mo | $42/mo | $50/mo | $25/mo | $40/mo |
| **Business** | $59/mo | $50/user | $100/mo | $35/user | $80/mo |

### PlayCraft Pricing Tiers

---

#### Free Plan - $0/month
*For hobbyists and learners*

**Build Credits**
- 25 credits/month
- +3 bonus credits/day (use-it-or-lose-it)
- ~50 AI generations/month

**Runtime Credits**
- 500 credits/month
- Supports ~500 players/month (light usage)

**Features**
- Public projects only
- "Made with PlayCraft" watermark on games
- 1 published game
- Community templates
- Basic analytics (7-day retention)
- Community support

**Limits**
- Max 3 projects
- No custom domain
- No multiplayer
- No leaderboard API

---

#### Starter Plan - $12/month ($10/mo annual)
*For indie developers getting started*

**Build Credits**
- 100 credits/month
- +5 bonus credits/day
- ~150 AI generations/month
- Rollover: up to 100 credits

**Runtime Credits**
- 5,000 credits/month
- Supports ~2,000 players/month
- Rollover: up to 2,500 credits

**Features**
- Private projects
- No watermark
- 3 published games
- Remove "Made with PlayCraft"
- Basic analytics (30-day retention)
- Email support

**Unlocks**
- Leaderboard (basic): 1 leaderboard per game
- Cloud saves: 50MB storage

---

#### Pro Plan - $29/month ($24/mo annual)
*For serious indie developers*

**Build Credits**
- 350 credits/month
- +10 bonus credits/day
- ~500 AI generations/month
- Rollover: up to 350 credits

**Runtime Credits**
- 25,000 credits/month
- Supports ~10,000 players/month
- Rollover: up to 12,500 credits

**Features**
- Everything in Starter
- **Custom domain** for published games
- Priority AI generation queue
- Advanced analytics (90-day retention)
- Priority support
- 10 published games

**Unlocks**
- Leaderboard (advanced): Unlimited leaderboards, filters, time periods
- Multiplayer: Up to 8 concurrent players/room
- Cloud saves: 500MB storage
- Export to native (Electron wrapper)

---

#### Business Plan - $59/month ($49/mo annual)
*For studios and commercial games*

**Build Credits**
- 1,000 credits/month
- +25 bonus credits/day
- ~1,500 AI generations/month
- Unlimited rollover

**Runtime Credits**
- 100,000 credits/month
- Supports ~50,000 players/month
- Unlimited rollover

**Features**
- Everything in Pro
- Team collaboration (3 seats included)
- API access for automation
- White-label option
- Analytics export (CSV, JSON)
- Dedicated support
- Unlimited published games

**Unlocks**
- Multiplayer: Up to 32 concurrent players/room
- Cloud saves: 5GB storage
- Custom analytics events
- Webhook integrations
- Revenue share: 0% (vs 5% on lower tiers)

---

#### Enterprise - Custom Pricing
*For large studios and educational institutions*

**Credits**
- Custom allocation
- Volume discounts (up to 40% off)
- Dedicated credit pools per team

**Features**
- Everything in Business
- SSO/SAML authentication
- SLA guarantee (99.9% uptime)
- Dedicated infrastructure
- Custom integrations
- On-premise option
- Account manager
- Training sessions

---

### Add-On Credit Packs

| Pack | Build Credits | Runtime Credits | Price | Savings |
|------|---------------|-----------------|-------|---------|
| Starter Pack | 50 | 2,500 | $5 | - |
| Builder Pack | 150 | 7,500 | $12 | 20% |
| Power Pack | 500 | 25,000 | $35 | 30% |
| Studio Pack | 2,000 | 100,000 | $120 | 40% |

*Credit packs never expire and stack with subscription credits*

---

## Feature Availability Matrix

| Feature | Free | Starter | Pro | Business |
|---------|------|---------|-----|----------|
| **AI Generation** | | | | |
| Basic generation | ✓ | ✓ | ✓ | ✓ |
| Complex generation | Limited | ✓ | ✓ | ✓ |
| Priority queue | ✗ | ✗ | ✓ | ✓ |
| **Publishing** | | | | |
| Public games | ✓ | ✓ | ✓ | ✓ |
| Private games | ✗ | ✓ | ✓ | ✓ |
| Custom domain | ✗ | ✗ | ✓ | ✓ |
| Remove watermark | ✗ | ✓ | ✓ | ✓ |
| **Multiplayer** | | | | |
| Local multiplayer | ✓ | ✓ | ✓ | ✓ |
| Online (2 players) | ✗ | ✗ | ✓ | ✓ |
| Online (8 players) | ✗ | ✗ | ✓ | ✓ |
| Online (32 players) | ✗ | ✗ | ✗ | ✓ |
| **Leaderboard** | | | | |
| View only | ✓ | ✓ | ✓ | ✓ |
| 1 leaderboard/game | ✗ | ✓ | ✓ | ✓ |
| Unlimited leaderboards | ✗ | ✗ | ✓ | ✓ |
| Time-based filters | ✗ | ✗ | ✓ | ✓ |
| **Analytics** | | | | |
| Basic (plays, time) | ✓ | ✓ | ✓ | ✓ |
| Retention (7 days) | ✓ | ✓ | ✓ | ✓ |
| Retention (30 days) | ✗ | ✓ | ✓ | ✓ |
| Retention (90 days) | ✗ | ✗ | ✓ | ✓ |
| Custom events | ✗ | ✗ | ✓ | ✓ |
| Heatmaps | ✗ | ✗ | ✓ | ✓ |
| Export data | ✗ | ✗ | ✗ | ✓ |
| **Cloud Saves** | | | | |
| Local saves | ✓ | ✓ | ✓ | ✓ |
| Cloud sync | ✗ | ✓ | ✓ | ✓ |
| Storage limit | - | 50MB | 500MB | 5GB |
| **Support** | | | | |
| Community | ✓ | ✓ | ✓ | ✓ |
| Email | ✗ | ✓ | ✓ | ✓ |
| Priority | ✗ | ✗ | ✓ | ✓ |
| Dedicated | ✗ | ✗ | ✗ | ✓ |

---

## Profitability Analysis

### Cost Structure

#### Build Credit Costs (AI API)

| Model | Input Cost | Output Cost | Avg Cost/Generation |
|-------|------------|-------------|---------------------|
| Claude 3.5 Sonnet | $3.00/1M | $15.00/1M | $0.015 |
| Gemini 1.5 Flash | $0.075/1M | $0.30/1M | $0.002 |
| **Blended** (70% Gemini, 30% Claude) | - | - | **$0.006** |

**Build Credit Unit Economics**
```
Revenue per build credit: $0.12 (at $12/100 credits)
Cost per build credit: ~$0.024 (avg generation)
Gross margin: 80%
```

#### Runtime Credit Costs (Infrastructure)

| Service | Cost Basis | Est. Cost/Credit |
|---------|------------|------------------|
| Multiplayer (WebSocket) | $0.10/1K connections | $0.001 |
| Leaderboard (DB ops) | $0.25/1M reads | $0.0001 |
| Analytics (events) | $0.10/1M events | $0.00001 |
| Cloud saves (storage) | $0.023/GB/month | $0.002 |
| **Blended average** | - | **$0.0008** |

**Runtime Credit Unit Economics**
```
Revenue per runtime credit: $0.0024 (at $12/5,000 credits)
Cost per runtime credit: ~$0.0008
Gross margin: 67%
```

### Tier Profitability

| Plan | Monthly Revenue | Est. Costs | Gross Profit | Margin |
|------|-----------------|------------|--------------|--------|
| Free | $0 | $0.50 | -$0.50 | N/A |
| Starter | $12 | $3.20 | $8.80 | 73% |
| Pro | $29 | $6.50 | $22.50 | 78% |
| Business | $59 | $12.00 | $47.00 | 80% |

### Break-Even Analysis

| Metric | Target |
|--------|--------|
| Free → Paid conversion | 5% |
| CAC (Customer Acquisition Cost) | < $30 |
| LTV (Lifetime Value) | > $150 |
| LTV:CAC ratio | > 5:1 |
| Payback period | < 3 months |

---

## Conversion Strategy

### Free → Starter Triggers

1. **Project limit hit** (3 projects)
2. **Want private project**
3. **Need leaderboard** for competitive game
4. **Want cloud saves** for player retention
5. **Remove watermark** for professional look

### Starter → Pro Triggers

1. **Custom domain** for branding
2. **Multiplayer** game requirements
3. **Advanced analytics** for optimization
4. **Higher player volume** needs more runtime credits
5. **More published games** (>3)

### Pro → Business Triggers

1. **Team collaboration** needed
2. **API access** for automation
3. **Commercial success** → remove revenue share
4. **Large player base** (>10K/month)
5. **Enterprise features** (white-label, webhooks)

---

## Implementation Roadmap

### Phase 1: Core Credit System (Current Priority)
- [ ] Build credit tracking
- [ ] Credit balance UI
- [ ] Pre-generation estimates
- [ ] Post-generation receipts
- [ ] Basic Stripe integration

### Phase 2: Runtime Credits
- [ ] Runtime credit schema
- [ ] Leaderboard integration + metering
- [ ] Analytics event tracking
- [ ] Cloud save metering
- [ ] Usage dashboards

### Phase 3: Multiplayer Monetization
- [ ] Multiplayer infrastructure
- [ ] Connection-based billing
- [ ] Room management
- [ ] Overage handling

### Phase 4: Advanced Features
- [ ] Custom domains
- [ ] Team collaboration
- [ ] API access
- [ ] White-label options

---

## Competitive Advantages

### vs. Lovable/Bolt.new (General App Builders)

| Advantage | PlayCraft | Competitors |
|-----------|-----------|-------------|
| Game-specific AI | Trained on game patterns | Generic app code |
| Multiplayer built-in | Native support | DIY integration |
| Leaderboards | One-click setup | Custom backend needed |
| Game analytics | Player behavior focus | Generic web analytics |
| Runtime pricing | Scales with players | N/A |

### vs. Unity/Godot (Traditional Engines)

| Advantage | PlayCraft | Traditional |
|-----------|-----------|-------------|
| Learning curve | Minutes | Months |
| AI assistance | Native | Plugins only |
| Web deployment | Instant | Complex setup |
| Multiplayer | Built-in | Extensive work |
| Price | $12-59/mo | Free + hosting costs |

---

## Risk Mitigation

### Heavy AI Users

**Risk**: Users generating massive amounts, crushing margins
**Mitigation**:
- Daily bonus caps limit daily generation
- Complexity multipliers charge more for expensive operations
- Overage pricing after credit exhaustion

### Viral Game Scenarios

**Risk**: Game goes viral, runtime costs explode
**Mitigation**:
- Runtime credits scale separately from build credits
- Overage notifications at 80%, 100%
- Auto-pause option at limit (user configurable)
- Easy upgrade path + credit packs

### Free Tier Abuse

**Risk**: Multiple accounts, excessive free usage
**Mitigation**:
- Daily limit (3 credits) prevents hoarding
- No rollover on free tier
- Public projects only (social proof/accountability)
- Rate limiting per IP

---

## Success Metrics

| Metric | Month 1 | Month 6 | Month 12 |
|--------|---------|---------|----------|
| Free users | 1,000 | 10,000 | 50,000 |
| Paid users | 50 | 750 | 4,000 |
| Conversion rate | 5% | 7.5% | 8% |
| MRR | $1,200 | $20,000 | $120,000 |
| Gross margin | 70% | 75% | 78% |
| Churn rate | 12% | 8% | 6% |
| ARPU | $24 | $27 | $30 |

---

## Appendix: Quick Reference

### Build Credit Estimator

```
Simple prompt ("change color"): 0.25 credits
Medium prompt ("add button"): 0.5-1.0 credits
Complex prompt ("add power-ups"): 1.0-2.0 credits
Full generation ("build game"): 2.0-5.0 credits
```

### Runtime Credit Estimator

```
Per 1,000 players/month:
├── Leaderboard only: ~500 credits
├── Analytics (basic): ~300 credits
├── Cloud saves: ~200 credits
├── Multiplayer (casual): ~2,000 credits
└── Multiplayer (real-time): ~5,000 credits
```

### Plan Selector Guide

```
"I'm learning" → Free
"I want to publish" → Starter ($12/mo)
"I want multiplayer/custom domain" → Pro ($29/mo)
"I'm building commercially" → Business ($59/mo)
"I'm a studio/school" → Enterprise
```

---

## References

- [PlayCraft Credit System Spec](./CREDIT_SYSTEM_SPEC.md)
- [Credit Pricing Research](./CREDIT_PRICING_RESEARCH.md)
- [Lovable Pricing](https://lovable.dev/pricing)
- [Replit Effort-Based Pricing](https://blog.replit.com/effort-based-pricing)
- [Base44 Dual Credit Model](https://base44.com/pricing)
- [Bolt.new Token System](https://bolt.new/pricing)
