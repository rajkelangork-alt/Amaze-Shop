import { useState, useMemo, type FC } from 'react';
import {
  ShieldAlert,
  Users,
  Store,
  TrendingUp,
  Package,
  ArrowLeft,
  Search,
  Eye
} from 'lucide-react';
import { useCatalogStore, CatalogState } from '@/store/catalogStore';
import { OrderRecord } from '@/store/orderStore';
import { useAuthStore } from '@/store/authStore';
import { ShowcaseItem, ShowcaseCategory } from '@/constants/categories';
import { ProductImageWithFallback } from '@/components/common/AdCard';

interface AdminPortalProps {
  onBackToStore: () => void;
  onSelectProduct?: (item: ShowcaseItem) => void;
}

const REGISTERED_VENDORS = [
  { name: 'Apex Supplies Ltd', email: 'vendor.apex@amzshop.com' },
  { name: 'Nova Retail Global', email: 'vendor.nova@amzshop.com' },
  { name: 'Zenith Hardware & Sports', email: 'vendor.zenith@amzshop.com' },
  { name: 'Prime Merchants Hub', email: 'vendor.prime@amzshop.com' },
];

const REGISTERED_CUSTOMERS = [
  { name: 'John Doe', email: 'customer1@amzshop.com' },
  { name: 'Sarah Connor', email: 'customer2@amzshop.com' },
  { name: 'Michael Scott', email: 'customer3@amzshop.com' },
  { name: 'Elena Rostova', email: 'customer4@amzshop.com' },
  { name: 'David Kim', email: 'customer5@amzshop.com' },
];

export const AdminPortal: FC<AdminPortalProps> = ({ onBackToStore, onSelectProduct }) => {
  const user = useAuthStore((state) => state.user);
  const categories = useCatalogStore((state: CatalogState) => state.categories);

  const allOrders: OrderRecord[] = useMemo(() => {
    try {
      const raw = localStorage.getItem('amz_all_orders_ledger');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }, []);

  const [activeTab, setActiveTab] = useState<'analytics' | 'vendors' | 'customers' | 'catalog'>('analytics');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState<number | 'all'>('all');
  const [customerModal, setCustomerModal] = useState<typeof REGISTERED_CUSTOMERS[0] | null>(null);

  const allProducts: ShowcaseItem[] = useMemo(() => {
    return categories.flatMap((c: ShowcaseCategory) => c.items);
  }, [categories]);

  // Telemetry Calculations
  const grossMerchandiseValue = useMemo(() => {
    return allOrders.reduce((acc, o) => acc + (Number(o.totalAmount) || 0), 0);
  }, [allOrders]);

  const platformRevenueCut = grossMerchandiseValue * 0.10;

  const totalUnitsSold = useMemo(() => {
    return allOrders.reduce((acc, o) => {
      const orderUnits = (o.items || []).reduce((s, it: any) => {
        const q = Number(it.quantity) || 1;
        return s + q;
      }, 0);
      return acc + orderUnits;
    }, 0);
  }, [allOrders]);

  const averageOrderValue = allOrders.length > 0 ? grossMerchandiseValue / allOrders.length : 0;

  const filteredCatalog = useMemo(() => {
    return allProducts.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
        p.vendorEmail?.toLowerCase().includes(catalogSearch.toLowerCase());
      const matchesCategory =
        selectedCatFilter === 'all' || p.categoryId === selectedCatFilter;
      return matchesSearch && matchesCategory;
    });
  }, [allProducts, catalogSearch, selectedCatFilter]);

  const categoryStats = useMemo(() => {
    return categories.map((cat: ShowcaseCategory) => {
      const itemCount = cat.items.length;
      const totalInventoryVal = cat.items.reduce((sum, it) => sum + (Number(it.price) || 0) * 25, 0);
      return {
        id: cat.id,
        name: cat.name,
        count: itemCount,
        value: totalInventoryVal,
      };
    });
  }, [categories]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <button
            onClick={onBackToStore}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 hover:text-sky-900 bg-white border border-sky-200 px-3 py-1.5 rounded-xl shadow-xs transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Storefront
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-950 tracking-tight">Marketplace Admin Console</h1>
              <p className="text-xs text-slate-500 font-medium">
                Executive Control Center • Logged in as <strong className="text-slate-900 font-mono">{user?.email || 'admin@amzshop.com'}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Global Executive Metric Cards (Single Row of 4 Cards) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs text-center border-t-4 border-t-slate-900 min-w-[130px]">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Gross GMV</span>
            <span className="text-lg font-black text-slate-950 mt-0.5 block">${grossMerchandiseValue.toFixed(2)}</span>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs text-center border-t-4 border-t-indigo-600 min-w-[130px]">
            <span className="text-[10px] text-indigo-600 font-black uppercase tracking-wider block">Platform (10%)</span>
            <span className="text-lg font-black text-indigo-700 mt-0.5 block">${platformRevenueCut.toFixed(2)}</span>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs text-center border-t-4 border-t-sky-500 min-w-[130px]">
            <span className="text-[10px] text-sky-600 font-black uppercase tracking-wider block">Completed Orders</span>
            <span className="text-lg font-black text-sky-700 mt-0.5 block">{allOrders.length}</span>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs text-center border-t-4 border-t-emerald-500 min-w-[130px]">
            <span className="text-[10px] text-emerald-600 font-black uppercase tracking-wider block">Live SKUs</span>
            <span className="text-lg font-black text-emerald-700 mt-0.5 block">{allProducts.length}</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'analytics'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
          }`}
        >
          <TrendingUp className="w-4 h-4" /> Marketplace Analytics
        </button>
        <button
          onClick={() => setActiveTab('vendors')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'vendors'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
          }`}
        >
          <Store className="w-4 h-4" /> Vendor Audit Matrix ({REGISTERED_VENDORS.length})
        </button>
        <button
          onClick={() => setActiveTab('customers')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'customers'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
          }`}
        >
          <Users className="w-4 h-4" /> Customer LTV & Orders ({REGISTERED_CUSTOMERS.length})
        </button>
        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'catalog'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
          }`}
        >
          <Package className="w-4 h-4" /> Global Catalog Master ({allProducts.length})
        </button>
      </div>

      {/* TAB 1: Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Order Velocity</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">{totalUnitsSold} Units</span>
              </div>
              <p className="text-xs text-slate-500">Physical product units successfully checked out across all customer journeys.</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Average Order Value (AOV)</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900">${averageOrderValue.toFixed(2)}</span>
                <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md">Unified Cart</span>
              </div>
              <p className="text-xs text-slate-500">Average gross check-out value per transaction.</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Platform Health Score</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-emerald-600">99.8%</span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">Optimal</span>
              </div>
              <p className="text-xs text-slate-500">Multi-vendor routing and split-tender payment pipelines functioning with zero faults.</p>
            </div>
          </div>

          {/* Departmental Inventory */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Category Inventory & Valuation Distribution</h3>
                <p className="text-xs text-slate-400">Real-time inventory breakdown across store categories</p>
              </div>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                Active Catalog Categories
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {categoryStats.map((stat) => (
                <div key={stat.id} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                    <span className="truncate">{stat.name}</span>
                    <span className="text-slate-500 font-normal">{stat.count} items</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                    <span>Est. Stock Value:</span>
                    <strong className="text-slate-800">${stat.value.toLocaleString()}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Vendor Audit Matrix */}
      {activeTab === 'vendors' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Registered Vendor Performance & Audit</h3>
            <p className="text-xs text-slate-400">Real-time ledger tracking SKU counts and vendor payout liabilities</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3">Vendor / Merchant</th>
                  <th className="p-3">Email Identifier</th>
                  <th className="p-3">Assigned Products</th>
                  <th className="p-3">Orders Received</th>
                  <th className="p-3">Vendor Net Sales</th>
                  <th className="p-3">10% Platform Fee</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {REGISTERED_VENDORS.map((ven) => {
                  const vendorItems = allProducts.filter((p) => p.vendorEmail === ven.email);

                  let vendorOrderCount = 0;
                  let vendorRevenue = 0;
                  allOrders.forEach((ord) => {
                    const matched = (ord.items || []).filter((it: any) => it.vendorEmail === ven.email);
                    if (matched.length > 0) {
                      vendorOrderCount += 1;
                      vendorRevenue += matched.reduce((s, it: any) => s + (Number(it.price) || 0) * (Number(it.quantity) || 1), 0);
                    }
                  });

                  return (
                    <tr key={ven.email} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                        <Store className="w-4 h-4 text-sky-500" />
                        <span>{ven.name}</span>
                      </td>
                      <td className="p-3 text-slate-500 font-mono text-[11px]">{ven.email}</td>
                      <td className="p-3 font-semibold text-slate-800">{vendorItems.length} SKUs</td>
                      <td className="p-3 font-semibold text-sky-600">{vendorOrderCount} orders</td>
                      <td className="p-3 font-extrabold text-emerald-600">${vendorRevenue.toFixed(2)}</td>
                      <td className="p-3 font-bold text-indigo-600">${(vendorRevenue * 0.10).toFixed(2)}</td>
                      <td className="p-3">
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">
                          Active & Verified
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Customer LTV */}
      {activeTab === 'customers' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Customer Account Audits & Lifetime Value (LTV)</h3>
            <p className="text-xs text-slate-400">Total consumer spending and order tracking across all 5 profiles</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3">Customer Name</th>
                  <th className="p-3">Email Address</th>
                  <th className="p-3">Total Orders Placed</th>
                  <th className="p-3">Lifetime Value (LTV)</th>
                  <th className="p-3">Last Order Date</th>
                  <th className="p-3">Order Inspector</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {REGISTERED_CUSTOMERS.map((cust) => {
                  const customerOrders = allOrders.filter((o) => o.userEmail === cust.email);
                  const ltv = customerOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
                  const lastOrder = customerOrders[0];

                  return (
                    <tr key={cust.email} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-sky-100 text-sky-700 font-extrabold flex items-center justify-center text-[10px]">
                          {cust.name[0]}
                        </div>
                        <span>{cust.name}</span>
                      </td>
                      <td className="p-3 text-slate-500 font-mono text-[11px]">{cust.email}</td>
                      <td className="p-3 font-semibold text-slate-800">{customerOrders.length} Orders</td>
                      <td className="p-3 font-extrabold text-emerald-600">${ltv.toFixed(2)}</td>
                      <td className="p-3 text-slate-500">{lastOrder ? lastOrder.createdAt : 'No purchases yet'}</td>
                      <td className="p-3">
                        <button
                          onClick={() => setCustomerModal(cust)}
                          disabled={customerOrders.length === 0}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 font-bold rounded-lg text-[11px] flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Orders ({customerOrders.length})
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Catalog Master */}
      {activeTab === 'catalog' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Master Catalog Directory ({filteredCatalog.length} Products)</h3>
              <p className="text-xs text-slate-400">Search, verify vendor ownership, and audit prices across the entire catalog</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  placeholder="Filter by title or vendor..."
                  className="bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 w-48 sm:w-60 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <select
                value={selectedCatFilter}
                onChange={(e) =>
                  setSelectedCatFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value, 10))
                }
                className="bg-slate-50 border border-slate-200 rounded-xl px-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="all">All Departments</option>
                {categories.map((c: ShowcaseCategory) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3">Product Title</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Vendor / Merchant</th>
                  <th className="p-3">Catalog Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCatalog.slice(0, 50).map((prod) => {
                  const cat = categories.find((c: ShowcaseCategory) => c.id === prod.categoryId);
                  return (
                    <tr key={prod.id} className="hover:bg-slate-50">
                      <td className="p-3 font-semibold text-slate-900 flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 overflow-hidden p-1">
                          {prod.imageFileName?.startsWith('data:') ? (
                            <img src={prod.imageFileName} alt={prod.name} className="w-full h-full object-contain" />
                          ) : (
                            <ProductImageWithFallback item={prod} />
                          )}
                        </div>
                        <span className="line-clamp-1">{prod.name}</span>
                      </td>
                      <td className="p-3 text-slate-500">{cat?.name || `Category #${prod.categoryId}`}</td>
                      <td className="p-3 font-bold text-slate-900">${Number(prod.price).toFixed(2)}</td>
                      <td className="p-3 text-indigo-600 font-mono text-[11px]">{prod.vendorEmail}</td>
                      <td className="p-3 flex items-center gap-2">
                        {onSelectProduct && (
                          <button
                            onClick={() => onSelectProduct(prod)}
                            className="text-sky-600 hover:text-sky-800 font-semibold text-[11px] hover:underline cursor-pointer"
                          >
                            Inspect
                          </button>
                        )}
                        <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold">
                          Listed
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Customer Orders Drill-down Modal */}
      {customerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl p-6 shadow-xl relative max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Purchases by {customerModal.name}
                </h3>
                <span className="text-xs text-slate-400 font-mono">{customerModal.email}</span>
              </div>
              <button
                onClick={() => setCustomerModal(null)}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="space-y-3">
              {allOrders
                .filter((o) => o.userEmail === customerModal.email)
                .map((ord) => (
                  <div key={ord.id} className="border border-slate-200 rounded-2xl p-3.5 space-y-2 bg-slate-50/70">
                    <div className="flex justify-between text-xs font-bold text-slate-900 border-b border-slate-200/80 pb-1.5">
                      <span>{ord.orderNumber} • {ord.createdAt}</span>
                      <span className="text-emerald-600">${Number(ord.totalAmount).toFixed(2)} ({ord.paymentMethod})</span>
                    </div>
                    <div className="space-y-1">
                      {(ord.items || []).map((item: any, idx) => (
                        <div key={idx} className="flex justify-between text-[11px] text-slate-600">
                          <span>{item.quantity}x {item.item?.name || 'Product'}</span>
                          <span className="font-mono text-slate-400">Fulfilled by: {item.vendorEmail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};