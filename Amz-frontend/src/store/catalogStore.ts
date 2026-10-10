import { create } from 'zustand';
import * as CategoriesModule from '@/constants/categories';
import type { ShowcaseCategory, ShowcaseItem } from '@/constants/categories';

export interface CatalogState {
  categories: ShowcaseCategory[];
  addProduct: (product: ShowcaseItem) => void;
  addItem: (product: ShowcaseItem) => void;
  resetCatalog: () => void;
}

// Resilient array extractor across all naming conventions
const extractInitialCategories = (): ShowcaseCategory[] => {
  const mod = CategoriesModule as any;
  const candidate =
    mod.SHOWCASE_CATEGORIES ||
    mod.CATEGORIES ||
    mod.categories ||
    mod.showcaseCategories ||
    mod.default ||
    [];

  if (Array.isArray(candidate) && candidate.length > 0) {
    return candidate;
  }

  // If nested inside an object property
  for (const key of Object.keys(mod)) {
    if (Array.isArray(mod[key]) && mod[key].length > 0 && mod[key][0]?.items) {
      return mod[key];
    }
  }

  return [];
};

const BASE_CATEGORIES = extractInitialCategories();
const STORAGE_KEY = 'amz_active_store_catalog';

const getInitialCatalog = (): ShowcaseCategory[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return BASE_CATEGORIES;
    const parsed = JSON.parse(raw);
    // If empty or corrupted, fall back to BASE_CATEGORIES
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return BASE_CATEGORIES;
    }
    return parsed;
  } catch {
    return BASE_CATEGORIES;
  }
};

const saveCatalog = (categories: ShowcaseCategory[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
  } catch {
    // ignore
  }
};

export const useCatalogStore = create<CatalogState>((set, get) => ({
  categories: getInitialCatalog(),

  addProduct: (newProduct: ShowcaseItem) => {
    let currentCategories = get().categories;
    if (!currentCategories || currentCategories.length === 0) {
      currentCategories = BASE_CATEGORIES;
    }

    const safeProduct: ShowcaseItem = {
      ...newProduct,
      price: Number(newProduct.price) || 0,
      stockUnits: Number(newProduct.stockUnits) || 25,
    };

    const targetCatId = Number(safeProduct.categoryId);
    const categoryExists = currentCategories.some((c) => c.id === targetCatId);

    let updatedCategories: ShowcaseCategory[];

    if (categoryExists) {
      updatedCategories = currentCategories.map((cat) => {
        if (cat.id === targetCatId) {
          return {
            ...cat,
            items: [safeProduct, ...cat.items.filter((it) => it.id !== safeProduct.id)],
          };
        }
        return cat;
      });
    } else {
      updatedCategories = currentCategories.map((cat, idx) => {
        if (idx === 0) {
          return {
            ...cat,
            items: [safeProduct, ...cat.items],
          };
        }
        return cat;
      });
    }

    saveCatalog(updatedCategories);
    set({ categories: updatedCategories });
  },

  addItem: (product: ShowcaseItem) => {
    get().addProduct(product);
  },

  resetCatalog: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ categories: BASE_CATEGORIES });
  },
}));