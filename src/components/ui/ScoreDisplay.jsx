"use client";

import React from "react";

export function ScoreDisplay({
  score,
  label = "READINESS INDEX",
  unit = "/100",
  subUnit = "COMPOSITE",
  className = "",
}) {
  return (
    <div className={`flex flex-col select-none ${className}`}>
      {label && (
        <span className="text-[10px] font-mono font-semibold uppercase tracking-widest text-[#968E85] mb-2">
          {label}
        </span>
      )}
      <div className="flex items-baseline gap-2">
        <span className="text-5xl sm:text-[58px] font-light tracking-tight text-[#211A16] font-mono leading-none">
          {score ?? "--"}
        </span>
        <div className="flex flex-col justify-end text-[10px] font-mono tracking-wider text-[#968E85] uppercase leading-tight pb-0.5">
          {unit && <span>{unit}</span>}
          {subUnit && <span>{subUnit}</span>}
        </div>
      </div>
    </div>
  );
}

export default ScoreDisplay;
