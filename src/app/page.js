"use client";

import React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  ArrowRight,
  Sparkles,
  Target,
  Zap,
  RotateCcw,
  TrendingUp,
  CheckCircle2,
  Layers,
  Award,
  ChevronRight,
  Shield,
  Activity,
  Play,
  FileText,
  Check,
  AlertCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { AiInsightBlock } from "@/components/ui/AiInsightBlock";

export default function HomePage() {
  const { data: session } = useSession();

  const primaryCtaHref = session ? "/dashboard" : "/interview/setup";
  const secondaryCtaHref = session ? "/onboarding" : "#methodology";

  return (
    <div className="w-full bg-[#F7F5F0] text-[#211A16] selection:bg-[#211A16] selection:text-[#F7F5F0]">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION (PHASE 6A - APPROVED & PRESERVED) */}
      {/* ========================================================================= */}
      <section className="relative pt-10 pb-16 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-28 border-b border-[#E2DDD3]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Product Positioning & Value Proposition (7 Cols) */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-7 text-left">
              {/* Eyebrow / Product Label */}
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#EFECE4] border border-[#D8D2C5] rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-[#211A16]" />
                <span className="text-[10.5px] font-mono font-semibold uppercase tracking-[0.18em] text-[#211A16]">
                  KNOW2SHOW • AI INTERVIEW PERFORMANCE PLATFORM
                </span>
              </div>

              {/* Main Headline */}
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl lg:text-[46px] font-medium tracking-tight text-[#211A16] leading-[1.14]">
                  Prepare for technical interviews with calibrated precision.
                </h1>
              </div>

              {/* Supporting Subtext */}
              <p className="text-sm sm:text-base text-[#6B635B] leading-relaxed max-w-xl">
                An adaptive interview cockpit that parses your candidate background against target role requirements, simulates realistic AI-led technical rounds, and breaks down your response mechanics through detailed replay.
              </p>

              {/* Primary & Secondary CTAs */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <Link href={primaryCtaHref}>
                  <Button
                    variant="primary"
                    size="lg"
                    rightIcon={ArrowRight}
                    className="w-full sm:w-auto text-xs sm:text-[13px] tracking-[0.14em] font-semibold py-3.5 px-6"
                  >
                    Start Practicing Now
                  </Button>
                </Link>

                <Link href={secondaryCtaHref}>
                  <Button
                    variant="secondary"
                    size="lg"
                    className="w-full sm:w-auto text-xs sm:text-[13px] tracking-[0.14em] font-medium py-3.5 px-6"
                  >
                    Learn How It Works
                  </Button>
                </Link>
              </div>

              {/* Trust & Credibility Footnote */}
              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-[11px] font-mono text-[#968E85] pt-1">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#211A16]" />
                  Adaptive Real-Time Feedback
                </span>
                <span className="text-[#D8D2C5]">•</span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#211A16]" />
                  Calibrated for Technical Roles
                </span>
              </div>
            </div>

            {/* Right Column: Realistic Product UI Visual Composition (5 Cols) */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Main Product Dossier Card */}
                <div className="bg-[#FFFFFF] border border-[#D8D2C5] rounded-xl p-5 sm:p-6 shadow-sm space-y-4 relative">
                  {/* Card Header: Target Role Spec */}
                  <div className="flex items-start justify-between pb-3 border-b border-[#E2DDD3]">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#968E85]">
                        Active Target Simulation
                      </span>
                      <h3 className="text-sm sm:text-base font-semibold text-[#211A16]">
                        Staff Frontend Architect
                      </h3>
                      <p className="text-[11px] font-mono text-[#6B635B]">
                        FAANG Tier • Rigor: HARD
                      </p>
                    </div>

                    <Badge variant="espresso" size="xs">
                      LIVE COCKPIT
                    </Badge>
                  </div>

                  {/* Readiness & Match Score Gauge */}
                  <div className="p-3.5 bg-[#FAF9F5] border border-[#E2DDD3] rounded-lg space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-[10.5px] uppercase tracking-wider text-[#6B635B]">
                        Candidate Readiness Index
                      </span>
                      <span className="font-mono font-bold text-[#137333]">
                        88% COMPATIBLE
                      </span>
                    </div>

                    {/* Progress Bar Track */}
                    <div className="w-full bg-[#EFECE4] rounded-full h-2 overflow-hidden p-0.5 border border-[#D8D2C5]">
                      <div className="h-full rounded-full bg-[#211A16] w-[88%]" />
                    </div>
                  </div>

                  {/* Sample Live Question Turn */}
                  <div className="p-3.5 bg-white border border-[#D8D2C5] rounded-lg space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[#968E85]">
                        Turn 03 • System Architecture
                      </span>
                      <Badge variant="neutral" size="xs">
                        Adaptive Follow-Up
                      </Badge>
                    </div>
                    <p className="text-xs text-[#211A16] font-medium leading-snug">
                      "How do you mitigate cache stampede and ensure eventual consistency under 50k concurrent writes?"
                    </p>
                  </div>

                  {/* AI Insight Feedback Block */}
                  <AiInsightBlock
                    title="AI EVALUATION"
                    context="Turn Analysis"
                    className="p-3 sm:px-4 sm:py-3"
                  >
                    <p className="text-xs text-[#211A16] leading-relaxed">
                      Strong explanation of mutex locking and probabilistic early expiration. Next step: probe edge-case network partition failover.
                    </p>
                  </AiInsightBlock>

                  {/* Identified Skill Radar Chips */}
                  <div className="pt-2 border-t border-[#E2DDD3] flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#968E85] mr-1">
                      Verified:
                    </span>
                    <span className="px-2 py-0.5 bg-[#E6F4EA] border border-[#CEEAD6] text-[#137333] text-[10.5px] font-mono rounded">
                      Concurrency
                    </span>
                    <span className="px-2 py-0.5 bg-[#E6F4EA] border border-[#CEEAD6] text-[#137333] text-[10.5px] font-mono rounded">
                      Distributed Cache
                    </span>
                    <span className="px-2 py-0.5 bg-[#FDF2F2] border border-[#F8D7DA] text-[#9B2C2C] text-[10.5px] font-mono rounded">
                      Partition Tolerance
                    </span>
                  </div>
                </div>

                {/* Subtle Decorative Backdrop Border */}
                <div className="hidden sm:block absolute -inset-2 bg-[#ECE7DD] rounded-2xl -z-10 border border-[#D8D2C5]/60" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. THE 4-STAGE PRODUCT JOURNEY (PHASE 6B: KNOW → SHOW → REPLAY → IMPROVE) */}
      {/* ========================================================================= */}
      <section id="methodology" className="py-16 sm:py-24 lg:py-28 border-b border-[#E2DDD3]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
          {/* Section Introduction */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#ECE7DD] border border-[#D8D2C5] rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#211A16]" />
              <span className="text-[10.5px] font-mono font-semibold uppercase tracking-[0.18em] text-[#211A16]">
                THE REHEARSAL LOOP
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-medium tracking-tight text-[#211A16] leading-snug">
              From baseline calibration to continuous performance improvement.
            </h2>
            <p className="text-xs sm:text-sm text-[#6B635B] leading-relaxed max-w-xl mx-auto">
              KNOW2SHOW replaces passive studying with an active 4-stage cycle that simulates real interview pressure, analyzes your response mechanics, and directs your next practice attempt.
            </p>
          </div>

          {/* Connected Product Journey — Desktop Horizontal Grid / Mobile Stack with Connecting Spine */}
          <div className="relative">
            {/* Desktop Horizontal Connecting Track Line */}
            <div className="hidden lg:block absolute top-10 left-[10%] right-[10%] h-[1px] bg-[#D8D2C5] z-0 pointer-events-none" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-5 relative z-10">
              
              {/* Stage 01: KNOW */}
              <div className="group flex flex-col bg-[#FFFFFF] border border-[#D8D2C5] rounded-xl p-5 sm:p-6 shadow-[0_2px_8px_-2px_rgba(33,26,22,0.03)] hover:border-[#211A16] transition-all duration-200">
                {/* Top Step Header */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E2DDD3]">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg bg-[#211A16] text-[#F7F5F0] font-mono font-bold text-xs flex items-center justify-center shadow-xs">
                      01
                    </span>
                    <span className="text-[11px] font-mono uppercase tracking-widest text-[#968E85]">
                      BASELINE
                    </span>
                  </div>
                  <Target className="w-4 h-4 text-[#6B635B] group-hover:text-[#211A16] transition-colors" />
                </div>

                {/* Title & Purpose */}
                <div className="space-y-2 flex-1">
                  <h3 className="text-lg font-semibold tracking-tight text-[#211A16]">
                    KNOW
                  </h3>
                  <p className="text-xs text-[#6B635B] leading-relaxed">
                    Understand your candidate profile and skill gaps before stepping into the interview.
                  </p>

                  {/* Micro Concept Pills */}
                  <div className="pt-3 space-y-2">
                    <div className="flex items-center gap-2 text-[11px] text-[#211A16]">
                      <span className="w-1 h-1 rounded-full bg-[#211A16]" />
                      <span>Candidate profile parsing</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-[#211A16]">
                      <span className="w-1 h-1 rounded-full bg-[#211A16]" />
                      <span>Target role calibration</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-[#211A16]">
                      <span className="w-1 h-1 rounded-full bg-[#211A16]" />
                      <span>Skill readiness indexing</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Stage Footnote */}
                <div className="pt-4 mt-5 border-t border-[#E2DDD3] flex items-center justify-between text-[10.5px] font-mono text-[#968E85] uppercase tracking-wider">
                  <span>Pre-Flight Setup</span>
                  <span className="text-[#211A16] font-medium">→ SHOW</span>
                </div>
              </div>

              {/* Stage 02: SHOW */}
              <div className="group flex flex-col bg-[#FFFFFF] border border-[#D8D2C5] rounded-xl p-5 sm:p-6 shadow-[0_2px_8px_-2px_rgba(33,26,22,0.03)] hover:border-[#211A16] transition-all duration-200">
                {/* Top Step Header */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E2DDD3]">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg bg-[#211A16] text-[#F7F5F0] font-mono font-bold text-xs flex items-center justify-center shadow-xs">
                      02
                    </span>
                    <span className="text-[11px] font-mono uppercase tracking-widest text-[#968E85]">
                      SIMULATION
                    </span>
                  </div>
                  <Zap className="w-4 h-4 text-[#6B635B] group-hover:text-[#211A16] transition-colors" />
                </div>

                {/* Title & Purpose */}
                <div className="space-y-2 flex-1">
                  <h3 className="text-lg font-semibold tracking-tight text-[#211A16]">
                    SHOW
                  </h3>
                  <p className="text-xs text-[#6B635B] leading-relaxed">
                    Put your knowledge into realistic practice against an adaptive AI technical interviewer.
                  </p>

                  {/* Micro Concept Pills */}
                  <div className="pt-3 space-y-2">
                    <div className="flex items-center gap-2 text-[11px] text-[#211A16]">
                      <span className="w-1 h-1 rounded-full bg-[#211A16]" />
                      <span>Realistic AI interview rounds</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-[#211A16]">
                      <span className="w-1 h-1 rounded-full bg-[#211A16]" />
                      <span>Adaptive follow-up questions</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-[#211A16]">
                      <span className="w-1 h-1 rounded-full bg-[#211A16]" />
                      <span>Real-time voice & speech capture</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Stage Footnote */}
                <div className="pt-4 mt-5 border-t border-[#E2DDD3] flex items-center justify-between text-[10.5px] font-mono text-[#968E85] uppercase tracking-wider">
                  <span>Live Cockpit</span>
                  <span className="text-[#211A16] font-medium">→ REPLAY</span>
                </div>
              </div>

              {/* Stage 03: REPLAY (Core Differentiator Accent) */}
              <div className="group flex flex-col bg-[#FAF9F5] border-2 border-[#211A16] rounded-xl p-5 sm:p-6 shadow-[0_4px_16px_-4px_rgba(33,26,22,0.08)] relative">
                {/* Accent Differentiator Tag */}
                <div className="absolute -top-3 right-4 px-2.5 py-0.5 bg-[#211A16] text-[#F7F5F0] rounded-full text-[9.5px] font-mono uppercase tracking-widest font-semibold">
                  CORE ANALYSIS
                </div>

                {/* Top Step Header */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#D8D2C5]">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg bg-[#211A16] text-[#F7F5F0] font-mono font-bold text-xs flex items-center justify-center shadow-xs">
                      03
                    </span>
                    <span className="text-[11px] font-mono uppercase tracking-widest text-[#211A16] font-semibold">
                      EVALUATION
                    </span>
                  </div>
                  <RotateCcw className="w-4 h-4 text-[#211A16]" />
                </div>

                {/* Title & Purpose */}
                <div className="space-y-2 flex-1">
                  <h3 className="text-lg font-semibold tracking-tight text-[#211A16]">
                    REPLAY
                  </h3>
                  <p className="text-xs text-[#6B635B] leading-relaxed">
                    Dissect exactly what happened turn-by-turn to diagnose missing concepts and patterns.
                  </p>

                  {/* Micro Concept Pills */}
                  <div className="pt-3 space-y-2">
                    <div className="flex items-center gap-2 text-[11px] text-[#211A16] font-medium">
                      <span className="w-1 h-1 rounded-full bg-[#211A16]" />
                      <span>Response-by-response playback</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-[#211A16] font-medium">
                      <span className="w-1 h-1 rounded-full bg-[#211A16]" />
                      <span>AI rubric scoring & strengths</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-[#211A16] font-medium">
                      <span className="w-1 h-1 rounded-full bg-[#211A16]" />
                      <span>Missed keywords & edge cases</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Stage Footnote */}
                <div className="pt-4 mt-5 border-t border-[#D8D2C5] flex items-center justify-between text-[10.5px] font-mono text-[#211A16] uppercase tracking-wider font-semibold">
                  <span>Granular Audit</span>
                  <span>→ IMPROVE</span>
                </div>
              </div>

              {/* Stage 04: IMPROVE */}
              <div className="group flex flex-col bg-[#FFFFFF] border border-[#D8D2C5] rounded-xl p-5 sm:p-6 shadow-[0_2px_8px_-2px_rgba(33,26,22,0.03)] hover:border-[#211A16] transition-all duration-200">
                {/* Top Step Header */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E2DDD3]">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg bg-[#211A16] text-[#F7F5F0] font-mono font-bold text-xs flex items-center justify-center shadow-xs">
                      04
                    </span>
                    <span className="text-[11px] font-mono uppercase tracking-widest text-[#968E85]">
                      MASTERY
                    </span>
                  </div>
                  <TrendingUp className="w-4 h-4 text-[#6B635B] group-hover:text-[#211A16] transition-colors" />
                </div>

                {/* Title & Purpose */}
                <div className="space-y-2 flex-1">
                  <h3 className="text-lg font-semibold tracking-tight text-[#211A16]">
                    IMPROVE
                  </h3>
                  <p className="text-xs text-[#6B635B] leading-relaxed">
                    Convert replay diagnoses into focused drills and recalibrate for higher difficulty rounds.
                  </p>

                  {/* Micro Concept Pills */}
                  <div className="pt-3 space-y-2">
                    <div className="flex items-center gap-2 text-[11px] text-[#211A16]">
                      <span className="w-1 h-1 rounded-full bg-[#211A16]" />
                      <span>Actionable remediation plans</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-[#211A16]">
                      <span className="w-1 h-1 rounded-full bg-[#211A16]" />
                      <span>Readiness trajectory tracking</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-[#211A16]">
                      <span className="w-1 h-1 rounded-full bg-[#211A16]" />
                      <span>Targeted re-interview drills</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Stage Footnote */}
                <div className="pt-4 mt-5 border-t border-[#E2DDD3] flex items-center justify-between text-[10.5px] font-mono text-[#968E85] uppercase tracking-wider">
                  <span>Progress Loop</span>
                  <span className="text-[#211A16] font-medium">↺ REPEAT</span>
                </div>
              </div>

            </div>
          </div>

          {/* Continuous Loop Anchor Strip */}
          <div className="p-4 sm:p-5 bg-[#ECE7DD] border border-[#D8D2C5] rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs sm:text-[13px] font-mono text-[#211A16]">
              <span className="font-bold">CONTINUOUS LOOP:</span>
              <span className="px-2 py-0.5 bg-white border border-[#D8D2C5] rounded font-semibold text-[11.5px]">KNOW</span>
              <span className="text-[#968E85]">→</span>
              <span className="px-2 py-0.5 bg-white border border-[#D8D2C5] rounded font-semibold text-[11.5px]">SHOW</span>
              <span className="text-[#968E85]">→</span>
              <span className="px-2 py-0.5 bg-[#211A16] text-[#F7F5F0] rounded font-semibold text-[11.5px]">REPLAY</span>
              <span className="text-[#968E85]">→</span>
              <span className="px-2 py-0.5 bg-white border border-[#D8D2C5] rounded font-semibold text-[11.5px]">IMPROVE</span>
              <span className="text-[#968E85]">→</span>
              <span className="text-[11px] text-[#6B635B] uppercase tracking-wider font-semibold">REPEAT</span>
            </div>

            <div className="shrink-0">
              <Link href={primaryCtaHref}>
                <Button
                  variant="outline"
                  size="sm"
                  rightIcon={ArrowRight}
                  className="text-[11px] tracking-wider font-semibold py-2 px-4 bg-white hover:bg-[#FAF9F5] border-[#D8D2C5]"
                >
                  Start Your First Loop
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. PRODUCT VALUE / KEY CAPABILITIES (PHASE 6C) */}
      {/* ========================================================================= */}
      <section id="capabilities" className="py-16 sm:py-24 lg:py-28 border-b border-[#E2DDD3] bg-[#F7F5F0]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
          {/* Section Introduction */}
          <div className="text-left max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#ECE7DD] border border-[#D8D2C5] rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#211A16]" />
              <span className="text-[10.5px] font-mono font-semibold uppercase tracking-[0.18em] text-[#211A16]">
                ENGINEERED CAPABILITIES
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-medium tracking-tight text-[#211A16] leading-snug">
              Every stage of your preparation calibrated against real expectations.
            </h2>
            <p className="text-xs sm:text-sm text-[#6B635B] leading-relaxed">
              KNOW2SHOW combines profile parsing, dynamic conversational simulation, and granular rubric evaluation into a single unified performance cockpit.
            </p>
          </div>

          {/* Asymmetric Capabilities Composition */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
            {/* Capability 1: Adaptive Real-Time Technical Simulation (7 Cols) */}
            <div className="lg:col-span-7 bg-[#FFFFFF] border border-[#D8D2C5] rounded-xl p-6 sm:p-8 shadow-[0_2px_12px_-3px_rgba(33,26,22,0.04)] flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-[#ECE7DD] text-[#211A16] flex items-center justify-center font-mono font-bold text-xs">
                    01
                  </div>
                  <Badge variant="espresso" size="xs">
                    ACTIVE ENGINE
                  </Badge>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg sm:text-xl font-semibold text-[#211A16] tracking-tight">
                    Adaptive AI Technical Rounds
                  </h3>
                  <p className="text-xs sm:text-[13.5px] text-[#6B635B] leading-relaxed">
                    Unlike static question banks, KNOW2SHOW dynamically reacts to your spoken answers. The interviewer probes deep-dive edge cases when you succeed, or guides you to first principles when an architectural gap is detected.
                  </p>
                </div>
              </div>

              {/* Supporting Product Feature Snippet */}
              <div className="p-4 bg-[#FAF9F5] border border-[#E2DDD3] rounded-lg space-y-2">
                <div className="flex items-center justify-between text-[10.5px] font-mono text-[#968E85] uppercase">
                  <span>Adaptive State Machine</span>
                  <span className="text-[#211A16] font-semibold">Dynamic Follow-Up Logic</span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] font-mono text-center">
                  <div className="p-2 bg-white border border-[#E2DDD3] rounded text-[#211A16]">
                    STAR Framing
                  </div>
                  <div className="p-2 bg-white border border-[#E2DDD3] rounded text-[#211A16]">
                    Trade-Off Depth
                  </div>
                  <div className="p-2 bg-white border border-[#E2DDD3] rounded text-[#211A16]">
                    Edge Probing
                  </div>
                </div>
              </div>
            </div>

            {/* Capability 2: Profile & Job Spec Calibration (5 Cols) */}
            <div className="lg:col-span-5 bg-[#FFFFFF] border border-[#D8D2C5] rounded-xl p-6 sm:p-8 shadow-[0_2px_12px_-3px_rgba(33,26,22,0.04)] flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-[#ECE7DD] text-[#211A16] flex items-center justify-center font-mono font-bold text-xs">
                    02
                  </div>
                  <Badge variant="neutral" size="xs">
                    CALIBRATION
                  </Badge>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg sm:text-xl font-semibold text-[#211A16] tracking-tight">
                    Target Role Gap Parsing
                  </h3>
                  <p className="text-xs sm:text-[13.5px] text-[#6B635B] leading-relaxed">
                    Upload your candidate resume and target job descriptions. The system identifies exactly what critical competencies your profile is missing before you practice.
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#E2DDD3]">
                <div className="flex items-center gap-2 text-xs text-[#211A16]">
                  <CheckCircle2 className="w-4 h-4 text-[#211A16] shrink-0" />
                  <span>Resume technology extraction</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#211A16]">
                  <CheckCircle2 className="w-4 h-4 text-[#211A16] shrink-0" />
                  <span>Missing critical skill radar</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#211A16]">
                  <CheckCircle2 className="w-4 h-4 text-[#211A16] shrink-0" />
                  <span>Rigor &amp; seniority calibration</span>
                </div>
              </div>
            </div>

            {/* Capability 3: Granular Turn Scoring (5 Cols) */}
            <div className="lg:col-span-5 bg-[#FFFFFF] border border-[#D8D2C5] rounded-xl p-6 sm:p-8 shadow-[0_2px_12px_-3px_rgba(33,26,22,0.04)] flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-[#ECE7DD] text-[#211A16] flex items-center justify-center font-mono font-bold text-xs">
                    03
                  </div>
                  <Badge variant="neutral" size="xs">
                    RUBRIC EVALUATION
                  </Badge>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg sm:text-xl font-semibold text-[#211A16] tracking-tight">
                    Objective Rubric Scoring
                  </h3>
                  <p className="text-xs sm:text-[13.5px] text-[#6B635B] leading-relaxed">
                    Receive standardized 0–100 scores for every individual turn, evaluating technical depth, conciseness, and structural delivery rather than generic opinions.
                  </p>
                </div>
              </div>

              <div className="p-3.5 bg-[#FAF9F5] border border-[#E2DDD3] rounded-lg flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono uppercase text-[#968E85]">Evaluation Standard</span>
                  <p className="text-xs font-semibold text-[#211A16]">Senior / Staff Rubric</p>
                </div>
                <span className="font-mono text-sm font-bold text-[#137333]">92 / 100</span>
              </div>
            </div>

            {/* Capability 4: Continuous Rehearsal Tracking (7 Cols) */}
            <div className="lg:col-span-7 bg-[#FFFFFF] border border-[#D8D2C5] rounded-xl p-6 sm:p-8 shadow-[0_2px_12px_-3px_rgba(33,26,22,0.04)] flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-[#ECE7DD] text-[#211A16] flex items-center justify-center font-mono font-bold text-xs">
                    04
                  </div>
                  <Badge variant="espresso" size="xs">
                    MASTERY
                  </Badge>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg sm:text-xl font-semibold text-[#211A16] tracking-tight">
                    Readiness Trajectory &amp; Session History
                  </h3>
                  <p className="text-xs sm:text-[13.5px] text-[#6B635B] leading-relaxed">
                    Track your composite readiness over multiple rehearsal attempts. Review previous transcripts, compare performance across technical categories, and measure verifiable growth.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E2DDD3] flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-[#6B635B]">
                <span>Historical Session Audits</span>
                <span>•</span>
                <span>Behavioral &amp; Technical Meters</span>
                <span>•</span>
                <span>Actionable Takeaways</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. REPLAY / ANALYSIS SHOWCASE (PHASE 6C) */}
      {/* ========================================================================= */}
      <section id="replay-showcase" className="py-16 sm:py-24 lg:py-28 border-b border-[#E2DDD3] bg-[#ECE7DD]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16">
          {/* Section Introduction */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#D8D2C5] rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#211A16]" />
              <span className="text-[10.5px] font-mono font-semibold uppercase tracking-[0.18em] text-[#211A16]">
                POST-INTERVIEW INTELLIGENCE
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-medium tracking-tight text-[#211A16] leading-snug">
              The interview does not end when the session finishes.
            </h2>
            <p className="text-xs sm:text-sm text-[#6B635B] leading-relaxed max-w-xl mx-auto">
              Real improvement happens during the replay. Inspect exactly what was said, how the AI evaluated your tradeoffs, and what critical points were missed.
            </p>
          </div>

          {/* Realistic Turn Replay Showcase Card */}
          <div className="max-w-4xl mx-auto bg-[#FFFFFF] border-2 border-[#211A16] rounded-xl p-6 sm:p-8 shadow-[0_4px_24px_-4px_rgba(33,26,22,0.08)] space-y-6 relative">
            {/* Top Showcase Banner */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E2DDD3]">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-md bg-[#211A16] text-[#F7F5F0] font-mono font-bold text-xs flex items-center justify-center">
                  03
                </span>
                <div>
                  <span className="text-[10.5px] font-mono uppercase tracking-wider text-[#968E85]">
                    TURN REPLAY AUDIT
                  </span>
                  <h4 className="text-xs sm:text-sm font-semibold text-[#211A16]">
                    System Architecture &bull; Concurrency &bull; Distributed Cache
                  </h4>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-[#E6F4EA] border border-[#CEEAD6] text-[#137333] text-xs font-mono font-bold rounded">
                  Score: 88/100
                </span>
                <span className="text-[11px] font-mono text-[#968E85]">
                  <Clock className="w-3 h-3 inline mr-1 text-[#6B635B]" />
                  1m 45s
                </span>
              </div>
            </div>

            {/* 1. Question Prompt */}
            <div className="p-4 bg-[#FAF9F5] border border-[#E2DDD3] rounded-lg space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#968E85] font-semibold">
                AI QUESTION PROMPT
              </span>
              <p className="text-xs sm:text-sm font-medium text-[#211A16] leading-relaxed">
                "How do you mitigate cache stampede and ensure eventual consistency under 50k concurrent writes?"
              </p>
            </div>

            {/* 2. Candidate Response Transcript */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#6B635B] font-semibold flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#968E85]" />
                CANDIDATE RESPONSE TRANSCRIPT
              </span>
              <div className="p-4 bg-white border border-[#D8D2C5] rounded-lg text-xs sm:text-[13px] text-[#211A16] leading-relaxed font-sans">
                "To mitigate cache stampedes, I implement distributed mutex locking with Redis setnx so only one worker queries the database on miss. For high-write consistency, I use an asynchronous event-driven queue with write-behind caching to decouple ingestion from persistence."
              </div>
            </div>

            {/* 3. AI Turn Evaluation */}
            <div className="space-y-3 pt-1">
              <AiInsightBlock
                title="AI RUBRIC DIAGNOSIS"
                context="Turn 03 Evaluation"
                className="p-4 sm:p-5"
              >
                <p className="text-xs sm:text-[13px] text-[#211A16] leading-relaxed">
                  Strong explanation of mutex locking and probabilistic early expiration. Demonstrated solid mastery of eventual consistency concepts.
                </p>
              </AiInsightBlock>

              {/* Strengths vs Missing Concepts Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Strengths */}
                <div className="p-3.5 bg-[#FAF9F5] border border-[#E2DDD3] rounded-lg space-y-1.5">
                  <span className="text-[10.5px] font-mono uppercase tracking-wider text-[#137333] font-semibold flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#137333]" />
                    Articulated Well
                  </span>
                  <ul className="space-y-1 text-xs text-[#211A16]">
                    <li>• Distributed mutex lock implementation</li>
                    <li>• Decoupling with write-behind queue</li>
                  </ul>
                </div>

                {/* Missing Concepts */}
                <div className="p-3.5 bg-[#FAF9F5] border border-[#E2DDD3] rounded-lg space-y-1.5">
                  <span className="text-[10.5px] font-mono uppercase tracking-wider text-[#9B2C2C] font-semibold flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-[#9B2C2C]" />
                    Missing Concepts &amp; Gaps
                  </span>
                  <ul className="space-y-1 text-xs text-[#211A16]">
                    <li>• Network partition failover recovery</li>
                    <li>• Explicit failure mode for broker downtime</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Replay Takeaway Footnote */}
            <div className="pt-3 border-t border-[#E2DDD3] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-mono text-[#6B635B]">
              <span>Next Practice Target: Edge-Case Failure Handling</span>
              <span className="text-[#211A16] font-semibold">Continuous Diagnostic Loop &rarr;</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. FINAL CALL TO ACTION (PHASE 6C) */}
      {/* ========================================================================= */}
      <section className="py-20 sm:py-28 lg:py-32 border-b border-[#E2DDD3] bg-[#F7F5F0]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#ECE7DD] border border-[#D8D2C5] rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#211A16]" />
            <span className="text-[10.5px] font-mono font-semibold uppercase tracking-[0.18em] text-[#211A16]">
              READY TO PRACTICE
            </span>
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-medium tracking-tight text-[#211A16] leading-[1.16]">
              Know what you know.<br />Show what you can do.
            </h2>
            <p className="text-sm sm:text-base text-[#6B635B] max-w-xl mx-auto leading-relaxed">
              Step into an adaptive technical round calibrated specifically for your target role. Receive immediate diagnostic replay and build genuine interview conviction.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link href={primaryCtaHref}>
              <Button
                variant="primary"
                size="lg"
                rightIcon={ArrowRight}
                className="w-full sm:w-auto text-xs sm:text-[13px] tracking-[0.14em] font-semibold py-3.5 px-8"
              >
                Launch Interview Cockpit
              </Button>
            </Link>

            <Link href={secondaryCtaHref}>
              <Button
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto text-xs sm:text-[13px] tracking-[0.14em] font-medium py-3.5 px-8"
              >
                Configure Candidate Profile
              </Button>
            </Link>
          </div>

          <div className="pt-3 text-[11px] font-mono text-[#968E85]">
            Calibrated for technical roles &bull; Immediate turn-level evaluation
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. MINIMAL EDITORIAL FOOTER (PHASE 6C) */}
      {/* ========================================================================= */}
      <footer className="py-12 sm:py-16 bg-[#F7F5F0] border-t border-[#E2DDD3]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
            {/* Column 1: Brand & Positioning (5 Cols) */}
            <div className="md:col-span-5 space-y-3">
              <Link href="/" className="inline-flex items-center gap-2.5 group select-none">
                <div className="w-6 h-5 rounded-[4px] bg-[#211A16] flex items-center justify-center gap-1 shrink-0 group-hover:bg-[#352B25] transition-colors">
                  <span className="w-1 h-1 rounded-full bg-[#F7F5F0]" />
                  <span className="w-1 h-1 rounded-full bg-[#F7F5F0]" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[13px] font-bold tracking-[0.14em] text-[#211A16] leading-none">
                    KNOW2SHOW
                  </span>
                  <span className="text-[8.5px] font-mono tracking-[0.22em] text-[#968E85] uppercase leading-tight mt-0.5">
                    AI INTERVIEW REPLAY
                  </span>
                </div>
              </Link>
              <p className="text-xs text-[#6B635B] leading-relaxed max-w-sm">
                The continuous interview rehearsal platform that bridges what candidates know with how they perform under pressure.
              </p>
            </div>

            {/* Column 2: Product Links (3 Cols) */}
            <div className="md:col-span-3 space-y-2.5">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#211A16]">
                Product
              </span>
              <ul className="space-y-2 text-xs text-[#6B635B]">
                <li>
                  <Link href="/interview/setup" className="hover:text-[#211A16] transition-colors">
                    Interview Cockpit
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-[#211A16] transition-colors">
                    Performance Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/onboarding" className="hover:text-[#211A16] transition-colors">
                    Target Role Calibration
                  </Link>
                </li>
                <li>
                  <Link href="#methodology" className="hover:text-[#211A16] transition-colors">
                    The 4-Stage Loop
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Platform & Auth (4 Cols) */}
            <div className="md:col-span-4 space-y-2.5">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#211A16]">
                Platform &amp; Access
              </span>
              <ul className="space-y-2 text-xs text-[#6B635B]">
                <li>
                  <Link href="/auth/signin" className="hover:text-[#211A16] transition-colors">
                    Candidate Sign In / Register
                  </Link>
                </li>
                <li>
                  <Link href="/onboarding" className="hover:text-[#211A16] transition-colors">
                    Resume &amp; Spec Parser
                  </Link>
                </li>
                <li>
                  <Link href="#capabilities" className="hover:text-[#211A16] transition-colors">
                    Adaptive Evaluation Engine
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright & Status */}
          <div className="pt-8 border-t border-[#E2DDD3] flex flex-col sm:flex-row items-center justify-between gap-3 text-[10.5px] font-mono text-[#968E85] uppercase tracking-wider">
            <span>&copy; {new Date().getFullYear()} KNOW2SHOW &bull; ALL RIGHTS RESERVED</span>
            <span>CALIBRATED FOR HIGH-STAKES INTERVIEW PERFORMANCE</span>
          </div>
        </div>
      </footer>
    </div>
  );
}