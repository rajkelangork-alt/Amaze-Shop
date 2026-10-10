import type { FC, MouseEvent } from 'react';
import { Product } from '@/types';
import { ShoppingCart, Star } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: FC<ProductCardProps> = ({ product }) => {
  const addItem = useCartStore((state) => state.addItem);

  const variants = Array.isArray(product?.variants) ? product.variants : [];
  const images = Array.isArray(product?.images) ? product.images : [];

  const primaryVariant = variants[0];
  const primaryImage = images.find((img) => img?.is_primary)?.image_url || images[0]?.image_url;

  const handleAddToCart = (e: MouseEvent) => {
    e.stopPropagation();
    if (primaryVariant?.id) {
      addItem(primaryVariant.id, 1);
    }
  };

  const formattedPrice = Number(product?.base_price || 0).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  return (
    <div className="group bg-white rounded-xl border border-slate-200 hover:border-slate-300 transition-all duration-200 overflow-hidden shadow-sm flex flex-col justify-between">
      <div className="relative aspect-square bg-[#F8F9FA] flex items-center justify-center p-6 border-b border-slate-100 overflow-hidden">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={product.name || 'Product'}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="text-slate-400 text-xs font-medium">Amaze.Shop</div>
        )}
        {product?.is_featured && (
          <span className="absolute top-2.5 left-2.5 bg-sky-50 text-sky-600 border border-sky-100 text-[11px] font-semibold px-2 py-0.5 rounded-full">
            Featured
          </span>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1 mb-1 text-amber-500 text-xs font-medium">
            <Star className="w-3.5 h-3.5 fill-amber-400 stroke-none" />
            <span>4.8</span>
            <span className="text-slate-400 font-normal">(24)</span>
          </div>
          <h3 className="text-sm font-semibold text-slate-800 line-clamp-1 group-hover:text-sky-600 transition-colors">
            {product?.name || 'Unnamed Product'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {product?.description || 'No description available.'}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block font-normal">Price</span>
            <span className="text-base font-bold text-slate-900">{formattedPrice}</span>
          </div>
          <button
            onClick={handleAddToCart}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white text-xs font-medium transition-colors shadow-sm"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Add
          </button>
        </div>
      </div>
    </div>
  );
};