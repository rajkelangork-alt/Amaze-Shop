import { type FC } from 'react';
import { ArrowUp, Globe, ShieldCheck, Truck, RefreshCw, CreditCard } from 'lucide-react';

interface FooterProps {
  onNavigate?: (view: 'home' | 'cart' | 'wishlist' | 'account' | 'vendor') => void;
}

export const Footer: FC<FooterProps> = ({ onNavigate }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="mt-auto bg-slate-900 text-slate-300 font-sans border-t border-slate-800">
      {/* Back to Top Button */}
      <button
        onClick={scrollToTop}
        className="w-full py-3.5 bg-slate-800/90 hover:bg-slate-700/90 text-xs font-semibold text-slate-200 transition-colors flex items-center justify-center gap-1.5 border-b border-slate-700/50"
      >
        <ArrowUp className="w-3.5 h-3.5" />
        Back to top
      </button>

      {/* Main Multi-Column Links Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10 text-xs">
          {/* Col 1 */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-tight">Get to Know Us</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button onClick={() => onNavigate?.('home')} className="hover:text-white transition-colors">
                  About Amaze.Shop
                </button>
              </li>
              <li className="hover:text-white cursor-pointer transition-colors">Careers & Culture</li>
              <li className="hover:text-white cursor-pointer transition-colors">Corporate Responsibility</li>
              <li className="hover:text-white cursor-pointer transition-colors">Press & Media Relations</li>
              <li className="hover:text-white cursor-pointer transition-colors">Investor Center</li>
            </ul>
          </div>

          {/* Col 2 */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-tight">Make Money with Us</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button
                  onClick={() => onNavigate?.('vendor')}
                  className="hover:text-sky-400 text-sky-400 font-semibold transition-colors flex items-center gap-1"
                >
                  Vendor Management Hub &rarr;
                </button>
              </li>
              <li className="hover:text-white cursor-pointer transition-colors">Sell on Amaze Marketplace</li>
              <li className="hover:text-white cursor-pointer transition-colors">Fulfillment by Amaze (FBA)</li>
              <li className="hover:text-white cursor-pointer transition-colors">Supply to Retail Partners</li>
              <li className="hover:text-white cursor-pointer transition-colors">Affiliate & Creator Program</li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-tight">Amaze Payment Products</h4>
            <ul className="space-y-2 text-slate-400">
              <li className="hover:text-white cursor-pointer transition-colors">Amaze Platinum Rewards Visa</li>
              <li className="hover:text-white cursor-pointer transition-colors">Shop with Reward Points</li>
              <li className="hover:text-white cursor-pointer transition-colors">Reload Your Balance</li>
              <li className="hover:text-white cursor-pointer transition-colors">Unified UPI & Direct Pay</li>
              <li className="hover:text-white cursor-pointer transition-colors">Amaze Currency Converter</li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-tight">Let Us Help You</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <button onClick={() => onNavigate?.('account')} className="hover:text-white transition-colors">
                  Your Account Hub
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate?.('account')} className="hover:text-white transition-colors">
                  Track Package Deliveries
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate?.('cart')} className="hover:text-white transition-colors">
                  Shopping Cart & Saved Items
                </button>
              </li>
              <li className="hover:text-white cursor-pointer transition-colors">Shipping Rates & Policies</li>
              <li className="hover:text-white cursor-pointer transition-colors">Returns & Replacements</li>
              <li className="hover:text-white cursor-pointer transition-colors">Customer Service & Help Desk</li>
            </ul>
          </div>
        </div>

        {/* Feature Badges Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-y border-slate-800 text-slate-400 text-xs">
          <div className="flex items-center gap-2.5">
            <Truck className="w-5 h-5 text-sky-400 flex-shrink-0" />
            <div>
              <span className="font-bold text-white block">Fast Express Delivery</span>
              <span className="text-[11px] text-slate-400">Free 2-day on Prime orders</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <div>
              <span className="font-bold text-white block">100% Secure Checkout</span>
              <span className="text-[11px] text-slate-400">256-Bit SSL protection</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <RefreshCw className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div>
              <span className="font-bold text-white block">30-Day Easy Returns</span>
              <span className="text-[11px] text-slate-400">Hassle-free guarantee</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <CreditCard className="w-5 h-5 text-indigo-400 flex-shrink-0" />
            <div>
              <span className="font-bold text-white block">Flexible Payment</span>
              <span className="text-[11px] text-slate-400">Cards, UPI & Doorstep COD</span>
            </div>
          </div>
        </div>

        {/* Bottom Branding & Legal */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate?.('home')}
              className="text-base font-extrabold text-white tracking-tight flex items-center gap-1.5"
            >
              <span className="w-5 h-5 rounded-md bg-sky-500 text-white flex items-center justify-center font-black text-xs">
                A
              </span>
              Amaze<span className="text-sky-400">.Shop</span>
            </button>
            <div className="flex items-center gap-1 text-[11px] text-slate-400 border border-slate-700 rounded-md px-2 py-1">
              <Globe className="w-3 h-3 text-slate-400" />
              <span>English (US)</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px]">
            <span className="hover:text-slate-300 cursor-pointer">Conditions of Use</span>
            <span className="hover:text-slate-300 cursor-pointer">Privacy Notice</span>
            <span className="hover:text-slate-300 cursor-pointer">Consumer Health Data Privacy</span>
            <span className="hover:text-slate-300 cursor-pointer">Your Ads Privacy Choices</span>
          </div>

          <p className="text-[11px] text-slate-500">
            &copy; {new Date().getFullYear()} Amaze.Shop, Inc. or its affiliates. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};