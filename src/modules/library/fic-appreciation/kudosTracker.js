/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper — Fic Appreciation › KudosTracker sub-module
    Storage key: ficAppreciation:kudosed  — { [workId]: { date } }
    Methods: hasGivenKudos, recordKudos, detectKudosOnWorkPage,
             applyKudosStateOnWorkPage, applyKudosBadge

═══════════════════════════════════════════════════════════════════════════ */

import { getGlobalWindow } from '../../../../lib/utils/globals.js';
import { EV_KUDOS_GIVEN } from '../../../../lib/utils/event-names.js';
import { appendHeadingBadge } from '../../../../lib/ui/status-badge.js';

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

  hasGivenKudos (workId) { return workId in this._load(); }

  recordKudos (workId) {
    const map = this._load();
    if (map[workId]) return;
    map[workId] = { date: new Date().toISOString().slice(0, 10) };
    this._save(map);
    W.dispatchEvent?.(new CustomEvent(EV_KUDOS_GIVEN, { detail: { workId } }));
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
      this.recordKudos(workId);
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
        const handler = () => this.recordKudos(workId);
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

    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      try {
        const token = document.querySelector('meta[name="csrf-token"]')?.content
          || document.querySelector('input[name="authenticity_token"]')?.value
          || '';
        const resp = await fetch(`/works/${workId}/kudos`, {
          method:  'POST',
          headers: {
            'Content-Type':     'application/x-www-form-urlencoded',
            'X-CSRF-Token':     token,
            'X-Requested-With': 'XMLHttpRequest',
          },
          body: `authenticity_token=${encodeURIComponent(token)}`,
          signal: this._requestController.signal,
        });
        if (this._requestController.signal.aborted) return;
        if (resp.ok || resp.redirected) {
          this.recordKudos(workId);
          if (btn.isConnected) {
            btn.textContent = '🧡';
            btn.title       = 'Kudos given!';
            btn.disabled    = true;
          }
        } else {
          if (btn.isConnected) btn.title = `Kudos failed (${resp.status}) — try opening the work`;
        }
      } catch (error) {
        if (error?.name !== 'AbortError' && btn.isConnected) {
          btn.title = 'Kudos failed — try opening the work';
        }
      }
    });

    stats.appendChild(btn);
  }

  cleanup () {
    this._requestController.abort();
    this._forms.forEach((handler, form) => {
      form.removeEventListener('submit', handler);
      delete form.dataset.faWatched;
    });
    this._forms.clear();
  }
}
