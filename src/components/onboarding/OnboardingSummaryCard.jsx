"use client";

import React from "react";
import { User, Target, Award, Briefcase, Zap, Edit3, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";

export default function OnboardingSummaryCard({
  profileData,
  targetRoleData,
  onGoToStep,
  onBack,
  onSubmit,
  isSubmitting,
  submitError,
}) {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            Review Your Profile & Interview Goals
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Please double-check your information before completing your onboarding setup. You can update these anytime later from your settings.
          </p>
        </div>

        {submitError && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-sm font-medium">
            {submitError}
          </div>
        )}

        {/* Candidate Profile Summary */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-5 relative group">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
              <User className="w-4 h-4" />
              <span>Candidate Profile</span>
            </div>
            <button
              type="button"
              onClick={() => onGoToStep(1)}
              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-300 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-slate-400">Headline</p>
              <p className="font-medium text-slate-200">{profileData.headline || "N/A"}</p>
            </div>

            <div>
              <p className="text-xs text-slate-400">Seniority & Experience</p>
              <p className="font-medium text-slate-200">
                {profileData.seniorityLevel} ({profileData.experienceYears} Years)
              </p>
            </div>

            <div className="sm:col-span-2">
              <p className="text-xs text-slate-400 mb-1.5">Primary Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {(profileData.skills || []).map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 bg-indigo-950/60 border border-indigo-800/40 text-indigo-300 text-xs font-medium rounded-md"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {profileData.bio && (
              <div className="sm:col-span-2">
                <p className="text-xs text-slate-400">Bio</p>
                <p className="text-xs text-slate-300 mt-0.5 line-clamp-2">{profileData.bio}</p>
              </div>
            )}
          </div>
        </div>

        {/* Target Role Summary */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-5 relative group">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-purple-400 font-semibold text-sm">
              <Target className="w-4 h-4" />
              <span>Target Role & Strategy</span>
            </div>
            <button
              type="button"
              onClick={() => onGoToStep(2)}
              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-purple-300 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-slate-400">Target Role Title</p>
              <p className="font-medium text-slate-200">{targetRoleData.roleTitle || "N/A"}</p>
            </div>

            <div>
              <p className="text-xs text-slate-400">Company Type & Difficulty</p>
              <p className="font-medium text-slate-200">
                {targetRoleData.companyType} •{" "}
                <span className="text-amber-400">{targetRoleData.difficulty}</span>
              </p>
            </div>

            <div className="sm:col-span-2">
              <p className="text-xs text-slate-400 mb-1.5">Interview Focus Topics</p>
              <div className="flex flex-wrap gap-1.5">
                {(targetRoleData.focusTopics || []).map((topic, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 bg-purple-950/60 border border-purple-800/40 text-purple-300 text-xs font-medium rounded-md"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            {targetRoleData.jobDescription && (
              <div className="sm:col-span-2">
                <p className="text-xs text-slate-400">Custom Job Description</p>
                <p className="text-xs text-slate-300 mt-0.5 line-clamp-3 bg-slate-900/50 p-2.5 rounded-lg border border-slate-800 font-mono">
                  {targetRoleData.jobDescription}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl transition-all disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl shadow-lg shadow-emerald-600/25 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving Profile...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              Complete Onboarding
            </>
          )}
        </button>
      </div>
    </div>
  );
}
