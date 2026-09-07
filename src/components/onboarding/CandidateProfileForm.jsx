"use client";

import React, { useState } from "react";
import { SENIORITY_LEVELS } from "@/lib/validations/onboarding";
import SkillTagInput from "./SkillTagInput";
import ResumeUploadDropzone from "@/components/resume/ResumeUploadDropzone";
import ResumeAnalysisViewer from "@/components/resume/ResumeAnalysisViewer";
import { User, Briefcase, Award, Globe, Link as LinkIcon, AlignLeft, Sparkles, CheckCircle2 } from "lucide-react";

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
    // Auto-apply fields to the onboarding form
    applyResumeToForm(parsedData);
  };

  const applyResumeToForm = (parsedData) => {
    const skillsFromCategories = parsedData.skills?.flatMap((cat) => cat.items) || [];
    const allSkills = Array.from(
      new Set([...skillsFromCategories, ...(parsedData.technologies || [])])
    ).slice(0, 15); // Top 15 detected skills

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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-400" />
            Candidate Background
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Tell us about your professional background or upload your resume to auto-fill your profile with AI.
          </p>
        </div>

        {/* AI Resume Upload & Parsing Section */}
        <div className="space-y-4">
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


        {/* Headline */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-slate-400" />
            Professional Headline <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            value={data.headline || ""}
            onChange={(e) => updateField("headline", e.target.value)}
            placeholder="e.g. Full-Stack Engineer | React & Node Specialist"
            className={`w-full px-4 py-3 bg-slate-950/80 border ${
              errors.headline ? "border-rose-500/80" : "border-slate-800 focus:border-indigo-500"
            } rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all`}
          />
          {errors.headline && (
            <p className="mt-1 text-xs text-rose-400 font-medium">{errors.headline}</p>
          )}
        </div>

        {/* Seniority Level & Experience Years */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-slate-400" />
              Seniority Level <span className="text-rose-400">*</span>
            </label>
            <select
              value={data.seniorityLevel || "MID"}
              onChange={(e) => updateField("seniorityLevel", e.target.value)}
              className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all"
            >
              {SENIORITY_LEVELS.map((lvl) => (
                <option key={lvl.value} value={lvl.value} className="bg-slate-900 text-slate-100">
                  {lvl.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Years of Experience <span className="text-rose-400">*</span>
            </label>
            <div className="flex items-center gap-4">
              <input
                type="number"
                min="0"
                max="50"
                value={data.experienceYears ?? 3}
                onChange={(e) => updateField("experienceYears", parseInt(e.target.value) || 0)}
                className="w-28 px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all"
              />
              <span className="text-sm text-slate-400">Years in software development</span>
            </div>
            {errors.experienceYears && (
              <p className="mt-1 text-xs text-rose-400 font-medium">{errors.experienceYears}</p>
            )}
          </div>
        </div>

        {/* Primary Skills */}
        <SkillTagInput
          label="Primary Skills & Tech Stack *"
          tags={data.skills || []}
          onChange={(newSkills) => updateField("skills", newSkills)}
          suggestions={SUGGESTED_SKILLS}
          placeholder="Type skill and press Enter (e.g. React, PostgreSQL)..."
          error={errors.skills}
        />

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
            <AlignLeft className="w-4 h-4 text-slate-400" />
            Short Bio / Intro
          </label>
          <textarea
            rows="3"
            value={data.bio || ""}
            onChange={(e) => updateField("bio", e.target.value)}
            placeholder="Briefly describe your career background and main achievements..."
            className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all resize-none"
          />
        </div>

        {/* Social Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" />
              GitHub Profile (Optional)
            </label>
            <input
              type="url"
              value={data.githubUrl || ""}
              onChange={(e) => updateField("githubUrl", e.target.value)}
              placeholder="https://github.com/username"
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-600 text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1">
              <LinkIcon className="w-3.5 h-3.5" />
              LinkedIn Profile (Optional)
            </label>
            <input
              type="url"
              value={data.linkedinUrl || ""}
              onChange={(e) => updateField("linkedinUrl", e.target.value)}
              placeholder="https://linkedin.com/in/username"
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-slate-100 placeholder-slate-600 text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Form Action */}
      <div className="flex justify-end">
        <button
          type="submit"
          className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          Continue to Target Role →
        </button>
      </div>
    </form>
  );
}
