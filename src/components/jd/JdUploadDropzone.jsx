"use client";

import React, { useState, useRef } from "react";
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  Sparkles,
  AlertCircle,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function JdUploadDropzone({ onAnalysisComplete, disabled = false }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [textMode, setTextMode] = useState(false);
  const [rawText, setRawText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [analysisStep, setAnalysisStep] = useState("");
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
      setErrorMessage("File size exceeds 5MB limit. Please upload a smaller file.");
      return;
    }

    const mime = file.type || "";
    const name = file.name.toLowerCase();
    const isValid =
      mime.includes("pdf") ||
      mime.includes("text") ||
      mime.includes("image") ||
      name.endsWith(".pdf") ||
      name.endsWith(".txt") ||
      name.endsWith(".png") ||
      name.endsWith(".jpg") ||
      name.endsWith(".jpeg") ||
      name.endsWith(".webp");

    if (!isValid) {
      setErrorMessage("Please upload a PDF, TXT, or Image screenshot (PNG/JPEG/WEBP).");
      return;
    }

    setSelectedFile(file);
    triggerFileAnalysis(file);
  };

  const triggerFileAnalysis = async (file) => {
    setIsAnalyzing(true);
    setErrorMessage("");
    setAnalysisStep("Uploading Job Description...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      setTimeout(() => setAnalysisStep("Extracting required competencies & expectations with Gemini..."), 700);

      const res = await fetch("/api/jd/analyze", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to analyze Job Description.");
      }

      setAnalysisStep("Calculating Candidate Skill Gap Radar...");
      if (onAnalysisComplete) {
        onAnalysisComplete(json.data, json.skillGap, file.name);
      }
    } catch (err) {
      console.error("JD analysis failed:", err);
      setErrorMessage(err.message || "Failed to analyze Job Description. Please try again.");
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep("");
    }
  };

  const triggerTextAnalysis = async () => {
    if (!rawText.trim() || rawText.trim().length < 30) {
      setErrorMessage("Please paste at least 30 characters of Job Description text.");
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage("");
    setAnalysisStep("Analyzing Job Description with Gemini...");

    try {
      const res = await fetch("/api/jd/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to analyze Job Description.");
      }

      if (onAnalysisComplete) {
        onAnalysisComplete(json.data, json.skillGap, "Pasted Job Description");
      }
    } catch (err) {
      console.error("JD text analysis failed:", err);
      setErrorMessage(err.message || "Failed to analyze text. Please try again.");
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
    <div className="w-full bg-[#ECE7DD] border border-[#D8D2C5] rounded-lg p-4 sm:p-5 space-y-3.5">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded bg-[#211A16] text-[#F7F5F0] flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#211A16]">
              AI Job Description Assist (Optional)
            </h3>
            <p className="text-[11.5px] text-[#6B635B]">
              Upload a Job Description or screenshot to auto-extract required topics and calculate your skill gap.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setTextMode(!textMode);
            handleReset();
          }}
          disabled={isAnalyzing || disabled}
          className="text-[11px] font-mono text-[#6B635B] hover:text-[#211A16] underline underline-offset-4 transition-colors self-start sm:self-auto shrink-0"
        >
          {textMode ? "Upload File/Screenshot instead" : "or paste JD text"}
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
          className={`relative border-2 border-dashed rounded-lg p-5 sm:p-6 text-center cursor-pointer transition-all duration-150 ${
            dragActive
              ? "border-[#211A16] bg-[#FAF9F5] scale-[1.005]"
              : "border-[#C5BDAF] hover:border-[#211A16]/60 bg-white hover:bg-[#FAF9F5]"
          } ${isAnalyzing ? "pointer-events-none opacity-80" : ""}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.png,.jpg,.jpeg,.webp,application/pdf,text/plain,image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={isAnalyzing || disabled}
          />

          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center py-3 space-y-2.5">
              <Loader2 className="w-7 h-7 animate-spin text-[#211A16]" />
              <div className="space-y-0.5">
                <p className="text-xs sm:text-[13px] font-medium text-[#211A16]">
                  {analysisStep || "Analyzing Job Description..."}
                </p>
                <p className="text-[10.5px] font-mono text-[#968E85] uppercase tracking-wider">
                  Extracting requirements & matching candidate skill gap
                </p>
              </div>
            </div>
          ) : selectedFile ? (
            <div className="flex items-center justify-between bg-white border border-[#D8D2C5] rounded-md p-2.5 sm:p-3">
              <div className="flex items-center gap-2.5">
                {selectedFile.type?.includes("image") ? (
                  <ImageIcon className="w-5 h-5 text-[#211A16] shrink-0" />
                ) : (
                  <FileText className="w-5 h-5 text-[#211A16] shrink-0" />
                )}
                <div className="text-left">
                  <p className="text-xs sm:text-sm font-medium text-[#211A16] truncate max-w-[200px] sm:max-w-xs">
                    {selectedFile.name}
                  </p>
                  <p className="text-[10.5px] font-mono text-[#6B635B]">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleReset();
                }}
                className="p-1 text-[#6B635B] hover:text-[#211A16] rounded hover:bg-[#EFECE4] transition-colors"
                aria-label="Remove selected file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-1.5">
              <div className="flex items-center gap-1.5 p-2 bg-[#EAE6DF] border border-[#D8D2C5] rounded-full text-[#211A16] mb-0.5">
                <UploadCloud className="w-4 h-4 text-[#6B635B]" />
                <ImageIcon className="w-4 h-4 text-[#6B635B]" />
              </div>
              <p className="text-xs sm:text-[13px] font-medium text-[#211A16]">
                <span className="font-semibold underline underline-offset-2">Click to upload</span> or drag and drop
              </p>
              <p className="text-[10.5px] font-mono text-[#968E85] uppercase tracking-wider">
                PDF, TXT, or Image Screenshot (PNG, JPG, WEBP • Up to 5MB)
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          <textarea
            rows={4}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            disabled={isAnalyzing || disabled}
            placeholder="Paste full Job Description / LinkedIn Job Posting text here..."
            className="w-full bg-white border border-[#D8D2C5] rounded-lg p-3 text-xs sm:text-sm text-[#211A16] placeholder-[#968E85] focus:outline-none focus:border-[#211A16] focus:ring-1 focus:ring-[#211A16]/20 resize-none font-sans"
          />
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              disabled={isAnalyzing || disabled || !rawText}
            >
              Clear
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={triggerTextAnalysis}
              isLoading={isAnalyzing}
              disabled={isAnalyzing || disabled || rawText.trim().length < 30}
              leftIcon={Sparkles}
            >
              Extract & Match Skills
            </Button>
          </div>
        </div>
      )}

      {/* Error display */}
      {errorMessage && (
        <div className="flex items-start gap-2 p-3 bg-[#F9ECEC] border border-[#ECC8C8] rounded-lg text-[#9B2C2C] text-xs font-mono">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}

