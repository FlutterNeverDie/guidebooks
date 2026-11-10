BOOKS.push({
  no: 1,
  series: "AX 개발자 첫걸음",
  kicker: "THE BIG PICTURE",
  title: "RAG 큰 그림",
  subtitle: "LLM은 똑똑하지만 우리 회사 문서는 몰라요.<br>모르는 것을 찾아서 같이 넣어 주는 RAG가 무엇을 풀고 무엇을 못 푸는지부터 봐요.",
  color: { accent: "#2f5fd0", ink: "#1d3f94", soft: "#e9effc" },
  coverTag: "검색 + 보강 + 생성",
  recapTag: "1권에서 본 것",

  coverScene(api) {
    const { s, say } = fx.stage(api);
    const A = api.accent;
    const ask = fx.bubble(api, s, 40, 20, 280, 40, "우리 회사 휴가 이월 규칙은?", { c: INK, tail: "down" });
    // LLM 칩
    const halo = api.n("circle", { cx: 180, cy: 150, r: 54, fill: A, opacity: 0.1 }, s);
    api.n("circle", { cx: 180, cy: 150, r: 40, fill: "#fff", filter: "url(#fxsh)" }, s);
    fx.icon(api, s, "llm", 180, 144, 38, A);
    api.t("LLM", { x: 180, y: 178, "text-anchor": "middle", "font-size": 11, "font-weight": 800, fill: A }, s);
    // 지어낸 답
    const bad = fx.bubble(api, s, 60, 212, 240, 40, "아마 3일까지 될 거예요", { c: BAD, tail: null });
    const stamp = api.n("g", { opacity: 0 }, s);
    api.n("rect", { x: 236, y: 202, width: 58, height: 24, rx: 6, fill: "#fff", stroke: BAD, "stroke-width": 2, transform: "rotate(-8 265 214)" }, stamp);
    api.t("환각", { x: 265, y: 219, "text-anchor": "middle", "font-size": 12.5, "font-weight": 900, fill: BAD, transform: "rotate(-8 265 214)" }, stamp);
    // 자료 카드
    const docs = [["사내 규정 4조", 24], ["회의록 10/2", 132], ["인사 FAQ", 240]].map(([w, x]) => ({ g: fx.card(api, s, x, 330, 98, 40, { title: w, c: GUIDE, fs: 11, strip: true }), x }));
    const good = fx.bubble(api, s, 30, 212, 300, 44, "최대 5일까지 이월돼요 [규정 4조]", { c: GUIDE, tail: null });
    const ck = api.n("g", {}, s);
    api.n("circle", { cx: 180, cy: 282, r: 14, fill: GUIDE }, ck);
    fx.icon(api, ck, "check", 180, 282, 18, "#fff");
    api.loop(t => {
      t = t % 10;
      const out = 1 - seg(t, 9.4, 9.9);
      fx.rise(ask, 40, 20, seg(t, 0, 0.5) * out);
      halo.setAttribute("r", 50 + 6 * fx.pulse(t, 2.4) + 16 * seg(t, 6.2, 6.8) * (1 - seg(t, 7.2, 7.8)));
      const b = seg(t, 1.2, 1.7) * (1 - seg(t, 3.6, 4.0));
      bad.setAttribute("opacity", b); stamp.setAttribute("opacity", seg(t, 2.0, 2.3) * (1 - seg(t, 3.6, 4.0)));
      docs.forEach(({ g, x }, i) => {
        const a = seg(t, 4.2 + i * 0.2, 4.6 + i * 0.2), m = seg(t, 5.4 + i * 0.15, 6.3 + i * 0.15);
        g.setAttribute("transform", `translate(${lerp(x, 131, m)}, ${lerp(330, 130, m)}) scale(${1 - 0.6 * m})`);
        g.setAttribute("opacity", a * (1 - m) * out);
      });
      good.setAttribute("opacity", seg(t, 6.8, 7.3) * out);
      fx.type(good.textEl, "최대 5일까지 이월돼요 [규정 4조]", seg(t, 6.9, 8.2));
      ck.setAttribute("opacity", seg(t, 8.2, 8.5) * out);
      say(t, [[0.2, 3.9, "학습하지 않은 사내 규칙은 모르고 지어내요"], [4.0, 6.6, "관련 자료를 찾아 같이 넣어 주면"], [6.7, 9.6, "근거를 달아 답해요. 이게 RAG예요"]]);
    }, 8.6);
  },
