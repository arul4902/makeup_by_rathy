"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

// ========================================================
// ELEGANT LUXURY AUDIO DESIGN (Web Audio API Synthesizer)
// Soft warm room ambience, gentle brush whisper,
// gold jewellery chime, and emotional resolve.
// ========================================================
class BridalTransformationSound {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;
  private brushPlayed: boolean = false;
  private chimePlayed: boolean = false;
  private resolvePlayed: boolean = false;
  private masterGain: GainNode | null = null;
  private droneOsc: OscillatorNode | null = null;

  public unmute() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    this.isMuted = false;
    this.startAmbience();
  }

  public mute() {
    this.isMuted = true;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
    }
  }

  private startAmbience() {
    if (!this.ctx || this.isMuted) return;
    try {
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.masterGain.gain.exponentialRampToValueAtTime(0.07, this.ctx.currentTime + 1.0);
      this.masterGain.connect(this.ctx.destination);

      // Warm golden-hour harmonic drone (110Hz A2)
      this.droneOsc = this.ctx.createOscillator();
      this.droneOsc.type = "sine";
      this.droneOsc.frequency.setValueAtTime(110, this.ctx.currentTime);

      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(280, this.ctx.currentTime);

      this.droneOsc.connect(filter);
      filter.connect(this.masterGain);
      this.droneOsc.start();
    } catch {}
  }

  public triggerBrush() {
    if (!this.ctx || this.isMuted || this.brushPlayed) return;
    this.brushPlayed = true;
    try {
      // Soft whisper of cosmetic brush bristles across cheek
      const bufferSize = this.ctx.sampleRate * 1.2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        data[i] = (b0 + b1 + b2) * 0.025;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const bpFilter = this.ctx.createBiquadFilter();
      bpFilter.type = "bandpass";
      bpFilter.frequency.setValueAtTime(1400, this.ctx.currentTime);
      bpFilter.Q.setValueAtTime(2.0, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.035, this.ctx.currentTime + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.2);

      noise.connect(bpFilter);
      bpFilter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start();
    } catch {}
  }

  public triggerChime() {
    if (!this.ctx || this.isMuted || this.chimePlayed) return;
    this.chimePlayed = true;
    try {
      // Delicate gold jewellery acoustic chime (C6 ~ 1046Hz + E6 ~ 1318Hz)
      const now = this.ctx.currentTime;
      [1046.5, 1318.51].forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.001, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.045, now + idx * 0.08 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 1.8);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 1.9);
      });
    } catch {}
  }

  public triggerResolve() {
    if (!this.ctx || this.isMuted || this.resolvePlayed) return;
    this.resolvePlayed = true;
    try {
      // Warm emotional resolve (A major / E / C# luxury chord)
      const now = this.ctx.currentTime;
      [220, 277.18, 329.63, 440].forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);

        gain.gain.setValueAtTime(0.001, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.03, now + idx * 0.04 + 0.6);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.04 + 2.5);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 2.6);
      });
    } catch {}
  }

  public reset() {
    this.brushPlayed = false;
    this.chimePlayed = false;
    this.resolvePlayed = false;
  }

  public destroy() {
    if (this.droneOsc) {
      try { this.droneOsc.stop(); } catch {}
    }
    if (this.ctx && this.ctx.state !== "closed") {
      try { this.ctx.close(); } catch {}
    }
  }
}

interface OpeningProps {
  onOpeningComplete?: () => void;
}

export default function BridalTransformationOpening({ onOpeningComplete }: OpeningProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const soundRef = useRef<BridalTransformationSound | null>(null);
  const reducedMotion = useReducedMotion();

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(8.5);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [chapter, setChapter] = useState("I · NATURAL BEAUTY (BARE FACE)");
  const [showLightSweep, setShowLightSweep] = useState(false);

  // Initialize sound engine
  useEffect(() => {
    soundRef.current = new BridalTransformationSound();
    return () => {
      soundRef.current?.destroy();
    };
  }, []);

  // Handle reduced motion preference
  useEffect(() => {
    if (reducedMotion) {
      setIsCompleted(true);
      onOpeningComplete?.();
    }
  }, [reducedMotion, onOpeningComplete]);

  // Handle sound toggle
  const toggleSound = () => {
    if (isMuted) {
      soundRef.current?.unmute();
      setIsMuted(false);
    } else {
      soundRef.current?.mute();
      setIsMuted(true);
    }
  };

  // Skip cinematic intro directly to website hero
  const handleSkip = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = videoRef.current.duration || 8.4;
      videoRef.current.pause();
    }
    setIsCompleted(true);
    setShowLightSweep(false);
    onOpeningComplete?.();
  }, [onOpeningComplete]);

  // Replay transformation
  const handleReplay = useCallback(() => {
    setIsCompleted(false);
    setShowLightSweep(false);
    soundRef.current?.reset();
    if (!isMuted) {
      soundRef.current?.unmute();
    }
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [isMuted]);

  // Video time update handler
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const t = videoRef.current.currentTime;
    setCurrentTime(t);

    // Update Transformation Chapters
    if (t < 1.2) {
      setChapter("I · NATURAL BEAUTY (BARE FACE)");
    } else if (t < 2.4) {
      setChapter("II · BRUSH TOUCHES SKIN · RADIANCE AWAKENS");
      if (!isMuted) soundRef.current?.triggerBrush();
    } else if (t < 3.8) {
      setChapter("III · DEFINED WINGED EYELINER & EYES");
    } else if (t < 5.0) {
      setChapter("IV · ARCHITECTURAL HAIR, JASMINE & HEIRLOOM GOLD");
      if (!isMuted) soundRef.current?.triggerChime();
    } else if (t < 6.4) {
      setChapter("V · TEMPLE JEWELLERY & KANCHIPURAM SILK DRAPING");
    } else if (t < 7.8) {
      setChapter("VI · THE ROYAL BRIDAL REVEAL");
      // Trigger the in-camera Before -> After soft vertical light sweep (~7.0s - 7.6s)
      if (t >= 6.8 && t <= 7.8) {
        setShowLightSweep(true);
      } else {
        setShowLightSweep(false);
      }
      if (!isMuted) soundRef.current?.triggerResolve();
    } else {
      setChapter("MAKEUP BY RATHY · BRIDAL ARTISTRY");
      setShowLightSweep(false);
      if (!isCompleted) {
        setIsCompleted(true);
        onOpeningComplete?.();
      }
    }
  };

  const handleEnded = () => {
    setIsCompleted(true);
    setShowLightSweep(false);
    onOpeningComplete?.();
  };

  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <section id="home" className={`bridal-transformation-hero ${isCompleted ? "is-hero-state" : "is-film-state"}`}>
      {/* ========================================================
          BACKGROUND LAYER: PURE WARM IVORY & FINAL MASTER STILL
          Guarantees zero flash or unloaded state.
      ======================================================== */}
      <div className="transformation-backdrop">
        {/* Poster image: natural woman initially; final bride once complete */}
        <img
          src="/media/transform-6-final-bride.jpg"
          alt="Transformed South Indian bride in ivory and gold silk saree by Makeup by Rathy"
          className="transformation-final-still"
          style={{
            opacity: isCompleted ? 1 : 0,
            transition: "opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />

        {/* Initial bare face poster frame (fades out as video starts playing) */}
        <img
          src="/media/transform-1-bare.jpg"
          alt="Natural South Indian woman before makeup by Rathy"
          className="transformation-poster-still"
          style={{
            opacity: isVideoPlaying ? 0 : 1,
            transition: "opacity 0.6s ease-out",
          }}
        />
      </div>

      {/* ========================================================
          CONTINUOUS MASTER VIDEO: "FROM HER -> TO HER BRIDAL MOMENT"
          The EXACT same woman transforms before our eyes:
          Bare face -> Brush -> Eyeliner -> Hair & Jasmine -> Saree -> Complete Bride
      ======================================================== */}
      <video
        ref={videoRef}
        className="transformation-master-video"
        autoPlay
        muted
        playsInline
        preload="auto"
        poster="/media/transform-1-bare.jpg"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => {
          if (videoRef.current) setDuration(videoRef.current.duration);
        }}
        onPlay={() => setIsVideoPlaying(true)}
        onEnded={handleEnded}
      >
        {/* Desktop 16:9 WebM & MP4 */}
        <source src="/media/bridal-transformation.webm" type="video/webm" media="(min-width: 768px)" />
        <source src="/media/bridal-transformation.mp4" type="video/mp4" media="(min-width: 768px)" />
        {/* Mobile 9:16 vertical safe WebM & MP4 */}
        <source src="/media/bridal-transformation-mobile.webm" type="video/webm" media="(max-width: 767px)" />
        <source src="/media/bridal-transformation-mobile.mp4" type="video/mp4" media="(max-width: 767px)" />
      </video>

      {/* ========================================================
          BEFORE -> AFTER CALLBACK (IN-CAMERA VERTICAL LIGHT SWEEP)
          A vertical soft light travels across her:
          On one side: original natural appearance
          On the other: final bridal look.
      ======================================================== */}
      {showLightSweep && (
        <div className="in-camera-before-after-sweep" aria-hidden="true">
          <div className="sweep-beam" />
          <div className="sweep-natural-reveal">
            <img src="/media/transform-1-bare.jpg" alt="" />
          </div>
        </div>
      )}

      {/* Soft golden-hour lighting overlay & left-edge editorial gradient */}
      <div className="transformation-lighting-overlay" />

      {/* ========================================================
          TOP RIGHT CONTROLS: SOUND TOGGLE & SKIP / REPLAY
      ======================================================== */}
      <div className="transformation-top-controls" aria-label="Transformation film controls">
        <button
          type="button"
          className="cinematic-control-btn sound-toggle"
          onClick={toggleSound}
          aria-label={isMuted ? "Unmute ambient bridal soundscape" : "Mute sound"}
        >
          <span className="control-icon">{isMuted ? "🔈" : "🔊"}</span>
          <span className="control-text">{isMuted ? "SOUND ON" : "MUTED"}</span>
        </button>

        {!isCompleted ? (
          <button
            type="button"
            className="cinematic-control-btn skip-intro"
            onClick={handleSkip}
            aria-label="Skip to website hero"
          >
            <span className="control-text">SKIP INTRO</span>
            <span className="control-arrow">→</span>
          </button>
        ) : (
          <button
            type="button"
            className="cinematic-control-btn replay-film"
            onClick={handleReplay}
            aria-label="Replay transformation film"
          >
            <span className="control-icon">↺</span>
            <span className="control-text">REPLAY STORY</span>
          </button>
        )}
      </div>

      {/* ========================================================
          DURING FILM PLAYBACK: CHAPTER STATUS & PROGRESS CUE
          Gently fades out as film completes and becomes website.
      ======================================================== */}
      <div
        className="transformation-playback-status"
        style={{
          opacity: isCompleted ? 0 : 1,
          pointerEvents: "none",
          transition: "opacity 0.8s ease-out, transform 0.8s ease-out",
          transform: isCompleted ? "translateY(16px)" : "translateY(0)",
        }}
        aria-hidden={isCompleted}
      >
        <div className="chapter-eyebrow">FROM HER → TO HER BRIDAL MOMENT</div>
        <div className="chapter-title">{chapter}</div>
        <div className="cinematic-progress-bar">
          <div className="cinematic-progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {/* ========================================================
          THE FILM BECOMES THE WEBSITE HERO (FINAL COMPOSITION)
          No black cut. The completed bride IS the hero composition.
          Brand typography emerges through light as video settles.
      ======================================================== */}
      <div
        className={`transformation-website-hero ${isCompleted ? "is-visible" : "is-hidden"}`}
        style={{
          opacity: isCompleted ? 1 : 0,
          pointerEvents: isCompleted ? "auto" : "none",
          transition: "opacity 1.4s cubic-bezier(0.16, 1, 0.3, 1), transform 1.4s cubic-bezier(0.16, 1, 0.3, 1)",
          transform: isCompleted ? "translateY(0)" : "translateY(24px)",
        }}
      >
        <div className="hero-editorial-panel">
          <span className="hero-refined-eyebrow">
            <span className="champagne-dot" /> CELEBRITY & BRIDAL MAKEUP ARTIST · KOCHI <span className="champagne-dot" />
          </span>

          <h1 className="hero-signature-title">
            MAKEUP BY RATHY
            <span className="hero-signature-subtitle">BRIDAL ARTISTRY</span>
          </h1>

          <div className="hero-signature-poetry">
            <p className="hero-poetry-accent">“Not a different you.</p>
            <p className="hero-poetry-line">The most beautiful version of you.”</p>
          </div>

          <div className="hero-signature-actions">
            <a href="#enquire" className="button button-champagne">
              BOOK YOUR DATE <span>✧</span>
            </a>
            <a href="#services" className="hero-explore-link">
              EXPLORE ARTISTRY <span className="arrow-down">↓</span>
            </a>
          </div>

          <div className="hero-location-tag">
            <span>KOCHI, INDIA</span>
            <i className="gold-separator" />
            <span>AVAILABLE WORLDWIDE</span>
            <i className="gold-separator" />
            <span>PATTANAM CERTIFIED</span>
          </div>
        </div>
      </div>

      {/* Effortless natural scrolling prompt */}
      {isCompleted && (
        <a href="#services" className="cinematic-scroll-prompt" aria-label="Scroll down to services">
          <span className="scroll-prompt-dot" />
          <span className="scroll-prompt-text">SCROLL TO EXPLORE</span>
        </a>
      )}
    </section>
  );
}
