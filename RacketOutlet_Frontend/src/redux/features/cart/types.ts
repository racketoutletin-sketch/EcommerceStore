// src/redux/features/cart/types.ts

export interface Product {
  id: number;
  name: string;
  brand: string;
  description?: string;
  price: number;
  discounted_price?: number | null;
  main_image_url?: string;
}

export interface CartItem {
  id: number;
  product: Product;
  product_id: number;
  quantity: number;
  subtotal: number;
}

export interface Cart {
  id: number;
  items: CartItem[];
  total_price: number;
  created_at: string;
  updated_at: string;
}

export interface CartItemPayload {
  product_id: number;
  quantity: number;
}

export interface UpdateCartItemPayload {
  id: number;          // cartItem ID
  product_id: number;  // product ID
  quantity: number;
}
