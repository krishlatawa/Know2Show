"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Target, Zap, Video, CheckCircle2, ArrowRight, Settings, Loader2, FileText } from "lucide-react";
import ResumeAnalysisViewer from "@/components/resume/ResumeAnalysisViewer";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
          } else {
            // Not onboarded yet
            router.push("/onboarding");
          }
        })
        .catch((err) => {
          console.error("Dashboard fetch error:", err);
          setError("Failed to load profile details.");
        })
        .finally(() => setLoading(false));
    }
  }, [status, router]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-3" />
        <p className="text-sm font-medium">Loading candidate dashboard...</p>
      </div>
    );
  }

  const targetRole = profile?.targetRole;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
              Profile Active
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
              Welcome back, {session?.user?.name || "Candidate"}! 👋
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Your candidate profile and target role are configured for AI mock interviews.
            </p>
          </div>

          <Link
            href="/onboarding"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-sm font-medium rounded-xl transition-all w-fit"
          >
            <Settings className="w-4 h-4 text-indigo-400" />
            Update Target Role
          </Link>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Target Role Overview Card */}
          <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-400 font-bold">
                <Target className="w-5 h-5" />
                Active Target Role Configuration
              </div>
              <span className="text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-lg">
                {targetRole?.difficulty} DIFFICULTY
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-white">
                  {targetRole?.roleTitle || "Target Role Unspecified"}
                </h2>
                <p className="text-sm text-slate-400 mt-0.5">
                  Target Industry/Company:{" "}
                  <span className="text-indigo-300 font-medium">{targetRole?.companyType}</span>
                </p>
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-2">
                  Key Focus Topics for Mock Interviews
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(targetRole?.focusTopics || []).map((topic, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-indigo-950/80 border border-indigo-700/50 text-indigo-200 text-xs font-medium rounded-lg"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              {targetRole?.jobDescription && (
                <div>
                  <h3 className="text-xs font-semibold uppercase text-slate-400 tracking-wider mb-1.5">
                    Configured Job Specification Context
                  </h3>
                  <p className="text-xs text-slate-300 bg-slate-950/80 border border-slate-800 p-3 rounded-xl line-clamp-3 font-mono">
                    {targetRole.jobDescription}
                  </p>
                </div>
              )}
            </div>

            {/* Launch AI Interview Quick Banner */}
            <div className="bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900 border border-indigo-500/30 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Video className="w-5 h-5 text-indigo-400" />
                  Ready for your AI Mock Interview?
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  AI will generate questions tailored to your focus areas and target role difficulty.
                </p>
              </div>
              <button
                disabled
                className="px-5 py-2.5 bg-indigo-600/50 text-indigo-200 text-sm font-semibold rounded-xl cursor-not-allowed flex items-center gap-1.5 opacity-80"
              >
                Start Replay Interview (Coming Soon)
              </button>
            </div>
          </div>

          {/* Candidate Profile Details Card */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-xl space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-bold border-b border-slate-800 pb-3">
                <User className="w-5 h-5" />
                Candidate Background
              </div>

              <div>
                <p className="text-xs text-slate-400">Headline</p>
                <p className="text-sm font-semibold text-slate-100">{profile?.headline}</p>
              </div>

              <div>
                <p className="text-xs text-slate-400">Seniority & Experience</p>
                <p className="text-sm font-medium text-slate-200">
                  {profile?.seniorityLevel} ({profile?.experienceYears} Years)
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400 mb-1.5">Primary Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {(profile?.skills || []).map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-md"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {profile?.bio && (
                <div>
                  <p className="text-xs text-slate-400">Bio</p>
                  <p className="text-xs text-slate-300 mt-0.5 line-clamp-3">{profile.bio}</p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800/80 text-xs text-slate-500">
              Onboarding Status: <span className="text-emerald-400 font-semibold">Completed</span>
            </div>
          </div>
        </div>

        {/* AI Parsed Resume Details Section */}
        {profile?.resumeAnalysis && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl font-bold text-white">Parsed Resume & Skill Graph</h2>
            </div>
            <ResumeAnalysisViewer
              data={profile.resumeAnalysis}
              sourceName={profile.resumeAnalysis.fileName || "Uploaded Resume"}
            />
          </div>
        )}
      </div>
    </div>
  );
}

