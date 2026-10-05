"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { PageContainer } from "@/components/layout";
import InterviewHistoryProgress from "@/components/history/InterviewHistoryProgress";

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [profile, setProfile] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin");
      return;
    }

    if (status === "authenticated") {
      Promise.all([
        fetch("/api/profile").then((res) => res.json()),
        fetch("/api/interview/session")
          .then((res) => res.json())
          .catch(() => ({ sessions: [] })),
      ])
        .then(([profileData, sessionData]) => {
          if (profileData.success && profileData.profile) {
            setProfile(profileData.profile);
          } else {
            router.push("/onboarding");
            return;
          }

          if (sessionData.success && Array.isArray(sessionData.sessions)) {
            setSessions(sessionData.sessions);
          }
        })
        .catch((err) => {
          console.error("History fetch error:", err);
          setError("Failed to load interview history records.");
        })
        .finally(() => setLoading(false));
    }
  }, [status, router]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-[#211A16]" />
          <span className="text-xs font-mono tracking-widest text-[#6B635B] uppercase">
            Loading History &amp; Progress Records...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#FFFFFF] border border-[#D8D2C5] rounded-xl p-6 text-center space-y-4 shadow-sm">
          <AlertCircle className="w-8 h-8 text-[#9B2C2C] mx-auto" />
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-[#211A16]">
              Unable to Retrieve History
            </h2>
            <p className="text-xs text-[#6B635B]">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#211A16] text-[#F7F5F0] text-xs font-mono uppercase tracking-wider rounded-md hover:bg-[#352B25] transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#211A16] selection:bg-[#211A16] selection:text-[#F7F5F0] pb-20">
      <PageContainer size="wide" className="pt-6 sm:pt-8">
        <InterviewHistoryProgress
          sessions={sessions}
          profile={profile}
          loading={loading}
          error={error}
        />
      </PageContainer>
    </div>
  );
}
