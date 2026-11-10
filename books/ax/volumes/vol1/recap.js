recap: {
    title: "1권에서 본 것",
    points: [
      "LLM은 <b>학습 기준일 이후의 일</b>과 <b>공개되지 않은 사내 자료</b>를 모르고, 모를 때도 <b>그럴듯하게 지어내요</b>.",
      "RAG는 모델을 바꾸지 않고 <b>검색 → 보강 → 생성</b>으로 필요한 자료를 요청마다 붙여 줘요. 품질은 대부분 검색이 정해요.",
      "시스템은 <b>색인 파이프라인</b>(미리)과 <b>질문 파이프라인</b>(요청마다)으로 나뉘고, 둘은 <b>같은 임베딩 모델</b>로 묶여요.",
      "지식을 넣는 길은 RAG, 파인튜닝, 긴 컨텍스트, 도구 호출 네 가지예요. <b>문서 크기와 바뀌는 속도</b>가 고르는 기준이에요.",
      "집계, 정확한 조회, 실시간 값, 여러 단계 관계는 RAG보다 <b>다른 도구가 맞아요</b>.",
    ],
    nextLabel: "2권 예고 · 청크와 임베딩",
    next: "검색 품질은 문서를 어떻게 자르느냐(청크)와 무엇으로 좌표를 매기느냐(임베딩)에서 대부분 정해져요. 같은 문서도 자르는 방법에 따라 검색 결과가 달라지는 걸 직접 돌려서 봐요.",
  },

  recapScene(api) {
    const { s } = fx.stage(api);
    const A = api.accent;
    const items = [["모르는 세 가지", "clock"], ["검색 + 보강 + 생성", "search"], ["두 파이프라인", "db"], ["지식을 넣는 네 가지 길", "tool"], ["RAG가 아닐 때", "graph"]];
    api.t("1권에서 본 것", { x: 180, y: 40, "text-anchor": "middle", "font-size": 15, "font-weight": 900, fill: INK }, s);
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
        ck.setAttribute("transform", `scale(1)`);
      });
    }, 5);
  },
});
