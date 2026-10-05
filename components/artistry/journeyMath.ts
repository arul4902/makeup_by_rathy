export const chapters = [
  "Enter the world", "The beauty table", "The transformation", "Through the mirror",
  "Signature looks", "The golden detail", "The artistry", "Your bridal journey",
  "Memories in motion", "Your celebration", "Your story",
] as const;

export const clamp = (n: number, low = 0, high = 1) => Math.max(low, Math.min(high, n));
export const smooth = (a: number, b: number, n: number) => { const x = clamp((n - a) / (b - a)); return x * x * (3 - 2 * x); };
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

export interface JourneyFrame { travel: number; progress: number; chapter: number; pointerX: number; pointerY: number; paused: boolean; }
export interface SceneBounds { start: number; height: number; }

export function locateJourney(y: number, bounds: SceneBounds[], viewport: number) {
  let chapter = 0;
  for (let i = 0; i < bounds.length; i++) if (y >= bounds[i].start - 1) chapter = i;
  const scene = bounds[chapter];
  if (!scene) return { chapter: 0, progress: 0, travel: 0 };
  const progress = clamp((y - scene.start) / Math.max(1, scene.height - viewport));
  const travel = chapter + clamp((y - scene.start) / Math.max(1, scene.height));
  return { chapter, progress, travel };
}

// World-space stations. The camera pulls away from the opening surface, crosses
// the table and mirror, travels the gallery, then pulls back for the final portrait.
export const cameraStations = [
  [0, 0, 1.7], [0.1, 1.5, -7], [0.2, .3, -28], [0, .1, -36],
  [0, .1, -49], [.1, 0, -87], [-.6, .2, -101], [.4, .3, -115],
  [-.3, .1, -133], [0, .1, -149], [0, 0, -164], [0, 0, -158],
];

export function cameraAt(travel: number): [number, number, number] {
  const i = Math.min(Math.floor(travel), cameraStations.length - 2);
  const t = smooth(0, 1, travel - i);
  const a = cameraStations[Math.max(0, i)], b = cameraStations[Math.max(0, i) + 1];
  if (i === 0) {
    // First half: pull back from jewellery; second half: fly on to the table.
    const z = travel < .54 ? mix(1.7, 9, smooth(0, .54, travel)) : mix(9, -7, smooth(.54, 1, travel));
    return [Math.sin(travel * Math.PI) * .8 + mix(0, .1, t), mix(0, 1.5, t), z];
  }
  if(i===1) {
    const p=travel-1;
    const x=p<.72?mix(.1,1.8,smooth(0,.72,p)):mix(1.8,.2,smooth(.72,1,p));
    const z=p<.72?mix(-7,-10,smooth(0,.72,p)):mix(-10,-28,smooth(.72,1,p));
    return [x,mix(1.5,.3,t),z];
  }
  return [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];
}
