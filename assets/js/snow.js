(function () {
  const STORAGE_KEY = "snowMode";
  // Modes: 0 = normal, 1 = off, 2 = blizzard
  let mode = 0;
  let container = null;

  const MODES = {
    0: { flakes: 60, icon: "❄", label: "Normal snow" },
    1: { flakes: 0, icon: "🚫", label: "Snow off" },
    2: { flakes: 320, icon: "❅", label: "Blizzard snow" }
  };

  function removeSnowContainer() {
    if (container) {
      container.remove();
      container = null;
    }
  }

  function createSnowContainer(currentMode) {
    removeSnowContainer();

    const config = MODES[currentMode];
    const flakeCount = config.flakes;

    if (!flakeCount) return; // off mode

    const isBlizzard = currentMode === 2;
    const c = document.createElement("div");
    c.className = "snowfall";

    for (let i = 0; i < flakeCount; i++) {
      const s = document.createElement("div");
      s.className = "snowflake";

      if (isBlizzard) {
        s.classList.add("blizzard");
      }

      // Icon: ❄ normal, ❅ blizzard
      s.textContent = isBlizzard ? "❅" : "❄";

      // Normal vs blizzard tuning
      const baseSize = isBlizzard ? 10 : 8;
      const sizeRange = isBlizzard ? 24 : 14;
      const baseSpeed = isBlizzard ? 3 : 6; // lower = faster animation duration base
      const speedRange = isBlizzard ? 5 : 8;

      const size = baseSize + Math.random() * sizeRange;
      const duration = baseSpeed + Math.random() * speedRange;
      const delay = Math.random() * -duration;

      s.style.left = Math.random() * 100 + "vw";
      s.style.fontSize = size + "px";
      s.style.animationDuration = duration + "s";
      s.style.animationDelay = delay + "s";

      if (isBlizzard) {
        // Strong sideways drift, random left or right
        const direction = Math.random() < 0.5 ? -1 : 1;
        const magnitude = 40 + Math.random() * 80; // 40–120vw sideways
        s.style.setProperty("--drift", direction * magnitude + "vw");
      }

      c.appendChild(s);
    }

    document.body.appendChild(c);
    container = c;
  }

  function applyState() {
    const toggle = document.getElementById("toggleSnow");
    const config = MODES[mode];

    if (toggle) {
      toggle.textContent = config.icon;
      toggle.classList.toggle("active", mode !== 1); // active unless Off
      toggle.setAttribute("aria-label", config.label);
    }

    createSnowContainer(mode);
  }

  document.addEventListener("DOMContentLoaded", function () {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored !== null) {
      mode = parseInt(stored, 10);
      if (isNaN(mode) || mode < 0 || mode > 2) mode = 0;
    } else {
      // First visit: default normal, unless user prefers reduced motion
      const prefersReduced =
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      mode = prefersReduced ? 1 : 0; // 1 = off, 0 = normal
    }

    const toggle = document.getElementById("toggleSnow");

    if (toggle) {
      toggle.addEventListener("click", function () {
        // Cycle: Normal (0) -> Off (1) -> Blizzard (2) -> Normal (0)
        mode = (mode + 1) % 3;
        localStorage.setItem(STORAGE_KEY, String(mode));
        applyState();
      });
    }

    applyState();
  });
})();
