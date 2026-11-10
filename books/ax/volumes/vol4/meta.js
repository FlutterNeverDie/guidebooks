BOOKS.push({
  no: 4,
  series: "AX 개발자 첫걸음",
  kicker: "MEASURE, THEN TRUST",
  title: "성능, 평가, 한계",
  subtitle: "질문 몇 개를 눈으로 보는 것으로는 부족해요.<br>정답 세트로 재고, 시간을 나눠 보고, RAG가 구조적으로 못 하는 일을 정리해요.",
  color: { accent: "#2f5fd0", ink: "#1d3f94", soft: "#e9effc" },
  coverTag: "재고, 나누고, 한계를 알기",
  recapTag: "4권에서 본 것",

  coverScene(api) {
    const { s, say } = fx.stage(api);
    const A = api.accent;
    // 삼각형: 정확도, 속도, 메모리
    const V = [[180, 40], [56, 250], [304, 250]];
    const L = [["정확도", GUIDE], ["속도", HARN], ["메모리 절약", HOOK]];
    api.n("polygon", { points: V.map(p => p.join(",")).join(" "), fill: A, opacity: 0.06, stroke: A, "stroke-width": 1.6 }, s);
    V.forEach(([x, y], i) => {
      api.n("circle", { cx: x, cy: y, r: 22, fill: "#fff", filter: "url(#fxsh)" }, s);
      fx.icon(api, s, ["check", "clock", "db"][i], x, y, 20, L[i][1]);
      api.t(L[i][0], { x, y: i === 0 ? y - 30 : y + 40, "text-anchor": "middle", "font-size": 12, "font-weight": 800, fill: L[i][1] }, s);
    });
    // 설정마다 위치 (무게 [정확도, 속도, 메모리])
    const S = [["HNSW ef=64", [0.6, 0.3, 0.1]], ["IVF nprobe=1", [0.15, 0.75, 0.1]], ["IVF + PQ", [0.15, 0.35, 0.5]], ["재정렬 후보 20개", [0.85, 0.05, 0.1]]];
    const pos = w => [w[0] * V[0][0] + w[1] * V[1][0] + w[2] * V[2][0], w[0] * V[0][1] + w[1] * V[1][1] + w[2] * V[2][1]];
    const dot = api.n("circle", { r: 10, fill: A, stroke: "#fff", "stroke-width": 3, filter: "url(#fxsh)" }, s);
    const tag = fx.bubble(api, s, 0, 0, 150, 30, "", { c: A, fs: 11.5, tail: null });
    // 숫자판
    const board = fx.card(api, s, 20, 300, 320, 108, { c: INK });
    api.t("내 정답 세트로 잰 값", { x: 36, y: 322, "font-size": 11, "font-weight": 800, fill: MUTED }, s);
    const rows = [["hit@1", "0.59 → 0.95"], ["재정렬 지연", "질문당 약 0.5초"], ["답 없는 질문", "점수로 못 거름"]].map(([k, v], i) => {
      const g = api.n("g", { opacity: 0 }, s);
      api.t(k, { x: 36, y: 348 + i * 22, "font-size": 12, "font-weight": 700, fill: INK }, g);
      api.t(v, { x: 324, y: 348 + i * 22, "text-anchor": "end", "font-size": 12, "font-weight": 900, fill: [GUIDE, HARN, BAD][i] }, g);
      return g;
    });
    api.loop(t => {
      t = t % 12;
      const D = 2.2, i = Math.floor(t / D) % S.length, u = (t % D) / D;
      const a = pos(S[(i + S.length - 1) % S.length][1]), b = pos(S[i][1]);
      const m = seg(u, 0, 0.35);
      const x = lerp(a[0], b[0], m), y = lerp(a[1], b[1], m);
      dot.setAttribute("cx", x); dot.setAttribute("cy", y);
      tag.setAttribute("transform", `translate(${clamp(x - 75, 20, 190)}, ${y + 16})`);
      if (tag.textEl.textContent !== S[i][0]) tag.textEl.textContent = S[i][0];
      tag.setAttribute("opacity", t < 8.8 ? seg(u, 0.3, 0.45) : 0);
      dot.setAttribute("opacity", t < 8.8 ? 1 : 0.3);
      rows.forEach((g, k) => g.setAttribute("opacity", seg(t, 8.9 + k * 0.4, 9.2 + k * 0.4) * (1 - seg(t, 11.5, 11.9))));
      say(t, [[0.1, 8.7, "설정마다 무언가를 얻고 무언가를 내줘요"], [8.8, 11.8, "그래서 감이 아니라 숫자로 골라요"]]);
    }, 9.6);
  },
