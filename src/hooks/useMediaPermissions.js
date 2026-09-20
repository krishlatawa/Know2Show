"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export function useMediaPermissions({ initialVideo = true, initialAudio = true } = {}) {
  const [stream, setStream] = useState(null);
  const [videoEnabled, setVideoEnabled] = useState(initialVideo);
  const [audioEnabled, setAudioEnabled] = useState(initialAudio);
  const [hasPermission, setHasPermission] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [permissionError, setPermissionError] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0); // 0 to 100

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const streamRef = useRef(null);

  // Monitor audio volume level using Web Audio API
  const startAudioMeter = useCallback((mediaStream) => {
    try {
      if (audioContextRef.current) {
        try {
          audioContextRef.current.close();
        } catch (_) {}
      }

      const audioTracks = mediaStream.getAudioTracks();
      if (audioTracks.length === 0) return;

      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;

      const audioCtx = new AudioContext();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;

      const source = audioCtx.createMediaStreamSource(mediaStream);
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        // Normalize 0-128 to 0-100 percentage
        const normalized = Math.min(100, Math.round((avg / 128) * 100));
        setAudioLevel(normalized);

        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };

      updateVolume();
    } catch (err) {
      console.warn("Could not start audio level analyser:", err);
    }
  }, []);

  const stopAudioMeter = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      try {
        audioContextRef.current.close();
      } catch (_) {}
      audioContextRef.current = null;
    }
    setAudioLevel(0);
  }, []);

  const stopMedia = useCallback(() => {
    stopAudioMeter();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setStream(null);
    setHasPermission(false);
  }, [stopAudioMeter]);

  const requestMedia = useCallback(
    async (enableVid = true, enableAud = true) => {
      if (typeof window === "undefined" || !navigator?.mediaDevices?.getUserMedia) {
        setPermissionError("Camera/Microphone API is not supported in this browser.");
        return null;
      }

      setIsRequesting(true);
      setPermissionError(null);

      try {
        stopMedia();

        const constraints = {
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
          audio: { echoCancellation: true, noiseSuppression: true },
        };

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

        // Apply initial enabled states to tracks
        mediaStream.getVideoTracks().forEach((track) => {
          track.enabled = enableVid;
        });
        mediaStream.getAudioTracks().forEach((track) => {
          track.enabled = enableAud;
        });

        streamRef.current = mediaStream;
        setStream(mediaStream);
        setHasPermission(true);
        setVideoEnabled(enableVid);
        setAudioEnabled(enableAud);

        if (enableAud) {
          startAudioMeter(mediaStream);
        }

        setIsRequesting(false);
        return mediaStream;
      } catch (err) {
        console.warn("Media permissions request error:", err);
        let errorMsg = "Could not access camera or microphone.";
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          errorMsg = "Camera/Microphone permission was denied. Please allow browser access.";
        } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
          errorMsg = "No camera or microphone device found on this system.";
        } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
          errorMsg = "Camera or microphone is already in use by another application.";
        }

        setPermissionError(errorMsg);
        setHasPermission(false);
        setIsRequesting(false);
        return null;
      }
    },
    [startAudioMeter, stopMedia]
  );

  const toggleVideo = useCallback(() => {
    if (streamRef.current) {
      const tracks = streamRef.current.getVideoTracks();
      if (tracks.length > 0) {
        const nextState = !videoEnabled;
        tracks.forEach((track) => {
          track.enabled = nextState;
        });
        setVideoEnabled(nextState);
      }
    } else {
      setVideoEnabled((prev) => !prev);
    }
  }, [videoEnabled]);

  const toggleAudio = useCallback(() => {
    if (streamRef.current) {
      const tracks = streamRef.current.getAudioTracks();
      if (tracks.length > 0) {
        const nextState = !audioEnabled;
        tracks.forEach((track) => {
          track.enabled = nextState;
        });
        setAudioEnabled(nextState);
        if (!nextState) {
          setAudioLevel(0);
        }
      }
    } else {
      setAudioEnabled((prev) => !prev);
    }
  }, [audioEnabled]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      stopMedia();
    };
  }, [stopMedia]);

  return {
    stream,
    videoEnabled,
    audioEnabled,
    hasPermission,
    isRequesting,
    permissionError,
    audioLevel,
    requestMedia,
    stopMedia,
    toggleVideo,
    toggleAudio,
  };
}
