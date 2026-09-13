"use client";

import React, { useState } from "react";
import { COMPANY_TYPES, DIFFICULTY_LEVELS } from "@/lib/validations/onboarding";
import SkillTagInput from "./SkillTagInput";
import JdUploadDropzone from "@/components/jd/JdUploadDropzone";
import JdAnalysisViewer from "@/components/jd/JdAnalysisViewer";
import { Target, Building2, FileText, Zap, ArrowLeft, Sparkles } from "lucide-react";

const SUGGESTED_TOPICS = [
  "System Design", "Data Structures & Algorithms", "React & Frontend Architecture",
  "API Design & REST/gRPC", "Database Schema Optimization", "Microservices & Cloud Infrastructure",
  "Behavioral & Leadership", "Concurrency & Threading"
];

export default function TargetRoleForm({ data, onChange, errors = {}, onBack, onNext }) {
  const [extractedJd, setExtractedJd] = useState(null);
  const [skillGapData, setSkillGapData] = useState(null);
  const [jdSourceName, setJdSourceName] = useState("");
  const [isApplied, setIsApplied] = useState(false);

  const updateField = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  const handleJdAnalysisComplete = (parsedJd, skillGap, sourceName) => {
    setExtractedJd(parsedJd);
    setSkillGapData(skillGap);
    setJdSourceName(sourceName);
    applyJdToForm(parsedJd, skillGap);
  };

  const applyJdToForm = (parsedJd, skillGap) => {
    const recommendedTopics = skillGap?.recommendedFocusAreas || parsedJd.keyFocusAreas || [];
    const mergedTopics = Array.from(
      new Set([...(data.focusTopics || []), ...recommendedTopics])
    ).slice(0, 10);

    onChange({
      ...data,
      roleTitle: parsedJd.roleTitle || data.roleTitle || "",
      focusTopics: mergedTopics.length > 0 ? mergedTopics : data.focusTopics,
      jobDescription: parsedJd.responsibilities?.join("\n") || data.jobDescription || "",
    });
    setIsApplied(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-400" />
            Target Role & Goal Configuration
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Specify your target job role or upload a Job Description (PDF, Screenshot, or Text) for AI Skill Gap analysis.
          </p>
        </div>

        {/* AI Multimodal Job Description Dropzone */}
        <div className="space-y-4">
          <JdUploadDropzone
            onAnalysisComplete={handleJdAnalysisComplete}
          />

          {extractedJd && (
            <JdAnalysisViewer
              data={extractedJd}
              skillGap={skillGapData}
              sourceName={jdSourceName}
              onApplyFocusTopics={() => applyJdToForm(extractedJd, skillGapData)}
              isApplied={isApplied}
            />
          )}
        </div>

        {/* Role Title */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
            Target Job Title <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            value={data.roleTitle || ""}
            onChange={(e) => updateField("roleTitle", e.target.value)}
            placeholder="e.g. Senior Frontend Engineer, Staff Backend Developer"
            className={`w-full px-4 py-3 bg-slate-950/80 border ${
              errors.roleTitle ? "border-rose-500/80" : "border-slate-800 focus:border-indigo-500"
            } rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all`}
          />
          {errors.roleTitle && (
            <p className="mt-1 text-xs text-rose-400 font-medium">{errors.roleTitle}</p>
          )}
        </div>

        {/* Target Company Type */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-slate-400" />
            Target Company Type <span className="text-rose-400">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {COMPANY_TYPES.map((type) => {
              const isSelected = data.companyType === type.value;
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => updateField("companyType", type.value)}
                  className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                    isSelected
                      ? "bg-indigo-600/20 border-indigo-500 text-indigo-200 shadow-md shadow-indigo-500/10"
                      : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  {type.label}
                </button>
              );
            })}
          </div>
          {errors.companyType && (
            <p className="mt-1 text-xs text-rose-400 font-medium">{errors.companyType}</p>
          )}
        </div>

        {/* Difficulty Level */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-400" />
            Target Interview Difficulty <span className="text-rose-400">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {DIFFICULTY_LEVELS.map((diff) => {
              const isSelected = data.difficulty === diff.value;
              return (
                <button
                  key={diff.value}
                  type="button"
                  onClick={() => updateField("difficulty", diff.value)}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "bg-indigo-600/20 border-indigo-500 ring-2 ring-indigo-500/30 text-white"
                      : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  <p className="text-xs font-bold text-indigo-300">{diff.value.replace("_", " ")}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{diff.label.split(" - ")[1]}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Focus Topics */}
        <SkillTagInput
          label="Key Focus Topics / Interview Areas *"
          tags={data.focusTopics || []}
          onChange={(newTopics) => updateField("focusTopics", newTopics)}
          suggestions={SUGGESTED_TOPICS}
          placeholder="Type focus area and press Enter (e.g. System Design, React Performance)..."
          error={errors.focusTopics}
        />

        {/* Job Description Text area */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-slate-400" />
            Target Job Description Details
          </label>
          <textarea
            rows="4"
            value={data.jobDescription || ""}
            onChange={(e) => updateField("jobDescription", e.target.value)}
            placeholder="Paste the job description or requirement highlights..."
            className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all resize-none"
          />
        </div>
      </div>

      {/* Form Action */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <button
          type="submit"
          className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          Review Summary →
        </button>
      </div>
    </form>
  );
}
