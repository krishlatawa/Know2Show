"use client";

import React, { useState } from "react";
import { X, Plus } from "lucide-react";

export default function SkillTagInput({
  tags = [],
  onChange,
  placeholder = "Type and press Enter...",
  suggestions = [],
  label,
  error,
}) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    }
  };

  const addTag = (text) => {
    const trimmed = text.trim().replace(/,/g, "");
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
      setInputValue("");
    }
  };

  const removeTag = (indexToRemove) => {
    onChange(tags.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-[11px] font-mono font-medium uppercase tracking-wider text-[#6B635B]">
            {label}
          </label>
          <span className="text-[10.5px] font-mono text-[#968E85]">
            {tags.length} added
          </span>
        </div>
      )}

      {/* Input Box & Active Tags Container */}
      <div
        className={`w-full min-h-[46px] p-2 bg-white border ${
          error
            ? "border-[#9B2C2C] focus-within:border-[#9B2C2C] focus-within:ring-1 focus-within:ring-[#9B2C2C]/20"
            : "border-[#D8D2C5] focus-within:border-[#211A16] focus-within:ring-1 focus-within:ring-[#211A16]/20"
        } rounded-lg flex flex-wrap items-center gap-1.5 transition-all`}
      >
        {tags.map((tag, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#EFECE4] border border-[#D0C9BC] text-[#211A16] text-xs font-mono font-medium rounded-md animate-in fade-in zoom-in-95 duration-150"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(idx)}
              className="text-[#968E85] hover:text-[#211A16] hover:bg-[#E2DDD3]/60 rounded p-0.5 transition-colors"
              aria-label={`Remove ${tag}`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => inputValue && addTag(inputValue)}
          placeholder={tags.length === 0 ? placeholder : "Add another..."}
          className="flex-1 min-w-[140px] bg-transparent border-none outline-none text-[#211A16] text-sm placeholder-[#968E85] px-1.5 py-1"
        />
      </div>

      {error && <p className="text-[11px] font-mono text-[#9B2C2C]">{error}</p>}

      {/* Popular Suggestions */}
      {suggestions.length > 0 && (
        <div className="pt-1 flex flex-wrap items-center gap-1.5">
          <span className="text-[10.5px] font-mono text-[#968E85] uppercase tracking-wider mr-1">
            Suggestions:
          </span>
          {suggestions
            .filter((s) => !tags.includes(s))
            .slice(0, 6)
            .map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => addTag(suggestion)}
                className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 bg-[#FAF9F5] hover:bg-[#EFECE4] border border-[#E2DDD3] hover:border-[#D8D2C5] text-[#6B635B] hover:text-[#211A16] rounded transition-colors"
              >
                <Plus className="w-2.5 h-2.5 text-[#968E85]" />
                {suggestion}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

