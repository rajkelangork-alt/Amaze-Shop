import { useState, useMemo, type FC } from 'react';
import { 
  ShoppingBag, 
  Heart, 
  MapPin, 
  Settings as SettingsIcon, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  Truck, 
  Package, 
  CheckCircle2, 
  Store 
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore, CartItem } from '@/store/cartStore';
import { useWishlistStore, WishlistItem } from '@/store/wishlistStore';
import { useOrderStore, OrderRecord } from '@/store/orderStore';
import { ProductImageWithFallback, getVendorDisplayName } from '@/components/common/AdCard';

interface AccountPageProps {
  initialTab?: 'cart' | 'wishlist' | 'orders' | 'addresses' | 'settings' | null;
  onBack?: () => void;
  onSelectItem?: (item: any) => void;
  onNavigateToCheckout?: () => void;
}

export const AccountPage: FC<AccountPageProps> = ({
  initialTab = 'orders',
  onSelectItem,
  onNavigateToCheckout,
}) => {
  const user = useAuthStore((state) => state.user);
  
  const [activeTab, setActiveTab] = useState<'cart' | 'wishlist' | 'orders' | 'addresses' | 'settings'>(
    initialTab || 'orders'
  );

  const cartItems = useCartStore((state) => state.items);
  const updateCartQty = useCartStore((state) => state.updateQuantity);
  const removeCartItem = useCartStore((state) => state.removeItem);

  const wishlistItems = useWishlistStore((state) => state.items);
  const removeWishlistItem = useWishlistStore((state) => state.removeItem);
  const addItemToCart = useCartStore((state) => state.addItem);

  const orderStore: any = useOrderStore();
  const rawOrders: OrderRecord[] = orderStore.orders || orderStore.userOrders || [];
  const currentEmail = user?.email || 'customer1@amzshop.com';

  const userOrders: OrderRecord[] = useMemo(() => {
    if (typeof orderStore.getUserOrders === 'function') {
      return orderStore.getUserOrders(currentEmail);
    }
    // Direct ledger lookup fallback
    try {
      const localLedger = localStorage.getItem('amz_all_orders_ledger');
      const all: OrderRecord[] = localLedger ? JSON.parse(localLedger) : rawOrders;
      return all.filter((o) => o.userEmail === currentEmail);
    } catch {
      return rawOrders.filter((o) => o.userEmail === currentEmail);
    }
  }, [orderStore, currentEmail, rawOrders]);

  // Pricing calculations
  const cartSubtotal = useMemo(() => {
    return cartItems.reduce((acc, ci: CartItem) => {
      const p = Number(ci.price ?? ci.item?.price ?? 0);
      const q = Number(ci.quantity) || 1;
      return acc + p * q;
    }, 0);
  }, [cartItems]);

  const estimatedTax = Number((cartSubtotal * 0.05).toFixed(2));
  const orderTotal = Number((cartSubtotal + estimatedTax).toFixed(2));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Account Profile Header Strip */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-sky-100 text-sky-700 font-black text-xl flex items-center justify-center shadow-xs">
            {user?.first_name?.[0] || 'C'}
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              {user?.first_name || 'Customer'} {user?.last_name || 'User'}
            </h1>
            <p className="text-xs text-slate-500">
              <span className="font-mono">{user?.email || 'customer@amzshop.com'}</span> • Verified Customer
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('cart')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'cart'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" /> Cart ({cartItems.length})
          </button>
          <button
            onClick={() => setActiveTab('wishlist')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'wishlist'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Heart className="w-3.5 h-3.5" /> Wishlist ({wishlistItems.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Truck className="w-3.5 h-3.5" /> Track Orders ({userOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('addresses')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'addresses'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" /> Addresses
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <SettingsIcon className="w-3.5 h-3.5" /> Settings
          </button>
        </div>
      </div>

      {/* Tab 1: Shopping Cart */}
      {activeTab === 'cart' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
            <h2 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3">
              Shopping Cart ({cartItems.length} items)
            </h2>

            {cartItems.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-xs space-y-2">
                <ShoppingBag className="w-8 h-8 mx-auto text-slate-300" />
                <p>Your shopping cart is empty.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {cartItems.map((ci) => {
                  const p = Number(ci.price ?? ci.item?.price ?? 0);
                  const q = Number(ci.quantity) || 1;
                  return (
                    <div key={ci.id} className="py-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-200/70 p-1 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {ci.item?.imageFileName?.startsWith('data:') ? (
                            <img src={ci.item.imageFileName} alt={ci.item.name} className="max-h-full max-w-full object-contain" />
                          ) : (
                            <ProductImageWithFallback item={ci.item} />
                          )}
                        </div>
                        <div>
                          <h4 
                            onClick={() => onSelectItem?.(ci.item)}
                            className="text-xs font-bold text-slate-900 line-clamp-1 hover:text-sky-600 cursor-pointer"
                          >
                            {ci.item?.name || 'Product'}
                          </h4>
                          <span className="text-[11px] text-slate-400 block">{ci.editionName}</span>
                          <span className="text-xs font-black text-slate-950 mt-0.5 block">${p.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                          <button
                            onClick={() => updateCartQty(ci.id, Math.max(1, q - 1))}
                            className="px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-600 cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-3 text-xs font-bold text-slate-800">{q}</span>
                          <button
                            onClick={() => updateCartQty(ci.id, q + 1)}
                            className="px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-600 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeCartItem(ci.id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                          title="Remove Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4 h-fit">
            <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3">Order Summary</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal:</span>
                <span className="font-bold text-slate-900">${cartSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Prime Shipping:</span>
                <span className="font-bold text-emerald-600">FREE</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Estimated Tax (5%):</span>
                <span className="font-bold text-slate-900">${estimatedTax.toFixed(2)}</span>
              </div>
              <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline">
                <span className="text-sm font-black text-slate-900">Order Total:</span>
                <span className="text-xl font-black text-sky-600">${orderTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Fully functional Proceed to Checkout Button */}
            <button
              onClick={() => {
                if (onNavigateToCheckout) {
                  onNavigateToCheckout();
                }
              }}
              disabled={cartItems.length === 0}
              className="w-full py-3 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Wishlist */}
      {activeTab === 'wishlist' && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
          <h2 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3">
            My Wishlist ({wishlistItems.length} items)
          </h2>

          {wishlistItems.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs space-y-2">
              <Heart className="w-8 h-8 mx-auto text-slate-300" />
              <p>Your wishlist is currently empty.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {wishlistItems.map((wi: WishlistItem) => (
                <div key={wi.id} className="border border-slate-200/80 rounded-2xl p-4 space-y-3 bg-slate-50/50 flex flex-col justify-between">
                  <div>
                    <div className="aspect-square bg-white rounded-xl border border-slate-100 p-2 flex items-center justify-center mb-2 overflow-hidden">
                      {wi.imageFileName?.startsWith('data:') ? (
                        <img src={wi.imageFileName} alt={wi.name} className="max-h-full max-w-full object-contain" />
                      ) : (
                        <ProductImageWithFallback item={wi as any} />
                      )}
                    </div>
                    <h4 
                      onClick={() => onSelectItem?.(wi)}
                      className="text-xs font-bold text-slate-900 line-clamp-1 hover:text-sky-600 cursor-pointer"
                    >
                      {wi.name}
                    </h4>
                    <span className="text-xs font-black text-slate-950 mt-1 block">${Number(wi.price).toFixed(2)}</span>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60">
                    <button
                      onClick={() => {
                        addItemToCart(wi as any, 'Standard Edition', 1);
                        removeWishlistItem(wi.id);
                      }}
                      className="flex-1 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-xs font-bold shadow-2xs transition-all cursor-pointer"
                    >
                      Move to Cart
                    </button>
                    <button
                      onClick={() => removeWishlistItem(wi.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Order History & Tracking */}
      {activeTab === 'orders' && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-black text-slate-900">Your Orders & Live Shipment Tracking</h2>
            <p className="text-xs text-slate-400">Track current package status and past purchases</p>
          </div>

          {userOrders.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs space-y-2">
              <Package className="w-8 h-8 mx-auto text-slate-300" />
              <p>You have not placed any orders yet. Once placed, live package status will appear here.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {userOrders.map((ord: OrderRecord) => (
                <div key={ord.id} className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                  {/* Order Summary Strip */}
                  <div className="bg-slate-50/90 border-b border-slate-200 px-5 py-3 flex flex-wrap items-center justify-between gap-4 text-xs">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Order ID</span>
                        <span className="font-mono font-bold text-slate-900">{ord.orderNumber}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Order Date</span>
                        <span className="text-slate-700 font-semibold">{ord.createdAt}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Paid</span>
                        <span className="font-bold text-slate-900">${ord.totalAmount.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Delivery Estimate</span>
                        <span className="font-bold text-emerald-600">Sat, Sep 26</span>
                      </div>
                    </div>

                    <span className="bg-sky-100 text-sky-800 text-[10px] font-bold px-2.5 py-1 rounded-full">
                      {ord.paymentMethod}
                    </span>
                  </div>

                  {/* Shipment Tracking Timeline */}
                  <div className="p-5 space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-sky-700">
                        <Truck className="w-4 h-4 text-sky-600" />
                        <span>Status: Order Placed</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-sky-500 h-full w-1/3 rounded-full" />
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                        <span className="text-sky-600 font-bold">Order Confirmed</span>
                        <span>Dispatching</span>
                        <span>Out for Delivery</span>
                        <span>Delivered</span>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="divide-y divide-slate-100 pt-2">
                      {ord.items.map((item, idx) => (
                        <div key={idx} className="py-3 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200/70 p-1 flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {item.item?.imageFileName?.startsWith('data:') ? (
                                <img src={item.item.imageFileName} alt={item.item.name} className="max-h-full max-w-full object-contain" />
                              ) : (
                                <ProductImageWithFallback item={item.item} />
                              )}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block">{item.item.name}</span>
                              <span className="text-[11px] text-slate-400 block">
                                Qty: {item.quantity} • {item.editionName}
                              </span>
                              <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                                <Store className="w-3 h-3 text-sky-500" />
                                Fulfilled by: {getVendorDisplayName(item.vendorEmail)}
                              </span>
                            </div>
                          </div>
                          <span className="font-bold text-slate-900">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                      Shipped to: <strong className="text-slate-700">{ord.shippingAddress}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Addresses */}
      {activeTab === 'addresses' && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
          <h2 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3">
            Saved Delivery Addresses
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 border-2 border-sky-400 bg-sky-50/40 rounded-2xl space-y-1">
              <span className="text-xs font-bold text-sky-800 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" /> Default Home Address
              </span>
              <p className="text-xs text-slate-700 font-medium">442 Silicon Boulevard, Suite 300, Palo Alto, CA 94301</p>
              <p className="text-[11px] text-slate-400">Recipient: {user?.first_name} {user?.last_name} (+1 555-234-5678)</p>
            </div>
            <div className="p-4 border border-slate-200 bg-slate-50/50 rounded-2xl space-y-1">
              <span className="text-xs font-bold text-slate-800">Office / Work Address</span>
              <p className="text-xs text-slate-700 font-medium">100 Innovation Way, Building B, San Jose, CA 95110</p>
              <p className="text-[11px] text-slate-400">Recipient: {user?.first_name} {user?.last_name} (+1 555-876-5432)</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Settings */}
      {activeTab === 'settings' && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
          <h2 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3">
            Account Settings & Preferences
          </h2>
          <div className="space-y-3 max-w-md text-xs">
            <div>
              <label className="text-slate-500 font-bold block mb-1">First Name</label>
              <input type="text" readOnly value={user?.first_name || 'Customer'} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2" />
            </div>
            <div>
              <label className="text-slate-500 font-bold block mb-1">Email Address</label>
              <input type="text" readOnly value={user?.email || 'customer@amzshop.com'} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};