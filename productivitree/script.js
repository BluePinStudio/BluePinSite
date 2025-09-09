/* ========================= Minimal globals ========================= */
const state = {
  nodes: new Map(),
  edges: [],
  selected: null,
  linkMode: false,
  linkFrom: null,

  // adjacency caches...
  inEdges: new Map(),
  outEdges: new Map(),

  // NEW: when we create a node, auto-focus its title once sidebar renders
  focusTitleForId: null,
};

let SNAP_ENABLED = JSON.parse(localStorage.getItem("grid_snap") || "true");
let GRID = parseInt(localStorage.getItem("grid_size") || "24", 10);
let GRID_VISIBLE = JSON.parse(localStorage.getItem("grid_visible") || "true");
const BOARD_W = 1800,
  BOARD_H = 1000;
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
const wsColorBtn = document.getElementById("wsColorBtn");
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
const screenToWorld = (sx, sy) => ({
  x: (sx - Pan.x) / Z.scale,
  y: (sy - Pan.y) / Z.scale,
});

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

/* ========================= SVG defs once ========================= */
const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
defs.innerHTML = `
  <linearGradient id="bronzeGrad" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" stop-color="${getCSS("--bronze")}"/>
    <stop offset="100%" stop-color="${getCSS("--bronze-d")}"/>
  </linearGradient>`;
linkSvg.appendChild(defs);

/* ========================= Workspaces (unchanged behavior) ========================= */
const WS_KEY = "productivitree_workspaces_v1";
const WS_CUR = "productivitree_current_ws_v1";
let workspaces = null; // id -> { name, color?, data:{version,nodes,edges} }
let currentWsId = null;
const WS_EMPTY = () => ({ version: 1, nodes: [], edges: [] });
const WS_SETTINGS_DEFAULT = () => ({
  gridSize: GRID, // current UI/defaults
  gridSnap: SNAP_ENABLED,
  gridVisible: GRID_VISIBLE,
});

function loadAllWorkspaces() {
  try {
    workspaces = JSON.parse(localStorage.getItem(WS_KEY)) || {};
  } catch {
    workspaces = {};
  }
  currentWsId = localStorage.getItem(WS_CUR);

  if (Object.keys(workspaces).length === 0) {
    const id = "ws_" + Math.random().toString(36).slice(2, 8);
    workspaces[id] = {
      name: "Default Project",
      color: "#c79039",
      settings: WS_SETTINGS_DEFAULT(), // <— add this
      data: WS_EMPTY(),
    };
    currentWsId = id;
    saveAllWorkspaces();
  }
  if (!workspaces[currentWsId]) currentWsId = Object.keys(workspaces)[0];
}

function saveAllWorkspaces() {
  try {
    localStorage.setItem(WS_KEY, JSON.stringify(workspaces));
  } catch {}
  try {
    localStorage.setItem(WS_CUR, currentWsId);
  } catch {}
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
    id: n.id,
    title: n.title,
    desc: n.desc,
    x: Math.round(n.x),
    y: Math.round(n.y),
    done: !!n.done,
  }));
  const edges = state.edges.map((e) => ({ from: e.from, to: e.to }));
  return { version: 1, nodes, edges };
}

function updateCurrentWorkspaceDataNow() {
  if (!currentWsId) return;
  workspaces[currentWsId].data = serialize();
  saveAllWorkspaces();
}

let saveTimer = null;
function saveLocal() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    updateCurrentWorkspaceDataNow();
    renderWorkspaceRibbons(); // counts might change
  }, 150);
}

/* ========================= Ribbons (batched) ========================= */
function shade(hex, pct) {
  const { r, g, b } = hexToRgb(hex);
  const t = pct < 0 ? 0 : 255,
    p = Math.abs(pct);
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
  setHeaderH(); // keeps sidebar offset in sync
}

function newWorkspace() {
  const name = (prompt("Workspace name?", "New Workspace") || "").trim();
  if (!name) return;
  const id = "ws_" + Math.random().toString(36).slice(2, 8);
  workspaces[id] = {
    name,
    color: "#c79039",
    settings: WS_SETTINGS_DEFAULT(),
    data: WS_EMPTY(),
  };

  saveAllWorkspaces();
  setCurrentWorkspace(id);
  renderWorkspaceRibbons();
}
function setFXEnabled(on, { persist = true } = {}) {
  FX_ENABLED = !!on;
  if (persist) localStorage.setItem("fx_enabled", JSON.stringify(FX_ENABLED));

  const btn = document.getElementById("fxToggleBtn");
  if (btn) {
    btn.setAttribute("aria-pressed", FX_ENABLED ? "true" : "false");
    btn.textContent = "FX: " + (FX_ENABLED ? "On" : "Off");
  }

  // Also reflect link animation state (we’ll re-draw edges below)
  if (FX_ENABLED) {
    if (fxCanvas) fxCanvas.style.display = "block";
    seedFX();
  } else {
    killFX();
    if (fxCanvas) fxCanvas.style.display = "none";
  }

  // re-render edges so their inline animation state updates
  schedule.once("edges");
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
function applyWorkspaceGridSettings(ws) {
  const s = ws?.settings || {};
  GRID = Number.isFinite(s.gridSize) ? s.gridSize : GRID;
  SNAP_ENABLED = typeof s.gridSnap === "boolean" ? s.gridSnap : SNAP_ENABLED;
  GRID_VISIBLE = typeof s.gridVisible === "boolean" ? s.gridVisible : GRID_VISIBLE;

  // Reflect in the UI controls
  if (gridVisibleInput) gridVisibleInput.checked = GRID_VISIBLE;
  if (gridSizeInput) gridSizeInput.value = String(GRID);
  if (gridSnapInput) gridSnapInput.checked = SNAP_ENABLED;

  // Apply to the canvas immediately
  updateGrid();

  // Keep localStorage in sync (optional)
  localStorage.setItem("grid_visible", JSON.stringify(GRID_VISIBLE));
  localStorage.setItem("grid_size", String(GRID));
  localStorage.setItem("grid_snap", JSON.stringify(SNAP_ENABLED));
}

function deleteWorkspace() {
  if (!currentWsId || !workspaces[currentWsId]) return;
  const cur = workspaces[currentWsId];
  const ids = Object.keys(workspaces);
  if (ids.length <= 1) {
    if (!confirm(`Delete the ONLY workspace "${cur.name}"? This will just clear its canvas.`)) return;
    state.nodes.clear();
    state.edges.length = 0;
    state.selected = null;
    schedule.once("graphChanged");
    schedule.once("save");
    return;
  }
  if (!confirm(`Delete workspace "${cur.name}" entirely?`)) return;
  delete workspaces[currentWsId];
  const nextId = Object.keys(workspaces)[0];
  saveAllWorkspaces();
  setCurrentWorkspace(nextId);
  renderWorkspaceRibbons();
  showToast("Workspace deleted");
}

/* ========================= Color helpers ========================= */
function hexToRgb(hex) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return { r: 160, g: 106, b: 35 };
  return {
    r: parseInt(m[1], 16),
    g: parseInt(m[2], 16),
    b: parseInt(m[3], 16),
  };
}
function rgbToHex(r, g, b) {
  const h = (n) => n.toString(16).padStart(2, "0");
  return `#${h(clamp(r, 0, 255))}${h(clamp(g, 0, 255))}${h(clamp(b, 0, 255))}`;
}
function setWorkspaceColor(hex) {
  if (!currentWsId) return;
  workspaces[currentWsId].color = hex;
  saveAllWorkspaces();
  renderWorkspaceRibbons();
}

/* ========================= Recompute node classes & badges ========================= */
function refreshNodeStates() {
  // assumes adjacency cache is up to date
  state.nodes.forEach((n) => {
    const el = board.querySelector(`.node[data-id="${n.id}"]`);
    if (!el) return;
    el.classList.toggle("done", !!n.done);
    const avail = !n.done && isAvailable(n);
    const locked = !n.done && !avail;
    el.classList.toggle("available", avail);
    el.classList.toggle("locked", locked);
    // update meta badges without re-rendering nodes
    const req = parentsOf(n.id).length;
    const out = childrenOf(n.id).length;
    const reqEl = el.querySelector(".req");
    const outEl = el.querySelector(".out");
    if (reqEl) reqEl.textContent = `${req} req`;
    if (outEl) outEl.textContent = `${out} out`;
  });
}

/* ========================= Adjacency cache ========================= */
function rebuildAdjacency() {
  state.inEdges.clear();
  state.outEdges.clear();
  const ensure = (map, key) => (map.has(key) ? map.get(key) : (map.set(key, []), map.get(key)));
  for (const nId of state.nodes.keys()) {
    state.inEdges.set(nId, state.inEdges.get(nId) || []);
    state.outEdges.set(nId, state.outEdges.get(nId) || []);
  }
  for (const e of state.edges) {
    ensure(state.outEdges, e.from).push(e.to);
    ensure(state.inEdges, e.to).push(e.from);
  }
}
const parentsOf = (id) => state.inEdges.get(id) || [];
const childrenOf = (id) => state.outEdges.get(id) || [];
const isAvailable = (node) => parentsOf(node.id).every((pid) => state.nodes.get(pid)?.done);

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
function measureAll() {
  state.nodes.forEach(measureNode);
}

/* ========================= Render nodes (build once) ========================= */
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
    el.addEventListener("click", (evt) => {
      if (!drag.moved) selectNode(node.id);
    });
    frag.appendChild(el);
  });
  board.appendChild(frag);

  // ensure future edges use fresh measurements
  schedule.once("measure");

  // NEW: if link mode is on, re-bind handlers on new nodes
  if (state.linkMode) setLinkMode(true);
}

/* ========================= Edges (throttled) ========================= */
function drawEdges() {
  const parts = [];
  let idx = 0;

  // If FX is off, we inline-disable CSS animations on animated paths
  const animOff = FX_ENABLED ? "" : ' style="animation:none"';

  state.edges.forEach((e) => {
    const a = state.nodes.get(e.from),
      b = state.nodes.get(e.to);
    if (!a || !b) return;

    const startX = (a.vx ?? a.x) + (a.vw ?? a.w ?? 180) / 2;
    const startY = (a.vy ?? a.y) + (a.vh ?? a.h ?? 64) / 2;
    const endX = (b.vx ?? b.x) + (b.vw ?? b.w ?? 180) / 2;
    const endY = (b.vy ?? b.y) + (b.vh ?? b.h ?? 64) / 2;

    const dx = endX - startX,
      dy = endY - startY,
      dist = Math.hypot(dx, dy);
    const bend = Math.max(22, Math.min(260, dist * 0.25));
    const t = Math.abs(dx) / (Math.abs(dx) + Math.abs(dy) || 1);
    const hx = Math.sign(dx) * Math.min(Math.abs(dx) * 0.6, bend);
    const vy = Math.sign(dy) * Math.min(Math.abs(dy) * 0.6, bend);

    let c1x = startX + hx * t,
      c1y = startY + vy * (1 - t);
    let c2x = endX - hx * t,
      c2y = endY - vy * (1 - t);
    if (Math.abs(dy) < 0.002) {
      c1y += 0.002;
      c2y -= 0.002;
    }

    const d = `M ${startX} ${startY} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${endX} ${endY}`;

    const toNode = state.nodes.get(e.to),
      fromNode = state.nodes.get(e.from);

    const avail = !toNode?.done && isAvailable(toNode);
    const locked = !toNode?.done && !avail;
    const completed = !!fromNode?.done && !!toNode?.done;

    const groupCls = locked ? "locked" : completed ? "done" : avail ? "avail" : "";

    parts.push(
      `<g class="${groupCls}">
        <path class="edge-base" d="${d}" pathLength="300"></path>
        <path class="edge-main" d="${d}" pathLength="300"${animOff}></path>
        <path class="edge-highlight" d="${d}" pathLength="300"${animOff}></path>
      </g>`
    );
    idx++;
  });

  linkSvg.innerHTML = defs.outerHTML + parts.join("");
}


/* ========================= Sidebar ========================= */
function selectNode(id) {
  state.selected = id;
  refreshSidebar();
}
function refreshSidebar() {
  const n = state.nodes.get(state.selected);
  if (!n) {
    sidebar.hidden = true;
    return;
  }
  sidebar.hidden = false;
  sideTitle.textContent = n.title || "Node";
  titleInput.value = n.title || "";
  descInput.value = n.desc || "";
  depsList.innerHTML =
    parentsOf(n.id)
      .map((pid) => {
        const pn = state.nodes.get(pid);
        return `<div style="display:flex;align-items:center;gap:6px;margin:4px 0">
      <span class="pill">${escapeHtml(pn?.title || "")}</span>
      <button class="btn" data-remove="${pid}">Remove</button></div>`;
      })
      .join("") || '<div style="color:#7f97a8">No dependencies</div>';

  depsList.querySelectorAll("button[data-remove]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const pid = btn.dataset.remove;
      for (let i = state.edges.length - 1; i >= 0; i--) {
        const e = state.edges[i];
        if (e.from === pid && e.to === n.id) state.edges.splice(i, 1);
      }
      schedule.once("edgesChanged");
      schedule.once("save");
    });
  });
  if (state.focusTitleForId === n.id) {
    requestAnimationFrame(() => {
      titleInput.focus();
      titleInput.select();
      state.focusTitleForId = null; // clear so normal selections don't steal focus
    });
  }
}
/* only update text; no re-render */
titleInput.addEventListener("input", () => {
  const n = state.nodes.get(state.selected);
  if (!n) return;
  n.title = titleInput.value;
  const el = board.querySelector(`.node[data-id="${n.id}"] .title`);
  if (el) el.textContent = n.title || "Untitled";
  schedule.once("measure");
  schedule.once("edges");
  schedule.once("save");
});
// NEW: Press Enter to commit title and leave the field, so you can hit N again
titleInput.addEventListener(
  "keydown",
  (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      titleInput.blur();
    }
  },
  { passive: false }
);
descInput.addEventListener("input", () => {
  const n = state.nodes.get(state.selected);
  if (!n) return;
  n.desc = descInput.value;
  const el = board.querySelector(`.node[data-id="${n.id}"] .desc`);
  if (el) el.textContent = n.desc || "";
  schedule.once("measure");
  schedule.once("edges");
  schedule.once("save");
});

/* click empty canvas closes sidebar */
wrap.addEventListener(
  "mousedown",
  (e) => {
    if (e.target.closest(".node") || e.target.closest(".sidebar") || e.target.closest("header")) return;

    // If a text field was focused, blur it so no caret remains
    const ae = document.activeElement;
    if (ae && (ae.tagName === "INPUT" || ae.tagName === "TEXTAREA")) {
      ae.blur();
    }

    state.selected = null;
    refreshSidebar();
  },
  { passive: true }
);

/* ========================= Node CRUD ========================= */
function addNodeAt(x, y) {
  if (SNAP_ENABLED) {
    x = Math.round(x / GRID) * GRID;
    y = Math.round(y / GRID) * GRID;
  }
  const id = uid();
  const node = {
    id,
    title: "New Task",
    desc: "",
    x: clamp(x, 10, BOARD_W - 160),
    y: clamp(y, 10, BOARD_H - 80),
    done: false,
  };
  state.nodes.set(id, node);

  // NEW: tell the sidebar to focus this node's title when it renders
  state.focusTitleForId = id;

  selectNode(id);
  schedule.once("graphChanged");
  showToast("Node added (N)");
}
function addNodeAtViewportCenter() {
  const cx = wrap.clientWidth / 2,
    cy = wrap.clientHeight / 2;
  const { x, y } = screenToWorld(cx, cy);
  addNodeAt(x - 80, y - 24);
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

/* ========================= Audio (unchanged behavior) ========================= */
let AC = null,
  masterGain = null,
  audioReady = false;
function ensureAudio() {
  if (audioReady) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    masterGain = AC.createGain();
    masterGain.gain.value = 0.6;
    masterGain.connect(AC.destination);
    audioReady = true;
  } catch {}
}
function resumeAudioIfSuspended() {
  if (AC && AC.state === "suspended") AC.resume();
}
window.addEventListener(
  "pointerdown",
  () => {
    ensureAudio();
    resumeAudioIfSuspended();
  },
  { once: true, passive: true }
);

function playCheer() {
  const el = document.getElementById("s-cheer");
  if (!el) return;
  resumeAudioIfSuspended();
  el.currentTime = 0;
  el.volume = 0.85;
  el.play().catch(() => {});
}
function playClick(type = "up") {
  ensureAudio();
  if (!AC) return;
  const now = AC.currentTime,
    osc = AC.createOscillator(),
    gain = AC.createGain();
  const isUp = type === "up";
  const baseFreq = isUp ? 600 : 280,
    dur = isUp ? 0.05 : 0.07,
    startGain = isUp ? 0.18 : 0.24;
  osc.type = "triangle";
  osc.frequency.setValueAtTime(baseFreq, now);
  osc.frequency.exponentialRampToValueAtTime(baseFreq * (isUp ? 0.92 : 0.85), now + dur);
  gain.gain.setValueAtTime(startGain, now);
  gain.gain.exponentialRampToValueAtTime(0.0008, now + dur);
  osc.connect(gain);
  gain.connect(masterGain);
  osc.start(now);
  osc.stop(now + dur + 0.01);
}

/* ========================= Visual FX (unchanged) ========================= */
function shakeNodeElement(el) {
  if (!el) return;
  el.classList.remove("shake");
  el.offsetWidth;
  el.classList.add("shake");
}
function emitConfettiAt(px, py, opts = {}) {
  const { pieces = 30, spread = 120, distance = 160, duration = 850, colors = ["#ffd590", "#e3c174", "#45c49c", "#83b9ff", "#b98b57"] } = opts;
  for (let i = 0; i < pieces; i++) {
    const piece = document.createElement("span");
    piece.className = "confetti";
    const angle = -spread / 2 + Math.random() * spread;
    const rad = ((angle - 90) * Math.PI) / 180;
    const dist = distance * (0.5 + Math.random());
    const dx = Math.cos(rad) * dist,
      dy = Math.sin(rad) * dist;
    piece.style.left = px + "px";
    piece.style.top = py + "px";
    piece.style.setProperty("--dx", dx.toFixed(1) + "px");
    piece.style.setProperty("--dy", dy.toFixed(1) + "px");
    piece.style.setProperty("--rot", Math.floor(Math.random() * 360) + "deg");
    piece.style.setProperty("--dur", duration + "ms");
    piece.style.setProperty("--color", colors[i % colors.length]);
    burstFx.appendChild(piece);
    piece.addEventListener("animationend", () => piece.remove(), {
      passive: true,
    });
  }
}
function emitConfettiForNode(n) {
  const cx = (n.vx ?? n.x) + (n.vw ?? n.w ?? 180) / 2;
  const cy = (n.vy ?? n.y) + (n.vh ?? n.h ?? 64) / 2;
  emitConfettiAt(cx, cy);
}

/* ========================= Toggle Done ========================= */
function toggleDone(id) {
  const n = state.nodes.get(id);
  if (!n) return;
  if (!n.done && !isAvailable(n)) {
    showToast("Locked by prerequisites");
    return;
  }
  n.done = !n.done;

  const el = board.querySelector(`.node[data-id="${id}"]`);
  if (el) {
    el.classList.toggle("done", n.done);
    el.classList.toggle("available", !n.done && isAvailable(n));
    el.classList.toggle("locked", !n.done && !isAvailable(n));
    el.querySelector(".req").textContent = `${parentsOf(n.id).length} req`;
    el.querySelector(".out").textContent = `${childrenOf(n.id).length} out`;
  }

  if (n.done) {
    shakeNodeElement(el);
    emitConfettiForNode(n);
    playCheer();
  } else {
    shakeNodeElement(el);
  }

  schedule.once("nodesState"); // <- other nodes may become available/locked
  schedule.once("edges");
  schedule.once("save");
}

/* ========================= Edges CRUD ========================= */
function wouldCreateCycle(from, to) {
  const seen = new Set();
  const stack = [to];
  while (stack.length) {
    const cur = stack.pop();
    if (cur === from) return true;
    (childrenOf(cur) || []).forEach((n) => {
      if (!seen.has(n)) {
        seen.add(n);
        stack.push(n);
      }
    });
  }
  return false;
}
function createLink(parentId, childId) {
  if (parentId === childId) return;
  if (state.edges.some((e) => e.from === parentId && e.to === childId)) return;
  if (wouldCreateCycle(parentId, childId)) {
    showToast("Link would create a cycle");
    return;
  }
  state.edges.push({ from: parentId, to: childId });
  schedule.once("edgesChanged");
  schedule.once("nodesState"); // child may switch to locked; others may change
  schedule.once("save");
}

/* ========================= Dragging ========================= */
let drag = { active: false, id: null, dx: 0, dy: 0, moved: false };
const DRAG_CLICK_SLOP = 6;

function startDrag(e) {
  const el = e.currentTarget,
    id = el.dataset.id,
    n = state.nodes.get(id);
  if (!n) return;
  e.preventDefault();
  const world = screenToWorld(e.clientX, e.clientY);
  drag = {
    active: true,
    id,
    dx: world.x - n.x,
    dy: world.y - n.y,
    moved: false,
  };
  document.body.classList.add("noselect");
  el.setPointerCapture?.(e.pointerId);
  window.addEventListener("pointermove", onDrag, { passive: true });
  window.addEventListener("pointerup", endDrag, {
    once: true,
    passive: true,
  });
  playClick("up");
}
function onDrag(e) {
  if (!drag.active) return;
  const n = state.nodes.get(drag.id);
  if (!n) return;
  const world = screenToWorld(e.clientX, e.clientY);
  let nx = world.x - drag.dx,
    ny = world.y - drag.dy;

  if (!drag.moved && (Math.abs(nx - n.x) > DRAG_CLICK_SLOP || Math.abs(ny - n.y) > DRAG_CLICK_SLOP)) drag.moved = true;
  if (SNAP_ENABLED) {
    nx = Math.round(nx / GRID) * GRID;
    ny = Math.round(ny / GRID) * GRID;
  }

  n.x = clamp(nx, 0, BOARD_W - 160);
  n.y = clamp(ny, 0, BOARD_H - 80);

  const el = board.querySelector(`.node[data-id="${drag.id}"]`);
  if (el) {
    el.style.left = n.x + "px";
    el.style.top = n.y + "px";
  }

  const out = FRAME_OUTSET / Z.scale;
  n.vx = n.x - out;
  n.vy = n.y - out;
  bumpPerfMode();
  schedule.once("edges");
}
function endDrag() {
  drag.active = false;
  window.removeEventListener("pointermove", onDrag);
  document.body.classList.remove("noselect");
  setTimeout(() => {
    drag.moved = false;
  }, 60);
  playClick("down");
  schedule.once("save");
}

/* ========================= Link mode ========================= */
function setLinkMode(on) {
  state.linkMode = !!on;

  // Always clear the starting node when turning OFF link mode
  if (!state.linkMode) state.linkFrom = null;

  const btn = document.getElementById("linkBtn");
  if (btn) {
    btn.classList.toggle("primary", state.linkMode);
    btn.textContent = state.linkMode ? "Link: parent → child (L)" : "Link Nodes (L)";
  }

  // Bind/unbind click listeners on current nodes
  board.querySelectorAll(".node").forEach((el) => {
    el.classList.toggle("link-mode", state.linkMode);
    el.classList.remove("link-from");
    el.removeEventListener("click", linkClickHandler); // avoid dupes
    if (state.linkMode) el.addEventListener("click", linkClickHandler);
  });

  if (state.linkMode && !state.linkFrom) {
    showToast("Click a PARENT task, then a CHILD task");
  }
}

function linkClickHandler(e) {
  e.preventDefault();
  e.stopPropagation();
  const id = e.currentTarget.dataset.id;

  // First click: choose parent
  if (!state.linkFrom) {
    state.linkFrom = id;
    showToast("Now click the CHILD task");
    // soft highlight on chosen parent
    board.querySelectorAll(".node").forEach((n) => n.classList.remove("link-from"));
    e.currentTarget.classList.add("link-from");
    return;
  }

  // Second click: create link parent → child
  const parentId = state.linkFrom;
  const childId = id;

  // Clear highlight immediately
  board.querySelectorAll(".node").forEach((n) => n.classList.remove("link-from"));
  state.linkFrom = null;

  // Prevent self-link and proceed
  if (parentId !== childId) {
    createLink(parentId, childId); // schedules edgesChanged + save
    showToast("Linked ✓ — Link mode off");
  } else {
    showToast("Cannot link a node to itself — Link mode off");
  }

  // 🔸 Auto-exit link mode after one link attempt (success or not)
  setLinkMode(false);
}

/* ========================= Zoom / Pan ========================= */
function setScale(next, center) {
  const rect = wrap.getBoundingClientRect();
  const cx = center?.x ?? rect.width / 2,
    cy = center?.y ?? rect.height / 2;
  const preWorldX = (cx - Pan.x) / Z.scale,
    preWorldY = (cy - Pan.y) / Z.scale;
  Z.scale = clamp(next, Z.min, Z.max);
  Pan.x = cx - preWorldX * Z.scale;
  Pan.y = cy - preWorldY * Z.scale;
  applyTransform();
  document.getElementById("zoomResetBtn").textContent = Math.round(Z.scale * 100) + "%";
  bumpPerfMode();
  schedule.once("measure");
  schedule.once("edges");
}
document.getElementById("zoomInBtn").addEventListener("click", () => setScale(Z.scale + Z.step));
document.getElementById("zoomOutBtn").addEventListener("click", () => setScale(Z.scale - Z.step));
document.getElementById("zoomResetBtn").addEventListener("click", fitBoard);

wrap.addEventListener(
  "wheel",
  (e) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const dir = e.deltaY > 0 ? -1 : 1;
      bumpPerfMode();
      setScale(Z.scale + dir * Z.step, { x: e.clientX, y: e.clientY });
    }
  },
  { passive: false }
);

(function enableBoardPanning() {
  let isDown = false,
    sx = 0,
    sy = 0,
    startX = 0,
    startY = 0;
  wrap.addEventListener("mousedown", (e) => {
    if (e.target.closest(".node") || e.target.closest(".sidebar")) return;
    isDown = true;
    wrap.style.cursor = "grabbing";
    sx = e.clientX;
    sy = e.clientY;
    startX = Pan.x;
    startY = Pan.y;
  });
  window.addEventListener(
    "mousemove",
    (e) => {
      if (!isDown) return;
      Pan.x = startX + (e.clientX - sx);
      Pan.y = startY + (e.clientY - sy);
      applyTransform();
      bumpPerfMode();
    },
    { passive: true }
  );
  window.addEventListener(
    "mouseup",
    () => {
      if (isDown) {
        isDown = false;
        wrap.style.cursor = "auto";
      }
    },
    { passive: true }
  );
})();

function fitBoard() {
  const availW = wrap.clientWidth,
    availH = wrap.clientHeight;
  const scale = Math.min(availW / BOARD_W, availH / BOARD_H);
  Z.scale = clamp(scale, Z.min, Z.max);
  const stageW = BOARD_W * Z.scale,
    stageH = BOARD_H * Z.scale;
  Pan.x = Math.floor((availW - stageW) / 2);
  Pan.y = Math.floor((availH - stageH) / 2);
  applyTransform();
  document.getElementById("zoomResetBtn").textContent = Math.round(Z.scale * 100) + "%";
  bumpPerfMode();
  schedule.once("measure");
  schedule.once("edges");
}
window.addEventListener("resize", () => fitBoard(), { passive: true });

/* ========================= Export / Import (same UI, same behavior) ========================= */
function download(filename, text) {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
const DB_NAME = "productivitree_fs",
  DB_STORE = "kv";
function idbOpen() {
  return new Promise((res, rej) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(DB_STORE);
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
}
async function idbSet(key, value) {
  const db = await idbOpen();
  return new Promise((res, rej) => {
    const tx = db.transaction(DB_STORE, "readwrite");
    tx.objectStore(DB_STORE).put(value, key);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
}
async function idbGet(key) {
  const db = await idbOpen();
  return new Promise((res, rej) => {
    const tx = db.transaction(DB_STORE, "readonly");
    const req = tx.objectStore(DB_STORE).get(key);
    req.onsuccess = () => res(req.result);
    req.onerror = () => rej(req.error);
  });
}
const FS_HANDLE_KEY = "export_dir_handle_v1";
async function verifyFsPermission(handle, mode = "readwrite") {
  const opts = { mode };
  if ((await handle.queryPermission(opts)) === "granted") return true;
  return (await handle.requestPermission(opts)) === "granted";
}
async function chooseExportDirectory() {
  if (!window.showDirectoryPicker) {
    alert("Your browser does not support choosing a folder. Use Chrome/Edge or rely on the download fallback.");
    return null;
  }
  try {
    const dirHandle = await window.showDirectoryPicker();
    if (!(await verifyFsPermission(dirHandle))) {
      alert("Permission denied for the selected folder.");
      return null;
    }
    await idbSet(FS_HANDLE_KEY, dirHandle);
    showToast("Export folder set.");
    return dirHandle;
  } catch (e) {
    if (e?.name !== "AbortError") console.error(e);
    return null;
  }
}
async function getSavedExportDirectory() {
  const handle = await idbGet(FS_HANDLE_KEY);
  if (handle && (await verifyFsPermission(handle))) return handle;
  return null;
}
async function saveJsonIntoDirectory(dirHandle, filename, text) {
  const fileHandle = await dirHandle.getFileHandle(filename, {
    create: true,
  });
  const writable = await fileHandle.createWritable();
  await writable.write(text);
  await writable.close();
}
async function exportAllWorkspaces() {
  // build JSON
  const payload = {
    exportVersion: 1,
    exportedAt: new Date().toISOString(),
    current: currentWsId,
    workspaces,
  };
  const pretty = JSON.stringify(payload, null, 2);

  // ISO-style, 24h filename
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const YYYY = now.getFullYear();
  const MM = pad(now.getMonth() + 1);
  const DD = pad(now.getDate());
  const HH = pad(now.getHours());
  const mm = pad(now.getMinutes());
  const filename = `productivitree_${YYYY}-${MM}-${DD}_${HH}-${mm}.json`;

  try {
    const dirHandle = await getSavedExportDirectory();
    if (dirHandle) {
      await saveJsonIntoDirectory(dirHandle, filename, pretty);
      showToast(`Saved to export folder: ${filename}`);
      return;
    }
  } catch (e) {
    console.warn("FS API export failed, falling back to download:", e);
  }
  download(filename, pretty);
  showToast('Exported (browser download). Tip: click "Set Export Folder" to save directly into your repo.');
}

function validateImportedPayload(obj) {
  if (!obj || typeof obj !== "object") return "Invalid JSON root";
  if (!obj.workspaces || typeof obj.workspaces !== "object") return "Missing 'workspaces' object";
  const ids = Object.keys(obj.workspaces);
  if (ids.length === 0) return "No workspaces found";
  for (const id of ids) {
    const ws = obj.workspaces[id];
    if (!ws || typeof ws !== "object") return `Workspace '${id}' is invalid`;
    if (!ws.data || !Array.isArray(ws.data.nodes) || !Array.isArray(ws.data.edges)) return `Workspace '${id}' missing nodes/edges`;
  }
  return null;
}
document.getElementById("exportWsBtn").addEventListener("click", exportAllWorkspaces);
document.getElementById("importWsBtn").addEventListener("click", () => importFileInput.click());
importFileInput.addEventListener("change", async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  try {
    const text = await file.text();
    const obj = JSON.parse(text);
    const err = validateImportedPayload(obj);
    if (err) {
      alert("Import failed: " + err);
      return;
    }
    if (!confirm("This will REPLACE all existing workspaces with the imported data. Continue?")) return;
    workspaces = obj.workspaces;

    // Ensure settings exist for older files
    Object.values(workspaces).forEach((ws) => {
      ws.settings = ws.settings || WS_SETTINGS_DEFAULT();
    });

    currentWsId = obj.current && workspaces[obj.current] ? obj.current : Object.keys(workspaces)[0];

    saveAllWorkspaces();
    setCurrentWorkspace(currentWsId);
    showToast("Imported workspaces");
  } catch (ex) {
    console.error(ex);
    alert("Import failed: " + (ex?.message || ex));
  } finally {
    importFileInput.value = "";
  }
});

/* ========================= Header height (ResizeObserver) ========================= */
const header = document.querySelector("header");
function setHeaderH() {
  const h = header?.offsetHeight || 110;
  document.documentElement.style.setProperty("--headerH", h + 10 + "px");
}
const headerRO = new ResizeObserver(() => setHeaderH());

/* ========================= Background FX (theme-aware, canvas) ========================= */
let fxCtx = null,
  fxCanvas = null,
  fxRAF = 0,
  fxParticles = [];

function fxResize() {
  if (!fxCanvas) return;
  fxCanvas.width = BOARD_W; // 1800
  fxCanvas.height = BOARD_H; // 1000
  fxCanvas.style.width = "100%";
  fxCanvas.style.height = "100%";
  fxCtx.setTransform(1, 0, 0, 1, 0, 0); // no DPR here; stage scaling applies
}

function makeParticles(theme) {
  const area = BOARD_W * BOARD_H;
  const base = theme === "girly-pop" ? 32 : theme === "whacky-pomo" ? 48 : theme === "fruloo" ? Math.max(18, Math.floor(BOARD_W / 32)) : 80; // war
  const scale = clamp(area / (1920 * 1080), 0.6, 1.6);
  const count = theme === "fruloo" ? base : Math.round(base * scale);

  const pomoPalette = [
    [164, 255, 61],
    [140, 82, 255],
    [0, 255, 255],
    [255, 84, 0],
    [255, 239, 0],
    [0, 212, 98],
  ];

  // Helper for fire coloring
  const FIRE_STARTS = [
    { c: [255, 60, 40], w: 4 }, // red (hot)
    { c: [255, 120, 30], w: 3 }, // orange
    { c: [255, 184, 70], w: 2 }, // amber
  ];
  const FIRE_MID = [255, 184, 70]; // amber
  const FIRE_END = [255, 228, 150]; // gold
  const pickWeighted = (stops) => {
    const total = stops.reduce((a, s) => a + s.w, 0);
    let r = Math.random() * total;
    for (const s of stops) {
      if ((r -= s.w) <= 0) return s.c;
    }
    return stops[0].c;
  };

  if (theme === "fruloo") {
    const cols = Math.max(18, Math.floor(BOARD_W / 32));
    const rows = Math.max(12, Math.floor(BOARD_H / 24));
    const charset = "01$#%@&{}[]<>/\\*+-=_~";
    fxParticles = new Array(cols).fill(0).map((_, i) => ({
      kind: "glyph",
      x: (i + 0.5) * (BOARD_W / cols),
      y: -Math.random() * BOARD_H,
      vy: 1.2 + Math.random() * 1.6,
      len: 6 + Math.floor(Math.random() * Math.min(24, rows)),
      t: Math.random() * 1000,
      charset,
    }));
    return;
  }

  if (theme === "girly-pop") {
    fxParticles = new Array(count).fill(0).map(() => {
      const size = 10 + Math.random() * 10;
      return {
        kind: "petal",
        x: Math.random() * BOARD_W,
        y: -20 - Math.random() * BOARD_H * 0.4,
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
    fxParticles = new Array(count).fill(0).map(() => {
      const c = pomoPalette[Math.floor(Math.random() * pomoPalette.length)];
      const size = 6 + Math.random() * 14;
      return {
        kind: "blob",
        x: Math.random() * BOARD_W,
        y: Math.random() * BOARD_H,
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

  // === war: FIRE CINDERS (chunky dots, no tails) — FULL-HEIGHT COVERAGE ===
  const now = performance.now();

  // Slight density boost for visibility
  const N = Math.round(count * 1.25);

  fxParticles = new Array(N).fill(0).map(() => {
    // Longer life so more can traverse the board
    const life = 2800 + Math.random() * 2400; // ~2.8–5.2s
    const start = now - Math.random() * life;

    // Bigger heads (visible at typical zoom)
    const size = 1.8 + Math.random() * 2.2; // ~2–4 px radius

    return {
      kind: "ember",
      x: Math.random() * BOARD_W,
      // Spawn anywhere (not just bottom) so we always have activity up high
      y: BOARD_H * (0.05 + Math.random() * 0.95),

      // Much faster upward velocity (px/frame) to cover height
      vx: (Math.random() - 0.5) * 0.18,
      vy: -(1.2 + Math.random() * 1.6), // ~1.2–2.8 px/frame up

      size,
      t0: start,
      life,

      // red/orange start → warm gold end (visible)
      c0: (function () {
        const total = 4 + 3 + 2;
        let r = Math.random() * total;
        if ((r -= 4) <= 0) return [255, 64, 42];
        if ((r -= 3) <= 0) return [255, 128, 36];
        return [250, 176, 72];
      })(),
      mid: [238, 170, 84],
      end: [232, 196, 128],

      // very mild flicker; almost no jitter
      flicker: 0.15 + Math.random() * 0.2,
      phase: Math.random() * Math.PI * 2,
      jitter: 0.008 + Math.random() * 0.02,

      // buoyancy factor applied per frame in fxLoop()
      buoyancy: 1.005, // ~0.5% faster rise each frame
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
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      if (p.y > BOARD_H + 40) {
        p.y = -20 - Math.random() * 120;
        p.x = Math.random() * BOARD_W;
      }
      fxCtx.save();
      fxCtx.translate(p.x, p.y);
      fxCtx.rotate(p.rot);
      const [r, g, b, a] = p.tint || [255, 200, 230, 0.9];
      fxCtx.globalAlpha = a;
      fxCtx.fillStyle = `rgba(${r},${g},${b},${a})`;
      fxCtx.beginPath();
      fxCtx.ellipse(0, 0, p.w * 0.6, p.h * 0.5, 0.3, 0, Math.PI * 2);
      fxCtx.fill();
      fxCtx.restore();
    }
    fxRAF = requestAnimationFrame(fxLoop);
    return;
  }

  if (theme === "whacky-pomo") {
    const pomoPalette = [
      [164, 255, 61],
      [140, 82, 255],
      [0, 255, 255],
      [255, 84, 0],
      [255, 239, 0],
      [0, 212, 98],
    ];
    for (const b of fxParticles) {
      if (b.kind !== "blob") {
        const c = pomoPalette[Math.floor(Math.random() * pomoPalette.length)];
        const size = 6 + Math.random() * 14;
        Object.assign(b, {
          kind: "blob",
          vx: Math.random() * 1.6 - 0.8,
          vy: Math.random() * 1.6 - 0.8,
          w: size,
          h: size,
          rot: Math.random() * Math.PI * 2,
          vr: Math.random() * 0.03 - 0.015,
          color: c,
          alpha: 0.55 + Math.random() * 0.35,
        });
      }
      b.x += b.vx;
      b.y += b.vy;
      b.rot += b.vr;
      if (b.x < -20 || b.x > BOARD_W + 20) b.vx *= -1;
      if (b.y < -20 || b.y > BOARD_H + 20) b.vy *= -1;
      const [r, g, bb] = b.color || [255, 255, 255];
      fxCtx.save();
      fxCtx.translate(b.x, b.y);
      fxCtx.rotate(b.rot);
      fxCtx.globalAlpha = b.alpha ?? 0.8;
      const grd = fxCtx.createRadialGradient(0, 0, 0, 0, 0, b.w * 1.6);
      grd.addColorStop(0, `rgba(${r},${g},${bb},0.95)`);
      grd.addColorStop(1, `rgba(${r},${g},${bb},0.2)`);
      fxCtx.fillStyle = grd;
      fxCtx.beginPath();
      fxCtx.ellipse(0, 0, b.w * 0.9, b.h * 0.9, 0, 0, Math.PI * 2);
      fxCtx.fill();
      fxCtx.lineWidth = 1.5;
      fxCtx.strokeStyle = "rgba(255,255,255,0.35)";
      fxCtx.stroke();
      fxCtx.restore();
    }
    fxRAF = requestAnimationFrame(fxLoop);
    return;
  }

  if (theme === "fruloo") {
    fxCtx.save();
    fxCtx.fillStyle = "rgba(0,0,0,0.35)";
    fxCtx.fillRect(0, 0, fxCanvas.width, fxCanvas.height);
    fxCtx.font = "16px ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace";
    fxCtx.textAlign = "center";
    fxCtx.textBaseline = "top";
    for (const s of fxParticles) {
      s.y += s.vy;
      s.t += 1;
      if (s.y - s.len * 18 > BOARD_H + 48) {
        s.y = -Math.random() * 200;
        s.vy = 1.2 + Math.random() * 1.6;
        s.len = 6 + Math.floor(Math.random() * 18);
      }
      for (let i = 0; i < s.len; i++) {
        const yy = s.y - i * 18;
        if (yy < -24 || yy > BOARD_H + 24) continue;
        const ch = s.charset[Math.floor(s.t + i) % s.charset.length];
        const head = i === 0;
        fxCtx.fillStyle = head ? "rgba(180,255,200,0.95)" : "rgba(60,255,140,0.75)";
        fxCtx.fillText(ch, s.x, yy);
      }
    }
    fxCtx.restore();
    fxRAF = requestAnimationFrame(fxLoop);
    return;
  }

  // === war: FIRE CINDERS (chunky dots, no tails) — FULL-HEIGHT COVERAGE ===
  const now = performance.now();

  // light frame fade for a hint of persistence
  fxCtx.globalCompositeOperation = "source-over";
  fxCtx.fillStyle = "rgba(0,0,0,0.06)";
  fxCtx.fillRect(0, 0, fxCanvas.width, fxCanvas.height);

  for (let i = 0; i < fxParticles.length; i++) {
    const p = fxParticles[i];
    if (p.kind !== "ember") continue;

    // age 0..1
    const t = Math.min(1, (now - p.t0) / p.life);

    // drift + very slight jitter
    p.x += p.vx + Math.cos(now * 0.01 + p.phase) * p.jitter;
    p.y += p.vy - Math.abs(Math.sin(now * 0.009 + p.phase)) * p.jitter * 0.4;

    // mild "buoyancy": accelerate upward a touch so more reach the top
    p.vy *= p.buoyancy || 1.005;

    // color ramp (kept bright enough to read)
    const midT = 0.33;
    const lerp = (a, b, k) => a + (b - a) * k;
    const mix = (c1, c2, k) => [Math.round(lerp(c1[0], c2[0], k)), Math.round(lerp(c1[1], c2[1], k)), Math.round(lerp(c1[2], c2[2], k))];
    const col = t < midT ? mix(p.c0, p.mid, t / midT) : mix(p.mid, p.end, (t - midT) / (1 - midT));

    // alpha: slower fade so dots stay visible longer
    const baseA = (t < 0.12 ? t / 0.12 : 1 - t) * 1.0; // peak 1.0
    const flick = 0.85 + 0.15 * Math.sin(now * 0.012 + p.phase);
    const alpha = Math.max(0, Math.min(1, baseA * (0.9 + p.flicker * (flick - 0.85))));

    // dot radius (slightly grows early, then holds)
    const r = p.size * (t < 0.4 ? 1.0 + t * 0.6 : 1.24);

    // 1) solid body (normal blending) — makes them readable
    fxCtx.globalCompositeOperation = "source-over";
    fxCtx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${alpha})`;
    fxCtx.beginPath();
    fxCtx.arc(p.x, p.y, r, 0, Math.PI * 2);
    fxCtx.fill();

    // 2) tiny hot core to add punch (additive), but not a glow cloud
    fxCtx.globalCompositeOperation = "lighter";
    fxCtx.globalAlpha = Math.min(1, alpha * 0.8);
    fxCtx.beginPath();
    fxCtx.arc(p.x, p.y, Math.max(0.6, r * 0.45), 0, Math.PI * 2);
    fxCtx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},1)`;
    fxCtx.fill();

    // reset blend/alpha for next particle
    fxCtx.globalAlpha = 1.0;
    fxCtx.globalCompositeOperation = "source-over";

    // recycle when done or off-screen — respawn at bottom for continuous upward flow
    if (now - p.t0 > p.life || p.y < -16 || p.x < -16 || p.x > BOARD_W + 16) {
      const life = 2800 + Math.random() * 2400;
      p.t0 = now;
      p.life = life;
      p.size = 1.8 + Math.random() * 2.2;
      p.x = Math.random() * BOARD_W;
      p.y = BOARD_H + 16; // come in from just below bottom
      p.vx = (Math.random() - 0.5) * 0.18;
      p.vy = -(1.2 + Math.random() * 1.6);
      p.c0 = (function () {
        const total = 4 + 3 + 2;
        let r = Math.random() * total;
        if ((r -= 4) <= 0) return [255, 64, 42];
        if ((r -= 3) <= 0) return [255, 128, 36];
        return [250, 176, 72];
      })();
      p.mid = [238, 170, 84];
      p.end = [232, 196, 128];
      p.flicker = 0.15 + Math.random() * 0.2;
      p.phase = Math.random() * Math.PI * 2;
      p.jitter = 0.008 + Math.random() * 0.02;
      p.buoyancy = 1.005;
    }
  }

  fxRAF = requestAnimationFrame(fxLoop);
}

function killFX() {
  if (fxRAF) cancelAnimationFrame(fxRAF);
  fxRAF = 0;
}

function seedFX() {
  if (!FX_ENABLED) return;
  killFX();
  fxCanvas = document.getElementById("fxCanvas");
  if (!fxCanvas) return;
  fxCanvas.style.display = "block";
  fxCtx = fxCanvas.getContext("2d", {
    alpha: true,
    desynchronized: true,
  });
  fxResize();
  const theme = currentTheme();

  makeParticles(theme);
  fxRAF = requestAnimationFrame(fxLoop);
}

window.addEventListener(
  "resize",
  () => {
    if (!FX_ENABLED || !fxCanvas) return;
    fxResize();
    const theme = currentTheme();

    makeParticles(theme);
  },
  { passive: true }
);

document.addEventListener(
  "visibilitychange",
  () => {
    if (document.hidden) {
      killFX();
    } else if (FX_ENABLED) {
      seedFX();
    }
  },
  { passive: true }
);

/* ========================= Controls + Shortcuts ========================= */
(function wireControls() {
  const addNodeBtn = document.getElementById("addNodeBtn");
  const linkBtn = document.getElementById("linkBtn");
  const snapBtn = document.getElementById("snapBtn");
  const clearBtn = document.getElementById("clearBtn");
  const setExportFolderBtn = document.getElementById("setExportFolderBtn");

  const wsNewBtn = document.getElementById("wsNew");
  const wsRenBtn = document.getElementById("wsRename");
  const wsDelBtn = document.getElementById("wsDelete");
  const fxToggleBtn = document.getElementById("fxToggleBtn");
  fxToggleBtn?.addEventListener("click", () => setFXEnabled(!FX_ENABLED));

  wsNewBtn?.addEventListener("click", newWorkspace);
  wsRenBtn?.addEventListener("click", renameWorkspace);
  wsDelBtn?.addEventListener("click", deleteWorkspace);

  addNodeBtn?.addEventListener("click", addNodeAtViewportCenter);
  linkBtn?.addEventListener("click", () => setLinkMode(!state.linkMode));
  snapBtn?.addEventListener("click", () => {
    SNAP_ENABLED = !SNAP_ENABLED;
    snapBtn.textContent = "Snap: " + (SNAP_ENABLED ? "On" : "Off");
    snapBtn.setAttribute("aria-pressed", SNAP_ENABLED ? "true" : "false");
  });
  clearBtn?.addEventListener("click", () => {
    if (!confirm("Clear the current workspace canvas?")) return;
    state.nodes.clear();
    state.edges.length = 0;
    state.selected = null;
    schedule.once("graphChanged");
    schedule.once("save");
  });
  setExportFolderBtn?.addEventListener("click", chooseExportDirectory);

  window.addEventListener(
    "keydown",
    (e) => {
      if (e.target && ["INPUT", "TEXTAREA"].includes(e.target.tagName)) return;
      if (e.key === "l" || e.key === "L") {
        setLinkMode(!state.linkMode);
        e.preventDefault();
        return;
      }
      if (e.key === "n" || e.key === "N") {
        addNodeAtViewportCenter();
        e.preventDefault();
        return;
      }
      if (e.key === "Delete" && state.selected) {
        deleteNode(state.selected);
        e.preventDefault();
        return;
      }
      if (e.key === "Escape") {
        hideColorPopover();
      }
    },
    { passive: false }
  );
})();
// --- Grid menu wiring ---
gridBtn.addEventListener("click", () => {
  gridMenu.classList.toggle("show");
  // sync controls with current state
  gridVisibleInput.checked = GRID_VISIBLE;
  gridSizeInput.value = GRID;
  gridSnapInput.checked = SNAP_ENABLED;
});

document.addEventListener("click", (e) => {
  if (!gridMenu.contains(e.target) && !gridBtn.contains(e.target)) {
    gridMenu.classList.remove("show");
  }
});

// Show/hide
gridVisibleInput.addEventListener("change", () => {
  GRID_VISIBLE = gridVisibleInput.checked;
  localStorage.setItem("grid_visible", JSON.stringify(GRID_VISIBLE));
  if (currentWsId && workspaces[currentWsId]) {
    workspaces[currentWsId].settings = workspaces[currentWsId].settings || WS_SETTINGS_DEFAULT();
    workspaces[currentWsId].settings.gridVisible = GRID_VISIBLE;
    saveAllWorkspaces();
  }
  updateGrid();
});

// Size
gridSizeInput.addEventListener("change", () => {
  const v = Math.max(4, Math.floor(Number(gridSizeInput.value) || 24));
  GRID = v;
  localStorage.setItem("grid_size", String(GRID));
  if (currentWsId && workspaces[currentWsId]) {
    workspaces[currentWsId].settings = workspaces[currentWsId].settings || WS_SETTINGS_DEFAULT();
    workspaces[currentWsId].settings.gridSize = GRID;
    saveAllWorkspaces();
  }
  updateGrid();
});

// Snap
gridSnapInput.addEventListener("change", () => {
  SNAP_ENABLED = gridSnapInput.checked;
  localStorage.setItem("grid_snap", JSON.stringify(SNAP_ENABLED));
  if (currentWsId && workspaces[currentWsId]) {
    workspaces[currentWsId].settings = workspaces[currentWsId].settings || WS_SETTINGS_DEFAULT();
    workspaces[currentWsId].settings.gridSnap = SNAP_ENABLED;
    saveAllWorkspaces();
  }
  // no redraw needed, just affects dragging/new node placement
});

/* ========================= Helpers ========================= */
function escapeHtml(s) {
  return (s || "").replace(
    /[&<>"']/g,
    (m) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      }[m])
  );
}

/* ========================= Color Wheel Popover (segmented donut, 32 slices) ========================= */
const pop = document.getElementById("colorPopover");
const wheel = document.getElementById("wheelCanvas");
const vSlider = document.getElementById("valSlider");
const swatch = document.getElementById("swatch");
const hexField = document.getElementById("hexField");
const ctx = wheel.getContext("2d");

const SEGMENTS = 32;          // 32 wedges
const RING_THICKNESS = 0.38;  // 0..1 of outer radius (adjust to taste)

let curH = 40 / 360;  // hue 0..1
let curV = 1.0;       // value 0..1
// Saturation is locked to 1 for a crisp segmented wheel
const SAT = 1.0;

function hsvToRgb(h, s, v) {
  let r, g, b, i = Math.floor(h * 6), f = h * 6 - i,
      p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0: r = v; g = t; b = p; break;
    case 1: r = q; g = v; b = p; break;
    case 2: r = p; g = v; b = t; break;
    case 3: r = p; g = q; b = v; break;
    case 4: r = t; g = p; b = v; break;
    case 5: r = v; g = p; b = q; break;
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}
function rgbToHsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let h = 0, s = max === 0 ? 0 : d / max, v = max;
  if (d !== 0) {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h, s, v };
}
function rgbToHex(r, g, b) {
  const toHex = (n) => n.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
function hexToRgb(hex) {
  const v = hex.replace("#", "");
  const r = parseInt(v.slice(0, 2), 16), g = parseInt(v.slice(2, 4), 16), b = parseInt(v.slice(4, 6), 16);
  return { r, g, b };
}

function drawWheel() {
  const { width, height } = wheel;
  const cx = width / 2, cy = height / 2;
  const R = Math.min(cx, cy) - 2;                 // outer radius
  const rInner = Math.max(8, R * (1 - RING_THICKNESS)); // inner radius for donut

  ctx.clearRect(0, 0, width, height);

  // Paint wedges
  for (let i = 0; i < SEGMENTS; i++) {
    const a0 = (i / SEGMENTS) * Math.PI * 2;
    const a1 = ((i + 1) / SEGMENTS) * Math.PI * 2;
    const hue = i / SEGMENTS;
    const { r, g, b } = hsvToRgb(hue, SAT, curV);

    ctx.beginPath();
    // donut wedge
    ctx.arc(cx, cy, R, a0, a1, false);
    ctx.arc(cx, cy, rInner, a1, a0, true);
    ctx.closePath();
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fill();
  }

  // Wedge separators
  ctx.save();
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(255,255,255,.35)";
  for (let i = 0; i < SEGMENTS; i++) {
    const ang = (i / SEGMENTS) * Math.PI * 2;
    const x0 = cx + rInner * Math.cos(ang), y0 = cy + rInner * Math.sin(ang);
    const x1 = cx + R * Math.cos(ang),      y1 = cy + R * Math.sin(ang);
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
  }
  // outer and inner rings
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(cx, cy, rInner, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();

  // Highlight current segment
  const seg = Math.floor(curH * SEGMENTS) % SEGMENTS;
  const aMid = ((seg + 0.5) / SEGMENTS) * Math.PI * 2;
  ctx.save();
  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(255,255,255,.9)";
  ctx.beginPath();
  ctx.arc(cx, cy, (R + rInner) / 2, aMid - (Math.PI / SEGMENTS), aMid + (Math.PI / SEGMENTS));
  ctx.stroke();
  ctx.restore();
}

function updateSwatchAndHex() {
  const { r, g, b } = hsvToRgb(curH, SAT, curV);
  const hex = rgbToHex(r, g, b);
  swatch.style.background = hex;
  hexField.value = hex;
}

function showColorPopover() {
  const hex = workspaces[currentWsId]?.color || "#c79039";
  const { r, g, b } = hexToRgb(hex);
  const hsv = rgbToHsv(r, g, b);
  curH = hsv.h;          // keep hue from current color
  curV = hsv.v;          // keep value from current color
  vSlider.value = Math.round(curV * 100);
  updateSwatchAndHex();
  drawWheel();
  pop.classList.add("show");
}
function hideColorPopover() {
  pop.classList.remove("show");
}

let wheelDragging = false;

function pickHueFromPoint(clientX, clientY) {
  const rect = wheel.getBoundingClientRect();
  const x = clientX - rect.left, y = clientY - rect.top;
  const cx = wheel.width / 2, cy = wheel.height / 2;
  const dx = x - cx, dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const R = Math.min(cx, cy) - 2;
  const rInner = Math.max(8, R * (1 - RING_THICKNESS));

  // Only respond if pointer is within the donut ring
  if (dist < rInner || dist > R) return;

  let ang = Math.atan2(dy, dx);
  if (ang < 0) ang += Math.PI * 2;

  const wedge = (Math.PI * 2) / SEGMENTS;
  const seg = Math.floor(ang / wedge) % SEGMENTS;

  // snap hue to the center of the wedge
  curH = (seg + 0.5) / SEGMENTS;

  updateSwatchAndHex();
  drawWheel();
}

wheel.addEventListener("pointerdown", (e) => {
  wheelDragging = true;
  wheel.setPointerCapture?.(e.pointerId);
  pickHueFromPoint(e.clientX, e.clientY);
}, { passive: true });

window.addEventListener("pointermove", (e) => {
  if (wheelDragging) pickHueFromPoint(e.clientX, e.clientY);
}, { passive: true });

window.addEventListener("pointerup", () => { wheelDragging = false; }, { passive: true });

vSlider.addEventListener("input", () => {
  curV = vSlider.value / 100;
  updateSwatchAndHex();
  drawWheel();
}, { passive: true });

hexField.addEventListener("change", () => {
  const v = hexField.value.trim();
  if (/^#?[0-9a-fA-F]{6}$/.test(v)) {
    const hex = v.startsWith("#") ? v : "#" + v;
    const { r, g, b } = hexToRgb(hex);
    const hsv = rgbToHsv(r, g, b);
    curH = hsv.h;          // take hue from typed color
    curV = hsv.v;          // take value from typed color
    vSlider.value = Math.round(curV * 100);
    updateSwatchAndHex();
    drawWheel();
  } else {
    showToast("Invalid hex color");
  }
});

// Wire buttons (assumes these exist)
wsColorBtn.addEventListener("click", showColorPopover);
document.getElementById("cancelColor").addEventListener("click", hideColorPopover);
document.getElementById("applyColor").addEventListener("click", () => {
  setWorkspaceColor(hexField.value.trim() || "#c79039");
  hideColorPopover();
});
pop.addEventListener("click", (e) => { if (e.target === pop) hideColorPopover(); });

/* ========================= Scheduler =========================
 Coalesces work into the next animation frame to minimize layout thrash.
 Keys:
   - graphChanged: nodes OR edges changed (rebuild cache + re-render nodes)
   - edgesChanged: only edges changed (rebuild cache)
   - measure: recompute node measurements/centers
   - nodesState: recompute node classes/badges (available/locked/done)
   - edges: redraw edges
   - save: debounce local save
*/
const schedule = (() => {
  const pending = new Set();
  let rafId = 0;

  function request() {
    if (!rafId) rafId = requestAnimationFrame(flush);
  }

  function flush() {
    rafId = 0;

    if (pending.has("graphChanged")) {
      pending.delete("graphChanged");
      rebuildAdjacency();
      renderNodes(); // will queue "measure" itself
      pending.add("nodesState");
      pending.add("edges");
    }

    if (pending.has("edgesChanged")) {
      pending.delete("edgesChanged");
      rebuildAdjacency();
      pending.add("nodesState");
      pending.add("edges");
    }

    if (pending.has("measure")) {
      pending.delete("measure");
      measureAll();
      // after measuring, edges may depend on new centers; ensure edges is pending
      pending.add("edges");
    }

    if (pending.has("nodesState")) {
      pending.delete("nodesState");
      refreshNodeStates();
    }

    if (pending.has("edges")) {
      pending.delete("edges");
      drawEdges();
    }

    if (pending.has("save")) {
      pending.delete("save");
      saveLocal();
    }

    if (pending.size) request(); // run again if new work got queued
  }

  return {
    once(key) {
      pending.add(key);
      request();
    },
    measure() {
      this.once("measure");
    },
  };
})();

function updateHeaderOffset() {
  setHeaderH();
}
// (seedFX runs in init)

function loadFromData(data) {
  state.nodes.clear();
  state.edges.length = 0;
  if (data && data.nodes) {
    data.nodes.forEach((n) => state.nodes.set(n.id, { ...n }));
    if (Array.isArray(data.edges)) data.edges.forEach((e) => state.edges.push({ ...e }));
  }
  schedule.once("graphChanged");
  schedule.once("edges");
}
function currentTheme() {
  if (document.body.classList.contains("theme-fruloo")) return "fruloo";
  if (document.body.classList.contains("theme-girly-pop")) return "girly-pop";
  if (document.body.classList.contains("theme-whacky-pomo")) return "whacky-pomo";
  return "war";
}

(function init() {
  loadAllWorkspaces();
  renderWorkspaceRibbons();
  setCurrentWorkspace(currentWsId);
  setFXEnabled(FX_ENABLED, { persist: false });
  if (window.ResizeObserver) {
    headerRO.observe(header);
  } else {
    // fallback
    window.addEventListener("resize", setHeaderH, { passive: true });
    setHeaderH();
  }
  setHeaderH();
  fitBoard();
  updateGrid();

  // toolbar buttons are already wired in wireControls()

  // Link button state sync if toggled later
  document.getElementById("toggleDoneBtn").addEventListener("click", () => {
    if (state.selected) toggleDone(state.selected);
  });
  document.getElementById("deleteBtn").addEventListener("click", () => {
    if (state.selected) deleteNode(state.selected);
  });
})();
// Theme dropdown
if (themeSelect) {
  themeSelect.addEventListener("change", () => {
    const v = themeSelect.value;
    document.body.classList.toggle("theme-war", v === "war");
    document.body.classList.toggle("theme-girly-pop", v === "girly-pop");
    document.body.classList.toggle("theme-whacky-pomo", v === "whacky-pomo");
    document.body.classList.toggle("theme-fruloo", v === "fruloo");
    if (FX_ENABLED) seedFX(); // refresh FX
  });
}
