"use client";
import { useState, useRef } from "react";

export default function TransformationReveal({
  before,
  after,
  alt,
}: {
  before: string;
  after: string;
  alt: string;
  cinematic?: boolean;
  frame?: any;
}) {
  const [amount, setAmount] = useState(50);
  const comparison = useRef<HTMLDivElement>(null);

  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setAmount(val);
    comparison.current?.style.setProperty("--reveal", String(val / 100));
  };

  return (
    <section className="transformation section-pad" id="transformation">
      <div className="transformation-inner">
        <div className="transformation-copy">
          <span className="eyebrow">
            <span className="champagne-dot" /> 02 / TRANSFORMATION <span className="champagne-dot" />
          </span>
          <h2>
            Still you.<br />
            <em>Beautifully revealed.</em>
          </h2>
          <p className="lead-quote">“The difference is in the considered details.”</p>
          <p className="transformation-note">
            An authentic transformation from Rathy’s studio chair. Captured in natural light to preserve true skin texture and tone without artificial filters.
          </p>
          <a href="/media/film-3.mp4" target="_blank" rel="noreferrer" className="text-link">
            WATCH THE ORIGINAL STUDIO FILM →
          </a>
        </div>

        <div className="comparison-wrap">
          <div
            ref={comparison}
            className="comparison"
            style={{ "--reveal": amount / 100 } as React.CSSProperties}
          >
            <img src={before} alt={`Before makeup: ${alt}`} loading="lazy" />
            <img
              className="finished-look"
              src={after}
              alt={`Finished bridal makeup: ${alt}`}
              loading="lazy"
              style={{ clipPath: `inset(0 ${100 - amount}% 0 0)` }}
            />
            <div className="comparison-line" style={{ left: `${amount}%` }}>
              <span>✧</span>
            </div>
            <span className="comparison-before">BEFORE</span>
            <span className="comparison-after">AFTER</span>
          </div>

          <label className="comparison-control">
            SLIDE TO REVEAL TRANSFORMATION
            <input
              type="range"
              min="0"
              max="100"
              value={amount}
              onChange={handleSlider}
              aria-label="Reveal before and after makeup"
            />
          </label>
          <span className="comparison-source">AUTHENTIC STILLS FROM THE ORIGINAL TRANSFORMATION FILM</span>
        </div>
      </div>
    </section>
  );
}
