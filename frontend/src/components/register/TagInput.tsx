import React, { useState, KeyboardEvent } from "react";
import { X, Hash } from "lucide-react";

interface TagInputProps {
  label: string;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
}

const TagInput: React.FC<TagInputProps> = ({
  label,
  tags,
  onTagsChange,
  placeholder = "Type and press Enter",
  error,
  required = false,
}) => {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      const newTag = inputValue.trim().replace(/^#/, ""); // Remove # if user types it
      if (!tags.includes(newTag)) {
        onTagsChange([...tags, newTag]);
      }
      setInputValue("");
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      onTagsChange(tags.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-white/90">
        {label}
        {required && <span className="text-purple-400 ml-1">*</span>}
      </label>

      <div
        className={`
          min-h-[48px] px-4 py-3 rounded-xl backdrop-blur-md bg-white/5 border transition-all duration-300
          focus-within:ring-2 focus-within:ring-purple-500/50 focus-within:bg-white/10
          ${
            error
              ? "border-red-400/60 focus-within:border-red-400/80"
              : "border-white/20 hover:border-white/30 focus-within:border-purple-400/60"
          }
        `}
      >
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-purple-500/20 border border-purple-400/40 rounded-lg text-sm text-purple-300"
            >
              <Hash size={12} />
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 hover:text-purple-200 transition-colors"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>

        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full bg-transparent text-white placeholder-white/40 focus:outline-none"
        />
      </div>

      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}

      <p className="text-white/50 text-xs">
        Press Enter to add hashtags. Don't include the # symbol.
      </p>
    </div>
  );
};

export default TagInput;
