"use client";

import React from "react";
import {
  User,
  Target,
  Award,
  Briefcase,
  Zap,
  Edit3,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  FileText,
  Globe,
  Link as LinkIcon,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

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
    <div className="space-y-5">
      {/* 1. Supporting AI Checkpoint Banner (Level 2 Surface) */}
      <div className="bg-[#ECE7DD] border border-[#D8D2C5] rounded-lg p-4 sm:p-5 space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-[#211A16] text-[#F7F5F0] flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#211A16]">
                AI Profile Calibration Complete
              </h3>
              <p className="text-[11.5px] text-[#6B635B]">
                Your candidate baseline and target role have been synchronized.
              </p>
            </div>
          </div>

          <Badge variant="espresso" size="sm" className="self-start sm:self-auto font-semibold">
            Ready to Launch
          </Badge>
        </div>

        <p className="text-xs sm:text-[13px] text-[#6B635B] leading-relaxed pt-1 border-t border-[#D8D2C5]/70">
          KNOW2SHOW will calibrate adaptive interview questions, technical depth, and evaluation rubrics based on this finalized candidate dossier.
        </p>
      </div>

      {/* 2. Primary Working Surface — Review Dossier (Level 1 Surface) */}
      <div className="bg-[#FFFFFF] border border-[#D8D2C5] rounded-lg p-5 sm:p-7 space-y-7">
        {/* Main Section Header */}
        <div className="border-b border-[#D8D2C5] pb-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#211A16]" />
            <h2 className="text-sm sm:text-base font-semibold text-[#211A16] tracking-tight">
              Final Profile Review & Confirmation
            </h2>
          </div>
          <p className="text-xs sm:text-[13px] text-[#6B635B] mt-0.5 leading-relaxed">
            Verify your candidate parameters and target role calibration below before launching your preparation workspace.
          </p>
        </div>

        {/* Section 1: Candidate Dossier */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#211A16]" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-[0.14em] text-[#211A16]">
                01 • Candidate Dossier
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onGoToStep(1)}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-[#6B635B] hover:text-[#211A16] underline underline-offset-4 transition-colors font-medium"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Background</span>
            </button>
          </div>

          {/* Candidate Profile Box (Clean White Surface with Crisp Border) */}
          <div className="p-4 sm:p-5 bg-white border border-[#D8D2C5] rounded-lg space-y-3.5 shadow-xs">
            <div className="space-y-1">
              <p className="text-[10.5px] font-mono uppercase tracking-wider text-[#968E85]">
                Professional Headline
              </p>
              <h4 className="text-sm sm:text-base font-semibold text-[#211A16]">
                {profileData.headline || "Candidate Profile"}
              </h4>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#E2DDD3]">
              <Badge variant="espresso" size="sm">
                Seniority: {profileData.seniorityLevel || "MID"}
              </Badge>
              <Badge variant="neutral" size="sm">
                Experience: {profileData.experienceYears ?? 2} Years
              </Badge>
              {profileData.githubUrl && (
                <a
                  href={profileData.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-[#6B635B] hover:text-[#211A16] px-2.5 py-1 rounded-md bg-[#EFECE4] border border-[#D8D2C5] transition-colors"
                >
                  <Globe className="w-3.5 h-3.5 text-[#211A16]" />
                  <span>GitHub</span>
                </a>
              )}
              {profileData.linkedinUrl && (
                <a
                  href={profileData.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-[#6B635B] hover:text-[#211A16] px-2.5 py-1 rounded-md bg-[#EFECE4] border border-[#D8D2C5] transition-colors"
                >
                  <LinkIcon className="w-3.5 h-3.5 text-[#211A16]" />
                  <span>LinkedIn</span>
                </a>
              )}
            </div>

            {/* Primary Skills */}
            {profileData.skills && profileData.skills.length > 0 && (
              <div className="space-y-2 pt-1 border-t border-[#E2DDD3]">
                <p className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#6B635B]">
                  Primary Competencies & Tech Stack ({profileData.skills.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {profileData.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-[#EFECE4] border border-[#D8D2C5] text-[#211A16] text-xs font-mono rounded font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Bio Snippet */}
            {profileData.bio && (
              <div className="space-y-1.5 pt-1 border-t border-[#E2DDD3]">
                <p className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#6B635B]">
                  Executive Summary / Bio
                </p>
                <p className="text-xs sm:text-[13px] text-[#6B635B] leading-relaxed italic">
                  "{profileData.bio}"
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Section Separation Divider */}
        <div className="border-t border-[#D8D2C5]" />

        {/* Section 2: Target Role & Calibration */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-[#211A16]" />
              <h3 className="text-xs font-mono font-bold uppercase tracking-[0.14em] text-[#211A16]">
                02 • Target Role & Calibration
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onGoToStep(2)}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-[#6B635B] hover:text-[#211A16] underline underline-offset-4 transition-colors font-medium"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Target Role</span>
            </button>
          </div>

          {/* Target Role Box (Warm Neutral Grounding Surface #FAF9F5 with Dual White Strategy Cards) */}
          <div className="p-4 sm:p-5 bg-[#FAF9F5] border border-[#D8D2C5] rounded-lg space-y-3.5">
            <div className="space-y-1">
              <p className="text-[10.5px] font-mono uppercase tracking-wider text-[#968E85]">
                Target Job Title
              </p>
              <h4 className="text-sm sm:text-base font-semibold text-[#211A16]">
                {targetRoleData.roleTitle || "Software Engineer"}
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#E2DDD3]">
              <div className="p-3.5 bg-white border border-[#D8D2C5] rounded-lg space-y-1">
                <p className="text-[10px] font-mono uppercase tracking-wider text-[#968E85]">
                  Company Tier Calibration
                </p>
                <p className="text-xs sm:text-sm font-semibold text-[#211A16]">
                  {targetRoleData.companyType || "TECH"} Tier
                </p>
              </div>

              <div className="p-3.5 bg-white border border-[#D8D2C5] rounded-lg space-y-1">
                <p className="text-[10px] font-mono uppercase tracking-wider text-[#968E85]">
                  Interview Rigor
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-semibold text-[#211A16]">
                    {(targetRoleData.difficulty || "MEDIUM").replace("_", " ")}
                  </span>
                  <Badge variant="espresso" size="xs">
                    ACTIVE
                  </Badge>
                </div>
              </div>
            </div>

            {/* Custom Job Description Preview */}
            {targetRoleData.jobDescription && (
              <div className="space-y-1.5 pt-1 border-t border-[#E2DDD3]">
                <p className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#6B635B] flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#968E85]" />
                  Job Description Highlights
                </p>
                <div className="p-3 bg-white border border-[#D8D2C5] rounded-md">
                  <p className="text-xs text-[#6B635B] leading-relaxed line-clamp-3 whitespace-pre-line font-sans">
                    {targetRoleData.jobDescription}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section Separation Divider */}
        <div className="border-t border-[#D8D2C5]" />

        {/* Section 3: Adaptive Focus Areas */}
        <div className="space-y-3.5">
          <div className="flex items-center gap-2 pb-1">
            <Zap className="w-4 h-4 text-[#211A16]" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-[0.14em] text-[#211A16]">
              03 • Adaptive Focus Areas
            </h3>
          </div>

          <div className="p-4 sm:p-5 bg-[#FAF9F5] border border-[#D8D2C5] rounded-lg space-y-3">
            <p className="text-xs text-[#6B635B]">
              The AI interview engine will calibrate scenarios and evaluation depth around these key topics:
            </p>

            <div className="flex flex-wrap gap-1.5">
              {(targetRoleData.focusTopics || []).map((topic, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 bg-white border border-[#D8D2C5] text-[#211A16] text-xs font-mono rounded font-medium shadow-xs"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Submission Error Notification */}
      {submitError && (
        <div className="flex items-start gap-2.5 p-4 bg-[#F9ECEC] border border-[#ECC8C8] rounded-lg text-[#9B2C2C] text-xs font-mono">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold">Failed to complete onboarding</p>
            <p>{submitError}</p>
          </div>
        </div>
      )}

      {/* 3. Form Action Navigation Bar */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-1">
        <Button
          type="button"
          variant="secondary"
          size="lg"
          onClick={onBack}
          disabled={isSubmitting}
          leftIcon={ArrowLeft}
          className="w-full sm:w-auto py-3.5 text-xs sm:text-[13px] tracking-[0.14em] font-semibold"
        >
          Back to Target Role
        </Button>

        <Button
          type="button"
          variant="primary"
          size="lg"
          onClick={onSubmit}
          isLoading={isSubmitting}
          rightIcon={ArrowRight}
          className="w-full sm:w-auto py-3.5 text-xs sm:text-[13px] tracking-[0.14em] font-semibold"
        >
          Confirm & Launch Preparation
        </Button>
      </div>
    </div>
  );
}
