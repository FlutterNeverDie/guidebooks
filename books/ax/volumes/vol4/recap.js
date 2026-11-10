recap: {
    title: "4권에서 본 것",
    points: [
      "느리면 먼저 <b>단계별로 재요</b>. 실습에서 검색은 0.1ms도 안 걸렸고 <b>재정렬이 0.5초</b> 가까이 썼어요.",
      "<b>정답 세트</b>를 파일로 두고 hit@k, MRR로 재요. 평균만 보지 말고 <b>질문 종류별로</b> 나눠 봐요.",
      "답은 <b>근거성</b>부터 봐요. 코드 검사, LLM 채점, 사람 검토를 겹쳐 쓰고, 각각 무엇을 못 잡는지 알아 둬요.",
      "RAG는 '비슷한 글 몇 개로 풀리는 질문'에 맞아요. <b>집계, 없는 것 찾기, 여러 단계 관계, 실시간 값</b>은 다른 도구로 보내요.",
      "답이 없어도 검색은 무언가를 돌려주고 <b>점수로는 못 걸러요</b>. 지시, 근거 검사, '모른다' 평가를 같이 써요.",
    ],
    nextLabel: "5권 예고 · 온톨로지와 지식 그래프",
    next: "'IT팀 사람이 노트북을 잃어버리면 누가 승인하나'처럼 여러 단계를 이어야 하는 질문은 조각 하나에 답이 없어요. 사람, 팀, 장비, 규정을 관계로 묶는 온톨로지와 지식 그래프를 직접 만들어 봐요.",
  },

  recapScene(api) {
    const { s } = fx.stage(api);
    const A = api.accent;
    const items = [["지연을 나눠 보기", "clock"], ["정답 세트와 지표", "table"], ["답 평가", "check"], ["어울리는 일", "search"], ["한계와 대응", "lock"]];
    api.t("4권에서 본 것", { x: 180, y: 40, "text-anchor": "middle", "font-size": 15, "font-weight": 900, fill: INK }, s);
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
