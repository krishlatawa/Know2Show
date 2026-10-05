"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Square,
  Send,
  Loader2,
  Volume2,
  VolumeX,
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
  SkipForward,
} from "lucide-react";
import { useMediaPermissions } from "@/hooks/useMediaPermissions";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { PageContainer } from "@/components/layout";
import { Button, ScoreDisplay, Badge, ProgressBar } from "@/components/ui";
import InterviewReplayViewer from "@/components/interview/InterviewReplayViewer";

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

  // RENDER: Interview Completed Full Replay & Performance Audit
  if (isComplete) {
    return (
      <InterviewReplayViewer
        session={session}
        transcript={transcriptHistory}
        feedbackSummary={feedbackSummary}
        onPracticeAgain={() => router.push("/interview/setup")}
      />
    );
  }

  const totalQuestions =
    session?.questionCount || selectedQuestions.length || 1;
  const currentQuestionNumber = Math.min(
    totalQuestions,
    transcriptHistory.length + 1
  );
  const progressPercent = Math.min(
    100,
    Math.round((currentQuestionNumber / totalQuestions) * 100)
  );

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#211A16] flex flex-col selection:bg-[#211A16] selection:text-[#F7F5F0]">
      {/* Top Status Bar (Dedicated Live Room Navigation) */}
      <header className="sticky top-0 z-30 w-full bg-[#F7F5F0]/95 backdrop-blur-sm border-b border-[#E2DDD3]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Brand & Round Metadata */}
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 group select-none"
            >
              <div className="w-5 h-4 rounded-[3px] bg-[#211A16] flex items-center justify-center gap-0.5 shrink-0">
                <span className="w-0.5 h-0.5 rounded-full bg-[#F7F5F0]" />
                <span className="w-0.5 h-0.5 rounded-full bg-[#F7F5F0]" />
              </div>
              <span className="text-xs font-bold tracking-[0.14em] text-[#211A16]">
                KNOW2SHOW
              </span>
            </Link>
            <span className="hidden sm:inline-block text-[10px] font-mono uppercase tracking-wider text-[#6B635B] bg-[#EFECE4] px-2 py-0.5 rounded border border-[#E2DDD3]">
              ROUND: {session?.interviewType || "MIXED"}
            </span>
          </div>

          {/* Center Progress Indicator */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[11px] font-mono tracking-wider uppercase text-[#211A16] font-medium">
              QUESTION {currentQuestionNumber} OF {totalQuestions}
            </span>
            <div className="w-28 sm:w-36 bg-[#E2DDD3] h-[2px] rounded-full overflow-hidden">
              <div
                className="bg-[#211A16] h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Right Timer & Exit Action */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#FAF9F5] border border-[#E2DDD3] rounded-md text-xs font-mono text-[#211A16]">
              <Clock className="w-3.5 h-3.5 text-[#6B635B]" />
              <span>{formatTime(questionSeconds)}</span>
            </div>

            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="text-[10px] font-mono uppercase tracking-wider text-[#6B635B] hover:text-[#9B2C2C] px-2 py-1 rounded transition-colors"
            >
              EXIT
            </button>
          </div>
        </div>
      </header>

      {/* Main Cockpit Layout (2 Balanced Columns) */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Active Question Hero & Persona (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Active Question Hero Card */}
          <div className="bg-[#FAF9F5] border border-[#E2DDD3] rounded-lg p-5 sm:p-6.5 space-y-4.5">
            {/* Metadata Header */}
            <div className="flex items-center justify-between gap-2 border-b border-[#E2DDD3]/60 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold tracking-wider text-[#968E85] uppercase">
                  {activeQuestion?.isFollowUp
                    ? "DEEP-DIVE PROBE"
                    : `QUESTION ${String(currentQuestionIndex + 1).padStart(
                      2,
                      "0"
                    )}`}
                </span>
                {activeQuestion?.category && (
                  <span className="text-[10px] font-mono font-medium uppercase tracking-wider px-2.5 py-0.5 rounded bg-[#EFECE4] text-[#211A16] border border-[#E2DDD3]">
                    {activeQuestion.category}
                  </span>
                )}
              </div>

              <span className="text-[10px] font-mono font-medium uppercase tracking-wider px-2.5 py-0.5 rounded border border-[#E2DDD3] bg-[#EFECE4] text-[#6B635B]">
                {activeQuestion?.difficulty || session?.difficulty || "MEDIUM"}
              </span>
            </div>

            {/* Question Text Prompt */}
            <div className="space-y-2.5 py-1">
              <h2 className="text-lg sm:text-[20px] font-normal text-[#211A16] leading-[1.6] tracking-tight select-text">
                {activeQuestion?.questionText ||
                  "Please outline your structural approach to addressing this technical challenge."}
              </h2>

              {activeQuestion?.focusTopic && (
                <div className="text-[11.5px] font-mono text-[#6B635B] pt-1.5">
                  <span className="text-[#968E85] uppercase font-medium">FOCUS TOPIC:</span>{" "}
                  <span className="text-[#211A16] font-medium">
                    {activeQuestion.focusTopic}
                  </span>
                </div>
              )}
            </div>

            {/* AI Voice Synthesis / Audio Bar */}
            <div className="pt-2 border-t border-[#E2DDD3]/60 flex items-center justify-between">
              {isSpeaking ? (
                <div className="flex items-center gap-2 py-1 px-3 bg-[#EFECE4] border border-[#E2DDD3] rounded-md text-[11px] font-mono text-[#211A16] w-full justify-between">
                  <div className="flex items-center gap-2">
                    {/* Restrained audio waveform bars */}
                    <div className="flex items-center gap-0.5 h-3.5">
                      <span className="w-1 bg-[#211A16] h-2 animate-pulse rounded-full" />
                      <span className="w-1 bg-[#211A16] h-3.5 animate-pulse rounded-full delay-75" />
                      <span className="w-1 bg-[#211A16] h-2.5 animate-pulse rounded-full delay-150" />
                      <span className="w-1 bg-[#211A16] h-1.5 animate-pulse rounded-full delay-100" />
                    </div>
                    <span className="italic">AI speaking prompt...</span>
                  </div>
                  <button
                    type="button"
                    onClick={cancelSpeech}
                    className="text-[10px] font-mono uppercase tracking-wider text-[#968E85] hover:text-[#211A16]"
                  >
                    MUTE
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleReplayQuestion}
                  className="inline-flex items-center gap-1.5 text-[10.5px] font-mono tracking-wider uppercase text-[#6B635B] hover:text-[#211A16] transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>REPLAY QUESTION AUDIO</span>
                </button>
              )}
            </div>
          </div>

          {/* Real-time Turn Feedback Drawer */}
          {transcriptHistory.length > 0 && (
            <div className="bg-[#FAF9F5] border border-[#E2DDD3] rounded-lg p-4">
              <button
                type="button"
                onClick={() => setShowHistory(!showHistory)}
                className="w-full flex items-center justify-between text-xs font-mono uppercase tracking-wider text-[#6B635B] hover:text-[#211A16] transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-[#6B635B]" />
                  PAST TURNS & AI EVALUATION ({transcriptHistory.length})
                </span>
                {showHistory ? (
                  <ChevronUp className="w-3.5 h-3.5 text-[#968E85]" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-[#968E85]" />
                )}
              </button>

              {showHistory && (
                <div className="mt-3 space-y-2.5 pt-3 border-t border-[#E2DDD3]/60 max-h-56 overflow-y-auto pr-1">
                  {transcriptHistory.map((t, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-[#EFECE4] border border-[#E2DDD3] rounded-md space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-[#211A16] truncate max-w-[240px]">
                          Turn #{t.turnIndex || idx + 1}: {t.questionText}
                        </span>
                        <span className="font-mono text-xs font-semibold text-[#211A16]">
                          {t.score}%
                        </span>
                      </div>
                      <p className="text-[#6B635B] text-[11.5px] italic line-clamp-2 leading-relaxed">
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
          {/* Live User Video Presence Card */}
          <div className="bg-[#FAF9F5] border border-[#E2DDD3] rounded-lg p-3.5 sm:p-4 space-y-3">
            <div className="relative aspect-[16/9] w-full bg-[#EFECE4] rounded-md overflow-hidden border border-[#E2DDD3] flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover transform -scale-x-100 transition-opacity duration-300 ${videoEnabled && stream
                    ? "opacity-100 block"
                    : "opacity-0 hidden"
                  }`}
              />

              {(!videoEnabled || !stream) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-[#EFECE4] space-y-1.5">
                  <div className="w-8 h-8 rounded-full bg-[#FAF9F5] border border-[#E2DDD3] text-[#968E85] flex items-center justify-center">
                    <CameraOff className="w-4 h-4" />
                  </div>
                  <p className="text-[11px] font-mono uppercase tracking-wider text-[#968E85]">
                    Camera feed muted
                  </p>
                </div>
              )}

              {/* Video Overlay Status & Controls */}
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between z-10">
                <div className="flex items-center gap-1.5 bg-[#211A16]/85 backdrop-blur-sm px-2.5 py-1 rounded text-[10px] font-mono uppercase tracking-wider text-[#F7F5F0]">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${isListening
                        ? "bg-[#9B2C2C] animate-pulse"
                        : audioEnabled
                          ? "bg-[#2A6A4E]"
                          : "bg-[#968E85]"
                      }`}
                  />
                  <span>
                    {isListening
                      ? "Recording Voice"
                      : audioEnabled
                        ? "Mic Active"
                        : "Mic Muted"}
                  </span>
                </div>

                {/* Media Hardware Controls */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={toggleVideo}
                    className="p-1.5 rounded bg-[#FAF9F5]/90 hover:bg-white border border-[#E2DDD3] text-[#211A16] transition-colors"
                    title={videoEnabled ? "Mute Camera" : "Enable Camera"}
                  >
                    {videoEnabled ? (
                      <Camera className="w-3.5 h-3.5" />
                    ) : (
                      <CameraOff className="w-3.5 h-3.5 text-[#9B2C2C]" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={toggleAudio}
                    className="p-1.5 rounded bg-[#FAF9F5]/90 hover:bg-white border border-[#E2DDD3] text-[#211A16] transition-colors"
                    title={audioEnabled ? "Mute Microphone" : "Enable Microphone"}
                  >
                    {audioEnabled ? (
                      <Mic className="w-3.5 h-3.5" />
                    ) : (
                      <MicOff className="w-3.5 h-3.5 text-[#9B2C2C]" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Microphone Volume Meter */}
            <div className="space-y-1 px-0.5">
              <div className="flex items-center justify-between text-[10px] font-mono text-[#968E85] uppercase">
                <span>Microphone Level</span>
                <span>{audioLevel}%</span>
              </div>
              <div className="w-full bg-[#E2DDD3] rounded-full h-1 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#211A16] transition-all duration-75"
                  style={{ width: `${audioLevel}%` }}
                />
              </div>
            </div>
          </div>

          {/* Candidate Response Workspace Card */}
          <div className="bg-[#FAF9F5] border border-[#E2DDD3] rounded-lg p-4 sm:p-5 space-y-3.5">
            <div className="flex items-center justify-between border-b border-[#E2DDD3]/60 pb-3">
              <span className="text-xs font-mono font-medium uppercase tracking-wider text-[#6B635B]">
                CANDIDATE RESPONSE
              </span>

              {sttSupported && (
                <button
                  type="button"
                  onClick={handleToggleVoice}
                  className={`px-3 py-1.5 rounded-md text-[11px] font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all ${isListening
                      ? "bg-[#9B2C2C] text-white border border-[#9B2C2C]"
                      : "bg-[#211A16] text-[#F7F5F0] hover:bg-[#352B25] border border-[#211A16]"
                    }`}
                >
                  {isListening ? (
                    <>
                      <Square className="w-3 h-3 fill-current" />
                      <span>STOP RECORDING</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5" />
                      <span>RECORD VOICE</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Live Streaming Audio Indicator */}
            {isListening && (
              <div className="p-2.5 bg-[#EFECE4] border border-[#E2DDD3] rounded-md text-xs text-[#211A16] flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9B2C2C] animate-ping" />
                  <span className="font-mono text-[11px]">
                    Transcribing speech...
                  </span>
                </span>
                <span className="text-[11px] font-mono text-[#6B635B] italic max-w-[200px] truncate">
                  {interimTranscript && `"${interimTranscript.slice(-35)}"`}
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
                className="w-full bg-white border border-[#E2DDD3] rounded-md p-3.5 text-sm sm:text-[14.5px] text-[#211A16] placeholder:text-[#968E85] focus:outline-none focus:border-[#211A16] focus:ring-1 focus:ring-[#211A16]/20 resize-none font-sans leading-relaxed"
              />

              <div className="flex items-center justify-between text-[10.5px] font-mono text-[#968E85]">
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
                    className="hover:text-[#9B2C2C] transition-colors flex items-center gap-1 uppercase"
                  >
                    <RotateCcw className="w-3 h-3" /> Clear
                  </button>
                )}
              </div>
            </div>

            {submissionError && (
              <div className="p-3 bg-[#F9ECEC] border border-[#ECC8C8] text-[#9B2C2C] text-xs font-mono rounded-md flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#9B2C2C]" />
                {submissionError}
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkipQuestion}
                disabled={isSubmitting}
                className="w-full sm:w-auto text-[#6B635B] hover:text-[#211A16]"
                leftIcon={SkipForward}
              >
                SKIP QUESTION
              </Button>

              <Button
                variant="primary"
                size="lg"
                onClick={handleSubmitAnswer}
                disabled={isSubmitting || !answerDraft.trim()}
                isLoading={isSubmitting}
                className="w-full sm:w-auto py-3.5 text-xs sm:text-[13px] tracking-[0.14em] font-semibold"
                rightIcon={Send}
              >
                {isSubmitting ? "EVALUATING..." : "SUBMIT ANSWER"}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
