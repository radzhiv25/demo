/**
 * Demo agent — uses Swiggy mock data to simulate the AI agent flow.
 * No external API calls. Used when OPENROUTER_API_KEY has no credits
 * or when DEMO_MODE=true is set.
 *
 * Detects intent from keywords and runs the appropriate mock Swiggy flow.
 */

import * as swiggy from "./swiggy/client";
import type { FamilyProfile } from "./family-profile";

interface ToolCall {
  tool: string;
  summary: string;
}

interface AgentResult {
  message: string;
  toolCalls: ToolCall[];
}

function detectIntent(text: string) {
  const t = text.toLowerCase();
  const isOrder = /\b(place|confirm|yes|order it|go ahead|proceed|book)\b/.test(t);
  const isTrack = /\b(track|status|where|delivery|arrived)\b/.test(t);
  const isCart = /\b(cart|total|how much|price|cost|budget)\b/.test(t);
  const isClear = /\b(clear|reset|start over|remove|cancel)\b/.test(t);
  return { isOrder, isTrack, isCart, isClear };
}

function formatCart(cart: Awaited<ReturnType<typeof swiggy.getFoodCart>>) {
  if (!cart.items.length) return "_Cart is empty._";
  const lines = cart.items.map(
    (i) => `- **${i.name}** ×${i.quantity} — ₹${i.totalPrice}`
  );
  lines.push(`\n**Subtotal:** ₹${cart.subtotal}`);
  if (cart.discount > 0) lines.push(`**Discount:** −₹${cart.discount} (${cart.couponApplied})`);
  lines.push(`**Delivery:** ₹${cart.deliveryFee}`);
  lines.push(`**Total: ₹${cart.total}**`);
  return lines.join("\n");
}

export async function runDemoAgent(
  userMessage: string,
  familyProfile: FamilyProfile
): Promise<AgentResult> {
  const toolCalls: ToolCall[] = [];
  const { isOrder, isTrack, isCart, isClear } = detectIntent(userMessage);

  function track(tool: string, summary: string) {
    toolCalls.push({ tool, summary });
  }

  // ── Track order ─────────────────────────────────────────────────────────────
  if (isTrack) {
    track("track_food_order", "Tracked order ORD-1001");
    return {
      message: `Your order **ORD-1001** from **Green Bowl** is on its way!\n\n` +
        `**Status:** Your food is being prepared\n` +
        `**Estimated delivery:** 28 minutes\n` +
        `**Delivery partner:** Ravi Kumar\n\n` +
        `Hang tight — your healthy meal is coming soon!`,
      toolCalls,
    };
  }

  // ── View cart ────────────────────────────────────────────────────────────────
  if (isCart) {
    track("get_food_cart", "Checked cart total");
    const cart = await swiggy.getFoodCart();
    if (!cart.items.length) {
      return {
        message: "Your cart is currently empty. Want me to find some healthy options for your family?",
        toolCalls,
      };
    }
    return {
      message: `Here's your current cart:\n\n${formatCart(cart)}\n\nShall I place the order?`,
      toolCalls,
    };
  }

  // ── Clear cart ───────────────────────────────────────────────────────────────
  if (isClear) {
    track("flush_food_cart", "Cleared cart");
    await swiggy.flushFoodCart();
    return {
      message: "Cart cleared! Tell me what healthy meal you'd like to order instead.",
      toolCalls,
    };
  }

  // ── Place order ──────────────────────────────────────────────────────────────
  if (isOrder) {
    track("get_food_orders", "Checked recent orders");
    track("get_payment_options", "Fetched payment options");
    track("place_food_order", "Placed order");

    const cart = await swiggy.getFoodCart();
    if (!cart.items.length) {
      return {
        message: "Your cart is empty! Let me find some healthy options first.",
        toolCalls,
      };
    }

    const order = await swiggy.placeFoodOrder({
      paymentMethod: "COD",
      addressId: familyProfile.addressId,
      lat: 12.9784,
      lng: 77.6408,
    });

    return {
      message:
        `**Order confirmed!** 🎉\n\n` +
        `**Order ID:** ${order.orderId}\n` +
        `**Restaurant:** ${order.restaurantName}\n` +
        `**Total:** ₹${order.total}\n` +
        `**Estimated delivery:** ${order.estimatedDelivery} minutes\n\n` +
        `Payment: Cash on Delivery. You can track your order anytime by asking me "where's my order?"`,
      toolCalls,
    };
  }

  // ── Default: search + menu + build cart ──────────────────────────────────────
  track("get_addresses", "Fetched saved addresses");
  const addresses = await swiggy.getAddresses();
  const address = addresses.find((a) => a.addressId === familyProfile.addressId) ?? addresses[0];

  // Build search query from user message + dietary prefs
  const prefs = familyProfile.dietaryPrefs.join(" ");
  const query = `healthy ${prefs}`;
  track("search_restaurants", `Searched restaurants for "${query}"`);
  const restaurants = await swiggy.searchRestaurants(address.addressId, query);

  if (!restaurants.length) {
    return {
      message: "No healthy restaurants are open right now near your address. Try again in a few minutes, or I can check Instamart for groceries.",
      toolCalls,
    };
  }

  // Pick the best open restaurant (highest rating)
  const best = restaurants.sort((a, b) => b.rating - a.rating)[0];
  track("get_restaurant_menu", `Fetched menu for ${best.name}`);
  const menu = await swiggy.getRestaurantMenu(best.restaurantId);

  // Filter for healthy items matching dietary prefs
  const isVeg = familyProfile.dietaryPrefs.includes("vegetarian") ||
    familyProfile.dietaryPrefs.includes("vegan");
  const healthyItems = menu.items
    .filter((item) => {
      if (isVeg && !item.isVeg) return false;
      const hasHealthTag = item.tags.some((t) =>
        ["healthy", "low-calorie", "high-protein", "organic", "millets", "grilled", "salad", "bowl"].includes(t)
      );
      // Exclude allergies
      const hasAllergen = familyProfile.allergies.some((a) =>
        item.description.toLowerCase().includes(a.toLowerCase())
      );
      return hasHealthTag && !hasAllergen;
    })
    .slice(0, 4);

  if (!healthyItems.length) {
    return {
      message: `I found **${best.name}** (${best.rating}★) but couldn't find items matching your dietary preferences. Want me to try another restaurant?`,
      toolCalls,
    };
  }

  // Build cart: pick items for the family, respecting budget
  const itemsForCart: { itemId: string; quantity: number }[] = [];
  let runningTotal = 0;
  const budget = familyProfile.budgetINR;

  for (const item of healthyItems) {
    const qty = Math.ceil(familyProfile.members / healthyItems.length);
    const cost = item.price * qty;
    if (runningTotal + cost + best.deliveryFee <= budget) {
      itemsForCart.push({ itemId: item.itemId, quantity: qty });
      runningTotal += cost;
    }
  }

  if (!itemsForCart.length) {
    // Budget too tight — just add one of each
    for (const item of healthyItems.slice(0, 2)) {
      itemsForCart.push({ itemId: item.itemId, quantity: 1 });
    }
  }

  track("update_food_cart", `Updated cart (${itemsForCart.length} items)`);
  const cart = await swiggy.updateFoodCart(best.restaurantId, itemsForCart);

  // Try applying a coupon
  try {
    track("fetch_food_coupons", "Fetched coupons");
    const coupons = await swiggy.fetchFoodCoupons();
    const validCoupon = coupons.find((c) => cart.subtotal >= c.minOrderValue);
    if (validCoupon) {
      track("apply_food_coupon", `Applied coupon ${validCoupon.code}`);
      await swiggy.applyFoodCoupon(validCoupon.code);
    }
  } catch {
    // coupon not applicable — continue
  }

  track("get_food_cart", "Verified cart total");
  const finalCart = await swiggy.getFoodCart();

  const itemList = finalCart.items
    .map((i) => `- **${i.name}** ×${i.quantity} — ₹${i.totalPrice}`)
    .join("\n");

  const healthNote = isVeg
    ? "All vegetarian, high in plant-based protein and fibre — great for a balanced family dinner."
    : "High protein, low-carb options — perfect for an active family.";

  return {
    message:
      `Found **${best.name}** (${best.rating}★, ~${best.deliveryTime} min) — here's what I've added to your cart:\n\n` +
      `${itemList}\n\n` +
      `${formatCart(finalCart)}\n\n` +
      `**Health note:** ${healthNote}\n\n` +
      `Shall I place the order?`,
    toolCalls,
  };
}
