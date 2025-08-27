// src/store/orders/types.ts

export interface Product {
  id: number;
  name: string;
  slug: string;
  main_image: string;
  price: string;              // comes as string from API
  discounted_price: string | null;
}


export interface OrderItem {
  id: number;
  product: Product;
  quantity: number;
  price: string;
  subtotal: number;
}

export interface Order {
  id: number;
  order_number: string;
  status: string;
  total_amount: string;
  shipping_address: string;
  billing_address: string;
  payment_method: string;
  payment_status: string;
  created_at: string;
  items: OrderItem[];
}

export interface OrdersState {
  orders: Order[];
  loading: boolean;
  error: string | null;
}
