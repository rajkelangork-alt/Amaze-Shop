import { useState, useMemo } from 'react';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { AdCard } from '@/components/common/AdCard';
import { AuthModal } from '@/components/auth/AuthModal';
import { VendorPortal } from '@/pages/VendorPortal';
import { AdminPortal } from '@/pages/AdminPortal';
import { CheckoutPage } from '@/pages/CheckoutPage';
import { CategoryPage } from '@/pages/CategoryPage';
import { ProductDetailPage } from '@/pages/ProductDetailPage';
import { AccountPage } from '@/pages/AccountPage';
import { useCatalogStore, CatalogState } from '@/store/catalogStore';
import { useAuthStore } from '@/store/authStore';
import { ShowcaseCategory, ShowcaseItem } from '@/constants/categories';

const ProductDetailView: any = ProductDetailPage;
const AccountView: any = AccountPage;
const CategoryPageView: any = CategoryPage;

export default function App() {
  const user = useAuthStore((state) => state.user);
  const categories: ShowcaseCategory[] = useCatalogStore((state: CatalogState) => state.categories);

  const [activeCategory, setActiveCategory] = useState<ShowcaseCategory | null>(null);
  const [activeItem, setActiveItem] = useState<ShowcaseItem | null>(null);
  const [accountTab, setAccountTab] = useState<'cart' | 'wishlist' | 'orders' | 'addresses' | 'settings' | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isVendorView, setIsVendorView] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return { categories, matchedItems: [] as ShowcaseItem[] };
    }

    const matchedCats = categories.filter((c: ShowcaseCategory) =>
      c.name.toLowerCase().includes(q) || c.tagline.toLowerCase().includes(q)
    );

    const matchedItems: ShowcaseItem[] = [];
    categories.forEach((cat: ShowcaseCategory) => {
      cat.items.forEach((item: ShowcaseItem) => {
        if (item.name.toLowerCase().includes(q)) {
          matchedItems.push(item);
        }
      });
    });

    return { categories: matchedCats, matchedItems };
  }, [searchQuery, categories]);

  const handleNavigate = (view: 'home' | 'cart' | 'wishlist' | 'account' | 'vendor' | 'admin') => {
    if ((view === 'account' || view === 'cart' || view === 'wishlist') && !user) {
      setAuthOpen(true);
      return;
    }

    setIsCheckingOut(false);
    setIsVendorView(view === 'vendor');
    setIsAdminView(view === 'admin');
    setActiveItem(null);
    setActiveCategory(null);

    if (view === 'home') {
      setAccountTab(null);
      setSearchQuery('');
    } else if (view === 'cart') {
      setAccountTab('cart');
    } else if (view === 'wishlist') {
      setAccountTab('wishlist');
    } else if (view === 'account') {
      setAccountTab('orders');
    } else if (view === 'admin' || view === 'vendor') {
      setAccountTab(null);
    }
    window.scrollTo(0, 0);
  };

  const handleSelectItem = (item: ShowcaseItem) => {
    setIsAdminView(false);
    setIsVendorView(false);
    setIsCheckingOut(false);
    setAccountTab(null);
    setActiveItem(item);
    window.scrollTo(0, 0);
  };

  const handleExploreCategory = (category: ShowcaseCategory) => {
    setIsAdminView(false);
    setIsVendorView(false);
    setIsCheckingOut(false);
    setAccountTab(null);
    setActiveItem(null);
    setActiveCategory(category);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-[#EEF4FB] text-slate-900 flex flex-col font-sans">
      <Header
        onNavigate={handleNavigate}
        onOpenAuth={() => setAuthOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main className="flex-1">
        {isAdminView ? (
          <AdminPortal
            onBackToStore={() => handleNavigate('home')}
            onSelectProduct={(item) => handleSelectItem(item)}
          />
        ) : isVendorView ? (
          <VendorPortal onBackToStore={() => handleNavigate('home')} />
        ) : isCheckingOut ? (
          <CheckoutPage
            onBack={() => setIsCheckingOut(false)}
            onOrderSuccess={() => {
              setIsCheckingOut(false);
              setActiveItem(null);
              setActiveCategory(null);
              setAccountTab('orders');
              window.scrollTo(0, 0);
            }}
          />
        ) : activeItem ? (
          <ProductDetailView
            item={activeItem}
            onBack={() => setActiveItem(null)}
            onSelectItem={handleSelectItem}
            onNavigateToCheckout={() => {
              if (!user) {
                setAuthOpen(true);
                return;
              }
              setActiveItem(null);
              setActiveCategory(null);
              setAccountTab(null);
              setIsCheckingOut(true);
              window.scrollTo(0, 0);
            }}
          />
        ) : activeCategory ? (
          <CategoryPageView
            category={activeCategory}
            onBack={() => setActiveCategory(null)}
            onSelectItem={handleSelectItem}
          />
        ) : accountTab && user ? (
          <AccountView
            initialTab={accountTab}
            onBack={() => setAccountTab(null)}
            onSelectItem={handleSelectItem}
            onNavigateToCheckout={() => {
              setActiveItem(null);
              setActiveCategory(null);
              setAccountTab(null);
              setIsCheckingOut(true);
              window.scrollTo(0, 0);
            }}
          />
        ) : (
          /* Default Storefront Homepage */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {!searchQuery && (
              <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-sky-950 to-blue-900 rounded-3xl p-8 sm:p-10 text-white shadow-md border border-slate-800">
                <div className="space-y-3 max-w-2xl">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-amber-400 bg-amber-400/10 border border-amber-400/30 px-3 py-1 rounded-full">
                    ★ Amaze Mega Deals Week
                  </span>
                  <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                    100+ Handpicked Essentials & Verified Merchant Listings
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-300 font-medium">
                    Direct manufacturer pricing, instant checkout, and deterministic multi-vendor fulfillment.
                  </p>
                </div>
              </div>
            )}

            <section className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {searchQuery ? `Search Results for "${searchQuery}"` : 'Featured Collections & Deals'}
                </h2>
              </div>

              {filteredData.categories.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-sm">
                  No products found matching your search.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredData.categories.map((cat: ShowcaseCategory) => (
                    <AdCard
                      key={cat.id}
                      category={cat}
                      onExploreCategory={handleExploreCategory}
                      onSelectItem={handleSelectItem}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      <Footer onNavigate={handleNavigate} />

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onLoginSuccess={() => {
          // Keep user on the home storefront upon successful authentication
          handleNavigate('home');
        }}
      />
    </div>
  );
}