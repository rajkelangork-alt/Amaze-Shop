import { type FC } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Heart, 
  User as UserIcon, 
  Store, 
  ShieldAlert, 
  X,
  Sparkles
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';

interface HeaderProps {
  onNavigate: (view: 'home' | 'cart' | 'wishlist' | 'account' | 'vendor' | 'admin') => void;
  onOpenAuth: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
}

export const Header: FC<HeaderProps> = ({
  onNavigate,
  onOpenAuth,
  searchQuery = '',
  onSearchChange,
}) => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const cartItems = useCartStore((state) => state.items);
  const wishlistItems = useWishlistStore((state) => state.items);

  const totalCartCount = cartItems.reduce((acc, item) => acc + (Number(item.quantity) || 1), 0);
  const totalWishlistCount = wishlistItems.length;

  const emailLower = (user?.email || '').trim().toLowerCase();
  const roleLower = String(user?.role || '').trim().toLowerCase();

  const isAdmin = emailLower === 'admin@amzshop.com' || roleLower === 'admin' || emailLower.startsWith('admin');
  const isVendor = !isAdmin && (roleLower === 'vendor' || emailLower.startsWith('vendor'));

  const displayName = isAdmin 
    ? 'Admin' 
    : (user?.first_name || emailLower.split('@')[0] || 'User');

  const handleProtectedNavigate = (view: 'cart' | 'wishlist' | 'account' | 'vendor' | 'admin') => {
    if (!user) {
      onOpenAuth();
      return;
    }
    onNavigate(view);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-sky-100 shadow-sm">
      {/* Top micro-bar */}
      <div className="bg-slate-950 text-slate-300 text-[11px] py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <span>Free Same-Day Delivery on Prime Orders over $35 • Verified Merchant Fulfillment</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 text-left cursor-pointer flex-shrink-0 group"
          >
            <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center font-black text-lg shadow-sm group-hover:scale-105 transition-transform">
              A
            </span>
            <span className="text-xl font-black tracking-tight text-slate-950">
              Amaze<span className="text-sky-600">.Shop</span>
            </span>
          </button>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Search products, brands, and categories..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-9 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all shadow-inner"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            {searchQuery && (
              <button
                onClick={() => onSearchChange?.('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Vendor Hub Button */}
            {isVendor && (
              <button
                onClick={() => onNavigate('vendor')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-300 text-sky-700 text-xs font-bold hover:bg-sky-100 transition-all shadow-xs cursor-pointer"
              >
                <Store className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Vendor Hub</span>
              </button>
            )}

            {/* Admin Hub Button (Permanent for admin session) */}
            {isAdmin && (
              <button
                onClick={() => onNavigate('admin')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-sm transition-all cursor-pointer ring-2 ring-indigo-200"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Admin Hub</span>
              </button>
            )}

            {/* Wishlist */}
            <button
              onClick={() => handleProtectedNavigate('wishlist')}
              className="relative p-2 text-slate-700 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {totalWishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  {totalWishlistCount}
                </span>
              )}
            </button>

            {/* Shopping Cart */}
            <button
              onClick={() => handleProtectedNavigate('cart')}
              className="relative p-2 text-slate-700 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-colors cursor-pointer"
              title="Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-sky-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* User Profile / Auth */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <button
                  onClick={() => onNavigate(isAdmin ? 'admin' : 'account')}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-800 hover:text-sky-600 px-2 py-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <UserIcon className="w-3.5 h-3.5 text-sky-600" />
                  <span>Hi, {displayName}</span>
                </button>
                <button
                  onClick={() => {
                    logout();
                    onNavigate('home');
                  }}
                  className="text-xs text-slate-500 hover:text-rose-600 font-semibold px-1 transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-800 hover:text-sky-600 px-3.5 py-1.5 rounded-xl border border-slate-300 hover:border-slate-400 bg-white shadow-xs transition-all cursor-pointer"
              >
                <UserIcon className="w-3.5 h-3.5 text-slate-600" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};