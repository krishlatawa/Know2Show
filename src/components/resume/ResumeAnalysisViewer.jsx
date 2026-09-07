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

export default function ResumeAnalysisViewer({
  data,
  sourceName,
  onApplyToProfile,
  isApplied = false,
}) {
  const [activeTab, setActiveTab] = useState("skills"); // "skills" | "projects" | "experience" | "education"

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
    <div className="w-full bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl shadow-2xl space-y-6">
      {/* Top Banner: Extracted Summary & Quick Apply */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              AI Extracted
            </span>
            {sourceName && (
              <span className="text-xs text-slate-400 truncate max-w-xs">from {sourceName}</span>
            )}
            <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium rounded-full">
              {seniorityLevel} ({totalYearsExp} yrs exp)
            </span>
          </div>
          <h3 className="text-lg font-bold text-white tracking-tight">
            {candidateName || "Candidate Profile"}
            {headline ? ` — ${headline}` : ""}
          </h3>
          {bio && <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">{bio}</p>}
        </div>

        {onApplyToProfile && (
          <button
            type="button"
            onClick={onApplyToProfile}
            disabled={isApplied}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs tracking-wide shadow-lg transition-all transform active:scale-95 shrink-0 ${
              isApplied
                ? "bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 cursor-default"
                : "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-indigo-500/20 hover:shadow-indigo-500/30"
            }`}
          >
            {isApplied ? (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                Applied to Onboarding Form
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Auto-Fill Profile Details
              </>
            )}
          </button>
        )}
      </div>

      {/* Tabs Switcher */}
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
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20 font-semibold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isActive ? "bg-indigo-700 text-white" : "bg-slate-800 text-slate-400"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Skills & Technologies */}
      {activeTab === "skills" && (
        <div className="space-y-5 animate-fadeIn">
          {skills && skills.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                Categorized Core Competencies
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {skills.map((cat, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-2"
                  >
                    <p className="text-xs font-semibold text-indigo-300">{cat.category}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.items?.map((item, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-slate-800 text-slate-200 text-xs rounded-md border border-slate-700/60"
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
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-purple-400" />
                All Detected Technologies & Tools ({technologies.length})
              </h4>
              <div className="flex flex-wrap gap-1.5 p-3.5 bg-slate-950/40 border border-slate-800/60 rounded-xl">
                {technologies.map((tech, idx) => (
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

      {/* Tab 2: Projects */}
      {activeTab === "projects" && (
        <div className="space-y-3 animate-fadeIn">
          {projects && projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((proj, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-3 flex flex-col justify-between hover:border-slate-700 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-semibold text-white tracking-tight">
                        {proj.title}
                      </h4>
                      <div className="flex items-center gap-1.5">
                        {proj.githubUrl && (
                          <a
                            href={proj.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                          >
                            <GitBranch className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {proj.liveUrl && (
                          <a
                            href={proj.liveUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>

                    {proj.role && (
                      <span className="inline-block text-[11px] font-medium text-indigo-400">
                        Role: {proj.role}
                      </span>
                    )}

                    <p className="text-xs text-slate-300 leading-relaxed">{proj.description}</p>

                    {proj.highlights && proj.highlights.length > 0 && (
                      <ul className="space-y-1 pt-1">
                        {proj.highlights.map((h, i) => (
                          <li key={i} className="text-xs text-slate-400 flex items-start gap-1.5">
                            <span className="text-indigo-400 mt-0.5">•</span>
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {proj.technologiesUsed && proj.technologiesUsed.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-2 border-t border-slate-800/60">
                      {proj.technologiesUsed.map((tech, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-slate-800/80 text-slate-300 text-[10px] rounded border border-slate-700"
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
            <p className="text-xs text-slate-500 py-6 text-center">No projects detected in resume.</p>
          )}
        </div>
      )}

      {/* Tab 3: Experience */}
      {activeTab === "experience" && (
        <div className="space-y-3 animate-fadeIn">
          {experience && experience.length > 0 ? (
            <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-800">
              {experience.map((exp, idx) => (
                <div key={idx} className="relative pl-8 space-y-2">
                  <div className="absolute left-2 top-1.5 w-3.5 h-3.5 bg-indigo-600 border-2 border-slate-950 rounded-full" />
                  <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div>
                        <h4 className="text-sm font-bold text-white">{exp.role}</h4>
                        <p className="text-xs font-medium text-indigo-400">{exp.company}</p>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
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
                      <p className="text-xs text-slate-300 leading-relaxed">{exp.description}</p>
                    )}

                    {exp.achievements && exp.achievements.length > 0 && (
                      <div className="space-y-1 pt-1">
                        {exp.achievements.map((ach, i) => (
                          <p key={i} className="text-xs text-slate-400 flex items-start gap-1.5">
                            <ChevronRight className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{ach}</span>
                          </p>
                        ))}
                      </div>
                    )}

                    {exp.technologiesUsed && exp.technologiesUsed.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-2 border-t border-slate-800/60">
                        {exp.technologiesUsed.map((tech, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-slate-800/80 text-slate-300 text-[10px] rounded border border-slate-700"
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
            <p className="text-xs text-slate-500 py-6 text-center">No work experience detected.</p>
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
                  className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1.5"
                >
                  <h4 className="text-sm font-semibold text-white">{edu.degree}</h4>
                  <p className="text-xs text-indigo-400 font-medium">{edu.institution}</p>
                  {edu.fieldOfStudy && (
                    <p className="text-xs text-slate-400">Field: {edu.fieldOfStudy}</p>
                  )}
                  {edu.graduationYear && (
                    <p className="text-xs text-slate-500">Graduation: {edu.graduationYear}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-6 text-center">No education entries detected.</p>
          )}
        </div>
      )}
    </div>
  );
}
