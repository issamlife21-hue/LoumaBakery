/**
 * Louma motion engine. Target feel: a printed menu.
 *
 * The COMPLETE effect list (everything else was removed on purpose):
 *  - scrollDraw: sketches draw themselves once when seen (never left invisible)
 *  - reveal: fade + settle DOWNWARD (or fade in place), staggered children
 *  - imageWipe: soft clip-path unveil + 1.04->1 settle on feature images
 *  - kenBurns: slow drift on the HERO media only
 *  - marquee: one slow ghost ticker, pauses on hover
 *  - toast: transient notices (functional UI)
 *  - ingredientSlider: drag-to-scroll (functional, not decorative)
 *
 * Every effect: flag-gated (features.ts, overridable on /review), one-shot at
 * ~30% in view via IntersectionObserver, suppressed under reduced-motion
 * (final state shown immediately), heavy motion off on mobile.
 */
import { animate, inView } from 'motion';
import { features } from '../config/features';

type Cleanup = () => void;
const cleanups = new Map<string, Cleanup[]>();
const add = (name: string, fn: Cleanup) => {
  if (!cleanups.has(name)) cleanups.set(name, []);
  cleanups.get(name)!.push(fn);
};
const stopEffect = (name: string) => {
  const list = cleanups.get(name);
  if (!list) return;
  list.forEach((fn) => { try { fn(); } catch { /* ignore */ } });
  cleanups.set(name, []);
};

const mql = (q: string) => window.matchMedia(q);
const reduced = () => mql('(prefers-reduced-motion: reduce)').matches;
const mobile = () => mql('(max-width: 760px)').matches;

declare global {
  interface Window {
    __FX?: Record<string, boolean>;
    LoumaFX?: {
      names: string[];
      meta: Record<string, string>;
      isOn: (n: string) => boolean;
      isAvailable: (n: string) => boolean;
      setEnabled: (n: string, on: boolean) => void;
      toast: (msg: string, opts?: { tone?: 'default' | 'good' }) => void;
    };
  }
}

const flagOn = (name: string): boolean => {
  const ov = window.__FX;
  if (ov && name in ov) return !!ov[name];
  return !!(features as Record<string, boolean>)[name];
};
// Heavier scroll-linked work stays off phones.
const MOBILE_OFF = new Set(['kenBurns']);
const available = (name: string): boolean => {
  if (reduced()) return false;
  if (MOBILE_OFF.has(name) && mobile()) return false;
  return true;
};
const enabled = (name: string) => flagOn(name) && available(name);

const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) =>
  Array.from(root.querySelectorAll<T>(sel));

const EASE = [0.22, 1, 0.36, 1] as const;

/* ============================================================ EFFECTS === */

const builders: Record<string, () => void> = {
  // --- Hero media drift (hero only, very slow) ---
  kenBurns() {
    $('.hero-media [data-anim="ken-burns"], .hero [data-anim="ken-burns"]').forEach((el) => {
      const ctrl = animate(el, { scale: [1, 1.05] }, { duration: 28, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' });
      add('kenBurns', () => { ctrl.stop(); (el as HTMLElement).style.transform = ''; });
    });
  },

  // --- Sketch draw when seen (one-shot; never left invisible) ---
  scrollDraw() {
    $('[data-anim="scroll-draw"]').forEach((svg) => {
      const strokes = Array.from(svg.querySelectorAll<SVGPathElement>('path'))
        .filter((p) => getComputedStyle(p).fill === 'none' || svg.getAttribute('fill') === 'none');
      if (strokes.length) drawOnScroll(svg, strokes);
    });
    // Face marks: draw the stroked outline on scroll-in, settle back to filled.
    $('[data-face-draw]').forEach((svg) => {
      const strokes = Array.from(svg.querySelectorAll<SVGPathElement>('.ff-strokes path'));
      if (strokes.length) drawOnScroll(svg, strokes, svg);
    });
  },

  // --- Reveal: fade + settle DOWNWARD (start above, come to rest), or fade
  //     in place with data-reveal="fade". data-reveal-children staggers. ---
  reveal() {
    $('[data-anim="reveal"]').forEach((el) => {
      const inPlace = el.getAttribute('data-reveal') === 'fade';
      const staggered = el.hasAttribute('data-reveal-children');
      const targets = (staggered ? Array.from(el.children) : [el]) as HTMLElement[];
      if (staggered) el.style.opacity = '1';
      targets.forEach((t) => { t.style.opacity = '0'; if (!inPlace) t.style.transform = 'translateY(-20px)'; });
      const fn = inView(el, () => {
        targets.forEach((t, i) => {
          animate(
            t,
            { opacity: 1, ...(inPlace ? {} : { transform: 'translateY(0px)' }) },
            { duration: 0.6, delay: targets.length > 1 ? i * 0.08 : 0, ease: EASE },
          );
        });
        return () => {};
      }, { amount: 0.3 });
      add('reveal', () => { fn(); targets.forEach((t) => { t.style.opacity = ''; t.style.transform = ''; }); });
    });
  },

  // --- Image unveil: soft clip wipe + 1.04->1 settle. IO watches the
  //     UNCLIPPED parent (Chromium factors clip-path into intersection). ---
  imageWipe() {
    $<HTMLElement>('[data-anim="wipe"]').forEach((pic) => {
      const img = pic.querySelector<HTMLElement>('img');
      const r = pic.getBoundingClientRect();
      if (r.top < window.innerHeight) return; // above-fold: never hide
      pic.style.clipPath = 'inset(0 0 100% 0)';
      if (img) img.style.transform = 'scale(1.04)';
      let ran = false;
      const play = () => {
        if (ran) return;
        ran = true;
        io.disconnect();
        clearTimeout(safety);
        animate(pic, { clipPath: ['inset(0 0 100% 0)', 'inset(0 0 0% 0)'] }, { duration: 0.8, ease: EASE })
          .finished.then(() => { pic.style.clipPath = ''; });
        if (img) animate(img, { transform: ['scale(1.04)', 'scale(1)'] }, { duration: 0.9, ease: EASE }).finished.then(() => { img.style.transform = ''; });
      };
      const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) play(); }, { threshold: 0.2 });
      io.observe(pic.parentElement ?? pic);
      let safety = 0;
      const watchdog = () => {
        if (ran) return;
        const rr = (pic.parentElement ?? pic).getBoundingClientRect();
        if (rr.bottom > 0 && rr.top < window.innerHeight) play();
        else safety = window.setTimeout(watchdog, 2000);
      };
      safety = window.setTimeout(watchdog, 2000);
      add('imageWipe', () => { io.disconnect(); clearTimeout(safety); pic.style.clipPath = ''; if (img) img.style.transform = ''; });
    });
  },

  // --- Marquee: slow linear loop, pauses on hover ---
  marquee() {
    $('[data-anim="marquee"]').forEach((wrap) => {
      const track = wrap.querySelector<HTMLElement>('.marquee-track');
      if (!track) return;
      const originals = Array.from(track.children);
      originals.forEach((n) => track.appendChild(n.cloneNode(true)));
      const ctrl = animate(track, { transform: ['translateX(0%)', 'translateX(-50%)'] }, { duration: 30, repeat: Infinity, ease: 'linear' });
      // Pause-on-hover is a hover-device behavior only (no sticky pause on tap).
      const hoverFine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      const pause = () => ctrl.pause();
      const play = () => ctrl.play();
      if (hoverFine) {
        wrap.addEventListener('mouseenter', pause);
        wrap.addEventListener('mouseleave', play);
      }
      add('marquee', () => {
        ctrl.stop();
        wrap.removeEventListener('mouseenter', pause);
        wrap.removeEventListener('mouseleave', play);
        track.style.transform = '';
        Array.from(track.children).slice(originals.length).forEach((n) => n.remove());
      });
    });
  },

  // --- Ingredient slider (drag to scroll; functional) ---
  ingredientSlider() {
    $('[data-anim="ingredient-slider"] .ing-track, [data-anim="ingredient-slider"].ing-track').forEach((track) => {
      let down = false, startX = 0, startScroll = 0;
      const onDown = (e: PointerEvent) => { down = true; startX = e.clientX; startScroll = track.scrollLeft; track.classList.add('is-dragging'); track.setPointerCapture(e.pointerId); };
      const onMove = (e: PointerEvent) => { if (!down) return; track.scrollLeft = startScroll - (e.clientX - startX); };
      const onUp = (e: PointerEvent) => { down = false; track.classList.remove('is-dragging'); try { track.releasePointerCapture(e.pointerId); } catch { /* */ } };
      track.addEventListener('pointerdown', onDown);
      track.addEventListener('pointermove', onMove);
      track.addEventListener('pointerup', onUp);
      track.addEventListener('pointercancel', onUp);
      add('ingredientSlider', () => {
        track.removeEventListener('pointerdown', onDown);
        track.removeEventListener('pointermove', onMove);
        track.removeEventListener('pointerup', onUp);
        track.removeEventListener('pointercancel', onUp);
        track.classList.remove('is-dragging');
      });
    });
  },

  // --- Toast: registers the API; toasts fired by forms etc. ---
  toast() {
    add('toast', () => {});
  },
};

// One-shot stroke draw when an element scrolls into view (IO + WAAPI).
// Never left invisible: reduced-motion shows the final state, and a watchdog
// rescues a mark that is on screen but whose IO never fired.
function drawOnScroll(svg: Element, strokes: SVGPathElement[], face?: Element) {
  const lens = strokes.map((p) => p.getTotalLength());
  strokes.forEach((p, i) => { p.style.strokeDasharray = String(lens[i]); p.style.strokeDashoffset = String(lens[i]); });

  const settleFilled = () => { if (face) face.classList.remove('is-drawing'); };
  const showFinal = () => {
    if (!face) strokes.forEach((p) => { p.style.strokeDashoffset = '0'; });
    settleFilled();
  };
  if (reduced()) { showFinal(); return; }

  const step = Math.min(80, Math.floor(700 / strokes.length));
  let done = false;
  const draw = () => {
    if (done) return;
    done = true;
    io.disconnect();
    clearTimeout(safety);
    if (face) face.classList.add('is-drawing');
    let maxEnd = 0;
    strokes.forEach((p, i) => {
      const delay = i * step;
      p.animate(
        [{ strokeDashoffset: lens[i] }, { strokeDashoffset: 0 }],
        { duration: 1100, delay, easing: 'cubic-bezier(0.22,1,0.36,1)', fill: 'forwards' },
      );
      p.style.strokeDashoffset = '0';
      maxEnd = Math.max(maxEnd, delay + 1100);
    });
    if (face) window.setTimeout(settleFilled, maxEnd + 150);
  };

  const io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) draw();
  }, { threshold: 0.35 });
  io.observe(svg);
  let safety = 0;
  const watchdog = () => {
    if (done) return;
    const r = svg.getBoundingClientRect();
    if (r.bottom > 0 && r.top < window.innerHeight && r.width > 0) draw();
    else safety = window.setTimeout(watchdog, 2500);
  };
  safety = window.setTimeout(watchdog, 2500);

  add('scrollDraw', () => {
    io.disconnect();
    clearTimeout(safety);
    strokes.forEach((p) => { p.style.strokeDasharray = ''; p.style.strokeDashoffset = ''; });
    settleFilled();
  });
}

/* ============================================================ TOAST ===== */
function ensureToastRegion(): HTMLElement {
  let r = document.getElementById('toast-region');
  if (!r) {
    r = document.createElement('div');
    r.id = 'toast-region';
    r.setAttribute('role', 'status');
    r.setAttribute('aria-live', 'polite');
    document.body.appendChild(r);
  }
  return r;
}
function toast(msg: string, opts: { tone?: 'default' | 'good' } = {}) {
  if (!flagOn('toast')) return;
  const region = ensureToastRegion();
  const t = document.createElement('div');
  t.className = `toast ${opts.tone === 'good' ? 'toast--good' : ''}`;
  t.textContent = msg;
  region.appendChild(t);
  if (reduced()) {
    setTimeout(() => t.remove(), 2600);
    return;
  }
  animate(t, { opacity: [0, 1], transform: ['translateY(-10px)', 'translateY(0px)'] }, { duration: 0.3, ease: EASE });
  setTimeout(() => {
    animate(t, { opacity: [1, 0] }, { duration: 0.3 }).finished.then(() => t.remove());
  }, 2600);
}

/* ============================================================ DRIVER ==== */
const NAMES = Object.keys(builders);
const META: Record<string, string> = {
  kenBurns: 'Slow drift on the hero photo (desktop).',
  scrollDraw: 'Sketches draw themselves once when seen.',
  reveal: 'Sections fade in and settle downward, children staggered.',
  imageWipe: 'Feature images unveil with a soft wipe.',
  marquee: 'One slow ghost ticker; pauses on hover.',
  ingredientSlider: 'Drag the ingredient row to scroll it.',
  toast: 'Transient corner notices.',
};

function setEnabled(name: string, on: boolean) {
  if (!window.__FX) window.__FX = {};
  window.__FX[name] = on;
  stopEffect(name);
  if (enabled(name) && builders[name]) {
    try { builders[name](); } catch { /* ignore */ }
  }
}

function initAll() {
  NAMES.forEach((name) => {
    stopEffect(name);
    if (enabled(name) && builders[name]) {
      try { builders[name](); } catch { /* ignore */ }
    }
  });
}

window.LoumaFX = {
  names: NAMES,
  meta: META,
  isOn: (n) => flagOn(n),
  isAvailable: (n) => available(n),
  setEnabled,
  toast,
};

// Full page loads only (no view-transition router).
if (document.readyState !== 'loading') initAll();
else document.addEventListener('DOMContentLoaded', initAll, { once: true });
// Kept for compatibility if a router is ever reintroduced.
document.addEventListener('astro:page-load', initAll);
