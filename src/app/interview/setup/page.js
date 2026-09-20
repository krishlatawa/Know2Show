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
  BrainCircuit,
  Target,
  Users,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Play,
} from "lucide-react";
import { useMediaPermissions } from "@/hooks/useMediaPermissions";

const INTERVIEW_TYPES = [
  {
    id: "MIXED",
    title: "Mixed Round",
    badge: "Recommended",
    icon: Sparkles,
    description: "Balanced onsite simulation covering technical fundamentals, system design, and behavioral scenarios.",
    color: "from-indigo-600 to-purple-600",
  },
  {
    id: "TECHNICAL",
    title: "Technical Deep-Dive",
    badge: "Core Stack",
    icon: Zap,
    description: "In-depth questions probing coding fundamentals, frameworks, architecture, and skill gap areas.",
    color: "from-blue-600 to-cyan-600",
  },
  {
    id: "BEHAVIORAL",
    title: "Behavioral & Leadership",
    badge: "STAR Method",
    icon: Target,
    description: "Conflict resolution, past project trade-offs, ownership, leadership, and situational judgment.",
    color: "from-amber-600 to-orange-600",
  },
  {
    id: "HR",
    title: "HR & Culture Screening",
    badge: "Fit & Screening",
    icon: Users,
    description: "Motivation, communication style, cultural alignment, work style, and career trajectory.",
    color: "from-emerald-600 to-teal-600",
  },
];

const DIFFICULTIES = [
  { id: "EASY", label: "Easy", desc: "Entry-level & core basics" },
  { id: "MEDIUM", label: "Medium", desc: "Standard industry level" },
  { id: "HARD", label: "Hard", desc: "Senior engineer depth" },
  { id: "FAANG_LEVEL", label: "FAANG Level", desc: "Top-tier bar & scale" },
];

const QUESTION_COUNTS = [
  { count: 3, label: "3 Questions", desc: "~15 min sprint" },
  { count: 5, label: "5 Questions", desc: "~30 min standard" },
  { count: 8, label: "8 Questions", desc: "~45 min comprehensive" },
  { count: 10, label: "10 Questions", desc: "~60 min marathon" },
];

const DURATIONS = [
  { minutes: 15, label: "15 Mins" },
  { minutes: 30, label: "30 Mins" },
  { minutes: 45, label: "45 Mins" },
  { minutes: 60, label: "60 Mins" },
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
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-3" />
        <p className="text-sm font-medium">Preparing interview pre-flight environment...</p>
      </div>
    );
  }

  const targetRole = profile?.targetRole;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="space-y-1">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-2 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <BrainCircuit className="w-7 h-7 text-indigo-400" />
              Interview Session Pre-Flight & Setup
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Targeting:{" "}
              <span className="text-indigo-300 font-bold">
                {targetRole?.roleTitle || "Software Engineer"}
              </span>{" "}
              at <span className="text-slate-200 font-semibold">{targetRole?.companyType || "Tech"}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold rounded-lg">
              Pre-Flight Check
            </span>
          </div>
        </div>

        {launchError && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            {launchError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Configuration Controls (7 Cols) */}
          <div className="lg:col-span-7 space-y-8">
            {/* Section 1: Select Interview Type */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                1. Select Interview Round Type
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {INTERVIEW_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isSelected = interviewType === type.id;
                  return (
                    <div
                      key={type.id}
                      onClick={() => setInterviewType(type.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all relative select-none ${
                        isSelected
                          ? "bg-slate-900/90 border-indigo-500 ring-2 ring-indigo-500/40 shadow-lg shadow-indigo-500/10"
                          : "bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div
                          className={`w-8 h-8 rounded-xl bg-gradient-to-br ${type.color} text-white flex items-center justify-center shadow-md`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        {type.badge && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                            {type.badge}
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-bold text-white">{type.title}</h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                        {type.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Difficulty Level */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-purple-400" />
                2. Select Difficulty Level
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {DIFFICULTIES.map((diff) => {
                  const isSelected = difficulty === diff.id;
                  return (
                    <button
                      key={diff.id}
                      type="button"
                      onClick={() => setDifficulty(diff.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "bg-purple-950/40 border-purple-500 text-white shadow-md shadow-purple-500/10 ring-1 ring-purple-500/40"
                          : "bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                      }`}
                    >
                      <p className="text-xs font-extrabold uppercase">{diff.label}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">{diff.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 3: Questions & Pacing Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-slate-800/80">
              {/* Question Count */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                  3. Question Count
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {QUESTION_COUNTS.map((item) => (
                    <button
                      key={item.count}
                      type="button"
                      onClick={() => setQuestionCount(item.count)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        questionCount === item.count
                          ? "bg-indigo-600 text-white font-bold border-indigo-500 shadow-md shadow-indigo-500/20"
                          : "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 text-xs font-medium"
                      }`}
                    >
                      <span className="text-xs">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Limit */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  4. Time Limit
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {DURATIONS.map((dur) => (
                    <button
                      key={dur.minutes}
                      type="button"
                      onClick={() => setDurationMinutes(dur.minutes)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        durationMinutes === dur.minutes
                          ? "bg-emerald-600 text-white font-bold border-emerald-500 shadow-md shadow-emerald-500/20"
                          : "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 text-xs font-medium"
                      }`}
                    >
                      <span className="text-xs">{dur.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Hardware Pre-Flight Live Preview (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Video className="w-4 h-4 text-indigo-400" />
                  Hardware & Sensor Pre-Flight
                </h3>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    hasPermission
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      hasPermission ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                    }`}
                  />
                  {hasPermission ? "Devices Ready" : "Standby"}
                </span>
              </div>

              {/* Video Preview Box */}
              <div className="relative aspect-video w-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center shadow-inner">
                {/* Always keep video mounted so MediaStream is never disconnected */}
                <video
                  ref={videoPreviewRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover transform -scale-x-100 transition-opacity duration-300 ${
                    videoEnabled && stream ? "opacity-100 block" : "opacity-0 hidden"
                  }`}
                />

                {/* Disabled / Connecting Placeholder Overlay */}
                {(!videoEnabled || !stream) && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-2 p-4 bg-slate-950/90 backdrop-blur-sm animate-fadeIn">
                    <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center">
                      <CameraOff className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-xs text-slate-400 font-medium">
                      {!videoEnabled ? "Camera is turned off" : "Connecting camera feed..."}
                    </p>
                  </div>
                )}

                {/* Video status overlay */}
                <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-800 text-[11px] text-slate-300 z-10">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      videoEnabled && stream ? "bg-emerald-500 animate-pulse" : "bg-slate-500"
                    }`}
                  />
                  {videoEnabled && stream ? "Live Preview" : "Camera Muted"}
                </div>
              </div>

              {permissionError && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs rounded-xl flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                  <p className="leading-relaxed">{permissionError}</p>
                </div>
              )}

              {/* Microphone Activity Meter */}
              <div className="space-y-1.5 p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium flex items-center gap-1.5">
                    <Mic className="w-3.5 h-3.5 text-indigo-400" />
                    Mic Input Level
                  </span>
                  <span className="text-slate-300 font-mono text-[11px]">{audioLevel}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden p-0.5 border border-slate-700/50">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 transition-all duration-75"
                    style={{ width: `${audioLevel}%` }}
                  />
                </div>
              </div>

              {/* Hardware Toggles */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={toggleVideo}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    videoEnabled
                      ? "bg-slate-800 text-white border-slate-700 hover:bg-slate-750"
                      : "bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20"
                  }`}
                >
                  {videoEnabled ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
                  {videoEnabled ? "Camera ON" : "Camera OFF"}
                </button>

                <button
                  type="button"
                  onClick={toggleAudio}
                  className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    audioEnabled
                      ? "bg-slate-800 text-white border-slate-700 hover:bg-slate-750"
                      : "bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20"
                  }`}
                >
                  {audioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  {audioEnabled ? "Mic ON" : "Mic Muted"}
                </button>
              </div>

              {/* Session Summary Card */}
              <div className="p-4 bg-slate-950/90 border border-indigo-500/20 rounded-xl space-y-2 text-xs">
                <p className="font-bold text-white uppercase text-[11px] tracking-wider text-indigo-300">
                  Session Config Summary
                </p>
                <div className="grid grid-cols-2 gap-2 text-slate-300 pt-1">
                  <div>
                    <span className="text-slate-500">Round:</span>{" "}
                    <span className="font-semibold text-white">{interviewType}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Difficulty:</span>{" "}
                    <span className="font-semibold text-amber-300">{difficulty}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Questions:</span>{" "}
                    <span className="font-semibold text-white">{questionCount} Blueprints</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Allocated Time:</span>{" "}
                    <span className="font-semibold text-emerald-300">{durationMinutes} Mins</span>
                  </div>
                </div>
              </div>

              {/* Launch CTA */}
              <button
                type="button"
                onClick={handleLaunchSession}
                disabled={isLaunching}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-indigo-500/25 transition-all transform active:scale-98 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLaunching ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Initializing AI Room...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    Launch Mock Interview Room
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
