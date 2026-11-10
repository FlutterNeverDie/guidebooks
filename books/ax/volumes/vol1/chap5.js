export default {
      title: "RAG가 답이 아닐 때",
      tag: "검색이 아니라 계산, 조회, 관계가 필요한 질문",
      lead: "RAG는 '비슷한 글을 찾아 읽는' 방식이라, 질문이 계산이나 정확한 조회나 여러 단계의 관계를 요구하면 잘 안 돼요. 질문의 모양을 먼저 보고 도구를 고르는 게 AX 개발자의 첫 판단이에요.",
      body: `
<table class="vs">
  <tr><th>질문 모양</th><th>예</th><th>맞는 방법</th></tr>
  <tr><td>집계·계산</td><td>지난달 환불 건수는?</td><td>SQL 도구(모델이 쿼리를 쓰고 코드가 실행)</td></tr>
  <tr><td>정확한 키 조회</td><td>오류 코드 E-1042 뜻은?</td><td>키 조회 도구, 키워드 검색</td></tr>
  <tr><td>실시간 상태</td><td>주문 123 지금 어디?</td><td>API 도구 호출</td></tr>
  <tr><td>여러 단계 관계</td><td>A팀 장비를 잃어버리면 누구 승인?</td><td>지식 그래프(5권)</td></tr>
  <tr><td>뜻으로 찾기</td><td>휴가 넘겨 쓸 수 있어?</td><td><b>RAG</b></td></tr>
</table>

<h3>내 시스템에서 보면</h3>
<p>내가 만든 ai-native의 질문하기(ask)에는 벡터 DB가 없어요. 사람이 Slack 메뉴에서 안내 하나(오류 코드 찾기, CFG 설정 찾기 같은)를 고르면, 모델은 <b>그 안내 도구(MCP) 하나만</b> 쓸 수 있어요. 답이 나오면 근거를 갖췄는지 코드가 검사한 뒤에 내보내요. 위 표로 치면 "정확한 키 조회"에 맞춘 설계예요. 6권에서 이 구조를 자세히 다시 봐요.</p>

<div class="cards">
  <div class="card"><b>섞어 쓰는 게 보통이에요</b>도구 여러 개 중 하나로 "문서 검색(RAG)"을 두고, 모델이 질문에 맞는 도구를 고르게 해요. 이게 에이전트형 RAG예요.</div>
</div>`,
      lab: "모든 데이터를 Elasticsearch에 넣지 않는 것과 같아요. 집계는 RDB에서, 캐시 조회는 Redis에서, 전문 검색은 검색 엔진에서 하죠. LLM 시스템도 질문마다 맞는 저장소와 조회 방식을 붙이고, RAG는 그중 <b>전문 검색 자리</b>를 맡아요.",
      quiz: {
        q: "\"이번 분기 부서별 평균 처리 시간\"을 묻는 질문에 가장 맞는 방법은?",
        options: ["보고서 문서를 RAG로 검색", "모델이 SQL을 쓰고 코드가 DB에서 실행하는 도구", "질문을 그대로 모델에 묻기"], answer: 1,
        explain: "집계는 검색으로 찾는 게 아니라 계산해야 해요. 비슷한 문장을 찾아 읽어서는 정확한 숫자가 나오지 않아요.",
      },
      scene(api) {
        const { s, say } = fx.stage(api);
        const A = api.accent;
        const q = fx.bubble(api, s, 30, 14, 300, 40, "", { c: INK, fs: 12.5, tail: "down" });
        // 분기점
        const dia = api.n("g", { transform: "translate(180, 104)" }, s);
        api.n("rect", { x: -34, y: -34, width: 68, height: 68, rx: 10, fill: "#fff", filter: "url(#fxsh)", transform: "rotate(45)" }, dia);
        api.t("질문", { x: 0, y: -2, "text-anchor": "middle", "font-size": 11, "font-weight": 800, fill: INK }, dia);
        api.t("모양?", { x: 0, y: 13, "text-anchor": "middle", "font-size": 11, "font-weight": 800, fill: INK }, dia);
        const T = [["SQL 도구", "table", HARN, 20, 180], ["키 조회", "key", HOOK, 190, 180], ["API 도구", "api", GUIDE, 20, 290], ["RAG", "search", A, 190, 290]];
        const cards = T.map(([n, ic, c, x, y]) => {
          const g = api.n("g", { transform: `translate(${x}, ${y})` }, s);
          const hl = api.n("rect", { x: -3, y: -3, width: 156, height: 96, rx: 13, fill: "none", stroke: c, "stroke-width": 3, opacity: 0, filter: "url(#fxglow)" }, g);
          api.n("rect", { x: 0, y: 0, width: 150, height: 90, rx: 11, fill: "#fff", filter: "url(#fxsh)" }, g);
          fx.icon(api, g, ic, 24, 24, 22, c);
          api.t(n, { x: 44, y: 29, "font-size": 13, "font-weight": 800, fill: INK }, g);
          const out = api.t("", { x: 14, y: 66, "font-size": 11, "font-weight": 700, fill: c }, g);
          return { g, hl, out, cx: x + 75, cy: y };
        });
        const dot = api.n("circle", { r: 7, fill: A, filter: "url(#fxglow)" }, s);
        const C = [
          ["지난달 환불 건수는?", 0, "SELECT count(*) → 128건", "집계는 검색이 아니라 계산이에요"],
          ["오류 코드 E-1042 뜻은?", 1, "E-1042 → 결제 시간 초과", "정확한 키는 바로 조회해요"],
          ["주문 123 지금 어디?", 2, "GET /orders/123 → 배송 중", "실시간 값은 API에 물어요"],
          ["휴가 넘겨 쓸 수 있어?", 3, "[leave-2] 최대 5일 이월", "뜻으로 찾는 질문이 RAG 자리예요"],
        ];
        api.loop(t => {
          const D = 3.6, i = Math.floor(t / D) % C.length, u = t % D;
          const [text, k, res, cap] = C[i];
          q.setAttribute("opacity", seg(u, 0, 0.25));
          fx.type(q.textEl, text, seg(u, 0.05, 0.7));
          const m = seg(u, 0.9, 1.7);
          const [x, y] = fx.along([[180, 138], [180, 150], [cards[k].cx, cards[k].cy - 6]], m);
          dot.setAttribute("cx", x); dot.setAttribute("cy", y);
          dot.setAttribute("opacity", m > 0 && m < 1 ? 1 : 0);
          cards.forEach((c, j) => {
            const on = j === k ? seg(u, 1.6, 1.9) : 0;
            c.hl.setAttribute("opacity", on);
            c.g.setAttribute("opacity", 0.5 + 0.5 * (j === k ? 1 : 1 - seg(u, 0.9, 1.3)));
            if (j === k) fx.type(c.out, res, seg(u, 1.9, 2.8)); else c.out.textContent = "";
          });
          dia.setAttribute("transform", `translate(180, 104) scale(${1 + 0.06 * Math.sin(Math.PI * seg(u, 0.7, 1.1))})`);
          say(u, [[1.9, D - 0.05, cap]]);
        }, 2.9);
      },
    }
