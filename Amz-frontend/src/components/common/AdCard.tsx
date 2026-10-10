import { useState, type FC } from 'react';
import { ChevronRight, Package } from 'lucide-react';
import { ShowcaseCategory, ShowcaseItem } from '@/constants/categories';

// 1. Grab all possible image files inside src/assets and public/assets
const allViteImages = import.meta.glob(
  [
    '/src/assets/images/**/*.{png,jpg,jpeg,webp,svg}',
    '/src/assets/**/*.{png,jpg,jpeg,webp,svg}',
    '/public/assets/images/**/*.{png,jpg,jpeg,webp,svg}',
    '/assets/images/**/*.{png,jpg,jpeg,webp,svg}',
  ],
  { eager: true, import: 'default' }
);

// Helper to sanitize strings into pure alphanumeric tokens
const normalize = (text: string = ''): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\.[^/.]+$/, '') // drop extension
    .replace(/[^a-z0-9]/g, ''); // drop spaces, hyphens, ampersands, punctuation
};

// 2. Build index dictionary
const imageDictionary: { cleanKey: string; url: string; originalName: string }[] = [];

Object.entries(allViteImages).forEach(([pathKey, resolvedUrl]) => {
  if (typeof resolvedUrl === 'string') {
    const fileName = pathKey.split('/').pop() || '';
    imageDictionary.push({
      cleanKey: normalize(fileName),
      url: resolvedUrl,
      originalName: fileName.toLowerCase(),
    });
  }
});

export const getVendorDisplayName = (vendorEmail?: string): string => {
  if (!vendorEmail) return 'Apex Supplies Ltd';
  const v = vendorEmail.toLowerCase();
  if (v.includes('apex')) return 'Apex Supplies Ltd';
  if (v.includes('nova')) return 'Nova Retail Global';
  if (v.includes('zenith')) return 'Zenith Hardware & Sports';
  if (v.includes('prime')) return 'Prime Merchants Hub';
  return 'Verified Merchant Partner';
};

export const resolveLocalImage = (item: ShowcaseItem): string | null => {
  if (!item) return null;

  // Direct uploaded data URL or external URL
  if (item.imageFileName?.startsWith('data:') || item.imageFileName?.startsWith('http')) {
    return item.imageFileName;
  }

  const targetFileKey = item.imageFileName ? normalize(item.imageFileName) : '';
  const targetNameKey = normalize(item.name);

  // 1. Exact clean match with imageFileName
  if (targetFileKey) {
    const directFileMatch = imageDictionary.find((entry) => entry.cleanKey === targetFileKey);
    if (directFileMatch) return directFileMatch.url;
  }

  // 2. Exact clean match with product name
  if (targetNameKey) {
    const directNameMatch = imageDictionary.find((entry) => entry.cleanKey === targetNameKey);
    if (directNameMatch) return directNameMatch.url;
  }

  // 3. Substring containment match (e.g. "cordlessbrushless" or "selfcleaningslicker")
  for (const entry of imageDictionary) {
    if (
      (targetNameKey.length > 5 && entry.cleanKey.includes(targetNameKey)) ||
      (entry.cleanKey.length > 5 && targetNameKey.includes(entry.cleanKey))
    ) {
      return entry.url;
    }
    if (targetFileKey && (entry.cleanKey.includes(targetFileKey) || targetFileKey.includes(entry.cleanKey))) {
      return entry.url;
    }
  }

  // 4. Token overlap match (handles filenames with slightly different words)
  const tokens = item.name
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3);

  let bestEntry: { url: string } | null = null;
  let maxMatchedTokens = 0;

  for (const entry of imageDictionary) {
    let matched = 0;
    for (const token of tokens) {
      if (entry.originalName.includes(token) || entry.cleanKey.includes(token)) {
        matched++;
      }
    }
    if (matched > maxMatchedTokens && matched >= 2) {
      maxMatchedTokens = matched;
      bestEntry = entry;
    }
  }

  if (bestEntry) {
    return bestEntry.url;
  }

  // 5. Raw public asset path fallback
  if (item.imageFileName) {
    return item.imageFileName.startsWith('/')
      ? item.imageFileName
      : `/assets/images/${encodeURIComponent(item.imageFileName)}`;
  }

  return `/assets/images/${encodeURIComponent(item.name)}.jpg`;
};

interface ProductImageProps {
  item: ShowcaseItem;
  className?: string;
}

export const ProductImageWithFallback: FC<ProductImageProps> = ({ item, className = '' }) => {
  const [hasError, setHasError] = useState(false);
  const resolvedSrc = resolveLocalImage(item);

  if (!resolvedSrc || hasError) {
    return (
      <div className={`w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-400 p-2 rounded-xl border border-slate-100 ${className}`}>
        <Package className="w-7 h-7 text-sky-400 mb-1" />
        <span className="text-[10px] text-center font-bold text-slate-600 line-clamp-1">{item.name}</span>
      </div>
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={item.name}
      onError={() => setHasError(true)}
      className={`max-h-full max-w-full object-contain transition-transform duration-200 group-hover:scale-105 ${className}`}
      loading="lazy"
    />
  );
};

interface AdCardProps {
  category: ShowcaseCategory;
  onExploreCategory: (category: ShowcaseCategory) => void;
  onSelectItem: (item: ShowcaseItem) => void;
}

export const AdCard: FC<AdCardProps> = ({ category, onExploreCategory, onSelectItem }) => {
  const displayItems = category.items.slice(0, 4);

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md hover:border-sky-300 transition-all">
      <div>
        <h3 className="text-sm font-black text-slate-900 tracking-tight">{category.name}</h3>
        <p className="text-xs text-sky-700 font-semibold mt-0.5 mb-3">{category.tagline}</p>

        <div className="grid grid-cols-2 gap-2.5 mb-3">
          {displayItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectItem(item)}
              className="group cursor-pointer bg-slate-50 border border-slate-200/70 rounded-xl p-2 flex flex-col items-center justify-between text-center hover:bg-sky-50/50 hover:border-sky-400 transition-all"
            >
              <div className="w-full aspect-square flex items-center justify-center overflow-hidden mb-1 bg-white rounded-lg p-1.5 shadow-2xs">
                <ProductImageWithFallback item={item} />
              </div>
              <span className="text-[11px] font-bold text-slate-800 line-clamp-1 w-full group-hover:text-sky-600">
                {item.name}
              </span>
              <span className="text-xs font-black text-slate-950 mt-0.5">${Number(item.price).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => onExploreCategory(category)}
        className="text-xs font-bold text-sky-700 hover:text-sky-800 text-left pt-2.5 border-t border-slate-100 flex items-center justify-between group cursor-pointer"
      >
        <span>See more in {category.name}</span>
        <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </button>
    </div>
  );
};