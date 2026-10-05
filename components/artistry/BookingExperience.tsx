"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { instagram, whatsapp } from "./content";

const SculptureCanvas = dynamic(() => import("./SculptureCanvas"), { ssr: false });

export default function BookingExperience() {
  const [summary, setSummary] = useState("");
  const [copied, setCopied] = useState(false);
  const [today, setToday] = useState("");

  useEffect(() => {
    setToday(new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }));
  }, []);

  function prepare(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    const data = new FormData(event.currentTarget);
    setSummary([
      "Hello Rathy! I'd like to enquire about bridal makeup availability.",
      "",
      ...Array.from(data.entries())
        .filter(([, v]) => String(v).trim())
        .map(([k, v]) => `${k}: ${v}`),
    ].join("\n"));
    setCopied(false);
    setTimeout(() => document.getElementById("request-ready")?.focus(), 0);
  }

  return (
    <section id="enquire" className="booking section-pad">
      <div className="booking-intro">
        {/* Subtle minimal 3D champagne ring / curved beauty sculpture */}
        <SculptureCanvas />

        <div className="booking-intro-text">
          <span className="eyebrow">
            <span className="champagne-dot" /> 06 / RESERVATIONS <span className="champagne-dot" />
          </span>
          <h2>
            YOUR BRIDAL STORY<br />
            <em>BEGINS HERE.</em>
          </h2>
          <p className="booking-subtitle">
            Share your celebration date, destination and aesthetic vision.<br />
            Let’s craft a look that feels timelessly, radiantly you.
          </p>

          <div className="contact-note">
            <span className="tiny-star">✧</span>
            <div>
              <p>Based in Kochi · Available Worldwide for Destination Weddings</p>
              <a
                href={`${whatsapp}?text=${encodeURIComponent("Hello Rathy, I'd love to enquire about bridal makeup.")}`}
                target="_blank"
                rel="noreferrer"
                className="whatsapp-contact-link"
              >
                Direct WhatsApp · +91 98472 77872
              </a>
            </div>
          </div>

          <a className="text-link" href={instagram} target="_blank" rel="noreferrer">
            Prefer Instagram? Follow & message @makeupbyrathybaiju →
          </a>
        </div>
      </div>

      <div className="booking-form-wrap">
        <form onSubmit={prepare} className="booking-form" hidden={!!summary}>
          <div className="form-heading">
            <span>BOOK YOUR DATE</span>
            <span>ENQUIRY & AVAILABILITY</span>
          </div>

          <div className="form-grid">
            <label>
              Your name
              <input name="Name" autoComplete="name" placeholder="Full name" required maxLength={100} />
            </label>
            <label>
              Phone / WhatsApp
              <input
                name="Phone"
                type="tel"
                autoComplete="tel"
                placeholder="+91 98765 43210"
                required
                pattern="[+]?[0-9][0-9 ]{6,20}"
                maxLength={22}
                title="Enter your phone number with an optional country code and spaces"
              />
            </label>
            <label>
              Email <span>(optional)</span>
              <input name="Email" type="email" autoComplete="email" placeholder="you@example.com" maxLength={160} />
            </label>
            <label>
              Wedding / event date
              <input name="Date" type="date" min={today} required />
            </label>
            <label>
              Event type
              <select name="Event" defaultValue="" required>
                <option value="" disabled>Select your occasion</option>
                <option>Traditional Wedding</option>
                <option>Reception & Muhurtham</option>
                <option>Engagement Ceremony</option>
                <option>Celebrity & Occasion Glam</option>
                <option>Multiple Days / Destination</option>
              </select>
            </label>
            <label>
              Where is the celebration?
              <input name="Location" placeholder="Venue & City (e.g. Kochi, Bangalore)" required maxLength={160} />
            </label>
            <label>
              I’m the…
              <select name="Booking for" defaultValue="Bride">
                <option>Bride</option>
                <option>Groom / Couple</option>
                <option>Family member</option>
                <option>Guest of honour</option>
              </select>
            </label>
            <label>
              Your makeup vision
              <select name="Makeup" defaultValue="Let's decide together">
                <option>Let's decide together</option>
                <option>Soft and natural glow</option>
                <option>Classic heirloom bridal</option>
                <option>Statement editorial glam</option>
              </select>
            </label>
            <label>
              Hairstyling required?
              <select name="Hairstyling" defaultValue="Yes">
                <option>Yes</option>
                <option>No</option>
                <option>Let's discuss</option>
              </select>
            </label>
            <label>
              Destination wedding?
              <select name="Destination wedding" defaultValue="No">
                <option>No</option>
                <option>Yes</option>
                <option>Still planning venue</option>
              </select>
            </label>
            <label className="wide">
              Anything else we should know? <span>(optional)</span>
              <textarea
                name="Message"
                rows={2}
                maxLength={1200}
                placeholder="Share your outfit colors, jewellery notes, or personal vision…"
              />
            </label>
          </div>

          <button className="button button-champagne form-submit" type="submit">
            CHECK AVAILABILITY & SEND <span>✧</span>
          </button>
          <p className="form-disclaimer">
            We will format your request cleanly for WhatsApp. Your booking date and schedule are personally confirmed by Rathy.
          </p>
        </form>

        {summary && (
          <div className="request-ready" id="request-ready" tabIndex={-1}>
            <span className="eyebrow">ENQUIRY PREPARED</span>
            <h3>Your story starts <em>here.</em></h3>
            <p>Your details have been assembled. Open WhatsApp with one tap to check Rathy’s availability directly.</p>
            <pre>{summary}</pre>
            <a
              className="button button-champagne"
              href={`${whatsapp}?text=${encodeURIComponent(summary)}`}
              target="_blank"
              rel="noreferrer"
            >
              SEND ENQUIRY ON WHATSAPP <span>✧</span>
            </a>
            <div className="summary-actions">
              <button type="button" onClick={() => setSummary("")}>
                Edit details
              </button>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(summary);
                    setCopied(true);
                  } catch {
                    setCopied(false);
                  }
                }}
              >
                {copied ? "✓ Copied to clipboard" : "Copy enquiry"}
              </button>
            </div>
            <p className="form-disclaimer">
              Availability is subject to confirmation. Rathy personally responds to each bride.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
