import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const VOICES = [
  {
    name: "Alex",
    lang: "en-US",
    localService: true,
    default: true,
    voiceURI: "alex",
  },
  {
    name: "Aria",
    lang: "en-US",
    localService: false,
    default: false,
    voiceURI: "aria",
  },
  {
    name: "Samira",
    lang: "fr-FR",
    localService: true,
    default: false,
    voiceURI: "samira",
  },
];

class FakeUtterance {
  constructor(text) {
    this.text = text;
    this.onend = null;
    this.onerror = null;
  }
}

function buildWorkPage() {
  document.body.innerHTML = `
    <div id="chapters">
      <div class="chapter">
        <div class="userstuff">
          <p>First sentence here.</p>
          <p>Second sentence here.</p>
          <p>Third sentence here.</p>
        </div>
      </div>
    </div>
    <ul class="work navigation actions">
      <li class="chapter next"><a href="/works/1/chapters/2">Next Chapter</a></li>
    </ul>
  `;
}

function stubSpeechSynthesis() {
  const listeners = {};
  const synth = {
    speak: vi.fn((u) => {
      synth._lastUtterance = u;
    }),
    cancel: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    getVoices: () => VOICES,
    addEventListener: (ev, fn) => {
      (listeners[ev] ||= []).push(fn);
    },
    removeEventListener: (ev, fn) => {
      listeners[ev] = (listeners[ev] || []).filter((f) => f !== fn);
    },
  };
  vi.stubGlobal("speechSynthesis", synth);
  vi.stubGlobal("SpeechSynthesisUtterance", FakeUtterance);
  return synth;
}

async function boot(settings = {}) {
  localStorage.setItem(
    "ao3h:mod:textToSpeech:settings",
    JSON.stringify(settings),
  );
  history.pushState(null, "", "/works/1");
  buildWorkPage();
  const synth = stubSpeechSynthesis();
  const { setEnabled } = await import("../../../core/lifecycle.js");
  await import("./_textToSpeech.js");
  await setEnabled("textToSpeech", true);
  await setEnabled("visualFeedback", true);
  return { synth, setEnabled };
}

async function teardown(setEnabled) {
  await setEnabled("visualFeedback", false);
  await setEnabled("textToSpeech", false);
}

describe("textToSpeech (intégration)", () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("démarre, joue une phrase avec le volume/la hauteur configurés, puis se ferme proprement", async () => {
    const { synth, setEnabled } = await boot({ volume: 0.6, pitch: 1.3 });
    try {
      const playBtn = document.querySelector('.ao3h-tts-btn[data-act="play"]');
      playBtn.click();

      expect(synth.speak).toHaveBeenCalledTimes(1);
      expect(synth._lastUtterance.volume).toBeCloseTo(0.6);
      expect(synth._lastUtterance.pitch).toBeCloseTo(1.3);
    } finally {
      await teardown(setEnabled);
    }
    expect(document.querySelector(".ao3h-tts-fab")).toBeNull();
  });

  it("un profil de vitesse prédéfini met à jour le curseur et son étiquette", async () => {
    const { setEnabled } = await boot();
    try {
      const comfortableBtn = document.querySelector(
        '.ao3h-tts-preset-btn[data-preset="comfortable"]',
      );
      comfortableBtn.click();

      const rateSlider = document.querySelector(".ao3h-tts-rate-range");
      const rateVal = document.querySelector(".ao3h-tts-rate-val");
      expect(rateSlider.value).toBe("0.85");
      expect(rateVal.textContent).toBe("0.85×");
    } finally {
      await teardown(setEnabled);
    }
  });

  it("couper le son rend les phrases muettes sans modifier le curseur de volume, puis restaure au réactivation", async () => {
    const { synth, setEnabled } = await boot();
    try {
      document.querySelector('[data-act="play"]').click();
      expect(synth._lastUtterance.volume).toBeCloseTo(1);

      document.querySelector(".ao3h-tts-mute-btn").click();
      synth._lastUtterance.onend(); // avance à la 2e phrase pendant la coupure du son

      expect(synth._lastUtterance.volume).toBe(0);
      expect(document.querySelector(".ao3h-tts-volume-range").value).toBe("1"); // curseur inchangé

      document.querySelector(".ao3h-tts-mute-btn").click();
      synth._lastUtterance.onend(); // avance à la 3e phrase après réactivation

      expect(synth._lastUtterance.volume).toBeCloseTo(1);
    } finally {
      await teardown(setEnabled);
    }
  });

  it("le saut manuel avance d’une phrase en annulant la lecture en cours", async () => {
    const { synth, setEnabled } = await boot();
    try {
      document.querySelector('[data-act="play"]').click();
      expect(synth.speak).toHaveBeenCalledTimes(1);
      expect(synth._lastUtterance.text).toBe("First sentence here.");

      document.querySelector('[data-act="skip-forward"]').click();

      expect(synth.cancel).toHaveBeenCalled();
      expect(synth.speak).toHaveBeenCalledTimes(2);
      expect(synth._lastUtterance.text).toBe("Second sentence here.");

      const progressBar = document.querySelector(".ao3h-tts-progress-bar");
      expect(progressBar.style.width).not.toBe("0%");
    } finally {
      await teardown(setEnabled);
    }
  });

  it("la fin de chapitre notifie, demande confirmation, et adoucit le passage au chapitre suivant", async () => {
    vi.stubGlobal(
      "confirm",
      vi.fn(() => true),
    );
    const { synth, setEnabled } = await boot({
      autoNextChapter: true,
      confirmNextChapter: true,
      notifyChapterEnd: true,
    });
    try {
      const nextLink = document.querySelector("li.chapter.next a");
      const clickSpy = vi.fn();
      nextLink.addEventListener("click", clickSpy);

      document.querySelector('[data-act="play"]').click();
      // Termine les 3 phrases préparées
      synth._lastUtterance.onend();
      synth._lastUtterance.onend();
      synth._lastUtterance.onend();

      expect(globalThis.confirm).toHaveBeenCalled();
      expect(document.querySelector(".ao3h-toast")).not.toBeNull();
      expect(document.body.classList.contains("ao3h-tts-chapter-fade")).toBe(
        true,
      );

      await new Promise((resolve) => setTimeout(resolve, 350));
      expect(clickSpy).toHaveBeenCalledTimes(1);
    } finally {
      await teardown(setEnabled);
    }
  });

  it("surligne le paragraphe en cours avec la couleur de surlignage configurée", async () => {
    const { setEnabled } = await boot({ highlightColor: "#00ff00" });
    try {
      document.querySelector('[data-act="play"]').click();

      const mark = document.querySelector("#chapters mark.ao3h-tts-highlight");
      expect(mark).not.toBeNull();
      expect(mark.style.backgroundColor).toBe("#00ff00");
    } finally {
      await teardown(setEnabled);
    }
  });

  it("le filtre de langue restreint la liste des voix et affiche un indicateur local/réseau", async () => {
    const { setEnabled } = await boot();
    try {
      const langSelect = document.querySelector(".ao3h-tts-lang-filter");
      const voiceSelect = document.querySelector(".ao3h-tts-voice-select");

      expect([...langSelect.options].map((o) => o.value)).toEqual([
        "",
        "en-US",
        "fr-FR",
      ]);
      expect(voiceSelect.options.length).toBe(4); // default + 3 voices

      langSelect.value = "fr-FR";
      langSelect.dispatchEvent(new Event("change"));

      expect(voiceSelect.options.length).toBe(2); // default + Samira only
      expect(voiceSelect.options[1].textContent).toBe("Samira (fr-FR) — Local");
    } finally {
      await teardown(setEnabled);
    }
  });
});
