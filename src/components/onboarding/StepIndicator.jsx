"use client";

import React from "react";
import { Check } from "lucide-react";

export default function StepIndicator({ steps, currentStep, onStepClick }) {
  return (
    <div className="w-full max-w-3xl mx-auto mb-8 px-4">
      <div className="relative flex items-center justify-between">
        {/* Background Connecting Line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-800 rounded z-0" />
        
        {/* Animated Active Progress Line */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 rounded z-0 transition-all duration-500 ease-in-out"
          style={{
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
          }}
        />

        {steps.map((step, idx) => {
          const stepNumber = idx + 1;
          const isCompleted = currentStep > stepNumber;
          const isCurrent = currentStep === stepNumber;

          return (
            <div
              key={step.id}
              className="relative z-10 flex flex-col items-center cursor-pointer group"
              onClick={() => isCompleted && onStepClick && onStepClick(stepNumber)}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${
                  isCompleted
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 ring-4 ring-slate-900"
                    : isCurrent
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/30 ring-4 ring-slate-900 scale-110"
                    : "bg-slate-800 text-slate-400 border border-slate-700 ring-4 ring-slate-900 group-hover:border-slate-500"
                }`}
              >
                {isCompleted ? <Check className="w-5 h-5 stroke-[3]" /> : stepNumber}
              </div>
              <div className="mt-2 text-center">
                <p
                  className={`text-xs font-semibold tracking-wide uppercase transition-colors ${
                    isCurrent
                      ? "text-indigo-400"
                      : isCompleted
                      ? "text-emerald-400"
                      : "text-slate-500"
                  }`}
                >
                  {step.title}
                </p>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
