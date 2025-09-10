export interface ProductImage {
  id: number;
  image: string;
  alt_text: string;
  is_primary: boolean;
  image_url?: string | null;
}

export interface Inventory {
  quantity: number;
  low_stock_threshold: number;
  last_restocked_at: string;
  is_low_stock: boolean;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: string;
  discounted_price?: string | null;
  current_price: number;
  sku: string;
  brand: string;
  weight: string;
  dimensions: string;
  material: string;
  main_image_url: string;
  extra_attributes?: any;
  is_featured: boolean;
  is_deal_of_the_day: boolean;
  is_exclusive_product: boolean;
  is_active: boolean;
  images: ProductImage[];
  inventory: Inventory;
  sub_category_id: number;
  sub_category_name: string;
}

export interface ProductsState {
  loading: boolean;
  error: string | null;
  products: Product[];
}
