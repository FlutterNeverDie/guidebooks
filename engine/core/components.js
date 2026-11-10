/**
 * components.js - 6권, 7권 및 공통 UI 드로잉 컴포넌트
 */

// 6~7권 공통 색상
export const HOOK = "#3462c9";
export const GUIDE = "#1f8a5b";
export const HARN = "#d9622b";
export const BAD = "#d64545";
export const INK = "#23272f";
export const MUTED = "#6b7280";
export const LINE = "#e4e1d8";
export const PAPER = "#f6f4ee";

// 그림 컴포넌트
export const bot = (api, p, x, y, r = 22, fill = api.accent) => {
  const g = api.n("g", { transform: `translate(${x}, ${y})` }, p);
  api.n("circle", { r, fill }, g);
  api.t("AI", { y: r * 0.24, "text-anchor": "middle", "font-size": r * 0.6, "font-weight": 800, fill: "#fff" }, g);
  return g;
};

export const person = (api, p, x, y, c = MUTED, label = "나") => {
  const g = api.n("g", { transform: `translate(${x}, ${y})` }, p);
  api.n("circle", { cy: -24, r: 10, fill: c }, g);
  api.n("rect", { x: -15, y: -11, width: 30, height: 30, rx: 12, fill: c }, g);
  if (label) api.t(label, { y: 36, "text-anchor": "middle", "font-size": 10.5, "font-weight": 700, fill: INK }, g);
  return g;
};

export const pill = (api, p, x, y, text, c, fs = 10.5, fill = "#fff") => {
  const g = api.n("g", {}, p);
  const w = [...text].length * fs * 0.92 + 18;
  api.n("rect", { x: x - w / 2, y: y - 12, width: w, height: 24, rx: 12, fill, stroke: c, "stroke-width": 1.5 }, g);
  const tx = api.t(text, { x, y: y + fs * 0.36, "text-anchor": "middle", "font-size": fs, "font-weight": 700, fill: fill === "#fff" ? c : "#fff" }, g);
  g.label = tx;
  return g;
};

export const lerp = (a, b, p) => a + (b - a) * p;

// AX 가이드북 추가 그림 도구
// 둥근 상자 + 가운데 글자. sub가 있으면 두 줄
export const box = (api, p, x, y, w, h, text, c = INK, { fill = "#fff", sub = null, fs = 11.5, dash = null } = {}) => {
  const g = api.n("g", { transform: `translate(${x}, ${y})` }, p);
  const a = { x: 0, y: 0, width: w, height: h, rx: 9, fill, stroke: c, "stroke-width": 1.6 };
  if (dash) a["stroke-dasharray"] = dash;
  api.n("rect", a, g);
  api.t(text, { x: w / 2, y: sub ? h / 2 - 3 : h / 2 + fs * 0.36, "text-anchor": "middle", "font-size": fs, "font-weight": 700, fill: c }, g);
  if (sub) api.t(sub, { x: w / 2, y: h / 2 + 12, "text-anchor": "middle", "font-size": fs - 2, fill: MUTED }, g);
  return g;
};

// 화살표 (x1,y1) -> (x2,y2)
export const arrow = (api, p, x1, y1, x2, y2, c = MUTED, w = 1.6) => {
  const g = api.n("g", {}, p);
  api.n("line", { x1, y1, x2, y2, stroke: c, "stroke-width": w }, g);
  const a = Math.atan2(y2 - y1, x2 - x1), L = 7;
  const pts = [[x2, y2], [x2 - L * Math.cos(a - 0.45), y2 - L * Math.sin(a - 0.45)], [x2 - L * Math.cos(a + 0.45), y2 - L * Math.sin(a + 0.45)]];
  api.n("polygon", { points: pts.map(q => q.join(",")).join(" "), fill: c }, g);
  return g;
};

// 움직이는 점 (토큰, 조각, 질의가 흘러가는 모습)
export const dot = (api, p, r = 6, c = "#fff", stroke = INK) => api.n("circle", { r, fill: c, stroke, "stroke-width": 1.6 }, p);

// ---------- 영상형 장면 도구 (2026-11-10, AX 책부터) ----------
// 세로형 무대: fx.stage(api) -> { s, W, H, say } . say(t, [[시작초, 끝초, "자막"], ...])
export const fx = {
  stage(api, W = 360, H = 480) {
    const s = api.svg(W, H);
    const d = api.n("defs", {}, s);
    const f = api.n("filter", { id: "fxsh", x: "-20%", y: "-20%", width: "140%", height: "150%" }, d);
    api.n("feDropShadow", { dx: 0, dy: 2, stdDeviation: 2.4, "flood-color": "#1b2333", "flood-opacity": 0.14 }, f);
    const g = api.n("filter", { id: "fxglow", x: "-50%", y: "-50%", width: "200%", height: "200%" }, d);
    api.n("feGaussianBlur", { stdDeviation: 4, result: "b" }, g);
    const m = api.n("feMerge", {}, g); api.n("feMergeNode", { in: "b" }, m); api.n("feMergeNode", { in: "SourceGraphic" }, m);
    // 자막 막대
    const bar = api.n("g", { opacity: 0 }, s);
    api.n("rect", { x: 14, y: H - 52, width: W - 28, height: 38, rx: 12, fill: "#1f2430", opacity: 0.92 }, bar);
    const tx = api.t("", { x: W / 2, y: H - 28, "text-anchor": "middle", "font-size": 13, "font-weight": 700, fill: "#fff" }, bar);
    let last = null;
    const say = (t, lines) => {
      const cur = lines.find(([a, b]) => t >= a && t < b);
      if (!cur) { bar.setAttribute("opacity", 0); return; }
      if (cur[2] !== last) { tx.textContent = cur[2]; last = cur[2]; }
      bar.setAttribute("opacity", Math.min(seg(t, cur[0], cur[0] + 0.3), 1 - seg(t, cur[1] - 0.3, cur[1])));
    };
    return { s, W, H, say, top: s };
  },
  // 그림자 카드. title/sub, 왼쪽 색 띠, 아이콘
  card(api, p, x, y, w, h, { title = "", sub = "", c = INK, icon = null, fill = "#fff", fs = 12.5, strip = true } = {}) {
    const g = api.n("g", { transform: `translate(${x}, ${y})` }, p);
    api.n("rect", { x: 0, y: 0, width: w, height: h, rx: 10, fill, filter: "url(#fxsh)" }, g);
    if (strip) api.n("rect", { x: 0, y: 0, width: 5, height: h, rx: 2.5, fill: c }, g);
    let tx = strip ? 16 : 12;
    if (icon) { fx.icon(api, g, icon, tx + 11, h / 2, 22, c); tx += 30; }
    const anchor = title && !icon && !strip ? "middle" : "start";
    const ax = anchor === "middle" ? w / 2 : tx;
    if (title) g.titleEl = api.t(title, { x: ax, y: sub ? h / 2 - 2 : h / 2 + fs * 0.36, "text-anchor": anchor, "font-size": fs, "font-weight": 800, fill: INK }, g);
    if (sub) g.subEl = api.t(sub, { x: ax, y: h / 2 + 14, "text-anchor": anchor, "font-size": fs - 2.5, fill: MUTED }, g);
    return g;
  },
  // 단순 아이콘 (가운데 기준, size 정사각)
  icon(api, p, kind, cx, cy, size = 22, c = INK) {
    const g = api.n("g", { transform: `translate(${cx - size / 2}, ${cy - size / 2}) scale(${size / 24})` }, p);
    const st = { fill: "none", stroke: c, "stroke-width": 2, "stroke-linecap": "round", "stroke-linejoin": "round" };
    const P = d => api.n("path", { d, ...st }, g);
    if (kind === "doc") { P("M6 2h8l4 4v16H6z"); P("M14 2v4h4"); P("M9 11h6M9 15h6M9 19h4"); }
    else if (kind === "db") { api.n("ellipse", { cx: 12, cy: 5, rx: 8, ry: 3, ...st }, g); P("M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5"); P("M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"); }
    else if (kind === "llm") { api.n("rect", { x: 5, y: 5, width: 14, height: 14, rx: 3, ...st }, g); P("M9 1v4M15 1v4M9 19v4M15 19v4M1 9h4M1 15h4M19 9h4M19 15h4"); api.n("circle", { cx: 12, cy: 12, r: 2.5, fill: c }, g); }
    else if (kind === "search") { api.n("circle", { cx: 10, cy: 10, r: 6.5, ...st }, g); P("M15 15l6 6"); }
    else if (kind === "user") { api.n("circle", { cx: 12, cy: 8, r: 4, ...st }, g); P("M4 21c1-4.5 4.3-7 8-7s7 2.5 8 7"); }
    else if (kind === "cut") { api.n("circle", { cx: 6, cy: 18, r: 3, ...st }, g); api.n("circle", { cx: 18, cy: 18, r: 3, ...st }, g); P("M8 16L19 3M16 16L5 3"); }
    else if (kind === "vec") { P("M4 20V4M4 20h16"); P("M4 20l9-9"); P("M13 11h-4M13 11v4"); }
    else if (kind === "graph") { [[5, 6], [19, 5], [12, 19]].forEach(([x, y]) => api.n("circle", { cx: x, cy: y, r: 2.6, ...st }, g)); P("M7.5 6h9M6 8.5l4.6 8.2M17.8 7.2l-4.6 9.6"); }
    else if (kind === "tool") { P("M14.5 6.5a4 4 0 0 0 5 5L12 19a2.1 2.1 0 0 1-3-3l7.5-7.5a4 4 0 0 0-2-2z"); }
    else if (kind === "table") { api.n("rect", { x: 3, y: 4, width: 18, height: 16, rx: 2, ...st }, g); P("M3 9h18M3 14h18M10 4v16"); }
    else if (kind === "key") { api.n("circle", { cx: 7, cy: 12, r: 4, ...st }, g); P("M11 12h10M17 12v3M20 12v2"); }
    else if (kind === "api") { P("M8 6l-5 6 5 6M16 6l5 6-5 6M14 4l-4 16"); }
    else if (kind === "lock") { api.n("rect", { x: 5, y: 11, width: 14, height: 10, rx: 2, ...st }, g); P("M8 11V8a4 4 0 0 1 8 0v3"); }
    else if (kind === "clock") { api.n("circle", { cx: 12, cy: 12, r: 9, ...st }, g); P("M12 7v5l3 2"); }
    else if (kind === "check") { P("M5 12.5l4.5 4.5L19 7"); }
    else if (kind === "x") { P("M6 6l12 12M18 6L6 18"); }
    else if (kind === "spark") { P("M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18"); }
    else if (kind === "gear") { api.n("circle", { cx: 12, cy: 12, r: 3, ...st }, g); P("M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"); }
    return g;
  },
  // 말풍선. 꼬리 방향 tail: "left" | "right" | "down" | null
  bubble(api, p, x, y, w, h, text, { c = INK, fill = "#fff", fs = 12, tail = "left", bold = true } = {}) {
    const g = api.n("g", { transform: `translate(${x}, ${y})` }, p);
    api.n("rect", { x: 0, y: 0, width: w, height: h, rx: 12, fill, stroke: c, "stroke-width": 1.4, filter: "url(#fxsh)" }, g);
    if (tail === "left") api.n("path", { d: `M14 ${h - 1} l-6 9 l14 -9`, fill, stroke: c, "stroke-width": 1.4, "stroke-linejoin": "round" }, g);
    if (tail === "right") api.n("path", { d: `M${w - 22} ${h - 1} l14 9 l-6 -9`, fill, stroke: c, "stroke-width": 1.4, "stroke-linejoin": "round" }, g);
    if (tail === "down") api.n("path", { d: `M${w / 2 - 6} ${h - 1} l6 8 l6 -8`, fill, stroke: c, "stroke-width": 1.4, "stroke-linejoin": "round" }, g);
    g.textEl = api.t(text, { x: w / 2, y: h / 2 + fs * 0.36, "text-anchor": "middle", "font-size": fs, "font-weight": bold ? 700 : 500, fill: c }, g);
    return g;
  },
  // 타이핑: 글자 수를 진행도로
  type(el, full, p) { const n = Math.round([...full].length * clamp(p)); el.textContent = [...full].slice(0, n).join(""); },
  // 꺾은선 경로 위의 점 위치 (pts: [[x,y],...], p: 0~1)
  along(pts, p) {
    p = clamp(p);
    const L = []; let tot = 0;
    for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(d); tot += d; }
    let r = p * tot;
    for (let i = 0; i < L.length; i++) {
      if (r <= L[i] || i === L.length - 1) { const f = L[i] ? Math.min(1, r / L[i]) : 0; return [lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f)]; }
      r -= L[i];
    }
    return pts[pts.length - 1];
  },
  // 흐르는 입자 n개 (경로 따라 반복). 반환: update(t)
  stream(api, p, pts, { n = 5, c = INK, r = 3, speed = 0.5, dash = true } = {}) {
    if (dash) api.n("polyline", { points: pts.map(q => q.join(",")).join(" "), fill: "none", stroke: c, "stroke-width": 1.4, "stroke-dasharray": "3 4", opacity: 0.45 }, p);
    const ds = Array.from({ length: n }, () => api.n("circle", { r, fill: c }, p));
    return (t, on = 1) => ds.forEach((d, i) => {
      const q = ((t * speed + i / n) % 1);
      const [x, y] = fx.along(pts, q);
      d.setAttribute("cx", x); d.setAttribute("cy", y);
      d.setAttribute("opacity", on * Math.sin(Math.PI * q));
    });
  },
  // 등장(아래에서 살짝 올라오며 나타남)
  rise(g, x, y, p, dy = 10) { g.setAttribute("transform", `translate(${x}, ${y + (1 - p) * dy})`); g.setAttribute("opacity", p); },
  // 맥박 강조 (0~1 사이 값 반환)
  pulse(t, speed = 3) { return 0.5 + 0.5 * Math.sin(t * speed); },
};
