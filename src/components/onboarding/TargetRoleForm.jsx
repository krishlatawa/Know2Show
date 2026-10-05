"use client";

import React, { useState } from "react";
import { COMPANY_TYPES, DIFFICULTY_LEVELS } from "@/lib/validations/onboarding";
import SkillTagInput from "./SkillTagInput";
import JdUploadDropzone from "@/components/jd/JdUploadDropzone";
import JdAnalysisViewer from "@/components/jd/JdAnalysisViewer";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  Target,
  Building2,
  FileText,
  Zap,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Briefcase,
} from "lucide-react";

const SUGGESTED_TOPICS = [
  "System Design",
  "Data Structures & Algorithms",
  "React & Frontend Architecture",
  "API Design & REST/gRPC",
  "Database Schema Optimization",
  "Microservices & Cloud Infrastructure",
  "Behavioral & Leadership",
  "Concurrency & Threading",
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
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 1. AI Multimodal Job Description Dropzone & Analysis Viewer (Level 2 Surface) */}
      <div className="space-y-3.5">
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

      {/* 2. Target Role Working Surface (Level 1 Primary Content) */}
      <div className="bg-[#FFFFFF] border border-[#D8D2C5] rounded-lg p-5 sm:p-7 space-y-6">
        {/* Main Section Header */}
        <div className="border-b border-[#D8D2C5] pb-4">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-[#6B635B]" />
            <h2 className="text-sm sm:text-base font-semibold text-[#211A16] tracking-tight">
              Target Role & Interview Strategy
            </h2>
          </div>
          <p className="text-xs sm:text-[13px] text-[#6B635B] mt-0.5 leading-relaxed">
            Define the target role, company tier, and interview rigor you are calibrating for.
          </p>
        </div>

        {/* Group 1: Role Specification */}
        <div className="space-y-4">
          <div className="flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-[#968E85]" />
            <h3 className="text-[10.5px] font-mono font-semibold uppercase tracking-[0.14em] text-[#968E85]">
              Role Specification
            </h3>
          </div>

          {/* Role Title */}
          <div>
            <Input
              label="Target Job Title *"
              value={data.roleTitle || ""}
              onChange={(e) => updateField("roleTitle", e.target.value)}
              placeholder="e.g. Senior Frontend Engineer, Staff Backend Developer"
              error={errors.roleTitle}
              leftIcon={Target}
            />
          </div>

          {/* Target Company Type */}
          <div className="space-y-2">
            <label className="block text-[11px] font-mono font-medium uppercase tracking-wider text-[#6B635B] flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#968E85]" />
              Target Company Type *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
              {COMPANY_TYPES.map((type) => {
                const isSelected = data.companyType === type.value;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => updateField("companyType", type.value)}
                    className={`p-2.5 rounded-lg border text-xs font-mono transition-all text-center ${
                      isSelected
                        ? "bg-[#211A16] text-[#F7F5F0] border-[#211A16] font-semibold shadow-xs"
                        : "bg-white border-[#D8D2C5] text-[#6B635B] hover:border-[#211A16]/50 hover:text-[#211A16]"
                    }`}
                  >
                    {type.label}
                  </button>
                );
              })}
            </div>
            {errors.companyType && (
              <p className="text-[11px] font-mono text-[#9B2C2C]">{errors.companyType}</p>
            )}
          </div>
        </div>

        {/* Group Divider */}
        <div className="border-t border-[#E2DDD3]" />

        {/* Group 2: Interview Rigor & Calibration */}
        <div className="space-y-3.5">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#968E85]" />
            <h3 className="text-[10.5px] font-mono font-semibold uppercase tracking-[0.14em] text-[#968E85]">
              Interview Rigor & Calibration
            </h3>
          </div>

          <div className="space-y-2">
            <label className="block text-[11px] font-mono font-medium uppercase tracking-wider text-[#6B635B] flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#968E85]" />
              Target Interview Difficulty *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {DIFFICULTY_LEVELS.map((diff) => {
                const isSelected = data.difficulty === diff.value;
                return (
                  <button
                    key={diff.value}
                    type="button"
                    onClick={() => updateField("difficulty", diff.value)}
                    className={`p-3.5 rounded-lg border text-left transition-all ${
                      isSelected
                        ? "bg-[#211A16] border-[#211A16] text-[#F7F5F0] shadow-xs"
                        : "bg-white border-[#D8D2C5] text-[#6B635B] hover:border-[#211A16]/40 hover:text-[#211A16]"
                    }`}
                  >
                    <p
                      className={`text-xs font-mono font-semibold ${
                        isSelected ? "text-[#F7F5F0]" : "text-[#211A16]"
                      }`}
                    >
                      {diff.value.replace("_", " ")}
                    </p>
                    <p
                      className={`text-[11px] mt-0.5 leading-snug ${
                        isSelected ? "text-[#D8D2C5]" : "text-[#6B635B]"
                      }`}
                    >
                      {diff.label.split(" - ")[1]}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Group Divider */}
        <div className="border-t border-[#E2DDD3]" />

        {/* Group 3: Focus Topics */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#968E85]" />
            <h3 className="text-[10.5px] font-mono font-semibold uppercase tracking-[0.14em] text-[#968E85]">
              Target Competencies & Focus Areas
            </h3>
          </div>

          <SkillTagInput
            label="Key Focus Topics / Interview Areas *"
            tags={data.focusTopics || []}
            onChange={(newTopics) => updateField("focusTopics", newTopics)}
            suggestions={SUGGESTED_TOPICS}
            placeholder="Type focus area and press Enter (e.g. System Design, React Performance)..."
            error={errors.focusTopics}
          />
        </div>

        {/* Group Divider */}
        <div className="border-t border-[#E2DDD3]" />

        {/* Group 4: Job Description Details */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-[#968E85]" />
            <h3 className="text-[10.5px] font-mono font-semibold uppercase tracking-[0.14em] text-[#968E85]">
              Job Description Details
            </h3>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-mono font-medium uppercase tracking-wider text-[#6B635B]">
              Target Job Description Notes (Optional)
            </label>
            <textarea
              rows={4}
              value={data.jobDescription || ""}
              onChange={(e) => updateField("jobDescription", e.target.value)}
              placeholder="Paste key job description requirements, team objectives, or specific technical criteria..."
              className="w-full rounded-lg bg-white border border-[#D8D2C5] text-[#211A16] placeholder-[#968E85] text-sm p-3.5 transition-all focus:outline-none focus:border-[#211A16] focus:ring-1 focus:ring-[#211A16]/20 resize-none font-sans"
            />
          </div>
        </div>
      </div>

      {/* 3. Form Action Navigation Bar */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-1">
        <Button
          type="button"
          variant="secondary"
          size="lg"
          onClick={onBack}
          leftIcon={ArrowLeft}
          className="w-full sm:w-auto py-3.5 text-xs sm:text-[13px] tracking-[0.14em] font-semibold"
        >
          Back to Profile
        </Button>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          rightIcon={ArrowRight}
          className="w-full sm:w-auto py-3.5 text-xs sm:text-[13px] tracking-[0.14em] font-semibold"
        >
          Continue to Review
        </Button>
      </div>
    </form>
  );
}
