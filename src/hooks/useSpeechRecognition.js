"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [speechError, setSpeechError] = useState(null);

  const recognitionRef = useRef(null);
  const shouldBeListeningRef = useRef(false);
  const interimTranscriptRef = useRef("");

  // Initialize Speech Recognition API
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event) => {
        let currentInterim = "";
        let finalChunk = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const text = result[0].transcript;
          if (result.isFinal) {
            finalChunk += text + " ";
          } else {
            currentInterim += text;
          }
        }

        if (finalChunk) {
          setTranscript((prev) =>
            prev ? `${prev.trim()} ${finalChunk.trim()}` : finalChunk.trim()
          );
        }
        interimTranscriptRef.current = currentInterim;
        setInterimTranscript(currentInterim);
      };

      recognition.onerror = (event) => {
        // "no-speech" error is benign; do not treat as fatal
        if (event.error !== "no-speech") {
          console.warn("Speech recognition warning:", event.error);
          if (event.error === "not-allowed") {
            setSpeechError("Microphone permission was denied.");
          }
        }
      };

      recognition.onend = () => {
        // Commit any pending interim text before restart or end
        if (interimTranscriptRef.current.trim()) {
          setTranscript((prev) =>
            prev
              ? `${prev.trim()} ${interimTranscriptRef.current.trim()}`
              : interimTranscriptRef.current.trim()
          );
          interimTranscriptRef.current = "";
          setInterimTranscript("");
        }

        // If the user hasn't explicitly stopped listening, auto-restart to prevent timeout silence dropouts
        if (shouldBeListeningRef.current) {
          try {
            recognition.start();
          } catch (e) {
            console.debug("Recognition auto-restart ignored:", e);
          }
        } else {
          setIsListening(false);
          setInterimTranscript("");
        }
      };

      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
      console.warn("Web Speech API is not supported in this browser.");
    }

    return () => {
      if (recognitionRef.current) {
        shouldBeListeningRef.current = false;
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore unmount stop errors
        }
      }
    };
  }, []);

  // Start Voice Capture
  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    shouldBeListeningRef.current = true;
    try {
      recognitionRef.current.start();
      setIsListening(true);
      setSpeechError(null);
    } catch (err) {
      console.warn("Speech recognition start failed or already running:", err);
    }
  }, []);

  // Stop Voice Capture
  const stopListening = useCallback(() => {
    shouldBeListeningRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.warn("Speech recognition stop error:", err);
      }
    }
    if (interimTranscriptRef.current.trim()) {
      setTranscript((prev) =>
        prev
          ? `${prev.trim()} ${interimTranscriptRef.current.trim()}`
          : interimTranscriptRef.current.trim()
      );
      interimTranscriptRef.current = "";
    }
    setIsListening(false);
    setInterimTranscript("");
  }, []);

  // Reset Transcript state
  const resetTranscript = useCallback(() => {
    interimTranscriptRef.current = "";
    setTranscript("");
    setInterimTranscript("");
  }, []);

  // Text-to-Speech (AI Spoken Voice)
  const speakText = useCallback(
    (text, onComplete) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        if (onComplete) onComplete();
        return;
      }

      // Stop any existing speech and pause microphone capture to prevent echo
      window.speechSynthesis.cancel();
      const wasListening = shouldBeListeningRef.current;
      if (wasListening) {
        stopListening();
      }

      if (!text || text.trim() === "") {
        if (onComplete) onComplete();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.lang = "en-US";

      // Select a natural-sounding English voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        (v) =>
          v.lang.startsWith("en") &&
          (v.name.includes("Natural") ||
            v.name.includes("Google") ||
            v.name.includes("Samantha") ||
            v.name.includes("Daniel") ||
            v.name.includes("Jenny"))
      );

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        if (onComplete) onComplete();
      };

      utterance.onerror = (err) => {
        console.warn("Speech synthesis error:", err);
        setIsSpeaking(false);
        if (onComplete) onComplete();
      };

      window.speechSynthesis.speak(utterance);
    },
    [stopListening]
  );

  // Cancel any ongoing AI speech
  const cancelSpeech = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    isSpeaking,
    isSupported,
    speechError,
    startListening,
    stopListening,
    resetTranscript,
    setTranscript,
    speakText,
    cancelSpeech,
  };
}
