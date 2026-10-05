"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

// ========================================================
// ELEGANT LUXURY AUDIO DESIGN (Web Audio API Synthesizer)
// Soft warm room ambience, delicate powder/silk whisper,
// jewellery chime, and elegant harmonic resolve.
// ========================================================
class BridalCinematicSound {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;
  private chimePlayed: boolean = false;
  private resolvePlayed: boolean = false;
  private whisperPlayed: boolean = false;
  private masterGain: GainNode | null = null;
  private droneOsc: OscillatorNode | null = null;

  constructor() {
    // Created lazily upon first un-mute / user interaction
  }

  public unmute() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    this.isMuted = false;
    this.startWarmAmbience();
  }

  public mute() {
    this.isMuted = true;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
    }
  }

  private startWarmAmbience() {
    if (!this.ctx || this.isMuted) return;
    try {
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      this.masterGain.gain.exponentialRampToValueAtTime(0.08, this.ctx.currentTime + 1.2);
      this.masterGain.connect(this.ctx.destination);

      // Warm golden-hour harmonic drone (110Hz A2 fundamental)
      this.droneOsc = this.ctx.createOscillator();
      this.droneOsc.type = "sine";
      this.droneOsc.frequency.setValueAtTime(110, this.ctx.currentTime);

      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(320, this.ctx.currentTime);

      this.droneOsc.connect(filter);
      filter.connect(this.masterGain);
      this.droneOsc.start();
    } catch {
      // Audio context might be restricted; gracefully handled
    }
  }

  public triggerWhisper() {
    if (!this.ctx || this.isMuted || this.whisperPlayed) return;
    this.whisperPlayed = true;
    try {
      // Subtle powder/silk movement (pink noise filtered)
      const bufferSize = this.ctx.sampleRate * 1.5;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        data[i] = (b0 + b1 + b2) * 0.035;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const bpFilter = this.ctx.createBiquadFilter();
      bpFilter.type = "bandpass";
      bpFilter.frequency.setValueAtTime(1200, this.ctx.currentTime);
      bpFilter.Q.setValueAtTime(1.8, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.04, this.ctx.currentTime + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.4);

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
      // Delicate gold jewellery acoustic chime (C6 ~ 1046Hz + G6 ~ 1567Hz)
      const now = this.ctx.currentTime;
      [1046.5, 1567.98].forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.001, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.05, now + idx * 0.08 + 0.03);
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
        gain.gain.exponentialRampToValueAtTime(0.035, now + idx * 0.04 + 0.6);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.04 + 2.5);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 2.6);
      });
    } catch {}
  }

  public reset() {
    this.chimePlayed = false;
    this.resolvePlayed = false;
    this.whisperPlayed = false;
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

interface SignatureOpeningProps {
  onOpeningComplete?: () => void;
}

export default function CinematicSignatureOpening({ onOpeningComplete }: SignatureOpeningProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const soundRef = useRef<BridalCinematicSound | null>(null);
  const reducedMotion = useReducedMotion();

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(10);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [chapter, setChapter] = useState("I · THE LIGHT & COSMETIC PIGMENT");

  // Initialize sound engine
  useEffect(() => {
    soundRef.current = new BridalCinematicSound();
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
      videoRef.current.currentTime = videoRef.current.duration || 9.9;
      videoRef.current.pause();
    }
    setIsCompleted(true);
    onOpeningComplete?.();
  }, [onOpeningComplete]);

  // Replay cinematic intro
  const handleReplay = useCallback(() => {
    setIsCompleted(false);
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

    // Update Story Chapters
    if (t < 2.3) {
      setChapter("I · THE SUNBEAM & COSMETIC PIGMENT");
      if (t > 1.2 && !isMuted) soundRef.current?.triggerWhisper();
    } else if (t < 4.2) {
      setChapter("II · PIGMENT WEAVES INTO IVORY SILK VEIL");
      if (t > 2.5 && !isMuted) soundRef.current?.triggerWhisper();
    } else if (t < 6.0) {
      setChapter("III · ZERO-GRAVITY JASMINE & HEIRLOOM GOLD");
      if (t > 4.5 && !isMuted) soundRef.current?.triggerChime();
    } else if (t < 7.5) {
      setChapter("IV · THE BRIDE EMERGES IN LIGHT");
      if (t > 6.8 && !isMuted) soundRef.current?.triggerResolve();
    } else {
      setChapter("MAKEUP BY RATHY · BRIDAL ARTISTRY");
      if (!isMuted) soundRef.current?.triggerResolve();
    }

    // Seamless transition trigger ~0.8s before absolute end
    if (t >= 7.8 && !isCompleted) {
      setIsCompleted(true);
      onOpeningComplete?.();
    }
  };

  const handleEnded = () => {
    setIsCompleted(true);
    onOpeningComplete?.();
  };

  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <section id="home" className={`signature-cinematic-hero ${isCompleted ? "is-hero-state" : "is-film-state"}`}>
      {/* ========================================================
          BACKGROUND LAYER: PURE WARM IVORY & FINAL MASTER STILL
      ======================================================== */}
      <div className="cinematic-backdrop">
        <img
          src="/media/cinematic-6-bride.jpg"
          alt="Royal bride in ivory and gold silk saree by Makeup by Rathy"
          className="cinematic-final-still"
          style={{
            opacity: isCompleted ? 1 : 0,
            transition: "opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />
      </div>

      {/* ========================================================
          VIDEO FILM: "THE BIRTH OF A BRIDAL LOOK"
          Photorealistic material transformation:
          Pigment -> Fibres -> Silk -> Veil -> Jasmine -> Gold -> Bride
      ======================================================== */}
      <video
        ref={videoRef}
        className="cinematic-master-video"
        autoPlay
        muted
        playsInline
        preload="auto"
        poster="/media/cinematic-1-particle.jpg"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => {
          if (videoRef.current) setDuration(videoRef.current.duration);
        }}
        onPlay={() => setIsPlaying(true)}
        onEnded={handleEnded}
        style={{
          // Freeze seamlessly on final frame
          opacity: 1,
        }}
      >
        <source src="/media/birth-of-a-bridal-look.mp4" type="video/mp4" media="(min-width: 768px)" />
        <source src="/media/birth-of-a-bridal-look-mobile.mp4" type="video/mp4" />
      </video>

      {/* Warm ivory vignette & soft editorial grade */}
      <div className="cinematic-lighting-overlay" />

      {/* ========================================================
          TOP RIGHT CONTROLS: SOUND TOGGLE & SKIP / REPLAY
      ======================================================== */}
      <div className="cinematic-top-controls" aria-label="Cinematic film controls">
        <button
          type="button"
          className="cinematic-control-btn sound-toggle"
          onClick={toggleSound}
          aria-label={isMuted ? "Unmute cinematic ambient soundscape" : "Mute sound"}
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
            aria-label="Replay signature cinematic film"
          >
            <span className="control-icon">↺</span>
            <span className="control-text">REPLAY FILM</span>
          </button>
        )}
      </div>

      {/* ========================================================
          DURING FILM PLAYBACK: REFINED CHAPTER CUE & PROGRESS
          Disappears gracefully when the film becomes the website.
      ======================================================== */}
      <div
        className="cinematic-playback-status"
        style={{
          opacity: isCompleted ? 0 : 1,
          pointerEvents: "none",
          transition: "opacity 0.8s ease-out, transform 0.8s ease-out",
          transform: isCompleted ? "translateY(16px)" : "translateY(0)",
        }}
        aria-hidden={isCompleted}
      >
        <div className="chapter-eyebrow">THE BIRTH OF A BRIDAL LOOK</div>
        <div className="chapter-title">{chapter}</div>
        <div className="cinematic-progress-bar">
          <div className="cinematic-progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {/* ========================================================
          THE FILM BECOMES THE WEBSITE HERO (FINAL COMPOSITION)
          No cut. No fade to black.
          Brand typography emerges through light as camera rests on bride.
      ======================================================== */}
      <div
        className={`cinematic-website-hero ${isCompleted ? "is-visible" : "is-hidden"}`}
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
            <p className="hero-poetry-line">Your moment.</p>
            <p className="hero-poetry-line">Your beauty.</p>
            <p className="hero-poetry-accent">A look that feels like you.</p>
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

      {/* Subtle indicator for effortless normal scrolling */}
      {isCompleted && (
        <a href="#services" className="cinematic-scroll-prompt" aria-label="Scroll down to services">
          <span className="scroll-prompt-dot" />
          <span className="scroll-prompt-text">SCROLL TO EXPLORE</span>
        </a>
      )}
    </section>
  );
}
