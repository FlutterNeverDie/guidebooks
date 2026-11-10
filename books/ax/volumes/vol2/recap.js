recap: {
    title: "2권에서 본 것",
    points: [
      "자르기 전에 <b>깨끗한 글로 꺼내기</b>가 먼저예요. 머리말·꼬리말을 지우고, 표는 문장으로 풀고, 조각마다 <b>출처와 절 이름</b>을 붙여요.",
      "자르는 방법은 <b>고정 길이, 겹침, 구조 기준, 부모-자식</b> 네 가지예요. 겹침은 경계에서 잘린 답을 살려요.",
      "크기에는 정답이 없어요. 다만 <b>임베딩 모델 입력 한도</b>를 넘는 부분은 오류 없이 잘려서 검색에 안 잡혀요.",
      "임베딩은 <b>뜻의 좌표</b>예요. 단어가 달라도 뜻이 가까우면 찾지만, <b>부정과 숫자</b>는 잘 못 가려요.",
      "임베딩 모델은 언어, 입력 한도, 차원, 실행 위치로 골라요. <b>색인과 질문은 같은 모델</b>이어야 하고, 바꾸면 전부 다시 임베딩해요.",
    ],
    nextLabel: "3권 예고 · 벡터 DB와 색인",
    next: "조각이 수백만 개가 되면 질문마다 전부와 거리를 재는 건 너무 느려요. 벡터 DB가 어떻게 '대충 가장 가까운 것'을 빠르게 찾는지(HNSW, IVF), 키워드 검색을 섞으면 무엇이 좋아지는지 봐요.",
  },

  recapScene(api) {
    const { s } = fx.stage(api);
    const A = api.accent;
    const items = [["적재와 정리", "doc"], ["자르는 방법 네 가지", "cut"], ["크기와 입력 한도", "table"], ["뜻의 좌표", "vec"], ["모델 고르기", "gear"]];
    api.t("2권에서 본 것", { x: 180, y: 40, "text-anchor": "middle", "font-size": 15, "font-weight": 900, fill: INK }, s);
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
