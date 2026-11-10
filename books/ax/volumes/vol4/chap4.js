export default {
      title: "어울리는 일, 안 어울리는 일",
      tag: "비슷한 글 몇 개를 읽으면 풀리는 질문인가",
      lead: "RAG가 하는 일은 결국 '질문과 비슷한 글 몇 개를 찾아 읽고 답하기'예요. 그래서 질문이 그 모양이면 잘 맞고, 전부를 세거나, 없는 것을 찾거나, 여러 단계를 이어야 하면 구조적으로 약해요. 모델을 바꿔도 이 모양은 그대로예요.",
      body: `
<h3>잘 어울리는 일</h3>
<table class="vs">
  <tr><th>일</th><th>예</th></tr>
  <tr><td>사내 문서 Q&A</td><td>"휴가 넘겨 쓸 수 있어?"(단어가 달라도 뜻으로 찾음)</td></tr>
  <tr><td>비슷한 사례 찾기</td><td>"이런 장애 전에도 있었어?", 비슷한 고객 문의와 답변</td></tr>
  <tr><td>긴 문서 묶음에서 근거 찾기</td><td>계약서, 매뉴얼, 회의록에서 출처와 함께 답</td></tr>
  <tr><td>자주 바뀌는 지식</td><td>문서만 다시 색인하면 돼요. 모델 학습이 필요 없어요</td></tr>
</table>

<h3>안 어울리는 일과 대신 쓸 것</h3>
<table class="vs">
  <tr><th>질문 모양</th><th>예</th><th>왜 약한가</th><th>대신</th></tr>
  <tr><td>집계·전수</td><td>지난달 출장비 합계는?</td><td><span class="poor">상위 k개만 읽어요</span></td><td>SQL 도구</td></tr>
  <tr><td>없는 것 찾기</td><td>연차 규정이 없는 부서는?</td><td><span class="poor">비슷한 걸 찾는 방식이라 '없음'을 못 찾아요</span></td><td>구조화 데이터 질의</td></tr>
  <tr><td>여러 단계 관계</td><td>IT팀 사람이 노트북 잃어버리면 누가 승인?</td><td><span class="poor">조각 하나에 답이 다 없어요</span></td><td>지식 그래프(5권)</td></tr>
  <tr><td>실시간 값</td><td>주문 123 지금 어디?</td><td><span class="poor">색인은 과거 사진이에요</span></td><td>API 도구</td></tr>
  <tr><td>정확한 숫자 비교</td><td>5일인지 15일인지</td><td><span class="poor">임베딩이 숫자를 잘 못 가려요(2권 4장)</span></td><td>키워드 검색 + 원문 확인</td></tr>
</table>

<p>실무 시스템은 이 둘을 섞어요. 질문을 먼저 분류하고(1권 5장의 라우터), RAG가 맞는 질문만 RAG로 보내요. 이 판단을 LLM이 도구를 고르는 방식으로 맡기기도 해요(6권).</p>`,
      lab: "<b>검색 엔진과 데이터 웨어하우스</b>의 차이예요. Elasticsearch에 '지난달 매출 합계'를 묻지 않고, 웨어하우스에 '이 문장과 비슷한 글'을 묻지 않죠. RAG는 검색 엔진 쪽이에요. 질문이 어느 쪽 모양인지 먼저 보고 맞는 저장소로 보내는 게 설계의 첫 단계예요.",
      quiz: {
        q: "다음 중 RAG만으로 풀기 가장 어려운 질문은?",
        options: ["\"재택 근무 며칠까지 돼?\"", "\"올해 경비 청구가 가장 많은 부서는?\"", "\"노트북 잃어버리면 어떻게 해?\""], answer: 1,
        explain: "가장 많은 부서를 찾으려면 모든 청구를 세야 해요. 상위 몇 개 조각을 읽는 RAG로는 안 되고, 경비 DB를 SQL로 집계하는 도구가 맞아요.",
      },
      scene(api) {
        const { s, say } = fx.stage(api);
        // 두 바구니
        const bin = (x, w, title, c, icon) => {
          const g = api.n("g", {}, s);
          api.n("rect", { x, y: 250, width: w, height: 160, rx: 14, fill: c, opacity: 0.08 }, g);
          api.n("rect", { x, y: 250, width: w, height: 160, rx: 14, fill: "none", stroke: c, "stroke-width": 1.6, "stroke-dasharray": "5 4" }, g);
          fx.icon(api, g, icon, x + 20, 270, 18, c);
          api.t(title, { x: x + 34, y: 275, "font-size": 12, "font-weight": 900, fill: c }, g);
          return g;
        };
        bin(20, 156, "RAG가 잘함", GUIDE, "check");
        bin(184, 156, "다른 도구가 맞음", BAD, "x");
        const Q = [
          ["휴가 넘겨 쓸 수 있어?", 0, "뜻으로 찾기"],
          ["지난달 출장비 합계는?", 1, "집계 → SQL"],
          ["비슷한 장애 전에도 있었어?", 0, "비슷한 사례"],
          ["IT팀 사람이 노트북 잃으면 누가 승인?", 1, "여러 단계 → 그래프"],
          ["계약서에서 해지 조건 찾아 줘", 0, "근거 찾기"],
          ["주문 123 지금 어디?", 1, "실시간 → API"],
        ];
        const slot = [0, 0];
        const cards = Q.map(([q, b, why]) => {
          const k = slot[b]++;
          const g = api.n("g", {}, s);
          api.n("rect", { x: 0, y: 0, width: 148, height: 36, rx: 8, fill: "#fff", filter: "url(#fxsh)" }, g);
          const words = q.length > 13 ? [q.slice(0, q.lastIndexOf(" ", 13) > 0 ? q.lastIndexOf(" ", 13) : 13), q.slice(q.lastIndexOf(" ", 13) > 0 ? q.lastIndexOf(" ", 13) + 1 : 13)] : [q];
          words.forEach((w, i) => api.t(w, { x: 8, y: words.length > 1 ? 15 + i * 13 : 22, "font-size": 10.5, "font-weight": 700, fill: INK }, g));
          return { g, b, k };
        });
        const big = fx.bubble(api, s, 30, 40, 300, 56, "", { c: INK, fs: 13, tail: null });
        big.textEl.setAttribute("y", 24);
        const whyT = api.t("", { x: 150, y: 44, "text-anchor": "middle", "font-size": 11.5, "font-weight": 800, fill: GUIDE }, big);
        const D = 1.9;
        api.loop(t => {
          t = t % (Q.length * D + 3);
          const cur = Math.floor(t / D), u = t % D;
          big.setAttribute("opacity", cur < Q.length ? 1 - seg(u, 0.9, 1.1) : 0);
          if (cur < Q.length && big.textEl.textContent !== Q[cur][0]) { big.textEl.textContent = Q[cur][0]; whyT.textContent = Q[cur][2]; whyT.setAttribute("fill", Q[cur][1] ? BAD : GUIDE); }
          whyT.setAttribute("opacity", seg(u, 0.35, 0.55));
          cards.forEach(({ g, b, k }, i) => {
            const tx = (b ? 188 : 24), ty = 288 + k * 40;
            let x, y, o;
            if (i < cur) { x = tx; y = ty; o = 1; }
            else if (i === cur) { const m = seg(u, 0.9, 1.6); x = lerp(106, tx, m); y = lerp(56, ty, m); o = seg(u, 0.8, 1.0); }
            else { x = 106; y = 56; o = 0; }
            g.setAttribute("transform", `translate(${x}, ${y})`);
            g.setAttribute("opacity", o * (1 - seg(t, Q.length * D + 2.4, Q.length * D + 2.9)));
          });
          const end = Q.length * D;
          say(t, [[0.1, end, "비슷한 글 몇 개로 풀리는 질문인가?"], [end + 0.1, end + 2.8, "아니면 SQL, API, 그래프로 보내요"]]);
        }, 12);
      },
    }
