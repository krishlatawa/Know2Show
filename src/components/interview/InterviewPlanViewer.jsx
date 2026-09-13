"use client";

import React, { useState } from "react";
import {
  BrainCircuit,
  Sparkles,
  Target,
  HelpCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Zap,
  Award,
  AlertCircle,
  RotateCcw,
  Loader2,
  BookOpen,
  ShieldCheck,
  XCircle,
  MinusCircle,
} from "lucide-react";

export default function InterviewPlanViewer({
  plan,
  onRegenerate,
  isGenerating = false,
}) {
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("ALL");
  const [expandedQuestionId, setExpandedQuestionId] = useState(null);

  if (!plan) return null;

  const { title, difficulty = "MEDIUM", summary, questions = [] } = plan;

  const categories = [
    { id: "ALL", label: `All Questions (${questions.length})` },
    {
      id: "GAP_PROBING",
      label: "Gap Probing",
      icon: AlertCircle,
      count: questions.filter((q) => q.category === "GAP_PROBING").length,
    },
    {
      id: "TECHNICAL",
      label: "Technical",
      icon: Zap,
      count: questions.filter((q) => q.category === "TECHNICAL").length,
    },
    {
      id: "SYSTEM_DESIGN",
      label: "System Design",
      icon: BrainCircuit,
      count: questions.filter((q) => q.category === "SYSTEM_DESIGN").length,
    },
    {
      id: "BEHAVIORAL",
      label: "Behavioral",
      icon: Target,
      count: questions.filter((q) => q.category === "BEHAVIORAL").length,
    },
  ];

  const filteredQuestions =
    activeCategoryFilter === "ALL"
      ? questions
      : questions.filter((q) => q.category === activeCategoryFilter);

  const getCategoryBadgeStyle = (category) => {
    switch (category) {
      case "GAP_PROBING":
        return "bg-rose-500/10 border-rose-500/30 text-rose-400";
      case "SYSTEM_DESIGN":
        return "bg-purple-500/10 border-purple-500/30 text-purple-400";
      case "TECHNICAL":
        return "bg-indigo-500/10 border-indigo-500/30 text-indigo-400";
      case "BEHAVIORAL":
        return "bg-amber-500/10 border-amber-500/30 text-amber-400";
      default:
        return "bg-slate-800 border-slate-700 text-slate-300";
    }
  };

  const getDifficultyBadgeStyle = (diff) => {
    switch (diff?.toUpperCase()) {
      case "HARD":
      case "FAANG_LEVEL":
        return "bg-rose-500/10 border-rose-500/30 text-rose-400";
      case "MEDIUM":
        return "bg-amber-500/10 border-amber-500/30 text-amber-400";
      case "EASY":
        return "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
      default:
        return "bg-indigo-500/10 border-indigo-500/30 text-indigo-400";
    }
  };

  const toggleExpand = (id) => {
    setExpandedQuestionId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="w-full bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl shadow-2xl space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold rounded-full flex items-center gap-1">
              <BrainCircuit className="w-3.5 h-3.5" />
              AI Synthesized RAG Plan
            </span>
            <span
              className={`px-2.5 py-0.5 border text-xs font-bold rounded-full ${getDifficultyBadgeStyle(
                difficulty
              )}`}
            >
              {difficulty} DIFFICULTY
            </span>
            <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium rounded-full">
              {questions.length} Blueprinted Questions
            </span>
          </div>
          <h3 className="text-xl font-extrabold text-white tracking-tight">{title}</h3>
          {summary && <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">{summary}</p>}
        </div>

        {onRegenerate && (
          <button
            type="button"
            onClick={onRegenerate}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs rounded-xl shadow-md transition-all active:scale-95 shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                Synthesizing New Plan...
              </>
            ) : (
              <>
                <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
                Regenerate AI Plan
              </>
            )}
          </button>
        )}
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto no-scrollbar">
        {categories.map((cat) => {
          if (cat.count === 0 && cat.id !== "ALL") return null;
          const isActive = activeCategoryFilter === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategoryFilter(cat.id)}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20 font-semibold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              {cat.icon && <cat.icon className="w-3.5 h-3.5" />}
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.map((q, idx) => {
          const isExpanded = expandedQuestionId === (q.id || idx);
          const rubric = q.evaluationRubric || {};

          return (
            <div
              key={q.id || idx}
              className={`bg-slate-950/70 border rounded-xl transition-all ${
                isExpanded
                  ? "border-indigo-500/50 shadow-lg shadow-indigo-500/5 ring-1 ring-indigo-500/30"
                  : "border-slate-800 hover:border-slate-700"
              }`}
            >
              {/* Question Header */}
              <div
                onClick={() => toggleExpand(q.id || idx)}
                className="p-4 cursor-pointer flex items-start justify-between gap-4 select-none"
              >
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 text-indigo-400 font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    Q{q.order || idx + 1}
                  </span>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2 py-0.5 border text-[11px] font-semibold rounded-md ${getCategoryBadgeStyle(
                          q.category
                        )}`}
                      >
                        {q.category?.replace(/_/g, " ")}
                      </span>
                      {q.focusTopic && (
                        <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-300 text-[11px] font-medium rounded-md">
                          Topic: {q.focusTopic}
                        </span>
                      )}
                      {q.difficulty && (
                        <span
                          className={`px-1.5 py-0.2 border text-[10px] font-bold rounded ${getDifficultyBadgeStyle(
                            q.difficulty
                          )}`}
                        >
                          {q.difficulty}
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-slate-100 leading-snug">
                      {q.questionText}
                    </h4>
                  </div>
                </div>

                <button
                  type="button"
                  className="p-1 text-slate-400 hover:text-white transition-colors shrink-0 mt-1"
                >
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-indigo-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Question Details Collapsible Content */}
              {isExpanded && (
                <div className="px-4 pb-5 pt-2 border-t border-slate-800/80 space-y-4 animate-fadeIn">
                  {/* Expected Concepts */}
                  {q.expectedConcepts && q.expectedConcepts.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-xs font-semibold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                        Expected Technical Concepts & Keywords
                      </h5>
                      <div className="flex flex-wrap gap-1.5 p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
                        {q.expectedConcepts.map((concept, cIdx) => (
                          <span
                            key={cIdx}
                            className="px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs rounded-md font-medium"
                          >
                            {concept}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Evaluation Rubric Grid */}
                  {typeof rubric === "object" && (rubric.poor || rubric.average || rubric.excellent) ? (
                    <div className="space-y-2">
                      <h5 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        Evaluation Rubric & Scoring Checklist
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {rubric.poor && (
                          <div className="p-3 bg-rose-950/20 border border-rose-800/30 rounded-lg space-y-1">
                            <span className="text-[11px] font-bold text-rose-400 uppercase flex items-center gap-1">
                              <XCircle className="w-3 h-3" /> Poor Answer (&lt; 50%)
                            </span>
                            <p className="text-xs text-slate-300 leading-relaxed">{rubric.poor}</p>
                          </div>
                        )}

                        {rubric.average && (
                          <div className="p-3 bg-amber-950/20 border border-amber-800/30 rounded-lg space-y-1">
                            <span className="text-[11px] font-bold text-amber-400 uppercase flex items-center gap-1">
                              <MinusCircle className="w-3 h-3" /> Average Answer (50-80%)
                            </span>
                            <p className="text-xs text-slate-300 leading-relaxed">{rubric.average}</p>
                          </div>
                        )}

                        {rubric.excellent && (
                          <div className="p-3 bg-emerald-950/20 border border-emerald-800/30 rounded-lg space-y-1">
                            <span className="text-[11px] font-bold text-emerald-400 uppercase flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Excellent (Top 5%)
                            </span>
                            <p className="text-xs text-slate-300 leading-relaxed">{rubric.excellent}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : Array.isArray(rubric) ? (
                    <div className="space-y-2">
                      <h5 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        Evaluation Rubric & Scoring Checklist
                      </h5>
                      <div className="space-y-1.5 p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
                        {rubric.map((criterion, rIdx) => (
                          <p key={rIdx} className="text-xs text-slate-300 flex items-start gap-2 leading-relaxed">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{criterion}</span>
                          </p>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {/* AI Hint & Answering Strategy */}
                  {q.hint && (
                    <div className="p-3.5 bg-amber-950/20 border border-amber-500/30 rounded-lg space-y-1">
                      <h5 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        AI Answering Strategy & Hint
                      </h5>
                      <p className="text-xs text-amber-200/90 leading-relaxed font-sans">
                        {q.hint}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
