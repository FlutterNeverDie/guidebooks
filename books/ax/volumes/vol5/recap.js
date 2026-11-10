recap: {
    title: "5권에서 본 것",
    points: [
      "온톨로지는 <b>클래스, 속성, 관계, 제약</b>을 정한 약속(스키마)이고, 그 약속대로 사실을 채운 것이 <b>지식 그래프</b>예요.",
      "여러 단계 질문은 중간 사실이 질문과 닮지 않아 <b>벡터 검색이 놓쳐요</b>. 실습에서 필요한 사실 4개 중 2개만 상위 5개에 들어왔어요.",
      "구축은 <b>풀 질문 목록</b>에서 시작해요. 정형 데이터를 먼저 쓰고, 문서는 LLM이 스키마대로 뽑고, <b>제약 검사와 사람 검토</b>를 거쳐요.",
      "저장은 속성 그래프(Cypher), RDF(SPARQL), 테이블 중에서 골라요. 작게 시작하면 <b>기존 DB나 networkx</b>로도 충분해요.",
      "<b>GraphRAG</b>는 질문 속 대상에서 그래프를 펼쳐 사실을 모아요. 잡음을 줄이려면 관계 종류를 골라 펼쳐요.",
    ],
    nextLabel: "6권 예고 · 내 시스템 다시 보기",
    next: "지금까지 본 검색, 평가, 그래프를 들고 내가 만든 ai-native 허브를 다시 봐요. 무엇을 코드가 하고 무엇을 Claude가 하는지, 질문하기(ask)가 RAG와 어떻게 닮았는지, 다음에 무엇을 붙일 수 있는지 정리해요.",
  },

  recapScene(api) {
    const { s } = fx.stage(api);
    const A = api.accent;
    const items = [["온톨로지란", "table"], ["벡터가 못 하는 질문", "x"], ["구축 절차", "gear"], ["저장과 질의", "db"], ["GraphRAG", "graph"]];
    api.t("5권에서 본 것", { x: 180, y: 40, "text-anchor": "middle", "font-size": 15, "font-weight": 900, fill: INK }, s);
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
