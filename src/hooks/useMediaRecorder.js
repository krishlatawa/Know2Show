"use client";

import { useState, useRef, useCallback, useEffect } from "react";

/**
 * Custom hook for capturing audio/video recordings from an active MediaStream
 * using the standard HTML5 MediaRecorder API.
 */
export function useMediaRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [mediaBlob, setMediaBlob] = useState(null);
  const [mediaUrl, setMediaUrl] = useState(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [error, setError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  // Helper to pick the best supported MIME type across Chrome, Safari, Firefox, Edge
  const getSupportedMimeType = useCallback(() => {
    if (typeof window === "undefined" || !window.MediaRecorder) return "";

    const candidateTypes = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm;codecs=h264,opus",
      "video/webm",
      "video/mp4;codecs=avc1,mp4a",
      "video/mp4",
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/mp4",
    ];

    for (const type of candidateTypes) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return "";
  }, []);

  // Start recording from an active MediaStream
  const startRecording = useCallback(
    (stream) => {
      if (!stream || !stream.active) {
        console.warn("useMediaRecorder: Provided stream is not active or null.");
        return false;
      }

      try {
        setError(null);
        chunksRef.current = [];
        setRecordingDuration(0);

        const mimeType = getSupportedMimeType();
        const options = mimeType ? { mimeType } : {};

        const recorder = new MediaRecorder(stream, options);
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            chunksRef.current.push(event.data);
          }
        };

        recorder.onstop = () => {
          if (chunksRef.current.length > 0) {
            const finalMimeType = mimeType || "video/webm";
            const blob = new Blob(chunksRef.current, { type: finalMimeType });
            const url = URL.createObjectURL(blob);

            setMediaBlob(blob);
            setMediaUrl(url);
          }
          setIsRecording(false);
          setIsPaused(false);
          clearInterval(timerRef.current);
        };

        recorder.onerror = (event) => {
          console.error("MediaRecorder runtime error:", event.error);
          setError(event.error?.message || "Recording error occurred.");
          setIsRecording(false);
          clearInterval(timerRef.current);
        };

        // Collect chunks every 1000ms (1 second) for stability
        recorder.start(1000);
        setIsRecording(true);
        setIsPaused(false);

        // Duration counter
        timerRef.current = setInterval(() => {
          setRecordingDuration((prev) => prev + 1);
        }, 1000);

        return true;
      } catch (err) {
        console.error("Failed to start MediaRecorder:", err);
        setError(err.message || "Failed to initialize video recording.");
        return false;
      }
    },
    [getSupportedMimeType]
  );

  // Pause recording
  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      clearInterval(timerRef.current);
    }
  }, []);

  // Resume recording
  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    }
  }, []);

  // Stop recording and compile final Blob
  const stopRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      (mediaRecorderRef.current.state === "recording" ||
        mediaRecorderRef.current.state === "paused")
    ) {
      mediaRecorderRef.current.stop();
    }
    clearInterval(timerRef.current);
  }, []);

  // Clean up object URLs on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      if (mediaUrl) {
        URL.revokeObjectURL(mediaUrl);
      }
    };
  }, [mediaUrl]);

  return {
    isRecording,
    isPaused,
    mediaBlob,
    mediaUrl,
    recordingDuration,
    error,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
  };
}

export default useMediaRecorder;
