"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Camera,
  CameraOff,
  Mic,
  MicOff,
  Video,
  Clock,
  HelpCircle,
  Sparkles,
  Zap,
  Target,
  Users,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Play,
  Layers,
  Award,
  Radio,
  Sliders,
} from "lucide-react";
import { useMediaPermissions } from "@/hooks/useMediaPermissions";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const INTERVIEW_TYPES = [
  {
    id: "MIXED",
    title: "Mixed Round",
    badge: "Recommended",
    icon: Sparkles,
    description: "Balanced simulation covering engineering fundamentals, system architecture, and behavioral trade-offs.",
  },
  {
    id: "TECHNICAL",
    title: "Technical Deep-Dive",
    badge: "Core Stack",
    icon: Zap,
    description: "In-depth probing of language mechanics, framework internals, algorithms, and technical gap areas.",
  },
  {
    id: "BEHAVIORAL",
    title: "Behavioral & Leadership",
    badge: "STAR Method",
    icon: Target,
    description: "Situational scenarios, leadership dynamics, project trade-offs, ownership, and conflict resolution.",
  },
  {
    id: "HR",
    title: "HR & Culture Screening",
    badge: "Culture Fit",
    icon: Users,
    description: "Career motivation, communication style, collaboration habits, and organizational alignment.",
  },
];

const DIFFICULTIES = [
  { id: "EASY", label: "Easy", desc: "Core basics & foundational" },
  { id: "MEDIUM", label: "Medium", desc: "Standard industry bar" },
  { id: "HARD", label: "Hard", desc: "Senior engineer depth" },
  { id: "FAANG_LEVEL", label: "FAANG Level", desc: "Top-tier scale & rigor" },
];

const QUESTION_COUNTS = [
  { count: 3, label: "3 Questions", desc: "~15 min sprint" },
  { count: 5, label: "5 Questions", desc: "~30 min standard" },
  { count: 8, label: "8 Questions", desc: "~45 min deep-dive" },
  { count: 10, label: "10 Questions", desc: "~60 min marathon" },
];

const DURATIONS = [
  { minutes: 15, label: "15 Mins", desc: "Fast pacing" },
  { minutes: 30, label: "30 Mins", desc: "Standard round" },
  { minutes: 45, label: "45 Mins", desc: "Comprehensive" },
  { minutes: 60, label: "60 Mins", desc: "Full session" },
];

export default function InterviewSetupPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchError, setLaunchError] = useState("");

  // Configuration State
  const [interviewType, setInterviewType] = useState("MIXED");
  const [difficulty, setDifficulty] = useState("MEDIUM");
  const [questionCount, setQuestionCount] = useState(5);
  const [durationMinutes, setDurationMinutes] = useState(30);

  const videoPreviewRef = useRef(null);

  // Hardware hook
  const {
    stream,
    videoEnabled,
    audioEnabled,
    hasPermission,
    isRequesting,
    permissionError,
    audioLevel,
    requestMedia,
    stopMedia,
    toggleVideo,
    toggleAudio,
  } = useMediaPermissions({ initialVideo: true, initialAudio: true });

  // Attach media stream to preview video tag
  useEffect(() => {
    if (videoPreviewRef.current && stream) {
      videoPreviewRef.current.srcObject = stream;
    }
  }, [stream]);

  // Request media on initial mount
  useEffect(() => {
    requestMedia(true, true);
  }, [requestMedia]);

  // Load Profile to pre-populate difficulty and target role details
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin");
      return;
    }

    if (status === "authenticated") {
      fetch("/api/profile")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.profile) {
            setProfile(data.profile);
            if (data.profile.targetRole?.difficulty) {
              setDifficulty(data.profile.targetRole.difficulty);
            }
          } else {
            router.push("/onboarding");
          }
        })
        .catch((err) => {
          console.error("Profile fetch error:", err);
          setLaunchError("Could not load target role settings.");
        })
        .finally(() => setLoading(false));
    }
  }, [status, router]);

  const handleLaunchSession = async () => {
    try {
      setIsLaunching(true);
      setLaunchError("");

      const payload = {
        targetRoleId: profile?.targetRole?.id,
        interviewType,
        difficulty,
        questionCount,
        totalDurationMinutes: durationMinutes,
        enableVideo: videoEnabled,
        enableAudio: audioEnabled,
      };

      const res = await fetch("/api/interview/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success && data.sessionId) {
        // Stop local preview media before entering room
        stopMedia();
        router.push(`/interview/${data.sessionId}`);
      } else {
        setLaunchError(data.error || "Failed to initialize interview session.");
        setIsLaunching(false);
      }
    } catch (err) {
      console.error("Session launch error:", err);
      setLaunchError("Network error while launching interview session.");
      setIsLaunching(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <PageContainer size="wide">
        <div className="min-h-[65vh] flex flex-col items-center justify-center text-[#6B635B]">
          <Loader2 className="w-8 h-8 animate-spin text-[#211A16] mb-3" />
          <p className="text-xs font-mono tracking-widest uppercase text-[#968E85]">
            Preparing interview pre-flight environment...
          </p>
        </div>
      </PageContainer>
    );
  }

  const targetRole = profile?.targetRole;

  return (
    <PageContainer size="wide" className="py-6 sm:py-8 space-y-7">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#D8D2C5]">
        <div className="space-y-1.5">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-[#6B635B] hover:text-[#211A16] transition-colors mb-1 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </Link>

          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-medium text-[#211A16] tracking-tight">
              Interview Pre-Flight & Setup
            </h1>
          </div>

          <p className="text-xs sm:text-[13.5px] text-[#6B635B]">
            Calibrated for:{" "}
            <span className="text-[#211A16] font-semibold">
              {targetRole?.roleTitle || "Software Engineer"}
            </span>{" "}
            • <span className="font-mono text-[12px]">{targetRole?.companyType || "TECH"} Tier</span>
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Badge variant="espresso" size="md">
            Cockpit Checkpoint
          </Badge>
        </div>
      </div>

      {/* Supporting AI Pre-Flight Banner (Level 2 Surface) */}
      <div className="bg-[#ECE7DD] border border-[#D8D2C5] rounded-lg p-4 sm:p-5 space-y-2">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded bg-[#211A16] text-[#F7F5F0] flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#211A16]">
              Adaptive Evaluation Engine Armed
            </h3>
            <p className="text-[11.5px] text-[#6B635B]">
              The interviewer will actively tailor question difficulty, follow-ups, and grading rubrics in real-time.
            </p>
          </div>
        </div>
      </div>

      {/* Launch Error Alert */}
      {launchError && (
        <div className="p-4 bg-[#F9ECEC] border border-[#ECC8C8] text-[#9B2C2C] text-xs font-mono rounded-lg flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{launchError}</span>
        </div>
      )}

      {/* Main Grid: Left 7 Cols (Config) & Right 5 Cols (Hardware Pre-Flight) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
        {/* Left Column: Configuration Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Select Interview Type */}
          <div className="bg-white border border-[#D8D2C5] rounded-lg p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#E2DDD3]">
              <Layers className="w-4 h-4 text-[#211A16]" />
              <h2 className="text-xs font-mono font-bold uppercase tracking-[0.14em] text-[#211A16]">
                01 • Interview Round Focus
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {INTERVIEW_TYPES.map((type) => {
                const Icon = type.icon;
                const isSelected = interviewType === type.id;
                return (
                  <div
                    key={type.id}
                    onClick={() => setInterviewType(type.id)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all select-none space-y-2 ${
                      isSelected
                        ? "bg-[#FAF9F5] border-[#211A16] ring-1 ring-[#211A16] shadow-xs"
                        : "bg-white border-[#D8D2C5] hover:border-[#211A16]/50 hover:bg-[#FAF9F5]/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div
                        className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${
                          isSelected ? "bg-[#211A16] text-[#F7F5F0]" : "bg-[#EFECE4] text-[#6B635B]"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      {type.badge && (
                        <Badge variant={isSelected ? "espresso" : "neutral"} size="xs">
                          {type.badge}
                        </Badge>
                      )}
                    </div>

                    <div>
                      <h3 className="text-xs sm:text-[13px] font-semibold text-[#211A16]">
                        {type.title}
                      </h3>
                      <p className="text-[11.5px] text-[#6B635B] mt-0.5 leading-relaxed line-clamp-2">
                        {type.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Rigor & Difficulty */}
          <div className="bg-white border border-[#D8D2C5] rounded-lg p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#E2DDD3]">
              <Target className="w-4 h-4 text-[#211A16]" />
              <h2 className="text-xs font-mono font-bold uppercase tracking-[0.14em] text-[#211A16]">
                02 • Target Interview Rigor
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {DIFFICULTIES.map((diff) => {
                const isSelected = difficulty === diff.id;
                return (
                  <button
                    key={diff.id}
                    type="button"
                    onClick={() => setDifficulty(diff.id)}
                    className={`p-3.5 rounded-lg border text-left transition-all ${
                      isSelected
                        ? "bg-[#211A16] border-[#211A16] text-[#F7F5F0] shadow-xs"
                        : "bg-white border-[#D8D2C5] text-[#6B635B] hover:border-[#211A16]/50 hover:text-[#211A16]"
                    }`}
                  >
                    <p
                      className={`text-xs font-mono font-bold uppercase ${
                        isSelected ? "text-[#F7F5F0]" : "text-[#211A16]"
                      }`}
                    >
                      {diff.label}
                    </p>
                    <p
                      className={`text-[10.5px] mt-0.5 truncate leading-tight ${
                        isSelected ? "text-[#D8D2C5]" : "text-[#6B635B]"
                      }`}
                    >
                      {diff.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Pacing & Question Volume */}
          <div className="bg-white border border-[#D8D2C5] rounded-lg p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#E2DDD3]">
              <Sliders className="w-4 h-4 text-[#211A16]" />
              <h2 className="text-xs font-mono font-bold uppercase tracking-[0.14em] text-[#211A16]">
                03 • Session Pacing & Volume
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Question Count */}
              <div className="space-y-2">
                <label className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#6B635B] flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-[#968E85]" />
                  Question Count
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {QUESTION_COUNTS.map((item) => {
                    const isSelected = questionCount === item.count;
                    return (
                      <button
                        key={item.count}
                        type="button"
                        onClick={() => setQuestionCount(item.count)}
                        className={`p-2.5 rounded-lg border text-center transition-all ${
                          isSelected
                            ? "bg-[#211A16] text-[#F7F5F0] border-[#211A16] font-semibold shadow-xs"
                            : "bg-white border-[#D8D2C5] text-[#6B635B] hover:border-[#211A16]/50 text-xs"
                        }`}
                      >
                        <p className="text-xs font-mono font-medium">{item.label}</p>
                        <p
                          className={`text-[10px] ${
                            isSelected ? "text-[#D8D2C5]" : "text-[#968E85]"
                          }`}
                        >
                          {item.desc.split(" ")[0]}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Session Duration */}
              <div className="space-y-2">
                <label className="text-[11px] font-mono font-medium uppercase tracking-wider text-[#6B635B] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#968E85]" />
                  Session Duration
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {DURATIONS.map((dur) => {
                    const isSelected = durationMinutes === dur.minutes;
                    return (
                      <button
                        key={dur.minutes}
                        type="button"
                        onClick={() => setDurationMinutes(dur.minutes)}
                        className={`p-2.5 rounded-lg border text-center transition-all ${
                          isSelected
                            ? "bg-[#211A16] text-[#F7F5F0] border-[#211A16] font-semibold shadow-xs"
                            : "bg-white border-[#D8D2C5] text-[#6B635B] hover:border-[#211A16]/50 text-xs"
                        }`}
                      >
                        <p className="text-xs font-mono font-medium">{dur.label}</p>
                        <p
                          className={`text-[10px] ${
                            isSelected ? "text-[#D8D2C5]" : "text-[#968E85]"
                          }`}
                        >
                          {dur.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Hardware Pre-Flight Cockpit */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-[#D8D2C5] rounded-lg p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2DDD3]">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-[#211A16]" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-[0.14em] text-[#211A16]">
                  Hardware Readiness
                </h3>
              </div>

              <Badge
                variant={hasPermission ? "success" : "warning"}
                size="sm"
                hasDot
              >
                {hasPermission ? "READY" : "CHECK REQUIRED"}
              </Badge>
            </div>

            {/* Video Preview Box */}
            <div className="relative aspect-video w-full bg-[#FAF9F5] rounded-lg overflow-hidden border border-[#D8D2C5] flex items-center justify-center">
              {/* Always keep video element mounted so MediaStream never drops */}
              <video
                ref={videoPreviewRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover transform -scale-x-100 transition-opacity duration-200 ${
                  videoEnabled && stream ? "opacity-100 block" : "opacity-0 hidden"
                }`}
              />

              {/* Disabled / Standby Overlay */}
              {(!videoEnabled || !stream) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-2 p-4 bg-[#FAF9F5]">
                  <div className="w-10 h-10 rounded-full bg-[#EFECE4] border border-[#D8D2C5] text-[#6B635B] flex items-center justify-center">
                    <CameraOff className="w-5 h-5 text-[#6B635B]" />
                  </div>
                  <p className="text-xs text-[#6B635B] font-mono">
                    {!videoEnabled ? "Camera muted" : "Initializing camera feed..."}
                  </p>
                </div>
              )}

              {/* Status Badge Overlay */}
              <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 bg-[#211A16]/90 text-[#F7F5F0] px-2.5 py-1 rounded text-[10px] font-mono backdrop-blur-xs z-10">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    videoEnabled && stream ? "bg-emerald-400 animate-pulse" : "bg-zinc-400"
                  }`}
                />
                <span>{videoEnabled && stream ? "LIVE FEED" : "CAMERA MUTED"}</span>
              </div>
            </div>

            {permissionError && (
              <div className="p-3 bg-[#FAF1E4] border border-[#EBD7BE] text-[#9E651E] text-xs font-mono rounded-lg flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{permissionError}</p>
              </div>
            )}

            {/* Microphone Activity Meter */}
            <div className="space-y-1.5 p-3.5 bg-[#FAF9F5] border border-[#E2DDD3] rounded-lg">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#6B635B] font-mono text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-[#211A16]" />
                  Mic Input Level
                </span>
                <span className="text-[#211A16] font-mono text-[11px] font-medium">{audioLevel}%</span>
              </div>
              <div className="w-full bg-[#EFECE4] rounded-full h-2 overflow-hidden p-0.5 border border-[#D8D2C5]">
                <div
                  className="h-full rounded-full bg-[#211A16] transition-all duration-75"
                  style={{ width: `${Math.min(100, audioLevel * 1.5)}%` }}
                />
              </div>
            </div>

            {/* Media Toggles */}
            <div className="grid grid-cols-2 gap-2.5">
              <Button
                variant={videoEnabled ? "secondary" : "outline"}
                size="sm"
                onClick={toggleVideo}
                leftIcon={videoEnabled ? Camera : CameraOff}
                className="text-[11px]"
              >
                {videoEnabled ? "Camera ON" : "Camera OFF"}
              </Button>

              <Button
                variant={audioEnabled ? "secondary" : "outline"}
                size="sm"
                onClick={toggleAudio}
                leftIcon={audioEnabled ? Mic : MicOff}
                className="text-[11px]"
              >
                {audioEnabled ? "Mic ON" : "Mic Muted"}
              </Button>
            </div>

            {/* Session Config Blueprint Box */}
            <div className="p-4 bg-[#FAF9F5] border border-[#D8D2C5] rounded-lg space-y-2">
              <p className="font-mono text-[10.5px] uppercase tracking-wider text-[#968E85] font-semibold">
                Pre-Flight Blueprint Summary
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-[#E2DDD3]">
                <div>
                  <span className="text-[#968E85] text-[11px] font-mono">Round:</span>{" "}
                  <p className="font-semibold text-[#211A16]">{interviewType}</p>
                </div>
                <div>
                  <span className="text-[#968E85] text-[11px] font-mono">Rigor:</span>{" "}
                  <p className="font-semibold text-[#211A16]">{difficulty.replace("_", " ")}</p>
                </div>
                <div>
                  <span className="text-[#968E85] text-[11px] font-mono">Questions:</span>{" "}
                  <p className="font-semibold text-[#211A16]">{questionCount} Blueprints</p>
                </div>
                <div>
                  <span className="text-[#968E85] text-[11px] font-mono">Time Limit:</span>{" "}
                  <p className="font-semibold text-[#211A16]">{durationMinutes} Mins</p>
                </div>
              </div>
            </div>

            {/* Launch CTA */}
            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={handleLaunchSession}
              isLoading={isLaunching}
              leftIcon={Play}
              className="w-full py-4 text-xs sm:text-[13px] tracking-[0.14em] font-semibold"
            >
              Enter Live Interview Room
            </Button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
