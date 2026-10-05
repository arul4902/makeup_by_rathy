"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const TOTAL_FRAMES = 240;

const getFramePath = (index: number) => {
  const num = String(index + 1).padStart(3, "0");
  return `/bridal-sequence/frame_${num}.webp`;
};

export default function ScrollBridalTransformationHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const introTextRef = useRef<HTMLDivElement>(null);
  const scrollCueRef = useRef<HTMLDivElement>(null);
  const finaleTextRef = useRef<HTMLDivElement>(null);
  const overlayProgressRef = useRef<HTMLDivElement>(null);

  const imagesRef = useRef<(HTMLImageElement | null)[]>(new Array(TOTAL_FRAMES).fill(null));
  const loadedRef = useRef<boolean[]>(new Array(TOTAL_FRAMES).fill(false));
  const currentFrameRef = useRef<number>(0);
  const isRenderingRef = useRef<boolean>(false);
  const hasLoadedInitialRef = useRef<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadProgress, setLoadProgress] = useState<number>(0);
  const reducedMotion = useReducedMotion();

  // Draw image to canvas using object-fit: cover
  const drawImageCover = useCallback((img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth || 1280;
    const ih = img.naturalHeight || 720;

    const imgRatio = iw / ih;
    const canvasRatio = cw / ch;

    let renderWidth = cw;
    let renderHeight = ch;
    let xOffset = 0;
    let yOffset = 0;

    if (canvasRatio > imgRatio) {
      renderHeight = cw / imgRatio;
      yOffset = (ch - renderHeight) / 2;
    } else {
      renderWidth = ch * imgRatio;
      xOffset = (cw - renderWidth) / 2;
    }

    ctx.drawImage(img, xOffset, yOffset, renderWidth, renderHeight);
  }, []);

  // Find the nearest loaded frame if the target frame is still downloading
  const getNearestLoadedImage = useCallback((targetIndex: number): HTMLImageElement | null => {
    if (loadedRef.current[targetIndex] && imagesRef.current[targetIndex]) {
      return imagesRef.current[targetIndex];
    }
    // Search outwards in both directions
    for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
      const left = targetIndex - offset;
      if (left >= 0 && loadedRef.current[left] && imagesRef.current[left]) {
        return imagesRef.current[left];
      }
      const right = targetIndex + offset;
      if (right < TOTAL_FRAMES && loadedRef.current[right] && imagesRef.current[right]) {
        return imagesRef.current[right];
      }
    }
    return null;
  }, []);

  // Request Animation Frame render scheduler
  const renderFrame = useCallback((frameIndex: number) => {
    currentFrameRef.current = frameIndex;
    if (isRenderingRef.current) return;
    isRenderingRef.current = true;

    requestAnimationFrame(() => {
      isRenderingRef.current = false;
      const img = getNearestLoadedImage(currentFrameRef.current);
      if (img) {
        drawImageCover(img);
      }
    });
  }, [getNearestLoadedImage, drawImageCover]);

  // Canvas resize with DPR support
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
    }

    renderFrame(currentFrameRef.current);
  }, [renderFrame]);

  // Preload frames intelligently:
  // Step 1: Preload first 12 frames + every 10th frame (keyframes) to unlock immediate interaction
  // Step 2: Stream remaining frames in background without blocking main thread
  useEffect(() => {
    let isCancelled = false;

    const preloadImage = (index: number): Promise<HTMLImageElement> => {
      return new Promise((resolve) => {
        if (imagesRef.current[index] && loadedRef.current[index]) {
          resolve(imagesRef.current[index]!);
          return;
        }
        const img = new Image();
        img.src = getFramePath(index);
        img.onload = () => {
          if (isCancelled) return;
          imagesRef.current[index] = img;
          loadedRef.current[index] = true;
          resolve(img);
        };
        img.onerror = () => {
          resolve(img);
        };
      });
    };

    const loadSequence = async () => {
      // 1. Critical first batch (Frame 0 to 12)
      const initialIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
      // Add keyframes across the sequence
      for (let i = 20; i < TOTAL_FRAMES; i += 15) {
        initialIndices.push(i);
      }
      initialIndices.push(TOTAL_FRAMES - 1); // final frame

      let loadedCount = 0;
      await Promise.all(
        initialIndices.map(async (idx) => {
          await preloadImage(idx);
          loadedCount++;
          if (!isCancelled) {
            setLoadProgress(Math.round((loadedCount / initialIndices.length) * 100));
          }
        })
      );

      if (isCancelled) return;

      // Draw initial frame immediately
      hasLoadedInitialRef.current = true;
      setIsLoading(false);
      renderFrame(0);

      // 2. Stream remaining frames in background batches
      const remainingIndices: number[] = [];
      for (let i = 0; i < TOTAL_FRAMES; i++) {
        if (!loadedRef.current[i]) {
          remainingIndices.push(i);
        }
      }

      const batchSize = 6;
      for (let b = 0; b < remainingIndices.length; b += batchSize) {
        if (isCancelled) break;
        const currentBatch = remainingIndices.slice(b, b + batchSize);
        await Promise.all(currentBatch.map((idx) => preloadImage(idx)));
        // Yield to browser main thread
        await new Promise((r) => setTimeout(r, 16));
      }
    };

    loadSequence();

    return () => {
      isCancelled = true;
    };
  }, [renderFrame]);

  // Window resize listener
  useEffect(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas, { passive: true });
    window.addEventListener("orientationchange", resizeCanvas, { passive: true });
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("orientationchange", resizeCanvas);
    };
  }, [resizeCanvas]);

  // Setup GSAP ScrollTrigger
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const container = containerRef.current;
    if (!container) return;

    const st = ScrollTrigger.create({
      trigger: container,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.1, // Smooth scrub response
      onUpdate: (self) => {
        const p = self.progress;

        // Map scroll progress (0 to 1) directly to frame count (0 to 239)
        const frameIndex = Math.min(
          TOTAL_FRAMES - 1,
          Math.max(0, Math.floor(p * (TOTAL_FRAMES - 1)))
        );

        renderFrame(frameIndex);

        // Update progress bar
        if (overlayProgressRef.current) {
          overlayProgressRef.current.style.width = `${p * 100}%`;
        }

        // 1. Beginning Text Reveal ("Every Bride Has a Story.")
        // Visible at 0.00 -> 0.12, gently fades out by 0.20
        if (introTextRef.current) {
          const introOpacity = p < 0.12 ? 1 : Math.max(0, 1 - (p - 0.12) / 0.08);
          introTextRef.current.style.opacity = String(introOpacity);
          introTextRef.current.style.transform = `translateY(${p * -40}px)`;
        }

        // Scroll Cue Indicator (Fades out by 0.08)
        if (scrollCueRef.current) {
          const cueOpacity = Math.max(0, 1 - p / 0.06);
          scrollCueRef.current.style.opacity = String(cueOpacity);
        }

        // 2. Final Bridal Reveal Text ("Let Yours Begin Beautifully." + CTA)
        // Emerges gently as the bridal look completes from 0.80 -> 1.00
        if (finaleTextRef.current) {
          const finaleOpacity = p < 0.78 ? 0 : Math.min(1, (p - 0.78) / 0.14);
          finaleTextRef.current.style.opacity = String(finaleOpacity);
          finaleTextRef.current.style.transform = `translateY(${Math.max(0, (1 - finaleOpacity) * 20)}px)`;
          finaleTextRef.current.style.pointerEvents = finaleOpacity > 0.5 ? "auto" : "none";
        }
      },
    });

    return () => {
      st.kill();
    };
  }, [renderFrame]);

  // Reduced motion: jump straight to the final frame if requested
  useEffect(() => {
    if (reducedMotion && loadedRef.current[TOTAL_FRAMES - 1]) {
      renderFrame(TOTAL_FRAMES - 1);
    }
  }, [reducedMotion, renderFrame]);

  return (
    <section id="home" className="scroll-bridal-hero" ref={containerRef}>
      {/* 400vh Sticky Viewport */}
      <div className="scroll-bridal-sticky">
        {/* Canvas for 60fps Frame Sequence Rendering */}
        <canvas
          ref={canvasRef}
          className="scroll-bridal-canvas"
          aria-label="Interactive bridal transformation sequence controlled by scrolling"
        />

        {/* Soft Cinematic Vignette & Ambient Golden Studio Glow */}
        <div className="scroll-cinematic-vignette" />

        {/* Subtle Horizontal Scrub Progress Indicator */}
        <div className="scroll-sequence-progress" aria-hidden="true">
          <div ref={overlayProgressRef} className="scroll-sequence-progress-bar" />
        </div>

        {/* ========================================================
            OPENING TYPOGRAPHY (0.00 – 0.18 SCROLL PROGRESS)
            Subtle, elegant, non-intrusive
        ======================================================== */}
        <div ref={introTextRef} className="scroll-intro-overlay">
          <span className="scroll-refined-eyebrow">
            <span className="champagne-dot" /> MAKEUP BY RATHY <span className="champagne-dot" />
          </span>
          <h1 className="scroll-intro-title">
            Every Bride Has a Story.
          </h1>
          <p className="scroll-intro-subtitle">
            An intimate journey of bridal artistry, captured in light.
          </p>
        </div>

        {/* Initial Scroll Cue */}
        <div ref={scrollCueRef} className="scroll-prompt-indicator" aria-hidden="true">
          <div className="scroll-mouse-wheel">
            <span className="scroll-wheel-dot" />
          </div>
          <span>SCROLL TO TRANSFORM</span>
        </div>

        {/* ========================================================
            FINALE BRIDAL TYPOGRAPHY & CTA (0.78 – 1.00 SCROLL PROGRESS)
            Flows seamlessly into the website hero composition
        ======================================================== */}
        <div ref={finaleTextRef} className="scroll-finale-overlay">
          <span className="scroll-refined-eyebrow">
            <span className="champagne-dot" /> BRIDAL ARTISTRY · KOCHI <span className="champagne-dot" />
          </span>

          <h2 className="scroll-finale-poetry">
            Let Yours Begin<br />
            <em>Beautifully.</em>
          </h2>

          <p className="scroll-finale-tagline">
            “Not a different you. The most beautiful version of you.”
          </p>

          <div className="scroll-finale-actions">
            <a href="#enquire" className="button button-champagne">
              BOOK YOUR BRIDAL LOOK <span>✧</span>
            </a>
            <a href="#services" className="scroll-explore-link">
              EXPLORE ARTISTRY <span className="arrow-down">↓</span>
            </a>
          </div>

          <div className="scroll-location-badge">
            <span>KOCHI, INDIA</span>
            <i className="gold-separator" />
            <span>AVAILABLE WORLDWIDE</span>
            <i className="gold-separator" />
            <span>PATTANAM CERTIFIED</span>
          </div>
        </div>

        {/* Loading Screen during initial critical frame load */}
        {isLoading && (
          <div className="scroll-loading-screen" aria-live="polite">
            <div className="scroll-loading-card">
              <span className="scroll-loading-brand">RATHY BAIJU</span>
              <span className="scroll-loading-sub">BRIDAL ARTISTRY</span>
              <div className="scroll-loading-track">
                <div
                  className="scroll-loading-bar"
                  style={{ width: `${loadProgress}%` }}
                />
              </div>
              <p className="scroll-loading-label">Preparing bridal transformation...</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
