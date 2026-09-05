import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import { SWIGGY_TOOLS } from "@/lib/swiggy/tools";
import type { FamilyProfile } from "@/lib/family-profile";
import * as swiggy from "@/lib/swiggy/client";
import { runDemoAgent } from "@/lib/demo-agent";

// Force dynamic so Next.js never statically collects this route at build time
export const dynamic = "force-dynamic";

const SYSTEM_PROMPT = `You are MealPilot, a friendly AI that helps Indian families order healthy food from Swiggy.

## Your role
- Help families find nutritious, balanced meals suited to their dietary goals
- Manage the ordering flow end-to-end: search → menu → cart → order
- Always respect the family's budget, headcount, and dietary restrictions
- Be concise and warm. Families are busy — no long lectures.

## Ordering rules
1. ALWAYS call get_food_cart before placing to verify total ≤ budgetINR
2. NEVER blindly retry place_food_order — call get_food_orders first to check
3. If a restaurant is not "OPEN", skip it and try another
4. Aim for variety: at least one protein, one vegetable, one grain per order
5. Prefer tags: "healthy", "low-cal", "organic", "salad", "bowl", "grilled", "millets"
6. Avoid: "fried", "creamy", "loaded", "extra cheese" unless user asks

## Response format
After tool calls, respond with:
- Brief summary of what you found/did (2-3 sentences)
- A list of items added to cart with per-item prices
- Total and any coupon applied
- A short health note (1 sentence) on why these choices are good
- Ask for next action: "Shall I place the order?" or "Want me to search more?"

Use markdown for formatting. Use ₹ for prices.`;

type ChatMessage = { role: "user" | "assistant"; content: string };

// ─── Tool executor ───────────────────────────────────────────────────────────

async function executeTool(
  toolName: string,
  toolInput: Record<string, unknown>
): Promise<string> {
  try {
    switch (toolName) {
      case "get_addresses":
        return JSON.stringify(await swiggy.getAddresses());
      case "search_restaurants":
        return JSON.stringify(
          await swiggy.searchRestaurants(
            toolInput.addressId as string,
            toolInput.query as string
          )
        );
      case "get_restaurant_menu":
        return JSON.stringify(
          await swiggy.getRestaurantMenu(toolInput.restaurantId as string)
        );
      case "search_menu":
        return JSON.stringify(
          await swiggy.searchMenu(
            toolInput.restaurantId as string,
            toolInput.query as string
          )
        );
      case "update_food_cart":
        return JSON.stringify(
          await swiggy.updateFoodCart(
            toolInput.restaurantId as string,
            toolInput.items as { itemId: string; quantity: number }[]
          )
        );
      case "get_food_cart":
        return JSON.stringify(await swiggy.getFoodCart());
      case "flush_food_cart":
        await swiggy.flushFoodCart();
        return JSON.stringify({ success: true });
      case "fetch_food_coupons":
        return JSON.stringify(await swiggy.fetchFoodCoupons());
      case "apply_food_coupon":
        return JSON.stringify(
          await swiggy.applyFoodCoupon(toolInput.code as string)
        );
      case "get_payment_options":
        return JSON.stringify(
          await swiggy.getPaymentOptions(toolInput.addressId as string)
        );
      case "place_food_order":
        return JSON.stringify(
          await swiggy.placeFoodOrder({
            paymentMethod: toolInput.paymentMethod as "COD" | "UPI",
            intentApp: toolInput.intentApp as string | undefined,
            addressId: toolInput.addressId as string,
            lat: toolInput.lat as number,
            lng: toolInput.lng as number,
          })
        );
      case "get_food_orders":
        return JSON.stringify(await swiggy.getFoodOrders());
      case "track_food_order":
        return JSON.stringify(
          await swiggy.trackFoodOrder(toolInput.orderId as string)
        );
      default:
        return JSON.stringify({ error: `Unknown tool: ${toolName}` });
    }
  } catch (err) {
    return JSON.stringify({
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

function summarizeTool(name: string, input: Record<string, unknown>): string {
  const map: Record<string, string> = {
    search_restaurants: `Searched restaurants for "${input.query}"`,
    get_restaurant_menu: "Fetched restaurant menu",
    search_menu: `Searched menu for "${input.query}"`,
    update_food_cart: `Updated cart (${(input.items as unknown[])?.length ?? 0} items)`,
    get_food_cart: "Checked cart total",
    flush_food_cart: "Cleared cart",
    fetch_food_coupons: "Fetched coupons",
    apply_food_coupon: `Applied coupon ${input.code}`,
    get_payment_options: "Fetched payment options",
    place_food_order: "Placed order",
    get_food_orders: "Checked recent orders",
    track_food_order: `Tracked order ${input.orderId}`,
    get_addresses: "Fetched saved addresses",
  };
  return map[name] ?? name;
}

// ─── POST handler ────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    return await handleChat(request);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[/api/chat] Unhandled error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function handleChat(request: NextRequest) {
  const body = (await request.json()) as {
    messages: ChatMessage[];
    familyProfile: FamilyProfile;
    backend?: "demo" | "ollama" | "openrouter"; // chosen by UI toggle
  };
  const { messages, familyProfile, backend } = body;
  if (!messages?.length) {
    return NextResponse.json({ error: "messages required" }, { status: 400 });
  }

  // ── Backend selection ────────────────────────────────────────────────────────
  // UI toggle takes priority, then env vars
  const envDefault = process.env.OLLAMA_BASE_URL
    ? "ollama"
    : process.env.DEMO_MODE === "true" || !process.env.OPENROUTER_API_KEY
    ? "demo"
    : "openrouter";

  const selectedBackend = backend ?? envDefault;

  if (selectedBackend === "demo") {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    const result = await runDemoAgent(lastUserMsg?.content ?? "", familyProfile);
    return NextResponse.json({ ...result, _backend: "demo" });
  }

  // Build OpenAI-compatible client
  let client: OpenAI;
  let model: string;

  if (selectedBackend === "ollama") {
    client = new OpenAI({
      baseURL: process.env.OLLAMA_BASE_URL ?? "http://localhost:11434/v1",
      apiKey: "ollama", // required by SDK, not checked by Ollama
    });
    model = process.env.OLLAMA_MODEL ?? "qwen2.5:7b";
  } else {
    const apiKey = process.env.OPENROUTER_API_KEY ?? "";
    client = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey,
      defaultHeaders: {
        "HTTP-Referer": "https://mealpilot.app",
        "X-Title": "MealPilot",
      },
    });
    model = process.env.OPENROUTER_MODEL ?? "anthropic/claude-sonnet-4-5";
  }

  const profileContext = `[Family Profile]
Members: ${familyProfile.members}
Dietary preferences: ${familyProfile.dietaryPrefs.join(", ") || "none specified"}
Allergies: ${familyProfile.allergies.join(", ") || "none"}
Budget: ₹${familyProfile.budgetINR}
Address ID: ${familyProfile.addressId} (${familyProfile.addressLabel})`;

  const apiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...messages.map((m, i) => ({
      role: m.role as "user" | "assistant",
      content: i === 0 ? `${profileContext}\n\n${m.content}` : m.content,
    })),
  ];

  const toolCallsMade: { tool: string; summary: string }[] = [];
  const MAX_ITERATIONS = 8;

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const response = await client.chat.completions.create({
      model,
      messages: apiMessages,
      tools: SWIGGY_TOOLS,
      tool_choice: "auto",
      max_tokens: 1024,
    });

    const choice = response.choices[0];
    const assistantMsg = choice.message;

    // No tool calls → final answer
    if (
      choice.finish_reason !== "tool_calls" ||
      !assistantMsg.tool_calls?.length
    ) {
      return NextResponse.json({
        message: assistantMsg.content ?? "",
        toolCalls: toolCallsMade,
        _backend: selectedBackend,
      });
    }

    // Push assistant message with tool_calls into history
    apiMessages.push(assistantMsg);

    // Execute each tool call and push results
    for (const tc of assistantMsg.tool_calls) {
      if (tc.type !== "function") continue;
      const input = JSON.parse(tc.function.arguments) as Record<string, unknown>;
      const result = await executeTool(tc.function.name, input);

      apiMessages.push({
        role: "tool",
        tool_call_id: tc.id,
        content: result,
      });

      toolCallsMade.push({
        tool: tc.function.name,
        summary: summarizeTool(tc.function.name, input),
      });
    }
  }

  return NextResponse.json({
    message: "I ran into a problem processing your request. Please try again.",
    toolCalls: toolCallsMade,
  });
}
