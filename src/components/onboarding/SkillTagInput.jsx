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
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          {label}
        </label>
      )}

      {/* Input Box & Active Tags Container */}
      <div
        className={`w-full min-h-[48px] p-2 bg-slate-900/80 backdrop-blur border ${
          error ? "border-rose-500/80 focus-within:ring-rose-500/30" : "border-slate-800 focus-within:border-indigo-500 focus-within:ring-indigo-500/20"
        } rounded-xl flex flex-wrap items-center gap-2 transition-all focus-within:ring-4`}
      >
        {tags.map((tag, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-950/80 border border-indigo-700/50 text-indigo-200 text-sm font-medium rounded-lg shadow-sm animate-in fade-in zoom-in-95 duration-200"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(idx)}
              className="text-indigo-400 hover:text-indigo-100 hover:bg-indigo-900/50 rounded p-0.5 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
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
          className="flex-1 min-w-[140px] bg-transparent border-none outline-none text-slate-100 text-sm placeholder-slate-500 px-1 py-1"
        />
      </div>

      {error && <p className="mt-1 text-xs text-rose-400 font-medium">{error}</p>}

      {/* Popular Suggestions */}
      {suggestions.length > 0 && (
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-slate-400 mr-1">Suggestions:</span>
          {suggestions
            .filter((s) => !tags.includes(s))
            .slice(0, 6)
            .map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => addTag(suggestion)}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600 text-slate-300 rounded-md transition-colors"
              >
                <Plus className="w-3 h-3 text-indigo-400" />
                {suggestion}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
