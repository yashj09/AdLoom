import React from "react";

interface CategorySelectorProps {
  label: string;
  categories: string[];
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
  error?: string;
  required?: boolean;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  label,
  categories,
  selectedCategories,
  onCategoriesChange,
  error,
  required = false,
}) => {
  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      onCategoriesChange(selectedCategories.filter((c) => c !== category));
    } else {
      onCategoriesChange([...selectedCategories, category]);
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-white/90">
        {label}
        {required && <span className="text-purple-400 ml-1">*</span>}
      </label>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => toggleCategory(category)}
            className={`
              px-3 py-2 rounded-lg text-sm transition-all duration-200
              backdrop-blur-md border text-left
              ${
                selectedCategories.includes(category)
                  ? "bg-purple-500/20 border-purple-400/60 text-purple-300"
                  : "bg-white/5 border-white/20 text-white/70 hover:border-white/40 hover:bg-white/10"
              }
            `}
          >
            {category}
          </button>
        ))}
      </div>

      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}

      {selectedCategories.length > 0 && (
        <p className="text-white/60 text-sm">
          {selectedCategories.length} categor
          {selectedCategories.length === 1 ? "y" : "ies"} selected
        </p>
      )}
    </div>
  );
};

export default CategorySelector;
