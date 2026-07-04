/**
 * Louma motion engine. Turns the flag-gated hooks placed in markup into real
 * effects, using the locally-bundled `motion` library. Every effect:
 *  - reads its flag from src/config/features.ts (overridable per-view on /review)
 *  - is suppressed entirely under prefers-reduced-motion
 *  - pointer effects are suppressed on coarse pointers (and flour-dust on mobile)
 *  - scroll/pointer handlers are rAF/throttle friendly (motion's scroll() batches)
 *
 * Each effect registers start()/stop() so /review can flip it live.
 */
import { animate, scroll, inView, stagger } from 'motion';
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
  list.forEach((fn) => {
    try { fn(); } catch { /* ignore */ }
  });
  cleanups.set(name, []);
};

// --- Environment guards ---
const mql = (q: string) => window.matchMedia(q);
const reduced = () => mql('(prefers-reduced-motion: reduce)').matches;
const coarse = () => mql('(pointer: coarse)').matches;
const mobile = () => mql('(max-width: 760px)').matches;

const POINTER_FX = new Set(['cardTilt', 'imageTilt', 'magneticButtons', 'photoCursor', 'faceDraw']);

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
// Scroll-linked effects that are too heavy to run smoothly on phones.
const MOBILE_OFF = new Set(['parallax', 'storyRail', 'kenBurns']);
// Can this effect run in this environment at all?
const available = (name: string): boolean => {
  if (reduced()) return false;
  if (POINTER_FX.has(name) && coarse()) return false;
  if (MOBILE_OFF.has(name) && mobile()) return false;
  return true;
};
const enabled = (name: string) => flagOn(name) && available(name);

const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) =>
  Array.from(root.querySelectorAll<T>(sel));

const EASE = [0.22, 1, 0.36, 1] as const;

/* ============================================================ EFFECTS === */

const builders: Record<string, () => void> = {
  // --- Preloader (once per full load) ---
  preloader() {
    const el = document.getElementById('preloader');
    if (!el) return;
    let timer = 0;
    const done = () => {
      timer = window.setTimeout(() => {
        animate(el, { opacity: [1, 0] }, { duration: 0.5, ease: 'easeInOut' }).finished.then(() => {
          el.style.display = 'none';
        });
      }, 350);
    };
    if (document.readyState === 'complete') done();
    else window.addEventListener('load', done, { once: true });
    add('preloader', () => { clearTimeout(timer); window.removeEventListener('load', done); el.style.display = 'none'; });
  },

  // --- Hero Ken-Burns drift ---
  kenBurns() {
    $('[data-anim="ken-burns"]').forEach((el) => {
      const ctrl = animate(
        el,
        { scale: [1, 1.08], x: ['0%', '-1.5%'], y: ['0%', '-1%'] },
        { duration: 20, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' },
      );
      add('kenBurns', () => { ctrl.stop(); el.style.transform = ''; });
    });
  },

  // --- Hero panel rise ---
  heroRise() {
    $('.hero-panel').forEach((el) => {
      const ctrl = animate(
        el,
        { opacity: [0, 1], transform: ['translateY(28px)', 'translateY(0px)'] },
        { duration: 0.8, ease: EASE },
      );
      add('heroRise', () => { ctrl.stop(); el.style.opacity = ''; el.style.transform = ''; });
    });
  },

  // --- Headline line/word rise ---
  headlineRise() {
    $('.hero-headline').forEach((el) => {
      const orig = el.getAttribute('data-orig') ?? el.textContent ?? '';
      el.setAttribute('data-orig', orig);
      const words = orig.split(/\s+/).filter(Boolean);
      el.textContent = '';
      const spans = words.map((w) => {
        const outer = document.createElement('span');
        outer.className = 'word-mask';
        const inner = document.createElement('span');
        inner.className = 'word';
        inner.textContent = w;
        outer.appendChild(inner);
        el.appendChild(outer);
        el.appendChild(document.createTextNode(' '));
        return inner;
      });
      el.style.opacity = '1';
      const ctrl = animate(
        spans,
        { transform: ['translateY(110%)', 'translateY(0%)'], opacity: [0, 1] },
        { duration: 0.7, delay: stagger(0.08), ease: EASE },
      );
      add('headlineRise', () => {
        ctrl.stop();
        el.textContent = orig;
        el.style.opacity = '';
      });
    });
  },

  // --- Variable weight "breath" ---
  weightBreath() {
    $('[data-anim="weight-breath"]').forEach((el) => {
      const ctrl = animate(
        el,
        { opacity: [1, 0.88, 1], letterSpacing: ['0em', '0.004em', '0em'] },
        { duration: 6, repeat: Infinity, ease: 'easeInOut' },
      );
      add('weightBreath', () => { ctrl.stop(); el.style.opacity = ''; el.style.letterSpacing = ''; });
    });
  },

  // --- Scroll parallax ---
  parallax() {
    $('[data-anim="parallax"]').forEach((section) => {
      const layer = section.querySelector<HTMLElement>('.block-bg') ?? section;
      const stop = scroll(
        (p: number) => { layer.style.transform = `translateY(${(p - 0.5) * 70}px) scale(1.06)`; },
        { target: section, offset: ['start end', 'end start'] },
      );
      add('parallax', () => { stop(); layer.style.transform = ''; });
    });
  },

  // --- 3D card / image tilt (distinct hooks → each element binds once) ---
  cardTilt() { tiltGroup('cardTilt', '[data-fx-tilt]'); },
  imageTilt() { tiltGroup('imageTilt', '[data-fx-tilt-img]'); },

  // --- Magnetic buttons ---
  magneticButtons() {
    $('[data-fx-magnetic]').forEach((el) => {
      let raf = 0;
      const onMove = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          el.style.transform = `translate(${dx * 0.25}px, ${dy * 0.35}px)`;
        });
      };
      const onLeave = () => { cancelAnimationFrame(raf); animate(el, { transform: 'translate(0px,0px)' }, { duration: 0.4, ease: EASE }); };
      el.addEventListener('pointermove', onMove);
      el.addEventListener('pointerleave', onLeave);
      add('magneticButtons', () => {
        cancelAnimationFrame(raf);
        el.removeEventListener('pointermove', onMove);
        el.removeEventListener('pointerleave', onLeave);
        el.style.transform = '';
      });
    });
  },

  // --- Scroll-draw: ONE-SHOT timed draw when a mark scrolls into view ---
  // Covers the outline sketches (baguette/toast) AND the face. Native IO + WAAPI
  // (motion's strokeDashoffset animation does not apply reliably here), with a
  // hard guarantee the mark is never left invisible.
  scrollDraw() {
    $('[data-anim="scroll-draw"]').forEach((svg) => {
      const strokes = Array.from(svg.querySelectorAll<SVGPathElement>('path'))
        .filter((p) => getComputedStyle(p).fill === 'none' || svg.getAttribute('fill') === 'none');
      if (strokes.length) drawOnScroll(svg, strokes);
      else {
        // Filled mark with no strokes: reveal/scale instead.
        const fn = inView(svg, () => {
          animate(svg, { opacity: [0, 1], scale: [0.9, 1] }, { duration: 0.7, ease: EASE });
          return () => {};
        }, { amount: 0.4 });
        add('scrollDraw', () => { fn(); (svg as HTMLElement).style.opacity = ''; (svg as HTMLElement).style.transform = ''; });
      }
    });
    // Face marks (footer / 404): draw the stroked outline on scroll-in, then
    // settle back to the filled resting state.
    $('[data-face-draw]').forEach((svg) => {
      const strokes = Array.from(svg.querySelectorAll<SVGPathElement>('.ff-strokes path'));
      if (strokes.length) drawOnScroll(svg, strokes, svg);
    });
  },

  // --- Face hover-draw (footer / 404 ornaments) ---
  faceDraw() {
    $('[data-face-draw]').forEach((svg) => {
      const strokes = Array.from(svg.querySelectorAll<SVGPathElement>('.ff-strokes path'));
      if (!strokes.length) return;
      let lens: number[] | null = null;
      let drawing = false;
      const enter = () => {
        if (drawing) return;
        drawing = true;
        if (!lens) lens = strokes.map((p) => p.getTotalLength());
        svg.classList.add('is-drawing');
        const total = strokes.length;
        strokes.forEach((p, i) => {
          const L = lens![i];
          p.style.strokeDasharray = String(L);
          p.style.strokeDashoffset = String(L);
          // slight per-stroke stagger → reads like a hand sketching (WAAPI:
          // motion's strokeDashoffset animation does not apply reliably here)
          p.animate(
            [{ strokeDashoffset: L }, { strokeDashoffset: 0 }],
            { duration: 500, delay: (i / total) * 500, easing: 'cubic-bezier(0.4,0,0.2,1)', fill: 'forwards' },
          );
          p.style.strokeDashoffset = '0';
        });
      };
      const leave = () => {
        drawing = false;
        svg.classList.remove('is-drawing'); // CSS fades fill back / strokes out
      };
      svg.addEventListener('mouseenter', enter);
      svg.addEventListener('mouseleave', leave);
      add('faceDraw', () => {
        svg.removeEventListener('mouseenter', enter);
        svg.removeEventListener('mouseleave', leave);
        svg.classList.remove('is-drawing');
        strokes.forEach((p) => { p.style.strokeDasharray = ''; p.style.strokeDashoffset = ''; });
      });
    });
  },

  // --- Reveal on scroll: editorial variants + optional staggered children ---
  // data-reveal="up|left|right|rise|blur" picks the entrance; add
  // data-reveal-children to stagger the container's direct children instead.
  reveal() {
    const V: Record<string, { from: string; blur?: boolean }> = {
      up: { from: 'translateY(28px)' },
      left: { from: 'translateX(-44px)' },
      right: { from: 'translateX(44px)' },
      rise: { from: 'translateY(52px)' },
      blur: { from: 'translateY(16px)', blur: true },
    };
    $('[data-anim="reveal"]').forEach((el) => {
      const staggered = el.hasAttribute('data-reveal-children');
      const targets = (staggered ? Array.from(el.children) : [el]) as HTMLElement[];
      const v = V[el.getAttribute('data-reveal') || 'up'] ?? V.up;
      if (staggered) el.style.opacity = '1'; // container visible; children carry the reveal
      targets.forEach((t) => { t.style.opacity = '0'; t.style.transform = v.from; if (v.blur) t.style.filter = 'blur(7px)'; });
      const fn = inView(el, () => {
        targets.forEach((t, i) => {
          animate(
            t,
            { opacity: 1, transform: 'translate(0px, 0px)', ...(v.blur ? { filter: 'blur(0px)' } : {}) },
            { duration: 0.85, delay: targets.length > 1 ? i * 0.09 : 0, ease: EASE },
          );
        });
        return () => {};
      }, { amount: 0.15 });
      add('reveal', () => { fn(); targets.forEach((t) => { t.style.opacity = ''; t.style.transform = ''; t.style.filter = ''; }); });
    });
  },

  // --- Line-mask headline reveal: words rise from behind a mask on entry ---
  lineMask() {
    $('[data-anim="lines"]').forEach((el) => {
      const orig = el.getAttribute('data-orig') ?? el.textContent ?? '';
      el.setAttribute('data-orig', orig);
      const words = orig.split(/\s+/).filter(Boolean);
      el.textContent = '';
      const spans = words.map((w) => {
        const outer = document.createElement('span');
        outer.className = 'word-mask';
        const inner = document.createElement('span');
        inner.className = 'word';
        inner.textContent = w;
        inner.style.transform = 'translateY(110%)';
        outer.appendChild(inner);
        el.appendChild(outer);
        el.appendChild(document.createTextNode(' '));
        return inner;
      });
      (el as HTMLElement).style.opacity = '1';
      let ran = false;
      const fn = inView(el, () => {
        if (ran) return;
        ran = true;
        animate(spans, { transform: ['translateY(110%)', 'translateY(0%)'] }, { duration: 0.65, delay: stagger(0.09), ease: EASE });
        return () => {};
      }, { amount: 0.5 });
      add('lineMask', () => { fn(); el.textContent = orig; (el as HTMLElement).style.opacity = ''; });
    });
  },

  // --- Image reveal wipe: clip-path unveil + scale settle on entry ---
  // The IO watches the UNCLIPPED PARENT: Chromium factors clip-path into
  // intersection geometry, so observing the fully-clipped picture itself would
  // never fire and the image would stay invisible.
  imageWipe() {
    $<HTMLElement>('[data-anim="wipe"]').forEach((pic) => {
      const img = pic.querySelector<HTMLElement>('img');
      // Only hide images still below the viewport (no flash for above-fold).
      const r = pic.getBoundingClientRect();
      if (r.top < window.innerHeight) return;
      pic.style.clipPath = 'inset(100% 0 0 0)';
      if (img) img.style.transform = 'scale(1.05)';
      let ran = false;
      const play = () => {
        if (ran) return;
        ran = true;
        io.disconnect();
        clearTimeout(safety);
        animate(pic, { clipPath: ['inset(100% 0 0 0)', 'inset(0% 0 0 0)'] }, { duration: 0.8, ease: EASE })
          .finished.then(() => { pic.style.clipPath = ''; });
        if (img) animate(img, { transform: ['scale(1.05)', 'scale(1)'] }, { duration: 0.9, ease: EASE }).finished.then(() => { img.style.transform = ''; });
      };
      const io = new IntersectionObserver((entries) => {
        if (entries.some((e) => e.isIntersecting)) play();
      }, { threshold: 0.2 });
      io.observe(pic.parentElement ?? pic);
      // Never-blank watchdog: if the slot is on screen and the wipe hasn't
      // played (IO missed), play it.
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

  // --- Typewriter ---
  typewriter() {
    $('[data-anim="typewriter"]').forEach((el) => {
      const text = el.getAttribute('data-orig') ?? el.textContent ?? '';
      el.setAttribute('data-orig', text);
      el.textContent = '';
      el.classList.add('is-typing');
      let i = 0;
      const tick = () => {
        el.textContent = text.slice(0, i++);
        if (i <= text.length) timer = window.setTimeout(tick, 55);
        else el.classList.remove('is-typing');
      };
      let timer = window.setTimeout(tick, 250);
      add('typewriter', () => { clearTimeout(timer); el.textContent = text; el.classList.remove('is-typing'); });
    });
  },

  // --- Marquee ---
  marquee() {
    $('[data-anim="marquee"]').forEach((wrap) => {
      const track = wrap.querySelector<HTMLElement>('.marquee-track');
      if (!track) return;
      const originals = Array.from(track.children);
      originals.forEach((n) => track.appendChild(n.cloneNode(true)));
      const ctrl = animate(track, { transform: ['translateX(0%)', 'translateX(-50%)'] }, { duration: 22, repeat: Infinity, ease: 'linear' });
      add('marquee', () => {
        ctrl.stop();
        track.style.transform = '';
        Array.from(track.children).slice(originals.length).forEach((n) => n.remove());
      });
    });
  },

  // --- Count-up ---
  countUp() {
    $('[data-countup]').forEach((el) => {
      const target = Number(el.getAttribute('data-countup') || '0');
      const pre = el.getAttribute('data-prefix') ?? '';
      const suf = el.getAttribute('data-suffix') ?? '';
      let ctrl: { stop: () => void } | null = null;
      let ran = false;
      const fn = inView(el, () => {
        if (ran) return; // count once, even if it re-enters the viewport
        ran = true;
        ctrl = animate(0, target, {
          duration: 1.4,
          ease: 'easeOut',
          onUpdate: (v) => { el.textContent = `${pre}${Math.round(v)}${suf}`; },
        });
      }, { amount: 0.5 });
      add('countUp', () => { ctrl?.stop(); fn(); el.textContent = `${pre}${target}${suf}`; });
    });
  },

  // --- Menu photo cursor ---
  photoCursor() {
    const rows = $('[data-fx-photocursor]');
    if (!rows.length) return;
    const thumb = document.createElement('div');
    thumb.className = 'photo-cursor';
    thumb.setAttribute('aria-hidden', 'true');
    document.body.appendChild(thumb);
    let raf = 0;
    const move = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => { thumb.style.transform = `translate(${e.clientX + 18}px, ${e.clientY - 40}px)`; });
    };
    rows.forEach((row) => {
      const img = (row as HTMLElement).dataset.img;
      const enter = () => {
        thumb.style.backgroundImage = img ? `url("${img}")` : '';
        thumb.classList.toggle('has-img', !!img);
        thumb.classList.add('is-on');
      };
      const leave = () => { thumb.classList.remove('is-on'); };
      row.addEventListener('pointerenter', enter);
      row.addEventListener('pointerleave', leave);
      row.addEventListener('pointermove', move as EventListener);
      add('photoCursor', () => {
        row.removeEventListener('pointerenter', enter);
        row.removeEventListener('pointerleave', leave);
        row.removeEventListener('pointermove', move as EventListener);
      });
    });
    add('photoCursor', () => { cancelAnimationFrame(raf); thumb.remove(); });
  },

  // --- Ingredient slider (drag to scroll) ---
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

  // --- Story rail (scroll-linked slide) ---
  storyRail() {
    $('[data-anim="story-rail"] .chapter').forEach((ch, i) => {
      const img = ch.querySelector<HTMLElement>('.chapter-img');
      const text = ch.querySelector<HTMLElement>('.chapter-text');
      const dir = i % 2 ? -1 : 1;
      const stop = scroll(
        (p: number) => {
          const t = (p - 0.5) * 2; // -1..1
          if (img) img.style.transform = `translateX(${t * 18 * dir}px)`;
          if (text) text.style.transform = `translateX(${t * -10 * dir}px)`;
        },
        { target: ch, offset: ['start end', 'end start'] },
      );
      add('storyRail', () => { stop(); if (img) img.style.transform = ''; if (text) text.style.transform = ''; });
    });
  },

  // --- Page transition: handled via CSS view-transitions (html.fx-pagetransition).
  pageTransition() {
    document.documentElement.classList.add('fx-pagetransition');
    add('pageTransition', () => document.documentElement.classList.remove('fx-pagetransition'));
  },

  // --- Toast: registers the API; demo toasts fired elsewhere. ---
  toast() {
    // No persistent state; the toast() helper is always available below.
    add('toast', () => {});
  },
};

// One-shot stroke draw when an element scrolls into view. Native
// IntersectionObserver + Web Animations API. Guarantees the mark is NEVER left
// invisible: under reduced-motion (or if IO never fires) it shows the final
// state. With a `face`, the fill fades out while the outline draws, then settles
// back to the filled resting state.
function drawOnScroll(svg: Element, strokes: SVGPathElement[], face?: Element) {
  const lens = strokes.map((p) => p.getTotalLength());
  strokes.forEach((p, i) => { p.style.strokeDasharray = String(lens[i]); p.style.strokeDashoffset = String(lens[i]); });

  const settleFilled = () => { if (face) face.classList.remove('is-drawing'); };
  const showFinal = () => {
    // Outline marks settle fully drawn; a face settles filled (strokes hidden by CSS).
    if (!face) strokes.forEach((p) => { p.style.strokeDashoffset = '0'; });
    settleFilled();
  };
  if (reduced()) { showFinal(); return; }

  const step = Math.min(80, Math.floor(700 / strokes.length)); // ms between subpaths
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
      p.style.strokeDashoffset = '0'; // settled base value once the animation holds
      maxEnd = Math.max(maxEnd, delay + 1100);
    });
    if (face) window.setTimeout(settleFilled, maxEnd + 150);
  };

  const io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) draw();
  }, { threshold: 0.35 });
  io.observe(svg);
  // Never leave a sketch invisible if IO somehow doesn't fire — but ONLY
  // force-draw when the mark is actually on screen. (The old blanket timer drew
  // everything 2.5s after load, so below-the-fold sketches were already done
  // before the user reached them and looked permanently static.)
  let safety = 0;
  const watchdog = () => {
    if (done) return;
    const r = svg.getBoundingClientRect();
    const visible = r.bottom > 0 && r.top < window.innerHeight && r.width > 0;
    if (visible) draw(); // on screen for 2.5s with no IO callback → IO failed, rescue it
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

// Shared tilt for cards + images. Each group has its OWN selector so an element
// is never bound twice (cards: [data-fx-tilt], images: [data-fx-tilt-img]).
function tiltGroup(name: 'cardTilt' | 'imageTilt', selector: string) {
  $(selector).forEach((el) => {
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform = `perspective(800px) rotateY(${px * 8}deg) rotateX(${-py * 8}deg)`;
      });
    };
    const onLeave = () => { cancelAnimationFrame(raf); animate(el, { transform: 'perspective(800px) rotateY(0deg) rotateX(0deg)' }, { duration: 0.4, ease: EASE }); };
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    add(name, () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      el.style.transform = '';
    });
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
  animate(t, { opacity: [0, 1], transform: ['translateY(12px)', 'translateY(0px)'] }, { duration: 0.32, ease: EASE });
  setTimeout(() => {
    animate(t, { opacity: [1, 0], transform: ['translateY(0px)', 'translateY(8px)'] }, { duration: 0.3 }).finished.then(() => t.remove());
  }, 2600);
}

/* ============================================================ DRIVER ==== */
const NAMES = Object.keys(builders);
const META: Record<string, string> = {
  preloader: 'Brand splash that fades out on first load.',
  kenBurns: 'Slow scale + drift on hero / feature imagery.',
  heroRise: 'Hero glass panel rises and fades in on load.',
  headlineRise: 'Hero headline rises word by word.',
  weightBreath: 'Headline gently “breathes” in weight/opacity.',
  parallax: 'Background layers drift against scroll for depth.',
  cardTilt: '3D tilt on cards toward the cursor.',
  imageTilt: '3D tilt on images toward the cursor.',
  magneticButtons: 'Buttons pull slightly toward the cursor.',
  scrollDraw: 'Sketches draw themselves on scroll; the face fades in.',
  faceDraw: 'The face mark pen-draws itself on hover (footer / 404).',
  reveal: 'Sections fade and rise into view on scroll.',
  lineMask: 'Section headlines rise word-by-word from behind a mask.',
  imageWipe: 'Feature images unveil with a wipe + scale settle.',
  typewriter: 'Eyebrow text types itself out.',
  marquee: 'Looping word ticker.',
  countUp: 'Stat numbers count up when seen.',
  pageTransition: 'Crossfade between page navigations.',
  toast: 'Transient corner notifications.',
  photoCursor: 'Menu rows float a thumbnail by the cursor.',
  ingredientSlider: 'Drag the ingredient row to scroll it.',
  storyRail: 'Story chapters slide along a scroll-linked rail.',
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

function stopAll() {
  NAMES.forEach(stopEffect);
}

window.LoumaFX = {
  names: NAMES,
  meta: META,
  isOn: (n) => flagOn(n),
  isAvailable: (n) => available(n),
  setEnabled,
  toast,
};

// When view transitions are on (pageTransition flag → ClientRouter present),
// astro:page-load fires on the FIRST load and on every navigation. When off,
// there is no such event, so fall back to a one-time DOM-ready init. Picking
// exactly one path avoids the double-init that re-runs every effect on load.
if (features.pageTransition) {
  document.addEventListener('astro:page-load', initAll);
  document.addEventListener('astro:before-swap', stopAll);
} else if (document.readyState !== 'loading') {
  initAll();
} else {
  document.addEventListener('DOMContentLoaded', initAll, { once: true });
}
