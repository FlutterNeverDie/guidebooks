BOOKS.push({
  no: 2,
  series: "AX 개발자 첫걸음",
  kicker: "CHUNKS AND EMBEDDINGS",
  title: "청크와 임베딩",
  subtitle: "검색 품질은 대부분 색인할 때 정해져요.<br>문서를 어떻게 정리해서 자르고, 조각마다 어떤 좌표를 매기는지 봐요.",
  color: { accent: "#2f5fd0", ink: "#1d3f94", soft: "#e9effc" },
  coverTag: "자르고, 좌표를 매기고",
  recapTag: "2권에서 본 것",

  coverScene(api) {
    const { s, say } = fx.stage(api);
    const A = api.accent;
    const C = [A, HARN, GUIDE, HOOK];
    // 긴 문서 (조각 넷이 붙어 있는 모습으로 시작)
    const frame = api.n("rect", { x: 86, y: 14, width: 188, height: 152, rx: 10, fill: "#fff", filter: "url(#fxsh)" }, s);
    const title = api.t("직원 안내서.md", { x: 98, y: 32, "font-size": 11, "font-weight": 800, fill: INK }, s);
    const pieces = C.map((c, i) => {
      const g = api.n("g", {}, s);
      api.n("rect", { x: 0, y: 0, width: 180, height: 30, rx: 6, fill: "#fff" }, g);
      api.n("rect", { x: 0, y: 0, width: 4, height: 30, rx: 2, fill: c }, g);
      [0, 1].forEach(k => api.n("rect", { x: 10, y: 8 + k * 11, width: [150, 120, 140, 104][(i + k) % 4], height: 5, rx: 2.5, fill: LINE }, g));
      return g;
    });
    const cuts = [0, 1, 2].map(i => api.n("line", { x1: 86, y1: 74 + i * 32, x2: 274, y2: 74 + i * 32, stroke: BAD, "stroke-width": 1.6, "stroke-dasharray": "5 4", opacity: 0 }, s));
    const sc = api.n("g", { opacity: 0 }, s);
    api.n("circle", { cx: 0, cy: 0, r: 13, fill: "#fff", stroke: BAD, "stroke-width": 1.4 }, sc);
    fx.icon(api, sc, "cut", 0, 0, 16, BAD);
    // 좌표 평면
    const plane = api.n("g", { opacity: 0 }, s);
    api.n("rect", { x: 22, y: 262, width: 316, height: 150, rx: 12, fill: "#fff", filter: "url(#fxsh)" }, plane);
    api.n("path", { d: "M44 396V278M44 396h276", stroke: MUTED, "stroke-width": 1.4, fill: "none" }, plane);
    api.t("뜻의 좌표", { x: 54, y: 284, "font-size": 10.5, "font-weight": 800, fill: MUTED }, plane);
    const target = [[96, 330], [250, 300], [272, 362], [128, 372]];
    const dots = C.map((c, i) => {
      const g = api.n("g", { opacity: 0 }, s);
      api.n("circle", { cx: 0, cy: 0, r: 8, fill: c, opacity: 0.2 }, g);
      api.n("circle", { cx: 0, cy: 0, r: 4.5, fill: c }, g);
      return g;
    });
    const q = api.n("g", { opacity: 0 }, s);
    api.n("circle", { cx: 0, cy: 0, r: 7, fill: "#fff", stroke: INK, "stroke-width": 2.2 }, q);
    api.t("질문", { x: 0, y: -12, "text-anchor": "middle", "font-size": 10, "font-weight": 800, fill: INK }, q);
    const qLine = api.n("line", { x1: 116, y1: 346, x2: 96, y2: 330, stroke: INK, "stroke-width": 1.6, "stroke-dasharray": "3 3", opacity: 0 }, s);
    api.loop(t => {
      t = t % 11;
      const out = 1 - seg(t, 10.4, 10.9);
      const sep = seg(t, 3.2, 4.2);
      [frame, title].forEach(e => e.setAttribute("opacity", seg(t, 0, 0.4) * (1 - sep)));
      pieces.forEach((g, i) => {
        // 문서 안 자리 -> 2x2 칸
        const x = lerp(90, i % 2 ? 182 : 18, sep), y = lerp(40 + i * 32, 184 + Math.floor(i / 2) * 38, sep);
        const k = lerp(1, 0.88, sep);
        g.setAttribute("transform", `translate(${x}, ${y}) scale(${k})`);
        g.setAttribute("opacity", seg(t, 0, 0.4) * out);
      });
      cuts.forEach((l, i) => l.setAttribute("opacity", seg(t, 1.2 + i * 0.6, 1.4 + i * 0.6) * (1 - seg(t, 3.0, 3.3))));
      const ci = Math.min(2, Math.floor(clamp((t - 1.2) / 0.6, 0, 2.99)));
      const cp = clamp((t - 1.2 - ci * 0.6) / 0.6);
      sc.setAttribute("opacity", t > 1.1 && t < 3.1 ? 1 : 0);
      sc.setAttribute("transform", `translate(${lerp(78, 282, cp)}, ${74 + ci * 32})`);
      plane.setAttribute("opacity", seg(t, 4.6, 5.0) * out);
      dots.forEach((d, i) => {
        const m = seg(t, 5.2 + i * 0.35, 6.0 + i * 0.35);
        const sx = (i % 2 ? 182 : 18) + 80, sy = 184 + Math.floor(i / 2) * 38 + 13;
        d.setAttribute("transform", `translate(${lerp(sx, target[i][0], m)}, ${lerp(sy, target[i][1], m)})`);
        d.setAttribute("opacity", (m > 0 ? 1 : 0) * out);
      });
      const qm = seg(t, 7.8, 8.6);
      q.setAttribute("transform", `translate(${lerp(320, 116, qm)}, ${lerp(250, 346, qm)})`);
      q.setAttribute("opacity", seg(t, 7.6, 7.9) * out);
      qLine.setAttribute("opacity", seg(t, 8.7, 9.0) * out);
      dots[0].setAttribute("opacity", (t > 8.7 ? 0.6 + 0.4 * fx.pulse(t, 6) : seg(t, 5.2, 5.3)) * out);
      say(t, [[0.2, 3.1, "긴 문서를 검색하기 좋은 크기로 잘라요"], [3.2, 7.5, "조각마다 뜻의 좌표(임베딩)를 매겨요"], [7.6, 10.6, "질문도 좌표로 바꿔 가까운 조각을 찾아요"]]);
    }, 9.5);
  },
