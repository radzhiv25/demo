"use client";

import { cn } from "@/lib/utils";
import {
  Search,
  UtensilsCrossed,
  ShoppingCart,
  Trash2,
  Tag,
  CreditCard,
  Package,
  Bike,
  MapPin,
  Scissors,
  ClipboardList,
} from "lucide-react";

interface ToolCall {
  tool: string;
  summary: string;
}

const TOOL_ICONS: Record<string, React.ElementType> = {
  search_restaurants: Search,
  get_restaurant_menu: UtensilsCrossed,
  search_menu: Search,
  update_food_cart: ShoppingCart,
  get_food_cart: ShoppingCart,
  flush_food_cart: Trash2,
  fetch_food_coupons: Tag,
  apply_food_coupon: Scissors,
  get_payment_options: CreditCard,
  place_food_order: Package,
  get_food_orders: ClipboardList,
  track_food_order: Bike,
  get_addresses: MapPin,
};

export function ToolCallBadge({ tool, summary }: ToolCall) {
  const Icon = TOOL_ICONS[tool] ?? Package;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 border border-orange-100 px-2 py-0.5 text-[11px] text-orange-700 font-medium">
      <Icon className="size-3 shrink-0" />
      <span>{summary}</span>
    </span>
  );
}

export function ToolCallsRow({ toolCalls }: { toolCalls: ToolCall[] }) {
  if (!toolCalls.length) return null;
  return (
    <div className={cn("flex flex-wrap gap-1.5 mb-2")}>
      {toolCalls.map((tc, i) => (
        <ToolCallBadge key={i} {...tc} />
      ))}
    </div>
  );
}
