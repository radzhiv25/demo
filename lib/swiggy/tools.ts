/**
 * OpenAI-compatible tool definitions for Swiggy MCP tools.
 * Used with OpenRouter (openai SDK, base URL: https://openrouter.ai/api/v1).
 */

import type OpenAI from "openai";

export const SWIGGY_TOOLS: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "get_addresses",
      description: "Get the user's saved delivery addresses from Swiggy",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "search_restaurants",
      description:
        "Search for open restaurants near the user's address. Filter by cuisine or keywords like 'healthy', 'vegetarian', 'protein'. Only returns OPEN restaurants.",
      parameters: {
        type: "object",
        properties: {
          addressId: {
            type: "string",
            description: "The delivery address ID from get_addresses",
          },
          query: {
            type: "string",
            description:
              "Search query, e.g. 'healthy vegetarian', 'salad bowls', 'protein'",
          },
        },
        required: ["addressId", "query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_restaurant_menu",
      description:
        "Get the full menu for a specific restaurant including all items, prices, and nutritional tags.",
      parameters: {
        type: "object",
        properties: {
          restaurantId: {
            type: "string",
            description: "The restaurant ID from search_restaurants",
          },
        },
        required: ["restaurantId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_menu",
      description:
        "Search for specific dishes within a restaurant's menu by keyword.",
      parameters: {
        type: "object",
        properties: {
          restaurantId: { type: "string" },
          query: {
            type: "string",
            description:
              "Dish keyword to search for, e.g. 'quinoa', 'grilled', 'low calorie'",
          },
        },
        required: ["restaurantId", "query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_food_cart",
      description:
        "Add or update items in the food cart. Switching restaurants clears the existing cart. Set quantity to 0 to remove an item.",
      parameters: {
        type: "object",
        properties: {
          restaurantId: { type: "string" },
          items: {
            type: "array",
            description: "Items to add/update",
            items: {
              type: "object",
              properties: {
                itemId: { type: "string" },
                quantity: { type: "number", description: "0 to remove" },
              },
              required: ["itemId", "quantity"],
            },
          },
        },
        required: ["restaurantId", "items"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_food_cart",
      description:
        "Get the current cart state: items, subtotal, delivery fee, discount, and total. Always call this before placing an order to verify the total.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "flush_food_cart",
      description:
        "Clear the entire food cart. Use when starting fresh or switching restaurants.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "fetch_food_coupons",
      description:
        "Get available discount coupons that can be applied to the current cart.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "apply_food_coupon",
      description: "Apply a discount coupon code to the cart.",
      parameters: {
        type: "object",
        properties: {
          code: {
            type: "string",
            description: "The coupon code to apply, e.g. 'HEALTHY10'",
          },
        },
        required: ["code"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_payment_options",
      description:
        "Get available payment methods for this order (COD, UPI apps like GPay/PhonePe, etc.)",
      parameters: {
        type: "object",
        properties: {
          addressId: { type: "string" },
        },
        required: ["addressId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "place_food_order",
      description:
        "Place the confirmed food order. WARNING: Not idempotent — only call after user explicitly confirms and after checking get_food_orders for duplicates. Cart must be non-empty and total ≤ ₹1000.",
      parameters: {
        type: "object",
        properties: {
          paymentMethod: {
            type: "string",
            enum: ["COD", "UPI"],
          },
          intentApp: {
            type: "string",
            description:
              "UPI app ID if paymentMethod is UPI, e.g. 'googlepay', 'phonepe', 'paytm'",
          },
          addressId: { type: "string" },
          lat: { type: "number" },
          lng: { type: "number" },
        },
        required: ["paymentMethod", "addressId", "lat", "lng"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_food_orders",
      description:
        "Get recent orders. Always call this before retrying place_food_order to prevent duplicate orders.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "track_food_order",
      description: "Get live delivery tracking status for an active order.",
      parameters: {
        type: "object",
        properties: {
          orderId: { type: "string" },
        },
        required: ["orderId"],
      },
    },
  },
];
