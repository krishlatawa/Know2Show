"use client";

import React from "react";
import { Sparkles } from "lucide-react";

export function AiInsightBlock({
  title = "AI INSIGHT",
  context,
  children,
  action,
  className = "",
  showIcon = false,
}) {
  return (
    <div
      className={`bg-[#EFECE4] border border-[#E2DDD3] rounded-lg p-4.5 sm:px-5.5 sm:py-4 transition-all ${className}`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          {showIcon && (
            <Sparkles className="w-3.5 h-3.5 text-[#6B635B]" />
          )}
          <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-[#6B635B]">
            {title}
          </span>
          {context && (
            <span className="text-[10px] font-mono text-[#968E85]">
              — {context}
            </span>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="text-[14px] sm:text-[14.5px] leading-[1.65] text-[#211A16] italic font-normal">
        {children}
      </div>
    </div>
  );
}

export default AiInsightBlock;
