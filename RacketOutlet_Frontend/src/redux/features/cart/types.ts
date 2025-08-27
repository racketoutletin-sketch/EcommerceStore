// src/redux/features/cart/types.ts
export interface CartItem {
  id: number;
  product: {
    id: number;
    name: string;
    price: string;
    discounted_price?: string;
    image?: string;
  };
  quantity: number;
  subtotal: string;
}

export interface Cart {
  id: number;
  items: CartItem[];
  total_price: string;
  created_at: string;
  updated_at: string;
}

export interface CartItemPayload {
  product_id: number;
  quantity: number;
}

// CartState for Redux slice
export interface CartState {
  cart: Cart | null;          // full cart object
  items: CartItem[];          // shortcut for cart.items
  loading: boolean;
  error: string | null;
}
