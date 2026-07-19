/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Fic Appreciation › Kudos Tracker

Detects and records kudos, updates work-page controls, decorates listing blurbs,
and optionally submits quick kudos without navigation.

Notes

- Recorded kudos dates use local ISO date strings.
- New records dispatch the shared kudos-given event.
- Cleanup aborts quick-kudos requests and removes form listeners.

═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   IMPORTS
═══════════════════════════════════════════════════════════════════════════ */

import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { EV_KUDOS_GIVEN } from '../../../../lib/utils/event-names.js';
import { giveKudos } from '../../../../lib/ao3/actions.js';
import { getBlurbMeta } from '../../../../lib/ao3/parsers.js';
import { appendHeadingBadge } from '../../../../lib/ui/badges.js';


/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE SETUP
═══════════════════════════════════════════════════════════════════════════ */

const W = getGlobalWindow();

export class KudosTracker {
  /** @param {{ NS, storeGet, storeSet, cfg }} opts */
  constructor ({ NS, storeGet, storeSet, cfg }) {
    this.NS       = NS;
    this.storeGet = storeGet;
    this.storeSet = storeSet;
    this.cfg      = cfg;
    this.SK       = 'ficAppreciation:kudosed';
    this._forms   = new Map();
    this._requestController = new AbortController();
  }

  _load ()    { return this.storeGet(this.SK, {}); }
  _save (map) { this.storeSet(this.SK, map); }

  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE — KUDOS DETECTION AND RECORDING
  ═══════════════════════════════════════════════════════════════════════ */

  hasGivenKudos (workId) { return workId in this._load(); }

  /**
   * Record a kudos. `meta` (title/author/fandoms) is captured opportunistically
   * from whatever page triggered the recording, so fandom/author breakdowns and
   * kudos-history search can work — older entries without it degrade gracefully.
   * @param {string} workId
   * @param {{title?: string, author?: string, fandoms?: string[]}} [meta]
   */
  recordKudos (workId, meta = {}) {
    const map = this._load();
    if (map[workId]) return;
    map[workId] = { date: new Date().toISOString().slice(0, 10), ts: Date.now(), ...meta };
    this._save(map);
    W.dispatchEvent?.(new CustomEvent(EV_KUDOS_GIVEN, { detail: { workId } }));
  }

  /** Extract title/author/fandoms from the current work page, for kudos records. */
  _extractWorkPageMeta () {
    const title    = document.querySelector('h2.title.heading')?.textContent.trim();
    const author   = document.querySelector('h3.byline.heading a[rel="author"]')?.textContent.trim();
    const fandoms  = Array.from(document.querySelectorAll('dd.fandom.tags a.tag')).map(a => a.textContent.trim());
    const meta = {};
    if (title) meta.title = title;
    if (author) meta.author = author;
    if (fandoms.length) meta.fandoms = fandoms;
    return meta;
  }

  /** Detect kudos given on the current work page (by checking the kudos list). */
  detectKudosOnWorkPage (workId) {
    if (this.hasGivenKudos(workId)) return true;

    const username = document.querySelector(
      'a.login-toggle, [data-login] .user a, .header.module a[href*="/users/"]'
    )?.textContent.trim();
    if (!username) return false;

    const kudosList = document.querySelector('.kudos');
    if (kudosList && kudosList.textContent.includes(username)) {
      this.recordKudos(workId, this._extractWorkPageMeta());
      return true;
    }
    return false;
  }

  /** Grey out the kudos button if already kudosed; watch for new kudos. */
  applyKudosStateOnWorkPage (workId) {
    const { NS } = this;
    const alreadyKudosed = this.detectKudosOnWorkPage(workId);

    if (!alreadyKudosed) {
      const form = document.querySelector('#kudos form, .kudos form');
      if (form && !form.dataset.faWatched) {
        form.dataset.faWatched = '1';
        const handler = () => this.recordKudos(workId, this._extractWorkPageMeta());
        form.addEventListener('submit', handler);
        this._forms.set(form, handler);
      }
      return;
    }

    const btn = document.querySelector('#kudos input[type="submit"], .kudos input[type="submit"]');
    if (btn) {
      btn.disabled      = true;
      btn.value         = '🧡 Kudos given!';
      btn.classList.add('ao3h-fa-kudos-given');
    }

    if (this.cfg('commentAssistOnRevisit')) {
      this._injectRevisitPrompt(workId);
    }
  }

  /**
   * Reminder banner shown on a work page you've finished but never kudosed.
   * Offers a one-click "Give kudos" action; caller is responsible for deciding
   * when this applies (needs MarkAsFinished's data, which this class doesn't own).
   */
  injectKudosReminderBanner (workId) {
    const { NS } = this;
    if (this.hasGivenKudos(workId)) return;
    if (document.getElementById(`${NS}-fa-kudos-reminder`)) return;

    const banner = document.createElement('div');
    banner.id        = `${NS}-fa-kudos-reminder`;
    banner.className = `${NS}-fa-revisit-prompt`;
    banner.innerHTML = `
      <span>You finished this work but haven't left kudos yet.</span>
      <button type="button" class="${NS}-fa-kudos-reminder-btn ${NS}-fa-revisit-link">🧡 Give kudos</button>
      <button type="button" class="${NS}-fa-revisit-dismiss" aria-label="Dismiss">✕</button>
    `;
    banner.querySelector(`.${NS}-fa-kudos-reminder-btn`)?.addEventListener('click', async (e) => {
      const btn = /** @type {HTMLButtonElement} */ (e.currentTarget);
      btn.disabled    = true;
      btn.textContent = 'Giving kudos…';
      const ok = await giveKudos(workId, { signal: this._requestController.signal });
      if (this._requestController.signal.aborted) return;
      if (ok) {
        this.recordKudos(workId, this._extractWorkPageMeta());
        banner.remove();
        this.applyKudosStateOnWorkPage(workId);
      } else {
        btn.disabled    = false;
        btn.textContent = '🧡 Give kudos';
      }
    });
    banner.querySelector(`.${NS}-fa-revisit-dismiss`)?.addEventListener('click', () => banner.remove());
    document.querySelector('#kudos, .kudos')?.after(banner);
  }

  _injectRevisitPrompt (workId) {
    const { NS } = this;
    if (document.getElementById(`${NS}-fa-revisit-prompt`)) return;
    const kudosDate = this._load()[workId]?.date;
    const prompt    = document.createElement('div');
    prompt.id       = `${NS}-fa-revisit-prompt`;
    prompt.className = `${NS}-fa-revisit-prompt`;
    prompt.innerHTML = `
      <span>You kudos'd this work${kudosDate ? ` on ${kudosDate}` : ''} — enjoying it again?</span>
      <a href="#comments" class="${NS}-fa-revisit-link">Leave a comment ↓</a>
      <button class="${NS}-fa-revisit-dismiss" aria-label="Dismiss">✕</button>
    `;
    prompt.querySelector(`.${NS}-fa-revisit-dismiss`)
      ?.addEventListener('click', () => prompt.remove());
    document.querySelector('#kudos, .kudos')?.after(prompt);
  }

  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE — LISTING BADGES AND QUICK KUDOS
  ═══════════════════════════════════════════════════════════════════════ */

  /** Add 🧡 badge to a listing blurb if kudos given. */
  applyKudosBadge (blurb, workId) {
    const { NS } = this;
    if (blurb.dataset.faKudos) return;
    blurb.dataset.faKudos = '1';

    if (!workId || !this.hasGivenKudos(workId)) return;

    appendHeadingBadge(blurb, {
      className: `${NS}-fa-badge ${NS}-fa-badge-kudos`,
      guardSelector: `.${NS}-fa-badge-kudos`,
      text: '🧡',
      title: `Kudos'd on ${this._load()[workId]?.date || ''}`,
    });
  }

  /** Inject a quick-kudos button on a listing blurb (no page reload needed). */
  injectQuickKudosButton (blurb, workId) {
    const { NS } = this;
    if (blurb.dataset.faQuickKudos) return;
    blurb.dataset.faQuickKudos = '1';
    const stats = blurb.querySelector('.stats');
    if (!stats) return;

    const btn       = document.createElement('button');
    btn.type        = 'button';
    btn.className   = `${NS}-fa-blurb-btn`;
    btn.textContent = '🤍';
    btn.title       = 'Give kudos (no reload needed)';

    /** @type {ReturnType<typeof setTimeout>|null} */
    let confirmTimer = null;

    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (this.cfg('confirmBeforeKudos') && btn.dataset.faConfirm !== '1') {
        btn.dataset.faConfirm = '1';
        btn.textContent = '❓';
        btn.title       = 'Click again to confirm';
        confirmTimer = setTimeout(() => {
          if (!btn.isConnected) return;
          btn.dataset.faConfirm = '';
          btn.textContent = '🤍';
          btn.title       = 'Give kudos (no reload needed)';
        }, 4000);
        return;
      }
      if (confirmTimer) clearTimeout(confirmTimer);

      try {
        const ok = await giveKudos(workId, { signal: this._requestController.signal });
        if (this._requestController.signal.aborted) return;
        if (ok) {
          const meta = getBlurbMeta(blurb);
          this.recordKudos(workId, meta ? { title: meta.title, author: meta.author, fandoms: meta.fandoms } : {});
          if (btn.isConnected) {
            btn.textContent = '🧡';
            btn.title       = 'Kudos given!';
            btn.disabled    = true;
          }
        } else {
          if (btn.isConnected) btn.title = 'Kudos failed — try opening the work';
        }
      } catch (error) {
        if (error?.name !== 'AbortError' && btn.isConnected) {
          btn.title = 'Kudos failed — try opening the work';
        }
      }
    });

    stats.appendChild(btn);
  }

  /* ═══════════════════════════════════════════════════════════════════════
     FEATURE LIFECYCLE
  ═══════════════════════════════════════════════════════════════════════ */

  cleanup () {
    this._requestController.abort();
    this._forms.forEach((handler, form) => {
      form.removeEventListener('submit', handler);
      delete form.dataset.faWatched;
    });
    this._forms.clear();
  }
}
