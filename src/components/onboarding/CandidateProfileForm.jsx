"use client";

import React, { useState } from "react";
import { SENIORITY_LEVELS } from "@/lib/validations/onboarding";
import SkillTagInput from "./SkillTagInput";
import ResumeUploadDropzone from "@/components/resume/ResumeUploadDropzone";
import ResumeAnalysisViewer from "@/components/resume/ResumeAnalysisViewer";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { User, Briefcase, Award, Globe, Link as LinkIcon, AlignLeft, ArrowRight } from "lucide-react";

const SUGGESTED_SKILLS = [
  "JavaScript", "TypeScript", "React", "Next.js", "Node.js", 
  "Python", "PostgreSQL", "System Design", "GraphQL", "Docker"
];

export default function CandidateProfileForm({ data, onChange, errors = {}, onNext }) {
  const [extractedResume, setExtractedResume] = useState(null);
  const [resumeSourceName, setResumeSourceName] = useState("");
  const [isApplied, setIsApplied] = useState(false);

  const updateField = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  const handleResumeAnalysisComplete = (parsedData, sourceName) => {
    setExtractedResume(parsedData);
    setResumeSourceName(sourceName);
    applyResumeToForm(parsedData);
  };

  const applyResumeToForm = (parsedData) => {
    const skillsFromCategories = parsedData.skills?.flatMap((cat) => cat.items) || [];
    const allSkills = Array.from(
      new Set([...skillsFromCategories, ...(parsedData.technologies || [])])
    ).slice(0, 15);

    onChange({
      ...data,
      headline: parsedData.headline || data.headline || "",
      bio: parsedData.bio || data.bio || "",
      experienceYears: parsedData.totalYearsExp ?? data.experienceYears ?? 2,
      seniorityLevel: parsedData.seniorityLevel || data.seniorityLevel || "MID",
      skills: allSkills.length > 0 ? allSkills : data.skills,
    });
    setIsApplied(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 1. AI Resume Accelerator Dropzone & Analysis Viewer (Level 2 Surface) */}
      <div className="space-y-3.5">
        <ResumeUploadDropzone
          onAnalysisComplete={handleResumeAnalysisComplete}
        />

        {extractedResume && (
          <ResumeAnalysisViewer
            data={extractedResume}
            sourceName={resumeSourceName}
            onApplyToProfile={() => applyResumeToForm(extractedResume)}
            isApplied={isApplied}
          />
        )}
      </div>

      {/* 2. Candidate Profile Working Surface (Level 1 Primary Content) */}
      <div className="bg-[#FFFFFF] border border-[#D8D2C5] rounded-lg p-5 sm:p-7 space-y-6">
        {/* Main Section Header */}
        <div className="border-b border-[#D8D2C5] pb-4">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-[#6B635B]" />
            <h2 className="text-sm sm:text-base font-semibold text-[#211A16] tracking-tight">
              Candidate Background & Details
            </h2>
          </div>
          <p className="text-xs sm:text-[13px] text-[#6B635B] mt-0.5 leading-relaxed">
            Specify your candidate parameters below. You can refine these at any time.
          </p>
        </div>

        {/* Group 1: Professional Profile */}
        <div className="space-y-4">
          <div className="flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-[#968E85]" />
            <h3 className="text-[10.5px] font-mono font-semibold uppercase tracking-[0.14em] text-[#968E85]">
              Professional Profile
            </h3>
          </div>

          {/* Headline */}
          <div>
            <Input
              label="Professional Headline *"
              value={data.headline || ""}
              onChange={(e) => updateField("headline", e.target.value)}
              placeholder="e.g. Senior Frontend Engineer | React & TypeScript Specialist"
              error={errors.headline}
              leftIcon={Briefcase}
            />
          </div>

          {/* Seniority Level & Experience Years */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 items-start">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono font-medium uppercase tracking-wider text-[#6B635B] flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-[#968E85]" />
                Seniority Level *
              </label>
              <select
                value={data.seniorityLevel || "MID"}
                onChange={(e) => updateField("seniorityLevel", e.target.value)}
                className="w-full rounded-lg bg-white border border-[#D8D2C5] text-[#211A16] text-sm px-3.5 py-2.5 transition-all focus:outline-none focus:border-[#211A16] focus:ring-1 focus:ring-[#211A16]/20 font-sans cursor-pointer"
              >
                {SENIORITY_LEVELS.map((lvl) => (
                  <option key={lvl.value} value={lvl.value} className="bg-white text-[#211A16]">
                    {lvl.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono font-medium uppercase tracking-wider text-[#6B635B]">
                Years of Experience *
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={data.experienceYears ?? 2}
                  onChange={(e) => updateField("experienceYears", parseInt(e.target.value) || 0)}
                  className="w-24 rounded-lg bg-white border border-[#D8D2C5] text-[#211A16] text-sm px-3.5 py-2.5 transition-all focus:outline-none focus:border-[#211A16] focus:ring-1 focus:ring-[#211A16]/20 font-mono"
                />
                <span className="text-xs text-[#6B635B]">years in software development</span>
              </div>
              {errors.experienceYears && (
                <p className="text-[11px] font-mono text-[#9B2C2C]">{errors.experienceYears}</p>
              )}
            </div>
          </div>
        </div>

        {/* Group Divider */}
        <div className="border-t border-[#E2DDD3]" />

        {/* Group 2: Technical Profile */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-[#968E85]" />
            <h3 className="text-[10.5px] font-mono font-semibold uppercase tracking-[0.14em] text-[#968E85]">
              Technical Competencies
            </h3>
          </div>

          <SkillTagInput
            label="Primary Skills & Tech Stack *"
            tags={data.skills || []}
            onChange={(newSkills) => updateField("skills", newSkills)}
            suggestions={SUGGESTED_SKILLS}
            placeholder="Type skill and press Enter (e.g. React, PostgreSQL)..."
            error={errors.skills}
          />
        </div>

        {/* Group Divider */}
        <div className="border-t border-[#E2DDD3]" />

        {/* Group 3: Professional Summary */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5">
            <AlignLeft className="w-3.5 h-3.5 text-[#968E85]" />
            <h3 className="text-[10.5px] font-mono font-semibold uppercase tracking-[0.14em] text-[#968E85]">
              Executive Overview
            </h3>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-mono font-medium uppercase tracking-wider text-[#6B635B]">
              Short Bio / Background (Optional)
            </label>
            <textarea
              rows={3}
              value={data.bio || ""}
              onChange={(e) => updateField("bio", e.target.value)}
              placeholder="Briefly describe your career background and key architectural accomplishments..."
              className="w-full rounded-lg bg-white border border-[#D8D2C5] text-[#211A16] placeholder-[#968E85] text-sm p-3.5 transition-all focus:outline-none focus:border-[#211A16] focus:ring-1 focus:ring-[#211A16]/20 resize-none font-sans"
            />
          </div>
        </div>

        {/* Group Divider */}
        <div className="border-t border-[#E2DDD3]" />

        {/* Group 4: Online Presence */}
        <div className="space-y-3">
          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-[#968E85]" />
            <h3 className="text-[10.5px] font-mono font-semibold uppercase tracking-[0.14em] text-[#968E85]">
              Online Profiles
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="GitHub Profile (Optional)"
              type="url"
              value={data.githubUrl || ""}
              onChange={(e) => updateField("githubUrl", e.target.value)}
              placeholder="https://github.com/username"
              leftIcon={Globe}
            />

            <Input
              label="LinkedIn Profile (Optional)"
              type="url"
              value={data.linkedinUrl || ""}
              onChange={(e) => updateField("linkedinUrl", e.target.value)}
              placeholder="https://linkedin.com/in/username"
              leftIcon={LinkIcon}
            />
          </div>
        </div>
      </div>

      {/* 3. Form Submission Action */}
      <div className="flex items-center justify-end pt-1">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full sm:w-auto py-3.5 text-xs sm:text-[13px] tracking-[0.14em] font-semibold"
          rightIcon={ArrowRight}
        >
          Continue to Target Role
        </Button>
      </div>
    </form>
  );
}

