/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Text To Speech › Voice Helpers

Pure helpers for filtering the browser's voice list by language and labelling
each option with a quality hint. The Web Speech API exposes no real audio
quality metric, so `localService` (bundled with the OS/browser vs. requiring
a network round-trip) is used as the closest available proxy — local voices
have lower latency, network voices are frequently more natural-sounding.

═══════════════════════════════════════════════════════════════════════════ */

export function getVoiceLanguages (voices) {
  const langs = new Set((voices || []).map(v => v.lang).filter(Boolean));
  return [...langs].sort((a, b) => a.localeCompare(b));
}

export function filterVoicesByLang (voices, lang) {
  if (!lang) return voices || [];
  return (voices || []).filter(v => v.lang === lang);
}

export function formatVoiceLabel (voice) {
  if (!voice) return '';
  const quality = voice.localService ? 'Local' : 'Network';
  const tags = [quality];
  if (voice.default) tags.push('Default');
  return `${voice.name} (${voice.lang}) — ${tags.join(' · ')}`;
}
