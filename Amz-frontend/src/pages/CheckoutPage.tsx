import { useState, useMemo, type FC } from 'react';
import { 
  ArrowLeft, 
  ShieldCheck, 
  CreditCard, 
  Truck, 
  QrCode, 
  Banknote,
  CheckCircle2,
  ShoppingBag
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useOrderStore } from '@/store/orderStore';

interface CheckoutPageProps {
  onBack: () => void;
  onOrderSuccess: () => void;
}

export const CheckoutPage: FC<CheckoutPageProps> = ({ onBack, onOrderSuccess }) => {
  const user = useAuthStore((state) => state.user);
  const rawCartItems = useCartStore((state) => state.items);
  const cartItems = Array.isArray(rawCartItems) ? rawCartItems : [];
  const clearCart = useCartStore((state) => state.clearCart);
  const createOrder = useOrderStore((state) => state.createOrder);

  const addresses = [
    {
      id: 1,
      title: 'Home Address',
      fullAddress: '442 Silicon Boulevard, Suite 300, Palo Alto, CA 94301',
      recipient: `${user?.first_name || 'Customer'} ${user?.last_name || 'User'} (+1 555-234-5678)`,
    },
    {
      id: 2,
      title: 'Work / Office',
      fullAddress: '100 Innovation Way, Building B, San Jose, CA 95110',
      recipient: `${user?.first_name || 'Customer'} ${user?.last_name || 'User'} (+1 555-876-5432)`,
    },
  ];

  const [selectedAddressId, setSelectedAddressId] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<'Credit Card' | 'UPI (GPay)' | 'Cash on Delivery'>('Credit Card');

  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('888');

  const [upiId, setUpiId] = useState('john@okaxis');
  const [selectedUpiApp, setSelectedUpiApp] = useState<'gpay' | 'phonepe' | 'paytm'>('gpay');

  const subtotal = useMemo(() => {
    return cartItems.reduce((sum, cartItem: any) => {
      const rawPrice = cartItem.price ?? cartItem.item?.price ?? 0;
      const numPrice = Number(rawPrice);
      const safePrice = Number.isNaN(numPrice) ? 0 : numPrice;
      const safeQty = Number(cartItem.quantity) || 1;
      return sum + safePrice * safeQty;
    }, 0);
  }, [cartItems]);

  const tax = Number((subtotal * 0.05).toFixed(2));
  const total = Number((subtotal + tax).toFixed(2));

  const chosenAddress = addresses.find((a) => a.id === selectedAddressId)?.fullAddress || addresses[0].fullAddress;

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) return;

    let finalPaymentLabel = paymentMethod;
    if (paymentMethod === 'UPI (GPay)') {
      finalPaymentLabel = `UPI (${selectedUpiApp.toUpperCase()}: ${upiId})` as any;
    }

    createOrder({
      customerName: `${user?.first_name || 'Customer'} ${user?.last_name || ''}`.trim(),
      userEmail: user?.email || 'customer1@amzshop.com',
      shippingAddress: chosenAddress,
      paymentMethod: finalPaymentLabel,
      totalAmount: total,
      items: cartItems.map((cartItem: any) => ({
        item: cartItem.item || cartItem,
        price: Number(cartItem.price ?? cartItem.item?.price ?? 0),
        quantity: Number(cartItem.quantity) || 1,
        editionName: cartItem.editionName || 'Standard Edition',
        vendorEmail: cartItem.vendorEmail || cartItem.item?.vendorEmail || 'vendor.apex@amzshop.com',
      })),
    });

    clearCart();
    onOrderSuccess();
  };

  // Graceful empty cart view preventing blank screen crash
  if (cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900">Your Cart is Currently Empty</h2>
        <p className="text-xs text-slate-500">
          Looks like you haven't added any items to your cart yet. Browse our verified collections to get started.
        </p>
        <button
          onClick={onBack}
          className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
        >
          &larr; Return to Storefront
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 hover:text-sky-900 bg-white border border-sky-200 px-3.5 py-1.5 rounded-xl shadow-xs transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Return to Shopping Cart
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          {/* 1. Address Section */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="w-6 h-6 rounded-full bg-sky-500 text-white flex items-center justify-center font-black text-xs">
                1
              </span>
              <h2 className="text-sm font-black text-slate-900">Select Shipping Address</h2>
            </div>

            <div className="space-y-3">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  onClick={() => setSelectedAddressId(addr.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start justify-between ${
                    selectedAddressId === addr.id
                      ? 'border-sky-500 bg-sky-50/50 shadow-xs ring-1 ring-sky-400'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-900">{addr.title}</span>
                    <p className="text-xs text-slate-600">{addr.fullAddress}</p>
                    <p className="text-[11px] text-slate-400">{addr.recipient}</p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center mt-1 ${
                    selectedAddressId === addr.id ? 'border-sky-500 bg-sky-500' : 'border-slate-300'
                  }`}>
                    {selectedAddressId === addr.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Payment Method Section */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="w-6 h-6 rounded-full bg-sky-500 text-white flex items-center justify-center font-black text-xs">
                2
              </span>
              <h2 className="text-sm font-black text-slate-900">Select Payment Method</h2>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('Credit Card')}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  paymentMethod === 'Credit Card'
                    ? 'border-sky-500 bg-sky-50/50 text-sky-900 ring-1 ring-sky-400 font-bold'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-white font-medium'
                }`}
              >
                <CreditCard className="w-5 h-5 text-sky-600" />
                <span className="text-xs">Credit/Debit Card</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('UPI (GPay)')}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  paymentMethod === 'UPI (GPay)'
                    ? 'border-sky-500 bg-sky-50/50 text-sky-900 ring-1 ring-sky-400 font-bold'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-white font-medium'
                }`}
              >
                <QrCode className="w-5 h-5 text-sky-600" />
                <span className="text-xs">UPI / QR Code</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('Cash on Delivery')}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  paymentMethod === 'Cash on Delivery'
                    ? 'border-sky-500 bg-sky-50/50 text-sky-900 ring-1 ring-sky-400 font-bold'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-white font-medium'
                }`}
              >
                <Banknote className="w-5 h-5 text-sky-600" />
                <span className="text-xs">Cash on Delivery</span>
              </button>
            </div>

            {paymentMethod === 'Credit Card' && (
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">Expiration</label>
                    <input
                      type="text"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">CVV / CVC</label>
                    <input
                      type="password"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'UPI (GPay)' && (
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex gap-2">
                  {(['gpay', 'phonepe', 'paytm'] as const).map((app) => (
                    <button
                      key={app}
                      type="button"
                      onClick={() => setSelectedUpiApp(app)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold uppercase transition-all ${
                        selectedUpiApp === app
                          ? 'border-sky-500 bg-sky-50 text-sky-700'
                          : 'border-slate-200 text-slate-500'
                      }`}
                    >
                      {app}
                    </button>
                  ))}
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">UPI ID</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'Cash on Delivery' && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Pay in cash or through UPI upon doorstep delivery. No advance payment required.</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-5 h-fit">
          <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3">
            Review & Pay
          </h3>

          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {cartItems.map((cartItem: any) => {
              const p = Number(cartItem.price ?? cartItem.item?.price ?? 0);
              const q = Number(cartItem.quantity) || 1;
              return (
                <div key={cartItem.id} className="flex justify-between items-center text-xs">
                  <div className="pr-2">
                    <span className="font-bold text-slate-800 line-clamp-1">{cartItem.item?.name || cartItem.name}</span>
                    <span className="text-[11px] text-slate-400">Qty: {q} • {cartItem.editionName}</span>
                  </div>
                  <span className="font-bold text-slate-900 flex-shrink-0">${(p * q).toFixed(2)}</span>
                </div>
              );
            })}
          </div>

          <div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Items Subtotal:</span>
              <span className="font-bold text-slate-900">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Delivery Fee:</span>
              <span className="font-bold text-emerald-600 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5" /> FREE Prime
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Estimated Tax (5%):</span>
              <span className="font-bold text-slate-900">${tax.toFixed(2)}</span>
            </div>
            <div className="border-t border-slate-200 pt-3 flex justify-between items-baseline">
              <span className="text-sm font-black text-slate-900">Final Total:</span>
              <span className="text-xl font-black text-sky-600">${total.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={cartItems.length === 0}
            className="w-full py-3 bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            Place Your Order (${total.toFixed(2)})
          </button>

          <div className="text-center flex items-center justify-center gap-1 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-Bit SSL Encrypted Checkout</span>
          </div>
        </div>
      </div>
    </div>
  );
};