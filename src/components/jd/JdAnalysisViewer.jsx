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
import { Button } from "@/components/ui/Button";

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
    if (score >= 80) return "bg-[#E6F4EA] border-[#B7E1CD] text-[#137333]";
    if (score >= 60) return "bg-[#FEF7E0] border-[#FEEFC3] text-[#B06000]";
    return "bg-[#FCE8E6] border-[#FAD2CF] text-[#C5221F]";
  };

  const tabs = [
    { id: "gap", label: "Skill Gap Radar", icon: Zap, highlight: true },
    { id: "skills", label: "Required Tech", icon: Code, count: requiredTechnologies.length || requiredSkills.length },
    { id: "responsibilities", label: "Responsibilities", icon: ListOrdered, count: responsibilities.length },
    { id: "expectations", label: "Role Expectations", icon: Award },
  ];

  return (
    <div className="w-full bg-[#FAF9F5] border border-[#D8D2C5] rounded-lg p-4 sm:p-5.5 space-y-5">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4.5 border-b border-[#D8D2C5]">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 bg-[#EFECE4] border border-[#D8D2C5] text-[#211A16] text-[10.5px] font-mono font-medium uppercase tracking-wider rounded flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#211A16]" />
              JD Analyzed
            </span>
            {sourceName && (
              <span className="text-[11px] font-mono text-[#968E85] truncate max-w-xs">
                from {sourceName}
              </span>
            )}
            <span className="px-2 py-0.5 bg-[#EAE6DF] border border-[#D8D2C5] text-[#6B635B] text-[10.5px] font-mono rounded">
              {seniorityLevel} ({companyType})
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-medium text-[#211A16] tracking-tight">
            Target Job Spec: {roleTitle || "Software Engineer"}
          </h3>
        </div>

        {onApplyFocusTopics && (
          <div className="shrink-0">
            {isApplied ? (
              <div className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#EFECE4] border border-[#D8D2C5] text-[#211A16] text-xs font-mono font-medium rounded-lg select-none">
                <Check className="w-3.5 h-3.5 text-[#211A16]" />
                <span>Focus Topics Applied</span>
              </div>
            ) : (
              <Button
                variant="primary"
                size="md"
                onClick={onApplyFocusTopics}
                leftIcon={Target}
                className="text-xs tracking-wider"
              >
                Apply AI Focus Areas to Setup
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 border-b border-[#E2DDD3] pb-2 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono uppercase tracking-wider transition-colors shrink-0 ${
                isActive
                  ? "bg-[#211A16] text-[#F7F5F0] font-semibold"
                  : "text-[#6B635B] hover:text-[#211A16] hover:bg-[#EFECE4]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] ${
                    isActive ? "bg-[#352B25] text-[#F7F5F0]" : "bg-[#EAE6DF] text-[#6B635B]"
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
        <div className="space-y-4 animate-fadeIn">
          {/* Match Score Card */}
          <div className="p-4 sm:p-5 bg-white border border-[#E2DDD3] rounded-lg space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-[10.5px] font-mono font-semibold uppercase tracking-[0.14em] text-[#968E85]">
                  Resume vs. Job Description Match
                </h4>
                <p className="text-sm font-semibold text-[#211A16] mt-0.5">
                  Candidate Compatibility Index
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded text-xs font-mono font-bold border ${getMatchScoreBadgeColor(
                  matchScore
                )}`}
              >
                {matchScore}% MATCH
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-[#EFECE4] rounded-full h-2.5 overflow-hidden p-0.5 border border-[#D8D2C5]">
              <div
                className="h-full rounded-full transition-all duration-700 bg-[#211A16]"
                style={{ width: `${matchScore}%` }}
              />
            </div>
          </div>

          {/* Matched vs Missing Skills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* Matched Skills */}
            <div className="p-4 bg-white border border-[#E2DDD3] rounded-lg space-y-2.5">
              <h4 className="text-[11px] font-mono font-semibold text-[#2E6B47] uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Matching Resume Skills ({skillGap?.matchingSkills?.length || 0})
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {skillGap?.matchingSkills?.length > 0 ? (
                  skillGap.matchingSkills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-[#E6F4EA] border border-[#CEEAD6] text-[#137333] text-xs font-mono rounded font-medium"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-xs font-mono text-[#968E85]">Upload your resume to see skill match overlap.</p>
                )}
              </div>
            </div>

            {/* Missing Critical Skills */}
            <div className="p-4 bg-white border border-[#E2DDD3] rounded-lg space-y-2.5">
              <h4 className="text-[11px] font-mono font-semibold text-[#A33C3C] uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Missing / Unverified Requirements ({skillGap?.missingCriticalSkills?.length || 0})
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {skillGap?.missingCriticalSkills?.length > 0 ? (
                  skillGap.missingCriticalSkills.map((skill, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-[#FDF2F2] border border-[#F8D7DA] text-[#9B2C2C] text-xs font-mono rounded font-medium"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-xs font-mono text-[#2E6B47]">All key JD requirements detected in candidate profile!</p>
                )}
              </div>
            </div>
          </div>

          {/* AI Recommended Focus Areas */}
          {keyFocusAreas && keyFocusAreas.length > 0 && (
            <div className="p-4 bg-[#EFECE4] border border-[#D8D2C5] rounded-lg space-y-2.5">
              <h4 className="text-[11px] font-mono font-semibold text-[#211A16] uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#211A16]" />
                AI Recommended Interview Focus Areas
              </h4>
              <div className="flex flex-wrap gap-2">
                {keyFocusAreas.map((area, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-white border border-[#D8D2C5] text-[#211A16] text-xs font-medium rounded shadow-xs"
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
            <div className="space-y-2.5">
              <h4 className="text-[11px] font-mono font-semibold text-[#6B635B] uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#211A16]" />
                Categorized JD Requirements
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {requiredSkills.map((cat, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-white border border-[#E2DDD3] rounded-lg space-y-2"
                  >
                    <p className="text-xs font-mono font-semibold text-[#211A16] uppercase tracking-wider">
                      {cat.category}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.items?.map((item, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-[#EFECE4] text-[#211A16] text-xs font-mono rounded border border-[#D8D2C5]"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {requiredTechnologies && requiredTechnologies.length > 0 && (
            <div className="space-y-2 pt-1">
              <h4 className="text-[11px] font-mono font-semibold text-[#6B635B] uppercase tracking-wider flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-[#211A16]" />
                All Required Technologies ({requiredTechnologies.length})
              </h4>
              <div className="flex flex-wrap gap-1.5 p-3.5 bg-white border border-[#E2DDD3] rounded-lg">
                {requiredTechnologies.map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 bg-[#EAE6DF] border border-[#D8D2C5] text-[#211A16] text-xs font-mono rounded font-medium"
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
            <div className="space-y-2 p-4 bg-white border border-[#E2DDD3] rounded-lg">
              {responsibilities.map((resp, i) => (
                <p key={i} className="text-xs sm:text-[13px] text-[#6B635B] flex items-start gap-2 leading-relaxed">
                  <span className="text-[#211A16] font-bold mt-0.5">•</span>
                  <span>{resp}</span>
                </p>
              ))}
            </div>
          ) : (
            <p className="text-xs font-mono text-[#968E85] py-6 text-center">
              No explicit responsibilities listed.
            </p>
          )}
        </div>
      )}

      {/* Tab 4: Expectations */}
      {activeTab === "expectations" && (
        <div className="space-y-4 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Domain Knowledge */}
            <div className="p-4 bg-white border border-[#E2DDD3] rounded-lg space-y-2">
              <h4 className="text-[11px] font-mono font-semibold text-[#6B635B] uppercase tracking-wider">
                Domain Knowledge Expectations
              </h4>
              <div className="space-y-1.5">
                {roleExpectations?.domainKnowledge?.map((domain, i) => (
                  <p key={i} className="text-xs sm:text-[12.5px] text-[#6B635B] flex items-start gap-2">
                    <span className="text-[#211A16] font-semibold">✓</span>
                    <span>{domain}</span>
                  </p>
                ))}
              </div>
            </div>

            {/* Soft Skills & Leadership */}
            <div className="p-4 bg-white border border-[#E2DDD3] rounded-lg space-y-2">
              <h4 className="text-[11px] font-mono font-semibold text-[#6B635B] uppercase tracking-wider">
                Soft Skills & Culture Fit
              </h4>
              <div className="space-y-1.5">
                {roleExpectations?.softSkills?.map((skill, i) => (
                  <p key={i} className="text-xs sm:text-[12.5px] text-[#6B635B] flex items-start gap-2">
                    <span className="text-[#211A16] font-semibold">✓</span>
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
