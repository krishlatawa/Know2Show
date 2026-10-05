"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Clock,
  Target,
  Award,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Layers,
  Shield,
  Activity,
  FileText,
  Check,
  Zap,
} from "lucide-react";
import { PageContainer } from "@/components/layout";
import {
  Button,
  ScoreDisplay,
  Badge,
  ProgressBar,
  AiInsightBlock,
} from "@/components/ui";

export default function InterviewReplayViewer({
  session,
  transcript = [],
  feedbackSummary = null,
  onPracticeAgain,
}) {
  const [selectedTurnIndex, setSelectedTurnIndex] = useState(0);

  // Normalize transcript turns
  const turns = useMemo(() => {
    if (Array.isArray(transcript) && transcript.length > 0) {
      return transcript;
    }
    if (Array.isArray(session?.transcript) && session.transcript.length > 0) {
      return session.transcript;
    }
    return [];
  }, [transcript, session]);

  const activeTurn = turns[selectedTurnIndex] || turns[0] || null;

  // Derive target role details
  const targetRole =
    session?.user?.profile?.targetRole ||
    session?.targetRole ||
    null;
  const roleTitle = targetRole?.roleTitle || "Technical Interview";

  // Derive overall readiness score
  const overallScore = useMemo(() => {
    if (feedbackSummary?.overallScore != null) {
      return Math.round(feedbackSummary.overallScore);
    }
    if (session?.overallScore != null) {
      return Math.round(session.overallScore);
    }
    if (turns.length > 0) {
      const sum = turns.reduce((acc, t) => acc + (t.score || 0), 0);
      return Math.round(sum / turns.length);
    }
    return 0;
  }, [feedbackSummary, session, turns]);

  // Derive total time spent across all answered turns
  const totalDurationSeconds = useMemo(() => {
    if (turns.length > 0) {
      return turns.reduce((acc, t) => acc + (t.timeTakenSeconds || 0), 0);
    }
    if (session?.startedAt && session?.endedAt) {
      const start = new Date(session.startedAt).getTime();
      const end = new Date(session.endedAt).getTime();
      return Math.max(0, Math.round((end - start) / 1000));
    }
    return 0;
  }, [turns, session]);

  const formatDuration = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  const formattedDate = useMemo(() => {
    const rawDate = session?.endedAt || session?.createdAt || new Date();
    return new Date(rawDate)
      .toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      })
      .toUpperCase();
  }, [session]);

  // Aggregate missed concepts and strengths across all turns (deduplicated)
  const aggregateAnalysis = useMemo(() => {
    const missingSet = new Set();
    const strengthsSet = new Set();
    const categoriesMap = {};

    turns.forEach((t) => {
      // Missing concepts
      if (Array.isArray(t.missingConcepts)) {
        t.missingConcepts.forEach((c) => {
          if (c && typeof c === "string") missingSet.add(c.trim());
        });
      }
      // Strengths
      if (Array.isArray(t.strengths)) {
        t.strengths.forEach((s) => {
          if (s && typeof s === "string") strengthsSet.add(s.trim());
        });
      }
      // Categories breakdown
      const cat = t.category || "GENERAL";
      if (!categoriesMap[cat]) {
        categoriesMap[cat] = { count: 0, totalScore: 0 };
      }
      categoriesMap[cat].count += 1;
      categoriesMap[cat].totalScore += t.score || 0;
    });

    const categoryScores = Object.keys(categoriesMap).map((cat) => ({
      category: cat,
      averageScore: Math.round(
        categoriesMap[cat].totalScore / categoriesMap[cat].count
      ),
      count: categoriesMap[cat].count,
    }));

    return {
      missingConcepts: Array.from(missingSet),
      strengths: Array.from(strengthsSet),
      categoryScores,
    };
  }, [turns]);

  // Strengths list from feedback summary or aggregated turns
  const topStrengthsList = useMemo(() => {
    if (
      feedbackSummary?.topStrengths &&
      Array.isArray(feedbackSummary.topStrengths) &&
      feedbackSummary.topStrengths.length > 0
    ) {
      return feedbackSummary.topStrengths;
    }
    if (
      feedbackSummary?.keyStrengths &&
      Array.isArray(feedbackSummary.keyStrengths) &&
      feedbackSummary.keyStrengths.length > 0
    ) {
      return feedbackSummary.keyStrengths;
    }
    if (aggregateAnalysis.strengths.length > 0) {
      return aggregateAnalysis.strengths.slice(0, 4);
    }
    return [
      "Clear articulation of core engineering tradeoffs",
      "Consistent structural progression through technical explanations",
    ];
  }, [feedbackSummary, aggregateAnalysis]);

  // Critical gaps list from feedback summary or aggregated turns
  const criticalGapsList = useMemo(() => {
    if (
      feedbackSummary?.criticalSkillGaps &&
      Array.isArray(feedbackSummary.criticalSkillGaps) &&
      feedbackSummary.criticalSkillGaps.length > 0
    ) {
      return feedbackSummary.criticalSkillGaps;
    }
    if (
      feedbackSummary?.improvementAreas &&
      Array.isArray(feedbackSummary.improvementAreas) &&
      feedbackSummary.improvementAreas.length > 0
    ) {
      return feedbackSummary.improvementAreas;
    }
    if (aggregateAnalysis.missingConcepts.length > 0) {
      return aggregateAnalysis.missingConcepts.slice(0, 4);
    }
    return [
      "Explicitly address network partition failover and edge-case concurrency",
      "Lead with quantified impact metrics before expanding on architecture details",
    ];
  }, [feedbackSummary, aggregateAnalysis]);

  // Navigation handlers
  const handlePrevTurn = () => {
    if (selectedTurnIndex > 0) {
      setSelectedTurnIndex((prev) => prev - 1);
    }
  };

  const handleNextTurn = () => {
    if (selectedTurnIndex < turns.length - 1) {
      setSelectedTurnIndex((prev) => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#211A16] selection:bg-[#211A16] selection:text-[#F7F5F0] pb-20">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER / APP BAR */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 w-full bg-[#F7F5F0]/95 backdrop-blur-sm border-b border-[#E2DDD3]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          {/* Back to Dashboard Navigation */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-mono tracking-wider uppercase text-[#6B635B] hover:text-[#211A16] transition-colors py-1.5 px-2.5 rounded-md hover:bg-[#EFECE4]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">DASHBOARD</span>
            </Link>

            <span className="text-[#D8D2C5] select-none">•</span>

            <div className="flex items-center gap-2">
              <div className="w-5 h-4 rounded-[3px] bg-[#211A16] flex items-center justify-center gap-0.5 shrink-0">
                <span className="w-0.5 h-0.5 rounded-full bg-[#F7F5F0]" />
                <span className="w-0.5 h-0.5 rounded-full bg-[#F7F5F0]" />
              </div>
              <span className="text-xs font-bold tracking-[0.14em] text-[#211A16]">
                REPLAY &amp; AUDIT
              </span>
            </div>
          </div>

          {/* Right Action: Rehearse Again CTA */}
          <div className="flex items-center gap-3">
            <span className="hidden md:inline-block text-[10.5px] font-mono tracking-widest text-[#968E85] uppercase">
              {formattedDate}
            </span>

            <Link href="/interview/setup">
              <Button
                variant="primary"
                size="sm"
                rightIcon={RotateCcw}
                className="text-[11px] font-semibold tracking-wider uppercase py-1.5 px-3.5"
                onClick={onPracticeAgain}
              >
                PRACTICE AGAIN
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN CONTAINER */}
      {/* ========================================================================= */}
      <PageContainer size="wide" className="space-y-8 pt-6 sm:pt-8">
        {/* ======================================================================= */}
        {/* A. INTERVIEW SESSION SUMMARY (LEVEL 1 SURFACE) */}
        {/* ======================================================================= */}
        <div className="bg-[#FFFFFF] border border-[#D8D2C5] rounded-xl p-6 sm:p-7 shadow-[0_2px_12px_-3px_rgba(33,26,22,0.04)] space-y-6">
          {/* Header Row: Title, Badges & Metadata */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-5 border-b border-[#E2DDD3]">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#ECE7DD] border border-[#D8D2C5] text-[10px] font-mono uppercase tracking-widest text-[#6B635B]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#211A16]" />
                PERFORMANCE REPLAY REPORT
              </div>

              <h1 className="text-2xl sm:text-3xl font-normal text-[#211A16] tracking-tight leading-tight">
                {roleTitle}
              </h1>

              <p className="text-xs sm:text-[13.5px] text-[#6B635B] leading-relaxed max-w-2xl">
                Comprehensive turn-by-turn breakdown, AI rubric evaluations, and actionable remediation areas recorded during your simulation round.
              </p>
            </div>

            {/* Session Metadata Chips */}
            <div className="flex flex-wrap md:flex-col md:items-end gap-2 shrink-0 pt-1">
              <div className="flex items-center gap-2">
                <Badge variant="espresso" size="xs">
                  {session?.interviewType || "TECHNICAL"}
                </Badge>
                <Badge variant="neutral" size="xs">
                  {session?.difficulty || "MEDIUM"} DIFFICULTY
                </Badge>
              </div>

              <div className="flex items-center gap-3 text-[11px] font-mono text-[#968E85]">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#6B635B]" />
                  {formatDuration(totalDurationSeconds)}
                </span>
                <span>•</span>
                <span>{turns.length} Questions Answered</span>
              </div>
            </div>
          </div>

          {/* Performance Overview: Score + Executive Synthesis */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Score Card (5 Cols) */}
            <div className="lg:col-span-5 bg-[#FAF9F5] border border-[#E2DDD3] rounded-lg p-5 flex flex-col justify-between">
              <div>
                <ScoreDisplay
                  score={overallScore}
                  label="COMPOSITE READINESS SCORE"
                  unit="/100"
                  subUnit="EVALUATION"
                />
              </div>

              <div className="space-y-2.5 pt-4 border-t border-[#E2DDD3]/60 mt-4">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="uppercase text-[#6B635B]">READINESS STATUS:</span>
                  <span className="font-semibold text-[#211A16]">
                    {overallScore >= 80
                      ? "STRONG CANDIDATE FIT"
                      : overallScore >= 60
                      ? "QUALIFIED — REFINING"
                      : "NEEDS TARGETED DRILLS"}
                  </span>
                </div>

                <div className="w-full bg-[#EFECE4] rounded-full h-1.5 overflow-hidden border border-[#D8D2C5]">
                  <div
                    className="h-full rounded-full bg-[#211A16]"
                    style={{ width: `${Math.min(100, Math.max(5, overallScore))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* AI Executive Synthesis (7 Cols) */}
            <div className="lg:col-span-7 bg-[#ECE7DD] border border-[#D8D2C5] rounded-lg p-5 sm:p-6 flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-[#6B635B] font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-[#211A16]" />
                  AI EXECUTIVE AUDIT SYNTHESIS
                </div>
                <p className="text-xs sm:text-[13.5px] text-[#211A16] leading-relaxed italic">
                  "{feedbackSummary?.executiveSummary ||
                    "The candidate demonstrated strong foundational competence in technical domains with consistent structural delivery. Focused remediation on edge-case partition tolerance and concrete metrics will solidify high-conviction outcomes."}"
                </p>
              </div>

              <div className="pt-2 text-[10.5px] font-mono text-[#6B635B] uppercase tracking-wider">
                Audited against calibrated industry competency standards
              </div>
            </div>
          </div>

          {/* Strengths & Growth Areas (2 Columns) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* Strengths Block */}
            <div className="bg-[#FAF9F5] border border-[#E2DDD3] rounded-lg p-4 sm:p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold font-mono uppercase tracking-wider text-[#211A16]">
                <CheckCircle2 className="w-4 h-4 text-[#211A16]" />
                <span>Demonstrated Strengths ({topStrengthsList.length})</span>
              </div>
              <ul className="space-y-2 text-xs text-[#6B635B]">
                {topStrengthsList.map((str, i) => (
                  <li key={i} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-[#211A16] font-mono font-bold select-none">•</span>
                    <span className="text-[#211A16]">{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* High-Impact Focus Areas */}
            <div className="bg-[#FAF9F5] border border-[#E2DDD3] rounded-lg p-4 sm:p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold font-mono uppercase tracking-wider text-[#211A16]">
                <TrendingUp className="w-4 h-4 text-[#211A16]" />
                <span>High-Impact Focus Areas ({criticalGapsList.length})</span>
              </div>
              <ul className="space-y-2 text-xs text-[#6B635B]">
                {criticalGapsList.map((gap, i) => (
                  <li key={i} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-[#9B2C2C] font-mono font-bold select-none">•</span>
                    <span className="text-[#211A16]">{gap}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* B. TURN-BY-TURN REPLAY WORKSTATION (2-COLUMN MASTER DETAIL) */}
        {/* ======================================================================= */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div>
              <h2 className="text-lg sm:text-xl font-medium tracking-tight text-[#211A16]">
                Turn-by-Turn Replay &amp; AI Analysis
              </h2>
              <p className="text-xs text-[#6B635B]">
                Inspect candidate response transcripts, scoring criteria, and targeted AI feedback for each question turn.
              </p>
            </div>

            <span className="text-[11px] font-mono text-[#968E85] uppercase tracking-wider">
              {turns.length} Question Turns Recorded
            </span>
          </div>

          {turns.length === 0 ? (
            <div className="bg-[#FFFFFF] border border-[#D8D2C5] rounded-xl p-10 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-[#968E85] mx-auto" />
              <h3 className="text-sm font-semibold text-[#211A16]">
                No recorded turns available for this session.
              </h3>
              <p className="text-xs text-[#6B635B] max-w-sm mx-auto">
                This interview was initialized but no questions were submitted before completion.
              </p>
              <Link href="/interview/setup" className="inline-block pt-2">
                <Button variant="primary" size="sm">
                  START NEW SESSION
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* ------------------------------------------------------------------- */}
              {/* Left Column: Interactive Timeline List (5 Cols) */}
              {/* ------------------------------------------------------------------- */}
              <div className="lg:col-span-5 space-y-4">
                <div className="space-y-2.5">
                  {turns.map((turn, index) => {
                    const isSelected = selectedTurnIndex === index;
                    const turnScore = turn.score ?? 0;
                    const missingCount = turn.missingConcepts?.length || 0;

                    return (
                      <button
                        key={turn.questionId || index}
                        type="button"
                        onClick={() => setSelectedTurnIndex(index)}
                        className={`w-full text-left rounded-xl p-4 sm:p-4.5 transition-all duration-150 cursor-pointer ${
                          isSelected
                            ? "bg-[#FFFFFF] border-2 border-[#211A16] shadow-sm ring-1 ring-[#211A16]/10"
                            : "bg-[#FAF9F5] border border-[#D8D2C5] hover:bg-[#FFFFFF] hover:border-[#211A16]/50"
                        }`}
                      >
                        {/* Top Line: Turn #, Category, Score */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-6 h-6 rounded text-[11px] font-mono font-bold flex items-center justify-center ${
                                isSelected
                                  ? "bg-[#211A16] text-[#F7F5F0]"
                                  : "bg-[#ECE7DD] text-[#211A16]"
                              }`}
                            >
                              {(index + 1).toString().padStart(2, "0")}
                            </span>

                            <span className="text-[10px] font-mono uppercase tracking-wider text-[#6B635B] font-semibold">
                              {turn.category || "TECHNICAL"}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10.5px] font-mono font-bold ${
                                turnScore >= 80
                                  ? "bg-[#E6F4EA] text-[#137333] border border-[#CEEAD6]"
                                  : turnScore >= 60
                                  ? "bg-[#FEF7E0] text-[#B06000] border border-[#FEEFC3]"
                                  : "bg-[#FDF2F2] text-[#9B2C2C] border border-[#F8D7DA]"
                              }`}
                            >
                              {turnScore}/100
                            </span>
                          </div>
                        </div>

                        {/* Question Snippet */}
                        <p className="text-xs font-medium text-[#211A16] line-clamp-2 leading-snug">
                          {turn.questionText || "Question text"}
                        </p>

                        {/* Bottom Row Metadata */}
                        <div className="flex items-center justify-between text-[10.5px] font-mono text-[#968E85] pt-3 mt-3 border-t border-[#E2DDD3]/60">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#6B635B]" />
                            {turn.timeTakenSeconds ? formatDuration(turn.timeTakenSeconds) : "Recorded"}
                          </span>

                          {missingCount > 0 ? (
                            <span className="text-[#9B2C2C] font-medium">
                              {missingCount} gap{missingCount > 1 ? "s" : ""} noted
                            </span>
                          ) : (
                            <span className="text-[#137333] font-medium">
                              ✓ Concepts covered
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Performance Patterns Sub-Panel */}
                {aggregateAnalysis.missingConcepts.length > 0 && (
                  <div className="bg-[#FFFFFF] border border-[#D8D2C5] rounded-xl p-4 sm:p-5 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold font-mono uppercase tracking-wider text-[#211A16]">
                      <Target className="w-3.5 h-3.5 text-[#6B635B]" />
                      <span>Identified Gaps Across All Turns</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {aggregateAnalysis.missingConcepts.map((concept, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 bg-[#FAF9F5] border border-[#E2DDD3] text-[#211A16] text-[11px] font-mono rounded-md"
                        >
                          {concept}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ------------------------------------------------------------------- */}
              {/* Right Column: Deep Turn Inspection (7 Cols) */}
              {/* ------------------------------------------------------------------- */}
              <div className="lg:col-span-7 space-y-5">
                {activeTurn && (
                  <div className="bg-[#FFFFFF] border border-[#D8D2C5] rounded-xl p-5 sm:p-7 shadow-[0_2px_12px_-3px_rgba(33,26,22,0.04)] space-y-6">
                    {/* Turn Header with Prev / Next Navigation */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E2DDD3]">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono uppercase tracking-widest text-[#968E85]">
                            TURN {(selectedTurnIndex + 1).toString().padStart(2, "0")} OF {turns.length.toString().padStart(2, "0")}
                          </span>
                          <span className="text-[#D8D2C5]">•</span>
                          <span className="text-[10px] font-mono uppercase tracking-wider text-[#6B635B] font-semibold">
                            {activeTurn.category || "TECHNICAL"}
                          </span>
                        </div>
                        <h3 className="text-sm sm:text-base font-semibold text-[#211A16]">
                          {activeTurn.focusTopic || "Core Domain Assessment"}
                        </h3>
                      </div>

                      {/* Turn Navigation Buttons + Score Indicator */}
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
                            (activeTurn.score ?? 0) >= 80
                              ? "bg-[#E6F4EA] text-[#137333] border border-[#CEEAD6]"
                              : (activeTurn.score ?? 0) >= 60
                              ? "bg-[#FEF7E0] text-[#B06000] border border-[#FEEFC3]"
                              : "bg-[#FDF2F2] text-[#9B2C2C] border border-[#F8D7DA]"
                          }`}
                        >
                          Score: {activeTurn.score ?? 0}/100
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={handlePrevTurn}
                            disabled={selectedTurnIndex === 0}
                            className="p-1.5 rounded-md border border-[#D8D2C5] text-[#211A16] hover:bg-[#ECE7DD] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                            aria-label="Previous Turn"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={handleNextTurn}
                            disabled={selectedTurnIndex === turns.length - 1}
                            className="p-1.5 rounded-md border border-[#D8D2C5] text-[#211A16] hover:bg-[#ECE7DD] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                            aria-label="Next Turn"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Question Statement Box (Level 2 Surface) */}
                    <div className="p-4 bg-[#FAF9F5] border border-[#E2DDD3] rounded-lg space-y-1.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#968E85] font-semibold">
                        QUESTION PROMPT
                      </span>
                      <p className="text-sm font-medium text-[#211A16] leading-relaxed">
                        {activeTurn.questionText}
                      </p>
                    </div>

                    {/* Candidate Answer / Transcript Block */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono uppercase tracking-wider text-[#6B635B] font-semibold flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-[#968E85]" />
                          CANDIDATE RESPONSE TRANSCRIPT
                        </span>
                        <span className="font-mono text-[10.5px] text-[#968E85]">
                          Duration: {formatDuration(activeTurn.timeTakenSeconds || 0)}
                        </span>
                      </div>

                      <div className="p-4 bg-white border border-[#D8D2C5] rounded-lg text-xs sm:text-[13px] text-[#211A16] leading-relaxed font-sans whitespace-pre-wrap">
                        {activeTurn.candidateAnswer || (
                          <span className="italic text-[#968E85]">
                            [No response transcript recorded]
                          </span>
                        )}
                      </div>
                    </div>

                    {/* AI Evaluation Block */}
                    <div className="space-y-3 pt-2">
                      <AiInsightBlock
                        title="AI TURN EVALUATION"
                        context={`Turn ${selectedTurnIndex + 1} Rubric`}
                        className="p-4 sm:p-5"
                      >
                        <p className="text-xs sm:text-[13px] text-[#211A16] leading-relaxed">
                          {activeTurn.feedback ||
                            "Solid response. Demonstrated clear understanding of fundamental architectural principles."}
                        </p>
                      </AiInsightBlock>

                      {/* Turn Strengths vs Missing Concepts Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                        {/* Turn Strengths */}
                        <div className="p-3.5 bg-[#FAF9F5] border border-[#E2DDD3] rounded-lg space-y-2">
                          <span className="text-[10.5px] font-mono uppercase tracking-wider text-[#137333] font-semibold flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-[#137333]" />
                            Articulated Well
                          </span>
                          {activeTurn.strengths?.length > 0 ? (
                            <ul className="space-y-1.5 text-[11.5px] text-[#211A16]">
                              {activeTurn.strengths.map((str, idx) => (
                                <li key={idx} className="flex items-start gap-1.5 leading-snug">
                                  <span className="text-[#137333] select-none">•</span>
                                  <span>{str}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-[11.5px] text-[#6B635B] italic">
                              Foundational points addressed.
                            </p>
                          )}
                        </div>

                        {/* Turn Missing Concepts */}
                        <div className="p-3.5 bg-[#FAF9F5] border border-[#E2DDD3] rounded-lg space-y-2">
                          <span className="text-[10.5px] font-mono uppercase tracking-wider text-[#9B2C2C] font-semibold flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-[#9B2C2C]" />
                            Missing Concepts / Gaps
                          </span>
                          {activeTurn.missingConcepts?.length > 0 ? (
                            <ul className="space-y-1.5 text-[11.5px] text-[#211A16]">
                              {activeTurn.missingConcepts.map((gap, idx) => (
                                <li key={idx} className="flex items-start gap-1.5 leading-snug">
                                  <span className="text-[#9B2C2C] select-none">•</span>
                                  <span>{gap}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-[11.5px] text-[#137333] italic">
                              No major technical concepts omitted.
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Follow-Up Probe Context if Triggered */}
                      {activeTurn.followUpQuestion && (
                        <div className="p-3.5 bg-[#ECE7DD] border border-[#D8D2C5] rounded-lg space-y-1 text-xs">
                          <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-[#6B635B] font-semibold">
                            <Zap className="w-3.5 h-3.5 text-[#211A16]" />
                            Adaptive Follow-Up Triggered
                          </div>
                          <p className="text-xs text-[#211A16] italic leading-snug">
                            "{activeTurn.followUpQuestion}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ======================================================================= */}
        {/* C. BOTTOM CONTINUOUS REHEARSAL ACTION BAR */}
        {/* ======================================================================= */}
        <div className="p-5 bg-[#ECE7DD] border border-[#D8D2C5] rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-0.5 text-center sm:text-left">
            <h4 className="text-xs sm:text-sm font-semibold text-[#211A16] uppercase tracking-wider font-mono">
              CONTINUOUS IMPROVEMENT LOOP
            </h4>
            <p className="text-xs text-[#6B635B]">
              Apply these replay insights directly in a targeted follow-up session.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link href="/dashboard">
              <Button variant="secondary" size="sm" className="text-xs">
                DASHBOARD
              </Button>
            </Link>

            <Link href="/interview/setup">
              <Button
                variant="primary"
                size="sm"
                rightIcon={ArrowRight}
                className="text-xs"
                onClick={onPracticeAgain}
              >
                PRACTICE AGAIN
              </Button>
            </Link>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
