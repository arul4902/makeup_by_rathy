# Rathy Baiju — Makeup Artistry

A responsive editorial portfolio using React, TypeScript, Next-compatible routes, React Three Fiber, Drei, GSAP ScrollTrigger, Framer Motion and Lenis.

## Develop

```sh
npm install
npm run dev
```

The Next.js development preview uses port 5173. `npm run dev:next` is also available.

## Deploy

- Sites: `npm run build` creates a static Next.js export in `out/`.
- Vercel: import this directory. `vercel.json` selects Next.js and `npm run build:vercel`.
- Type check: `npx tsc --noEmit`.

## Content and enquiry delivery

- Contact and portfolio content: `components/artistry/content.ts`.
- Business WhatsApp: +91 98472 77872.
- Instagram: @makeupbyrathybaiju. Curated supplied media with direct profile links, not a live Instagram API feed.
- Enquiries are prepared locally, then opened in WhatsApp for the visitor to send. The website does not claim a request was received, reserve dates or store personal details on a server.
- No fabricated reviews, awards, years or celebrity clients.
- Before/after uses genuine stills from supplied film 3 (0.5 seconds and 5.3 seconds). Images preserve the original faces and are not retouched. Different poses and video framing are retained.
- `scripts/prepare-media.mjs` generates WebP assets and film posters from supplied originals on Windows. The FFmpeg executable is an optional Windows-only development dependency and is not needed to build or run the website.
- Videos load only after a visitor opens a film. Fonts are self-hosted.

## Motion and accessibility

One measured GSAP ScrollTrigger timeline controls the camera, beauty table, authentic transformation, mirror passage, depth gallery, jewellery transition, artist story and final reveal. Scrolling backwards reverses the same path. The desktop Three.js canvas renders on demand with capped DPR and lightweight procedural geometry; mobile uses CSS perspective and supplied photography. Films load on interaction. Rendering pauses while dialogs are open and when the document is hidden.

Calm View and the operating system's reduced-motion preference preserve a readable static experience and manual comparison. Dialogs support Escape; images include alternative text and the form uses native validation. Instagram links use supplied media and the business profile, rather than an authenticated live feed.

Camera continuity, reverse traversal, progress bounds and pullback choreography: `node --test --test-isolation=none tests/journey.test.mjs`.

Authentic testimonials and a business email can be added when supplied.
