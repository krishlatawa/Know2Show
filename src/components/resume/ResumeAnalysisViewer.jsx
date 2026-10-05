"use client";

import React, { useState } from "react";
import {
  Code,
  Briefcase,
  FolderGit2,
  GraduationCap,
  Sparkles,
  CheckCircle,
  ExternalLink,
  GitBranch,
  Calendar,
  MapPin,
  Layers,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ResumeAnalysisViewer({
  data,
  sourceName,
  onApplyToProfile,
  isApplied = false,
}) {
  const [activeTab, setActiveTab] = useState("skills");

  if (!data) return null;

  const {
    candidateName,
    headline,
    bio,
    totalYearsExp = 0,
    seniorityLevel = "MID",
    skills = [],
    technologies = [],
    experience = [],
    projects = [],
    education = [],
  } = data;

  const tabs = [
    { id: "skills", label: "Skills & Tech", icon: Code, count: technologies.length || skills.length },
    { id: "projects", label: "Projects", icon: FolderGit2, count: projects.length },
    { id: "experience", label: "Experience", icon: Briefcase, count: experience.length },
    { id: "education", label: "Education", icon: GraduationCap, count: education.length },
  ];

  return (
    <div className="w-full bg-[#FAF9F5] border border-[#D8D2C5] rounded-lg p-4 sm:p-5.5 space-y-5">
      {/* Top Banner: Extracted Summary & Quick Apply */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4.5 border-b border-[#D8D2C5]">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-0.5 bg-[#EFECE4] border border-[#D8D2C5] text-[#211A16] text-[10.5px] font-mono font-medium uppercase tracking-wider rounded flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-[#211A16]" />
              AI Extracted
            </span>
            {sourceName && (
              <span className="text-[11px] font-mono text-[#968E85] truncate max-w-xs">
                from {sourceName}
              </span>
            )}
            <span className="px-2 py-0.5 bg-[#EAE6DF] border border-[#D8D2C5] text-[#6B635B] text-[10.5px] font-mono rounded">
              {seniorityLevel} ({totalYearsExp} yrs exp)
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-medium text-[#211A16] tracking-tight">
            {candidateName || "Candidate Profile"}
            {headline ? ` — ${headline}` : ""}
          </h3>
          {bio && <p className="text-xs sm:text-[13px] text-[#6B635B] leading-relaxed max-w-2xl">{bio}</p>}
        </div>

        {onApplyToProfile && (
          <div className="shrink-0">
            {isApplied ? (
              <div className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#EFECE4] border border-[#D8D2C5] text-[#211A16] text-xs font-mono font-medium rounded-lg select-none">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Applied to Profile</span>
              </div>
            ) : (
              <Button
                variant="primary"
                size="md"
                onClick={onApplyToProfile}
                leftIcon={Sparkles}
                className="text-xs tracking-wider"
              >
                Auto-Fill Profile Details
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Tabs Switcher */}
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

      {/* Tab 1: Skills & Technologies */}
      {activeTab === "skills" && (
        <div className="space-y-4 animate-fadeIn">
          {skills && skills.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="text-[11px] font-mono font-semibold text-[#6B635B] uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#211A16]" />
                Categorized Core Competencies
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {skills.map((cat, idx) => (
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

          {technologies && technologies.length > 0 && (
            <div className="space-y-2 pt-1">
              <h4 className="text-[11px] font-mono font-semibold text-[#6B635B] uppercase tracking-wider flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-[#211A16]" />
                All Detected Technologies & Tools ({technologies.length})
              </h4>
              <div className="flex flex-wrap gap-1.5 p-3.5 bg-white border border-[#E2DDD3] rounded-lg">
                {technologies.map((tech, idx) => (
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

      {/* Tab 2: Projects */}
      {activeTab === "projects" && (
        <div className="space-y-3 animate-fadeIn">
          {projects && projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {projects.map((proj, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-white border border-[#E2DDD3] rounded-lg space-y-2.5 flex flex-col justify-between hover:border-[#211A16]/40 transition-colors"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-semibold text-[#211A16] tracking-tight">
                        {proj.title}
                      </h4>
                      <div className="flex items-center gap-1">
                        {proj.githubUrl && (
                          <a
                            href={proj.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 text-[#6B635B] hover:text-[#211A16] rounded hover:bg-[#EFECE4]"
                            aria-label="GitHub repository"
                          >
                            <GitBranch className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {proj.liveUrl && (
                          <a
                            href={proj.liveUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 text-[#6B635B] hover:text-[#211A16] rounded hover:bg-[#EFECE4]"
                            aria-label="Live project URL"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>

                    {proj.role && (
                      <span className="inline-block text-[11px] font-mono text-[#6B635B]">
                        Role: {proj.role}
                      </span>
                    )}

                    <p className="text-xs sm:text-[12.5px] text-[#6B635B] leading-relaxed">
                      {proj.description}
                    </p>

                    {proj.highlights && proj.highlights.length > 0 && (
                      <ul className="space-y-1 pt-1">
                        {proj.highlights.map((h, i) => (
                          <li key={i} className="text-xs text-[#6B635B] flex items-start gap-1.5">
                            <span className="text-[#211A16] font-bold mt-0.5">•</span>
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {proj.technologiesUsed && proj.technologiesUsed.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-2 border-t border-[#E2DDD3]">
                      {proj.technologiesUsed.map((tech, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-[#FAF9F5] text-[#6B635B] text-[10.5px] font-mono rounded border border-[#E2DDD3]"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs font-mono text-[#968E85] py-6 text-center">
              No projects detected in resume.
            </p>
          )}
        </div>
      )}

      {/* Tab 3: Experience */}
      {activeTab === "experience" && (
        <div className="space-y-3 animate-fadeIn">
          {experience && experience.length > 0 ? (
            <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-px before:bg-[#E2DDD3]">
              {experience.map((exp, idx) => (
                <div key={idx} className="relative pl-7 space-y-2">
                  <div className="absolute left-2 top-2 w-3 h-3 bg-[#211A16] border-2 border-[#FAF9F5] rounded-full" />
                  <div className="p-4 bg-white border border-[#E2DDD3] rounded-lg space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div>
                        <h4 className="text-sm font-semibold text-[#211A16]">{exp.role}</h4>
                        <p className="text-xs font-mono text-[#6B635B]">{exp.company}</p>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] font-mono text-[#968E85]">
                        {(exp.startDate || exp.endDate) && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {exp.startDate} – {exp.isCurrent ? "Present" : exp.endDate || "N/A"}
                          </span>
                        )}
                        {exp.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {exp.location}
                          </span>
                        )}
                      </div>
                    </div>

                    {exp.description && (
                      <p className="text-xs sm:text-[12.5px] text-[#6B635B] leading-relaxed">
                        {exp.description}
                      </p>
                    )}

                    {exp.achievements && exp.achievements.length > 0 && (
                      <div className="space-y-1 pt-1">
                        {exp.achievements.map((ach, i) => (
                          <p key={i} className="text-xs text-[#6B635B] flex items-start gap-1.5">
                            <ChevronRight className="w-3.5 h-3.5 text-[#211A16] shrink-0 mt-0.5" />
                            <span>{ach}</span>
                          </p>
                        ))}
                      </div>
                    )}

                    {exp.technologiesUsed && exp.technologiesUsed.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-2 border-t border-[#E2DDD3]">
                        {exp.technologiesUsed.map((tech, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-[#FAF9F5] text-[#6B635B] text-[10.5px] font-mono rounded border border-[#E2DDD3]"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs font-mono text-[#968E85] py-6 text-center">
              No work experience detected.
            </p>
          )}
        </div>
      )}

      {/* Tab 4: Education */}
      {activeTab === "education" && (
        <div className="space-y-3 animate-fadeIn">
          {education && education.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {education.map((edu, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-white border border-[#E2DDD3] rounded-lg space-y-1"
                >
                  <h4 className="text-sm font-semibold text-[#211A16]">{edu.degree}</h4>
                  <p className="text-xs font-mono text-[#6B635B]">{edu.institution}</p>
                  {edu.fieldOfStudy && (
                    <p className="text-[11px] font-mono text-[#968E85]">Field: {edu.fieldOfStudy}</p>
                  )}
                  {edu.graduationYear && (
                    <p className="text-[11px] font-mono text-[#968E85]">Graduation: {edu.graduationYear}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs font-mono text-[#968E85] py-6 text-center">
              No education entries detected.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

