const FONT = {
  " ": [0,0,0], "!": [0,0x5f,0], ".": [0,0x01,0], ",": [0,0x01,0x02], ":": [0,0x22,0],
  "-": [0x08,0x08,0x08], "+": [0x08,0x1c,0x08], "*": [0x14,0x08,0x14], "/": [0x03,0x04,0x08,0x10,0x60], "•": [0,0x08,0],
  "0": [0x3e,0x45,0x49,0x51,0x3e], "1": [0x00,0x21,0x7f,0x01,0x00], "2": [0x21,0x43,0x45,0x49,0x31],
  "3": [0x42,0x41,0x51,0x69,0x46], "4": [0x0c,0x14,0x24,0x7f,0x04], "5": [0x72,0x51,0x51,0x51,0x4e],
  "6": [0x1e,0x29,0x49,0x49,0x06], "7": [0x40,0x47,0x48,0x50,0x60], "8": [0x36,0x49,0x49,0x49,0x36], "9": [0x30,0x49,0x49,0x4a,0x3c],
  A: [0x3f,0x48,0x48,0x48,0x3f], B: [0x7f,0x49,0x49,0x49,0x36], C: [0x3e,0x41,0x41,0x41,0x22],
  D: [0x7f,0x41,0x41,0x41,0x3e], E: [0x7f,0x49,0x49,0x49,0x41], F: [0x7f,0x48,0x48,0x48,0x40],
  G: [0x3e,0x41,0x49,0x49,0x2f], H: [0x7f,0x08,0x08,0x08,0x7f], I: [0x41,0x41,0x7f,0x41,0x41],
  J: [0x02,0x01,0x01,0x01,0x7e], K: [0x7f,0x08,0x14,0x22,0x41], L: [0x7f,0x01,0x01,0x01,0x01],
  M: [0x7f,0x20,0x18,0x20,0x7f], N: [0x7f,0x20,0x10,0x08,0x7f], O: [0x3e,0x41,0x41,0x41,0x3e],
  P: [0x7f,0x48,0x48,0x48,0x30], Q: [0x3e,0x41,0x45,0x42,0x3d], R: [0x7f,0x48,0x4c,0x4a,0x31],
  S: [0x32,0x49,0x49,0x49,0x26], T: [0x40,0x40,0x7f,0x40,0x40], U: [0x7e,0x01,0x01,0x01,0x7e],
  V: [0x7c,0x02,0x01,0x02,0x7c], W: [0x7f,0x02,0x0c,0x02,0x7f], X: [0x63,0x14,0x08,0x14,0x63],
  Y: [0x60,0x10,0x0f,0x10,0x60], Z: [0x43,0x45,0x49,0x51,0x61],
  "Ą": [0x3f,0x48,0x48,0x4a,0x3d], "Ć": [0x3e,0x41,0x49,0x41,0x22], "Ę": [0x7f,0x49,0x49,0x4b,0x45],
  "Ł": [0x7f,0x03,0x05,0x01,0x01], "Ń": [0x7f,0x20,0x12,0x08,0x7f], "Ó": [0x3e,0x41,0x49,0x41,0x3e],
  "Ś": [0x32,0x49,0x4d,0x49,0x26], "Ź": [0x43,0x45,0x4d,0x51,0x61], "Ż": [0x43,0x45,0x4b,0x51,0x61]
};
const canvas = document.getElementById("led");
const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
const msgEl = document.getElementById("msg");
const speedEl = document.getElementById("speed");
const sizeEl = document.getElementById("size");
const colorEl = document.getElementById("color");
const pauseBtn = document.getElementById("pause");
const ROWS = 7;
let text = (msgEl.value || " ").toUpperCase();
let running = true;
let offsetPx = 0;
let last = performance.now();
let layout = null;
let strip = null;
let grid = null;
let dirty = true;
function glyph(ch) {
  const u = ch.toUpperCase();
  return FONT[u] || FONT[ch] || [0x7f, 0x41, 0x41, 0x41, 0x7f];
}
function colsOf(str) {
  let w = 0;
  for (const ch of str) w += glyph(ch).length + 1;
  return Math.max(8, w + 8);
}
function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function resize() {
  const wrap = canvas.parentElement;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const w = Math.max(1, Math.floor(wrap.clientWidth * dpr));
  const h = Math.max(1, Math.floor(wrap.clientHeight * dpr));
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
    dirty = true;
  }
}
function makeLayout() {
  const w = canvas.width;
  const h = canvas.height;
  const sizePref = Number(sizeEl.value);
  const cell = Math.max(3, Math.min(sizePref, Math.floor((h - 16) / (ROWS + 1.5))));
  const gap = Math.max(0.7, cell * 0.14);
  const radius = Math.max(1.15, cell / 2 - gap);
  const viewCols = Math.max(16, Math.floor((w - 12) / cell));
  const ox = Math.floor((w - viewCols * cell) / 2);
  const oy = Math.floor((h - ROWS * cell) / 2);
  const loopCols = colsOf(text);
  return { w, h, cell, radius, viewCols, ox, oy, loopCols, color: colorEl.value || "#ff3b30" };
}
function paintDots(target, cols, ox, oy, cell, radius, onBits, rgb) {
  const tctx = target.getContext("2d");
  const off = "rgba(255,255,255,0.05)";
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < cols; x++) {
      const cx = ox + x * cell + cell / 2;
      const cy = oy + y * cell + cell / 2;
      tctx.beginPath();
      tctx.arc(cx, cy, radius, 0, Math.PI * 2);
      tctx.fillStyle = off;
      tctx.fill();
    }
  }
}
function buildCaches() {
  layout = makeLayout();
  const { w, h, cell, radius, viewCols, ox, oy, loopCols, color } = layout;
  const rgb = hexToRgb(color);
  grid = document.createElement("canvas");
  grid.width = w;
  grid.height = h;
  const gctx = grid.getContext("2d");
  gctx.fillStyle = "#050506";
  gctx.fillRect(0, 0, w, h);
  paintDots(grid, viewCols, ox, oy, cell, radius, null, rgb);
  const bits = new Uint8Array(ROWS * loopCols);
  let col = 0;
  for (const ch of text) {
    const gph = glyph(ch);
    for (let gx = 0; gx < gph.length; gx++) {
      const bitsCol = gph[gx];
      for (let gy = 0; gy < ROWS; gy++) {
        if (bitsCol & (1 << (ROWS - 1 - gy))) bits[gy * loopCols + col + gx] = 1;
      }
    }
    col += gph.length + 1;
  }
  strip = document.createElement("canvas");
  strip.width = Math.max(1, loopCols * cell);
  strip.height = Math.max(1, ROWS * cell);
  const sctx = strip.getContext("2d");
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < loopCols; x++) {
      if (!bits[y * loopCols + x]) continue;
      const cx = x * cell + cell / 2;
      const cy = y * cell + cell / 2;
      sctx.beginPath();
      sctx.arc(cx, cy, radius, 0, Math.PI * 2);
      sctx.fillStyle = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
      sctx.fill();
    }
  }
  dirty = false;
}
function draw() {
  if (dirty || !layout || !strip || !grid) buildCaches();
  const { cell, viewCols, ox, oy } = layout;
  const loopW = strip.width;
  const viewW = viewCols * cell;
  let x = -offsetPx;
  x = ((x % loopW) + loopW) % loopW;
  if (x > 0) x -= loopW;
  ctx.drawImage(grid, 0, 0);
  ctx.save();
  ctx.beginPath();
  ctx.rect(ox, oy, viewW, ROWS * cell);
  ctx.clip();
  while (x < viewW) {
    ctx.drawImage(strip, ox + x, oy);
    x += loopW;
  }
  ctx.restore();
}
function tick(now) {
  const dt = Math.min(50, now - last);
  last = now;
  if (running && layout) {
    const pxPerSec = Number(speedEl.value) * (layout.cell * 0.35);
    offsetPx += (pxPerSec * dt) / 1000;
    if (offsetPx > 1e9) offsetPx %= layout.loopCols * layout.cell;
  }
  draw();
  requestAnimationFrame(tick);
}
function applyText() {
  text = (msgEl.value || " ").toUpperCase();
  offsetPx = 0;
  dirty = true;
  running = true;
  pauseBtn.textContent = "Pauza";
  try { localStorage.setItem("led-text", msgEl.value); } catch {}
}
document.getElementById("form").addEventListener("submit", (e) => {
  e.preventDefault();
  applyText();
});
pauseBtn.addEventListener("click", () => {
  running = !running;
  pauseBtn.textContent = running ? "Pauza" : "Dalej";
});
function setFs(on) {
  document.body.classList.toggle("fs", on);
  document.getElementById("fs").textContent = on ? "Wyjdź" : "Pełny";
  requestAnimationFrame(() => { resize(); dirty = true; });
  const root = document.documentElement;
  if (on) {
    const req = root.requestFullscreen || root.webkitRequestFullscreen;
    try { req?.call(root); } catch {}
    try { screen.orientation?.lock?.("landscape").catch(() => {}); } catch {}
  } else {
    const exit = document.exitFullscreen || document.webkitExitFullscreen;
    try { if (document.fullscreenElement || document.webkitFullscreenElement) exit?.call(document); } catch {}
    try { screen.orientation?.unlock?.(); } catch {}
  }
}
document.getElementById("fs").addEventListener("click", () => setFs(!document.body.classList.contains("fs")));
document.getElementById("exitFs").addEventListener("click", () => setFs(false));
canvas.addEventListener("click", () => setFs(!document.body.classList.contains("fs")));
sizeEl.addEventListener("input", () => { dirty = true; });
colorEl.addEventListener("input", () => { dirty = true; });
try {
  const saved = localStorage.getItem("led-text");
  if (saved) { msgEl.value = saved; text = saved.toUpperCase(); }
} catch {}
window.addEventListener("resize", () => { resize(); dirty = true; });
resize();
requestAnimationFrame(tick);
if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
