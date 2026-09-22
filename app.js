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
const ctx = canvas.getContext("2d");
const msgEl = document.getElementById("msg");
const speedEl = document.getElementById("speed");
const sizeEl = document.getElementById("size");
const colorEl = document.getElementById("color");
const pauseBtn = document.getElementById("pause");
let offset = 0, last = 0, running = true;
let text = (msgEl.value || " ").toUpperCase();
const ROWS = 7;
function glyph(ch) {
  const u = ch.toUpperCase();
  return FONT[u] || FONT[ch] || [0x7f, 0x41, 0x41, 0x41, 0x7f];
}
function textWidth(str) {
  let w = 0;
  for (const ch of str) w += glyph(ch).length + 1;
  return w + 6;
}
function resize() {
  const wrap = canvas.parentElement;
  const dpr = Math.min(devicePixelRatio || 1, 2.5);
  canvas.width = Math.max(1, Math.floor(wrap.clientWidth * dpr));
  canvas.height = Math.max(1, Math.floor(wrap.clientHeight * dpr));
}
function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function draw() {
  const w = canvas.width, h = canvas.height;
  ctx.fillStyle = "#050506";
  ctx.fillRect(0, 0, w, h);
  const sizePref = Number(sizeEl.value);
  const gap = Math.max(0.6, sizePref * 0.12);
  const cell = Math.max(3, Math.min(sizePref, Math.floor((h - 20) / (ROWS + 2))));
  const cols = Math.max(16, Math.floor((w - 16) / cell));
  const ox = Math.floor((w - cols * cell) / 2);
  const oy = Math.floor((h - ROWS * cell) / 2);
  const [r, g, b] = hexToRgb(colorEl.value || "#ff3b30");
  const radius = Math.max(1.1, cell / 2 - gap);
  ctx.fillStyle = "rgba(255,255,255,0.045)";
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < cols; x++) {
      ctx.beginPath();
      ctx.arc(ox + x * cell + cell / 2, oy + y * cell + cell / 2, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.shadowColor = `rgba(${r},${g},${b},0.7)`;
  ctx.shadowBlur = Math.max(4, cell * 0.55);
  let col = 0;
  const doubled = `${text}    ${text}`;
  for (const ch of doubled) {
    const gph = glyph(ch);
    for (let gx = 0; gx < gph.length; gx++) {
      const boardX = col + gx - Math.floor(offset);
      if (boardX < 0 || boardX >= cols) continue;
      const bits = gph[gx];
      for (let gy = 0; gy < ROWS; gy++) {
        if (bits & (1 << (ROWS - 1 - gy))) {
          const cx = ox + boardX * cell + cell / 2;
          const cy = oy + gy * cell + cell / 2;
          const grd = ctx.createRadialGradient(cx - radius * 0.25, cy - radius * 0.25, 0.2, cx, cy, radius);
          grd.addColorStop(0, `rgb(${Math.min(255, r + 70)},${Math.min(255, g + 50)},${Math.min(255, b + 40)})`);
          grd.addColorStop(0.55, `rgb(${r},${g},${b})`);
          grd.addColorStop(1, `rgb(${Math.max(0, r - 50)},${Math.max(0, g - 50)},${Math.max(0, b - 50)})`);
          ctx.fillStyle = grd;
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    col += gph.length + 1;
  }
  ctx.shadowBlur = 0;
}
function tick(t) {
  requestAnimationFrame(tick);
  const dt = Math.min(48, t - last || 16);
  last = t;
  if (running) {
    offset += (Number(speedEl.value) * dt) / 1000;
    const loopW = Math.max(1, textWidth(text) + 4);
    if (offset > loopW) offset -= loopW;
  }
  draw();
}
document.getElementById("form").addEventListener("submit", (e) => {
  e.preventDefault();
  text = (msgEl.value || " ").toUpperCase();
  offset = 0;
  running = true;
  pauseBtn.textContent = "Pauza";
  try { localStorage.setItem("led-text", msgEl.value); } catch {}
});
pauseBtn.addEventListener("click", () => {
  running = !running;
  pauseBtn.textContent = running ? "Pauza" : "Dalej";
});
document.getElementById("fs").addEventListener("click", async () => {
  const el = document.documentElement;
  if (!document.fullscreenElement) await el.requestFullscreen?.();
  else await document.exitFullscreen?.();
});
try {
  const saved = localStorage.getItem("led-text");
  if (saved) { msgEl.value = saved; text = saved.toUpperCase(); }
} catch {}
window.addEventListener("resize", resize);
resize();
requestAnimationFrame(tick);
if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
