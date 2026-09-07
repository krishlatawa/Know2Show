"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, Mail, Lock, User, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { registerSchema, loginSchema } from "@/lib/validations/auth";

export default function AuthPage() {
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
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            AI Interview Platform
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            {mode === "signup" ? "Create your Account" : "Welcome Back"}
          </h1>
          <p className="text-sm text-slate-400">
            {mode === "signup"
              ? "Sign up to start AI-driven interview readiness & replay analysis"
              : "Sign in to access your dashboard and mock interviews"}
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-950/80 border border-slate-800/80 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setServerError("");
                setErrors({});
              }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === "signup"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
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
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === "signin"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Sign In
            </button>
          </div>

          {/* Global Server Error Alert */}
          {serverError && (
            <div className="flex items-start gap-2.5 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={mode === "signup" ? handleSignUp : handleSignIn} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="e.g. Alex Johnson"
                  disabled={isLoading}
                  className={`w-full px-4 py-2.5 bg-slate-950/80 border ${
                    errors.name ? "border-rose-500/80" : "border-slate-800 focus:border-indigo-500"
                  } rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all`}
                />
                {errors.name && <p className="mt-1 text-xs text-rose-400">{errors.name}</p>}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="alex@example.com"
                disabled={isLoading}
                className={`w-full px-4 py-2.5 bg-slate-950/80 border ${
                  errors.email ? "border-rose-500/80" : "border-slate-800 focus:border-indigo-500"
                } rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all`}
              />
              {errors.email && <p className="mt-1 text-xs text-rose-400">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
                className={`w-full px-4 py-2.5 bg-slate-950/80 border ${
                  errors.password ? "border-rose-500/80" : "border-slate-800 focus:border-indigo-500"
                } rounded-xl text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all`}
              />
              {errors.password && <p className="mt-1 text-xs text-rose-400">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {mode === "signup" ? "Creating Account..." : "Signing In..."}
                </>
              ) : (
                <>
                  {mode === "signup" ? "Create Account & Continue" : "Sign In"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Bottom Switch Link */}
          <p className="text-center text-xs text-slate-400 pt-2">
            {mode === "signup" ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "signup" ? "signin" : "signup");
                setServerError("");
                setErrors({});
              }}
              className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-4"
            >
              {mode === "signup" ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}
