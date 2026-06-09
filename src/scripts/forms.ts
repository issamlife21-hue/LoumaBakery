/**
 * Netlify Forms — progressive AJAX submit. Forms still work without JS
 * (native POST → Netlify success page); with JS we submit in the background
 * and show an inline confirmation + toast, with a brand-voice retry on error.
 *
 * Honeypot: forms carry netlify-honeypot="bot-field" + a hidden bot-field.
 * If a bot fills it we silently no-op (and Netlify drops it server-side too).
 *
 * Per-form copy is read from data-success / data-error (with sensible
 * fallbacks), so messages live with the markup, not here.
 */
const DEFAULT_SUCCESS = "Thanks — we've got it. We'll be in touch.";
const DEFAULT_ERROR = "That didn't go through. Give it another try, or email hello@loumabakery.com.";

function encode(data: FormData): string {
  const params = new URLSearchParams();
  data.forEach((v, k) => params.append(k, typeof v === 'string' ? v : ''));
  return params.toString();
}

function showMessage(form: HTMLFormElement, kind: 'success' | 'error', text: string) {
  let box = form.querySelector<HTMLElement>(`.form-msg--${kind}`);
  if (!box) {
    box = document.createElement('p');
    box.className = `form-msg form-msg--${kind}`;
    box.setAttribute('role', kind === 'error' ? 'alert' : 'status');
    form.appendChild(box);
  }
  box.textContent = text;
}

function initForms() {
  document.querySelectorAll<HTMLFormElement>('form[data-netlify]').forEach((form) => {
    if (form.dataset.fxBound) return;
    form.dataset.fxBound = 'true';

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Honeypot — if filled, pretend success and stop.
      const honey = form.querySelector<HTMLInputElement>('[name="bot-field"]');
      if (honey && honey.value) return;

      const btn = form.querySelector<HTMLButtonElement>('button[type="submit"]');
      const okMsg = form.getAttribute('data-success') || DEFAULT_SUCCESS;
      const errMsg = form.getAttribute('data-error') || DEFAULT_ERROR;
      const toast = window.LoumaFX?.toast;

      // clear any prior error
      form.querySelector('.form-msg--error')?.remove();
      if (btn) { btn.disabled = true; btn.dataset.label = btn.textContent || ''; btn.textContent = 'Sending…'; }

      try {
        const res = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: encode(new FormData(form)),
        });
        if (!res.ok) throw new Error(String(res.status));

        // Success: replace the fields with the confirmation, keep it tidy.
        form
          .querySelectorAll<HTMLElement>('.field, .field--full, .news-row, .foot-news-row, button[type="submit"]')
          .forEach((el) => { el.style.display = 'none'; });
        showMessage(form, 'success', okMsg);
        form.setAttribute('data-submitted', 'true');
        toast?.(okMsg, { tone: 'good' });
      } catch {
        if (btn) { btn.disabled = false; btn.textContent = btn.dataset.label || 'Submit'; }
        showMessage(form, 'error', errMsg);
        toast?.("Hmm — that didn't send.");
      }
    });
  });
}

document.addEventListener('astro:page-load', initForms);
