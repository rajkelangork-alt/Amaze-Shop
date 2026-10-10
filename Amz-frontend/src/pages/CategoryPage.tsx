import { useState, type FC } from 'react';
import { ArrowLeft, Star, ShoppingCart, Check } from 'lucide-react';
import { ShowcaseCategory, ShowcaseItem } from '@/constants/categories';
import { ProductImageWithFallback } from '@/components/common/AdCard';
import { useCartStore } from '@/store/cartStore';

interface CategoryPageProps {
  category: ShowcaseCategory;
  onBack: () => void;
  onSelectItem: (item: ShowcaseItem) => void;
}

export const CategoryPage: FC<CategoryPageProps> = ({ category, onBack, onSelectItem }) => {
  const addItem = useCartStore((state) => state.addItem);
  const [addedId, setAddedId] = useState<string | null>(null);

  const handleQuickAdd = async (e: React.MouseEvent, item: ShowcaseItem) => {
    e.stopPropagation();
    addItem(item, 'Standard Edition', item.price, 1);
    setAddedId(item.id);
    setTimeout(() => setAddedId(null), 1800);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Navigation header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-sky-600 mb-1 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to all collections
          </button>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{category.name}</h1>
          <p className="text-xs text-sky-600 font-medium">{category.tagline}</p>
        </div>
        <span className="text-xs font-semibold text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
          {category.items.length} Products
        </span>
      </div>

      {/* Product items grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {category.items.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectItem(item)}
            className="group bg-white border border-slate-200 hover:border-sky-300 rounded-xl p-3.5 shadow-sm cursor-pointer transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-square w-full rounded-lg bg-[#FAF9F6] border border-slate-100 p-2.5 flex items-center justify-center overflow-hidden mb-2">
                <ProductImageWithFallback item={item} />
              </div>

              <div className="flex items-center gap-1 text-amber-400 text-xs mt-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 stroke-none" />
                <span className="font-bold text-slate-700">4.9</span>
                <span className="text-slate-400 text-[11px]">(128)</span>
              </div>

              <h3 className="text-xs font-semibold text-slate-800 line-clamp-2 mt-1 group-hover:text-sky-600 transition-colors">
                {item.name}
              </h3>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block">Price</span>
                <span className="text-sm font-bold text-slate-900">${item.price.toFixed(2)}</span>
              </div>
              <button
                onClick={(e) => handleQuickAdd(e, item)}
                className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                  addedId === item.id
                    ? 'bg-emerald-500 text-white'
                    : 'bg-sky-50 text-sky-600 hover:bg-sky-500 hover:text-white'
                }`}
              >
                {addedId === item.id ? (
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                ) : (
                  <ShoppingCart className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};