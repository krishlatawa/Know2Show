"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import StepIndicator from "@/components/onboarding/StepIndicator";
import CandidateProfileForm from "@/components/onboarding/CandidateProfileForm";
import TargetRoleForm from "@/components/onboarding/TargetRoleForm";
import OnboardingSummaryCard from "@/components/onboarding/OnboardingSummaryCard";
import { candidateProfileSchema, targetRoleSchema } from "@/lib/validations/onboarding";
import { Sparkles, ShieldAlert } from "lucide-react";

const STEPS = [
  { id: 1, title: "Background", description: "Experience & Skills" },
  { id: 2, title: "Target Role", description: "Goal & Focus Topics" },
  { id: 3, title: "Review", description: "Confirm & Launch" },
];

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [profileData, setProfileData] = useState({
    headline: "",
    bio: "",
    experienceYears: 2,
    seniorityLevel: "MID",
    skills: [],
    githubUrl: "",
    linkedinUrl: "",
  });

  const [targetRoleData, setTargetRoleData] = useState({
    roleTitle: "",
    companyType: "FAANG",
    jobDescription: "",
    focusTopics: [],
    difficulty: "MEDIUM",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Redirect if user is not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/api/auth/signin");
    }
  }, [status, router]);

  // Handle Step 1 -> Step 2 transition with Zod validation
  const handleStep1Next = () => {
    const validation = candidateProfileSchema.safeParse(profileData);
    if (!validation.success) {
      const formattedErrors = {};
      validation.error.issues.forEach((issue) => {
        const fieldName = issue.path[0];
        formattedErrors[fieldName] = issue.message;
      });
      setErrors(formattedErrors);
      return;
    }
    setErrors({});
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle Step 2 -> Step 3 transition with Zod validation
  const handleStep2Next = () => {
    const validation = targetRoleSchema.safeParse(targetRoleData);
    if (!validation.success) {
      const formattedErrors = {};
      validation.error.issues.forEach((issue) => {
        const fieldName = issue.path[0];
        formattedErrors[fieldName] = issue.message;
      });
      setErrors(formattedErrors);
      return;
    }
    setErrors({});
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Final Form Submission
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const payload = {
        profile: profileData,
        targetRole: targetRoleData,
      };

      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save onboarding details.");
      }

      // Success - Redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      console.error("Onboarding submission error:", err);
      setSubmitError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium">Loading session...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden py-10 px-4">
      {/* Background Decorative Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl w-full mx-auto relative z-10 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            AI Interview Replay Setup
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Target Role & Profile Onboarding
          </h1>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Customize your professional candidate profile and target goals to unlock AI-simulated technical & behavioral interviews.
          </p>
        </div>

        {/* Step Progress Indicator */}
        <StepIndicator
          steps={STEPS}
          currentStep={currentStep}
          onStepClick={(step) => {
            if (step < currentStep) {
              setCurrentStep(step);
              setErrors({});
            }
          }}
        />

        {/* Dynamic Form Step Content */}
        <div className="transition-all duration-300">
          {currentStep === 1 && (
            <CandidateProfileForm
              data={profileData}
              onChange={setProfileData}
              errors={errors}
              onNext={handleStep1Next}
            />
          )}

          {currentStep === 2 && (
            <TargetRoleForm
              data={targetRoleData}
              onChange={setTargetRoleData}
              errors={errors}
              onBack={() => {
                setCurrentStep(1);
                setErrors({});
              }}
              onNext={handleStep2Next}
            />
          )}

          {currentStep === 3 && (
            <OnboardingSummaryCard
              profileData={profileData}
              targetRoleData={targetRoleData}
              onGoToStep={(step) => {
                setCurrentStep(step);
                setErrors({});
              }}
              onBack={() => setCurrentStep(2)}
              onSubmit={handleFinalSubmit}
              isSubmitting={isSubmitting}
              submitError={submitError}
            />
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 text-center text-xs text-slate-600 relative z-10">
        AI Interview Replay Platform • Candidate Onboarding Engine
      </footer>
    </main>
  );
}
