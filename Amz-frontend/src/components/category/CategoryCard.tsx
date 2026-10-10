import React from 'react';
import { Category } from '@/types';
import { Layers } from 'lucide-react';

interface CategoryCardProps {
  category: Category;
  itemCount?: number;
  isSelected?: boolean;
  onSelect?: (id: number) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  itemCount = 5,
  isSelected = false,
  onSelect,
}) => {
  return (
    <button
      onClick={() => onSelect && onSelect(category.id)}
      className={`group flex items-center gap-3.5 p-3.5 rounded-xl border text-left transition-all duration-200 ${
        isSelected
          ? 'bg-sky-50/70 border-sky-400 shadow-sm'
          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 shadow-sm'
      }`}
    >
      <div className={`p-2 rounded-lg ${isSelected ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-sky-50 group-hover:text-sky-600'} transition-colors`}>
        <Layers className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-slate-800 truncate group-hover:text-sky-600 transition-colors">
          {category.name}
        </h4>
        <p className="text-xs text-slate-400 font-normal">{itemCount} Products</p>
      </div>
    </button>
  );
};