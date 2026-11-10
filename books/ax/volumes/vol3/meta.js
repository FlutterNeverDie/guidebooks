BOOKS.push({
  no: 3,
  series: "AX 개발자 첫걸음",
  kicker: "VECTOR DATABASES AND INDEXES",
  title: "벡터 DB와 색인",
  subtitle: "조각이 수백만 개가 되면 전부와 거리를 잴 수 없어요.<br>대충 가장 가까운 것을 빠르게 찾는 색인과, 키워드 검색·재정렬로 정확도를 되찾는 방법을 봐요.",
  color: { accent: "#2f5fd0", ink: "#1d3f94", soft: "#e9effc" },
  coverTag: "빠르게 찾고, 다시 정렬하고",
  recapTag: "3권에서 본 것",

  coverScene(api) {
    const { s, say } = fx.stage(api);
    const A = api.accent;
    let sd = 11;
    const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
    const P = Array.from({ length: 70 }, () => [28 + rnd() * 304, 24 + rnd() * 224]);
    const Q = [262, 96];
    const d2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;
    // 이웃 연결 (가까운 4개)
    const edges = [];
    P.forEach((p, i) => P.map((q, j) => [j, d2(p, q)]).filter(([j]) => j !== i).sort((a, b) => a[1] - b[1]).slice(0, 4).forEach(([j]) => { if (i < j) edges.push([i, j]); }));
    const eg = api.n("g", { opacity: 0 }, s);
    edges.forEach(([i, j]) => api.n("line", { x1: P[i][0], y1: P[i][1], x2: P[j][0], y2: P[j][1], stroke: LINE, "stroke-width": 1.2 }, eg));
    const dots = P.map(([x, y]) => api.n("circle", { cx: x, cy: y, r: 4, fill: "#b8c0cf" }, s));
    // 탐욕 경로: 가장 먼 점에서 출발해 이웃 중 더 가까운 곳으로
    const nb = i => edges.filter(e => e.includes(i)).map(e => e[0] === i ? e[1] : e[0]);
    const best = P.map((p, i) => [i, d2(p, Q)]).sort((a, b) => a[1] - b[1])[0][0];
    const greedy = st => { let c = st; const pa = [c]; for (;;) { const n = nb(c).sort((a, b) => d2(P[a], Q) - d2(P[b], Q))[0]; if (n === undefined || d2(P[n], Q) >= d2(P[c], Q)) break; c = n; pa.push(c); } return pa; };
    // 먼 점부터 출발해 보고, 진짜 가장 가까운 점에 닿는 경로를 그림으로 쓴다
    const path = P.map((p, i) => [i, d2(p, Q)]).sort((a, b) => b[1] - a[1]).map(([i]) => greedy(i)).find(pa => pa[pa.length - 1] === best && pa.length >= 5) || [best];
    const trail = path.slice(1).map((j, k) => api.n("line", { x1: P[path[k]][0], y1: P[path[k]][1], x2: P[j][0], y2: P[j][1], stroke: A, "stroke-width": 3, "stroke-linecap": "round", opacity: 0 }, s));
    const walker = api.n("circle", { r: 7, fill: A, opacity: 0 }, s);
    const q = api.n("g", { opacity: 0 }, s);
    api.n("circle", { cx: Q[0], cy: Q[1], r: 9, fill: "#fff", stroke: INK, "stroke-width": 2.4 }, q);
    api.t("질문", { x: Q[0], y: Q[1] - 15, "text-anchor": "middle", "font-size": 10.5, "font-weight": 800, fill: INK }, q);
    const near = P.map((p, i) => [i, d2(p, Q)]).sort((a, b) => a[1] - b[1]).slice(0, 3).map(([i]) => i);
    // 결과 카드
    const res = ["1  경조 휴가는 연차와 따로 준다", "2  쓰지 못한 연차는 다음 해…", "3  기본 근무 시간은 하루 8시간…"].map((w, i) => {
      const g = fx.card(api, s, 20, 290 + i * 42, 320, 34, { title: w, c: i === 0 ? GUIDE : A, fs: 11.5 });
      return g;
    });
    const rr = api.n("g", { opacity: 0 }, s);
    api.n("rect", { x: 236, y: 268, width: 104, height: 18, rx: 9, fill: HARN }, rr);
    api.t("재정렬로 순서 고침", { x: 288, y: 281, "text-anchor": "middle", "font-size": 9.5, "font-weight": 800, fill: "#fff" }, rr);
    api.loop(t => {
      t = t % 11;
      const out = 1 - seg(t, 10.4, 10.9);
      dots.forEach((d, i) => { d.setAttribute("opacity", seg(t, 0, 0.5) * out); d.setAttribute("fill", t > 6 && near.includes(i) ? GUIDE : "#b8c0cf"); d.setAttribute("r", t > 6 && near.includes(i) ? 6 : 4); });
      eg.setAttribute("opacity", seg(t, 0.8, 1.6) * out);
      q.setAttribute("opacity", seg(t, 1.6, 2.0) * out);
      const steps = path.length - 1, f = clamp((t - 2.4) / 3.2) * steps;
      trail.forEach((l, k) => l.setAttribute("opacity", (f > k ? 0.85 : 0) * out));
      const k = Math.min(steps - 1, Math.floor(f)), u = f - k;
      const a = P[path[Math.max(0, k)]], b = P[path[Math.min(steps, k + 1)]];
      walker.setAttribute("cx", steps ? lerp(a[0], b[0], clamp(u)) : a[0]); walker.setAttribute("cy", steps ? lerp(a[1], b[1], clamp(u)) : a[1]);
      walker.setAttribute("opacity", t > 2.3 && t < 6.2 ? 1 : 0);
      res.forEach((g, i) => fx.rise(g, 20, 290 + i * 42, seg(t, 6.6 + i * 0.25, 7.0 + i * 0.25) * out));
      rr.setAttribute("opacity", seg(t, 7.8, 8.1) * out);
      say(t, [[0.2, 2.3, "조각이 많으면 전부와 비교할 수 없어요"], [2.4, 6.4, "색인 그래프를 타고 가까운 쪽으로 건너가요"], [6.5, 10.6, "찾은 후보는 다시 정렬해서 넘겨요"]]);
    }, 8.5);
  },
