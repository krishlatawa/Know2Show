"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import PageContainer from "@/components/layout/PageContainer";
import StepIndicator from "@/components/onboarding/StepIndicator";
import CandidateProfileForm from "@/components/onboarding/CandidateProfileForm";
import TargetRoleForm from "@/components/onboarding/TargetRoleForm";
import OnboardingSummaryCard from "@/components/onboarding/OnboardingSummaryCard";
import { candidateProfileSchema, targetRoleSchema } from "@/lib/validations/onboarding";
import { Loader2 } from "lucide-react";

const STEPS = [
  { id: 1, title: "Background", description: "Experience & Skills" },
  { id: 2, title: "Target Role", description: "Goal & Focus Topics" },
  { id: 3, title: "Review", description: "Confirm & Launch" },
];

const STEP_TITLES = {
  1: {
    title: "Candidate Background & Experience",
    description:
      "Define your technical profile and experience baseline, or upload your resume to auto-fill with AI.",
  },
  2: {
    title: "Target Role & Interview Strategy",
    description:
      "Configure your target role, company type, and focus areas, or analyze a job description for skill-gap targeting.",
  },
  3: {
    title: "Review & Confirm Profile",
    description:
      "Double-check your candidate details and interview focus areas before launching your preparation cockpit.",
  },
};

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
      <PageContainer size="narrow">
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-[#6B635B]">
          <Loader2 className="w-8 h-8 animate-spin text-[#211A16] mb-3" />
          <p className="text-xs font-mono tracking-widest uppercase text-[#968E85]">Loading session...</p>
        </div>
      </PageContainer>
    );
  }

  const currentStepMeta = STEP_TITLES[currentStep] || STEP_TITLES[1];

  return (
    <PageContainer size="narrow" className="py-8 sm:py-10">
      <div className="space-y-8 sm:space-y-9">
        {/* Editorial Step Tracker */}
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

        {/* Header & Step Hierarchy */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#EFECE4] border border-[#E2DDD3] rounded-full text-[#6B635B] text-[10.5px] font-mono font-medium uppercase tracking-[0.14em]">
            <span>STEP 0{currentStep} OF 0{STEPS.length}</span>
            <span className="text-[#968E85]">•</span>
            <span className="text-[#211A16] font-semibold">{STEPS[currentStep - 1]?.title}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-medium text-[#211A16] tracking-tight">
            {currentStepMeta.title}
          </h1>

          <p className="text-xs sm:text-[13.5px] text-[#6B635B] leading-relaxed max-w-lg mx-auto">
            {currentStepMeta.description}
          </p>
        </div>

        {/* Dynamic Form Step Content */}
        <div className="transition-all duration-200">
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

        {/* Editorial Footer Note */}
        <footer className="pt-6 border-t border-[#E2DDD3]/60 text-center text-[10.5px] font-mono tracking-widest text-[#968E85] uppercase">
          KNOW2SHOW • CANDIDATE PERFORMANCE PROFILE ENGINE
        </footer>
      </div>
    </PageContainer>
  );
}

