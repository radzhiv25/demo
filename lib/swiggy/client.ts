/**
 * Swiggy MCP Client
 *
 * When SWIGGY_ACCESS_TOKEN is set: makes real JSON-RPC calls to Swiggy MCP servers.
 * When it is not set:              runs in MOCK mode using deterministic local data.
 */

import type {
  SwiggyAddress,
  SwiggyRestaurant,
  SwiggyMenu,
  SwiggyCart,
  SwiggyCoupon,
  SwiggyPaymentOption,
  SwiggyOrder,
  SwiggyTrackingStatus,
  SwiggyMCPResponse,
} from "./types";

import * as mock from "./mock";

const IS_MOCK = !process.env.SWIGGY_ACCESS_TOKEN;
const SWIGGY_BASE_URL =
  process.env.SWIGGY_BASE_URL ?? "https://mcp-staging.swiggy.com";

// ─── JSON-RPC helper ────────────────────────────────────────────────────────

async function rpc<T>(
  server: "food" | "instamart" | "dineout",
  tool: string,
  args: Record<string, unknown>
): Promise<T> {
  const url = `${SWIGGY_BASE_URL}/${server}`;
  const body = {
    jsonrpc: "2.0",
    method: "tools/call",
    params: { name: tool, arguments: args },
    id: Date.now(),
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.SWIGGY_ACCESS_TOKEN}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Swiggy MCP ${res.status}: ${text}`);
  }

  const json = (await res.json()) as SwiggyMCPResponse<T>;
  if (!json.success || !json.data) {
    throw new Error(json.error?.message ?? "Unknown Swiggy error");
  }
  return json.data;
}

// ─── Public API ─────────────────────────────────────────────────────────────

export async function getAddresses(): Promise<SwiggyAddress[]> {
  if (IS_MOCK) return mock.mockGetAddresses();
  return rpc("food", "get_addresses", {});
}

export async function searchRestaurants(
  addressId: string,
  query: string
): Promise<SwiggyRestaurant[]> {
  if (IS_MOCK) return mock.mockSearchRestaurants(query);
  return rpc("food", "search_restaurants", { addressId, query });
}

export async function getRestaurantMenu(restaurantId: string): Promise<SwiggyMenu> {
  if (IS_MOCK) {
    const menu = mock.mockGetRestaurantMenu(restaurantId);
    if (!menu) throw new Error("Restaurant not found");
    return menu;
  }
  return rpc("food", "get_restaurant_menu", { restaurantId });
}

export async function searchMenu(
  restaurantId: string,
  query: string
): Promise<SwiggyMenu["items"]> {
  if (IS_MOCK) return mock.mockSearchMenu(restaurantId, query);
  return rpc("food", "search_menu", { restaurantId, query });
}

export async function updateFoodCart(
  restaurantId: string,
  items: { itemId: string; quantity: number }[]
): Promise<SwiggyCart> {
  if (IS_MOCK) return mock.mockUpdateFoodCart(restaurantId, items);
  return rpc("food", "update_food_cart", { restaurantId, items });
}

export async function getFoodCart(): Promise<SwiggyCart> {
  if (IS_MOCK) return mock.mockGetFoodCart();
  return rpc("food", "get_food_cart", {});
}

export async function flushFoodCart(): Promise<void> {
  if (IS_MOCK) { mock.mockFlushFoodCart(); return; }
  await rpc("food", "flush_food_cart", {});
}

export async function fetchFoodCoupons(): Promise<SwiggyCoupon[]> {
  if (IS_MOCK) return mock.mockFetchCoupons();
  return rpc("food", "fetch_food_coupons", {});
}

export async function applyFoodCoupon(code: string): Promise<SwiggyCart> {
  if (IS_MOCK) return mock.mockApplyCoupon(code);
  return rpc("food", "apply_food_coupon", { code });
}

export async function getPaymentOptions(addressId: string): Promise<SwiggyPaymentOption[]> {
  if (IS_MOCK) return mock.mockGetPaymentOptions();
  return rpc("food", "get_payment_options", { addressId });
}

export async function placeFoodOrder(args: {
  paymentMethod: "COD" | "UPI";
  intentApp?: string;
  addressId: string;
  lat: number;
  lng: number;
}): Promise<SwiggyOrder> {
  if (IS_MOCK) return mock.mockPlaceFoodOrder(args.paymentMethod);
  return rpc("food", "place_food_order", args);
}

export async function getFoodOrders(): Promise<SwiggyOrder[]> {
  if (IS_MOCK) return [];
  return rpc("food", "get_food_orders", {});
}

export async function trackFoodOrder(orderId: string): Promise<SwiggyTrackingStatus> {
  if (IS_MOCK) return mock.mockTrackFoodOrder(orderId);
  return rpc("food", "track_food_order", { orderId });
}
