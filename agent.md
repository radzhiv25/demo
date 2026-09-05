# MealPilot Agent Design

## Overview
MealPilot's AI agent is a Claude claude-sonnet-4-6 instance that orchestrates Swiggy MCP tool calls
to fulfil healthy family meal requests. It runs server-side (Next.js API route) and
maintains a short agentic loop: think → call tool → observe result → repeat → respond.

## System Prompt

```
You are MealPilot, a friendly AI that helps families order healthy food from Swiggy.

## Your role
- Help families find nutritious, balanced meals suited to their dietary goals
- Manage the ordering flow end-to-end: search → menu → cart → order
- Always respect the family's budget, headcount, and dietary restrictions
- Be concise. Families are busy — no long lectures about nutrition.

## Family context
You receive a `familyProfile` object with every request:
{
  members: number,          // how many people to feed
  dietaryPrefs: string[],   // e.g. ["vegetarian", "low-calorie", "high-protein"]
  allergies: string[],      // e.g. ["nuts", "gluten"]
  budgetINR: number,        // max cart total (≤1000 for Builders Club)
  addressId: string         // Swiggy saved address ID
}

## Ordering rules
1. ALWAYS call get_food_cart before placing to verify total ≤ budgetINR
2. NEVER blindly retry place_food_order — call get_food_orders first to check
3. If a restaurant is not "OPEN", skip it silently and try the next one
4. Aim for nutritional variety: at least one protein, one vegetable, one grain per order
5. Prefer options tagged: "healthy", "low-cal", "organic", "salad", "bowl", "grilled"
6. Avoid: "fried", "creamy", "loaded", "extra cheese" unless user explicitly asks

## Response format
After completing tool calls, respond with:
- A brief summary of what you found/did (2-3 sentences max)
- A structured list of items added to cart with per-item price
- Total cart value and any coupon applied
- A friendly health note about why these choices are good for the family
- Next action button hint: "confirm order" or "search more"

## Tool call transparency
Mention which Swiggy data you used, e.g. "I searched 8 restaurants near you and
found 3 with healthy options open right now."

## What you do NOT do
- Store or log any personal data beyond the current session
- Make assumptions about payment method — always present options
- Place an order without the user explicitly confirming
```

## Tool Definitions (Claude tool_use format)

The agent has access to a subset of Swiggy Food MCP tools, wrapped as Claude tools:

### Discovery Tools
| Tool | Swiggy MCP | Description |
|------|-----------|-------------|
| `search_restaurants` | `search_restaurants` | Find open restaurants matching a query near an address |
| `get_restaurant_menu` | `get_restaurant_menu` | Get full menu with items, prices, tags |
| `search_menu` | `search_menu` | Search for specific dishes across a restaurant's menu |

### Cart Tools
| Tool | Swiggy MCP | Description |
|------|-----------|-------------|
| `update_food_cart` | `update_food_cart` | Add/update items in cart |
| `get_food_cart` | `get_food_cart` | Read current cart state |
| `flush_food_cart` | `flush_food_cart` | Clear the cart |
| `fetch_food_coupons` | `fetch_food_coupons` | Get available discount codes |
| `apply_food_coupon` | `apply_food_coupon` | Apply a coupon to the cart |

### Order Tools
| Tool | Swiggy MCP | Description |
|------|-----------|-------------|
| `get_payment_options` | `get_payment_options` | List available payment methods |
| `place_food_order` | `place_food_order` | Place the confirmed order |
| `get_food_orders` | `get_food_orders` | List recent orders (for idempotency check) |
| `track_food_order` | `track_food_order` | Get live delivery status |

### Address Tools
| Tool | Swiggy MCP | Description |
|------|-----------|-------------|
| `get_addresses` | `get_addresses` | List saved delivery addresses |

## Agentic Loop

```
User message
    │
    ▼
Claude (with family profile + conversation history + tool definitions)
    │
    ├─ [no tool needed] ──────────────────────────────────► Text response to user
    │
    └─ [tool call] ──► Execute Swiggy MCP call (real or mock)
                            │
                            ▼
                       Tool result injected back to Claude
                            │
                            ▼
                       Claude thinks again (up to 8 iterations)
                            │
                            ▼
                       Final text response to user
```

## Typical Conversation Flows

### Flow 1: Discover and Order
```
User:  "Find me a healthy vegetarian dinner for 4 people tonight"
Agent: search_restaurants(addressId, "healthy vegetarian")
       → 3 open restaurants found
       get_restaurant_menu(bestRestaurantId)
       → 47 items returned, agent filters for healthy tags
       update_food_cart(restaurantId, [paneerBowl×2, dalKhichdi×1, sproutSalad×1])
       get_food_cart()
       → ₹780 total, under ₹1000 budget ✓
       fetch_food_coupons()
       → HEALTHY10 applies: ₹78 off → ₹702 final
       apply_food_coupon("HEALTHY10")

       "I found Green Bowl restaurant (4.2★, 28 min). Added to your cart:
        • Paneer Quinoa Bowl ×2 — ₹260
        • Dal Khichdi ×1 — ₹160
        • Sprout Chaat Salad ×1 — ₹130
        Subtotal: ₹702 (after HEALTHY10 coupon). 
        High protein, zero maida — great for a family weeknight.
        Want me to place the order?"
```

### Flow 2: Budget Adjustment
```
User:  "That's too much, keep it under ₹500"
Agent: flush_food_cart()
       update_food_cart(restaurantId, [dalKhichdi×2, sproutSalad×2])
       get_food_cart() → ₹468 ✓

       "Done! Swapped to a lighter combo under ₹500:
        • Dal Khichdi ×2 — ₹320
        • Sprout Chaat Salad ×2 — ₹148 (wait, let me recalculate)
        Total: ₹468. Shall I place it?"
```

### Flow 3: Place Order
```
User:  "Yes, place it"
Agent: get_payment_options(addressId)
       → [COD, Google Pay, PhonePe]

       "Payment options: Cash on Delivery, Google Pay, PhonePe.
        Which would you prefer?"

User:  "GPay"
Agent: get_food_orders() → no recent duplicate order ✓ (idempotency check)
       place_food_order(paymentMethod="UPI", intentApp="googlepay", addressId, lat, lng)
       → orderId: ORD-12345, status: PENDING_PAYMENT, paasId: xxx
       check_payment_status(paasId, orderId, ...) → success

       "Order placed! ORD-12345 confirmed.
        Estimated delivery: 32 minutes.
        I'll update you when it's picked up."
```

## Mock Mode

When `SWIGGY_ACCESS_TOKEN` is not set, the Swiggy client returns deterministic mock
data so the full UI flow works without credentials. Mock data includes:

- 4 restaurants: Green Bowl, Fitness Kitchen, Sattvic Kitchen, The Protein Co.
- 8-12 healthy menu items per restaurant with realistic prices
- Simulated cart state, coupon HEALTHY10 (10% off), mock order IDs
- Fake tracking status cycling: CONFIRMED → PREPARING → PICKED_UP → DELIVERED

## Error Handling

| Scenario | Agent behaviour |
|----------|----------------|
| Restaurant CLOSED | Skip silently, try next result |
| Cart total > budgetINR | Remove lowest priority item, recalculate |
| 429 rate limit | Inform user: "Swiggy is busy, trying again in a moment" |
| 5xx from Swiggy | Check `get_food_orders` before retrying `place_food_order` |
| Token expired (401) | Return error prompting user to re-authenticate |
| No open restaurants | Suggest Instamart for grocery + home cooking (Phase 2) |

## Context Window Management

Each API call to Claude includes:
- System prompt (above)
- Family profile (injected as first user message context)
- Last 10 conversation turns (older turns trimmed)
- Tool results inline (Swiggy responses, truncated to 2000 chars if large)

Max tool iterations per request: **8** (prevents runaway loops)
Max input tokens budget: **40,000** (leaves room for tool results)
