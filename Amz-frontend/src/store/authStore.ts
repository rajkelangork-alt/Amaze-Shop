import { create } from 'zustand';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name?: string;
  role: 'admin' | 'vendor' | 'customer';
}

interface AuthState {
  user: User | null;
  token: string | null;
  login: (email: string, password?: string) => Promise<User>;
  logout: () => void;
}

const STORAGE_KEY = 'amz_auth_session';

const KNOWN_USERS: Record<string, { first_name: string; last_name: string; role: 'admin' | 'vendor' | 'customer' }> = {
  // 1 Admin
  'admin@amzshop.com': { first_name: 'Admin', last_name: 'Console', role: 'admin' },
  // 5 Customers
  'customer1@amzshop.com': { first_name: 'John', last_name: 'Doe', role: 'customer' },
  'customer2@amzshop.com': { first_name: 'Sarah', last_name: 'Connor', role: 'customer' },
  'customer3@amzshop.com': { first_name: 'Michael', last_name: 'Scott', role: 'customer' },
  'customer4@amzshop.com': { first_name: 'Elena', last_name: 'Rostova', role: 'customer' },
  'customer5@amzshop.com': { first_name: 'David', last_name: 'Kim', role: 'customer' },
  // 4 Vendors
  'vendor.apex@amzshop.com': { first_name: 'Apex', last_name: 'Supplies', role: 'vendor' },
  'vendor.nova@amzshop.com': { first_name: 'Nova', last_name: 'Retail', role: 'vendor' },
  'vendor.zenith@amzshop.com': { first_name: 'Zenith', last_name: 'Hardware', role: 'vendor' },
  'vendor.prime@amzshop.com': { first_name: 'Prime', last_name: 'Merchants', role: 'vendor' },
};

const getInitialSession = (): { user: User | null; token: string | null } => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { user: null, token: null };
    const parsed = JSON.parse(raw);
    return { user: parsed.user || null, token: parsed.token || null };
  } catch {
    return { user: null, token: null };
  }
};

export const useAuthStore = create<AuthState>((set) => {
  const initial = getInitialSession();

  return {
    user: initial.user,
    token: initial.token,

    login: async (rawEmail: string) => {
      const cleanEmail = rawEmail.trim().toLowerCase();
      const meta = KNOWN_USERS[cleanEmail] || {
        first_name: cleanEmail.split('@')[0],
        last_name: '',
        role: cleanEmail.includes('admin')
          ? 'admin'
          : cleanEmail.startsWith('vendor')
          ? 'vendor'
          : 'customer',
      };

      const authenticatedUser: User = {
        id: `usr-${cleanEmail.replace(/[^a-z0-9]/g, '')}`,
        email: cleanEmail,
        first_name: meta.first_name,
        last_name: meta.last_name,
        role: meta.role,
      };

      const sessionToken = `token-${Date.now()}`;
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: authenticatedUser, token: sessionToken }));
      set({ user: authenticatedUser, token: sessionToken });
      return authenticatedUser;
    },

    logout: () => {
      localStorage.removeItem(STORAGE_KEY);
      set({ user: null, token: null });
    },
  };
});