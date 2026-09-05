// Swiggy MCP response types

export interface SwiggyAddress {
  addressId: string;
  label: string;
  fullAddress: string;
  lat: number;
  lng: number;
}

export interface SwiggyRestaurant {
  restaurantId: string;
  name: string;
  cuisines: string[];
  rating: number;
  deliveryTime: number; // minutes
  availabilityStatus: "OPEN" | "CLOSED" | "TEMPORARILY_CLOSED";
  deliveryFee: number;
  tags: string[];
  imageUrl?: string;
}

export interface SwiggyMenuItem {
  itemId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  tags: string[];
  isVeg: boolean;
  calories?: number;
  imageUrl?: string;
}

export interface SwiggyMenu {
  restaurantId: string;
  restaurantName: string;
  items: SwiggyMenuItem[];
}

export interface SwiggyCartItem {
  itemId: string;
  name: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

export interface SwiggyCart {
  restaurantId: string;
  restaurantName: string;
  items: SwiggyCartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  couponApplied?: string;
}

export interface SwiggyCoupon {
  code: string;
  description: string;
  discountPercent?: number;
  discountAmount?: number;
  minOrderValue: number;
}

export interface SwiggyPaymentOption {
  id: string;
  name: string;
  type: "COD" | "UPI" | "CARD" | "NETBANKING";
  intentApp?: string;
}

export interface SwiggyOrder {
  orderId: string;
  restaurantName: string;
  status: "CONFIRMED" | "PREPARING" | "PICKED_UP" | "DELIVERED" | "CANCELLED";
  total: number;
  estimatedDelivery: number; // minutes from order time
  placedAt: string;
}

export interface SwiggyTrackingStatus {
  orderId: string;
  status: SwiggyOrder["status"];
  statusMessage: string;
  estimatedMinutes: number;
  deliveryPartner?: {
    name: string;
    phone: string;
  };
}

export interface SwiggyMCPResponse<T> {
  success: boolean;
  data?: T;
  error?: { message: string };
  message?: string;
}
