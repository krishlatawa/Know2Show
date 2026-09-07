"use client";

import React, { useState, useRef } from "react";
import {
  UploadCloud,
  FileText,
  FileCode,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  RefreshCw,
  X,
} from "lucide-react";

export default function ResumeUploadDropzone({ onAnalysisComplete, disabled = false }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [textMode, setTextMode] = useState(false);
  const [rawText, setRawText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [analysisStep, setAnalysisStep] = useState(""); // "Uploading", "Extracting Skills & Projects", "Formatting Data"
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = (file) => {
    setErrorMessage("");
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("File size exceeds 5MB. Please upload a smaller resume.");
      return;
    }

    const isValidType =
      file.type === "application/pdf" ||
      file.type === "text/plain" ||
      file.name.endsWith(".pdf") ||
      file.name.endsWith(".txt");

    if (!isValidType) {
      setErrorMessage("Please upload a PDF (.pdf) or plain text (.txt) file.");
      return;
    }

    setSelectedFile(file);
    // Auto-trigger analysis once file is dropped
    triggerFileAnalysis(file);
  };

  const triggerFileAnalysis = async (file) => {
    setIsAnalyzing(true);
    setErrorMessage("");
    setAnalysisStep("Uploading document...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      setTimeout(() => setAnalysisStep("Extracting Skills, Projects & Work History with Gemini AI..."), 800);

      const res = await fetch("/api/resume/analyze", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to analyze resume.");
      }

      setAnalysisStep("Finalizing structured profile...");
      if (onAnalysisComplete) {
        onAnalysisComplete(json.data, file.name);
      }
    } catch (err) {
      console.error("Resume analysis failed:", err);
      setErrorMessage(err.message || "Failed to analyze resume. Please try again.");
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep("");
    }
  };

  const triggerTextAnalysis = async () => {
    if (!rawText.trim() || rawText.trim().length < 30) {
      setErrorMessage("Please paste at least 30 characters of resume text.");
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage("");
    setAnalysisStep("Analyzing text content with Gemini AI...");

    try {
      const res = await fetch("/api/resume/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to analyze resume text.");
      }

      if (onAnalysisComplete) {
        onAnalysisComplete(json.data, "Pasted Resume Text");
      }
    } catch (err) {
      console.error("Text analysis failed:", err);
      setErrorMessage(err.message || "Failed to parse text. Please try again.");
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep("");
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setRawText("");
    setErrorMessage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-md shadow-xl">
      {/* Header & Mode Switcher */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">AI Resume Parser</h3>
            <p className="text-xs text-slate-400">Auto-extract your skills, projects & experience</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setTextMode(!textMode);
            handleReset();
          }}
          disabled={isAnalyzing || disabled}
          className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium underline underline-offset-4"
        >
          {textMode ? "Upload PDF instead" : "Paste raw text instead"}
        </button>
      </div>

      {/* Upload Box / Text Area */}
      {!textMode ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !isAnalyzing && !disabled && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
            dragActive
              ? "border-indigo-500 bg-indigo-500/10 scale-[1.01]"
              : "border-slate-700/80 hover:border-slate-600 bg-slate-950/40 hover:bg-slate-950/70"
          } ${isAnalyzing ? "pointer-events-none opacity-80" : ""}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,application/pdf,text/plain"
            className="hidden"
            onChange={handleFileChange}
            disabled={isAnalyzing || disabled}
          />

          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center py-4 space-y-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-2 border-indigo-500/30 border-t-indigo-400 animate-spin" />
                <Sparkles className="w-5 h-5 text-indigo-400 absolute inset-0 m-auto animate-pulse" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-white">{analysisStep || "Analyzing resume..."}</p>
                <p className="text-xs text-slate-400">Extracting skills, projects, and work history</p>
              </div>
            </div>
          ) : selectedFile ? (
            <div className="flex items-center justify-between bg-slate-800/80 border border-slate-700 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-indigo-400" />
                <div className="text-left">
                  <p className="text-sm font-medium text-white truncate max-w-xs">{selectedFile.name}</p>
                  <p className="text-xs text-slate-400">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleReset();
                }}
                className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="p-3 bg-slate-800/70 rounded-full text-slate-300">
                <UploadCloud className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200">
                  <span className="text-indigo-400">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-slate-500 mt-1">PDF or TXT resume (up to 5MB)</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <textarea
            rows={5}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            disabled={isAnalyzing || disabled}
            placeholder="Paste your full resume text here (Skills, Experience, Projects, Education)..."
            className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleReset}
              disabled={isAnalyzing || disabled}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={triggerTextAnalysis}
              disabled={isAnalyzing || disabled || rawText.trim().length < 30}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg shadow transition-colors"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Extract with AI
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Error display */}
      {errorMessage && (
        <div className="mt-3 flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
