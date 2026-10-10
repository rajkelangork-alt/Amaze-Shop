import { create } from 'zustand';
import { ShowcaseItem } from '@/constants/categories';

export interface WishlistState {
  items: ShowcaseItem[];
  currentUserEmail: string;
  loadUserWishlist: (email: string) => void;
  addItem: (item: ShowcaseItem) => void;
  removeItem: (itemId: string) => void;
  toggleWishlist: (item: ShowcaseItem) => void;
  isInWishlist: (itemId: string) => boolean;
  clearWishlist: () => void;
}

const getStorageKey = (email: string) => `amz_wishlist_${email || 'guest'}`;

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  currentUserEmail: '',

  loadUserWishlist: (email: string) => {
    try {
      const raw = localStorage.getItem(getStorageKey(email));
      const parsed = raw ? JSON.parse(raw) : [];
      set({ items: Array.isArray(parsed) ? parsed : [], currentUserEmail: email });
    } catch {
      set({ items: [], currentUserEmail: email });
    }
  },

  addItem: (item: ShowcaseItem) => {
    const { items, currentUserEmail } = get();
    if (!items.some((i) => i.id === item.id)) {
      const updated = [...items, item];
      localStorage.setItem(getStorageKey(currentUserEmail), JSON.stringify(updated));
      set({ items: updated });
    }
  },

  removeItem: (itemId: string) => {
    const { items, currentUserEmail } = get();
    const updated = items.filter((i) => i.id !== itemId);
    localStorage.setItem(getStorageKey(currentUserEmail), JSON.stringify(updated));
    set({ items: updated });
  },

  toggleWishlist: (item: ShowcaseItem) => {
    const { items, currentUserEmail } = get();
    const exists = items.some((i) => i.id === item.id);
    const updated = exists ? items.filter((i) => i.id !== item.id) : [...items, item];
    localStorage.setItem(getStorageKey(currentUserEmail), JSON.stringify(updated));
    set({ items: updated });
  },

  isInWishlist: (itemId: string) => {
    return get().items.some((i) => i.id === itemId);
  },

  clearWishlist: () => set({ items: [] }),
}));