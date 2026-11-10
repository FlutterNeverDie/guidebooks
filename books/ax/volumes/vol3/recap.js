recap: {
    title: "3권에서 본 것",
    points: [
      "전부 비교는 정확하지만 <b>벡터 수에 비례해</b> 느려져요. 벡터 DB는 <b>근사 색인(ANN)</b>과 필터, 갱신, 저장을 함께 줘요.",
      "<b>HNSW</b>는 층이 있는 그래프를 타고 가까운 쪽으로 건너가요. <code>ef</code>를 키우면 정확해지고 느려져요.",
      "<b>IVF</b>는 가까운 칸만 보고, <b>PQ</b>는 벡터를 번호로 압축해요. 속도·정확도·메모리는 언제나 같이 재요.",
      "키워드(BM25)와 벡터를 섞으면 후보가 넉넉해지고, <b>재정렬</b>이 그 안에서 순서를 고쳐요. 후보에 없는 건 못 살려요.",
      "필터는 <b>먼저 걸어야</b> 개수가 채워지고, 권한은 반드시 검색 단계에서 걸러요. 제품은 <b>이미 쓰는 인프라</b>부터 봐요.",
    ],
    nextLabel: "4권 예고 · 성능, 평가, 한계",
    next: "지금까지는 질문 몇 개를 눈으로 봤어요. 4권에서는 정답 세트를 만들어 숫자로 재고, 지연 시간을 단계별로 나눠 보고, RAG가 구조적으로 못 하는 일을 정리해요.",
  },

  recapScene(api) {
    const { s } = fx.stage(api);
    const A = api.accent;
    const items = [["왜 벡터 DB인가", "db"], ["HNSW 그래프", "graph"], ["IVF와 PQ", "table"], ["하이브리드와 재정렬", "search"], ["필터와 제품 고르기", "key"]];
    api.t("3권에서 본 것", { x: 180, y: 40, "text-anchor": "middle", "font-size": 15, "font-weight": 900, fill: INK }, s);
    const cards = items.map(([w, ic], i) => {
      const g = fx.card(api, s, 30, 64 + i * 66, 300, 52, { title: w, c: A, icon: ic, fs: 13 });
      const ck = api.n("g", { opacity: 0 }, g);
      api.n("circle", { cx: 272, cy: 26, r: 12, fill: GUIDE }, ck);
      fx.icon(api, ck, "check", 272, 26, 16, "#fff");
      return { g, ck, y: 64 + i * 66 };
    });
    api.loop(t => {
      t = t % 7;
      cards.forEach(({ g, ck, y }, i) => {
        fx.rise(g, 30, y, seg(t, 0.2 + i * 0.3, 0.6 + i * 0.3) * (1 - seg(t, 6.4, 6.9)));
        ck.setAttribute("opacity", seg(t, 2.2 + i * 0.3, 2.5 + i * 0.3));
      });
    }, 5);
  },
});
