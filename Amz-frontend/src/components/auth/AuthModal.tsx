import { useState, type FC, type FormEvent } from 'react';
import { 
  X, 
  Users, 
  Store, 
  ShieldAlert, 
  Mail, 
  Lock, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: (email: string) => void;
}

const TEST_CUSTOMERS = [
  { name: 'John Doe', email: 'customer1@amzshop.com' },
  { name: 'Sarah Connor', email: 'customer2@amzshop.com' },
  { name: 'Michael Scott', email: 'customer3@amzshop.com' },
  { name: 'Elena Rostova', email: 'customer4@amzshop.com' },
  { name: 'David Kim', email: 'customer5@amzshop.com' },
];

const TEST_VENDORS = [
  { name: 'Apex Supplies Ltd', email: 'vendor.apex@amzshop.com' },
  { name: 'Nova Retail Global', email: 'vendor.nova@amzshop.com' },
  { name: 'Zenith Hardware & Sports', email: 'vendor.zenith@amzshop.com' },
  { name: 'Prime Merchants Hub', email: 'vendor.prime@amzshop.com' },
];

const ADMIN_PROFILE = {
  name: 'System Administrator',
  email: 'admin@amzshop.com',
};

export const AuthModal: FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState('admin@amzshop.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSelectPreset = (presetEmail: string) => {
    setEmail(presetEmail);
    setPassword('password123');
    setError('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loginMethod: any = login;
      await loginMethod(email.trim(), password.trim());
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        if (onLoginSuccess) {
          onLoginSuccess(email.trim().toLowerCase());
        }
      }, 400);
    } catch {
      setError('Invalid email or password. Use password123 for test accounts.');
    } finally {
      setLoading(false);
    }
  };

  const getButtonLabel = () => {
    if (email === 'admin@amzshop.com') return 'Sign In as Admin';
    if (email.startsWith('vendor.')) {
      const v = email.split('@')[0];
      return `Sign In as ${v}`;
    }
    const c = email.split('@')[0];
    return `Sign In as ${c}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1">
          <h2 className="text-xl font-black text-slate-950 tracking-tight">Sign in to Amaze.Shop</h2>
          <p className="text-xs text-slate-500 font-medium">
            Click any profile below for 1-click test credentials
          </p>
        </div>

        {/* 1. ADMIN PROFILE (NEW) */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" /> Platform Administration (1 Account)
          </span>
          <button
            type="button"
            onClick={() => handleSelectPreset(ADMIN_PROFILE.email)}
            className={`w-full p-2.5 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
              email === ADMIN_PROFILE.email
                ? 'border-indigo-500 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-400 shadow-xs'
                : 'border-slate-200 bg-slate-50/50 hover:bg-indigo-50/30 text-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-[11px]">
                A
              </span>
              <span>{ADMIN_PROFILE.name}</span>
            </div>
            <span className="text-[11px] font-mono text-indigo-600 font-semibold">{ADMIN_PROFILE.email}</span>
          </button>
        </div>

        {/* 2. CUSTOMER PROFILES */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-sky-700 flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-sky-600" /> Customer Profiles (5 Accounts)
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {TEST_CUSTOMERS.map((cust) => (
              <button
                key={cust.email}
                type="button"
                onClick={() => handleSelectPreset(cust.email)}
                className={`px-2.5 py-2 rounded-xl border text-center text-xs font-semibold truncate transition-all cursor-pointer ${
                  email === cust.email
                    ? 'border-sky-500 bg-sky-50 text-sky-900 ring-2 ring-sky-400 shadow-xs'
                    : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-700'
                }`}
              >
                {cust.name}
              </button>
            ))}
          </div>
        </div>

        {/* 3. MERCHANT / VENDOR PROFILES */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-sky-700 flex items-center gap-1">
            <Store className="w-3.5 h-3.5 text-sky-600" /> Merchant / Vendor Profiles (4 Accounts)
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {TEST_VENDORS.map((ven) => (
              <button
                key={ven.email}
                type="button"
                onClick={() => handleSelectPreset(ven.email)}
                className={`px-3 py-2 rounded-xl border text-left text-xs font-semibold flex items-center gap-2 truncate transition-all cursor-pointer ${
                  email === ven.email
                    ? 'border-sky-500 bg-sky-50 text-sky-900 ring-2 ring-sky-400 shadow-xs'
                    : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <Store className="w-3.5 h-3.5 text-sky-500 flex-shrink-0" />
                <span className="truncate">{ven.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-3 pt-2 border-t border-slate-100">
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@amzshop.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white transition-colors"
              />
            </div>
          </div>

          {error && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Authenticated successfully! Redirecting...</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 ${
              email === 'admin@amzshop.com'
                ? 'bg-indigo-600 hover:bg-indigo-700'
                : 'bg-sky-500 hover:bg-sky-600'
            }`}
          >
            {loading ? 'Authenticating...' : getButtonLabel()}
          </button>
        </form>
      </div>
    </div>
  );
};