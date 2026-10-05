"use client";
import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { chapters, clamp, locateJourney, mix, smooth, type JourneyFrame, type SceneBounds } from "@/components/artistry/journeyMath";

export function useCinematicJourney(root: RefObject<HTMLDivElement | null>, frame: RefObject<JourneyFrame>, enabled: boolean, revision: string) {
  useEffect(() => {
    const site = root.current;
    if (!enabled || !site) return;
    gsap.registerPlugin(ScrollTrigger);
    const mobileMedia = matchMedia("(max-width: 767px)");
    let mobile = mobileMedia.matches;
    const scenes = Array.from(site.querySelectorAll<HTMLElement>("[data-scene]"));
    const playhead = { y: window.scrollY };
    let bounds: SceneBounds[] = [];
    let maximum = 1;
    let lastChapter = -1;
    const elements = {
      macro: site.querySelector<HTMLElement>(".entrance-macro"), hero: site.querySelector<HTMLElement>(".hero-copy"),
      portrait: site.querySelector<HTMLElement>(".hero-fallback"), mirror: site.querySelector<HTMLElement>(".mirror-portal"),
      mirrorCopy: site.querySelector<HTMLElement>(".mirror-copy"), wash: site.querySelector<HTMLElement>(".journey-light"),
      progress: site.querySelector<HTMLElement>(".page-progress"), label: site.querySelector<HTMLElement>(".chapter-name"),
      number: site.querySelector<HTMLElement>(".chapter-number"), finale: site.querySelector<HTMLElement>(".finale > .scene-hold > img"),
      services: Array.from(site.querySelectorAll<HTMLElement>(".service-card")),
      looks: Array.from(site.querySelectorAll<HTMLElement>(".look-card")),
      steps: Array.from(site.querySelectorAll<HTMLElement>(".journey-step")),
      films: Array.from(site.querySelectorAll<HTMLElement>(".film-card")),
      aboutText: Array.from(site.querySelectorAll<HTMLElement>(".about-copy > p, .artist-signature")),
    };
    const measure = () => {
      bounds = scenes.map(el => ({ start: el.getBoundingClientRect().top + window.scrollY, height: el.offsetHeight }));
      maximum = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    };
    const local = (index: number) => bounds[index] ? clamp((playhead.y - bounds[index].start) / Math.max(1, bounds[index].height - innerHeight)) : 0;
    const setTransform = (el: HTMLElement | null, value: string) => { if (el) el.style.transform = value; };
    const show = (el: HTMLElement, amount: number, interactive = true) => {
      el.style.opacity = String(clamp(amount));
      el.style.pointerEvents = interactive && amount > .45 ? "auto" : "none";
      if (el.tagName === "BUTTON") el.tabIndex = interactive && amount > .45 ? 0 : -1;
    };
    const render = () => {
      const state = locateJourney(playhead.y, bounds, innerHeight);
      Object.assign(frame.current, state);
      window.dispatchEvent(new Event("journey-frame"));
      if (elements.progress) elements.progress.style.transform = `scaleX(${clamp(playhead.y / maximum)})`;
      if (lastChapter !== state.chapter) {
        lastChapter = state.chapter;
        if (elements.label) elements.label.textContent = chapters[state.chapter] || chapters.at(-1)!;
        if (elements.number) elements.number.textContent = String(state.chapter + 1).padStart(2, "0");
        site.dataset.chapter = String(state.chapter);
      }
      scenes.forEach((el, i) => el.style.setProperty("--scene-progress", String(local(i))));
      const h = local(0);
      if (elements.macro) { setTransform(elements.macro, `scale(${mix(3.3, .84, smooth(0, .7, h))}) translate3d(${h * -4}%,${h * 7}%,0)`); elements.macro.style.opacity = String(1 - smooth(.23, .7, h)); }
      if (elements.hero) { elements.hero.style.clipPath = `inset(${(1-smooth(.12,.53,h))*100}% 0 0 0)`; elements.hero.style.opacity = String(1-smooth(.9,1,h)); setTransform(elements.hero, `translate3d(0,${mix(45,0,smooth(.12,.6,h))}px,0)`); }
      if (elements.portrait) { elements.portrait.style.opacity = String(smooth(.15,.52,h)); elements.portrait.style.setProperty("--portrait-scale", String(mix(1.2,1,h))); }
      elements.services.forEach((el, i) => {
        const position = local(1) * (elements.services.length - .01);
        const d = i - Math.min(position, elements.services.length - 1);
        const visibility = 1-smooth(.52,.94,Math.abs(d));
        show(el, visibility); setTransform(el, `translate3d(${d * (mobile ? 15 : 26)}%,${d*9}%,${-Math.abs(d)*180}px) rotateY(${d*-5}deg)`);
        el.classList.toggle("service-in-focus", visibility > .5);
      });
      const m = local(3);
      if (elements.mirror) { const z = mix(0, mobile ? 1050 : 1500,smooth(.05,.96,m)); setTransform(elements.mirror, `translate3d(-50%,-50%,${z}px)`); elements.mirror.style.opacity = String(1-smooth(.86,1,m)); }
      if (elements.mirrorCopy) { elements.mirrorCopy.style.clipPath = `inset(0 0 ${smooth(.2,.6,m)*100}% 0)`; }
      const g = local(4) * Math.max(1, elements.looks.length - 1);
      elements.looks.forEach((el, i) => {
        const d = i - g;
        const z = -d * (mobile ? 390 : 650);
        const visibility = d < -.5 ? 1-smooth(.5,.88,-d) : 1-smooth(2.2,3.1,d);
        const side = i % 2 ? 1 : -1;
        setTransform(el, `translate3d(calc(-50% + ${side*Math.min(Math.abs(d),2)*(mobile ? 80 : 185)}px),-50%,${z}px) rotateY(${side*Math.min(Math.abs(d),1)*-8}deg)`);
        show(el, visibility, Math.abs(d)<.65);
        el.style.filter = `brightness(${mix(.56,1,1-clamp(Math.abs(d)))})`;
        el.style.zIndex = String(30 - i);
      });
      const a = local(6);
      setTransform(site.querySelector(".about-photo-wrap"), `translate3d(${mix(5,-3,a)}%,${mix(8,-6,a)}%,0) rotateY(${mix(-5,4,a)}deg)`);
      elements.aboutText.forEach((el,i) => {
        el.style.clipPath=`inset(0 0 ${(1-smooth(i*.14,i*.14+.24,a))*100}% 0)`;
        if(mobile && i===1) el.style.opacity=String(1-smooth(.52,.68,a));
        if(mobile && i===2) el.style.opacity=String(smooth(.52,.68,a));
      });
      const j = local(7) * (elements.steps.length-1);
      elements.steps.forEach((el,i) => { const d=i-j; setTransform(el, `translate3d(calc(-50% + ${d*(mobile?130:270)}px),-50%,${-Math.abs(d)*(mobile?150:300)}px) rotateY(${d*-7}deg)`); show(el, 1-smooth(.7,1.7,Math.abs(d))); });
      const s = local(8);
      elements.films.forEach((el,i) => { const d=i-s*(elements.films.length-1); setTransform(el,`translate3d(${d*(mobile?10:22)}px,${Math.abs(d)*-10}px,${-Math.abs(d)*45}px) rotateY(${d*-3}deg)`); });
      const f = local(10);
      setTransform(elements.finale,`scale(${mix(1.3,1,smooth(0,.8,f))}) translate3d(${mix(3,0,f)}%,0,0)`);
      const finalCopy=site.querySelector<HTMLElement>(".finale-copy");
      if(finalCopy) finalCopy.style.clipPath=`inset(${(1-smooth(.1,.5,f))*100}% 0 0 0)`;
      if(elements.wash) {
        const gold = Math.sin(smooth(.66,1,local(5))*Math.PI) * .45;
        const boundary = state.travel % 1;
        const glint = Math.max(0,1-Math.abs(boundary-.93)/.075)*.13;
        elements.wash.style.opacity=String(Math.max(gold,glint));
        elements.wash.style.transform=`translate3d(${mix(-80,80,boundary)}%,0,0) rotate(-15deg)`;
      }
    };
    measure();
    const lenis = new Lenis({ duration: mobile ? .65 : .9, smoothWheel: true, anchors: { offset: 0 } });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t:number) => { if(!document.hidden) lenis.raf(t*1000); };
    gsap.ticker.add(tick);
    const timeline = gsap.timeline({ scrollTrigger: { trigger: site, start:"top top", end:()=>`+=${maximum}`, scrub: mobile ? .2 : .45, invalidateOnRefresh:true, onRefreshInit:measure } });
    timeline.fromTo(playhead,{y:0},{y:()=>maximum,ease:"none",duration:1,onUpdate:render});
    const pointer = (event:PointerEvent) => {frame.current.pointerX=(event.clientX/innerWidth-.5);frame.current.pointerY=(event.clientY/innerHeight-.5);};
    const magnets = Array.from(site.querySelectorAll<HTMLElement>(".button, .nav-book"));
    const magnetic = (event:PointerEvent) => {
      if(mobile || event.pointerType!=="mouse")return;
      const button=event.currentTarget as HTMLElement;
      const box=button.getBoundingClientRect();
      button.style.translate=`${(event.clientX-box.left-box.width/2)*.09}px ${(event.clientY-box.top-box.height/2)*.12}px`;
    };
    const release = (event:PointerEvent) => {(event.currentTarget as HTMLElement).style.removeProperty("translate");};
    magnets.forEach(el=>{el.addEventListener("pointermove",magnetic);el.addEventListener("pointerleave",release);});
    const changeViewport = () => {mobile=mobileMedia.matches;ScrollTrigger.refresh();render();};
    mobileMedia.addEventListener("change",changeViewport);
    const jump = (event:Event) => { const { scene, progress }=(event as CustomEvent<{scene:number;progress:number}>).detail; const b=bounds[scene];if(b)lenis.scrollTo(b.start+clamp(progress)*Math.max(1,b.height-innerHeight),{duration:.8}); };
    const pause = (event:Event) => { const paused=(event as CustomEvent<boolean>).detail;frame.current.paused=paused; if(paused)lenis.stop();else lenis.start(); };
    const focus = (event:FocusEvent) => { const node=event.target as HTMLElement; if(!node.closest('[data-scene="portfolio"]'))return; const index=elements.looks.findIndex(el=>el===node || el.contains(node)); if(index>=0)lenis.scrollTo(bounds[4].start+(index/Math.max(1,elements.looks.length-1))*(bounds[4].height-innerHeight),{immediate:true}); };
    window.addEventListener("pointermove",pointer,{passive:true});
    window.addEventListener("journey-jump",jump);window.addEventListener("journey-pause",pause);site.addEventListener("focusin",focus);
    const resize = new ResizeObserver(()=>ScrollTrigger.refresh());resize.observe(site);
    document.fonts.ready.then(()=>{if(site.isConnected)ScrollTrigger.refresh();});
    render();
    return () => {
      mobileMedia.removeEventListener("change",changeViewport);
      magnets.forEach(el=>{el.removeEventListener("pointermove",magnetic);el.removeEventListener("pointerleave",release);el.style.removeProperty("translate");});
      resize.disconnect();window.removeEventListener("pointermove",pointer);window.removeEventListener("journey-jump",jump);window.removeEventListener("journey-pause",pause);site.removeEventListener("focusin",focus);
      timeline.scrollTrigger?.kill();timeline.kill();gsap.ticker.remove(tick);lenis.destroy();
      site.querySelectorAll<HTMLElement>("[style]").forEach(el=> {if(el.closest("dialog") || el.matches(".comparison img,.comparison-line"))return; ["transform","opacity","clip-path","filter","pointer-events","z-index","--scene-progress","--portrait-scale"].forEach(name=>el.style.removeProperty(name));});
      [...elements.services,...elements.looks].forEach(el=>el.removeAttribute("tabindex"));
    };
  },[root,frame,enabled,revision]);
}
