recap: {
    title: "6권에서 본 것",
    points: [
      "오케스트레이션은 <b>다음에 무엇을 할지와 어디까지 했는지</b>를 관리하는 일이에요. ai-native는 <code>reduce</code> 상태 기계와 JSON 저장으로 LangGraph와 같은 일을 해요.",
      "Claude 셋(중앙, 워커, 질문)은 <b>역할마다 다른 권한</b>으로 돌고, 서로는 <b>JSON으로만</b> 넘기며, 그 사이를 코드가 검사해요.",
      "개발 요청 하나에서 Claude는 <b>판단이 필요한 두 단계</b>만 맡아요. 모델에 묶인 곳은 호출 옵션과 출력 해석 스크립트예요.",
      "질문하기(ask)는 <b>키워드 검색 + 질문 바꿔 쓰기 + 근거 검사</b>로 된 작은 RAG예요. 바꿔 말한 질문이 약한 곳이에요.",
      "다음 걸음은 <b>정답 세트로 기준선을 재고</b>, 실험은 따로 하고, 숫자로 확인한 뒤 붙이는 거예요.",
    ],
    nextLabel: "책을 마치며",
    next: "실습 코드는 rag-study에 그대로 있어요. 숫자를 바꿔 다시 돌려 보는 것이 이 책을 가장 빨리 내 것으로 만드는 방법이에요.",
  },

  recapScene(api) {
    const { s } = fx.stage(api);
    const A = api.accent;
    const items = [["오케스트레이션", "graph"], ["권한 나누기", "lock"], ["코드와 Claude", "gear"], ["ask는 작은 RAG", "search"], ["다음 걸음", "spark"]];
    api.t("6권에서 본 것", { x: 180, y: 40, "text-anchor": "middle", "font-size": 15, "font-weight": 900, fill: INK }, s);
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
