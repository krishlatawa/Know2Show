"use client";

import React from "react";
import { Check } from "lucide-react";

export default function StepIndicator({ steps, currentStep, onStepClick }) {
  const totalSteps = steps.length;
  const progressPercent = totalSteps > 1 ? ((currentStep - 1) / (totalSteps - 1)) * 100 : 0;

  return (
    <div className="w-full max-w-xl mx-auto mb-8 sm:mb-10 px-2">
      {/* Editorial Step Tracker Container */}
      <div className="relative">
        {/* Background Connecting Track Line */}
        <div className="absolute left-5 right-5 sm:left-6 sm:right-6 top-4 sm:top-4.5 -translate-y-1/2 h-[1px] bg-[#E2DDD3] z-0" />

        {/* Active Progress Fill */}
        <div
          className="absolute left-5 sm:left-6 top-4 sm:top-4.5 -translate-y-1/2 h-[2px] bg-[#211A16] z-0 transition-all duration-300 ease-in-out"
          style={{
            width: `calc((${progressPercent}% * (100% - 2.5rem)) / 100)`,
          }}
        />

        {/* Steps Nodes Grid */}
        <div className="relative z-10 flex items-start justify-between">
          {steps.map((step, idx) => {
            const stepNumber = idx + 1;
            const isCompleted = currentStep > stepNumber;
            const isCurrent = currentStep === stepNumber;
            const isClickable = isCompleted && Boolean(onStepClick);

            return (
              <div
                key={step.id}
                className={`flex flex-col items-center select-none ${
                  isClickable ? "cursor-pointer group" : "cursor-default"
                }`}
                onClick={() => isClickable && onStepClick(stepNumber)}
              >
                {/* Step Node Circle */}
                <div
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-mono text-xs transition-all duration-200 ${
                    isCurrent
                      ? "bg-[#211A16] text-[#F7F5F0] ring-4 ring-[#F7F5F0] shadow-sm font-semibold scale-105"
                      : isCompleted
                      ? "bg-[#EFECE4] text-[#211A16] border border-[#D8D2C5] ring-4 ring-[#F7F5F0] group-hover:border-[#211A16] font-medium"
                      : "bg-[#FAF9F5] text-[#968E85] border border-[#E2DDD3] ring-4 ring-[#F7F5F0]"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  ) : (
                    `0${stepNumber}`
                  )}
                </div>

                {/* Step Labels */}
                <div className="mt-2 text-center">
                  <p
                    className={`text-[10.5px] sm:text-[11.5px] font-mono tracking-wider uppercase transition-colors ${
                      isCurrent
                        ? "text-[#211A16] font-semibold"
                        : isCompleted
                        ? "text-[#6B635B] font-medium group-hover:text-[#211A16]"
                        : "text-[#968E85]"
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-[10px] text-[#968E85] hidden sm:block mt-0.5 max-w-[130px] leading-tight">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

