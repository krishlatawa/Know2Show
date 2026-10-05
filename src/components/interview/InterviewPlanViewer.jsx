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
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

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
    { id: "ALL", label: "All Questions", count: questions.length },
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

  const getCategoryBadgeVariant = (category) => {
    switch (category) {
      case "GAP_PROBING":
        return "neutral";
      case "SYSTEM_DESIGN":
      case "TECHNICAL":
        return "espresso";
      case "BEHAVIORAL":
      default:
        return "neutral";
    }
  };

  const toggleExpand = (id) => {
    setExpandedQuestionId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="w-full bg-[#FAF9F5] border border-[#D8D2C5] rounded-xl p-5 sm:p-7 shadow-[0_2px_12px_-3px_rgba(33,26,22,0.04)] space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-5 border-b border-[#E2DDD3]">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 bg-[#ECE7DD] border border-[#D8D2C5] text-[#211A16] text-[10.5px] font-mono font-medium uppercase tracking-wider rounded-full flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#211A16]" />
              AI SYNTHESIZED RAG BLUEPRINT
            </span>

            <Badge variant="espresso" size="xs">
              {difficulty} DIFFICULTY
            </Badge>

            <span className="px-2 py-0.5 bg-[#EFECE4] border border-[#D8D2C5] text-[#6B635B] text-[10.5px] font-mono rounded">
              {questions.length} Blueprinted Questions
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-normal text-[#211A16] tracking-tight leading-snug">
            {title}
          </h3>

          {summary && (
            <p className="text-xs sm:text-[13px] text-[#6B635B] max-w-3xl leading-relaxed">
              {summary}
            </p>
          )}
        </div>

        {onRegenerate && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRegenerate}
            isLoading={isGenerating}
            leftIcon={RotateCcw}
            className="text-[11px] font-semibold font-mono uppercase tracking-wider shrink-0 py-2 px-3.5"
          >
            {isGenerating ? "Synthesizing New Plan..." : "Regenerate AI Plan"}
          </Button>
        )}
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1.5 border-b border-[#E2DDD3] pb-2 overflow-x-auto no-scrollbar">
        {categories.map((cat) => {
          if (cat.count === 0 && cat.id !== "ALL") return null;
          const isActive = activeCategoryFilter === cat.id;
          const Icon = cat.icon;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategoryFilter(cat.id)}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono uppercase tracking-wider transition-colors shrink-0 ${
                isActive
                  ? "bg-[#211A16] text-[#F7F5F0] font-semibold"
                  : "text-[#6B635B] hover:text-[#211A16] hover:bg-[#EFECE4]"
              }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              <span>{cat.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                  isActive
                    ? "bg-[#352B25] text-[#F7F5F0]"
                    : "bg-[#ECE7DD] text-[#6B635B]"
                }`}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Questions List */}
      <div className="space-y-3.5">
        {filteredQuestions.map((q, idx) => {
          const isExpanded = expandedQuestionId === (q.id || idx);
          const rubric = q.evaluationRubric || {};

          return (
            <div
              key={q.id || idx}
              className={`bg-[#FFFFFF] border rounded-lg transition-all duration-150 ${
                isExpanded
                  ? "border-[#211A16] shadow-sm ring-1 ring-[#211A16]/10"
                  : "border-[#D8D2C5] hover:border-[#211A16]/40"
              }`}
            >
              {/* Question Header */}
              <div
                onClick={() => toggleExpand(q.id || idx)}
                className="p-4 sm:p-4.5 cursor-pointer flex items-start justify-between gap-4 select-none"
              >
                <div className="flex items-start gap-3.5">
                  <span
                    className={`w-7 h-7 rounded-md font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                      isExpanded
                        ? "bg-[#211A16] text-[#F7F5F0]"
                        : "bg-[#ECE7DD] text-[#211A16]"
                    }`}
                  >
                    Q{q.order || idx + 1}
                  </span>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant={getCategoryBadgeVariant(q.category)}
                        size="xs"
                      >
                        {q.category?.replace(/_/g, " ")}
                      </Badge>

                      {q.focusTopic && (
                        <span className="px-2 py-0.5 bg-[#FAF9F5] border border-[#E2DDD3] text-[#6B635B] text-[10.5px] font-mono rounded">
                          Topic: {q.focusTopic}
                        </span>
                      )}

                      {q.difficulty && (
                        <span className="px-1.5 py-0.2 border border-[#D8D2C5] text-[#211A16] text-[10px] font-mono font-semibold rounded bg-[#FAF9F5]">
                          {q.difficulty}
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm sm:text-[14.5px] font-medium text-[#211A16] leading-snug">
                      {q.questionText}
                    </h4>
                  </div>
                </div>

                <button
                  type="button"
                  className="p-1 text-[#6B635B] hover:text-[#211A16] transition-colors shrink-0 mt-0.5"
                  aria-label={isExpanded ? "Collapse question" : "Expand question"}
                >
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-[#211A16]" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Question Details Collapsible Content */}
              {isExpanded && (
                <div className="px-4 pb-5 pt-3 border-t border-[#E2DDD3] space-y-4 bg-[#FAF9F5]/60 rounded-b-lg">
                  {/* Expected Concepts */}
                  {q.expectedConcepts && q.expectedConcepts.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#6B635B] flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-[#211A16]" />
                        Expected Technical Concepts &amp; Keywords
                      </h5>
                      <div className="flex flex-wrap gap-1.5 p-3 bg-[#FFFFFF] border border-[#D8D2C5] rounded-lg">
                        {q.expectedConcepts.map((concept, cIdx) => (
                          <span
                            key={cIdx}
                            className="px-2.5 py-1 bg-[#FAF9F5] border border-[#E2DDD3] text-[#211A16] text-xs font-mono rounded-md font-medium"
                          >
                            {concept}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Evaluation Rubric Grid */}
                  {typeof rubric === "object" &&
                  (rubric.poor || rubric.average || rubric.excellent) ? (
                    <div className="space-y-2">
                      <h5 className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#211A16] flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#211A16]" />
                        Evaluation Rubric &amp; Scoring Checklist
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {rubric.poor && (
                          <div className="p-3 bg-[#FDF2F2] border border-[#F8D7DA] rounded-lg space-y-1">
                            <span className="text-[11px] font-mono font-bold text-[#9B2C2C] uppercase flex items-center gap-1">
                              <XCircle className="w-3 h-3" /> Poor (&lt; 50%)
                            </span>
                            <p className="text-xs text-[#211A16] leading-relaxed">
                              {rubric.poor}
                            </p>
                          </div>
                        )}

                        {rubric.average && (
                          <div className="p-3 bg-[#FEF7E0] border border-[#FEEFC3] rounded-lg space-y-1">
                            <span className="text-[11px] font-mono font-bold text-[#B06000] uppercase flex items-center gap-1">
                              <MinusCircle className="w-3 h-3" /> Average (50–80%)
                            </span>
                            <p className="text-xs text-[#211A16] leading-relaxed">
                              {rubric.average}
                            </p>
                          </div>
                        )}

                        {rubric.excellent && (
                          <div className="p-3 bg-[#E6F4EA] border border-[#CEEAD6] rounded-lg space-y-1">
                            <span className="text-[11px] font-mono font-bold text-[#137333] uppercase flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Excellent (Top 5%)
                            </span>
                            <p className="text-xs text-[#211A16] leading-relaxed">
                              {rubric.excellent}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : Array.isArray(rubric) && rubric.length > 0 ? (
                    <div className="space-y-2">
                      <h5 className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#211A16] flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#211A16]" />
                        Evaluation Rubric &amp; Scoring Checklist
                      </h5>
                      <div className="space-y-1.5 p-3.5 bg-[#FFFFFF] border border-[#D8D2C5] rounded-lg">
                        {rubric.map((criterion, rIdx) => (
                          <p
                            key={rIdx}
                            className="text-xs text-[#211A16] flex items-start gap-2 leading-relaxed"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#137333] shrink-0 mt-0.5" />
                            <span>{criterion}</span>
                          </p>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {/* AI Hint & Answering Strategy */}
                  {q.hint && (
                    <div className="p-3.5 bg-[#ECE7DD] border border-[#D8D2C5] rounded-lg space-y-1">
                      <h5 className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#211A16] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#211A16]" />
                        AI Answering Strategy &amp; Hint
                      </h5>
                      <p className="text-xs text-[#211A16] leading-relaxed italic">
                        "{q.hint}"
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
