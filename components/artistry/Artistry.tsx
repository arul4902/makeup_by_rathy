"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { instagram, whatsapp, looks, services, transformations, testimonials } from "./content";
import ScrollBridalTransformationHero from "./ScrollBridalTransformationHero";
import BookingExperience from "./BookingExperience";
import TransformationReveal from "./TransformationReveal";

function Picture({
  id,
  alt,
  className = "",
  eager = false,
  position,
}: {
  id: number;
  alt: string;
  className?: string;
  eager?: boolean;
  position?: string;
}) {
  return (
    <img
      className={className}
      src={`/media/look-${id}.webp`}
      srcSet={`/media/look-${id}-small.webp 320w, /media/look-${id}.webp 600w`}
      sizes="(max-width: 767px) 90vw, 45vw"
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : "auto"}
      decoding="async"
      style={{ objectPosition: position }}
    />
  );
}

type Overlay =
  | { kind: "look"; index: number }
  | { kind: "service"; index: number }
  | { kind: "film"; index: number }
  | null;

export default function Artistry() {
  const dialog = useRef<HTMLDialogElement>(null);
  const reduced = useReducedMotion();
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("home");
  const [calm, setCalm] = useState(false);
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [filter, setFilter] = useState("All looks");
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-25% 0px -55% 0px" }
    );
    document.querySelectorAll("section[id]").forEach((el) => observer.observe(el));

    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (overlay && dialog.current && !dialog.current.open) dialog.current.showModal();
    if (!overlay && dialog.current?.open) dialog.current.close();
    document.body.style.overflow = overlay || menu ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [overlay, menu]);

  // Dialog keyboard accessibility
  useEffect(() => {
    if (!menu) return;
    const toggle = document.querySelector<HTMLButtonElement>(".menu-button");
    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>("#mobile-menu a"));
    links[0]?.focus();
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenu(false);
        toggle?.focus();
      }
      if (event.key !== "Tab") return;
      if (event.shiftKey && document.activeElement === toggle) {
        event.preventDefault();
        links.at(-1)?.focus();
      }
      if (!event.shiftKey && document.activeElement === links.at(-1)) {
        event.preventDefault();
        toggle?.focus();
      }
    };
    document.addEventListener("keydown", keyboard);
    return () => document.removeEventListener("keydown", keyboard);
  }, [menu]);

  const visibleLooks = looks.filter((look) => filter === "All looks" || look.category === filter);

  return (
    <div className={`site ${calm ? "calm-experience" : ""} ${reduced ? "reduced-motion" : ""}`}>
      {/* Skip to Content for accessibility */}
      <a className="skip-link" href="#services">
        Skip to content
      </a>

      {/* Experience Controls (Calm View toggle) */}
      <div className="experience-controls">
        <button
          type="button"
          className="motion-toggle"
          aria-pressed={calm || reduced}
          onClick={() => setCalm(!calm)}
          disabled={reduced}
        >
          {calm ? "CINEMATIC VIEW" : "CALM VIEW"}
        </button>
      </div>

      {/* Light Glassmorphism Navigation */}
      <header className={`navigation ${scrolled ? "nav-glass" : ""}`}>
        <a href="#home" className="brand" aria-label="Rathy Baiju home">
          RATHY BAIJU
          <span>MAKEUP ARTISTRY</span>
        </a>

        <nav aria-label="Main navigation" className="desktop-nav">
          {[
            ["services", "Services"],
            ["portfolio", "Portfolio"],
            ["about", "The Artist"],
            ["testimonials", "Voices"],
            ["stories", "Films"],
          ].map(([id, label]) => (
            <a key={id} href={`#${id}`} className={active === id ? "is-active" : ""}>
              {label}
            </a>
          ))}
        </nav>

        <a href="#enquire" className="nav-book">
          BOOK YOUR DAY <span>✧</span>
        </a>

        <button
          className="menu-button"
          aria-label={menu ? "Close menu" : "Open menu"}
          aria-expanded={menu}
          aria-controls="mobile-menu"
          onClick={() => setMenu(!menu)}
        >
          {menu ? "CLOSE" : "MENU"} <span>{menu ? "−" : "+"}</span>
        </button>
      </header>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {menu && (
          <motion.nav
            id="mobile-menu"
            className="mobile-menu"
            aria-label="Mobile navigation"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {[
              ["home", "Home"],
              ["services", "Signature Services"],
              ["portfolio", "The Portfolio"],
              ["about", "Meet the Artist"],
              ["testimonials", "Client Voices"],
              ["stories", "Moments in Motion"],
              ["enquire", "Reserve Your Date"],
            ].map(([id, label], i) => (
              <a href={`#${id}`} key={id} onClick={() => setMenu(false)}>
                <span>0{i + 1}</span>
                {label}
              </a>
            ))}
            <p>KOCHI · AVAILABLE WORLDWIDE</p>
          </motion.nav>
        )}
      </AnimatePresence>

      <main>
        {/* =======================================================
            PREMIUM SCROLL-CONTROLLED BRIDAL TRANSFORMATION HERO (400vh)
            Direct scroll position controls the 240-frame sequence on HTML5 Canvas:
            Top: Bare Face -> Scroll: Transformation -> Bottom: Complete Bride.
            GSAP ScrollTrigger scrub, object-fit: cover, bidirectional 60fps.
        ======================================================= */}
        <ScrollBridalTransformationHero />

        {/* Editorial Brand Strip */}
        <div className="brand-strip" aria-hidden="true">
          <span>BRIDAL ARTISTRY</span>
          <span>✧</span>
          <span>CELEBRITY MAKEUP</span>
          <span>✧</span>
          <span>HEIRLOOM TRADITIONS</span>
          <span>✧</span>
          <span>DESTINATION CELEBRATIONS</span>
          <span>✧</span>
          <span>KOCHI & WORLDWIDE</span>
        </div>

        {/* =======================================================
            13. SERVICES (Magazine Editorial Alternating Layout)
        ======================================================= */}
        <section id="services" className="services section-pad">
          <div className="section-heading">
            <div>
              <span className="eyebrow">
                <span className="champagne-dot" /> 01 / SIGNATURE SERVICES <span className="champagne-dot" />
              </span>
              <h2>
                Considered beauty.<br />
                <em>For every chapter.</em>
              </h2>
            </div>
            <p>
              A bespoke vision brought to life with an artist’s meticulous attention to skin, symmetry, and your bridal attire.
            </p>
          </div>

          <div className="editorial-services-list">
            {services.map((service, i) => (
              <div
                key={service.title}
                className={`service-editorial-item ${i % 2 === 1 ? "is-inverted" : ""}`}
              >
                <div className="service-media-wrap">
                  <Picture id={service.image} alt={service.title} />
                  <span className="service-large-number">0{i + 1}</span>
                </div>

                <div className="service-content-wrap">
                  <span className="service-tag">SERVICE 0{i + 1}</span>
                  <h3>{service.title}</h3>
                  <p className="service-subtitle">{service.subtitle}</p>
                  <p className="service-desc">{service.description}</p>

                  <ul className="service-details-list">
                    {service.details.map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>

                  <button
                    className="button button-champagne"
                    onClick={() => setOverlay({ kind: "service", index: i })}
                  >
                    EXPLORE DETAILS <span>✧</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =======================================================
            TRANSFORMATION / BEFORE & AFTER
        ======================================================= */}
        {transformations.map((pair) => (
          <TransformationReveal key={pair.before} {...pair} />
        ))}

        {/* =======================================================
            14. PORTFOLIO (Asymmetric Luxury Magazine Grid)
        ======================================================= */}
        <section id="portfolio" className="portfolio section-pad">
          <div className="portfolio-heading">
            <div>
              <span className="eyebrow">
                <span className="champagne-dot" /> 03 / THE PORTFOLIO <span className="champagne-dot" />
              </span>
              <h2>
                Signature <em>looks.</em>
              </h2>
            </div>

            <div className="portfolio-filters" aria-label="Filter portfolio">
              {["All looks", "Bridal", "Occasion"].map((item) => (
                <button
                  key={item}
                  onClick={() => setFilter(item)}
                  aria-pressed={filter === item}
                  className={filter === item ? "selected" : ""}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="portfolio-magazine-grid">
            {visibleLooks.map((look, i) => {
              // Asymmetric magazine column layout classes
              const colClass =
                i === 0
                  ? "col-tall"
                  : i === 1
                  ? "col-wide"
                  : i === 2
                  ? "col-medium"
                  : i === 3
                  ? "col-medium"
                  : i === 4
                  ? "col-medium"
                  : "col-wide";

              return (
                <button
                  className={`look-card ${colClass}`}
                  key={look.id}
                  onClick={() =>
                    setOverlay({
                      kind: "look",
                      index: looks.findIndex((l) => l.id === look.id),
                    })
                  }
                >
                  <div className="look-image">
                    <Picture
                      id={look.id}
                      alt={`${look.title} — makeup by Rathy Baiju`}
                      position={look.position}
                    />
                    <span className="view-look">
                      <span>VIEW LOOK DETAILS</span>
                      <span>+</span>
                    </span>
                  </div>

                  <div className="look-caption">
                    <div>
                      <span className="eyebrow">
                        {look.category.toUpperCase()} · 0{i + 1}
                      </span>
                      <h3>{look.title}</h3>
                    </div>
                    <span className="look-star">✧</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* =======================================================
            DETAILS SECTION (Close-Up Focus)
        ======================================================= */}
        <section className="details section-pad">
          <div className="details-inner">
            <div className="details-copy">
              <span className="eyebrow">
                <span className="champagne-dot" /> THE DIFFERENCE IS IN THE DETAILS <span className="champagne-dot" />
              </span>
              <h2>
                Perfection<br />
                lives in<br />
                <em>the details.</em>
              </h2>
              <p>
                The featherlight placement of a lash. The luminous reflection catching daylight on your cheekbones. The architectural pinning of your dupatta and jasmine.
              </p>
              <div className="detail-tags">
                <span>LUMINOUS SKIN FINISH</span>
                <span>SCULPTED DEFINED EYES</span>
                <span>TIMELESS HEIRLOOM BALANCE</span>
              </div>
            </div>

            <div className="detail-image-wrap">
              <div className="detail-photo">
                <Picture id={2} alt="Close detail of bridal eyes, luminous skin and gold jewellery" />
              </div>
              <span className="detail-mark" aria-hidden="true">
                ✧
              </span>
            </div>
          </div>
        </section>

        {/* =======================================================
            15. ABOUT RATHY (Magazine Editorial Composition)
        ======================================================= */}
        <section id="about" className="about section-pad">
          <div className="about-ghost-title" aria-hidden="true">
            MEET RATHY
          </div>

          <div className="about-inner">
            <div className="about-photo-wrap">
              <div className="about-photo">
                <img
                  src="/media/artist-at-work.jpg"
                  alt="Rathy Baiju creating a bridal makeup look in her studio"
                  loading="lazy"
                />
              </div>
              <div className="about-photo-badge">
                <span>ROOTED IN KOCHI · CERTIFIED</span>
                <em>Pattanam Designory</em>
              </div>
            </div>

            <div className="about-copy">
              <span className="eyebrow">
                <span className="champagne-dot" /> 04 / MEET THE ARTIST <span className="champagne-dot" />
              </span>
              <h2>
                Artistry beyond<br />
                <em>makeup.</em>
              </h2>
              <p className="lead">
                “Beauty begins with the person in the chair. Not an artificial mask, but the most radiant, authentic expression of you.”
              </p>
              <p>
                Rathy Baiju is a certified celebrity and bridal makeup artist professionally trained at the prestigious Pattanam Designory. With over a decade of mastery in classical Kerala bridal styling, contemporary receptions, and high-fashion editorial work, her hallmark is skin that breathes and eyes that captivate.
              </p>
              <p>
                Based in Kochi and travelling across India and international destination wedding venues, Rathy curates an unhurried, serene bridal morning where every bride feels completely at ease.
              </p>

              <div className="artist-signature">
                Rathy Baiju
                <span>THE ARTIST BEHIND YOUR MOMENT</span>
              </div>

              <a href="#enquire" className="text-link">
                CHECK RATHY’S WEDDING AVAILABILITY →
              </a>
            </div>
          </div>
        </section>

        {/* =======================================================
            16. TESTIMONIALS (Clean Luxury & Generous Whitespace)
        ======================================================= */}
        <section id="testimonials" className="testimonials section-pad">
          <div className="testimonials-inner">
            <span className="eyebrow">
              <span className="champagne-dot" /> REAL BRIDES · AUTHENTIC VOICES <span className="champagne-dot" />
            </span>
            <span className="quote-large-mark" aria-hidden="true">
              “
            </span>

            <p className="testimonial-quote">
              {testimonials[testimonialIdx].quote}
            </p>

            <div className="testimonial-author">
              {testimonials[testimonialIdx].author}
            </div>
            <div className="testimonial-meta">
              {testimonials[testimonialIdx].location} · {testimonials[testimonialIdx].role}
            </div>

            <div className="testimonials-nav" aria-label="Testimonial switcher">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  className={testimonialIdx === i ? "active" : ""}
                  onClick={() => setTestimonialIdx(i)}
                  aria-label={`View review ${i + 1}`}
                >
                  0{i + 1}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* =======================================================
            THE BRIDAL JOURNEY (4 Steps)
        ======================================================= */}
        <section className="journey section-pad">
          <div className="section-heading">
            <div>
              <span className="eyebrow">
                <span className="champagne-dot" /> 05 / THE BRIDAL JOURNEY <span className="champagne-dot" />
              </span>
              <h2>
                From the first hello.<br />
                <em>To your forever moment.</em>
              </h2>
            </div>
            <a className="text-link" href="#enquire">
              BEGIN YOUR CONSULTATION →
            </a>
          </div>

          <div className="journey-steps">
            {[
              {
                title: "Tell us your day",
                copy: "Your date, ceremony venue, and aesthetic dream. We establish dates and reserve your dedicated calendar slot.",
                image: 5,
              },
              {
                title: "Choose your look",
                copy: "We study your ceremony outfits, jewellery heirlooms, and skin tone to craft a cohesive makeup and hair concept.",
                image: 2,
              },
              {
                title: "The morning calm",
                copy: "A tranquil, unhurried bridal morning. Every brush stroke is measured; every detail thoughtfully placed.",
                image: 3,
              },
              {
                title: "Your forever walk",
                copy: "Step down the aisle with absolute confidence, glowing with a finish that endures through every ritual.",
                image: 6,
              },
            ].map((step, i) => (
              <div className="journey-step" key={step.title}>
                <span className="journey-number">0{i + 1}</span>
                <div className="journey-photo">
                  <Picture id={step.image} alt={step.title} />
                </div>
                <h3>{step.title}</h3>
                <p>{step.copy}</p>
              </div>
            ))}
          </div>
        </section>

        {/* =======================================================
            MOMENTS IN MOTION (Films)
        ======================================================= */}
        <section id="stories" className="stories section-pad">
          <div className="section-heading">
            <div>
              <span className="eyebrow">
                <span className="champagne-dot" /> 06 / MOMENTS IN MOTION <span className="champagne-dot" />
              </span>
              <h2>
                Behind <em>the brush.</em>
              </h2>
            </div>
            <a className="text-link" href={instagram} target="_blank" rel="noreferrer">
              FOLLOW @MAKEUPBYRATHYBAIJU →
            </a>
          </div>

          <div className="film-grid">
            {[1, 2, 3, 4, 5].map((id, i) => (
              <button
                className="film-card"
                key={id}
                onClick={() => setOverlay({ kind: "film", index: i })}
                aria-label={`Play artistry film ${id}`}
              >
                <img
                  src={`/media/film-${id}.jpg`}
                  alt={`A moment from Rathy's artistry film ${id}`}
                  loading="lazy"
                />
                <span className="play-circle">▷</span>
                <span className="film-label">
                  <span>IN THE CHAIR</span>
                  <span>0{id}</span>
                </span>
              </button>
            ))}
          </div>

          <div className="social-footer">
            <p>Real brides, backstage moments, and genuine skin artistry captured in motion.</p>
            <a href={instagram} className="button button-outline" target="_blank" rel="noreferrer">
              EXPLORE MORE ON INSTAGRAM <span>↗</span>
            </a>
          </div>
        </section>

        {/* =======================================================
            17. BOOKING & SCULPTURE
        ======================================================= */}
        <BookingExperience />

        {/* FINALE SECTION */}
        <section className="finale">
          <Picture id={4} alt="Traditional bridal portrait by Rathy Baiju" />
          <div className="finale-shade" />
          <div className="finale-copy">
            <span className="eyebrow">
              <span className="champagne-dot" /> MAKEUP BY RATHY BAIJU <span className="champagne-dot" />
            </span>
            <h2>
              Your day.<br />
              Your look.<br />
              <em>Your story.</em>
            </h2>
            <p>Let’s create something timeless together.</p>
            <a href="#enquire" className="button button-champagne">
              BOOK YOUR BIG DAY <span>✧</span>
            </a>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-top">
          <a href="#home" className="brand">
            RATHY BAIJU
            <span>MAKEUP ARTISTRY</span>
          </a>
          <p>
            Designed for moments<br />
            <em>remembered forever.</em>
          </p>
          <div className="footer-links">
            <a href={instagram} target="_blank" rel="noreferrer">
              Instagram
            </a>
            <a href={whatsapp} target="_blank" rel="noreferrer">
              WhatsApp
            </a>
            <a href="tel:+919847277872">Direct Call</a>
            <a href="#enquire">Enquire Date</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} RATHY BAIJU ARTISTRY · ALL RIGHTS RESERVED</span>
          <span>KOCHI, KERALA · AVAILABLE WORLDWIDE</span>
          <a href="#home">BACK TO TOP ↑</a>
        </div>
      </footer>

      {/* FLOATING WHATSAPP CTA */}
      <a
        className="whatsapp-float"
        href={`${whatsapp}?text=${encodeURIComponent("Hello Rathy, I would love to enquire about bridal makeup.")}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Enquire on WhatsApp"
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M20 11.7a8 8 0 0 1-11.8 7L4 20l1.3-4.1A8 8 0 1 1 20 11.7Z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M9 8c0 3.5 3 6 6 6l1-2-2-1-1 1c-1.4-.5-2-1.2-2.5-2.5l1-1-1-2-1.5.5Z"
            fill="currentColor"
          />
        </svg>
        <span>LET’S TALK ON WHATSAPP</span>
      </a>

      {/* DIALOG POPUPS */}
      <dialog
        ref={dialog}
        className={`artistry-dialog ${overlay?.kind === "film" ? "film-dialog" : ""}`}
        onCancel={() => setOverlay(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setOverlay(null);
        }}
        aria-label={
          overlay?.kind === "look"
            ? looks[overlay.index].title
            : overlay?.kind === "service"
            ? services[overlay.index].title
            : "Artistry film"
        }
      >
        <button className="dialog-close" onClick={() => setOverlay(null)} aria-label="Close dialog">
          ×
        </button>

        {overlay?.kind === "look" && (
          <div className="look-dialog-content">
            <Picture id={looks[overlay.index].id} alt={looks[overlay.index].title} />
            <div className="dialog-copy">
              <span className="eyebrow">
                {looks[overlay.index].category.toUpperCase()} · LOOK 0{overlay.index + 1}
              </span>
              <h2>{looks[overlay.index].title}</h2>
              <p>{looks[overlay.index].note}</p>
              <a className="button button-champagne" href="#enquire" onClick={() => setOverlay(null)}>
                RESERVE THIS LOOK <span>✧</span>
              </a>
              <div className="look-pagination">
                <button
                  onClick={() =>
                    setOverlay({
                      kind: "look",
                      index: (overlay.index + looks.length - 1) % looks.length,
                    })
                  }
                >
                  ← Previous look
                </button>
                <span>
                  {overlay.index + 1} / {looks.length}
                </span>
                <button
                  onClick={() =>
                    setOverlay({
                      kind: "look",
                      index: (overlay.index + 1) % looks.length,
                    })
                  }
                >
                  Next look →
                </button>
              </div>
            </div>
          </div>
        )}

        {overlay?.kind === "service" && (
          <div className="look-dialog-content">
            <Picture id={services[overlay.index].image} alt={services[overlay.index].title} />
            <div className="dialog-copy">
              <span className="eyebrow">SIGNATURE SERVICE 0{overlay.index + 1}</span>
              <h2>{services[overlay.index].title}</h2>
              <p>{services[overlay.index].description}</p>
              <ul>
                {services[overlay.index].details.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <a className="button button-champagne" href="#enquire" onClick={() => setOverlay(null)}>
                ENQUIRE ABOUT THIS SERVICE <span>✧</span>
              </a>
            </div>
          </div>
        )}

        {overlay?.kind === "film" && (
          <video
            key={overlay.index}
            src={`/media/film-${overlay.index + 1}.mp4`}
            controls
            autoPlay
            playsInline
            preload="metadata"
          />
        )}
      </dialog>
    </div>
  );
}
