"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, User, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { registerSchema, loginSchema } from "@/lib/validations/auth";

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/onboarding";

  const [mode, setMode] = useState("signup"); // "signin" | "signup"
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setServerError("");
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setServerError("");

    const validation = loginSchema.safeParse({
      email: formData.email,
      password: formData.password,
    });

    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      });
      return;
    }

    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (res?.error) {
        setServerError("Invalid email or password. Please try again.");
      } else {
        router.push(callbackUrl);
      }
    } catch (err) {
      setServerError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setServerError("");

    const validation = registerSchema.safeParse(formData);

    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;
      setErrors({
        name: fieldErrors.name?.[0],
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
      });
      return;
    }

    setIsLoading(true);

    try {
      // 1. Call Register API
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create account.");
      }

      // 2. Auto Sign-In after successful registration
      const loginRes = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (loginRes?.error) {
        setServerError("Account created! Please sign in using your credentials.");
        setMode("signin");
      } else {
        router.push("/onboarding");
      }
    } catch (err) {
      setServerError(err.message || "Failed to create account.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F7F5F0] text-[#211A16] flex flex-col justify-between p-4 sm:p-6 py-10 sm:py-14 selection:bg-[#211A16] selection:text-[#F7F5F0]">
      {/* Top Header / Branding */}
      <div className="flex justify-center">
        <Link
          href="/"
          className="flex items-center gap-2.5 group select-none transition-transform hover:scale-[1.02]"
        >
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
      </div>

      {/* Main Form Center Box */}
      <div className="max-w-md w-full mx-auto my-auto space-y-6 pt-6 pb-6">
        {/* Header Text */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ECE7DD] border border-[#D8D2C5] text-[#6B635B] text-[10px] font-mono uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-[#211A16]" />
            {mode === "signup" ? "NEW CANDIDATE" : "RETURNING CANDIDATE"}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#211A16]">
            {mode === "signup" ? "Create your Account" : "Welcome Back"}
          </h1>
          <p className="text-xs sm:text-sm text-[#6B635B] max-w-sm mx-auto leading-relaxed">
            {mode === "signup"
              ? "Sign up to start AI-driven interview readiness & replay analysis."
              : "Sign in to access your dashboard, past recordings, and skill metrics."}
          </p>
        </div>

        {/* Auth Card (Level 1 Surface) */}
        <div className="bg-[#FFFFFF] border border-[#D8D2C5] rounded-xl p-6 sm:p-8 shadow-[0_2px_12px_-3px_rgba(33,26,22,0.04)] space-y-5">
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 bg-[#ECE7DD] border border-[#D8D2C5] rounded-lg">
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setServerError("");
                setErrors({});
              }}
              className={`py-2 text-[11px] font-mono uppercase tracking-wider rounded-md transition-all cursor-pointer ${
                mode === "signup"
                  ? "bg-[#211A16] text-[#F7F5F0] font-semibold shadow-xs"
                  : "text-[#6B635B] hover:text-[#211A16] font-medium"
              }`}
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setServerError("");
                setErrors({});
              }}
              className={`py-2 text-[11px] font-mono uppercase tracking-wider rounded-md transition-all cursor-pointer ${
                mode === "signin"
                  ? "bg-[#211A16] text-[#F7F5F0] font-semibold shadow-xs"
                  : "text-[#6B635B] hover:text-[#211A16] font-medium"
              }`}
            >
              Sign In
            </button>
          </div>

          {/* Global Server Error Alert */}
          {serverError && (
            <div className="flex items-start gap-2.5 p-3.5 bg-[#F9ECEC] border border-[#F0D5D5] rounded-lg text-[#9B2C2C] text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#9B2C2C]" />
              <span className="leading-relaxed">{serverError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={mode === "signup" ? handleSignUp : handleSignIn} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#6B635B] mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#968E85]" />
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="e.g. Alex Johnson"
                  disabled={isLoading}
                  className={`w-full px-3.5 py-2.5 bg-white border ${
                    errors.name ? "border-[#9B2C2C] focus:border-[#9B2C2C] focus:ring-[#9B2C2C]/20" : "border-[#D8D2C5] focus:border-[#211A16] focus:ring-[#211A16]/15"
                  } rounded-lg text-[#211A16] placeholder-[#968E85] text-sm focus:outline-none focus:ring-2 transition-all`}
                />
                {errors.name && <p className="mt-1 text-[11px] font-mono text-[#9B2C2C]">{errors.name}</p>}
              </div>
            )}

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#6B635B] mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#968E85]" />
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="alex@example.com"
                disabled={isLoading}
                className={`w-full px-3.5 py-2.5 bg-white border ${
                  errors.email ? "border-[#9B2C2C] focus:border-[#9B2C2C] focus:ring-[#9B2C2C]/20" : "border-[#D8D2C5] focus:border-[#211A16] focus:ring-[#211A16]/15"
                } rounded-lg text-[#211A16] placeholder-[#968E85] text-sm focus:outline-none focus:ring-2 transition-all`}
              />
              {errors.email && <p className="mt-1 text-[11px] font-mono text-[#9B2C2C]">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-[#6B635B] mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#968E85]" />
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
                className={`w-full px-3.5 py-2.5 bg-white border ${
                  errors.password ? "border-[#9B2C2C] focus:border-[#9B2C2C] focus:ring-[#9B2C2C]/20" : "border-[#D8D2C5] focus:border-[#211A16] focus:ring-[#211A16]/15"
                } rounded-lg text-[#211A16] placeholder-[#968E85] text-sm focus:outline-none focus:ring-2 transition-all`}
              />
              {errors.password && <p className="mt-1 text-[11px] font-mono text-[#9B2C2C]">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#211A16] hover:bg-[#352B25] text-[#F7F5F0] text-xs font-mono font-medium tracking-wider uppercase rounded-lg shadow-xs transition-all active:scale-[0.99] flex items-center justify-center gap-2 mt-2 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#F7F5F0]" />
                  <span>{mode === "signup" ? "CREATING ACCOUNT..." : "SIGNING IN..."}</span>
                </>
              ) : (
                <>
                  <span>{mode === "signup" ? "Create Account & Continue" : "Sign In"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Bottom Switch Link */}
          <p className="text-center text-xs text-[#6B635B] pt-2 border-t border-[#E2DDD3]">
            {mode === "signup" ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "signup" ? "signin" : "signup");
                setServerError("");
                setErrors({});
              }}
              className="text-[#211A16] hover:text-[#352B25] font-semibold underline underline-offset-4 decoration-[#D8D2C5] hover:decoration-[#211A16] transition-colors ml-1 cursor-pointer"
            >
              {mode === "signup" ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>

      {/* Subtle Footer Caption */}
      <div className="text-center">
        <p className="text-[10px] font-mono tracking-widest text-[#968E85] uppercase">
          KNOW2SHOW &bull; AI INTERVIEW REPLAY &bull; PREPARATION ENGINE
        </p>
      </div>
    </main>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center text-[#6B635B]">
          <Loader2 className="w-6 h-6 animate-spin text-[#211A16]" />
        </div>
      }
    >
      <AuthContent />
    </Suspense>
  );
}
