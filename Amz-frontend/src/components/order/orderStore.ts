import { create } from 'zustand';
import { CartItemEntry } from '@/store/cartStore';

export interface OrderRecord {
  id: string;
  orderNumber: string;
  userEmail?: string;
  items: CartItemEntry[];
  totalAmount: number;
  paymentMethod: string;
  shippingAddress: string;
  createdAt: string;
  status: 'Order Placed' | 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered';
  estimatedDelivery: string;
}

export interface OrderState {
  orders: OrderRecord[];
  activeOrder: OrderRecord | null;
  loadUserOrders: (userEmail: string) => void;
  createOrder: (orderData: {
    userEmail?: string;
    items: CartItemEntry[];
    totalAmount: number;
    paymentMethod: string;
    shippingAddress: string;
  }) => Promise<OrderRecord>;
  clearOrders: () => void;
}

const getStorageKey = (email: string) => `amz_orders_${email || 'guest'}`;

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  activeOrder: null,

  loadUserOrders: (userEmail: string) => {
    try {
      const raw = localStorage.getItem(getStorageKey(userEmail));
      const parsed: OrderRecord[] = raw ? JSON.parse(raw) : [];
      set({ orders: Array.isArray(parsed) ? parsed : [] });
    } catch {
      set({ orders: [] });
    }
  },

  createOrder: async (orderData) => {
    const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    const estDate = new Date();
    estDate.setDate(estDate.getDate() + 3);

    const email = orderData.userEmail || 'customer@amzshop.com';

    const newOrder: OrderRecord = {
      id: orderId,
      orderNumber: orderId,
      userEmail: email,
      items: orderData.items,
      totalAmount: orderData.totalAmount,
      paymentMethod: orderData.paymentMethod,
      shippingAddress: orderData.shippingAddress,
      createdAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      status: 'Order Placed',
      estimatedDelivery: estDate.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }),
    };

    const currentOrders = get().orders;
    const updated = [newOrder, ...currentOrders];
    localStorage.setItem(getStorageKey(email), JSON.stringify(updated));
    set({ orders: updated, activeOrder: newOrder });
    return newOrder;
  },

  clearOrders: () => set({ orders: [], activeOrder: null }),
}));