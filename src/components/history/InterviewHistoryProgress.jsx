"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  Target,
  Award,
  Sparkles,
  Calendar,
  Layers,
  ChevronRight,
  Filter,
  BarChart2,
  Check,
  Shield,
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

export default function InterviewHistoryProgress({
  sessions = [],
  profile = null,
  loading = false,
  error = "",
}) {
  const [filterType, setFilterType] = useState("ALL"); // 'ALL' | 'COMPLETED' | 'IN_PROGRESS'
  const [hoveredSession, setHoveredSession] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);

  // Target role title
  const roleTitle =
    profile?.targetRole?.roleTitle || "Technical Software Engineer";

  // Filter completed sessions that have a valid score
  const completedSessions = useMemo(() => {
    return sessions.filter(
      (s) => s.status === "COMPLETED" && s.overallScore != null
    );
  }, [sessions]);

  // Chronological order for longitudinal trend analysis (Oldest → Newest)
  const chronologicalSessions = useMemo(() => {
    return [...completedSessions].reverse();
  }, [completedSessions]);

  // Active selected session for audit replay action (defaults to latest completed session)
  const activeSelectedSession = useMemo(() => {
    if (selectedSession) return selectedSession;
    if (chronologicalSessions.length > 0) {
      return chronologicalSessions[chronologicalSessions.length - 1];
    }
    return null;
  }, [selectedSession, chronologicalSessions]);

  // Longitudinal Performance Metrics
  const performanceMetrics = useMemo(() => {
    const count = completedSessions.length;
    if (count === 0) {
      return {
        totalCompleted: 0,
        averageScore: null,
        latestScore: null,
        firstScore: null,
        scoreDelta: null,
        peakScore: null,
        trendDirection: "NEUTRAL",
      };
    }

    const scores = chronologicalSessions.map((s) => Math.round(s.overallScore));
    const totalSum = scores.reduce((sum, val) => sum + val, 0);
    const averageScore = Math.round(totalSum / count);
    const latestScore = scores[scores.length - 1];
    const firstScore = scores[0];
    const scoreDelta = count > 1 ? latestScore - firstScore : null;
    const peakScore = Math.max(...scores);

    let trendDirection = "NEUTRAL";
    if (scoreDelta != null) {
      if (scoreDelta > 2) trendDirection = "UP";
      else if (scoreDelta < -2) trendDirection = "DOWN";
      else trendDirection = "STABLE";
    }

    return {
      totalCompleted: count,
      averageScore,
      latestScore,
      firstScore,
      scoreDelta,
      peakScore,
      trendDirection,
      scores,
    };
  }, [completedSessions, chronologicalSessions]);

  // Longitudinal Repeated Gaps Identification (Across all completed sessions)
  const repeatedGapsAnalysis = useMemo(() => {
    if (completedSessions.length === 0) return { repeatedGaps: [], allGaps: [] };

    const gapFrequencyMap = {}; // { [gapName]: { count, sessions: [] } }

    completedSessions.forEach((session) => {
      const sessionGaps = new Set();

      // Collect from transcript turns
      if (Array.isArray(session.transcript)) {
        session.transcript.forEach((turn) => {
          if (Array.isArray(turn.missingConcepts)) {
            turn.missingConcepts.forEach((c) => {
              if (c && typeof c === "string") {
                sessionGaps.add(c.trim());
              }
            });
          }
        });
      }

      // Collect from feedbackSummary
      if (Array.isArray(session.feedbackSummary?.criticalSkillGaps)) {
        session.feedbackSummary.criticalSkillGaps.forEach((c) => {
          if (c && typeof c === "string") {
            sessionGaps.add(c.trim());
          }
        });
      }

      // Add to overall frequency map
      sessionGaps.forEach((gap) => {
        if (!gapFrequencyMap[gap]) {
          gapFrequencyMap[gap] = { name: gap, count: 0, sessionIds: [] };
        }
        gapFrequencyMap[gap].count += 1;
        gapFrequencyMap[gap].sessionIds.push(session.id);
      });
    });

    const gapList = Object.values(gapFrequencyMap).sort(
      (a, b) => b.count - a.count
    );

    // Repeated gaps: surfaced in >= 2 sessions if multiple sessions exist, or top gaps if 1 session
    const repeatedGaps =
      completedSessions.length > 1
        ? gapList.filter((g) => g.count >= 2)
        : gapList.slice(0, 3);

    return {
      repeatedGaps,
      allGaps: gapList,
    };
  }, [completedSessions]);

  // Longitudinal Recurring Strengths (Across all completed sessions)
  const recurringStrengthsAnalysis = useMemo(() => {
    if (completedSessions.length === 0) return [];

    const strengthFrequencyMap = {};

    completedSessions.forEach((session) => {
      const sessionStrengths = new Set();

      if (Array.isArray(session.transcript)) {
        session.transcript.forEach((turn) => {
          if (Array.isArray(turn.strengths)) {
            turn.strengths.forEach((s) => {
              if (s && typeof s === "string") {
                sessionStrengths.add(s.trim());
              }
            });
          }
        });
      }

      if (Array.isArray(session.feedbackSummary?.topStrengths)) {
        session.feedbackSummary.topStrengths.forEach((s) => {
          if (s && typeof s === "string") {
            sessionStrengths.add(s.trim());
          }
        });
      }

      sessionStrengths.forEach((strength) => {
        if (!strengthFrequencyMap[strength]) {
          strengthFrequencyMap[strength] = {
            name: strength,
            count: 0,
            sessionIds: [],
          };
        }
        strengthFrequencyMap[strength].count += 1;
        strengthFrequencyMap[strength].sessionIds.push(session.id);
      });
    });

    return Object.values(strengthFrequencyMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }, [completedSessions]);

  // Filtered session list for display
  const displayedSessions = useMemo(() => {
    if (filterType === "COMPLETED") {
      return sessions.filter((s) => s.status === "COMPLETED");
    }
    if (filterType === "IN_PROGRESS") {
      return sessions.filter((s) => s.status !== "COMPLETED");
    }
    return sessions;
  }, [sessions, filterType]);

  // Helper duration formatter
  const formatSessionDuration = (session) => {
    if (Array.isArray(session.transcript) && session.transcript.length > 0) {
      const totalSecs = session.transcript.reduce(
        (acc, t) => acc + (t.timeTakenSeconds || 0),
        0
      );
      const mins = Math.floor(totalSecs / 60);
      const secs = totalSecs % 60;
      return mins === 0 ? `${secs}s` : `${mins}m ${secs}s`;
    }
    if (session.startedAt && session.endedAt) {
      const start = new Date(session.startedAt).getTime();
      const end = new Date(session.endedAt).getTime();
      const totalSecs = Math.max(0, Math.round((end - start) / 1000));
      const mins = Math.floor(totalSecs / 60);
      const secs = totalSecs % 60;
      return mins === 0 ? `${secs}s` : `${mins}m ${secs}s`;
    }
    return `${session.questionCount || 5} questions`;
  };

  // Helper date formatter
  const formatSessionDate = (rawDate) => {
    if (!rawDate) return "RECENT";
    return new Date(rawDate)
      .toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      })
      .toUpperCase();
  };

  // SVG Score Trend Chart Coordinates Calculator
  const chartCoordinates = useMemo(() => {
    if (chronologicalSessions.length <= 1) return null;

    const width = 600;
    const height = 140;
    const padX = 40;
    const padY = 24;

    const points = chronologicalSessions.map((s, idx) => {
      const score = Math.min(100, Math.max(0, Math.round(s.overallScore)));
      const x =
        padX +
        (idx / (chronologicalSessions.length - 1)) * (width - 2 * padX);
      const y = height - padY - (score / 100) * (height - 2 * padY);
      return { x, y, score, session: s, idx };
    });

    const pathD = points.reduce((acc, pt, i) => {
      return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, "");

    return { width, height, points, pathD };
  }, [chronologicalSessions]);

  return (
    <div className="space-y-8">
      {/* ========================================================================= */}
      {/* 1. EXECUTIVE SUMMARY & LONGITUDINAL KPI BAR */}
      {/* ========================================================================= */}
      <div className="bg-[#FFFFFF] border border-[#D8D2C5] rounded-xl p-6 sm:p-7 shadow-[0_2px_12px_-3px_rgba(33,26,22,0.04)] space-y-6">
        {/* Title and Scope Row */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-5 border-b border-[#E2DDD3]">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#ECE7DD] border border-[#D8D2C5] text-[10px] font-mono uppercase tracking-widest text-[#6B635B]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#211A16]" />
              PERFORMANCE TRAJECTORY &amp; HISTORY
            </div>

            <h1 className="text-2xl sm:text-3xl font-normal text-[#211A16] tracking-tight">
              Interview History &amp; Progress
            </h1>

            <p className="text-xs sm:text-[13.5px] text-[#6B635B] leading-relaxed max-w-2xl">
              Track candidate competency progression, recurring gaps, and score trajectory calibrated against your target role ({roleTitle}).
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link href="/interview/setup">
              <Button
                variant="primary"
                size="sm"
                rightIcon={RotateCcw}
                className="text-[11px] font-semibold tracking-wider uppercase py-2 px-4"
              >
                NEW SIMULATION
              </Button>
            </Link>
          </div>
        </div>

        {/* Longitudinal Key Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {/* Card 1: Completed Sessions */}
          <div className="bg-[#FAF9F5] border border-[#E2DDD3] rounded-lg p-4 space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#968E85] font-medium">
              RECORDED SESSIONS
            </span>
            <div className="text-2xl font-bold font-mono text-[#211A16]">
              {performanceMetrics.totalCompleted}
            </div>
            <p className="text-[11px] text-[#6B635B]">
              {sessions.length} total initiated runs
            </p>
          </div>

          {/* Card 2: Recent Score */}
          <div className="bg-[#FAF9F5] border border-[#E2DDD3] rounded-lg p-4 space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#968E85] font-medium">
              LATEST READINESS
            </span>
            <div className="text-2xl font-bold font-mono text-[#211A16]">
              {performanceMetrics.latestScore != null
                ? `${performanceMetrics.latestScore}/100`
                : "—"}
            </div>
            <p className="text-[11px] text-[#6B635B]">
              {performanceMetrics.latestScore != null
                ? performanceMetrics.latestScore >= 80
                  ? "Strong candidate fit"
                  : performanceMetrics.latestScore >= 60
                  ? "Qualified — refining"
                  : "Targeted drill stage"
                : "Awaiting completed run"}
            </p>
          </div>

          {/* Card 3: Average Performance */}
          <div className="bg-[#FAF9F5] border border-[#E2DDD3] rounded-lg p-4 space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#968E85] font-medium">
              HISTORICAL AVERAGE
            </span>
            <div className="text-2xl font-bold font-mono text-[#211A16]">
              {performanceMetrics.averageScore != null
                ? `${performanceMetrics.averageScore}/100`
                : "—"}
            </div>
            <p className="text-[11px] text-[#6B635B]">
              {performanceMetrics.peakScore != null
                ? `Peak performance: ${performanceMetrics.peakScore}/100`
                : "No completed data"}
            </p>
          </div>

          {/* Card 4: Trajectory Movement */}
          <div className="bg-[#FAF9F5] border border-[#E2DDD3] rounded-lg p-4 space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#968E85] font-medium">
              SCORE TRAJECTORY
            </span>
            <div className="text-2xl font-bold font-mono flex items-center gap-1.5 text-[#211A16]">
              {performanceMetrics.scoreDelta != null ? (
                <>
                  {performanceMetrics.scoreDelta > 0 ? (
                    <span className="text-[#137333] flex items-center gap-1">
                      <TrendingUp className="w-5 h-5" />
                      +{performanceMetrics.scoreDelta}
                    </span>
                  ) : performanceMetrics.scoreDelta < 0 ? (
                    <span className="text-[#9B2C2C] flex items-center gap-1">
                      <TrendingDown className="w-5 h-5" />
                      {performanceMetrics.scoreDelta}
                    </span>
                  ) : (
                    <span className="text-[#6B635B] flex items-center gap-1">
                      <Minus className="w-5 h-5" />
                      0 pts
                    </span>
                  )}
                  <span className="text-xs font-mono text-[#968E85]">PTS</span>
                </>
              ) : (
                <span className="text-sm font-mono text-[#968E85]">
                  BASELINE SET
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#6B635B]">
              {performanceMetrics.scoreDelta != null
                ? "Net change from baseline"
                : "First session baseline"}
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. PROGRESS VISUALIZATION & SCORE PROGRESSION (OVER TIME) */}
      {/* ========================================================================= */}
      <div className="bg-[#FFFFFF] border border-[#D8D2C5] rounded-xl p-6 sm:p-7 shadow-[0_2px_12px_-3px_rgba(33,26,22,0.04)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-2 border-b border-[#E2DDD3]">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-[#211A16] tracking-tight">
              Score Trajectory Across Completed Sessions
            </h2>
            <p className="text-xs text-[#6B635B]">
              Restrained longitudinal score curve tracking evaluation progression across rounds.
            </p>
          </div>

          <span className="text-[10.5px] font-mono text-[#968E85] uppercase tracking-wider">
            {chronologicalSessions.length} Data Points
          </span>
        </div>

        {/* State A: Multiple Completed Sessions (Render SVG Trend Chart) */}
        {chronologicalSessions.length > 1 && chartCoordinates && (
          <div className="space-y-4">
            <div className="relative w-full overflow-x-auto bg-[#FAF9F5] border border-[#E2DDD3] rounded-lg p-4 sm:p-6">
              <svg
                viewBox={`0 0 ${chartCoordinates.width} ${chartCoordinates.height}`}
                className="w-full h-44 sm:h-48 overflow-visible"
              >
                {/* Horizontal Reference Grid Lines */}
                {[25, 50, 75, 100].map((gridVal) => {
                  const y =
                    chartCoordinates.height -
                    24 -
                    (gridVal / 100) * (chartCoordinates.height - 48);
                  return (
                    <g key={gridVal}>
                      <line
                        x1="30"
                        y1={y}
                        x2={chartCoordinates.width - 30}
                        y2={y}
                        stroke="#E2DDD3"
                        strokeDasharray="3 3"
                        strokeWidth="1"
                      />
                      <text
                        x="24"
                        y={y + 3}
                        textAnchor="end"
                        fontSize="9"
                        fill="#968E85"
                        fontFamily="monospace"
                      >
                        {gridVal}
                      </text>
                    </g>
                  );
                })}

                {/* Score Progression Line */}
                <path
                  d={chartCoordinates.pathD}
                  fill="none"
                  stroke="#211A16"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data Points */}
                {chartCoordinates.points.map((pt, i) => {
                  const isSelected = activeSelectedSession?.id === pt.session.id;
                  const isHovered = hoveredSession?.id === pt.session.id;

                  return (
                    <g
                      key={pt.session.id || i}
                      className="cursor-pointer"
                      onClick={() => setSelectedSession(pt.session)}
                      onMouseEnter={() => setHoveredSession(pt.session)}
                      onMouseLeave={() => setHoveredSession(null)}
                    >
                      {/* Outer hit target area */}
                      <circle cx={pt.x} cy={pt.y} r="16" fill="transparent" />

                      {/* Selection Ring Indicator */}
                      {isSelected && (
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="10"
                          fill="none"
                          stroke="#211A16"
                          strokeWidth="1.5"
                          strokeDasharray="2 2"
                        />
                      )}

                      {/* Point halo & center */}
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isSelected ? 6.5 : isHovered ? 5.5 : 4.5}
                        fill="#211A16"
                        className="transition-all duration-150"
                      />
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isSelected ? 2.5 : isHovered ? 2.2 : 1.8}
                        fill="#F7F5F0"
                        className="transition-all duration-150"
                      />

                      {/* Score Label above point */}
                      <text
                        x={pt.x}
                        y={pt.y - (isSelected ? 13 : 10)}
                        textAnchor="middle"
                        fontSize="10"
                        fontWeight={isSelected || isHovered ? "bold" : "600"}
                        fill="#211A16"
                        fontFamily="monospace"
                      >
                        {pt.score}
                      </text>

                      {/* Session Number / Date below */}
                      <text
                        x={pt.x}
                        y={chartCoordinates.height - 6}
                        textAnchor="middle"
                        fontSize="8.5"
                        fill={isSelected ? "#211A16" : isHovered ? "#211A16" : "#6B635B"}
                        fontWeight={isSelected || isHovered ? "600" : "normal"}
                        fontFamily="monospace"
                      >
                        R{i + 1} ({formatSessionDate(pt.session.endedAt || pt.session.createdAt).slice(0, 6)})
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Selected Session Detail & Audit Action Bar (Persistent Selection) */}
            {activeSelectedSession && (
              <div className="p-3.5 bg-[#ECE7DD] border border-[#D8D2C5] rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#211A16]" />
                    <span className="font-mono font-bold text-[#211A16]">
                      SELECTED ROUND {chronologicalSessions.findIndex((s) => s.id === activeSelectedSession.id) + 1}: {activeSelectedSession.interviewType || "Technical"}
                    </span>
                  </div>
                  <span className="text-[#D8D2C5]">•</span>
                  <span className="font-mono text-[#6B635B]">
                    Score: {Math.round(activeSelectedSession.overallScore)}/100
                  </span>
                  <span className="text-[#D8D2C5]">•</span>
                  <span className="text-[#6B635B]">
                    {formatSessionDate(activeSelectedSession.endedAt || activeSelectedSession.createdAt)}
                  </span>
                  {hoveredSession && hoveredSession.id !== activeSelectedSession.id && (
                    <>
                      <span className="text-[#D8D2C5]">•</span>
                      <span className="text-[11px] font-mono text-[#968E85] italic">
                        (Previewing: Round {chronologicalSessions.findIndex((s) => s.id === hoveredSession.id) + 1} — {Math.round(hoveredSession.overallScore)}/100)
                      </span>
                    </>
                  )}
                </div>

                <Link
                  href={`/interview/${activeSelectedSession.id}`}
                  className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-[#211A16] hover:underline bg-[#FFFFFF] px-3 py-1.5 rounded border border-[#D8D2C5] hover:bg-[#FAF9F5] transition-colors"
                >
                  <span>VIEW AUDIT REPLAY</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        )}

        {/* State B: Single Completed Session */}
        {chronologicalSessions.length === 1 && (
          <div className="bg-[#FAF9F5] border border-[#E2DDD3] rounded-lg p-6 sm:p-7 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#ECE7DD] border border-[#D8D2C5] flex items-center justify-center shrink-0 text-xs font-mono font-bold text-[#211A16]">
                01
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-[#211A16]">
                  Initial Baseline Established ({Math.round(chronologicalSessions[0].overallScore)}/100)
                </h3>
                <p className="text-xs text-[#6B635B] leading-relaxed max-w-xl">
                  Your first completed interview session has established your competency baseline for {roleTitle}. Complete additional simulation rounds to unlock longitudinal trend analytics and improvement velocity tracking.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <Link href={`/interview/${chronologicalSessions[0].id}`}>
                <Button variant="primary" size="sm" className="text-xs">
                  VIEW ROUND 1 REPLAY
                </Button>
              </Link>
              <Link href="/interview/setup">
                <Button variant="outline" size="sm" className="text-xs">
                  START ROUND 2
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* State C: Zero Completed Sessions */}
        {chronologicalSessions.length === 0 && (
          <div className="bg-[#FAF9F5] border border-[#E2DDD3] rounded-lg p-8 text-center space-y-3">
            <BarChart2 className="w-8 h-8 text-[#968E85] mx-auto" />
            <h3 className="text-sm font-semibold text-[#211A16]">
              No completed simulation rounds yet.
            </h3>
            <p className="text-xs text-[#6B635B] max-w-md mx-auto leading-relaxed">
              Progress and longitudinal score trajectories are unlocked automatically as you complete adaptive interview sessions.
            </p>
            <div className="pt-2">
              <Link href="/interview/setup">
                <Button variant="primary" size="sm" className="text-xs">
                  START YOUR FIRST INTERVIEW
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. REPEATED GAPS & RECURRING STRENGTHS ACROSS INTERVIEWS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Box A: Repeated Focus Areas / Gaps */}
        <div className="bg-[#FFFFFF] border border-[#D8D2C5] rounded-xl p-5 sm:p-6 shadow-[0_2px_12px_-3px_rgba(33,26,22,0.04)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2DDD3]">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#9B2C2C]" />
              <h3 className="text-xs sm:text-sm font-semibold text-[#211A16] font-mono uppercase tracking-wider">
                Repeated Gaps &amp; Focus Areas
              </h3>
            </div>
            <span className="text-[10.5px] font-mono text-[#968E85]">
              {repeatedGapsAnalysis.repeatedGaps.length} Identified
            </span>
          </div>

          {repeatedGapsAnalysis.repeatedGaps.length > 0 ? (
            <div className="space-y-3">
              <p className="text-xs text-[#6B635B] leading-relaxed">
                Concepts or architectural trade-offs that have surfaced across your completed simulation rounds:
              </p>

              <div className="space-y-2">
                {repeatedGapsAnalysis.repeatedGaps.map((gap, i) => (
                  <div
                    key={i}
                    className="p-3 bg-[#FAF9F5] border border-[#E2DDD3] rounded-lg flex items-start justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <span className="text-xs font-semibold text-[#211A16] leading-snug">
                        {gap.name}
                      </span>
                      <p className="text-[11px] text-[#6B635B]">
                        Noted in {gap.count} of {completedSessions.length} session{completedSessions.length > 1 ? "s" : ""}
                      </p>
                    </div>

                    <Badge variant="neutral" size="xs" className="shrink-0">
                      HIGH IMPACT
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-[#FAF9F5] border border-[#E2DDD3] rounded-lg text-center space-y-1">
              <p className="text-xs text-[#211A16] font-medium">
                No repeated weakness patterns detected.
              </p>
              <p className="text-[11px] text-[#6B635B]">
                {completedSessions.length === 0
                  ? "Complete simulations to surface persistent focus areas."
                  : "Excellent consistency across evaluated topics."}
              </p>
            </div>
          )}
        </div>

        {/* Box B: Recurring Strengths */}
        <div className="bg-[#FFFFFF] border border-[#D8D2C5] rounded-xl p-5 sm:p-6 shadow-[0_2px_12px_-3px_rgba(33,26,22,0.04)] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2DDD3]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#137333]" />
              <h3 className="text-xs sm:text-sm font-semibold text-[#211A16] font-mono uppercase tracking-wider">
                Consistently Demonstrated Strengths
              </h3>
            </div>
            <span className="text-[10.5px] font-mono text-[#968E85]">
              {recurringStrengthsAnalysis.length} Verified
            </span>
          </div>

          {recurringStrengthsAnalysis.length > 0 ? (
            <div className="space-y-3">
              <p className="text-xs text-[#6B635B] leading-relaxed">
                Competencies that have been repeatedly validated by the AI evaluation rubric:
              </p>

              <div className="space-y-2">
                {recurringStrengthsAnalysis.map((str, i) => (
                  <div
                    key={i}
                    className="p-3 bg-[#FAF9F5] border border-[#E2DDD3] rounded-lg flex items-start justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <span className="text-xs font-semibold text-[#211A16] leading-snug">
                        {str.name}
                      </span>
                      <p className="text-[11px] text-[#6B635B]">
                        Validated in {str.count} session{str.count > 1 ? "s" : ""}
                      </p>
                    </div>

                    <span className="text-[#137333] shrink-0 font-mono text-xs">
                      ✓ STRONG
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-[#FAF9F5] border border-[#E2DDD3] rounded-lg text-center space-y-1">
              <p className="text-xs text-[#211A16] font-medium">
                Strengths profile calibrating.
              </p>
              <p className="text-[11px] text-[#6B635B]">
                Complete full rounds to establish confirmed recurring strengths.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. CHRONOLOGICAL INTERVIEW HISTORY LIST */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        {/* Header & Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <h2 className="text-base sm:text-lg font-semibold text-[#211A16] tracking-tight">
              All Interview Sessions
            </h2>
            <span className="text-xs font-mono text-[#968E85]">
              ({displayedSessions.length} listed)
            </span>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-[#FAF9F5] border border-[#E2DDD3] p-1 rounded-lg self-start sm:self-auto">
            {["ALL", "COMPLETED", "IN_PROGRESS"].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFilterType(type)}
                className={`px-2.5 py-1 text-[10.5px] font-mono uppercase tracking-wider rounded-md transition-colors ${
                  filterType === type
                    ? "bg-[#211A16] text-[#F7F5F0] font-semibold"
                    : "text-[#6B635B] hover:text-[#211A16]"
                }`}
              >
                {type.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Sessions List */}
        {displayedSessions.length === 0 ? (
          <div className="bg-[#FFFFFF] border border-[#D8D2C5] rounded-xl p-8 text-center space-y-2">
            <p className="text-xs text-[#6B635B]">
              No sessions match the selected filter.
            </p>
          </div>
        ) : (
          <div className="bg-[#FFFFFF] border border-[#D8D2C5] rounded-xl divide-y divide-[#E2DDD3]/60 shadow-[0_2px_12px_-3px_rgba(33,26,22,0.04)]">
            {displayedSessions.map((s, idx) => {
              const isCompleted = s.status === "COMPLETED";
              const score =
                s.overallScore != null ? Math.round(s.overallScore) : null;
              const formattedDate = formatSessionDate(
                s.endedAt || s.createdAt
              );
              const durationLabel = formatSessionDuration(s);
              const questionCount =
                s.questionCount ||
                (Array.isArray(s.transcript) ? s.transcript.length : 5);

              return (
                <div
                  key={s.id || idx}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FAF9F5] transition-colors"
                >
                  {/* Left Metadata */}
                  <div className="flex items-start sm:items-center gap-3.5">
                    <span className="w-8 h-8 rounded-lg bg-[#ECE7DD] text-[#211A16] font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                      {(idx + 1).toString().padStart(2, "0")}
                    </span>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-[#211A16]">
                          {s.interviewType || "Technical"} Round
                        </span>
                        <Badge
                          variant={isCompleted ? "espresso" : "neutral"}
                          size="xs"
                        >
                          {s.status}
                        </Badge>
                        <span className="text-[10.5px] font-mono text-[#968E85]">
                          {s.difficulty || "MEDIUM"}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5 text-[11px] font-mono text-[#968E85]">
                        <span className="flex items-center gap-1 text-[#6B635B]">
                          <Calendar className="w-3 h-3 text-[#968E85]" />
                          {formattedDate}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#968E85]" />
                          {durationLabel}
                        </span>
                        <span>•</span>
                        <span>{questionCount} Questions</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Score & Action */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E2DDD3]/40">
                    {score != null ? (
                      <div className="text-left sm:text-right">
                        <div className="flex items-baseline gap-1">
                          <span className="text-base sm:text-lg font-mono font-bold text-[#211A16]">
                            {score}
                          </span>
                          <span className="text-[10px] font-mono text-[#968E85]">
                            /100
                          </span>
                        </div>
                        <span
                          className={`text-[9.5px] font-mono font-semibold uppercase ${
                            score >= 80
                              ? "text-[#137333]"
                              : score >= 60
                              ? "text-[#B06000]"
                              : "text-[#9B2C2C]"
                          }`}
                        >
                          {score >= 80
                            ? "STRONG"
                            : score >= 60
                            ? "QUALIFIED"
                            : "DRILL"}
                        </span>
                      </div>
                    ) : (
                      <div className="text-left sm:text-right">
                        <span className="text-xs font-mono text-[#968E85]">
                          IN PROGRESS
                        </span>
                      </div>
                    )}

                    <Link href={`/interview/${s.id}`}>
                      <Button
                        variant={isCompleted ? "primary" : "secondary"}
                        size="sm"
                        rightIcon={ArrowRight}
                        className="text-[11px] font-semibold tracking-wider uppercase py-1.5 px-3"
                      >
                        {isCompleted ? "REPLAY AUDIT" : "RESUME ROUND"}
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5. CURRENT PROGRESS SUMMARY & NEXT PRACTICE DIRECTIVE */}
      {/* ========================================================================= */}
      <div className="p-6 bg-[#ECE7DD] border border-[#D8D2C5] rounded-xl flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="space-y-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-1.5 text-[10px] font-mono uppercase tracking-widest text-[#6B635B] font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#211A16]" />
            CONTINUOUS REHEARSAL DIRECTIVE
          </div>
          <h4 className="text-sm sm:text-base font-semibold text-[#211A16]">
            {repeatedGapsAnalysis.repeatedGaps.length > 0
              ? `Prioritize targeted rehearsal on: ${repeatedGapsAnalysis.repeatedGaps[0].name}`
              : "Ready for your next adaptive evaluation round."}
          </h4>
          <p className="text-xs text-[#6B635B] max-w-xl">
            Simulate realistic technical and behavioral scenarios to strengthen competency depth before live interviews.
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
              className="text-xs uppercase tracking-wider font-semibold"
            >
              START TARGETED PRACTICE
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
