// After the Demark — promo video scenes. Pure canvas drawing, driven by time t (seconds).
const W = 1920, H = 1080;
const F = 'Avenir Next';
const C = {
  bg: '#0b1220', bg2: '#111827', surface: '#1e293b', border: '#334155',
  text: '#f8fafc', muted: '#cbd5e1', dim: '#94a3b8', teal: '#4FD1BF', tealHi: '#8AE6D9',
  red: '#ef4444', redDk: '#7f1d1d', green: '#22c55e', greenDk: '#065f46', amber: '#f59e0b',
};

// ---------- helpers ----------
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const prog = (t, a, b) => clamp((t - a) / (b - a));
const lerp = (a, b, k) => a + (b - a) * k;
const eio = k => k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
const eout = k => 1 - Math.pow(1 - k, 3);
const back = k => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function fillRR(ctx, x, y, w, h, r, fill, stroke, lw = 2) {
  rr(ctx, x, y, w, h, r);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
}
function text(ctx, s, x, y, { size = 40, weight = 600, color = C.text, align = 'center', base = 'middle', alpha = 1, spacing = 0 } = {}) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.font = `${weight} ${size}px "${F}"`;
  ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = base;
  if (spacing) ctx.letterSpacing = `${spacing}px`;
  ctx.fillText(s, x, y);
  ctx.restore();
}
function measure(ctx, s, size, weight = 600) {
  ctx.save(); ctx.font = `${weight} ${size}px "${F}"`; const w = ctx.measureText(s).width; ctx.restore(); return w;
}
function circle(ctx, x, y, r, fill, stroke, lw = 2) {
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
}
function line(ctx, x1, y1, x2, y2, color, lw = 3, dash) {
  ctx.save(); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
  ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round';
  if (dash) ctx.setLineDash(dash);
  ctx.stroke(); ctx.restore();
}
function glow(ctx, x, y, r, color, a = 0.5) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore();
}
function bgGrad(ctx, top = '#0d1626', bot = '#070c16') {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, top); g.addColorStop(1, bot);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
function vignette(ctx, a = 0.55) {
  const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 1.05);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${a})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
function wifiIcon(ctx, x, y, s, color, bars = 3, alpha = 1) {
  ctx.save(); ctx.globalAlpha *= alpha; ctx.lineCap = 'round';
  for (let i = 0; i < 3; i++) {
    ctx.beginPath(); ctx.arc(x, y, s * (0.35 + i * 0.32), -Math.PI * 0.75, -Math.PI * 0.25);
    ctx.strokeStyle = i < bars ? color : 'rgba(148,163,184,0.25)'; ctx.lineWidth = s * 0.12; ctx.stroke();
  }
  circle(ctx, x, y, s * 0.09, color);
  ctx.restore();
}
function check(ctx, x, y, s, color, k = 1) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = s * 0.16; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath();
  const p1 = [x - s * 0.35, y], p2 = [x - s * 0.1, y + s * 0.25], p3 = [x + s * 0.4, y - s * 0.3];
  const k1 = clamp(k * 2), k2 = clamp(k * 2 - 1);
  ctx.moveTo(...p1); ctx.lineTo(lerp(p1[0], p2[0], k1), lerp(p1[1], p2[1], k1));
  if (k2 > 0) ctx.lineTo(lerp(p2[0], p3[0], k2), lerp(p2[1], p3[1], k2));
  ctx.stroke(); ctx.restore();
}

// ---------- logo ----------
function logo(ctx, x, y, s, k = 1) {
  // matches the site's header mark: ISP line, demarc bar, three branches to devices
  ctx.save(); ctx.translate(x, y); ctx.scale(s / 34, s / 34); ctx.lineCap = 'round';
  const a = prog(k, 0, 0.25), b = prog(k, 0.2, 0.45), c = prog(k, 0.4, 0.75), d = prog(k, 0.65, 1);
  if (a > 0) line(ctx, 2, 17, 2 + 11 * eio(a), 17, '#8FB3C4', 2.4);
  if (b > 0) line(ctx, 14, 17 - 11 * eio(b), 14, 17 + 11 * eio(b), C.teal, 3);
  if (c > 0) {
    const e = eio(c);
    line(ctx, 15, 17, 15 + 9 * e, 17 - 10 * e, '#ffffff', 2);
    line(ctx, 15, 17, 15 + 11 * e, 17, '#ffffff', 2);
    line(ctx, 15, 17, 15 + 9 * e, 17 + 10 * e, '#ffffff', 2);
  }
  if (d > 0) [[25, 7], [28, 17], [25, 27]].forEach(([cx, cy]) => circle(ctx, cx, cy, 3 * eout(d), '#ffffff'));
  ctx.restore();
}

function wordmark(ctx, x, y, size, alpha = 1, align = 'center') {
  const a = 'After the ', b = 'Demark';
  const wa = measure(ctx, a, size, 500), wb = measure(ctx, b, size, 800);
  let sx = align === 'center' ? x - (wa + wb) / 2 : x;
  text(ctx, a, sx, y, { size, weight: 500, align: 'left', alpha });
  text(ctx, b, sx + wa, y, { size, weight: 800, align: 'left', color: C.teal, alpha });
}

// ---------- characters & props ----------
function modem(ctx, x, y, t, ledOn) {
  // x,y = bottom-center. 120 wide x 230 tall
  ctx.save(); ctx.translate(x, y);
  fillRR(ctx, -62, -232, 124, 232, 18, '#e5e7eb');
  fillRR(ctx, -62, -232, 124, 232, 18, null, '#9ca3af', 3);
  // vents
  for (let i = 0; i < 6; i++) line(ctx, -30, -200 + i * 12, 30, -200 + i * 12, '#cbd5e1', 4);
  // LEDs
  const labels = ['PWR', 'DS', 'US', 'ON'];
  labels.forEach((l, i) => {
    const on = ledOn[i];
    const ly = -110 + i * 24;
    if (on > 0) glow(ctx, -24, ly, 26, C.green, 0.6 * on);
    circle(ctx, -24, ly, 6, on > 0 ? `rgba(34,197,94,${0.35 + 0.65 * on})` : '#9ca3af');
    text(ctx, l, -8, ly + 1, { size: 15, weight: 700, color: '#6b7280', align: 'left' });
  });
  // coax port (left side)
  fillRR(ctx, -74, -40, 14, 22, 3, '#b8860b');
  ctx.restore();
}
function cableFromWall(ctx, wx, wy, ex, ey, sag = 60) {
  ctx.save(); ctx.beginPath(); ctx.moveTo(wx, wy);
  ctx.bezierCurveTo(wx, wy + sag + 80, ex - 120, ey + sag, ex, ey);
  ctx.strokeStyle = '#111'; ctx.lineWidth = 11; ctx.lineCap = 'round'; ctx.stroke();
  ctx.strokeStyle = '#2b2b2b'; ctx.lineWidth = 7; ctx.stroke();
  ctx.restore();
}
function technician(ctx, x, y, pose) {
  // x,y = feet center. pose: {walk, reach, twist, thumb, face(1 right/-1 left)}
  const { walk = 0, reach = 0, twist = 0, thumb = 0, face = 1, talk = 0, target = null } = pose;
  ctx.save(); ctx.translate(x, y); ctx.scale(face, 1);
  const sw = Math.sin(walk * Math.PI * 2);
  const bob = Math.abs(Math.cos(walk * Math.PI * 2)) * 6;
  ctx.translate(0, -bob);
  // legs
  const leg = (ang, col) => {
    ctx.save(); ctx.translate(0, -230); ctx.rotate(ang);
    fillRR(ctx, -20, 0, 40, 220, 16, col);
    fillRR(ctx, -24, 205, 58, 26, 10, '#1f2937');
    ctx.restore();
  };
  leg(-sw * 0.38, '#253247');
  leg(sw * 0.38, '#2e3d55');
  // back arm (swing)
  ctx.save(); ctx.translate(-10, -430); ctx.rotate(sw * 0.4 + 0.08);
  fillRR(ctx, -17, 0, 34, 160, 16, '#0f6e63'); circle(ctx, 0, 165, 17, '#c68a62'); ctx.restore();
  // torso (polo)
  fillRR(ctx, -58, -470, 116, 260, 36, '#0891b2');
  fillRR(ctx, -58, -255, 116, 40, 10, '#3f2d1d'); // tool belt
  fillRR(ctx, 22, -258, 36, 52, 6, '#57412b');
  fillRR(ctx, -20, -470, 40, 40, 10, '#06b6d4');
  // badge
  fillRR(ctx, 14, -420, 34, 22, 4, '#e2e8f0');
  text(ctx, 'ISP', 31, -409, { size: 13, weight: 800, color: '#0f6e63' });
  // head
  circle(ctx, 0, -520, 52, '#d6a07a');
  // cap
  ctx.beginPath(); ctx.arc(0, -528, 54, Math.PI, 0); ctx.fillStyle = '#155e75'; ctx.fill();
  fillRR(ctx, 10, -540, 72, 16, 8, '#155e75');
  // face
  circle(ctx, 24, -515, 5.5, '#1f2937');
  ctx.beginPath();
  if (talk > 0) { ctx.ellipse(28, -492, 10, 4 + 6 * talk, 0, 0, Math.PI * 2); ctx.fillStyle = '#5b2a1f'; ctx.fill(); }
  else { ctx.arc(26, -497, 12, 0.2, Math.PI - 0.6); ctx.strokeStyle = '#5b2a1f'; ctx.lineWidth = 4; ctx.stroke(); }
  // front arm: reach toward modem, or thumbs-up
  ctx.save(); ctx.translate(14, -430);
  // two-bone IK toward target (world coords) when reaching
  let ikU = -1.25, ikF = 0.5;
  if (target) {
    const lx = (target[0] - x) / face - 14, ly = target[1] - y + bob + 430;
    const L1 = 88, L2 = 86, d = Math.min(Math.hypot(lx, ly), L1 + L2 - 1);
    const th = Math.atan2(-lx, ly);
    const a1 = Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
    const a2 = Math.acos(clamp((L1 * L1 + L2 * L2 - d * d) / (2 * L1 * L2), -1, 1));
    ikU = th - a1; ikF = Math.PI - a2;
  }
  const upperA = lerp(sw * -0.4 - 0.05, ikU, reach) + lerp(0, -2.2, thumb) * (1 - reach);
  ctx.rotate(upperA);
  fillRR(ctx, -17, 0, 34, 92, 16, '#0891b2');
  ctx.translate(0, 88);
  ctx.rotate(lerp(0, ikF, reach) + lerp(0, -1.0, thumb) + Math.sin(twist * Math.PI * 6) * 0.1 * reach);
  fillRR(ctx, -15, 0, 30, 80, 14, '#c68a62');
  circle(ctx, 0, 86, 18, '#c68a62');
  if (thumb > 0.5) fillRR(ctx, -6, 64, 12, 34, 6, '#b97a52');
  ctx.restore();
  ctx.restore();
}
function plant(ctx, x, y) {
  fillRR(ctx, x - 40, y - 80, 80, 80, 10, '#7c4a2d');
  ctx.save(); ctx.fillStyle = '#166534';
  for (let i = -2; i <= 2; i++) {
    ctx.save(); ctx.translate(x, y - 80); ctx.rotate(i * 0.35);
    ctx.beginPath(); ctx.ellipse(0, -70, 22, 70, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }
  ctx.restore();
}

// ---------- Scene A: install room ----------
const ROOM = { wallPlate: [420, 780], table: [800, 650], modem: [800, 650], door: [1520, 880] };
const PORT = [ROOM.modem[0] - 67, ROOM.modem[1] - 20 - 29];
function drawRoom(ctx, t, opts = {}) {
  const { doorOpen = 1, ledOn = [0, 0, 0, 0], cableEnd = null, connected = false } = opts;
  // wall
  const g = ctx.createLinearGradient(0, 0, 0, 880);
  g.addColorStop(0, '#22324a'); g.addColorStop(1, '#1a273b');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, 880);
  // wainscot
  ctx.fillStyle = '#18233a'; ctx.fillRect(0, 700, W, 180);
  line(ctx, 0, 700, W, 700, '#2a3a55', 6);
  // floor
  const fg = ctx.createLinearGradient(0, 880, 0, H);
  fg.addColorStop(0, '#3b2a1e'); fg.addColorStop(1, '#22180f');
  ctx.fillStyle = fg; ctx.fillRect(0, 880, W, 200);
  for (let i = 0; i < 12; i++) line(ctx, i * 180 - 40, 880, i * 180 - 160, H, 'rgba(0,0,0,0.25)', 3);
  ctx.fillStyle = '#2a1d13'; ctx.fillRect(0, 872, W, 14);
  // window
  fillRR(ctx, 120, 200, 300, 340, 8, '#0b1626', '#31445f', 14);
  const sky = ctx.createLinearGradient(0, 200, 0, 540); sky.addColorStop(0, '#1e3a5f'); sky.addColorStop(1, '#f59e0b33');
  ctx.fillStyle = sky; ctx.fillRect(127, 207, 286, 326);
  line(ctx, 270, 207, 270, 533, '#31445f', 10); line(ctx, 127, 370, 413, 370, '#31445f', 10);
  // frame picture
  fillRR(ctx, 1000, 260, 220, 160, 6, '#0f172a', '#6b4f36', 10);
  ctx.beginPath(); ctx.moveTo(1010, 410); ctx.lineTo(1080, 320); ctx.lineTo(1130, 380); ctx.lineTo(1160, 345); ctx.lineTo(1210, 410);
  ctx.fillStyle = '#0f6e63'; ctx.fill();
  // door
  const [dx, dy] = ROOM.door;
  fillRR(ctx, dx - 10, dy - 560, 300, 570, 4, '#0a0f1a');
  const sky2 = ctx.createLinearGradient(0, dy - 550, 0, dy);
  sky2.addColorStop(0, '#7dd3fc'); sky2.addColorStop(1, '#e0f2fe');
  ctx.fillStyle = sky2; ctx.fillRect(dx, dy - 550, 280, 550);
  ctx.fillStyle = '#4d7c0f'; ctx.fillRect(dx, dy - 150, 280, 150);
  ctx.fillStyle = '#65a30d'; ctx.beginPath(); ctx.ellipse(dx + 60, dy - 150, 120, 50, 0, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#a8a29e'; ctx.beginPath(); ctx.moveTo(dx + 110, dy); ctx.lineTo(dx + 170, dy); ctx.lineTo(dx + 150, dy - 150); ctx.lineTo(dx + 135, dy - 150); ctx.fill();
  // door slab (hinged on left; doorOpen 0 closed .. 1 open)
  const dw = 280 * (1 - doorOpen * 0.82);
  ctx.fillStyle = '#5b3b24'; ctx.fillRect(dx, dy - 550, dw, 550);
  ctx.strokeStyle = '#3d2716'; ctx.lineWidth = 4; ctx.strokeRect(dx + dw * 0.12, dy - 520, dw * 0.76, 220); ctx.strokeRect(dx + dw * 0.12, dy - 270, dw * 0.76, 230);
  circle(ctx, dx + dw - 26 * (dw / 280), dy - 280, 9, '#d4a017');
  fillRR(ctx, dx - 22, dy - 572, 324, 26, 4, '#e5e7eb'); fillRR(ctx, dx - 22, dy - 572, 22, 572, 2, '#e5e7eb'); fillRR(ctx, dx + 280, dy - 572, 22, 572, 2, '#e5e7eb');
  // wall plate
  const [px, py] = ROOM.wallPlate;
  fillRR(ctx, px - 30, py - 48, 60, 96, 8, '#f1f5f9', '#cbd5e1', 2);
  circle(ctx, px, py, 11, '#b8860b');
  // table
  const [tx, ty] = ROOM.table;
  fillRR(ctx, tx - 200, ty - 20, 400, 30, 6, '#6b4f36');
  fillRR(ctx, tx - 180, ty + 10, 20, 230, 4, '#4a3624'); fillRR(ctx, tx + 160, ty + 10, 20, 230, 4, '#4a3624');
  fillRR(ctx, tx - 170, ty + 150, 340, 14, 3, '#4a3624');
  plant(ctx, tx + 130, ty - 20);
  // cable
  const [portX, portY] = PORT;
  if (connected) cableFromWall(ctx, px, py, portX, portY, 120);
  else if (cableEnd) cableFromWall(ctx, px, py, cableEnd[0], cableEnd[1], 120);
  modem(ctx, ROOM.modem[0], ROOM.modem[1] - 20, t, ledOn);
  if (connected) fillRR(ctx, portX - 22, portY - 9, 22, 18, 4, '#9ca3af');
}

function sceneInstall(ctx, t) {
  // LEDs
  const led = [prog(t, 3.9, 4.1), 0, 0, 0];
  led[1] = t > 4.2 ? (t < 4.6 ? (Math.sin(t * 40) > 0 ? 1 : 0.2) : 1) : 0;
  led[2] = t > 4.5 ? (t < 4.9 ? (Math.sin(t * 40) > 0 ? 1 : 0.2) : 1) : 0;
  led[3] = prog(t, 4.9, 5.1);
  // camera: slow push-in at start, ease out after
  const cam = lerp(1.08, 1.0, eio(prog(t, 0, 4)));
  const doorOpen = 1 - eio(prog(t, 9.6, 10.3));
  ctx.save();
  ctx.translate(W / 2, H / 2); ctx.scale(cam, cam); ctx.translate(-W / 2, -H / 2);
  // cable end follows tech's hand until connected
  const connected = t > 2.4;
  const handStart = [680, 690], port = PORT;
  const ce = connected ? port : [lerp(handStart[0], port[0], eio(prog(t, 0.6, 2.4))), lerp(handStart[1], port[1], eio(prog(t, 0.6, 2.4)))];
  drawRoom(ctx, t, { doorOpen, ledOn: led, cableEnd: ce, connected });
  // technician: at modem 0–5.2, turns to camera, then walks to door 7.6–9.6
  const walkK = eio(prog(t, 8.0, 9.7));
  let tx = lerp(610, 1665, walkK);
  const reach = 1 - eio(prog(t, 4.2, 4.9));
  const thumb = eout(prog(t, 5.1, 5.6)) * (1 - prog(t, 7.6, 8.0));
  const talk = t > 5.0 && t < 8.25 ? Math.abs(Math.sin(t * 13)) : 0;
  const walk = t > 8.0 ? (t - 8.0) * 1.6 : 0;
  ctx.save();
  // he steps out through the doorway (away from camera) before the door shuts
  const out = eio(prog(t, 9.2, 9.75));
  ctx.globalAlpha = 1 - out;
  ctx.translate(tx, 900); ctx.scale(1 - 0.12 * out, 1 - 0.12 * out); ctx.translate(-tx, -900);
  technician(ctx, tx, 900, { reach, twist: prog(t, 2.4, 3.8), thumb, talk, walk, target: [ce[0] - 18, ce[1] + 2] });
  ctx.restore();
  ctx.restore();
  // speech bubble
  const bA = prog(t, 5.0, 5.3) * (1 - prog(t, 8.3, 8.7));
  if (bA > 0) {
    ctx.save(); ctx.globalAlpha = bA;
    const bx = 760, by = 210, s = lerp(0.85, 1, back(prog(t, 5.0, 5.4)));
    ctx.translate(bx, by); ctx.scale(s, s);
    fillRR(ctx, -260, -70, 520, 140, 40, '#f8fafc');
    ctx.beginPath(); ctx.moveTo(-170, 60); ctx.lineTo(-230, 140); ctx.lineTo(-110, 66); ctx.fillStyle = '#f8fafc'; ctx.fill();
    text(ctx, '“All done here!”', 0, 2, { size: 58, weight: 700, color: '#0b1220' });
    ctx.restore();
  }
}

function sceneDemarc(ctx, t) {
  // t: global time; starts ~10.4. Zoom into the modem, dim room, drop the demarc line.
  const z = eio(prog(t, 10.6, 13.0));
  const cam = lerp(1.0, 2.1, z);
  const fx = lerp(W / 2, 760, z), fy = lerp(H / 2, 600, z);
  ctx.save();
  ctx.translate(W / 2, H / 2); ctx.scale(cam, cam); ctx.translate(-fx, -fy);
  drawRoom(ctx, t, { doorOpen: 0, ledOn: [1, 1, 1, 1], connected: true });
  ctx.restore();
  // dim
  ctx.fillStyle = `rgba(5,9,18,${0.15 + 0.45 * prog(t, 11, 13)})`; ctx.fillRect(0, 0, W, H);
  vignette(ctx, 0.7);
  // demarc line at coax port position (after zoom: port ~ x=?)
  const sx = (PORT[0] - 760) * 2.1 + W / 2 - 18;
  const k = eio(prog(t, 13.4, 14.4));
  if (k > 0) {
    ctx.save();
    ctx.shadowColor = C.teal; ctx.shadowBlur = 24;
    line(ctx, sx, 0, sx, H * k, C.teal, 6, [26, 18]);
    ctx.restore();
    // left shading (ISP side)
    const la = prog(t, 14.2, 15.0);
    ctx.fillStyle = `rgba(0,0,0,${0.35 * la})`; ctx.fillRect(0, 0, sx, H);
    text(ctx, 'YOUR ISP', sx - 60, 150, { size: 34, weight: 700, color: C.dim, align: 'right', alpha: la, spacing: 6 });
    text(ctx, 'Responsible up to here', sx - 60, 200, { size: 30, weight: 500, color: C.dim, align: 'right', alpha: la });
    const ra = prog(t, 15.0, 15.8);
    text(ctx, 'EVERYTHING AFTER', sx + 60, 150, { size: 34, weight: 700, color: C.tealHi, align: 'left', alpha: ra, spacing: 6 });
    text(ctx, 'Wi-Fi, coverage, devices, security…', sx + 60, 200, { size: 30, weight: 500, color: C.muted, align: 'left', alpha: ra });
    text(ctx, '…is on you.', sx + 60, 250, { size: 30, weight: 700, color: C.text, align: 'left', alpha: prog(t, 15.8, 16.4) });
    // pin label
    const pa = back(prog(t, 14.0, 14.6));
    if (pa > 0) {
      ctx.save(); ctx.translate(sx, 860); ctx.scale(pa, pa);
      fillRR(ctx, -225, -48, 450, 96, 48, C.teal);
      text(ctx, 'THE DEMARC', 0, 2, { size: 46, weight: 800, color: '#0b1220', spacing: 4 });
      ctx.restore();
    }
  }
}

// ---------- House cutaway (scenes C & F) ----------
const HOUSE = { x: 360, y: 150, w: 1200, h: 800 };
const ROOMS = {
  bedroom: { x: 400, y: 250, w: 560, h: 320, label: 'Bedroom' },
  attic: { x: 980, y: 250, w: 540, h: 320, label: 'Kids’ Room' },
  living: { x: 400, y: 590, w: 560, h: 340, label: 'Living Room' },
  office: { x: 980, y: 590, w: 540, h: 340, label: 'Office' },
};
function house(ctx) {
  const { x, y, w, h } = HOUSE;
  // roof
  ctx.beginPath(); ctx.moveTo(x - 60, y + 100); ctx.lineTo(x + w / 2, y - 120); ctx.lineTo(x + w + 60, y + 100); ctx.closePath();
  ctx.fillStyle = '#1e293b'; ctx.fill(); ctx.strokeStyle = '#475569'; ctx.lineWidth = 6; ctx.stroke();
  fillRR(ctx, x, y + 80, w, h - 80, 6, '#0f1a2c', '#475569', 6);
  for (const r of Object.values(ROOMS)) fillRR(ctx, r.x, r.y, r.w, r.h, 10, '#16233a');
  // furniture
  // bed
  const b = ROOMS.bedroom; fillRR(ctx, b.x + 60, b.y + 200, 260, 90, 12, '#334155'); fillRR(ctx, b.x + 60, b.y + 180, 70, 40, 10, '#cbd5e1');
  fillRR(ctx, b.x + 40, b.y + 160, 24, 130, 6, '#475569');
  // kids room desk + tablet
  const a = ROOMS.attic; fillRR(ctx, a.x + 300, a.y + 240, 180, 16, 4, '#6b4f36'); fillRR(ctx, a.x + 350, a.y + 200, 80, 44, 6, '#0f172a', '#64748b', 3);
  fillRR(ctx, a.x + 70, a.y + 210, 160, 80, 14, '#7c3aed55');
  // living: sofa + TV + router on shelf
  const l = ROOMS.living; fillRR(ctx, l.x + 230, l.y + 230, 270, 80, 18, '#334155'); fillRR(ctx, l.x + 230, l.y + 200, 270, 50, 14, '#3f4f68');
  fillRR(ctx, l.x + 260, l.y + 50, 220, 120, 8, '#020617', '#475569', 4);
  fillRR(ctx, l.x + 50, l.y + 260, 120, 18, 4, '#6b4f36');
  // office desk + laptop
  const o = ROOMS.office; fillRR(ctx, o.x + 200, o.y + 220, 280, 18, 4, '#6b4f36'); fillRR(ctx, o.x + 220, o.y + 238, 14, 90, 3, '#4a3624'); fillRR(ctx, o.x + 450, o.y + 238, 14, 90, 3, '#4a3624');
  fillRR(ctx, o.x + 260, o.y + 120, 200, 104, 8, '#0f172a', '#64748b', 4);
  // exterior camera
  fillRR(ctx, x + w + 20, y + 300, 70, 34, 10, '#e2e8f0'); fillRR(ctx, x + w + 4, y + 304, 22, 26, 6, '#94a3b8');
  circle(ctx, x + w + 84, y + 317, 8, '#0f172a');
  for (const r of Object.values(ROOMS)) text(ctx, r.label.toUpperCase(), r.x + 24, r.y + 34, { size: 22, weight: 700, color: C.dim, align: 'left', spacing: 3 });
}
const ROUTER = [ROOMS.living.x + 110, ROOMS.living.y + 245];
function router(ctx, x, y, good) {
  fillRR(ctx, x - 44, y - 30, 88, 30, 8, good ? '#e2e8f0' : '#cbd5e1');
  line(ctx, x - 26, y - 30, x - 34, y - 70, '#94a3b8', 5); line(ctx, x + 26, y - 30, x + 34, y - 70, '#94a3b8', 5);
  circle(ctx, x - 18, y - 15, 4, C.green); circle(ctx, x, y - 15, 4, C.green);
}
function ap(ctx, x, y, k) {
  ctx.save(); ctx.translate(x, y); ctx.scale(back(k), back(k));
  circle(ctx, 0, 0, 28, '#f8fafc', '#cbd5e1', 3); circle(ctx, 0, 0, 8, C.teal);
  ctx.restore();
}
function rings(ctx, x, y, t, reach, color, alpha = 1) {
  for (let i = 0; i < 5; i++) {
    const ph = ((t * 0.55 + i / 5) % 1);
    const r = ph * reach;
    ctx.save(); ctx.globalAlpha = alpha * (1 - ph) * 0.55;
    circle(ctx, x, y, r, null, color, 4);
    ctx.restore();
  }
}
function badge(ctx, x, y, label, value, good, k, flicker = false) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); const s = back(clamp(k)); ctx.scale(s, s);
  const col = good ? C.greenDk : C.redDk, edge = good ? C.green : C.red;
  fillRR(ctx, -130, -44, 260, 88, 18, col, edge, 3);
  text(ctx, value, 0, -8, { size: 40, weight: 800, color: '#fff', alpha: flicker ? 0.4 + 0.6 * Math.abs(Math.sin(Date.now())) : 1 });
  text(ctx, label, 0, 28, { size: 20, weight: 600, color: good ? '#bbf7d0' : '#fecaca' });
  ctx.restore();
}
function spinner(ctx, x, y, t, r = 22) {
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * Math.PI * 2 + t * 6;
    ctx.save(); ctx.globalAlpha = (i + 1) / 8;
    circle(ctx, x + Math.cos(a) * r, y + Math.sin(a) * r, 5, '#e2e8f0'); ctx.restore();
  }
}
function planHeader(ctx, t, label, sub, a, color = C.teal) {
  text(ctx, label, W / 2, 70, { size: 54, weight: 800, alpha: a });
  if (sub) text(ctx, sub, W / 2, 128, { size: 30, weight: 500, color, alpha: a });
}

function ground(ctx) {
  // matches house y+h after the 0.86 scene scale
  const gy = H / 2 + 40 + (HOUSE.y + HOUSE.h - H / 2 - 20) * 0.86;
  ctx.fillStyle = '#0a1a12'; ctx.fillRect(0, gy, W, H - gy);
  line(ctx, 0, gy, W, gy, '#14532d', 5);
}
function sceneProblem(ctx, t) {
  bgGrad(ctx); ground(ctx);
  const lt = t - 17.4;
  ctx.save();
  const cam = lerp(1.06, 1.0, eout(prog(lt, 0, 1.2)));
  ctx.translate(W / 2, H / 2 + 40); ctx.scale(cam * 0.86, cam * 0.86); ctx.translate(-W / 2, -H / 2 + 20);
  house(ctx);
  router(ctx, ...ROUTER, false);
  // weak coverage: rings that die off
  rings(ctx, ROUTER[0], ROUTER[1] - 40, t, 520, C.amber, 0.9);
  // office laptop buffering
  const o = ROOMS.office;
  if (t > 21.6) spinner(ctx, o.x + 360, o.y + 172, t);
  // camera lost
  if (t > 23.8) {
    const blink = Math.sin(t * 9) > 0;
    if (blink) { circle(ctx, HOUSE.x + HOUSE.w + 84, HOUSE.y + 317, 10, C.red); glow(ctx, HOUSE.x + HOUSE.w + 84, HOUSE.y + 317, 40, C.red, 0.8); }
  }
  // badges
  const L = ROOMS.living, B = ROOMS.bedroom, A = ROOMS.attic;
  badge(ctx, L.x + 420, L.y + 60, 'Living Room', '470 Mbps', true, prog(t, 19.4, 19.8));
  badge(ctx, B.x + 420, B.y + 90, 'Bedroom', '40 Mbps', false, prog(t, 20.4, 20.8));
  badge(ctx, A.x + 170, A.y + 90, 'Kids’ Room', '22 Mbps', false, prog(t, 20.9, 21.3));
  badge(ctx, o.x + 400, o.y + 70, 'Office', '75 Mbps', false, prog(t, 21.8, 22.2));
  if (t > 24.0) {
    const k = prog(t, 24.0, 24.4);
    ctx.save(); ctx.translate(HOUSE.x + HOUSE.w + 60, HOUSE.y + 200); ctx.scale(back(k), back(k));
    fillRR(ctx, -130, -36, 260, 72, 16, C.redDk, C.red, 3);
    text(ctx, 'Camera offline', 0, 2, { size: 28, weight: 700, color: '#fff' });
    ctx.restore();
  }
  ctx.restore();
  // header
  const ha = prog(lt, 0.3, 0.9);
  fillRR(ctx, W / 2 - 330, 34, 660, 90, 45, 'rgba(15,23,42,0.85)', C.border, 2);
  ctx.save(); ctx.globalAlpha = ha;
  text(ctx, 'You pay for', W / 2 - 110, 80, { size: 40, weight: 500, color: C.muted });
  text(ctx, '500 Mbps', W / 2 + 150, 80, { size: 46, weight: 800, color: C.teal });
  ctx.restore();
}

function bill(ctx, x, y, item, price, k) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(lerp(x + 600, x, eout(k)), y); ctx.rotate(lerp(0.2, -0.02, eout(k))); ctx.globalAlpha = clamp(k * 2);
  fillRR(ctx, -300, -64, 600, 128, 14, '#f8fafc');
  fillRR(ctx, -300, -64, 14, 128, 6, C.red);
  text(ctx, item, -256, -16, { size: 32, weight: 700, color: '#0f172a', align: 'left' });
  text(ctx, 'Billed monthly · forever', -256, 26, { size: 22, weight: 500, color: '#64748b', align: 'left' });
  text(ctx, price, 270, 0, { size: 38, weight: 800, color: C.red, align: 'right' });
  ctx.restore();
}
function sceneUpsell(ctx, t) {
  bgGrad(ctx, '#140d16', '#07060c');
  const lt = t - 26.6;
  text(ctx, 'The ISP fix?', 520, 150, { size: 64, weight: 800, alpha: prog(lt, 0.2, 0.7) });
  text(ctx, 'Rent another box.', 520, 225, { size: 44, weight: 500, color: '#fca5a5', alpha: prog(lt, 0.9, 1.4) });
  bill(ctx, 520, 430, 'Mesh Wi-Fi rental', '+$15/mo', prog(t, 28.0, 28.6));
  bill(ctx, 540, 600, 'Extra mesh pod', '+$5/mo', prog(t, 28.9, 29.5));
  const ta = prog(t, 30.0, 30.5);
  if (ta > 0) {
    const yr = Math.round(lerp(0, 240, eout(prog(t, 30.0, 31.2))));
    text(ctx, `$${yr} every year`, 520, 790, { size: 72, weight: 800, color: C.red, alpha: ta });
    text(ctx, 'and you still don’t own anything', 520, 860, { size: 30, weight: 500, color: C.dim, alpha: ta });
  }
  // device list panel
  const pa = prog(t, 30.6, 31.2);
  if (pa > 0) {
    ctx.save(); ctx.globalAlpha = pa; ctx.translate(lerp(60, 0, eout(pa)), 0);
    fillRR(ctx, 1080, 200, 700, 700, 24, '#0f172a', C.border, 3);
    text(ctx, 'What’s on your network?', 1130, 260, { size: 36, weight: 700, align: 'left' });
    const rows = ['Unknown device', 'Unknown device', 'android-7f3a2c', 'Unknown device', 'ESP_9C21B0', 'Unknown device', 'Unknown device'];
    rows.forEach((r, i) => {
      const ra = prog(t, 31.0 + i * 0.18, 31.3 + i * 0.18);
      const ry = 330 + i * 76;
      ctx.save(); ctx.globalAlpha *= ra;
      fillRR(ctx, 1120, ry, 620, 60, 12, '#1e293b');
      circle(ctx, 1154, ry + 30, 16, '#334155');
      text(ctx, '?', 1154, ry + 31, { size: 24, weight: 800, color: C.amber });
      text(ctx, r, 1186, ry + 31, { size: 28, weight: 600, color: C.muted, align: 'left' });
      ctx.restore();
    });
    ctx.restore();
  }
  vignette(ctx, 0.5);
}

function sceneReveal(ctx, t) {
  ctx.fillStyle = '#04070e'; ctx.fillRect(0, 0, W, H);
  // teal line sweeps across (33.0 – 34.6)
  const lk = eio(prog(t, 33.0, 34.4));
  const ly = H / 2;
  if (lk > 0 && t < 35.4) {
    const a = 1 - prog(t, 34.9, 35.4);
    ctx.save(); ctx.globalAlpha = a; ctx.shadowColor = C.teal; ctx.shadowBlur = 30;
    line(ctx, 0, ly, W * lk, ly, C.teal, 6); ctx.restore();
    glow(ctx, W * lk, ly, 120, C.teal, 0.7 * a);
  }
  text(ctx, 'That’s where we come in.', W / 2, ly - 70, { size: 52, weight: 600, alpha: prog(t, 33.2, 33.7) * (1 - prog(t, 34.6, 35.0)) });
  // logo reveal (34.9 – 38.4)
  const k = prog(t, 34.9, 36.3);
  if (k > 0) {
    glow(ctx, W / 2, ly - 20, 700, '#0f6e63', 0.35 * k);
    logo(ctx, W / 2 - 110, ly - 260, 220, k);
    const wa = prog(t, 35.9, 36.6);
    ctx.save(); ctx.translate(0, lerp(20, 0, eout(wa)));
    wordmark(ctx, W / 2, ly + 60, 104, wa);
    ctx.restore();
    text(ctx, 'We start where your ISP stops.', W / 2, ly + 170, { size: 42, weight: 500, color: C.muted, alpha: prog(t, 36.8, 37.4) });
    text(ctx, 'HOME NETWORKING SPECIALISTS', W / 2, ly + 240, { size: 24, weight: 700, color: C.teal, alpha: prog(t, 37.2, 37.8), spacing: 8 });
  }
}

function sceneFix(ctx, t) {
  bgGrad(ctx); ground(ctx);
  ctx.save();
  ctx.translate(W / 2, H / 2 + 40); ctx.scale(0.86, 0.86); ctx.translate(-W / 2, -H / 2 + 20);
  house(ctx);
  router(ctx, ...ROUTER, true);
  // scan sweep (39.2 – 41.6)
  const sk = prog(t, 39.2, 41.6);
  if (sk > 0 && sk < 1) {
    const sx = lerp(HOUSE.x - 60, HOUSE.x + HOUSE.w + 60, sk);
    ctx.save(); ctx.shadowColor = C.teal; ctx.shadowBlur = 30; line(ctx, sx, HOUSE.y - 130, sx, HOUSE.y + HOUSE.h, C.teal, 5); ctx.restore();
    const g = ctx.createLinearGradient(sx - 200, 0, sx, 0); g.addColorStop(0, 'rgba(0,180,216,0)'); g.addColorStop(1, 'rgba(0,180,216,0.18)');
    ctx.fillStyle = g; ctx.fillRect(sx - 200, HOUSE.y - 130, 200, HOUSE.h + 130);
  }
  // APs placed
  const B = ROOMS.bedroom, A = ROOMS.attic, o = ROOMS.office, L = ROOMS.living;
  const ap1 = [B.x + B.w - 40, B.y + 70], ap2 = [o.x + o.w - 60, o.y + 70];
  const k1 = prog(t, 41.8, 42.3), k2 = prog(t, 42.2, 42.7);
  const good = prog(t, 42.8, 43.4);
  rings(ctx, ROUTER[0], ROUTER[1] - 40, t, 420, C.teal, 0.8);
  if (k1 > 0) { ap(ctx, ...ap1, k1); rings(ctx, ap1[0], ap1[1], t + 0.3, 440 * good, C.teal, good); }
  if (k2 > 0) { ap(ctx, ...ap2, k2); rings(ctx, ap2[0], ap2[1], t + 0.6, 440 * good, C.teal, good); }
  // badges count up
  const cu = eout(prog(t, 43.0, 44.6));
  const n = (a, b) => `${Math.round(lerp(a, b, cu))} Mbps`;
  const isGood = t > 43.0;
  badge(ctx, L.x + 420, L.y + 60, 'Living Room', isGood ? n(470, 460) : '470 Mbps', true, 1);
  badge(ctx, B.x + 300, B.y + 110, 'Bedroom', isGood ? n(40, 410) : '40 Mbps', isGood, 1);
  badge(ctx, A.x + 170, A.y + 90, 'Kids’ Room', isGood ? n(22, 395) : '22 Mbps', isGood, 1);
  badge(ctx, o.x + 400, o.y + 70, 'Office', isGood ? n(75, 430) : '75 Mbps', isGood, 1);
  // camera ok
  if (t > 43.4) {
    const k = prog(t, 43.4, 43.8);
    circle(ctx, HOUSE.x + HOUSE.w + 84, HOUSE.y + 317, 10, C.green); glow(ctx, HOUSE.x + HOUSE.w + 84, HOUSE.y + 317, 40, C.green, 0.8);
    ctx.save(); ctx.translate(HOUSE.x + HOUSE.w + 60, HOUSE.y + 200); ctx.scale(back(k), back(k));
    fillRR(ctx, -130, -36, 260, 72, 16, C.greenDk, C.green, 3);
    text(ctx, 'Camera stable', 0, 2, { size: 28, weight: 700, color: '#fff' });
    ctx.restore();
  }
  ctx.restore();
  // header + chips
  fillRR(ctx, W / 2 - 360, 34, 720, 90, 45, 'rgba(15,23,42,0.85)', C.border, 2);
  const hdr = t < 41.8 ? 'Testing from the demarc forward…' : 'A network you own';
  text(ctx, hdr, W / 2, 80, { size: 40, weight: 700, color: t < 41.8 ? C.tealHi : C.text });
  const chips = [['Strong in every room', 44.6], ['No rental fees', 45.6], ['You own it', 46.3]];
  chips.forEach(([c, s], i) => {
    const k = prog(t, s, s + 0.4);
    if (k <= 0) return;
    const cx = 1700, cy = 610 + i * 100;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(back(k), back(k));
    fillRR(ctx, -200, -40, 400, 80, 40, 'rgba(6,95,70,0.9)', C.green, 2);
    check(ctx, -158, 0, 36, '#bbf7d0', 1);
    text(ctx, c, -120, 2, { size: 28, weight: 700, color: '#fff', align: 'left' });
    ctx.restore();
  });
}

// smart home icons
function iconBulb(ctx, x, y, on) {
  if (on) glow(ctx, x, y - 10, 120, '#fde047', 0.55 * on);
  circle(ctx, x, y - 14, 42, on ? `rgba(253,224,71,${0.4 + 0.6 * on})` : '#475569');
  fillRR(ctx, x - 20, y + 24, 40, 28, 6, '#94a3b8');
}
function iconLock(ctx, x, y, on) {
  ctx.save(); ctx.beginPath(); ctx.arc(x, y - 18, 30, Math.PI, 0); ctx.strokeStyle = '#94a3b8'; ctx.lineWidth = 12; ctx.stroke(); ctx.restore();
  fillRR(ctx, x - 48, y - 18, 96, 74, 12, on ? C.teal : '#475569');
  circle(ctx, x, y + 14, 9, '#0b1220');
}
function iconCam(ctx, x, y, on) {
  fillRR(ctx, x - 56, y - 30, 96, 60, 14, '#e2e8f0'); ctx.beginPath(); ctx.moveTo(x + 40, y - 14); ctx.lineTo(x + 64, y - 30); ctx.lineTo(x + 64, y + 30); ctx.lineTo(x + 40, y + 14); ctx.fillStyle = '#e2e8f0'; ctx.fill();
  circle(ctx, x - 8, y, 16, '#0f172a'); if (on) { circle(ctx, x + 28, y - 16, 6, C.red); glow(ctx, x + 28, y - 16, 22, C.red, 0.8 * on); }
}
function iconDrop(ctx, x, y, on) {
  ctx.beginPath(); ctx.moveTo(x, y - 54); ctx.bezierCurveTo(x + 50, y, x + 44, y + 46, x, y + 46); ctx.bezierCurveTo(x - 44, y + 46, x - 50, y, x, y - 54);
  ctx.fillStyle = on ? '#38bdf8' : '#475569'; ctx.fill();
}
function sceneAutomation(ctx, t) {
  bgGrad(ctx, '#0b1626', '#060b14');
  const lt = t - 47.4;
  text(ctx, 'Smart home that runs ', W / 2 - 90, 120, { size: 56, weight: 800, alpha: prog(lt, 0.2, 0.7), align: 'center' });
  text(ctx, 'locally', W / 2 + 320, 120, { size: 56, weight: 800, color: C.teal, alpha: prog(lt, 0.2, 0.7), align: 'center' });
  text(ctx, 'Powered by Home Assistant', W / 2, 185, { size: 30, weight: 500, color: C.dim, alpha: prog(lt, 0.6, 1.1) });
  const tiles = [
    ['Lights', 'Sunset scene on', iconBulb, 50.6], ['Locks', 'Front door locked', iconLock, 51.2],
    ['Cameras', 'Recording locally', iconCam, 51.8], ['Leak sensor', 'Alert: basement', iconDrop, 52.5],
  ];
  const down = prog(t, 54.0, 54.5);
  tiles.forEach(([name, status, ic, s], i) => {
    const k = prog(t, 48.4 + i * 0.25, 49.0 + i * 0.25);
    if (k <= 0) return;
    const x = 330 + i * 420, y = 560;
    ctx.save(); ctx.translate(x, lerp(y + 60, y, eout(k))); ctx.globalAlpha = k;
    const on = prog(t, s, s + 0.4);
    fillRR(ctx, -180, -220, 360, 400, 28, '#111c2f', on > 0 ? C.teal : C.border, on > 0 ? 3 : 2);
    ic(ctx, 0, -60, on);
    text(ctx, name, 0, 60, { size: 36, weight: 700 });
    text(ctx, on > 0 ? status : 'Idle', 0, 110, { size: 26, weight: 500, color: on > 0 ? C.tealHi : C.dim });
    ctx.restore();
  });
  // internet down banner
  if (down > 0) {
    ctx.save(); ctx.globalAlpha = down;
    fillRR(ctx, W / 2 - 360, 785, 720, 90, 45, 'rgba(127,29,29,0.9)', C.red, 2);
    // cloud with x
    const cx = W / 2 - 290, cy = 830;
    circle(ctx, cx - 14, cy + 6, 18, '#fecaca'); circle(ctx, cx + 8, cy - 4, 22, '#fecaca'); circle(ctx, cx + 28, cy + 8, 15, '#fecaca');
    line(ctx, cx - 4, cy - 6, cx + 20, cy + 18, C.redDk, 5); line(ctx, cx + 20, cy - 6, cx - 4, cy + 18, C.redDk, 5);
    text(ctx, 'Internet down — still working', W / 2 + 30, 832, { size: 34, weight: 700, color: '#fff' });
    ctx.restore();
  }
}

function sceneOffer(ctx, t) {
  bgGrad(ctx);
  const lt = t - 57.4;
  glow(ctx, W / 2, H / 2, 800, '#0f6e63', 0.25);
  const k = eout(prog(lt, 0.1, 0.8));
  ctx.save(); ctx.translate(0, lerp(40, 0, k)); ctx.globalAlpha = k;
  fillRR(ctx, W / 2 - 520, 130, 1040, 770, 32, '#111c2f', C.teal, 3);
  text(ctx, 'START HERE', W / 2, 220, { size: 26, weight: 700, color: C.teal, spacing: 8 });
  text(ctx, 'On-Site Network Diagnostic', W / 2, 290, { size: 60, weight: 800 });
  text(ctx, '$179 – $299', W / 2, 375, { size: 54, weight: 700, color: C.teal });
  ctx.restore();
  const items = [
    ['Assessment from the demarc forward', 58.6], ['Clear visuals of every room', 59.3], ['A written report you keep', 60.3],
    ['Credited toward install within 30 days', 61.2], ['No obligation to buy anything', 62.6],
  ];
  items.forEach(([s, st], i) => {
    const a = prog(t, st, st + 0.35);
    if (a <= 0) return;
    const y = 470 + i * 88;
    ctx.save(); ctx.globalAlpha = a; ctx.translate(lerp(-20, 0, eout(a)), 0);
    circle(ctx, W / 2 - 380, y, 26, 'rgba(34,197,94,0.15)', C.green, 2);
    check(ctx, W / 2 - 380, y, 30, C.green, prog(t, st, st + 0.5));
    text(ctx, s, W / 2 - 330, y + 1, { size: 36, weight: i === 4 ? 700 : 500, color: i === 4 ? '#fff' : C.muted, align: 'left' });
    ctx.restore();
  });
}

function sceneEnd(ctx, t) {
  ctx.fillStyle = '#04070e'; ctx.fillRect(0, 0, W, H);
  glow(ctx, W / 2, H / 2, 900, '#0f6e63', 0.3 * prog(t, 66.6, 68));
  const a1 = prog(t, 64.9, 65.4) * (1 - prog(t, 66.4, 66.8));
  const a2 = prog(t, 65.9, 66.3) * (1 - prog(t, 66.4, 66.8));
  text(ctx, 'Your ISP is done.', W / 2, H / 2 - 50, { size: 78, weight: 600, color: C.muted, alpha: a1 });
  text(ctx, 'We’re just getting started.', W / 2, H / 2 + 50, { size: 78, weight: 800, color: C.teal, alpha: a2 });
  // end card
  const e = prog(t, 66.7, 67.6);
  if (e > 0) {
    logo(ctx, W / 2 - 70, 170, 140, prog(t, 66.7, 67.9));
    ctx.save(); ctx.globalAlpha = e;
    wordmark(ctx, W / 2, 400, 88, 1);
    text(ctx, 'We start where your ISP stops.', W / 2, 490, { size: 38, weight: 500, color: C.muted });
    const b = back(prog(t, 67.6, 68.1));
    ctx.save(); ctx.translate(W / 2, 640); ctx.scale(b, b);
    const pulse = 1 + 0.025 * Math.sin(t * 4) * prog(t, 68.5, 69);
    ctx.scale(pulse, pulse);
    glow(ctx, 0, 0, 260, C.teal, 0.35);
    fillRR(ctx, -300, -54, 600, 108, 16, C.teal);
    text(ctx, 'Book an Assessment', 0, 3, { size: 48, weight: 800, color: '#0E2433' });
    ctx.restore();
    text(ctx, 'Call or text  (607) 857-3355', W / 2, 790, { size: 46, weight: 700, alpha: prog(t, 68.0, 68.5) });
    text(ctx, 'No obligation · Written report · Credited toward install', W / 2, 860, { size: 28, weight: 500, color: C.dim, alpha: prog(t, 68.4, 68.9) });
    ctx.restore();
  }
}

// ---------- timeline ----------
const DURATION = 73;
const SCENES = [
  [0, 10.6, sceneInstall], [10.4, 17.6, sceneDemarc], [17.4, 26.9, sceneProblem], [26.6, 33.1, sceneUpsell],
  [32.8, 38.8, sceneReveal], [38.5, 47.7, sceneFix], [47.4, 57.7, sceneAutomation], [57.4, 64.8, sceneOffer], [64.5, DURATION, sceneEnd],
];
const XF = 0.4; // crossfade seconds

// captions: [start, end, text]; long lines get split across these timings
const CAPS = [
  [5.0, 8.3, '“Okay… you’re connected. All done here!”'],
  [10.8, 13.0, 'And just like that… you’re on your own.'],
  [13.4, 17.3, 'Your internet provider’s job ends at that box. It’s called the demarc.'],
  [17.8, 21.4, 'You’re paying for 500 megabits. But the bedroom gets forty.'],
  [21.4, 23.6, 'The office buffers through every video call.'],
  [23.6, 26.5, 'And the cameras drop out right when you need them.'],
  [27.0, 30.0, 'Their answer? Rent another box. Add another monthly bill.'],
  [30.0, 32.9, 'And you still can’t see what’s on your network.'],
  [33.4, 34.6, 'That’s where we come in.'],
  [34.9, 38.2, 'After the Demark. We start where your ISP stops.'],
  [38.8, 41.2, 'We test your home from the demarc forward,'],
  [41.2, 43.4, 'find what’s really slowing you down,'],
  [43.4, 45.3, 'and design a network you own.'],
  [45.3, 47.4, 'Strong in every room. No rental fees.'],
  [47.9, 51.0, 'And with a solid foundation, your smart home runs locally.'],
  [51.0, 53.9, 'Lights, locks, cameras, and leak alerts'],
  [53.9, 57.3, 'that keep working, even when the internet goes down.'],
  [57.8, 61.0, 'Start with an on-site diagnostic.'],
  [61.0, 62.7, 'You get clear results and a written report,'],
  [62.7, 64.4, 'with zero pressure to buy anything.'],
  [64.9, 67.8, 'Your ISP is done. We’re just getting started.'],
];
function wrap(ctx, s, size, maxW) {
  const words = s.split(' '); const lines = []; let cur = '';
  for (const w of words) { const n = cur ? cur + ' ' + w : w; if (measure(ctx, n, size, 600) > maxW && cur) { lines.push(cur); cur = w; } else cur = n; }
  if (cur) lines.push(cur); return lines;
}
function captions(ctx, t) {
  for (const [a, b, s] of CAPS) {
    if (t < a - 0.15 || t > b + 0.15) continue;
    // skip where the same words are already on screen as a headline
    if ((a === 33.4) || (a === 34.9) || (a === 64.9) || (a === 5.0)) continue;
    const al = prog(t, a - 0.15, a + 0.1) * (1 - prog(t, b - 0.05, b + 0.15));
    const size = 40, lines = wrap(ctx, s, size, 1600);
    const lw = Math.max(...lines.map(l => measure(ctx, l, size, 600)));
    const bh = lines.length * 54 + 30, by = H - 50 - bh;
    ctx.save(); ctx.globalAlpha = al;
    fillRR(ctx, W / 2 - lw / 2 - 34, by, lw + 68, bh, 18, 'rgba(2,6,23,0.78)');
    lines.forEach((l, i) => text(ctx, l, W / 2, by + 15 + 27 + i * 54, { size, weight: 600 }));
    ctx.restore();
  }
}

function render(ctx, t) {
  ctx.save();
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
  for (const [a, b, fn] of SCENES) {
    if (t < a || t > b) continue;
    const alpha = prog(t, a, a + XF) * (a === 0 ? 1 : 1) * (b === DURATION ? 1 : 1 - prog(t, b - XF, b));
    ctx.save(); ctx.globalAlpha = a === 0 ? (1 - prog(t, b - XF, b)) : alpha;
    if (a === 0 && t < b - XF) ctx.globalAlpha = 1;
    fn(ctx, t);
    ctx.restore();
  }
  captions(ctx, t);
  // fade in/out
  const f = Math.min(prog(t, 0, 0.6), 1 - prog(t, DURATION - 0.8, DURATION));
  if (f < 1) { ctx.fillStyle = `rgba(0,0,0,${1 - f})`; ctx.fillRect(0, 0, W, H); }
  ctx.restore();
}

module.exports = { render, W, H, DURATION };
