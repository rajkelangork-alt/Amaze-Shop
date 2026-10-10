import { create } from 'zustand';
import { ShowcaseItem, ShowcaseItemEdition } from '@/constants/categories';

export interface CartItem {
  id: string;
  item: ShowcaseItem;
  editionName: string;
  price: number;
  quantity: number;
  vendorEmail: string;
}

interface CartState {
  items: CartItem[];
  addItem: (
    itemOrPayload: ShowcaseItem | any,
    edition?: ShowcaseItemEdition | string,
    quantity?: number,
    vendorEmail?: string
  ) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

const STORAGE_KEY = 'amz_active_shopping_cart';

const getInitialCart = (): CartItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveCart = (items: CartItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
};

export const useCartStore = create<CartState>((set, get) => ({
  items: getInitialCart(),

  addItem: (itemOrPayload, editionParam, quantityParam, vendorEmailParam) => {
    // Normalize both single-object payloads and positional arguments
    let baseItem: ShowcaseItem;
    let editionTitle = 'Standard Edition';
    let unitPrice = 0;
    let qty = 1;
    let vendor = 'vendor.apex@amzshop.com';

    if (itemOrPayload?.item) {
      // Called with object payload: { item, editionName, price, quantity, vendorEmail }
      baseItem = itemOrPayload.item;
      editionTitle = itemOrPayload.editionName || itemOrPayload.edition?.name || 'Standard Edition';
      unitPrice = Number(itemOrPayload.price ?? itemOrPayload.item?.price ?? 0);
      qty = Number(itemOrPayload.quantity) || 1;
      vendor = itemOrPayload.vendorEmail || itemOrPayload.item?.vendorEmail || 'vendor.apex@amzshop.com';
    } else {
      // Called with positional arguments: (item, edition, quantity, vendorEmail)
      baseItem = itemOrPayload;
      if (typeof editionParam === 'object' && editionParam !== null) {
        editionTitle = editionParam.name || 'Standard Edition';
        unitPrice = Number(editionParam.price ?? baseItem?.price ?? 0);
      } else if (typeof editionParam === 'string') {
        editionTitle = editionParam;
        unitPrice = Number(baseItem?.price ?? 0);
      } else {
        unitPrice = Number(baseItem?.price ?? 0);
      }
      qty = Number(quantityParam) || 1;
      vendor = vendorEmailParam || baseItem?.vendorEmail || 'vendor.apex@amzshop.com';
    }

    if (!baseItem || !baseItem.id) return;

    const cartItemId = `${baseItem.id}-${editionTitle}`;
    const safePrice = Number.isNaN(unitPrice) ? 0 : unitPrice;
    const safeQty = Math.max(1, Math.round(qty));

    const currentItems = get().items;
    const existingIndex = currentItems.findIndex((ci) => ci.id === cartItemId);

    let updatedItems: CartItem[];

    if (existingIndex > -1) {
      updatedItems = currentItems.map((ci, idx) => {
        if (idx === existingIndex) {
          return {
            ...ci,
            quantity: ci.quantity + safeQty,
            price: safePrice,
          };
        }
        return ci;
      });
    } else {
      const newItem: CartItem = {
        id: cartItemId,
        item: baseItem,
        editionName: editionTitle,
        price: safePrice,
        quantity: safeQty,
        vendorEmail: vendor,
      };
      updatedItems = [newItem, ...currentItems];
    }

    saveCart(updatedItems);
    set({ items: updatedItems });
  },

  removeItem: (id: string) => {
    const updated = get().items.filter((i) => i.id !== id);
    saveCart(updated);
    set({ items: updated });
  },

  updateQuantity: (id: string, quantity: number) => {
    const safeQty = Math.max(1, quantity);
    const updated = get().items.map((i) => (i.id === id ? { ...i, quantity: safeQty } : i));
    saveCart(updated);
    set({ items: updated });
  },

  clearCart: () => {
    saveCart([]);
    set({ items: [] });
  },
}));