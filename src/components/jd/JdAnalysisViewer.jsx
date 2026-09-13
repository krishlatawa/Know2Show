"use client";

import React, { useState } from "react";
import {
  Target,
  Code,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Layers,
  ListOrdered,
  Award,
  Zap,
  Check,
} from "lucide-react";

export default function JdAnalysisViewer({
  data,
  skillGap,
  sourceName,
  onApplyFocusTopics,
  isApplied = false,
}) {
  const [activeTab, setActiveTab] = useState("gap"); // "gap" | "skills" | "responsibilities" | "expectations"

  if (!data) return null;

  const {
    roleTitle,
    seniorityLevel = "MID",
    companyType = "TECH",
    requiredSkills = [],
    requiredTechnologies = [],
    responsibilities = [],
    roleExpectations = {},
    keyFocusAreas = [],
  } = data;

  const matchScore = skillGap?.matchPercentage ?? 75;

  const getMatchScoreBadgeColor = (score) => {
    if (score >= 80) return "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
    if (score >= 60) return "bg-amber-500/10 border-amber-500/30 text-amber-400";
    return "bg-rose-500/10 border-rose-500/30 text-rose-400";
  };

  const tabs = [
    { id: "gap", label: "Skill Gap Radar", icon: Zap, highlight: true },
    { id: "skills", label: "Required Tech", icon: Code, count: requiredTechnologies.length },
    { id: "responsibilities", label: "Responsibilities", icon: ListOrdered, count: responsibilities.length },
    { id: "expectations", label: "Role Expectations", icon: Award },
  ];

  return (
    <div className="w-full bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl shadow-2xl space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              JD Analyzed
            </span>
            {sourceName && (
              <span className="text-xs text-slate-400 truncate max-w-xs">from {sourceName}</span>
            )}
            <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium rounded-full">
              {seniorityLevel} ({companyType})
            </span>
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">
            Target Job Spec: {roleTitle || "Software Engineer"}
          </h3>
        </div>

        {onApplyFocusTopics && (
          <button
            type="button"
            onClick={onApplyFocusTopics}
            disabled={isApplied}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs tracking-wide shadow-lg transition-all transform active:scale-95 shrink-0 ${
              isApplied
                ? "bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 cursor-default"
                : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-500/20 hover:shadow-purple-500/30"
            }`}
          >
            {isApplied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                Focus Topics Applied
              </>
            ) : (
              <>
                <Target className="w-4 h-4" />
                Apply AI Focus Areas to Interview Setup
              </>
            )}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? "bg-purple-600 text-white shadow-md shadow-purple-500/20 font-semibold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isActive ? "bg-purple-700 text-white" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Skill Gap Radar */}
      {activeTab === "gap" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Match Score Card */}
          <div className="p-5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                  Resume vs. Job Description Match Score
                </h4>
                <p className="text-sm font-bold text-white mt-0.5">
                  Candidate Compatibility Index
                </p>
              </div>
              <span
                className={`px-3.5 py-1 rounded-xl text-sm font-extrabold border ${getMatchScoreBadgeColor(
                  matchScore
                )}`}
              >
                {matchScore}% MATCH
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-800/80 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700/50">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  matchScore >= 80
                    ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                    : matchScore >= 60
                    ? "bg-gradient-to-r from-amber-500 to-yellow-400"
                    : "bg-gradient-to-r from-rose-500 to-orange-400"
                }`}
                style={{ width: `${matchScore}%` }}
              />
            </div>
          </div>

          {/* Matched vs Missing Skills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Matched Skills */}
            <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-3">
              <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Matching Resume Skills ({skillGap?.matchingSkills?.length || 0})
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {skillGap?.matchingSkills?.length > 0 ? (
                  skillGap.matchingSkills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs rounded-lg font-medium"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">Upload your resume to see skill match overlap.</p>
                )}
              </div>
            </div>

            {/* Missing Critical Skills */}
            <div className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-3">
              <h4 className="text-xs font-semibold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Missing / Unverified JD Requirements ({skillGap?.missingCriticalSkills?.length || 0})
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {skillGap?.missingCriticalSkills?.length > 0 ? (
                  skillGap.missingCriticalSkills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-lg font-medium"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-emerald-400">All key JD requirements detected in candidate profile!</p>
                )}
              </div>
            </div>
          </div>

          {/* AI Recommended Focus Areas */}
          {keyFocusAreas && keyFocusAreas.length > 0 && (
            <div className="p-4 bg-purple-950/30 border border-purple-800/40 rounded-xl space-y-3">
              <h4 className="text-xs font-semibold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-purple-400" />
                AI Recommended Interview Focus Areas
              </h4>
              <div className="flex flex-wrap gap-2">
                {keyFocusAreas.map((area, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-purple-900/60 border border-purple-500/30 text-purple-200 text-xs font-semibold rounded-lg shadow-sm"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Required Tech & Skills */}
      {activeTab === "skills" && (
        <div className="space-y-4 animate-fadeIn">
          {requiredSkills && requiredSkills.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {requiredSkills.map((cat, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2"
                >
                  <p className="text-xs font-semibold text-purple-300">{cat.category}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.items?.map((item, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-slate-800 text-slate-200 text-xs rounded border border-slate-700"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {requiredTechnologies && requiredTechnologies.length > 0 && (
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-purple-400" />
                All Required Technologies ({requiredTechnologies.length})
              </h4>
              <div className="flex flex-wrap gap-1.5 p-3.5 bg-slate-950/40 border border-slate-800/60 rounded-xl">
                {requiredTechnologies.map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs rounded-lg font-medium"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Responsibilities */}
      {activeTab === "responsibilities" && (
        <div className="space-y-3 animate-fadeIn">
          {responsibilities && responsibilities.length > 0 ? (
            <div className="space-y-2 p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
              {responsibilities.map((resp, i) => (
                <p key={i} className="text-xs text-slate-300 flex items-start gap-2 leading-relaxed">
                  <span className="text-purple-400 font-bold mt-0.5">•</span>
                  <span>{resp}</span>
                </p>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-6 text-center">No explicit responsibilities listed.</p>
          )}
        </div>
      )}

      {/* Tab 4: Expectations */}
      {activeTab === "expectations" && (
        <div className="space-y-4 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Domain Knowledge */}
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
              <h4 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                Domain Knowledge Expectations
              </h4>
              <div className="space-y-1.5">
                {roleExpectations?.domainKnowledge?.map((domain, i) => (
                  <p key={i} className="text-xs text-slate-300 flex items-start gap-2">
                    <span className="text-indigo-400">✓</span>
                    <span>{domain}</span>
                  </p>
                ))}
              </div>
            </div>

            {/* Soft Skills & Leadership */}
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
              <h4 className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
                Soft Skills & Culture Fit
              </h4>
              <div className="space-y-1.5">
                {roleExpectations?.softSkills?.map((skill, i) => (
                  <p key={i} className="text-xs text-slate-300 flex items-start gap-2">
                    <span className="text-purple-400">✓</span>
                    <span>{skill}</span>
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
