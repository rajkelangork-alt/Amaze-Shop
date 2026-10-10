export interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
  role: 'customer' | 'admin' | 'staff';
  is_active: boolean;
  created_at?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  title: string;
  sku: string;
  price: string | number;
  compare_at_price?: string | number;
  stock_quantity?: number;
  is_active?: boolean;
}

export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  is_primary: boolean;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  base_price: string | number;
  is_featured: boolean;
  category_id: number;
  category?: Category;
  variants: ProductVariant[];
  images: ProductImage[];
  rating?: number;
  reviews_count?: number;
}

export interface CartItem {
  id: number;
  cart_id: number;
  variant_id: number;
  quantity: number;
  unit_price: string | number;
  total_price: string | number;
  variant?: ProductVariant & { product?: Product };
}

export interface Cart {
  id: number;
  user_id: number;
  subtotal: string | number;
  tax_amount?: string | number;
  shipping_fee?: string | number;
  total_amount: string | number;
  items: CartItem[];
}

export interface OrderItem {
  id: number;
  order_id: number;
  variant_id: number;
  quantity: number;
  unit_price: string | number;
  total_price: string | number;
  variant?: ProductVariant;
}

export interface Order {
  id: number;
  order_number: string;
  user_id: number;
  status: 'pending' | 'processing' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: string | number;
  shipping_fee: string | number;
  tax_amount: string | number;
  tracking_number?: string;
  created_at: string;
  items?: OrderItem[];
}

export interface Review {
  id: number;
  product_id: number;
  user_id: number;
  rating: number;
  title?: string;
  comment?: string;
  created_at: string;
  user?: { first_name?: string; email: string };
}