import { create } from 'zustand';
import { ShowcaseItem } from '@/constants/categories';

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  imageFileName: string;
  categoryId?: number;
}

interface WishlistState {
  items: WishlistItem[];
  toggleWishlist: (item: ShowcaseItem | WishlistItem) => void;
  addItem: (item: ShowcaseItem | WishlistItem) => void;
  removeItem: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  clearWishlist: () => void;
}

const STORAGE_KEY = 'amz_active_user_wishlist';

const getInitialWishlist = (): WishlistItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveWishlist = (items: WishlistItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
};

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: getInitialWishlist(),

  isInWishlist: (id: string) => {
    return get().items.some((i) => i.id === id);
  },

  addItem: (item: any) => {
    const current = get().items;
    if (current.some((i) => i.id === item.id)) return;
    const updated = [
      {
        id: item.id,
        name: item.name,
        price: Number(item.price) || 0,
        imageFileName: item.imageFileName || '',
        categoryId: item.categoryId,
      },
      ...current,
    ];
    saveWishlist(updated);
    set({ items: updated });
  },

  removeItem: (id: string) => {
    const updated = get().items.filter((i) => i.id !== id);
    saveWishlist(updated);
    set({ items: updated });
  },

  toggleWishlist: (item: any) => {
    const exists = get().items.some((i) => i.id === item.id);
    if (exists) {
      get().removeItem(item.id);
    } else {
      get().addItem(item);
    }
  },

  clearWishlist: () => {
    saveWishlist([]);
    set({ items: [] });
  },
}));