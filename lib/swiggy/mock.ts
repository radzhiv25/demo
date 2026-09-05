// Realistic mock data for dev/demo without Swiggy credentials

import type {
  SwiggyAddress,
  SwiggyRestaurant,
  SwiggyMenu,
  SwiggyCart,
  SwiggyCoupon,
  SwiggyPaymentOption,
  SwiggyOrder,
  SwiggyTrackingStatus,
} from "./types";

export const MOCK_ADDRESSES: SwiggyAddress[] = [
  {
    addressId: "addr_001",
    label: "Home",
    fullAddress: "12, Indiranagar 100 Feet Road, Bangalore - 560038",
    lat: 12.9784,
    lng: 77.6408,
  },
];

export const MOCK_RESTAURANTS: SwiggyRestaurant[] = [
  {
    restaurantId: "rest_001",
    name: "Green Bowl",
    cuisines: ["Healthy", "Salads", "Bowls"],
    rating: 4.4,
    deliveryTime: 28,
    availabilityStatus: "OPEN",
    deliveryFee: 30,
    tags: ["healthy", "organic", "vegetarian-friendly"],
    imageUrl: "https://placehold.co/400x200/4ade80/ffffff?text=Green+Bowl",
  },
  {
    restaurantId: "rest_002",
    name: "Fitness Kitchen",
    cuisines: ["Protein", "Grilled", "Wraps"],
    rating: 4.2,
    deliveryTime: 35,
    availabilityStatus: "OPEN",
    deliveryFee: 40,
    tags: ["high-protein", "low-carb", "grilled"],
    imageUrl: "https://placehold.co/400x200/60a5fa/ffffff?text=Fitness+Kitchen",
  },
  {
    restaurantId: "rest_003",
    name: "Sattvic Kitchen",
    cuisines: ["Indian Healthy", "Dal", "Millets"],
    rating: 4.6,
    deliveryTime: 25,
    availabilityStatus: "OPEN",
    deliveryFee: 25,
    tags: ["healthy", "vegetarian", "no-onion-garlic", "millets"],
    imageUrl: "https://placehold.co/400x200/f59e0b/ffffff?text=Sattvic+Kitchen",
  },
  {
    restaurantId: "rest_004",
    name: "The Protein Co.",
    cuisines: ["Protein Bowls", "Smoothies", "Grains"],
    rating: 4.0,
    deliveryTime: 40,
    availabilityStatus: "CLOSED",
    deliveryFee: 50,
    tags: ["high-protein", "post-workout"],
    imageUrl: "https://placehold.co/400x200/a78bfa/ffffff?text=The+Protein+Co",
  },
];

const MOCK_MENUS: Record<string, SwiggyMenu> = {
  rest_001: {
    restaurantId: "rest_001",
    restaurantName: "Green Bowl",
    items: [
      {
        itemId: "item_001",
        name: "Paneer Quinoa Bowl",
        description: "Grilled paneer, tri-colour quinoa, roasted veggies, tahini dressing",
        price: 280,
        category: "Signature Bowls",
        tags: ["healthy", "high-protein", "vegetarian"],
        isVeg: true,
        calories: 420,
      },
      {
        itemId: "item_002",
        name: "Sprout Chaat Salad",
        description: "Mixed sprouts, pomegranate, cucumber, chaat masala, lemon",
        price: 160,
        category: "Salads",
        tags: ["healthy", "low-calorie", "vegetarian"],
        isVeg: true,
        calories: 210,
      },
      {
        itemId: "item_003",
        name: "Dal Makhani Grain Bowl",
        description: "Slow-cooked dal makhani, brown rice, pickled onions, mint chutney",
        price: 220,
        category: "Grain Bowls",
        tags: ["healthy", "vegetarian", "high-protein"],
        isVeg: true,
        calories: 390,
      },
      {
        itemId: "item_004",
        name: "Avocado Toast",
        description: "Multigrain toast, smashed avocado, cherry tomatoes, microgreens",
        price: 200,
        category: "Light Bites",
        tags: ["healthy", "vegetarian"],
        isVeg: true,
        calories: 290,
      },
      {
        itemId: "item_005",
        name: "Green Goddess Smoothie",
        description: "Spinach, banana, almond milk, chia seeds, no added sugar",
        price: 140,
        category: "Smoothies",
        tags: ["healthy", "vegan", "low-calorie"],
        isVeg: true,
        calories: 180,
      },
    ],
  },
  rest_002: {
    restaurantId: "rest_002",
    restaurantName: "Fitness Kitchen",
    items: [
      {
        itemId: "item_101",
        name: "Grilled Chicken Wrap",
        description: "Grilled chicken breast, whole wheat wrap, Greek yogurt sauce, greens",
        price: 310,
        category: "Wraps",
        tags: ["high-protein", "grilled", "low-carb"],
        isVeg: false,
        calories: 480,
      },
      {
        itemId: "item_102",
        name: "Egg White Omelette Bowl",
        description: "4-egg white omelette, sautéed mushrooms, bell peppers, whole grain toast",
        price: 260,
        category: "Breakfast Bowls",
        tags: ["high-protein", "low-calorie"],
        isVeg: false,
        calories: 320,
      },
      {
        itemId: "item_103",
        name: "Peanut Butter Protein Shake",
        description: "Whey protein, peanut butter, banana, almond milk",
        price: 180,
        category: "Shakes",
        tags: ["high-protein"],
        isVeg: true,
        calories: 380,
      },
    ],
  },
  rest_003: {
    restaurantId: "rest_003",
    restaurantName: "Sattvic Kitchen",
    items: [
      {
        itemId: "item_201",
        name: "Millet Khichdi",
        description: "Foxtail millet, yellow moong dal, seasonal veggies, pure ghee",
        price: 180,
        category: "Main Course",
        tags: ["healthy", "vegetarian", "millets", "gluten-free"],
        isVeg: true,
        calories: 350,
      },
      {
        itemId: "item_202",
        name: "Ragi Dosa with Sambar",
        description: "Crispy ragi dosa, fresh sambar, coconut chutney",
        price: 160,
        category: "South Indian",
        tags: ["healthy", "vegetarian", "millets"],
        isVeg: true,
        calories: 280,
      },
      {
        itemId: "item_203",
        name: "Sattvic Thali",
        description: "Dal, sabzi, roti (millet/wheat), rice, salad, curd — complete meal",
        price: 250,
        category: "Thali",
        tags: ["healthy", "vegetarian", "complete-meal"],
        isVeg: true,
        calories: 520,
      },
      {
        itemId: "item_204",
        name: "Banana Stem Stir Fry",
        description: "Banana stem, coconut, mustard seeds, curry leaves — rich in fibre",
        price: 140,
        category: "Sides",
        tags: ["healthy", "vegetarian", "high-fibre"],
        isVeg: true,
        calories: 160,
      },
    ],
  },
};

// In-memory cart state for mock mode
let mockCart: SwiggyCart = {
  restaurantId: "",
  restaurantName: "",
  items: [],
  subtotal: 0,
  deliveryFee: 0,
  discount: 0,
  total: 0,
};

let mockOrderCounter = 1000;

export function mockGetAddresses(): SwiggyAddress[] {
  return MOCK_ADDRESSES;
}

export function mockSearchRestaurants(query: string): SwiggyRestaurant[] {
  const q = query.toLowerCase();
  return MOCK_RESTAURANTS.filter(
    (r) =>
      r.availabilityStatus === "OPEN" &&
      (r.tags.some((t) => q.includes(t) || t.includes(q.split(" ")[0])) ||
        r.cuisines.some((c) => c.toLowerCase().includes(q.split(" ")[0])) ||
        q.includes("healthy") ||
        q.includes("food"))
  );
}

export function mockGetRestaurantMenu(restaurantId: string): SwiggyMenu | null {
  return MOCK_MENUS[restaurantId] ?? null;
}

export function mockSearchMenu(restaurantId: string, query: string): SwiggyMenu["items"] {
  const menu = MOCK_MENUS[restaurantId];
  if (!menu) return [];
  const q = query.toLowerCase();
  return menu.items.filter(
    (item) =>
      item.name.toLowerCase().includes(q) ||
      item.tags.some((t) => t.includes(q)) ||
      item.description.toLowerCase().includes(q)
  );
}

export function mockUpdateFoodCart(
  restaurantId: string,
  items: { itemId: string; quantity: number }[]
): SwiggyCart {
  const restaurant = MOCK_RESTAURANTS.find((r) => r.restaurantId === restaurantId);
  if (!restaurant) throw new Error("Restaurant not found");

  const menu = MOCK_MENUS[restaurantId];
  if (!menu) throw new Error("Menu not found");

  // If switching restaurant, reset cart
  if (mockCart.restaurantId && mockCart.restaurantId !== restaurantId) {
    mockCart = {
      restaurantId: "",
      restaurantName: "",
      items: [],
      subtotal: 0,
      deliveryFee: 0,
      discount: 0,
      total: 0,
    };
  }

  mockCart.restaurantId = restaurantId;
  mockCart.restaurantName = restaurant.name;

  for (const update of items) {
    const menuItem = menu.items.find((i) => i.itemId === update.itemId);
    if (!menuItem) continue;

    const existing = mockCart.items.find((i) => i.itemId === update.itemId);
    if (update.quantity === 0) {
      mockCart.items = mockCart.items.filter((i) => i.itemId !== update.itemId);
    } else if (existing) {
      existing.quantity = update.quantity;
      existing.totalPrice = existing.price * update.quantity;
    } else {
      mockCart.items.push({
        itemId: update.itemId,
        name: menuItem.name,
        quantity: update.quantity,
        price: menuItem.price,
        totalPrice: menuItem.price * update.quantity,
      });
    }
  }

  recalcCart(restaurant.deliveryFee);
  return { ...mockCart };
}

export function mockGetFoodCart(): SwiggyCart {
  return { ...mockCart };
}

export function mockFlushFoodCart(): void {
  mockCart = {
    restaurantId: "",
    restaurantName: "",
    items: [],
    subtotal: 0,
    deliveryFee: 0,
    discount: 0,
    total: 0,
  };
}

export function mockFetchCoupons(): SwiggyCoupon[] {
  return [
    {
      code: "HEALTHY10",
      description: "10% off on healthy orders",
      discountPercent: 10,
      minOrderValue: 300,
    },
    {
      code: "FAMILY20",
      description: "₹20 off on orders above ₹500",
      discountAmount: 20,
      minOrderValue: 500,
    },
  ];
}

export function mockApplyCoupon(code: string): SwiggyCart {
  const coupons = mockFetchCoupons();
  const coupon = coupons.find((c) => c.code === code.toUpperCase());
  if (!coupon) throw new Error("Invalid coupon code");
  if (mockCart.subtotal < coupon.minOrderValue)
    throw new Error(`Minimum order ₹${coupon.minOrderValue} required`);

  if (coupon.discountPercent) {
    mockCart.discount = Math.round(mockCart.subtotal * (coupon.discountPercent / 100));
  } else if (coupon.discountAmount) {
    mockCart.discount = coupon.discountAmount;
  }
  mockCart.couponApplied = code.toUpperCase();
  mockCart.total = mockCart.subtotal + mockCart.deliveryFee - mockCart.discount;
  return { ...mockCart };
}

export function mockGetPaymentOptions(): SwiggyPaymentOption[] {
  return [
    { id: "cod", name: "Cash on Delivery", type: "COD" },
    { id: "googlepay", name: "Google Pay", type: "UPI", intentApp: "googlepay" },
    { id: "phonepe", name: "PhonePe", type: "UPI", intentApp: "phonepe" },
    { id: "paytm", name: "Paytm", type: "UPI", intentApp: "paytm" },
  ];
}

export function mockPlaceFoodOrder(paymentMethod: string): SwiggyOrder {
  if (mockCart.items.length === 0) throw new Error("Cart is empty");
  const orderId = `ORD-${++mockOrderCounter}`;
  return {
    orderId,
    restaurantName: mockCart.restaurantName,
    status: "CONFIRMED",
    total: mockCart.total,
    estimatedDelivery: 35,
    placedAt: new Date().toISOString(),
  };
}

export function mockTrackFoodOrder(orderId: string): SwiggyTrackingStatus {
  return {
    orderId,
    status: "PREPARING",
    statusMessage: "Your order is being freshly prepared",
    estimatedMinutes: 28,
    deliveryPartner: { name: "Ravi Kumar", phone: "+91-XXXXXXXXXX" },
  };
}

function recalcCart(deliveryFee: number) {
  mockCart.subtotal = mockCart.items.reduce((sum, i) => sum + i.totalPrice, 0);
  mockCart.deliveryFee = mockCart.items.length > 0 ? deliveryFee : 0;
  mockCart.total = mockCart.subtotal + mockCart.deliveryFee - mockCart.discount;
}
