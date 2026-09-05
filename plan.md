# MealPilot — Product Plan

## What We're Building
An AI-powered healthy family meal planner that uses Swiggy's MCP platform.
Families describe what they want (dietary goals, budget, headcount), and an AI agent
finds the best healthy options on Swiggy, builds a cart, and places the order.

## Problem
Families struggle to consistently order *healthy* food from delivery apps. The default
UX surfaces popular (often unhealthy) options. There's no concept of "family
nutritional goals" or "meal planning" in standard delivery apps.

## Solution
MealPilot wraps Swiggy's 49 MCP tools behind a conversational AI agent tuned for
healthy family eating:
- You tell it your family profile once (size, dietary goals, allergies, budget)
- Each session you just say what you need ("healthy dinner tonight, 4 people")
- The agent finds, curates, and orders the right food — no browsing required

## MVP Scope (Demo-ready)

### Phase 1 (current) — Food ordering flow
- [ ] Landing page explaining the product
- [ ] Family profile setup (members, diet preferences, delivery address)
- [ ] AI chat interface powered by Claude + Swiggy Food MCP
- [ ] Agent searches restaurants, suggests healthy dishes, manages cart
- [ ] Order confirmation + basic tracking

### Phase 2 (post-demo)
- Instamart integration: weekly healthy grocery basket
- Dineout: family restaurant reservations with healthy menu pre-selection
- Meal history and nutrition tracking
- Recurring weekly meal plans

## Tech Stack

| Layer        | Tech                          |
|--------------|-------------------------------|
| Frontend     | Next.js 16 (App Router)       |
| UI           | shadcn/base-ui + Tailwind v4  |
| AI Agent     | Claude claude-sonnet-4-6 via Anthropic SDK |
| Swiggy       | MCP over JSON-RPC (Food server) |
| Auth         | OAuth 2.1 PKCE (Swiggy)       |
| State        | localStorage (family profile) |
| Hosting      | Vercel (planned)              |

## Swiggy MCP Endpoints

| Server    | Base URL                          | Staging                               |
|-----------|-----------------------------------|---------------------------------------|
| Food      | `https://mcp.swiggy.com/food`     | `https://mcp-staging.swiggy.com/food` |
| Instamart | `https://mcp.swiggy.com/instamart`| (Phase 2)                             |
| Dineout   | `https://mcp.swiggy.com/dineout`  | (Phase 2)                             |

## Key Constraints (from Swiggy docs)
- Food cart cap: ₹1000 per Builders Club origin order
- Instamart minimum: ₹99
- Rate limit: 70 read requests/min, 30 write requests/min
- Token lifetime: 5 days (no refresh tokens in v1.0) — re-run OAuth on expiry
- No PII storage beyond session scope (DPDP 2023 compliance)
- `place_food_order` is NOT idempotent — always check `get_food_orders` before retry

## App Structure

```
app/
  page.tsx                 # Landing page
  setup/page.tsx           # Family profile onboarding
  chat/page.tsx            # Main AI chat interface
  api/chat/route.ts        # Claude agent with Swiggy tool loop
  api/order/route.ts       # Order status proxy (Phase 2)

lib/
  swiggy/
    types.ts               # TypeScript interfaces for all Swiggy responses
    client.ts              # MCP JSON-RPC client (real + mock mode)
    mock.ts                # Realistic mock data for dev without credentials
    tools.ts               # Claude tool_use definitions mirroring Swiggy MCP
  family-profile.ts        # localStorage helper for family profile

components/
  ui/button.tsx            # Existing
  meal-card.tsx            # Restaurant / dish card
  chat-message.tsx         # Chat bubble (user + agent)
  tool-call-badge.tsx      # Shows which Swiggy tools the agent used
  family-setup-form.tsx    # Onboarding form
```

## Environment Variables

```bash
# Required for real Swiggy calls (staging/prod)
SWIGGY_ACCESS_TOKEN=         # OAuth 2.1 Bearer token
SWIGGY_BASE_URL=https://mcp-staging.swiggy.com  # or mcp.swiggy.com

# Required for Claude agent
ANTHROPIC_API_KEY=

# Omit SWIGGY_ACCESS_TOKEN to run in MOCK mode (great for local dev + demo)
```

## Demo Flow (for Swiggy team)

1. Open `http://localhost:3000`
2. Click "Get Started" → fill family profile (4 members, vegetarian, ₹800 budget)
3. Go to chat → type "Find me a healthy dinner for tonight"
4. Watch agent call `search_restaurants` → `get_restaurant_menu` → `update_food_cart`
5. Agent presents meal summary with health notes
6. User clicks "Place Order" → agent calls `place_food_order` → shows order ID
7. Live tracking via `track_food_order`

## Success Metrics for MVP
- Agent successfully completes end-to-end order flow in < 4 turns
- All 5 healthy restaurant categories surfaced: salads, bowls, Indian healthy, protein, juices
- Cart always respects ₹1000 cap and family headcount
- Zero PII logged (user IDs hashed, no meal data stored server-side)
