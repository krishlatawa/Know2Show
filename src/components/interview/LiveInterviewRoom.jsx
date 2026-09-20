"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  BrainCircuit,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Play,
  Square,
  Send,
  Loader2,
  Volume2,
  VolumeX,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Clock,
  ArrowRight,
  RotateCcw,
  Award,
  ChevronDown,
  ChevronUp,
  Layers,
  Zap,
  HelpCircle,
  SkipForward,
} from "lucide-react";
import { useMediaPermissions } from "@/hooks/useMediaPermissions";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";

const DIFFICULTY_COLORS = {
  EASY: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  MEDIUM: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  HARD: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  FAANG_LEVEL: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

export default function LiveInterviewRoom({ initialSession }) {
  const router = useRouter();
  const [session, setSession] = useState(initialSession);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(
    initialSession?.currentQuestionIndex || 0
  );
  const [selectedQuestions] = useState(
    Array.isArray(initialSession?.selectedQuestions)
      ? initialSession.selectedQuestions
      : []
  );

  const [activeQuestion, setActiveQuestion] = useState(
    selectedQuestions[initialSession?.currentQuestionIndex || 0] || null
  );

  const [transcriptHistory, setTranscriptHistory] = useState(
    Array.isArray(initialSession?.transcript) ? initialSession.transcript : []
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState("");
  const [isComplete, setIsComplete] = useState(
    initialSession?.status === "COMPLETED"
  );
  const [feedbackSummary, setFeedbackSummary] = useState(
    initialSession?.feedbackSummary || null
  );
  const [showHistory, setShowHistory] = useState(false);

  // Per-question timer
  const [questionSeconds, setQuestionSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(true);

  const videoRef = useRef(null);
  const answerTextareaRef = useRef(null);

  // Hardware hook
  const {
    stream,
    videoEnabled,
    audioEnabled,
    audioLevel,
    requestMedia,
    stopMedia,
    toggleVideo,
    toggleAudio,
  } = useMediaPermissions({
    initialVideo: initialSession?.enableVideo ?? true,
    initialAudio: initialSession?.enableAudio ?? true,
  });

  // Speech Recognition & TTS hook
  const {
    isListening,
    transcript: spokenTranscript,
    interimTranscript,
    isSpeaking,
    isSupported: sttSupported,
    startListening,
    stopListening,
    resetTranscript,
    speakText,
    cancelSpeech,
  } = useSpeechRecognition();

  // Local answer draft
  const [answerDraft, setAnswerDraft] = useState("");

  // Sync spoken transcript to answer draft
  useEffect(() => {
    if (spokenTranscript) {
      setAnswerDraft(spokenTranscript);
    }
  }, [spokenTranscript]);

  // Attach webcam stream to video element
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Request hardware stream on mount
  useEffect(() => {
    requestMedia(
      initialSession?.enableVideo ?? true,
      initialSession?.enableAudio ?? true
    );

    return () => {
      stopMedia();
      cancelSpeech();
    };
  }, [requestMedia, stopMedia, cancelSpeech, initialSession]);

  // Timer interval for question
  useEffect(() => {
    let interval = null;
    if (timerActive && !isComplete) {
      interval = setInterval(() => {
        setQuestionSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, isComplete]);

  // Speak initial question on entry or when activeQuestion changes
  useEffect(() => {
    if (activeQuestion?.questionText && !isComplete) {
      const introText = activeQuestion.isFollowUp
        ? `Let me probe deeper into this. ${activeQuestion.questionText}`
        : `Question ${currentQuestionIndex + 1}. ${activeQuestion.questionText}`;

      speakText(introText);
    }
  }, [activeQuestion, currentQuestionIndex, isComplete, speakText]);

  // Format seconds to mm:ss
  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Handle Answer Submission
  const handleSubmitAnswer = async () => {
    const finalAnswer = answerDraft.trim();
    if (!finalAnswer) {
      setSubmissionError("Please speak or write your answer before submitting.");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmissionError("");
      stopListening();
      cancelSpeech();

      const payload = {
        sessionId: session.id,
        questionId: activeQuestion.id,
        answerText: finalAnswer,
        timeTakenSeconds: questionSeconds,
      };

      const res = await fetch("/api/interview/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to evaluate answer.");
      }

      // Update transcript history
      if (data.transcript) {
        setTranscriptHistory(data.transcript);
      }

      // Reset local answer draft & timer
      setAnswerDraft("");
      resetTranscript();
      setQuestionSeconds(0);

      // Check if session completed
      if (data.isComplete) {
        setIsComplete(true);
        setFeedbackSummary(data.feedbackSummary);
        speakText(
          "Great job! That concludes all questions for this session. I have compiled your executive interview report."
        );
      } else {
        // Transition to next question or follow-up
        if (data.nextQuestion) {
          setActiveQuestion(data.nextQuestion);
          setCurrentQuestionIndex(data.currentQuestionIndex);
        }
      }
    } catch (err) {
      console.error("Submission error:", err);
      setSubmissionError(err.message || "Error submitting answer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Skip Question
  const handleSkipQuestion = async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setSubmissionError("");
      stopListening();
      cancelSpeech();

      const payload = {
        sessionId: session.id,
        questionId: activeQuestion.id,
        answerText: "[Candidate opted to skip this question]",
        timeTakenSeconds: questionSeconds,
      };

      const res = await fetch("/api/interview/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to process skipped question.");
      }

      if (data.transcript) {
        setTranscriptHistory(data.transcript);
      }

      setAnswerDraft("");
      resetTranscript();
      setQuestionSeconds(0);

      if (data.isComplete) {
        setIsComplete(true);
        setFeedbackSummary(data.feedbackSummary);
        speakText(
          "That concludes all questions for this session. I have compiled your executive interview report."
        );
      } else {
        if (data.nextQuestion) {
          setActiveQuestion(data.nextQuestion);
          setCurrentQuestionIndex(data.currentQuestionIndex);
        }
      }
    } catch (err) {
      console.error("Skip error:", err);
      setSubmissionError(err.message || "Error skipping question.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle voice recording
  const handleToggleVoice = () => {
    if (isListening) {
      stopListening();
    } else {
      cancelSpeech();
      startListening();
    }
  };

  // Replay AI Question Voice
  const handleReplayQuestion = () => {
    if (activeQuestion?.questionText) {
      speakText(activeQuestion.questionText);
    }
  };

  // RENDER: Interview Completed Executive View
  if (isComplete) {
    const score = feedbackSummary?.overallScore || session?.overallScore || 0;
    const scoreColor =
      score >= 80
        ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
        : score >= 60
        ? "text-indigo-400 border-indigo-500/30 bg-indigo-500/10"
        : "text-amber-400 border-amber-500/30 bg-amber-500/10";

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 md:p-10 flex flex-col items-center justify-center animate-fadeIn">
        <div className="max-w-4xl w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 backdrop-blur-xl">
          {/* Header */}
          <div className="text-center space-y-3 border-b border-slate-800 pb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-2">
              <Award className="w-8 h-8" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Interview Session Completed!
            </h1>
            <p className="text-sm text-slate-400 max-w-lg mx-auto">
              Your responses have been processed through our Adaptive Evaluation
              Engine against industry-standard rubrics.
            </p>
          </div>

          {/* Overall Score Badge */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              className={`p-5 rounded-2xl border flex flex-col items-center justify-center text-center ${scoreColor}`}
            >
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Overall Score
              </span>
              <span className="text-4xl sm:text-5xl font-extrabold my-1">
                {score}%
              </span>
              <span className="text-xs font-medium">
                {score >= 80
                  ? "Strong Hire Candidate"
                  : score >= 60
                  ? "Qualified Candidate"
                  : "Needs Focused Prep"}
              </span>
            </div>

            <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950/60 flex flex-col justify-center space-y-2 sm:col-span-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                Executive Synthesis
              </span>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {feedbackSummary?.executiveSummary ||
                  "The candidate demonstrated fundamental competence across key technical domains with areas of strength in communication and core frameworks."}
              </p>
            </div>
          </div>

          {/* Strengths and Growth Areas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-2xl space-y-2">
              <h3 className="text-xs font-bold uppercase text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Top Strengths
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {(feedbackSummary?.topStrengths || feedbackSummary?.keyStrengths || [
                  "Clear structural articulation",
                  "Solid knowledge of core principles",
                ]).map((str, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-amber-950/20 border border-amber-500/20 rounded-2xl space-y-2">
              <h3 className="text-xs font-bold uppercase text-amber-400 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" /> High-Impact Focus Areas
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {(feedbackSummary?.criticalSkillGaps || feedbackSummary?.improvementAreas || [
                  "Deeper edge-case considerations",
                  "Benchmarking performance tradeoffs",
                ]).map((area, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold uppercase tracking-wider transition-all text-center"
            >
              Return to Dashboard
            </Link>

            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-extrabold uppercase tracking-wider shadow-lg shadow-indigo-500/20 transition-all text-center flex items-center justify-center gap-2"
            >
              Analyze Replay Breakdown <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totalQuestions = session?.questionCount || selectedQuestions.length || 1;
  const currentQuestionNumber = Math.min(
    totalQuestions,
    transcriptHistory.length + 1
  );
  const progressPercent = Math.min(
    100,
    Math.round((currentQuestionNumber / totalQuestions) * 100)
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header Bar */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-white leading-tight">
              Adaptive Live Room
            </h1>
            <p className="text-[11px] text-slate-400">
              Round: <span className="text-indigo-300 font-semibold">{session?.interviewType || "MIXED"}</span>
            </p>
          </div>
        </div>

        {/* Center Progress and Question Indicator */}
        <div className="hidden sm:flex flex-col items-center gap-1">
          <span className="text-xs font-bold text-slate-300 tracking-wider uppercase">
            Question {currentQuestionNumber} of {totalQuestions}
          </span>
          <div className="w-40 bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Right Status Controls */}
        <div className="flex items-center gap-3">
          {/* Pacing Clock */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-800/80 border border-slate-700 rounded-lg text-xs font-mono text-slate-300">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>{formatTime(questionSeconds)}</span>
          </div>

          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="px-3 py-1 text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 rounded-lg transition-all"
          >
            Exit Room
          </button>
        </div>
      </header>

      {/* Main Split Room Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: AI Interviewer Persona & Active Question (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* AI Avatar Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-indigo-500 flex items-center justify-center text-white shadow-lg ${
                      isSpeaking ? "ring-4 ring-indigo-500/30 animate-pulse" : ""
                    }`}
                  >
                    <BrainCircuit className="w-6 h-6" />
                  </div>
                  {isSpeaking && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                  )}
                </div>

                <div>
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    AI Lead Interviewer
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      Adaptive
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    {isSpeaking
                      ? "Speaking question prompt..."
                      : isListening
                      ? "Listening to candidate response..."
                      : "Awaiting answer submission"}
                  </p>
                </div>
              </div>

              {/* Sound / Replay Button */}
              <button
                type="button"
                onClick={handleReplayQuestion}
                disabled={isSpeaking}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all disabled:opacity-50"
                title="Re-read question"
              >
                {isSpeaking ? (
                  <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Audio Wave Visualizer Animation */}
            {isSpeaking && (
              <div className="flex items-center justify-center gap-1.5 py-2 bg-indigo-950/20 rounded-xl border border-indigo-500/20">
                <span className="w-1 bg-indigo-400 h-4 animate-bounce rounded-full" />
                <span className="w-1 bg-purple-400 h-7 animate-bounce rounded-full delay-75" />
                <span className="w-1 bg-indigo-300 h-5 animate-bounce rounded-full delay-150" />
                <span className="w-1 bg-purple-500 h-8 animate-bounce rounded-full delay-100" />
                <span className="w-1 bg-indigo-400 h-3 animate-bounce rounded-full" />
                <span className="text-[11px] font-mono text-indigo-300 ml-2">
                  Voice Synthesis Active
                </span>
              </div>
            )}
          </div>

          {/* Active Question Box */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                  {activeQuestion?.isFollowUp
                    ? "Deep-Dive Follow-Up"
                    : `Question #${currentQuestionIndex + 1}`}
                </span>
                {activeQuestion?.category && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {activeQuestion.category}
                  </span>
                )}
              </div>

              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                  DIFFICULTY_COLORS[activeQuestion?.difficulty || session?.difficulty] ||
                  DIFFICULTY_COLORS.MEDIUM
                }`}
              >
                {activeQuestion?.difficulty || session?.difficulty || "MEDIUM"}
              </span>
            </div>

            {/* Question Text */}
            <div className="space-y-2">
              <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                {activeQuestion?.questionText ||
                  "Please summarize your technical approach to building distributed applications."}
              </h3>
              {activeQuestion?.focusTopic && (
                <p className="text-xs text-slate-400">
                  <span className="text-slate-500">Focus Area:</span>{" "}
                  <span className="text-indigo-300 font-medium">
                    {activeQuestion.focusTopic}
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* Real-time Turn Feedback Accordion */}
          {transcriptHistory.length > 0 && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
              <button
                type="button"
                onClick={() => setShowHistory(!showHistory)}
                className="w-full flex items-center justify-between text-xs font-bold text-slate-300 hover:text-white transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  Past Answers & Feedback ({transcriptHistory.length})
                </span>
                {showHistory ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {showHistory && (
                <div className="mt-3 space-y-3 pt-3 border-t border-slate-800/80 max-h-60 overflow-y-auto pr-1">
                  {transcriptHistory.map((t, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-300">
                          Turn #{t.turnIndex || idx + 1}: {t.questionText?.slice(0, 45)}...
                        </span>
                        <span
                          className={`font-mono font-bold px-2 py-0.5 rounded ${
                            t.score >= 80
                              ? "bg-emerald-500/10 text-emerald-400"
                              : t.score >= 50
                              ? "bg-indigo-500/10 text-indigo-400"
                              : "bg-amber-500/10 text-amber-400"
                          }`}
                        >
                          {t.score}%
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] line-clamp-2">
                        {t.feedback}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Live Video + Candidate Response Center (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Live User Webcam Box */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 backdrop-blur-xl shadow-xl space-y-3">
            <div className="relative aspect-video w-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center shadow-inner">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover transform -scale-x-100 transition-opacity duration-300 ${
                  videoEnabled && stream ? "opacity-100 block" : "opacity-0 hidden"
                }`}
              />

              {(!videoEnabled || !stream) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-slate-950/90 space-y-2">
                  <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center">
                    <CameraOff className="w-5 h-5 text-slate-400" />
                  </div>
                  <p className="text-xs text-slate-400 font-medium">
                    Camera feed muted
                  </p>
                </div>
              )}

              {/* Video Footer Status */}
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between z-10">
                <div className="flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-800 text-[11px] text-slate-300">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isListening
                        ? "bg-rose-500 animate-ping"
                        : audioEnabled
                        ? "bg-emerald-500"
                        : "bg-slate-500"
                    }`}
                  />
                  {isListening
                    ? "Recording Voice"
                    : audioEnabled
                    ? "Mic Ready"
                    : "Mic Muted"}
                </div>

                {/* Video controls */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={toggleVideo}
                    className="p-1.5 rounded-lg bg-slate-950/80 backdrop-blur-md border border-slate-800 text-slate-300 hover:text-white"
                  >
                    {videoEnabled ? (
                      <Camera className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <CameraOff className="w-3.5 h-3.5 text-rose-400" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={toggleAudio}
                    className="p-1.5 rounded-lg bg-slate-950/80 backdrop-blur-md border border-slate-800 text-slate-300 hover:text-white"
                  >
                    {audioEnabled ? (
                      <Mic className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <MicOff className="w-3.5 h-3.5 text-rose-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Microphone Volume Meter */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Mic Input</span>
                <span className="font-mono">{audioLevel}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-indigo-500 transition-all duration-75"
                  style={{ width: `${audioLevel}%` }}
                />
              </div>
            </div>
          </div>

          {/* Candidate Answer Workspace */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Candidate Response Draft
              </label>

              {sttSupported && (
                <button
                  type="button"
                  onClick={handleToggleVoice}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                    isListening
                      ? "bg-rose-500/20 border-rose-500/40 text-rose-300 ring-2 ring-rose-500/30 animate-pulse"
                      : "bg-indigo-600/20 border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/30"
                  }`}
                >
                  {isListening ? (
                    <>
                      <Square className="w-3.5 h-3.5 fill-current" />
                      Stop Mic
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5" />
                      Answer with Voice
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Live Streaming Audio Indicator */}
            {isListening && (
              <div className="p-3 bg-rose-950/20 border border-rose-500/20 rounded-xl text-xs text-rose-300 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  Transcribing your voice in real time...
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {interimTranscript && `"${interimTranscript.slice(-30)}"`}
                </span>
              </div>
            )}

            {/* Answer Text Area */}
            <div className="space-y-1.5">
              <textarea
                ref={answerTextareaRef}
                value={answerDraft}
                onChange={(e) => setAnswerDraft(e.target.value)}
                placeholder="Speak clearly using your microphone, or type your answer directly here..."
                rows={5}
                disabled={isSubmitting}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none font-sans leading-relaxed"
              />

              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>
                  Words:{" "}
                  {answerDraft.trim()
                    ? answerDraft.trim().split(/\s+/).length
                    : 0}
                </span>
                {answerDraft && (
                  <button
                    type="button"
                    onClick={() => {
                      setAnswerDraft("");
                      resetTranscript();
                    }}
                    className="hover:text-rose-400 transition-colors flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Clear Text
                  </button>
                )}
              </div>
            </div>

            {submissionError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                {submissionError}
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleSkipQuestion}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-4 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <SkipForward className="w-3.5 h-3.5 text-slate-400" />
                Skip Question
              </button>

              <button
                type="button"
                onClick={handleSubmitAnswer}
                disabled={isSubmitting || !answerDraft.trim()}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-extrabold uppercase tracking-wider shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Evaluating Answer...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit & Continue
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
