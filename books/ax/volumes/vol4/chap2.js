export default {
      title: "검색 평가: 정답 세트와 지표",
      tag: "질문과 정답 조각을 파일로 두고, 바꿀 때마다 다시 재요",
      lead: "검색을 바꿀 때마다 질문 몇 개를 손으로 넣어 보면 좋아진 것 같다는 느낌만 남아요. 질문과 정답 조각을 짝지은 정답 세트를 파일로 두고, 바꿀 때마다 같은 숫자로 재야 비교가 돼요. 단위 테스트와 같은 역할이에요.",
      body: `
<h3>정답 세트 만들기</h3>
<ol class="steps">
  <li><b>실제 질문을 모아요</b><small>로그, 슬랙, 문의 기록. 없으면 문서를 LLM에게 주고 질문을 만들게 한 뒤 사람이 고쳐요.</small></li>
  <li><b>질문마다 정답 조각을 적어요</b><small>실습에서는 답 조각에 반드시 있는 문구(key)로 적었어요. 조각 ID는 자르는 방법을 바꾸면 달라져서요.</small></li>
  <li><b>종류를 섞어요</b><small>바꿔 말한 질문, 문서 단어를 그대로 쓴 질문, 답이 없는 질문.</small></li>
</ol>

<h3>지표</h3>
<table class="vs">
  <tr><th>지표</th><th>뜻</th></tr>
  <tr><td>hit@k</td><td>정답 조각이 상위 k개 안에 있는 질문 비율. LLM에 k개를 넘긴다면 이게 가장 직접적이에요</td></tr>
  <tr><td>recall@k</td><td>정답 조각이 여러 개일 때, 그중 상위 k개 안에 든 비율</td></tr>
  <tr><td>MRR</td><td>정답 순위의 역수 평균(1위 1, 2위 0.5, 3위 0.33). 순서까지 봐요</td></tr>
</table>

<h3>실습: 정답 세트 22개</h3>
<table class="vs">
  <tr><th></th><th>바꿔 말한 16개 hit@1</th><th>단어 그대로 6개 hit@1</th><th>전체 MRR</th></tr>
  <tr><td>벡터</td><td>0.50</td><td>0.83</td><td>0.75</td></tr>
  <tr><td>BM25 두 글자</td><td>0.62</td><td>0.83</td><td>0.74</td></tr>
  <tr><td>하이브리드(RRF)</td><td>0.56</td><td>0.83</td><td>0.75</td></tr>
  <tr><td>하이브리드 + 재정렬</td><td><span class="good">0.94</span></td><td><span class="good">1.00</span></td><td><span class="good">0.95</span></td></tr>
</table>
<p>전체 평균만 보면 벡터, BM25, RRF가 거의 같아요(0.74~0.75). 질문 종류로 나눠 봐야 차이가 보여요. 벡터는 바꿔 말한 질문에서 hit@3이 1.00이라 후보를 넓게 잡는 데 강하고, 재정렬은 그 후보의 순서를 바로잡아요.</p>

<div class="try"><span class="lbl">직접 해 보기</span>
<p><code>rag-study/data/eval.json</code>: 정답 세트 파일이에요. 질문을 더해 봐요.</p>
<p><code>rag-study/step6_eval.py</code>: A 부분이 위 표를 만들어요.</p></div>`,
      lab: "정답 세트는 <b>검색의 회귀 테스트</b>예요. 청크 크기, 임베딩 모델, 재정렬 후보 수를 바꾸는 건 리팩터링이고, 정답 세트가 없으면 테스트 없이 리팩터링하는 셈이에요. 처음엔 20개로도 충분하고, 사용자가 틀렸다고 알려 준 질문을 하나씩 더해 가요. 버그 리포트를 재현 테스트로 만드는 것과 같아요.",
      quiz: {
        q: "전체 평균 MRR이 두 방식 모두 0.75로 같아요. 다음에 볼 것은?",
        options: ["둘이 같으니 아무거나 쓴다", "질문 종류별로 나눠서 어디서 다른지 본다", "정답 세트를 지운다"], answer: 1,
        explain: "실습에서도 전체 평균은 비슷했지만 바꿔 말한 질문과 단어를 그대로 쓴 질문에서 강약이 갈렸어요. 내 사용자가 어떤 질문을 많이 하는지에 맞춰 골라요.",
      },
      scene(api) {
        const { s, say } = fx.stage(api);
        const A = api.accent;
        // 정답 세트 파일
        const file = fx.card(api, s, 20, 14, 320, 96, { c: A, icon: "doc" });
        api.t("eval.json · 질문 22개", { x: 58, y: 36, "font-size": 12, "font-weight": 800, fill: INK }, s);
        const qs = [["할머니 돌아가시면 며칠 쉬어?", "조부모 사망은 3일"], ["반반차 쓸 수 있어?", "반반차는 없다"], ["손님 차는 어디 대?", "손님 전용"]];
        qs.forEach(([q, k], i) => {
          api.t(q, { x: 58, y: 58 + i * 18, "font-size": 10.5, fill: INK }, s);
          api.t(`→ ${k}`, { x: 326, y: 58 + i * 18, "text-anchor": "end", "font-size": 10.5, "font-weight": 700, fill: GUIDE }, s);
        });
        // 순위 예시: 한 질문의 상위 3개
        api.t("한 질문의 결과", { x: 20, y: 136, "font-size": 11.5, "font-weight": 800, fill: INK }, s);
        const ex = [[["숙박비", 0], ["경조 휴가", 1], ["연차 이월", 0]], [["경조 휴가", 1], ["연차 이월", 0], ["근무 시간", 0]]];
        const slots = [0, 1, 2].map(i => {
          const g = api.n("g", {}, s);
          const r = api.n("rect", { x: 20, y: 146 + i * 30, width: 160, height: 24, rx: 6, fill: "#fff", filter: "url(#fxsh)" }, g);
          api.t(`${i + 1}`, { x: 32, y: 162 + i * 30, "font-size": 11, "font-weight": 800, fill: MUTED }, g);
          const t = api.t("", { x: 48, y: 162 + i * 30, "font-size": 11.5, "font-weight": 800, fill: INK }, g);
          return { r, t };
        });
        const calc = [0, 1, 2].map(i => api.t("", { x: 196, y: 162 + i * 26, "font-size": 11.5, "font-weight": 800, fill: INK }, s));
        // 점수판
        const board = api.n("g", {}, s);
        api.n("rect", { x: 20, y: 248, width: 320, height: 164, rx: 12, fill: "#fff", filter: "url(#fxsh)" }, board);
        api.t("hit@1", { x: 34, y: 270, "font-size": 11.5, "font-weight": 800, fill: INK }, board);
        api.t("바꿔 말함", { x: 172, y: 270, "text-anchor": "middle", "font-size": 10, fill: MUTED }, board);
        api.t("단어 그대로", { x: 278, y: 270, "text-anchor": "middle", "font-size": 10, fill: MUTED }, board);
        const R = [["벡터", 0.5, 0.83], ["BM25", 0.62, 0.83], ["RRF", 0.56, 0.83], ["+재정렬", 0.94, 1.0]];
        const bars = R.map(([n, a, b], i) => {
          const y = 284 + i * 30;
          api.t(n, { x: 34, y: y + 13, "font-size": 11, "font-weight": 800, fill: INK }, board);
          const mk = (x, v, c) => {
            api.n("rect", { x, y, width: 64, height: 16, rx: 4, fill: PAPER }, board);
            const r = api.n("rect", { x, y, width: 0, height: 16, rx: 4, fill: c }, board);
            const l = api.t(v.toFixed(2), { x: x + 68, y: y + 12, "font-size": 10, "font-weight": 800, fill: INK, opacity: 0 }, board);
            return { r, l, w: 64 * v };
          };
          return [mk(140, a, i === 3 ? GUIDE : A), mk(246, b, i === 3 ? GUIDE : HARN)];
        });
        api.loop(t => {
          t = t % 13;
          file.setAttribute("opacity", 1);
          const k = t < 3.6 ? 0 : 1;
          const e = ex[k];
          slots.forEach(({ r, t: tx }, i) => {
            tx.textContent = t > 0.6 ? e[i][0] : "";
            r.setAttribute("fill", t > 1.2 && e[i][1] ? GUIDE : "#fff");
            tx.setAttribute("fill", t > 1.2 && e[i][1] ? "#fff" : INK);
          });
          const rank = e.findIndex(x => x[1]) + 1;
          const lines = [`정답 순위: ${rank}위`, `hit@1 = ${rank === 1 ? 1 : 0},  hit@3 = 1`, `MRR 기여 = 1/${rank} = ${(1 / rank).toFixed(2)}`];
          calc.forEach((c, i) => { c.textContent = t > 1.6 + i * 0.4 && t < 7.0 ? lines[i] : ""; c.setAttribute("fill", i === 1 && rank !== 1 ? HARN : INK); });
          board.setAttribute("opacity", seg(t, 7.0, 7.4));
          bars.forEach((pair, i) => pair.forEach(({ r, l, w }, j) => {
            const g = seg(t, 7.4 + i * 0.4 + j * 0.15, 8.0 + i * 0.4 + j * 0.15);
            r.setAttribute("width", w * g);
            l.setAttribute("opacity", g);
          }));
          say(t, [[0.2, 3.5, "질문마다 정답 조각이 몇 위인지 적어요"], [3.6, 6.9, "순위로 hit@k와 MRR을 계산해요"], [7.0, 12.8, "질문 종류로 나눠 봐야 차이가 보여요"]]);
        }, 10.5);
      },
    }
