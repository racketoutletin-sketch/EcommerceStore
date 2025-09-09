// redux/features/orders/types.ts

export interface Product {
  id: number;
  name: string;
  main_image_url: string;
  price: string;
  discounted_price: string | null;
}

export interface OrderItem {
  id: number;
  product: Product;
  quantity: number;
  subtotal: number;
}

export interface UserInfo {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  address: string;
}

export interface Order {
  id: number;
  order_number: string;
  created_at: string;
  status: string;
  total_amount: string;
  payment_method: string;
  payment_status: string;
  shipping_address: string;
  billing_address: string;
  notes?: string;
  items: OrderItem[];
  user?: UserInfo;
}

export interface OrdersState {
  orders: Order[];
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  pageSize: number;
}
