export default {
      title: "RAG, 파인튜닝, 긴 컨텍스트, 도구",
      tag: "지식을 넣는 네 가지 길과 각자 잘하는 일",
      lead: "모델에게 모르는 것을 알려 주는 방법은 RAG만 있는 게 아니에요. 파인튜닝, 문서를 통째로 넣는 긴 컨텍스트, 실시간 값을 가져오는 도구 호출도 있어요. 실무에서는 섞어 써요.",
      body: `
<table class="vs">
  <tr><th></th><th>잘하는 일</th><th>약한 일</th></tr>
  <tr><td>RAG</td><td><span class="good">크고 자주 바뀌는 문서</span>, 출처 표시, 문서 단위 권한</td><td><span class="poor">검색이 틀리면 끝</span>, 여러 문서를 엮는 추론</td></tr>
  <tr><td>파인튜닝</td><td><span class="good">말투, 형식, 분류 같은 행동</span></td><td><span class="poor">사실 주입</span>(출처 없음, 바뀔 때마다 재학습)</td></tr>
  <tr><td>긴 컨텍스트</td><td><span class="good">문서가 적을 때 가장 단순</span>, 문서 전체를 보고 답</td><td><span class="poor">요청마다 비용과 지연</span>, 문서가 수천 개면 안 들어감</td></tr>
  <tr><td>도구 호출</td><td><span class="good">실시간 값</span>(재고, 주문 상태), 정확한 조회</td><td><span class="poor">자유 문장 검색</span>은 도구 하나로 안 됨</td></tr>
</table>

<h3>고르는 순서</h3>
<ol class="steps">
  <li><b>문서가 적다</b><small>프롬프트에 다 넣어요. 같은 문서를 반복해서 넣으면 프롬프트 캐싱으로 비용을 줄일 수 있어요.</small></li>
  <li><b>값이 DB나 API에 있다</b><small>도구 호출이에요. 검색보다 정확해요.</small></li>
  <li><b>문서가 많고 계속 바뀐다</b><small>RAG예요.</small></li>
  <li><b>지식이 아니라 행동을 바꾸고 싶다</b><small>먼저 프롬프트와 예시로 해 보고, 안 될 때만 파인튜닝을 생각해요.</small></li>
</ol>`,
      lab: "설정값 전달 방식에 비유하면 이래요. <b>파인튜닝</b>은 값을 코드에 하드코딩, <b>긴 컨텍스트</b>는 매 요청에 설정 파일 전체를 첨부, <b>RAG</b>는 필요한 키만 설정 저장소에서 조회, <b>도구 호출</b>은 실시간 값을 원천 API에 직접 묻기예요. 어느 게 맞는지는 값의 크기와 바뀌는 속도가 정해요.",
      quiz: {
        q: "사내 규정 문서 20쪽짜리 하나로 Q&A를 만들려고 해요. 가장 먼저 해 볼 방법은?",
        options: ["벡터 DB를 세우고 RAG 구축", "규정 전체를 프롬프트에 넣기", "규정으로 모델 파인튜닝"], answer: 1,
        explain: "문서가 작으면 통째로 넣는 게 가장 단순하고 정확해요. 검색이 틀릴 일도 없어요. 문서가 커지고 늘어나면 그때 RAG로 가요.",
      },
      scene(api) {
        const { s, say } = fx.stage(api);
        const A = api.accent;
        const sit = fx.card(api, s, 20, 16, 320, 54, { title: "", sub: "", c: INK, icon: "spark" });
        api.t("상황", { x: 58, y: 36, "font-size": 10.5, "font-weight": 800, fill: MUTED }, sit);
        const sitT = api.t("", { x: 58, y: 56, "font-size": 13.5, "font-weight": 800, fill: INK }, sit);
        const M = [["RAG", "필요한 조각만 찾아 넣기", "search", A], ["파인튜닝", "행동·말투를 학습", "gear", HARN], ["긴 컨텍스트", "문서를 통째로 넣기", "doc", GUIDE], ["도구 호출", "원천에 직접 조회", "tool", HOOK]];
        const pos = [[20, 96], [190, 96], [20, 222], [190, 222]];
        const cards = M.map(([n, d, ic, c], i) => {
          const [x, y] = pos[i];
          const g = api.n("g", { transform: `translate(${x}, ${y})` }, s);
          const hl = api.n("rect", { x: -3, y: -3, width: 156, height: 112, rx: 13, fill: "none", stroke: c, "stroke-width": 3, opacity: 0, filter: "url(#fxglow)" }, g);
          api.n("rect", { x: 0, y: 0, width: 150, height: 106, rx: 11, fill: "#fff", filter: "url(#fxsh)" }, g);
          fx.icon(api, g, ic, 26, 26, 24, c);
          api.t(n, { x: 46, y: 31, "font-size": 13.5, "font-weight": 800, fill: INK }, g);
          api.t(d, { x: 14, y: 60, "font-size": 10.5, fill: MUTED }, g);
          api.n("rect", { x: 14, y: 78, width: 122, height: 10, rx: 5, fill: PAPER }, g);
          const bar = api.n("rect", { x: 14, y: 78, width: 0, height: 10, rx: 5, fill: c }, g);
          const ck = api.n("g", { opacity: 0 }, g);
          api.n("circle", { cx: 130, cy: 22, r: 12, fill: c }, ck);
          fx.icon(api, ck, "check", 130, 22, 16, "#fff");
          return { g, hl, bar, ck, x, y };
        });
        const S = [
          ["문서 수천 개, 매주 바뀜", [0.9, 0.2, 0.3, 0.35], 0, "검색해서 필요한 조각만 넣어요"],
          ["규정 문서 20쪽 하나", [0.5, 0.2, 0.95, 0.3], 2, "작으면 통째로 넣는 게 가장 정확해요"],
          ["주문 상태, 실시간 재고", [0.25, 0.1, 0.2, 0.95], 3, "실시간 값은 원천에 직접 물어요"],
          ["답 말투를 우리 팀식으로", [0.15, 0.85, 0.3, 0.1], 1, "행동을 바꿀 때만 학습을 고려해요"],
        ];
        api.loop(t => {
          const D = 3.4, i = Math.floor(t / D) % S.length, u = t % D, f = seg(u, 0.1, 0.9);
          const prev = S[(i + S.length - 1) % S.length];
          if (sitT.textContent !== S[i][0]) sitT.textContent = S[i][0];
          sit.setAttribute("opacity", seg(u, 0, 0.3));
          cards.forEach((c, k) => {
            c.bar.setAttribute("width", 122 * lerp(prev[1][k], S[i][1][k], f));
            const best = k === S[i][2] ? seg(u, 0.9, 1.2) : 0;
            c.hl.setAttribute("opacity", best);
            c.ck.setAttribute("opacity", best);
            c.g.setAttribute("transform", `translate(${c.x}, ${c.y - 4 * best})`);
            c.g.setAttribute("opacity", 0.55 + 0.45 * Math.max(best, k === S[i][2] ? 0 : 1 - seg(u, 0.9, 1.2)));
          });
          say(u + i * D, [[i * D + 0.9, i * D + D - 0.1, S[i][3]]]);
        }, 1.4);
      },
    }
