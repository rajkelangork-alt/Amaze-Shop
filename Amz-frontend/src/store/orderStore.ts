import { create } from 'zustand';
import type { CartItem } from '@/store/cartStore';

export interface OrderItemRecord {
  item: CartItem['item'];
  quantity: number;
  editionName: string;
  price: number;
  vendorEmail: string;
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  userEmail: string;
  customerName: string;
  items: OrderItemRecord[];
  totalAmount: number;
  paymentMethod: string;
  shippingAddress: string;
  createdAt: string;
  status: 'Order Placed' | 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered';
  estimatedDelivery: string;
}

interface OrderState {
  orders: OrderRecord[];
  loadUserOrders: (userEmail: string) => void;
  getVendorOrders: (vendorEmail: string) => OrderRecord[];
  createOrder: (orderData: {
    userEmail: string;
    customerName: string;
    items: CartItem[];
    totalAmount: number;
    paymentMethod: string;
    shippingAddress: string;
  }) => Promise<OrderRecord>;
  clearOrders: () => void;
}

const GLOBAL_ORDERS_KEY = 'amz_all_orders_ledger';

const getAllStoredOrders = (): OrderRecord[] => {
  try {
    const raw = localStorage.getItem(GLOBAL_ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const useOrderStore = create<OrderState>((set) => ({
  orders: [],

  loadUserOrders: (userEmail: string) => {
    const all = getAllStoredOrders();
    const userOrders = all.filter((o) => o.userEmail === userEmail);
    set({ orders: userOrders });
  },

  getVendorOrders: (vendorEmail: string) => {
    const all = getAllStoredOrders();
    return all
      .map((order) => {
        // Strictly filter items that belong to THIS specific vendor
        const vendorItems = order.items.filter((it) => it.vendorEmail === vendorEmail);
        if (vendorItems.length === 0) return null;
        return {
          ...order,
          items: vendorItems,
          totalAmount: vendorItems.reduce((acc, it) => acc + it.price * it.quantity, 0),
        };
      })
      .filter((o): o is OrderRecord => o !== null);
  },

  createOrder: async (orderData) => {
    const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    const estDate = new Date();
    estDate.setDate(estDate.getDate() + 3);

    const mappedItems: OrderItemRecord[] = orderData.items.map((entry) => ({
      item: entry.item,
      quantity: entry.quantity,
      editionName: entry.editionName,
      price: entry.price,
      vendorEmail: entry.item.vendorEmail || 'vendor.apex@amzshop.com',
    }));

    const newOrder: OrderRecord = {
      id: orderId,
      orderNumber: orderId,
      userEmail: orderData.userEmail,
      customerName: orderData.customerName,
      items: mappedItems,
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

    const all = getAllStoredOrders();
    const updated = [newOrder, ...all];
    localStorage.setItem(GLOBAL_ORDERS_KEY, JSON.stringify(updated));

    // Update customer view
    set({ orders: updated.filter((o) => o.userEmail === orderData.userEmail) });
    return newOrder;
  },

  clearOrders: () => set({ orders: [] }),
}));