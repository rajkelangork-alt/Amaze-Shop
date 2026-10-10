import { create } from 'zustand';
import { SHOWCASE_CATALOG, ShowcaseCategory, ShowcaseItem } from '@/constants/categories';

interface CatalogState {
  categories: ShowcaseCategory[];
  addProduct: (product: {
    name: string;
    description?: string;
    price: number;
    categoryId: number;
    stock: number;
    editionName?: string;
    vendorEmail: string;
    imageUrl?: string;
  }) => ShowcaseItem;
  getAllProducts: () => ShowcaseItem[];
  getVendorProducts: (vendorEmail: string) => ShowcaseItem[];
}

const STORAGE_KEY = 'amz_dynamic_custom_products';

const getCustomProducts = (): ShowcaseItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const buildInitialCatalog = (): ShowcaseCategory[] => {
  const customItems = getCustomProducts();
  return SHOWCASE_CATALOG.map((cat) => {
    const matchedCustom = customItems.filter((i) => i.categoryId === cat.id);
    return {
      ...cat,
      items: [...cat.items, ...matchedCustom],
    };
  });
};

export const useCatalogStore = create<CatalogState>((set, get) => ({
  categories: buildInitialCatalog(),

  addProduct: (productData) => {
    const newId = `custom-prod-${Date.now()}`;
    const newItem: ShowcaseItem = {
      id: newId,
      name: productData.name,
      price: productData.price,
      imageFileName: productData.imageUrl || '',
      categoryId: productData.categoryId,
      vendorEmail: productData.vendorEmail,
      editions: [
        {
          name: productData.editionName || 'Standard Edition',
          bundleDescription: productData.description || 'Verified merchant listing',
          price: productData.price,
        },
      ],
    };

    const existingCustom = getCustomProducts();
    const updatedCustom = [newItem, ...existingCustom];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCustom));

    // Update Zustand state
    set((state) => ({
      categories: state.categories.map((cat) => {
        if (cat.id === productData.categoryId) {
          return {
            ...cat,
            items: [newItem, ...cat.items],
          };
        }
        return cat;
      }),
    }));

    return newItem;
  },

  getAllProducts: () => {
    return get().categories.flatMap((c) => c.items);
  },

  getVendorProducts: (vendorEmail: string) => {
    return get().categories.flatMap((cat) =>
      cat.items.filter((item) => item.vendorEmail === vendorEmail)
    );
  },
}));