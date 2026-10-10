import { useState, useMemo, type FC, type FormEvent, type ChangeEvent } from 'react';
import { 
  Store, 
  Package, 
  PlusCircle, 
  ArrowLeft, 
  UploadCloud, 
  CheckCircle2, 
  AlertCircle,
  Truck
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCatalogStore, CatalogState } from '@/store/catalogStore';
import { OrderRecord } from '@/store/orderStore';
import { ShowcaseItem, ShowcaseCategory } from '@/constants/categories';
import { ProductImageWithFallback, getVendorDisplayName } from '@/components/common/AdCard';

interface VendorPortalProps {
  onBackToStore: () => void;
}

export const VendorPortal: FC<VendorPortalProps> = ({ onBackToStore }) => {
  const user = useAuthStore((state) => state.user);
  const categories = useCatalogStore((state: CatalogState) => state.categories);
  const addProduct = useCatalogStore((state: CatalogState) => state.addProduct);

  const vendorEmail = (user?.email || 'vendor.apex@amzshop.com').trim().toLowerCase();
  const vendorDisplayName = getVendorDisplayName(vendorEmail);

  // Tabs
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'upload'>('products');

  // Form Fields
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number>(1);
  const [stockUnits, setStockUnits] = useState<string>('25');
  const [editionName, setEditionName] = useState('Standard Edition');
  const [description, setDescription] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Orders
  const allOrders: OrderRecord[] = useMemo(() => {
    try {
      const raw = localStorage.getItem('amz_all_orders_ledger');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }, []);

  const vendorOrders = useMemo(() => {
    return allOrders.filter((ord) =>
      (ord.items || []).some((it: any) => it.vendorEmail?.toLowerCase() === vendorEmail)
    );
  }, [allOrders, vendorEmail]);

  // Inventory
  const allProducts: ShowcaseItem[] = useMemo(() => {
    return categories.flatMap((c: ShowcaseCategory) => c.items);
  }, [categories]);

  const vendorProducts = useMemo(() => {
    return allProducts.filter((p) => p.vendorEmail?.toLowerCase() === vendorEmail);
  }, [allProducts, vendorEmail]);

  // Financials
  const totalGrossRevenue = useMemo(() => {
    return vendorOrders.reduce((acc, ord) => {
      const vendorItems = (ord.items || []).filter((it: any) => it.vendorEmail?.toLowerCase() === vendorEmail);
      const itemsSum = vendorItems.reduce((s, it: any) => s + (Number(it.price) || 0) * (Number(it.quantity) || 1), 0);
      return acc + itemsSum;
    }, 0);
  }, [vendorOrders, vendorEmail]);

  const netPayout = totalGrossRevenue * 0.90;

  const handleImageFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(reader.result as string);
      setErrorMessage('');
    };
    reader.readAsDataURL(file);
  };

  const handlePublishProduct = (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!title.trim()) {
      setErrorMessage('Product title is required.');
      return;
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setErrorMessage('Please enter a valid base price.');
      return;
    }

    const parsedStock = parseInt(stockUnits, 10);
    const safeStock = isNaN(parsedStock) || parsedStock <= 0 ? 1 : parsedStock;
    const newProductId = `custom-prod-${Date.now()}`;

    const newProduct: ShowcaseItem = {
      id: newProductId,
      name: title.trim(),
      price: parsedPrice,
      categoryId: Number(selectedCategoryId),
      vendorEmail: vendorEmail,
      stockUnits: safeStock, // Explicitly saved numerical stock units
      imageFileName: previewImage || '/assets/images/placeholder.png',
      editions: [
        {
          name: editionName.trim() || 'Standard Edition',
          bundleDescription: description.trim() || `${title.trim()} - Official merchant listing`,
          price: parsedPrice,
        },
      ],
    };

    // Store in catalog state
    addProduct(newProduct);

    // Also persist directly into a quick-lookup stock cache
    try {
      const stockCache = JSON.parse(localStorage.getItem('amz_product_stock_cache') || '{}');
      stockCache[newProductId] = safeStock;
      stockCache[newProduct.name] = safeStock;
      localStorage.setItem('amz_product_stock_cache', JSON.stringify(stockCache));
    } catch {
      // ignore
    }

    setSuccessMessage(`"${title}" published successfully with ${safeStock} stock units!`);
    setTitle('');
    setPrice('');
    setStockUnits('25');
    setDescription('');
    setPreviewImage(null);
    setActiveTab('products');

    setTimeout(() => {
      setSuccessMessage('');
    }, 3500);
  };

  // Helper to read stock units accurately
  const getProductStock = (prod: ShowcaseItem): number => {
    if (prod.stockUnits !== undefined && prod.stockUnits !== null) {
      return Number(prod.stockUnits);
    }
    try {
      const stockCache = JSON.parse(localStorage.getItem('amz_product_stock_cache') || '{}');
      if (stockCache[prod.id] !== undefined) return Number(stockCache[prod.id]);
      if (stockCache[prod.name] !== undefined) return Number(stockCache[prod.name]);
    } catch {
      // ignore
    }
    return 25; // Default for base pre-seeded catalog items
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <button
            onClick={onBackToStore}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 hover:text-sky-900 bg-white border border-sky-200 px-3 py-1.5 rounded-xl shadow-xs transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Storefront
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-sky-500 text-white flex items-center justify-center shadow-xs">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-950 tracking-tight">{vendorDisplayName} Hub</h1>
              <p className="text-xs text-slate-500 font-medium">
                Merchant Operations Console • <span className="font-mono text-slate-700">{vendorEmail}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs text-center border-t-4 border-t-slate-900 min-w-[120px]">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Gross Sales</span>
            <span className="text-lg font-black text-slate-950 mt-0.5 block">${totalGrossRevenue.toFixed(2)}</span>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs text-center border-t-4 border-t-emerald-500 min-w-[120px]">
            <span className="text-[10px] text-emerald-600 font-black uppercase tracking-wider block">Net Payout (90%)</span>
            <span className="text-lg font-black text-emerald-700 mt-0.5 block">${netPayout.toFixed(2)}</span>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs text-center border-t-4 border-t-sky-500 min-w-[120px]">
            <span className="text-[10px] text-sky-600 font-black uppercase tracking-wider block">Active Catalog</span>
            <span className="text-lg font-black text-sky-700 mt-0.5 block">{vendorProducts.length} SKUs</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'products'
              ? 'bg-sky-500 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
          }`}
        >
          <Package className="w-4 h-4" /> My Products ({vendorProducts.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-sky-500 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
          }`}
        >
          <Truck className="w-4 h-4" /> Customer Orders ({vendorOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'upload'
              ? 'bg-sky-500 text-white shadow-xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-300'
          }`}
        >
          <PlusCircle className="w-4 h-4" /> Upload New Product
        </button>
      </div>

      {successMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Tab 1: Product Inventory Table */}
      {activeTab === 'products' && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-black text-slate-900">Active Inventory of {vendorDisplayName}</h3>
              <p className="text-xs text-slate-400">All products owned and dispatched under your merchant profile</p>
            </div>
            <span className="text-xs font-bold text-slate-500">Total: {vendorProducts.length} Items</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3">Product</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Stock Units</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vendorProducts.map((prod) => {
                  const cat = categories.find((c: ShowcaseCategory) => c.id === prod.categoryId);
                  const displayStock = getProductStock(prod);

                  return (
                    <tr key={prod.id} className="hover:bg-slate-50">
                      <td className="p-3 font-semibold text-slate-900 flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 overflow-hidden p-1">
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
                      <td className="p-3 font-bold text-sky-800">
                        {displayStock} Units
                      </td>
                      <td className="p-3">
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-bold">
                          Active Storefront
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

      {/* Tab 2: Orders to Fulfill */}
      {activeTab === 'orders' && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-black text-slate-900">Orders to Fulfill</h3>
            <p className="text-xs text-slate-400">Shipments containing items purchased from your inventory</p>
          </div>

          {vendorOrders.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No customer orders for this vendor yet.
            </div>
          ) : (
            <div className="space-y-4">
              {vendorOrders.map((ord) => {
                const myItems = (ord.items || []).filter((it: any) => it.vendorEmail?.toLowerCase() === vendorEmail);
                const myTotal = myItems.reduce((s, it: any) => s + (Number(it.price) || 0) * (Number(it.quantity) || 1), 0);

                return (
                  <div key={ord.id} className="border border-slate-200 rounded-2xl p-4 space-y-2 bg-slate-50/50">
                    <div className="flex justify-between items-center text-xs border-b border-slate-200/70 pb-2">
                      <div>
                        <span className="font-mono font-bold text-slate-900">{ord.orderNumber}</span>
                        <span className="text-slate-400 ml-2">Customer: {ord.customerName} ({ord.userEmail})</span>
                      </div>
                      <span className="font-bold text-emerald-600">${myTotal.toFixed(2)} payout</span>
                    </div>

                    <div className="space-y-1">
                      {myItems.map((it: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-xs text-slate-600">
                          <span>{it.quantity}x {it.item?.name || 'Item'} ({it.editionName})</span>
                          <span className="font-bold text-slate-800">${(Number(it.price) * Number(it.quantity)).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-200/50">
                      Destination Address: <strong className="text-slate-700">{ord.shippingAddress}</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Upload Form */}
      {activeTab === 'upload' && (
        <form onSubmit={handlePublishProduct} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3">
              List a New Product Under {vendorDisplayName}
            </h3>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Product Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Amazon Fire Stick HD"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Base Price ($ USD) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs text-slate-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="29.99"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-7 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Department *</label>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white cursor-pointer"
                >
                  {categories.map((c: ShowcaseCategory) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Dynamic Stock Units Input */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Stock Units</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={stockUnits}
                  onChange={(e) => setStockUnits(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Edition / Storage</label>
                <input
                  type="text"
                  value={editionName}
                  onChange={(e) => setEditionName(e.target.value)}
                  placeholder="Standard Edition"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Product specifications and features..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Product Image Upload Box */}
          <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4 flex flex-col justify-between h-fit">
            <div>
              <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3">Product Image</h3>
              <div className="mt-4 border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-sky-400 transition-colors flex flex-col items-center justify-center relative min-h-[220px]">
                {previewImage ? (
                  <div className="w-full h-48 flex items-center justify-center p-2">
                    <img src={previewImage} alt="Preview" className="max-h-full max-w-full object-contain rounded-xl" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <UploadCloud className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="text-xs font-bold text-slate-700">Upload Product Picture</p>
                    <p className="text-[11px] text-slate-400">PNG, JPG, or WebP up to 10MB</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              Publish Product to Catalog
            </button>
          </div>
        </form>
      )}
    </div>
  );
};