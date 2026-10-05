"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

const CinematicCanvas = dynamic(() => import("./CinematicCanvas"), { ssr: false });

export default function LuxuryHero({ onProgressChange }: { onProgressChange?: (p: number) => void }) {
  const containerRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    let animationFrameId: number;

    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalScrollable = containerRef.current.offsetHeight - window.innerHeight;
      if (totalScrollable <= 0) return;

      const currentScroll = -rect.top;
      const rawProgress = Math.max(0, Math.min(1, currentScroll / totalScrollable));

      setProgress(rawProgress);
      onProgressChange?.(rawProgress);
    };

    const onScroll = () => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(handleScroll);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, [onProgressChange]);

  // SCENE 01: Golden Hour Overexposure (0.00 -> 0.07)
  const overexposureOpacity = Math.max(0, 1 - progress / 0.065);

  // SCENE 06 & 07: Veil Diffusion Transition (0.46 -> 0.54)
  const veilGlowOpacity =
    progress >= 0.46 && progress <= 0.54
      ? Math.sin(((progress - 0.46) / 0.08) * Math.PI) * 0.75
      : 0;

  // SCENE 07: Rathy Brand Reveal (0.54 -> 0.64)
  const brandRevealOpacity =
    progress >= 0.54 && progress <= 0.64
      ? Math.sin(((progress - 0.54) / 0.1) * Math.PI)
      : 0;

  // SCENE 11: Cinematic Montage Badges (0.86 -> 0.94)
  const isEyeMontage = progress >= 0.86 && progress < 0.89;
  const isJewelMontage = progress >= 0.89 && progress < 0.92;
  const isHairMontage = progress >= 0.92 && progress < 0.95;

  // SCENE 12: Final Hero Shot & Campaign CTA (0.94 -> 1.00)
  const finaleOpacity = Math.max(0, (progress - 0.93) / 0.07);

  return (
    <section id="home" className="luxury-hero" ref={containerRef}>
      <div className="luxury-hero-sticky">
        {/* Soft pearl / warm ivory ambient backdrop */}
        <div className="luxury-hero-ambient" />

        {/* Photorealistic 3D Cinematic Canvas (Vanity studio, golden sun rays, curtains, tiara, veil, brush) */}
        <CinematicCanvas progress={progress} />

        {/* =======================================================
            SCENE 01: OVEREXPOSURE WARM SUNLIGHT FLASH (FADES GENTLY)
        ======================================================= */}
        <div
          className="hero-overexposure-layer"
          style={{
            opacity: overexposureOpacity,
            pointerEvents: "none",
          }}
        />

        {/* =======================================================
            SCENE 06: VEIL DIFFUSED DREAMY IVORY TRANSITION
        ======================================================= */}
        <div
          className="hero-veil-diffuse-layer"
          style={{
            opacity: veilGlowOpacity,
            pointerEvents: "none",
          }}
        />

        {/* =======================================================
            SCENE 07: RATHY BRAND REVEAL (EMERGES BEHIND VEIL)
        ======================================================= */}
        <div
          className="hero-brand-reveal-layer"
          style={{
            opacity: brandRevealOpacity,
            transform: `translate(-50%, -50%) scale(${1 + (progress - 0.59) * 0.08})`,
            pointerEvents: "none",
          }}
        >
          <span className="hero-refined-eyebrow justify-center">
            <span className="champagne-dot" /> BRIDAL ARTISTRY <span className="champagne-dot" />
          </span>
          <h1 className="hero-brand-title">
            MAKEUP BY RATHY
          </h1>
          <p className="hero-brand-subtitle">
            Kochi · Available Worldwide
          </p>
        </div>

        {/* =======================================================
            SCENE 11: BEAUTY DETAIL MONTAGE BADGES
        ======================================================= */}
        <div className="hero-closeup-tag-wrap" aria-hidden="true">
          {isEyeMontage && (
            <div className="closeup-tag">
              <span className="closeup-number">01</span>
              <div>
                <strong>THE EYES</strong>
                <span>Radiant, sculpted definition</span>
              </div>
            </div>
          )}
          {isJewelMontage && (
            <div className="closeup-tag">
              <span className="closeup-number">02</span>
              <div>
                <strong>HEIRLOOM GOLD</strong>
                <span>Intricate Kerala traditions</span>
              </div>
            </div>
          )}
          {isHairMontage && (
            <div className="closeup-tag">
              <span className="closeup-number">03</span>
              <div>
                <strong>ARCHITECTURAL HAIR</strong>
                <span>Jasmine & contemporary drape</span>
              </div>
            </div>
          )}
        </div>

        {/* =======================================================
            SCENE 12: FINAL HERO SHOT & CAMPAIGN COMPOSITION
        ======================================================= */}
        <div
          className="hero-finale-layer"
          style={{
            opacity: finaleOpacity,
            pointerEvents: finaleOpacity > 0.6 ? "auto" : "none",
          }}
        >
          <div className="hero-finale-content">
            <span className="hero-refined-eyebrow">
              <span className="champagne-dot" /> CELEBRITY & BRIDAL MAKEUP ARTIST · KOCHI <span className="champagne-dot" />
            </span>
            <h2 className="hero-finale-heading">
              Your moment.<br />
              Your beauty.<br />
              <em>A look that feels like you.</em>
            </h2>
            <div className="hero-finale-actions">
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
            </div>
          </div>
        </div>

        {/* Cinematic Scroll Indicator (Visible during initial scenes) */}
        <div
          className="hero-cinematic-scroll-cue"
          style={{
            opacity: Math.max(0, 1 - progress / 0.12),
            pointerEvents: "none",
          }}
        >
          <span className="mouse-wheel-cue" />
          <span>SCROLL TO ENTER</span>
        </div>
      </div>
    </section>
  );
}
