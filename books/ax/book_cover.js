/**
 * book_cover.js - AX 개발자 첫걸음 표지와 책 고유 문구
 */

export const BOOK_COVER = {
  title: "AX 개발자 첫걸음",
  kicker: "FROM SEARCH TO KNOWLEDGE GRAPH",
  subtitle: "백엔드 개발자가 RAG, 임베딩, 벡터 DB, 온톨로지, 에이전트 오케스트레이션을 수학 증명 없이 큰 그림으로 이해하는 책이에요. 끝에서는 내가 만든 시스템을 이 눈으로 다시 봐요.",
  tag: "문서 → 조각 → 벡터 → 그래프",
  color: { accent: "#2f5fd0", ink: "#1d3f94", soft: "#e9effc" },
  storageKey: "ax-guidebook",
  // 글이 많은 책이라 글 쪽을 넓게 쓴다. 장면은 viewBox(400x300) 안에만 그린다
  layout: { stage: "1fr", text: "1.875fr" },
  text: {
    coverLeft: "AX 개발자 첫걸음 · 백엔드 개발자를 위한 큰 그림",
    coverRight: "검색에서 지식 그래프까지",
    coverBadge: "6권 종합본",
    runhead: "AX 개발자 첫걸음",
    labLabel: "백엔드로 치면",
    outroLeft: "끝까지 읽었어요",
    outroTag: "6권 완독",
    outroTitle: "이제 지도를 손에 쥐었어요",
    outroBody: `
        <p>RAG가 무엇을 풀고, 청크와 임베딩이 검색 품질을 어떻게 정하는지, 벡터 DB가 어떤 색인으로 빠르게 찾는지, 어디서 한계에 부딪히는지, 그리고 그 한계를 온톨로지와 그래프가 어떻게 메우는지까지 한 번에 훑었어요.</p>
        <div class="card" style="margin: 16px 0;"><b>다음 걸음</b>책에서 본 것을 <code>rag-study</code>에서 한 단계씩 돌려 보고, 6권에서 고른 "내 시스템에 붙일 곳" 하나를 작게 만들어 보세요. 큰 그림은 직접 한 번 만들 때 내 것이 돼요.</div>`,
  },

  scene(api) {
    const { s, say } = fx.stage(api);
    const A = api.accent;
    // 1. 문서
    const doc = fx.card(api, s, 120, 22, 120, 46, { title: "문서", sub: "규정 · 회의록", c: INK, icon: "doc" });
    // 2. 조각
    const chunks = [0, 1, 2].map(i => {
      const g = fx.card(api, s, 22 + i * 110, 104, 96, 34, { title: `조각 ${i + 1}`, c: A, fs: 11.5 });
      return g;
    });
    const cut = [0, 1, 2].map(i => api.n("path", { d: `M180 68 C180 86, ${70 + i * 110} 86, ${70 + i * 110} 104`, fill: "none", stroke: A, "stroke-width": 1.4, "stroke-dasharray": "3 4" }, s));
    // 3. 벡터 공간
    const plane = api.n("g", { transform: "translate(40, 168)" }, s);
    api.n("rect", { x: 0, y: 0, width: 280, height: 118, rx: 12, fill: "#fff", filter: "url(#fxsh)" }, plane);
    for (let k = 1; k < 7; k++) api.n("line", { x1: k * 40, y1: 8, x2: k * 40, y2: 110, stroke: LINE, "stroke-width": 0.8 }, plane);
    for (let k = 1; k < 3; k++) api.n("line", { x1: 8, y1: k * 39, x2: 272, y2: k * 39, stroke: LINE, "stroke-width": 0.8 }, plane);
    api.t("뜻의 좌표 (벡터)", { x: 12, y: 18, "font-size": 10.5, "font-weight": 700, fill: MUTED }, plane);
    const P = [[74, 52], [96, 70], [214, 86]];
    const dots = P.map(([x, y]) => api.n("circle", { cx: x, cy: y, r: 7, fill: A, opacity: 0 }, plane));
    const ring = api.n("circle", { cx: 88, cy: 58, r: 0, fill: A, opacity: 0.12 }, plane);
    const qd = api.n("circle", { cx: 88, cy: 58, r: 6, fill: "#fff", stroke: HARN, "stroke-width": 2.4, opacity: 0 }, plane);
    const ql = api.t("질문", { x: 102, y: 46, "font-size": 10.5, "font-weight": 800, fill: HARN, opacity: 0 }, plane);
    // 4. 그래프
    const N = [[90, 330, "사람"], [270, 330, "팀"], [90, 400, "장비"], [270, 400, "규정"]];
    const E = [[0, 1, "소속"], [0, 2, "보유"], [1, 3, "적용"], [2, 3, "근거"]];
    const edges = E.map(([a, b, w]) => {
      const g = api.n("g", { opacity: 0 }, s);
      api.n("line", { x1: N[a][0], y1: N[a][1], x2: N[b][0], y2: N[b][1], stroke: A, "stroke-width": 2 }, g);
      const mx = (N[a][0] + N[b][0]) / 2, my = (N[a][1] + N[b][1]) / 2;
      api.n("rect", { x: mx - 17, y: my - 9, width: 34, height: 18, rx: 9, fill: "#fff", stroke: LINE }, g);
      api.t(w, { x: mx, y: my + 4, "text-anchor": "middle", "font-size": 10, "font-weight": 700, fill: A }, g);
      return g;
    });
    const nodes = N.map(([x, y, w]) => { const g = pill(api, s, x, y, w, A, 11.5, A); g.setAttribute("opacity", 0); return g; });

    api.loop(t => {
      t = t % 10.5;
      const out = 1 - seg(t, 9.8, 10.4);
      fx.rise(doc, 120, 22, seg(t, 0, 0.5) * out);
      chunks.forEach((g, i) => fx.rise(g, 22 + i * 110, 104, seg(t, 0.8 + i * 0.25, 1.3 + i * 0.25) * out));
      cut.forEach((c, i) => c.setAttribute("opacity", seg(t, 0.6 + i * 0.25, 1.1 + i * 0.25) * out));
      dots.forEach((d, i) => {
        const p = seg(t, 2.6 + i * 0.35, 3.2 + i * 0.35);
        d.setAttribute("opacity", p * out);
        d.setAttribute("r", 7 + 4 * (1 - p));
      });
      const q = seg(t, 4.2, 4.8);
      qd.setAttribute("opacity", q * out); ql.setAttribute("opacity", q * out);
      ring.setAttribute("r", 34 * seg(t, 4.6, 5.4));
      ring.setAttribute("opacity", 0.14 * out);
      nodes.forEach((g, i) => g.setAttribute("opacity", seg(t, 6.0 + i * 0.25, 6.4 + i * 0.25) * out));
      edges.forEach((g, i) => g.setAttribute("opacity", seg(t, 7.0 + i * 0.35, 7.4 + i * 0.35) * out));
      say(t, [[0.1, 2.4, "문서를 조각으로 잘라요"], [2.5, 5.8, "조각을 뜻의 좌표로 바꾸고 가까운 걸 찾아요"], [5.9, 10.2, "관계는 그래프로 이어요"]]);
    }, 8.5);
  },
};
