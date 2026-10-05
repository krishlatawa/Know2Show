"use client";

import React from "react";
import { ProgressBar } from "./ProgressBar";

export function CompetencyRow({
  index,
  name,
  description,
  score,
  maxScore = 100,
  trend,
  trendDirection = "up", // 'up' | 'down' | 'neutral'
  className = "",
  onClick,
}) {
  const formattedIndex =
    typeof index === "number" ? String(index).padStart(2, "0") : index;

  return (
    <div
      onClick={onClick}
      className={`py-4 sm:py-4.5 border-b border-[#E2DDD3]/60 last:border-b-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 ${
        onClick ? "cursor-pointer hover:bg-[#FAF9F5]/60 px-2 -mx-2 rounded transition-colors" : ""
      } ${className}`}
    >
      <div className="flex items-start gap-3.5 sm:gap-4 flex-1">
        {formattedIndex && (
          <span className="font-mono text-xs text-[#968E85] shrink-0 mt-0.5 select-none">
            {formattedIndex}
          </span>
        )}
        <div className="space-y-1.5 flex-1 max-w-xl">
          <div className="flex flex-col">
            <h4 className="text-sm sm:text-[15px] font-semibold text-[#211A16] tracking-tight">
              {name}
            </h4>
            {description && (
              <p className="text-[13px] sm:text-[13.5px] text-[#6B635B] mt-0.5 leading-relaxed">
                {description}
              </p>
            )}
          </div>
          {score !== undefined && (
            <div className="w-full max-w-[340px] pt-1">
              <ProgressBar value={score} max={maxScore} showValue={false} />
            </div>
          )}
        </div>
      </div>

      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center shrink-0 pl-7 sm:pl-0">
        {score !== undefined && (
          <span className="font-mono text-base sm:text-lg font-medium text-[#211A16]">
            {score}
          </span>
        )}
        {trend && (
          <span className="font-mono text-[9.5px] uppercase tracking-wider text-[#6B635B] flex items-center gap-0.5 mt-0.5">
            {trendDirection === "up" && "↑ "}
            {trendDirection === "down" && "↓ "}
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}

export default CompetencyRow;
