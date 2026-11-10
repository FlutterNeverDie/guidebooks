BOOKS.push({
  no: 5,
  series: "AX 개발자 첫걸음",
  kicker: "ONTOLOGY AND KNOWLEDGE GRAPHS",
  title: "온톨로지와 지식 그래프",
  subtitle: "비슷한 글을 찾는 것으로는 '누구의 팀장의 상사'를 못 따라가요.<br>대상과 관계를 정해 그래프로 만들고, 검색과 합치는 방법을 봐요.",
  color: { accent: "#2f5fd0", ink: "#1d3f94", soft: "#e9effc" },
  coverTag: "대상과 관계로 엮기",
  recapTag: "5권에서 본 것",

  coverScene(api) {
    const { s, say } = fx.stage(api);
    const A = api.accent;
    const K = { 사람: A, 팀: GUIDE, 본부: "#8a5cc2", 규정: "#c28a1b" };
    const N = {
      "박세나": [70, 300, "사람"], "영업팀": [150, 220, "팀"], "사업본부": [250, 150, "본부"], "오일곱": [290, 60, "사람"],
      "최네오": [70, 160, "사람"], "해외 출장 규정": [250, 300, "규정"], "노트북-044": [150, 370, "장비"],
    };
    const E = [["박세나", "영업팀", "소속"], ["영업팀", "사업본부", "속함"], ["사업본부", "오일곱", "본부장"], ["영업팀", "최네오", "팀장"], ["박세나", "노트북-044", "사용"], ["해외 출장 규정", "사업본부", "승인: 본부장"]];
    const path = [0, 1, 2];
    const eg = E.map(([a, b, r], i) => {
      const [x1, y1] = N[a], [x2, y2] = N[b];
      const g = api.n("g", { opacity: 0 }, s);
      const l = api.n("line", { x1, y1, x2, y2, stroke: i === 5 ? "#c28a1b" : LINE, "stroke-width": 2.2, "stroke-dasharray": i === 5 ? "5 4" : "none" }, g);
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
      api.n("rect", { x: mx - r.length * 5.4 - 6, y: my - 9, width: r.length * 10.8 + 12, height: 18, rx: 9, fill: "#fff", stroke: LINE }, g);
      api.t(r, { x: mx, y: my + 4, "text-anchor": "middle", "font-size": 10, "font-weight": 800, fill: MUTED }, g);
      return { g, l };
    });
    const ng = Object.entries(N).map(([n, [x, y, k]]) => {
      const c = K[k] || HARN;
      const g = api.n("g", { opacity: 0 }, s);
      const w = n.length * 11 + 20;
      api.n("rect", { x: x - w / 2, y: y - 15, width: w, height: 30, rx: 15, fill: "#fff", stroke: c, "stroke-width": 2, filter: "url(#fxsh)" }, g);
      api.t(n, { x, y: y + 4.5, "text-anchor": "middle", "font-size": 11.5, "font-weight": 800, fill: INK }, g);
      api.t(k, { x, y: y - 20, "text-anchor": "middle", "font-size": 9, "font-weight": 800, fill: c }, g);
      return { g, n };
    });
    api.loop(t => {
      t = t % 11;
      const out = 1 - seg(t, 10.4, 10.9);
      ng.forEach(({ g }, i) => g.setAttribute("opacity", seg(t, 0.2 + i * 0.25, 0.5 + i * 0.25) * out));
      eg.forEach(({ g, l }, i) => {
        g.setAttribute("opacity", seg(t, 2.2 + i * 0.3, 2.5 + i * 0.3) * out);
        const k = path.indexOf(i);
        const on = k >= 0 && t > 5.4 + k * 0.7;
        l.setAttribute("stroke", on ? A : i === 5 ? "#c28a1b" : LINE);
        l.setAttribute("stroke-width", on ? 4 : 2.2);
      });
      say(t, [[0.2, 2.1, "사람, 팀, 본부, 규정을 대상으로 정하고"], [2.2, 5.3, "대상 사이를 이름 있는 관계로 이어요"], [5.4, 10.6, "관계를 따라가면 여러 단계 질문이 풀려요"]]);
    }, 8.5);
  },
