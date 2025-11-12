/* ========================= Globals ========================= */
const state = {
  nodes: new Map(),
  edges: [],
  selected: null,
  linkMode: false,
  linkFrom: null,
  inEdges: new Map(),
  outEdges: new Map(),
  focusTitleForId: null,
};

let SNAP_ENABLED = JSON.parse(localStorage.getItem("grid_snap") || "true");
let GRID = parseInt(localStorage.getItem("grid_size") || "24", 10);
let GRID_VISIBLE = JSON.parse(localStorage.getItem("grid_visible") || "true");
let W = 1800, H = 1000; // dynamic via updateStageSize()
const Z = { scale: 1, min: 0.5, max: 2, step: 0.1 };
const Pan = { x: 0, y: 0 };
let FX_ENABLED = JSON.parse(localStorage.getItem("fx_enabled") || "true");

/* ========================= Element refs ========================= */
const wrap = document.getElementById("wrap");
const stage = document.getElementById("stage");
const board = document.getElementById("board");
const linkSvg = document.getElementById("linkSvg");
const sidebar = document.getElementById("sidebar");
const toast = document.getElementById("toast");
const sideTitle = document.getElementById("sideTitle");
const titleInput = document.getElementById("titleInput");
const descInput = document.getElementById("descInput");
const depsList = document.getElementById("depsList");
const burstFx = document.getElementById("burstFx");
const wsRibbons = document.getElementById("wsRibbons");
const importFileInput = document.getElementById("importFileInput");
const gridLayer = document.getElementById("grid");
const gridBtn = document.getElementById("gridBtn");
const gridMenu = document.getElementById("gridMenu");
const gridVisibleInput = document.getElementById("gridVisible");
const gridSizeInput = document.getElementById("gridSize");
const gridSnapInput = document.getElementById("gridSnap");
const themeSelect = document.getElementById("themeSelect");

/* ========================= Utils ========================= */
const uid = () => "n" + Math.random().toString(36).slice(2, 8);
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const getCSS = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

function applyTransform() {
  stage.style.transform = `translate(${Pan.x}px, ${Pan.y}px) scale(${Z.scale})`;
}

let perfTimer = null;
function bumpPerfMode(ms = 240) {
  document.body.classList.add("perf");
  clearTimeout(perfTimer);
  perfTimer = setTimeout(() => document.body.classList.remove("perf"), ms);
}
function updateGrid() {
  if (!gridLayer) return;
  const sz = Math.max(4, Math.floor(GRID));
  gridLayer.style.backgroundSize = `${sz}px ${sz}px, ${sz}px ${sz}px`;
  gridLayer.style.display = GRID_VISIBLE ? "block" : "none";
}
function showToast(m) {
  toast.textContent = m;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1400);
}

/* ========================= Stage sizing ========================= */
function updateStageSize() {
  const w = wrap?.clientWidth || window.innerWidth;
  const h = wrap?.clientHeight || window.innerHeight;
  W = Math.max(600, w);
  H = Math.max(400, h);
  document.documentElement.style.setProperty("--sizeW", String(W));
  document.documentElement.style.setProperty("--sizeH", String(H));
  if (linkSvg) linkSvg.setAttribute("viewBox", `0 0 ${W} ${H}`);
}
function fitBoard() {
  updateStageSize();
  Z.scale = 1;
  Pan.x = 0; Pan.y = 0;
  applyTransform();
  fxResize();
  const zBtn = document.getElementById("zoomResetBtn");
  if (zBtn) zBtn.textContent = "100%";
  bumpPerfMode();
  schedule.once("measure");
  schedule.once("edges");
}
window.addEventListener("resize", () => fitBoard(), { passive: true });

/* ========================= SVG: defs + edges layer (single mount) ========================= */
(function ensureSvgLayers() {
  if (!linkSvg) return;
  // defs (once)
  if (!linkSvg.querySelector("#bronzeGrad")) {
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    defs.innerHTML = `
      <linearGradient id="bronzeGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="${getCSS("--bronze")}"/>
        <stop offset="100%" stop-color="${getCSS("--bronze-d")}"/>
      </linearGradient>`;
    linkSvg.appendChild(defs);
  }
  // edges layer (once)
  if (!linkSvg.querySelector("#edgesLayer")) {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("id", "edgesLayer");
    linkSvg.appendChild(g);
  }
})();

function dimGuard(v, fallback) {
  v = Number(v);
  return Number.isFinite(v) && v > 0 ? v : fallback;
}
function clampInt(n, min, max) {
  n = Math.floor(Number(n) || 0);
  if (!Number.isFinite(n)) n = 0;
  return Math.max(min, Math.min(max, n));
}

/* ========================= Workspaces ========================= */
const WS_KEY = "productivitree_workspaces_v1";
const WS_CUR = "productivitree_current_ws_v1";
let workspaces = null;
let currentWsId = null;
const WS_EMPTY = () => ({ version: 1, nodes: [], edges: [] });
const WS_SETTINGS_DEFAULT = () => ({ gridSize: GRID, gridSnap: SNAP_ENABLED, gridVisible: GRID_VISIBLE });

function loadAllWorkspaces() {
  try { workspaces = JSON.parse(localStorage.getItem(WS_KEY)) || {}; } catch { workspaces = {}; }
  currentWsId = localStorage.getItem(WS_CUR);
  if (Object.keys(workspaces).length === 0) {
    const id = "ws_" + Math.random().toString(36).slice(2, 8);
    workspaces[id] = { name: "Default Project", color: "#c79039", settings: WS_SETTINGS_DEFAULT(), data: WS_EMPTY() };
    currentWsId = id;
    saveAllWorkspaces();
  }
  if (!workspaces[currentWsId]) currentWsId = Object.keys(workspaces)[0];
}
function saveAllWorkspaces() {
  try { localStorage.setItem(WS_KEY, JSON.stringify(workspaces)); } catch {}
  try { localStorage.setItem(WS_CUR, currentWsId); } catch {}
}
function setCurrentWorkspace(id) {
  if (!workspaces[id]) return;
  currentWsId = id;
  saveAllWorkspaces();
  loadFromData(workspaces[id].data);
  applyWorkspaceGridSettings(workspaces[id]);
  fitBoard();
  renderWorkspaceRibbons();
  showToast(`Switched to "${workspaces[id].name}"`);
  setHeaderH();
}
function serialize() {
  const nodes = [...state.nodes.values()].map((n) => ({
    id: n.id, title: n.title, desc: n.desc,
    x: Math.round(n.x), y: Math.round(n.y), done: !!n.done
  }));
  const edges = state.edges.map((e) => ({ from: e.from, to: e.to }));
  return { version: 1, nodes, edges };
}
let saveTimer = null;
function saveLocal() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    if (!currentWsId) return;
    workspaces[currentWsId].data = serialize();
    saveAllWorkspaces();
    renderWorkspaceRibbons();
  }, 150);
}

/* ========================= Ribbons ========================= */
function shade(hex, pct) {
  const { r, g, b } = hexToRgb(hex);
  const t = pct < 0 ? 0 : 255, p = Math.abs(pct);
  return rgbToHex(Math.round((t - r) * p + r), Math.round((t - g) * p + g), Math.round((t - b) * p + b));
}
function renderWorkspaceRibbons() {
  wsRibbons.textContent = "";
  const frag = document.createDocumentFragment();
  Object.entries(workspaces).forEach(([id, ws]) => {
    const total = Array.isArray(ws?.data?.nodes) ? ws.data.nodes.length : 0;
    const done = total ? ws.data.nodes.reduce((a, n) => a + (n.done ? 1 : 0), 0) : 0;
    const base = ws.color || "#c79039";
    const b = document.createElement("div");
    b.className = "ribbon" + (id === currentWsId ? " active" : "");
    b.title = `Switch to ${ws.name || "Workspace"} — ${done}/${total} done`;
    b.innerHTML = `${escapeHtml(ws.name || "Workspace")} <span class="count">[${done}/${total}]</span>`;
    b.style.setProperty("--wsA", shade(base, +0.0));
    b.style.setProperty("--wsB", shade(base, -0.35));
    b.style.setProperty("--wsSide", shade(base, -0.5));
    b.addEventListener("click", () => setCurrentWorkspace(id));
    frag.appendChild(b);
  });
  wsRibbons.appendChild(frag);
  setHeaderH();
}
function newWorkspace() {
  const name = (prompt("Workspace name?", "New Workspace") || "").trim();
  if (!name) return;
  const id = "ws_" + Math.random().toString(36).slice(2, 8);
  workspaces[id] = { name, color: "#c79039", settings: WS_SETTINGS_DEFAULT(), data: WS_EMPTY() };
  saveAllWorkspaces();
  setCurrentWorkspace(id);
  renderWorkspaceRibbons();
}
function renameWorkspace() {
  if (!currentWsId || !workspaces[currentWsId]) return;
  const cur = workspaces[currentWsId];
  const name = (prompt("Rename workspace:", cur.name || "Workspace") || "").trim();
  if (!name) return;
  cur.name = name;
  saveAllWorkspaces();
  renderWorkspaceRibbons();
  showToast(`Renamed to "${name}"`);
}
function deleteWorkspace() {
  if (!currentWsId || !workspaces[currentWsId]) return;
  const ids = Object.keys(workspaces);
  if (ids.length <= 1) {
    if (!confirm("Delete the ONLY workspace? This will just clear its canvas.")) return;
    state.nodes.clear(); state.edges.length = 0; state.selected = null;
    schedule.once("graphChanged"); schedule.once("save");
    return;
  }
  if (!confirm("Delete workspace entirely?")) return;
  delete workspaces[currentWsId];
  const nextId = Object.keys(workspaces)[0];
  saveAllWorkspaces();
  setCurrentWorkspace(nextId);
  renderWorkspaceRibbons();
}
function applyWorkspaceGridSettings(ws) {
  const s = ws?.settings || {};
  GRID = Number.isFinite(s.gridSize) ? s.gridSize : GRID;
  SNAP_ENABLED = typeof s.gridSnap === "boolean" ? s.gridSnap : SNAP_ENABLED;
  GRID_VISIBLE = typeof s.gridVisible === "boolean" ? s.gridVisible : GRID_VISIBLE;
  if (gridVisibleInput) gridVisibleInput.checked = GRID_VISIBLE;
  if (gridSizeInput) gridSizeInput.value = String(GRID);
  if (gridSnapInput) gridSnapInput.checked = SNAP_ENABLED;
  updateGrid();
  localStorage.setItem("grid_visible", JSON.stringify(GRID_VISIBLE));
  localStorage.setItem("grid_size", String(GRID));
  localStorage.setItem("grid_snap", JSON.stringify(SNAP_ENABLED));
}

/* ========================= Color helpers ========================= */
function hexToRgb(hex) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return { r: 160, g: 106, b: 35 };
  return { r: parseInt(m[1],16), g: parseInt(m[2],16), b: parseInt(m[3],16) };
}
function rgbToHex(r, g, b) {
  const h = (n) => n.toString(16).padStart(2, "0");
  return `#${h(clamp(r,0,255))}${h(clamp(g,0,255))}${h(clamp(b,0,255))}`;
}
function setWorkspaceColor(hex) {
  if (!currentWsId) return;
  workspaces[currentWsId].color = hex;
  saveAllWorkspaces();
  renderWorkspaceRibbons();
}

/* ========================= Adjacency + states ========================= */
function rebuildAdjacency() {
  state.inEdges.clear(); state.outEdges.clear();
  const ensure = (map, key) => (map.has(key) ? map.get(key) : (map.set(key, []), map.get(key)));
  for (const nId of state.nodes.keys()) { state.inEdges.set(nId, state.inEdges.get(nId) || []); state.outEdges.set(nId, state.outEdges.get(nId) || []); }
  for (const e of state.edges) { ensure(state.outEdges,e.from).push(e.to); ensure(state.inEdges,e.to).push(e.from); }
}
const parentsOf = (id) => state.inEdges.get(id) || [];
const childrenOf = (id) => state.outEdges.get(id) || [];
const isAvailable = (node) => parentsOf(node.id).every((pid) => state.nodes.get(pid)?.done);

function refreshNodeStates() {
  state.nodes.forEach((n) => {
    const el = board.querySelector(`.node[data-id="${n.id}"]`);
    if (!el) return;
    el.classList.toggle("done", !!n.done);
    const avail = !n.done && isAvailable(n);
    const locked = !n.done && !avail;
    el.classList.toggle("available", avail);
    el.classList.toggle("locked", locked);
    const reqEl = el.querySelector(".req");
    const outEl = el.querySelector(".out");
    if (reqEl) reqEl.textContent = `${parentsOf(n.id).length} req`;
    if (outEl) outEl.textContent = `${childrenOf(n.id).length} out`;
  });
}

/* ========================= Measure ========================= */
const FRAME_OUTSET = 6;
function measureNode(n) {
  const el = board.querySelector(`.node[data-id="${n.id}"]`);
  if (!el) return;
  n.w = el.offsetWidth / Z.scale;
  n.h = el.offsetHeight / Z.scale;
  const out = FRAME_OUTSET / Z.scale;
  n.vx = n.x - out;
  n.vy = n.y - out;
  n.vw = n.w + out * 2;
  n.vh = n.h + out * 2;
}
function measureAll() { state.nodes.forEach(measureNode); }

/* ========================= Render nodes ========================= */
function renderNodes() {
  board.textContent = "";
  const frag = document.createDocumentFragment();
  state.nodes.forEach((node) => {
    const el = document.createElement("div");
    el.className = "node";
    if (node.done) el.classList.add("done");
    if (!node.done && isAvailable(node)) el.classList.add("available");
    if (!node.done && !isAvailable(node)) el.classList.add("locked");
    el.style.left = node.x + "px";
    el.style.top = node.y + "px";
    el.dataset.id = node.id;
    el.innerHTML = `
      <div class="node-inner">
        <span class="title"></span>
        <div class="frame"></div>
        <div class="desc"></div>
        <div class="meta"><span class="req"></span><span class="out"></span></div>
      </div>`;
    el.querySelector(".title").textContent = node.title || "Untitled";
    el.querySelector(".desc").textContent = node.desc || "";
    el.querySelector(".req").textContent = `${parentsOf(node.id).length} req`;
    el.querySelector(".out").textContent = `${childrenOf(node.id).length} out`;
    el.addEventListener("pointerdown", startDrag, { passive: false });
    el.addEventListener("click", (evt) => { if (!drag.moved) selectNode(node.id); });
    frag.appendChild(el);
  });
  board.appendChild(frag);
  schedule.once("measure");
  if (state.linkMode) setLinkMode(true);
}

/* ========================= Edges ========================= */
function drawEdges() {
  const layer = linkSvg?.querySelector("#edgesLayer");
  if (!layer) return;
  const parts = [];
  state.edges.forEach((e) => {
    const a = state.nodes.get(e.from), b = state.nodes.get(e.to);
    if (!a || !b) return;
    const startX = (a.vx ?? a.x) + (a.vw ?? a.w ?? 180) / 2;
    const startY = (a.vy ?? a.y) + (a.vh ?? a.h ?? 64) / 2;
    const endX = (b.vx ?? b.x) + (b.vw ?? b.w ?? 180) / 2;
    const endY = (b.vy ?? b.y) + (b.vh ?? b.h ?? 64) / 2;
    const dx = endX - startX, dy = endY - startY, dist = Math.hypot(dx, dy);
    const bend = Math.max(22, Math.min(260, dist * 0.25));
    const t = Math.abs(dx) / (Math.abs(dx) + Math.abs(dy) || 1);
    const hx = Math.sign(dx) * Math.min(Math.abs(dx) * 0.6, bend);
    const vy = Math.sign(dy) * Math.min(Math.abs(dy) * 0.6, bend);
    let c1x = startX + hx * t, c1y = startY + vy * (1 - t);
    let c2x = endX - hx * t, c2y = endY - vy * (1 - t);
    if (Math.abs(dy) < 0.002) { c1y += 0.002; c2y -= 0.002; }
    const d = `M ${startX} ${startY} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${endX} ${endY}`;
    const toNode = state.nodes.get(e.to), fromNode = state.nodes.get(e.from);
    const avail = !toNode?.done && isAvailable(toNode);
    const locked = !toNode?.done && !avail;
    const completed = !!fromNode?.done && !!toNode?.done;
    const groupCls = locked ? "locked" : completed ? "done" : avail ? "avail" : "";
    parts.push(
      `<g class="${groupCls}">
        <path class="edge-base" d="${d}" pathLength="300"></path>
        <path class="edge-main" d="${d}" pathLength="300"></path>
        <path class="edge-highlight" d="${d}" pathLength="300"></path>
      </g>`
    );
  });
  layer.innerHTML = parts.join("");
}

/* ========================= Sidebar ========================= */
function selectNode(id) { state.selected = id; refreshSidebar(); }
function refreshSidebar() {
  const n = state.nodes.get(state.selected);
  if (!n) { sidebar.hidden = true; return; }
  sidebar.hidden = false;
  sideTitle.textContent = n.title || "Node";
  titleInput.value = n.title || "";
  descInput.value = n.desc || "";
  depsList.innerHTML =
    parentsOf(n.id).map((pid) => {
      const pn = state.nodes.get(pid);
      return `<div class="dep-row"><span class="pill">${escapeHtml(pn?.title || "")}</span><button class="btn" data-remove="${pid}">Remove</button></div>`;
    }).join("") || '<div class="muted">No dependencies</div>';
  depsList.querySelectorAll("button[data-remove]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const pid = btn.dataset.remove;
      for (let i = state.edges.length - 1; i >= 0; i--) {
        const e = state.edges[i];
        if (e.from === pid && e.to === n.id) state.edges.splice(i, 1);
      }
      schedule.once("edgesChanged"); schedule.once("save");
    });
  });
  if (state.focusTitleForId === n.id) {
    requestAnimationFrame(() => { titleInput.focus(); titleInput.select(); state.focusTitleForId = null; });
  }
}
titleInput.addEventListener("input", () => {
  const n = state.nodes.get(state.selected); if (!n) return;
  n.title = titleInput.value;
  const el = board.querySelector(`.node[data-id="${n.id}"] .title`);
  if (el) el.textContent = n.title || "Untitled";
  schedule.once("measure"); schedule.once("edges"); schedule.once("save");
});
titleInput.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); titleInput.blur(); } }, { passive: false });
descInput.addEventListener("input", () => {
  const n = state.nodes.get(state.selected); if (!n) return;
  n.desc = descInput.value;
  const el = board.querySelector(`.node[data-id="${n.id}"] .desc`);
  if (el) el.textContent = n.desc || "";
  schedule.once("measure"); schedule.once("edges"); schedule.once("save");
});
wrap.addEventListener("mousedown", (e) => {
  if (e.target.closest(".node") || e.target.closest(".sidebar") || e.target.closest("header")) return;
  const ae = document.activeElement;
  if (ae && (ae.tagName === "INPUT" || ae.tagName === "TEXTAREA")) ae.blur();
  state.selected = null;
  refreshSidebar();
}, { passive: true });

/* ========================= Node CRUD ========================= */
function addNodeAt(x, y) {
  if (SNAP_ENABLED) { x = Math.round(x / GRID) * GRID; y = Math.round(y / GRID) * GRID; }
  const id = uid();
  const node = { id, title: "New Task", desc: "", x: clamp(x, 10, W - 160), y: clamp(y, 10, H - 80), done: false };
  state.nodes.set(id, node);
  state.focusTitleForId = id;
  selectNode(id);
  schedule.once("graphChanged");
  showToast("Node added (N)");
}
function addNodeAtViewportCenter() {
  const cx = wrap.clientWidth / 2, cy = wrap.clientHeight / 2;
  addNodeAt(cx - 80, cy - 24);
}
function deleteNode(id) {
  const n = state.nodes.get(id);
  if (!confirm(`Delete node${n ? ` "${n.title}"` : ""}?`)) return;
  state.nodes.delete(id);
  for (let i = state.edges.length - 1; i >= 0; i--) {
    const e = state.edges[i];
    if (e.from === id || e.to === id) state.edges.splice(i, 1);
  }
  if (state.selected === id) state.selected = null;
  schedule.once("graphChanged");
}

/* ========================= Audio (tiny sfx) ========================= */
let AC = null, masterGain = null, audioReady = false;
function ensureAudio() {
  if (audioReady) return;
  try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); masterGain = AC.createGain(); masterGain.gain.value = 0.6; masterGain.connect(AC.destination); audioReady = true; } catch {}
}
function resumeAudioIfSuspended() { if (AC && AC.state === "suspended") AC.resume(); }
window.addEventListener("pointerdown", () => { ensureAudio(); resumeAudioIfSuspended(); }, { once: true, passive: true });
function playCheer() { const el = document.getElementById("s-cheer"); if (!el) return; resumeAudioIfSuspended(); el.currentTime = 0; el.volume = 0.85; el.play().catch(() => {}); }
function playClick(type="up") {
  ensureAudio(); if (!AC) return;
  const now = AC.currentTime, osc = AC.createOscillator(), gain = AC.createGain();
  const isUp = type === "up"; const baseFreq = isUp ? 600 : 280, dur = isUp ? 0.05 : 0.07, startGain = isUp ? 0.18 : 0.24;
  osc.type = "triangle"; osc.frequency.setValueAtTime(baseFreq, now);
  osc.frequency.exponentialRampToValueAtTime(baseFreq * (isUp ? 0.92 : 0.85), now + dur);
  gain.gain.setValueAtTime(startGain, now); gain.gain.exponentialRampToValueAtTime(0.0008, now + dur);
  osc.connect(gain); gain.connect(masterGain); osc.start(now); osc.stop(now + dur + 0.01);
}

/* ========================= FX ========================= */
let fxCtx = null, fxCanvas = null, fxRAF = 0, fxParticles = [];
function setFXEnabled(on, { persist = true } = {}) {
  FX_ENABLED = !!on;
  if (persist) localStorage.setItem("fx_enabled", JSON.stringify(FX_ENABLED));
  const btn = document.getElementById("fxToggleBtn");
  if (btn) {
    btn.setAttribute("aria-pressed", FX_ENABLED ? "true" : "false");
    btn.textContent = "FX: " + (FX_ENABLED ? "On" : "Off");
  }
  if (FX_ENABLED) {
    seedFX();
    if (fxCanvas) fxCanvas.style.display = "block";
  } else {
    killFX();
    if (fxCanvas) fxCanvas.style.display = "none";
  }
}
/* === REPLACE your makeParticles with this safe version === */
function makeParticles(theme) {
  // Robust canvas width/height, with sane fallbacks
  const CW = dimGuard(W, dimGuard(wrap?.clientWidth, 1200));
  const CH = dimGuard(H, dimGuard(wrap?.clientHeight, 800));
  const areaRaw = CW * CH;
  const area = Number.isFinite(areaRaw) && areaRaw > 0 ? areaRaw : 1200 * 800;

  if (theme === "fruloo") {
    // Matrix-style glyph rain (clamped)
    const cols = clampInt(CW / 32, 18, 512);
    const rows = clampInt(CH / 24, 12, 512);
    const charset = "01$#%@&{}[]<>/\\*+-=_~";
    fxParticles = Array.from({ length: cols }, (_, i) => ({
      kind: "glyph",
      x: (i + 0.5) * (CW / cols),
      y: -Math.random() * CH,
      vy: 1.2 + Math.random() * 1.6,
      len: 6 + Math.floor(Math.random() * Math.min(24, rows)),
      t: Math.random() * 1000,
      charset,
    }));
    return;
  }

  if (theme === "girly-pop") {
    // Floating petals
    const count = clampInt((area / (80 * 80)) * 0.06, 16, 600);
    fxParticles = Array.from({ length: count }, () => {
      const size = 10 + Math.random() * 10;
      return {
        kind: "petal",
        x: Math.random() * CW,
        y: -20 - Math.random() * CH * 0.4,
        vx: Math.random() * 0.6 - 0.3,
        vy: 0.6 + Math.random() * 0.8,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() * 0.02 + 0.01) * (Math.random() < 0.5 ? -1 : 1),
        w: size * (0.9 + Math.random() * 0.3),
        h: size,
        tint: [255, 156 + ((Math.random() * 80) | 0), 200 + ((Math.random() * 40) | 0), 0.9],
      };
    });
    return;
  }

  if (theme === "whacky-pomo") {
    // Bouncing blobs
    const base = clampInt((area / (120 * 120)) * 0.08, 12, 600);
    const pomoPalette = [
      [164, 255, 61],
      [140, 82, 255],
      [0, 255, 255],
      [255, 84, 0],
      [255, 239, 0],
      [0, 212, 98],
    ];
    fxParticles = Array.from({ length: base }, () => {
      const c = pomoPalette[Math.floor(Math.random() * pomoPalette.length)];
      const size = 6 + Math.random() * 14;
      return {
        kind: "blob",
        x: Math.random() * CW,
        y: Math.random() * CH,
        vx: Math.random() * 1.6 - 0.8,
        vy: Math.random() * 1.6 - 0.8,
        w: size,
        h: size,
        rot: Math.random() * Math.PI * 2,
        vr: Math.random() * 0.03 - 0.015,
        color: c,
        alpha: 0.55 + Math.random() * 0.35,
      };
    });
    return;
  }

  // === default "war": glowing embers rising ===
  const N = clampInt((area / (80 * 80)) * 0.35, 40, 1200);
  const now = performance.now();
  fxParticles = Array.from({ length: N }, () => {
    const life = 2800 + Math.random() * 2400;
    const size = 1.8 + Math.random() * 2.2;
    return {
      kind: "ember",
      x: Math.random() * CW,
      y: CH * (0.05 + Math.random() * 0.95),
      vx: (Math.random() - 0.5) * 0.18,
      vy: -(1.2 + Math.random() * 1.6),
      size,
      t0: now - Math.random() * life,
      life,
      c0: (function () {
        const pick = Math.random();
        if (pick < 0.45) return [255, 64, 42];
        if (pick < 0.80) return [255, 128, 36];
        return [250, 176, 72];
      })(),
      mid: [238, 170, 84],
      end: [232, 196, 128],
      flicker: 0.15 + Math.random() * 0.2,
      phase: Math.random() * Math.PI * 2,
      jitter: 0.008 + Math.random() * 0.02,
      buoyancy: 1.005,
    };
  });
}

function fxLoop() {
  fxRAF = 0;
  if (!fxCtx) return;

  const theme = currentTheme();
  fxCtx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);

  if (theme === "girly-pop") {
    for (const p of fxParticles) {
      p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      if (p.y > H + 40) { p.y = -20 - Math.random() * 120; p.x = Math.random() * W; }
      fxCtx.save(); fxCtx.translate(p.x, p.y); fxCtx.rotate(p.rot);
      const [r, g, b, a] = p.tint || [255, 200, 230, 0.9];
      fxCtx.globalAlpha = a;
      fxCtx.fillStyle = `rgba(${r},${g},${b},${a})`;
      fxCtx.beginPath(); fxCtx.ellipse(0, 0, p.w * 0.6, p.h * 0.5, 0.3, 0, Math.PI * 2); fxCtx.fill();
      fxCtx.restore();
    }
    fxRAF = requestAnimationFrame(fxLoop); return;
  }

  if (theme === "whacky-pomo") {
    for (const b of fxParticles) {
      b.x += b.vx; b.y += b.vy; b.rot += b.vr;
      if (b.x < -20 || b.x > W + 20) b.vx *= -1;
      if (b.y < -20 || b.y > H + 20) b.vy *= -1;
      const [r, g, bb] = b.color || [255, 255, 255];
      fxCtx.save(); fxCtx.translate(b.x, b.y); fxCtx.rotate(b.rot);
      fxCtx.globalAlpha = b.alpha ?? 0.8;
      const grd = fxCtx.createRadialGradient(0, 0, 0, 0, 0, b.w * 1.6);
      grd.addColorStop(0, `rgba(${r},${g},${bb},0.95)`);
      grd.addColorStop(1, `rgba(${r},${g},${bb},0.2)`);
      fxCtx.fillStyle = grd;
      fxCtx.beginPath(); fxCtx.ellipse(0, 0, b.w * 0.9, b.h * 0.9, 0, 0, Math.PI * 2); fxCtx.fill();
      fxCtx.lineWidth = 1.5; fxCtx.strokeStyle = "rgba(255,255,255,0.35)"; fxCtx.stroke();
      fxCtx.restore();
    }
    fxRAF = requestAnimationFrame(fxLoop); return;
  }

  if (theme === "fruloo") {
    fxCtx.save();
    fxCtx.fillStyle = "rgba(0,0,0,0.35)";
    fxCtx.fillRect(0, 0, fxCanvas.width, fxCanvas.height);
    fxCtx.font = "16px ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace";
    fxCtx.textAlign = "center"; fxCtx.textBaseline = "top";
    for (const s of fxParticles) {
      s.y += s.vy; s.t += 1;
      if (s.y - s.len * 18 > H + 48) { s.y = -Math.random() * 200; s.vy = 1.2 + Math.random() * 1.6; s.len = 6 + Math.floor(Math.random() * 18); }
      for (let i = 0; i < s.len; i++) {
        const yy = s.y - i * 18; if (yy < -24 || yy > H + 24) continue;
        const ch = s.charset[Math.floor(s.t + i) % s.charset.length];
        const head = i === 0;
        fxCtx.fillStyle = head ? "rgba(180,255,200,0.95)" : "rgba(60,255,140,0.75)";
        fxCtx.fillText(ch, s.x, yy);
      }
    }
    fxCtx.restore();
    fxRAF = requestAnimationFrame(fxLoop); return;
  }

  // default "war"
  const now = performance.now();
  fxCtx.globalCompositeOperation = "source-over";
  fxCtx.fillStyle = "rgba(0,0,0,0.06)";
  fxCtx.fillRect(0, 0, fxCanvas.width, fxCanvas.height);

  for (const p of fxParticles) {
    if (p.kind !== "ember") continue;
    const t = Math.min(1, (now - p.t0) / p.life);
    p.x += p.vx + Math.cos(now * 0.01 + p.phase) * p.jitter;
    p.y += p.vy - Math.abs(Math.sin(now * 0.009 + p.phase)) * p.jitter * 0.4;
    p.vy *= p.buoyancy || 1.005;

    const midT = 0.33;
    const lerp = (a, b, k) => a + (b - a) * k;
    const mix = (c1, c2, k) => [Math.round(lerp(c1[0], c2[0], k)), Math.round(lerp(c1[1], c2[1], k)), Math.round(lerp(c1[2], c2[2], k))];
    const col = t < midT ? mix(p.c0, p.mid, t / midT) : mix(p.mid, p.end, (t - midT) / (1 - midT));

    const baseA = (t < 0.12 ? t / 0.12 : 1 - t);
    const flick = 0.85 + 0.15 * Math.sin(now * 0.012 + p.phase);
    const alpha = Math.max(0, Math.min(1, baseA * (0.9 + p.flicker * (flick - 0.85))));

    const r = p.size * (t < 0.4 ? 1.0 + t * 0.6 : 1.24);

    fxCtx.globalCompositeOperation = "source-over";
    fxCtx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${alpha})`;
    fxCtx.beginPath(); fxCtx.arc(p.x, p.y, r, 0, Math.PI * 2); fxCtx.fill();

    fxCtx.globalCompositeOperation = "lighter";
    fxCtx.globalAlpha = Math.min(1, alpha * 0.8);
    fxCtx.beginPath(); fxCtx.arc(p.x, p.y, Math.max(0.6, r * 0.45), 0, Math.PI * 2);
    fxCtx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},1)`; fxCtx.fill();

    fxCtx.globalAlpha = 1.0; fxCtx.globalCompositeOperation = "source-over";

    if (now - p.t0 > p.life || p.y < -16 || p.x < -16 || p.x > W + 16) {
      const life = 2800 + Math.random() * 2400;
      p.t0 = now; p.life = life;
      p.size = 1.8 + Math.random() * 2.2;
      p.x = Math.random() * W; p.y = H + 16;
      p.vx = (Math.random() - 0.5) * 0.18; p.vy = -(1.2 + Math.random() * 1.6);
      p.c0 = (function () { const pick = Math.random(); if (pick < 0.45) return [255, 64, 42]; if (pick < 0.80) return [255, 128, 36]; return [250, 176, 72]; })();
      p.mid = [238, 170, 84]; p.end = [232, 196, 128];
      p.flicker = 0.15 + Math.random() * 0.2; p.phase = Math.random() * Math.PI * 2;
      p.jitter = 0.008 + Math.random() * 0.02; p.buoyancy = 1.005;
    }
  }
  fxRAF = requestAnimationFrame(fxLoop);
}
/* === REPLACE your fxResize with this (ensures canvas exists before sizing) === */
function fxResize() {
  fxCanvas = document.getElementById("fxCanvas");
  if (!fxCanvas) return; // no canvas yet; safe exit
  if (!fxCtx) fxCtx = fxCanvas.getContext("2d", { alpha: true, desynchronized: true });

  // Make sure W/H are set to something real
  updateStageSize();

  fxCanvas.width = W;
  fxCanvas.height = H;
  fxCanvas.style.width = "100%";
  fxCanvas.style.height = "100%";
  fxCtx.setTransform(1, 0, 0, 1, 0, 0);
}

function killFX() { if (fxRAF) cancelAnimationFrame(fxRAF); fxRAF = 0; }
/* === REPLACE your seedFX with this (ordering + hard guards) === */
function seedFX() {
  if (!FX_ENABLED) return;

  // Ensure stage/canvas dimensions are valid first
  updateStageSize();
  fxResize();

  // If still no context/canvas, bail gracefully
  if (!fxCtx || !fxCanvas) return;

  try {
    makeParticles(currentTheme());
  } catch (err) {
    console.error("makeParticles failed, falling back:", err);
    // Fallback: minimal, safe default particle set
    const fallbackArea = Math.max(1200 * 800, W * H || 0);
    const safeN = clampInt((fallbackArea / (100 * 100)) * 0.25, 32, 256);
    fxParticles = Array.from({ length: safeN }, () => ({
      kind: "ember",
      x: Math.random() * dimGuard(W, 1200),
      y: Math.random() * dimGuard(H, 800),
      vx: (Math.random() - 0.5) * 0.18,
      vy: -(1.2 + Math.random() * 1.6),
      size: 2 + Math.random() * 2,
      t0: performance.now() - Math.random() * 2000,
      life: 2200 + Math.random() * 1600,
      c0: [255, 128, 36],
      mid: [238, 170, 84],
      end: [232, 196, 128],
      flicker: 0.18,
      phase: Math.random() * Math.PI * 2,
      jitter: 0.012,
      buoyancy: 1.005,
    }));
  }

  killFX();                 // clear any previous RAF
  fxRAF = requestAnimationFrame(fxLoop);
}


/* ========================= Toggle Done ========================= */
function toggleDone(id) {
  const n = state.nodes.get(id); if (!n) return;
  if (!n.done && !isAvailable(n)) { showToast("Locked by prerequisites"); return; }
  n.done = !n.done;
  const el = board.querySelector(`.node[data-id="${id}"]`);
  if (el) {
    el.classList.toggle("done", n.done);
    el.classList.toggle("available", !n.done && isAvailable(n));
    el.classList.toggle("locked", !n.done && !isAvailable(n));
    el.querySelector(".req").textContent = `${parentsOf(n.id).length} req`;
    el.querySelector(".out").textContent = `${childrenOf(n.id).length} out`;
  }
  if (n.done) { emitConfettiForNode(n); playCheer(); }
  schedule.once("nodesState"); schedule.once("edges"); schedule.once("save");
}

/* ========================= Linking ========================= */
function wouldCreateCycle(from, to) {
  const seen = new Set(); const stack = [to];
  while (stack.length) { const cur = stack.pop(); if (cur === from) return true; (childrenOf(cur)||[]).forEach((n)=>{ if(!seen.has(n)){seen.add(n); stack.push(n);} }); }
  return false;
}
function createLink(parentId, childId) {
  if (parentId === childId) return;
  if (state.edges.some((e) => e.from === parentId && e.to === childId)) return;
  if (wouldCreateCycle(parentId, childId)) { showToast("Link would create a cycle"); return; }
  state.edges.push({ from: parentId, to: childId });
  schedule.once("edgesChanged"); schedule.once("nodesState"); schedule.once("save");
}
function setLinkMode(on) {
  state.linkMode = !!on;
  if (!state.linkMode) state.linkFrom = null;
  const btn = document.getElementById("linkBtn");
  if (btn) { btn.classList.toggle("primary", state.linkMode); btn.textContent = state.linkMode ? "Link: parent → child (L)" : "Link Nodes (L)"; }
  board.querySelectorAll(".node").forEach((el) => {
    el.classList.toggle("link-mode", state.linkMode);
    el.classList.remove("link-from");
    el.removeEventListener("click", linkClickHandler);
    if (state.linkMode) el.addEventListener("click", linkClickHandler);
  });
  if (state.linkMode && !state.linkFrom) showToast("Click a PARENT task, then a CHILD task");
}
function linkClickHandler(e) {
  e.preventDefault(); e.stopPropagation();
  const id = e.currentTarget.dataset.id;
  if (!state.linkFrom) {
    state.linkFrom = id; showToast("Now click the CHILD task");
    board.querySelectorAll(".node").forEach((n)=>n.classList.remove("link-from"));
    e.currentTarget.classList.add("link-from");
    return;
  }
  const parentId = state.linkFrom, childId = id;
  board.querySelectorAll(".node").forEach((n)=>n.classList.remove("link-from"));
  state.linkFrom = null;
  if (parentId !== childId) { createLink(parentId, childId); showToast("Linked ✓ — Link mode off"); } else { showToast("Cannot link a node to itself — Link mode off"); }
  setLinkMode(false);
}

/* ========================= Dragging NODES ONLY ========================= */
let drag = { active: false, id: null, dx: 0, dy: 0, moved: false };
const DRAG_CLICK_SLOP = 6;
function startDrag(e) {
  const el = e.currentTarget, id = el.dataset.id, n = state.nodes.get(id);
  if (!n) return;
  e.preventDefault();
  drag = { active: true, id, dx: e.clientX - n.x, dy: e.clientY - n.y, moved: false };
  document.body.classList.add("noselect");
  el.setPointerCapture?.(e.pointerId);
  window.addEventListener("pointermove", onDrag, { passive: true });
  window.addEventListener("pointerup", endDrag, { once: true, passive: true });
}
function onDrag(e) {
  if (!drag.active) return;
  const n = state.nodes.get(drag.id); if (!n) return;
  let nx = e.clientX - drag.dx, ny = e.clientY - drag.dy;
  if (!drag.moved && (Math.abs(nx - n.x) > DRAG_CLICK_SLOP || Math.abs(ny - n.y) > DRAG_CLICK_SLOP)) drag.moved = true;
  if (SNAP_ENABLED) { nx = Math.round(nx / GRID) * GRID; ny = Math.round(ny / GRID) * GRID; }
  n.x = clamp(nx, 0, W - 160); n.y = clamp(ny, 0, H - 80);
  const el = board.querySelector(`.node[data-id="${drag.id}"]`);
  if (el) { el.style.left = n.x + "px"; el.style.top = n.y + "px"; }
  const out = FRAME_OUTSET / Z.scale; n.vx = n.x - out; n.vy = n.y - out;
  bumpPerfMode(); schedule.once("edges");
}
function endDrag() {
  drag.active = false;
  window.removeEventListener("pointermove", onDrag);
  document.body.classList.remove("noselect");
  setTimeout(() => (drag.moved = false), 60);
  schedule.once("save");
}

/* ========================= Zoom ========================= */
function setScale(next) {
  Z.scale = clamp(next, Z.min, Z.max);
  Pan.x = 0; Pan.y = 0;
  applyTransform();
  const zr = document.getElementById("zoomResetBtn");
  if (zr) zr.textContent = Math.round(Z.scale * 100) + "%";
  bumpPerfMode(); schedule.once("measure"); schedule.once("edges");
}
document.getElementById("zoomInBtn")?.addEventListener("click", () => setScale(Z.scale + Z.step));
document.getElementById("zoomOutBtn")?.addEventListener("click", () => setScale(Z.scale - Z.step));
document.getElementById("zoomResetBtn")?.addEventListener("click", fitBoard);
wrap.addEventListener("wheel", (e) => {
  if (e.ctrlKey) {
    e.preventDefault();
    const dir = e.deltaY > 0 ? -1 : 1;
    setScale(Z.scale + dir * Z.step);
  }
}, { passive: false });

/* ========================= Export / Import (stub export only) ========================= */
function download(filename, text) {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
}
document.getElementById("exportWsBtn")?.addEventListener("click", () => {
  const payload = { exportVersion: 1, exportedAt: new Date().toISOString(), current: currentWsId, workspaces };
  const pretty = JSON.stringify(payload, null, 2);
  const now = new Date(), pad = (n)=>String(n).padStart(2,"0");
  const filename = `productivitree_${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}.json`;
  download(filename, pretty);
  showToast("Exported.");
});
document.getElementById("importWsBtn")?.addEventListener("click", () => importFileInput?.click());
importFileInput?.addEventListener("change", async (e) => {
  const file = e.target.files?.[0]; if (!file) return;
  try {
    const text = await file.text(); const obj = JSON.parse(text);
    if (!obj.workspaces || !Object.keys(obj.workspaces).length) { alert("Invalid import"); return; }
    if (!confirm("Replace all existing workspaces with the imported data?")) return;
    workspaces = obj.workspaces;
    Object.values(workspaces).forEach((ws)=> ws.settings = ws.settings || WS_SETTINGS_DEFAULT());
    currentWsId = obj.current && workspaces[obj.current] ? obj.current : Object.keys(workspaces)[0];
    saveAllWorkspaces(); setCurrentWorkspace(currentWsId); showToast("Imported.");
  } catch (ex) { console.error(ex); alert("Import failed: " + (ex?.message || ex)); }
  finally { importFileInput.value = ""; }
});

/* ========================= Header height ========================= */
const header = document.querySelector("header");
function setHeaderH() {
  const h = header?.offsetHeight || 110;
  document.documentElement.style.setProperty("--headerH", h + 10 + "px");
}
const headerRO = new ResizeObserver(() => setHeaderH());

/* ========================= Grid controls & UI ========================= */
gridBtn?.addEventListener("click", () => {
  gridMenu.classList.toggle("show");
  gridVisibleInput.checked = GRID_VISIBLE;
  gridSizeInput.value = GRID;
  gridSnapInput.checked = SNAP_ENABLED;
});
document.addEventListener("click", (e) => {
  if (gridMenu && !gridMenu.contains(e.target) && !gridBtn.contains(e.target)) gridMenu.classList.remove("show");
});
gridVisibleInput?.addEventListener("change", () => {
  GRID_VISIBLE = gridVisibleInput.checked;
  localStorage.setItem("grid_visible", JSON.stringify(GRID_VISIBLE));
  if (currentWsId && workspaces[currentWsId]) { workspaces[currentWsId].settings.gridVisible = GRID_VISIBLE; saveAllWorkspaces(); }
  updateGrid();
});
gridSizeInput?.addEventListener("change", () => {
  const v = Math.max(4, Math.floor(Number(gridSizeInput.value) || 24));
  GRID = v; localStorage.setItem("grid_size", String(GRID));
  if (currentWsId && workspaces[currentWsId]) { workspaces[currentWsId].settings.gridSize = GRID; saveAllWorkspaces(); }
  updateGrid();
});
gridSnapInput?.addEventListener("change", () => {
  SNAP_ENABLED = gridSnapInput.checked;
  localStorage.setItem("grid_snap", JSON.stringify(SNAP_ENABLED));
  if (currentWsId && workspaces[currentWsId]) { workspaces[currentWsId].settings.gridSnap = SNAP_ENABLED; saveAllWorkspaces(); }
});

/* ========================= Helpers ========================= */
function escapeHtml(s) {
  return (s || "").replace(/[&<>"']/g, (m) => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[m]));
}

/* ========================= Scheduler ========================= */
const schedule = (() => {
  const pending = new Set(); let rafId = 0;
  function request() { if (!rafId) rafId = requestAnimationFrame(flush); }
  function flush() {
    rafId = 0;
    if (pending.has("graphChanged")) { pending.delete("graphChanged"); rebuildAdjacency(); renderNodes(); pending.add("nodesState"); pending.add("edges"); }
    if (pending.has("edgesChanged"))  { pending.delete("edgesChanged");  rebuildAdjacency(); pending.add("nodesState"); pending.add("edges"); }
    if (pending.has("measure"))       { pending.delete("measure");       measureAll(); pending.add("edges"); }
    if (pending.has("nodesState"))    { pending.delete("nodesState");    refreshNodeStates(); }
    if (pending.has("edges"))         { pending.delete("edges");         drawEdges(); }
    if (pending.has("save"))          { pending.delete("save");          saveLocal(); }
    if (pending.size) request();
  }
  return { once(key){ pending.add(key); request(); }, measure(){ this.once("measure"); } };
})();

/* ========================= Wire controls & init ========================= */
(function wireControls() {
  document.getElementById("addNodeBtn")?.addEventListener("click", addNodeAtViewportCenter);
  document.getElementById("linkBtn")?.addEventListener("click", () => setLinkMode(!state.linkMode));
  const snapBtn = document.getElementById("snapBtn");
  snapBtn?.addEventListener("click", () => {
    SNAP_ENABLED = !SNAP_ENABLED;
    snapBtn.textContent = "Snap: " + (SNAP_ENABLED ? "On" : "Off");
    snapBtn.setAttribute("aria-pressed", SNAP_ENABLED ? "true" : "false");
  });
  document.getElementById("clearBtn")?.addEventListener("click", () => {
    if (!confirm("Clear the current workspace canvas?")) return;
    state.nodes.clear(); state.edges.length = 0; state.selected = null;
    schedule.once("graphChanged"); schedule.once("save");
  });
  document.getElementById("fxToggleBtn")?.addEventListener("click", () => setFXEnabled(!FX_ENABLED));

  // keyboard
  window.addEventListener("keydown", (e) => {
    if (e.target && ["INPUT","TEXTAREA"].includes(e.target.tagName)) return;
    if (e.key === "l" || e.key === "L") { setLinkMode(!state.linkMode); e.preventDefault(); }
    if (e.key === "n" || e.key === "N") { addNodeAtViewportCenter(); e.preventDefault(); }
    if (e.key === "Delete" && state.selected) { deleteNode(state.selected); e.preventDefault(); }
  }, { passive: false });

  // toolbar: done/delete actions
  document.getElementById("toggleDoneBtn")?.addEventListener("click", () => { if (state.selected) toggleDone(state.selected); });
  document.getElementById("deleteBtn")?.addEventListener("click", () => { if (state.selected) deleteNode(state.selected); });
})();

function loadFromData(data) {
  state.nodes.clear(); state.edges.length = 0;
  if (data && data.nodes) {
    data.nodes.forEach((n)=>state.nodes.set(n.id, { ...n }));
    if (Array.isArray(data.edges)) data.edges.forEach((e)=>state.edges.push({ ...e }));
  }
  schedule.once("graphChanged"); schedule.once("edges");
}
function currentTheme() {
  if (document.body.classList.contains("theme-fruloo")) return "fruloo";
  if (document.body.classList.contains("theme-girly-pop")) return "girly-pop";
  if (document.body.classList.contains("theme-whacky-pomo")) return "whacky-pomo";
  return "war";
}

const headerEl = document.querySelector("header");
function init() {
  loadAllWorkspaces();
  renderWorkspaceRibbons();
  setCurrentWorkspace(currentWsId);

  if (window.ResizeObserver) new ResizeObserver(setHeaderH).observe(headerEl || document.body);
  setHeaderH();
  fitBoard();
  updateGrid();

  // Start FX after sizing
  setFXEnabled(FX_ENABLED, { persist: false });

  // Theme dropdown
  themeSelect?.addEventListener("change", () => {
    const v = themeSelect.value;
    document.body.classList.toggle("theme-war", v === "war");
    document.body.classList.toggle("theme-girly-pop", v === "girly-pop");
    document.body.classList.toggle("theme-whacky-pomo", v === "whacky-pomo");
    document.body.classList.toggle("theme-fruloo", v === "fruloo");
    if (FX_ENABLED) seedFX();
  });
}
document.addEventListener("DOMContentLoaded", init);

/* ========================= Small FX helpers ========================= */
function emitConfettiForNode(n) {
  const cx = (n.vx ?? n.x) + (n.vw ?? n.w ?? 180) / 2;
  const cy = (n.vy ?? n.y) + (n.vh ?? n.h ?? 64) / 2;
  emitConfettiAt(cx, cy);
}
function emitConfettiAt(px, py, opts = {}) {
  const { pieces = 30, spread = 120, distance = 160, duration = 850, colors = ["#ffd590","#e3c174","#45c49c","#83b9ff","#b98b57"] } = opts;
  for (let i = 0; i < pieces; i++) {
    const piece = document.createElement("span");
    piece.className = "confetti";
    const angle = -spread / 2 + Math.random() * spread;
    const rad = ((angle - 90) * Math.PI) / 180;
    const dist = distance * (0.5 + Math.random());
    const dx = Math.cos(rad) * dist, dy = Math.sin(rad) * dist;
    piece.style.left = px + "px"; piece.style.top = py + "px";
    piece.style.setProperty("--dx", dx.toFixed(1) + "px");
    piece.style.setProperty("--dy", dy.toFixed(1) + "px");
    piece.style.setProperty("--rot", Math.floor(Math.random() * 360) + "deg");
    piece.style.setProperty("--dur", duration + "ms");
    piece.style.setProperty("--color", colors[i % colors.length]);
    burstFx.appendChild(piece);
    piece.addEventListener("animationend", () => piece.remove(), { passive: true });
  }
}
