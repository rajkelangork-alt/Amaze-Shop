import { useState, useMemo, type FC, type FormEvent } from 'react';
import { 
  ArrowLeft, 
  Star, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Store, 
  ShoppingCart, 
  Zap, 
  Heart, 
  Check, 
  ThumbsUp, 
  MessageSquare, 
  Sparkles, 
  ChevronRight, 
  AlertCircle 
} from 'lucide-react';
import { ShowcaseItem, ShowcaseItemEdition, ShowcaseCategory } from '@/constants/categories';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useCatalogStore, CatalogState } from '@/store/catalogStore';
import { useAuthStore } from '@/store/authStore';
import { ProductImageWithFallback, getVendorDisplayName } from '@/components/common/AdCard';

interface ProductDetailPageProps {
  item: ShowcaseItem;
  onBack: () => void;
  onSelectItem?: (item: ShowcaseItem) => void;
  onNavigateToCheckout?: () => void;
}

interface ReviewItem {
  id: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  helpfulCount: number;
  verified: boolean;
}

export const ProductDetailPage: FC<ProductDetailPageProps> = ({ 
  item, 
  onBack, 
  onSelectItem, 
  onNavigateToCheckout 
}) => {
  const user = useAuthStore((state) => state.user);
  const addItemToCart = useCartStore((state) => state.addItem);
  const categories = useCatalogStore((state: CatalogState) => state.categories);

  const { isInWishlist, toggleWishlist } = useWishlistStore();
  const isFavorited = isInWishlist(item.id);

  const itemPrice = Number(item.price) || 0;

  const editions: ShowcaseItemEdition[] = item.editions && item.editions.length > 0 
    ? item.editions.map((ed) => ({ ...ed, price: Number(ed.price) || itemPrice }))
    : [
        { name: 'Standard Edition', bundleDescription: 'Original manufacturer packaging with all included accessories', price: itemPrice },
        { name: 'Pro Bundle Edition', bundleDescription: 'Includes extended 2-year warranty & high-speed accessory pack', price: Number((itemPrice * 1.25).toFixed(2)) }
      ];

  const [selectedEdition, setSelectedEdition] = useState<ShowcaseItemEdition>(editions[0]);
  const [quantity, setQuantity] = useState(1);
  const [addedAlert, setAddedAlert] = useState(false);

  // Dynamic price calculation
  const unitPrice = Number(selectedEdition.price) || itemPrice;
  const calculatedTotalPrice = Number((unitPrice * quantity).toFixed(2));

  // Review states: 0 stars by default (customer choice)
  const [userSelectedStars, setUserSelectedStars] = useState<number>(0);
  const [hoveredStars, setHoveredStars] = useState<number | null>(null);
  const [ratingError, setRatingError] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const [reviews, setReviews] = useState<ReviewItem[]>([
    {
      id: 'rev-1',
      author: 'David K.',
      rating: 5,
      date: 'Sep 21, 2026',
      title: 'Exceeded all expectations!',
      comment: 'Top notch build quality and arrived within 24 hours via Prime. Seamless performance and exactly as described.',
      helpfulCount: 14,
      verified: true,
    },
    {
      id: 'rev-2',
      author: 'Sarah M.',
      rating: 5,
      date: 'Sep 18, 2026',
      title: 'Great value for money',
      comment: 'Compared to other options on the marketplace, this is by far the best priced for the quality. Very happy with the purchase.',
      helpfulCount: 8,
      verified: true,
    },
    {
      id: 'rev-3',
      author: 'Michael S.',
      rating: 4,
      date: 'Sep 12, 2026',
      title: 'Solid product, reliable merchant',
      comment: 'Packaging was sturdy and delivery was on time. Works great right out of the box. Highly recommended.',
      helpfulCount: 3,
      verified: true,
    },
  ]);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return '5.0';
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  const recommendedItems = useMemo(() => {
    const currentCat = categories.find((c: ShowcaseCategory) => c.id === item.categoryId);
    if (!currentCat) return [];
    return currentCat.items.filter((it: ShowcaseItem) => it.id !== item.id).slice(0, 4);
  }, [categories, item]);

  const vendorDisplayName = getVendorDisplayName(item.vendorEmail);

  const handleAddToCart = () => {
    addItemToCart(item, selectedEdition, quantity, item.vendorEmail || 'vendor.apex@amzshop.com');
    setAddedAlert(true);
    setTimeout(() => setAddedAlert(false), 2500);
  };

  const handleBuyNow = () => {
    addItemToCart(item, selectedEdition, quantity, item.vendorEmail || 'vendor.apex@amzshop.com');
    if (onNavigateToCheckout) {
      onNavigateToCheckout();
    }
  };

  const handleToggleWishlist = () => {
    toggleWishlist(item);
  };

  const handleReviewSubmit = (e: FormEvent) => {
    e.preventDefault();
    setRatingError('');

    if (userSelectedStars === 0) {
      setRatingError('Please select a star rating (1 to 5 stars) before submitting.');
      return;
    }
    if (!newComment.trim()) return;

    const createdReview: ReviewItem = {
      id: `rev-${Date.now()}`,
      author: user?.first_name ? `${user.first_name} ${user.last_name?.[0] || ''}.` : 'Verified Buyer',
      rating: userSelectedStars,
      date: 'Just now',
      title: newTitle.trim() || 'Verified Customer Review',
      comment: newComment.trim(),
      helpfulCount: 0,
      verified: true,
    };

    setReviews([createdReview, ...reviews]);
    setNewTitle('');
    setNewComment('');
    setUserSelectedStars(0);
    setReviewSubmitted(true);
    setTimeout(() => setReviewSubmitted(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-700 hover:text-sky-900 bg-white border border-sky-200 px-3.5 py-2 rounded-xl shadow-xs transition-all hover:-translate-x-0.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Storefront
        </button>

        <span className="text-xs text-slate-500 font-medium">
          SKU: <strong className="text-slate-800 font-mono">{item.id}</strong>
        </span>
      </div>

      {/* Main Showcase Layout */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        {/* Column 1: Image Showcase */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center bg-slate-50/70 border border-slate-200/70 rounded-2xl p-6 relative">
          <button
            type="button"
            onClick={handleToggleWishlist}
            className={`absolute top-4 right-4 p-2.5 rounded-xl border transition-all cursor-pointer z-10 ${
              isFavorited
                ? 'bg-rose-50 border-rose-200 text-rose-600 shadow-xs'
                : 'bg-white border-slate-200 text-slate-400 hover:text-rose-500'
            }`}
            title={isFavorited ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            <Heart className={`w-5 h-5 ${isFavorited ? 'fill-rose-600 text-rose-600' : ''}`} />
          </button>

          <div className="w-full max-w-sm aspect-square flex items-center justify-center p-4">
            {item.imageFileName?.startsWith('data:') ? (
              <img
                src={item.imageFileName}
                alt={item.name}
                className="max-h-full max-w-full object-contain rounded-xl"
              />
            ) : (
              <ProductImageWithFallback item={item} className="max-h-80" />
            )}
          </div>

          <div className="w-full mt-4 pt-4 border-t border-slate-200/60 flex items-center justify-around text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-600" /> Authenticity Guaranteed</span>
            <span className="flex items-center gap-1.5"><RotateCcw className="w-4 h-4 text-sky-600" /> 30-Day Returns</span>
          </div>
        </div>

        {/* Column 2: Details & Pricing */}
        <div className="lg:col-span-4 space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                Verified Listing
              </span>
              <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{averageRating}</span>
                <span className="text-slate-400 font-normal">({reviews.length} customer reviews)</span>
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight leading-snug">
              {item.name}
            </h1>

            {/* Merchant Fulfillment Badge */}
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-700 bg-slate-50 border border-slate-200/80 px-3.5 py-2 rounded-xl">
              <Store className="w-4 h-4 text-sky-600 flex-shrink-0" />
              <span>Fulfilled & Shipped by:</span>
              <strong className="text-slate-900 font-black">{vendorDisplayName}</strong>
            </div>
          </div>

          {/* Dynamic Price Display */}
          <div className="border-t border-b border-slate-100 py-4 space-y-1">
            <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
              Total Price {quantity > 1 ? `(${quantity} units)` : ''}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-950">${calculatedTotalPrice.toFixed(2)}</span>
              {quantity > 1 && (
                <span className="text-xs font-bold text-slate-500">
                  (${unitPrice.toFixed(2)} each)
                </span>
              )}
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Save 15%
              </span>
            </div>
          </div>

          {/* Editions Selector */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-800 block">Select Edition / Configuration:</span>
            <div className="space-y-2">
              {editions.map((ed, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedEdition(ed)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start justify-between ${
                    selectedEdition.name === ed.name
                      ? 'border-sky-500 bg-sky-50/50 shadow-xs ring-1 ring-sky-400'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{ed.name}</span>
                      {selectedEdition.name === ed.name && (
                        <span className="bg-sky-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">Selected</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{ed.bundleDescription}</p>
                  </div>
                  <span className="text-xs font-black text-slate-900">${Number(ed.price).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Column 3: Order Action Box */}
        <div className="lg:col-span-3 bg-slate-50/90 border border-slate-200/90 rounded-2xl p-5 space-y-4 flex flex-col justify-between h-fit shadow-xs">
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Availability:</span>
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> In Stock (Ready to Ship)
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Delivery:</span>
              <span className="text-slate-800 font-bold flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-sky-600" /> Free 2-Day Prime
              </span>
            </div>

            <div className="pt-2">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-slate-700">Quantity:</label>
                <span className="text-[11px] font-bold text-sky-700">${calculatedTotalPrice.toFixed(2)} subtotal</span>
              </div>
              <select
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10)))}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-black text-slate-900 focus:outline-none focus:border-sky-600 shadow-xs cursor-pointer"
              >
                {[1, 2, 3, 4, 5, 6, 8, 10].map((q) => (
                  <option key={q} value={q}>Qty: {q}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-200">
            {addedAlert && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5 animate-fadeIn">
                <Check className="w-4 h-4 text-emerald-600" /> Added to your cart!
              </div>
            )}

            <button
              onClick={handleAddToCart}
              className="w-full py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <ShoppingCart className="w-4 h-4" /> Add to Cart (${calculatedTotalPrice.toFixed(2)})
            </button>

            <button
              onClick={handleBuyNow}
              className="w-full py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Zap className="w-4 h-4 fill-slate-950 text-slate-950" /> Buy Now (${calculatedTotalPrice.toFixed(2)})
            </button>
          </div>
        </div>
      </div>

      {/* Technical Specifications Section */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3">
          Technical Specifications & Merchant Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl">
            <span className="text-slate-400 block font-semibold">Direct Fulfillment Vendor</span>
            <span className="text-slate-900 font-bold mt-0.5 block">{vendorDisplayName}</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl">
            <span className="text-slate-400 block font-semibold">Warranty Policy</span>
            <span className="text-slate-900 font-bold mt-0.5 block">1-Year Manufacturer Direct Warranty</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl">
            <span className="text-slate-400 block font-semibold">Packaging & Inspection</span>
            <span className="text-slate-900 font-bold mt-0.5 block">Sealed Original Unit (Passes QA)</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl">
            <span className="text-slate-400 block font-semibold">Standard Shipping Transit</span>
            <span className="text-slate-900 font-bold mt-0.5 block">1 - 2 Business Days via Amaze Express</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl">
            <span className="text-slate-400 block font-semibold">Customer Support Line</span>
            <span className="text-slate-900 font-bold mt-0.5 block">24/7 Dedicated Dispatch Desk</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl">
            <span className="text-slate-400 block font-semibold">Returns & Exchanges</span>
            <span className="text-slate-900 font-bold mt-0.5 block">Prepaid Return Label Provided</span>
          </div>
        </div>
      </div>

      {/* Recommended Products Grid */}
      {recommendedItems.length > 0 && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h3 className="text-base font-black text-slate-900">Recommended Products in this Category</h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">Handpicked related listings</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {recommendedItems.map((rec) => (
              <div
                key={rec.id}
                onClick={() => onSelectItem?.(rec)}
                className="group cursor-pointer bg-slate-50 border border-slate-200/70 rounded-2xl p-3.5 flex flex-col justify-between hover:bg-sky-50/50 hover:border-sky-300 transition-all"
              >
                <div className="w-full aspect-square flex items-center justify-center overflow-hidden mb-2.5 bg-white rounded-xl p-2 shadow-2xs">
                  {rec.imageFileName?.startsWith('data:') ? (
                    <img src={rec.imageFileName} alt={rec.name} className="max-h-full max-w-full object-contain" />
                  ) : (
                    <ProductImageWithFallback item={rec} />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 line-clamp-2 group-hover:text-sky-600 transition-colors">
                    {rec.name}
                  </h4>
                  <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                    <span className="text-xs font-black text-slate-950">${Number(rec.price).toFixed(2)}</span>
                    <span className="text-[11px] font-bold text-sky-600 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                      View <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Customer Reviews & Feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900">Verified Customer Reviews</h3>
              <p className="text-xs text-slate-400">Authentic feedback from verified Amaze shoppers</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-amber-500 font-black text-sm">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{averageRating} out of 5</span>
              </div>
              <span className="text-[11px] text-slate-400">{reviews.length} customer ratings</span>
            </div>
          </div>

          <div className="space-y-4">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-sky-100 text-sky-700 font-extrabold flex items-center justify-center text-xs">
                      {rev.author[0]}
                    </div>
                    <span className="text-xs font-bold text-slate-900">{rev.author}</span>
                    {rev.verified && (
                      <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-600" /> Verified Purchase
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400">{rev.date}</span>
                </div>

                <div className="flex items-center gap-1">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-xs font-bold text-slate-800 ml-1">{rev.title}</span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>

                <div className="pt-2 flex items-center gap-2 text-[11px] text-slate-400">
                  <button className="flex items-center gap-1 hover:text-slate-700 transition-colors cursor-pointer">
                    <ThumbsUp className="w-3.5 h-3.5" /> Helpful ({rev.helpfulCount})
                  </button>
                  <span>•</span>
                  <span className="hover:text-slate-600 cursor-pointer">Report</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Choice Interactive Review Form */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4 h-fit">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-sky-600" /> Write a Review
            </h3>
            <p className="text-xs text-slate-400">Choose your star rating and share your product experience</p>
          </div>

          {reviewSubmitted && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-1.5 animate-fadeIn">
              <Check className="w-4 h-4 text-emerald-600" /> Thank you! Your review has been published.
            </div>
          )}

          {ratingError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-rose-600" /> {ratingError}
            </div>
          )}

          <form onSubmit={handleReviewSubmit} className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Your Rating:{' '}
                {userSelectedStars > 0 || hoveredStars !== null ? (
                  <span className="text-amber-500 font-black">
                    {hoveredStars !== null ? hoveredStars : userSelectedStars} Stars
                  </span>
                ) : (
                  <span className="text-slate-400 font-normal italic">
                    Select a rating (1 to 5 stars)
                  </span>
                )}
              </label>
              
              <div 
                className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl p-2.5 w-fit"
                onMouseLeave={() => setHoveredStars(null)}
              >
                {[1, 2, 3, 4, 5].map((star) => {
                  const currentEffective = hoveredStars !== null ? hoveredStars : userSelectedStars;
                  const isFilled = star <= currentEffective && currentEffective > 0;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoveredStars(star)}
                      onClick={() => {
                        setUserSelectedStars(star);
                        setHoveredStars(null);
                        setRatingError('');
                      }}
                      className="p-1 cursor-pointer hover:scale-125 transition-transform"
                      title={`${star} Star${star > 1 ? 's' : ''}`}
                    >
                      <Star 
                        className={`w-6 h-6 transition-colors ${
                          isFilled 
                            ? 'fill-amber-400 text-amber-400' 
                            : 'text-slate-300 stroke-slate-300'
                        }`} 
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Review Headline</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Premium build quality, super fast delivery!"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-sky-500 focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Detailed Feedback *</label>
              <textarea
                rows={4}
                required
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="What did you like or dislike? How was the performance and durability?"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:border-sky-500 focus:bg-white transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Submit Verified Review
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};