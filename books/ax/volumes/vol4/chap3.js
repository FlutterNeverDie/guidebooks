export default {
      title: "답 평가: 근거대로 말했나",
      tag: "코드 검사, LLM 채점, 사람 검토를 겹쳐요",
      lead: "검색이 맞는 조각을 가져와도 LLM이 그 조각과 다르게 말할 수 있어요. 그래서 답도 따로 평가해요. 가장 중요한 축은 근거성, 즉 답의 내용이 넘겨준 자료에 실제로 있느냐예요. 방법은 하나로 끝나지 않고 여러 겹으로 써요.",
      body: `
<h3>답을 보는 세 축</h3>
<table class="vs">
  <tr><th>축</th><th>묻는 것</th></tr>
  <tr><td>근거성</td><td>답의 내용이 넘겨준 조각에 있나(지어낸 게 없나)</td></tr>
  <tr><td>관련성</td><td>질문에 답했나(엉뚱한 이야기를 하지 않았나)</td></tr>
  <tr><td>완결성</td><td>필요한 조건을 빠뜨리지 않았나("3월 31일까지"를 빼먹는 식)</td></tr>
</table>

<h3>세 겹의 검사</h3>
<table class="vs">
  <tr><th>방법</th><th>잘 잡는 것</th><th>못 잡는 것</th></tr>
  <tr><td>코드 검사</td><td><span class="good">빠진 인용, 없는 조각 번호, 조각에 없는 숫자</span></td><td>조각 안의 다른 숫자를 잘못 고른 것, 뜻이 틀린 것</td></tr>
  <tr><td>LLM 채점</td><td>뜻이 맞는지, 빠진 조건</td><td><span class="poor">채점 모델도 틀려요.</span> 기준표를 주고 표본을 사람이 다시 봐요</td></tr>
  <tr><td>사람 검토</td><td>가장 정확</td><td>느리고 비싸서 표본만</td></tr>
</table>

<h3>실습: 숫자 근거 검사</h3>
<pre class="code"><code>for num in re.findall(r"\\d[\\d,]*\\s*(?:일|원|달러|시간|회|건)", answer):
    if num not in cited_text:
        problems.append(f"'{num}'이 인용한 조각에 없음")</code></pre>
<table class="vs">
  <tr><th>답</th><th>결과</th></tr>
  <tr><td>조부모상은 3일 쉴 수 있어요 [c6]</td><td><span class="good">통과</span>(맞는 답)</td></tr>
  <tr><td>조부모상은 7일 쉴 수 있어요 [c6]</td><td><span class="good">막음</span>(조각에 7일이 없음)</td></tr>
  <tr><td>조부모상은 3일이에요</td><td><span class="good">막음</span>(인용 없음)</td></tr>
  <tr><td>조부모상은 5일 쉴 수 있어요 [c6]</td><td><span class="poor">통과</span>(틀린 답인데 같은 조각에 '본인 결혼은 5일'이 있음)</td></tr>
</table>
<p>마지막 줄이 코드 검사의 한계예요. 그래서 LLM 채점과 사람 표본 검토를 겹쳐요. 내 시스템이 실제로 어떤 근거 검사를 하는지는 6권에서 봐요.</p>

<div class="try"><span class="lbl">직접 해 보기</span>
<p><code>rag-study/step6_eval.py</code>: E 부분이 위 표예요. 답 문장을 바꿔 무엇이 통과하는지 봐요.</p></div>`,
      lab: "<b>입력 검증과 테스트를 겹치는 것</b>과 같아요. 스키마 검증(코드 검사)은 형식과 범위를 확실히 막지만 업무 규칙 위반은 못 잡고, 통합 테스트(LLM 채점)는 더 넓게 잡지만 가끔 틀리고, QA(사람 검토)는 가장 정확하지만 표본만 봐요. 한 겹만 믿지 않아요.",
      quiz: {
        q: "답에 적힌 숫자가 인용한 조각에 있는지 코드로 확인해요. 이 검사가 못 막는 것은?",
        options: ["인용 없이 쓴 답", "조각에 아예 없는 숫자를 지어낸 답", "조각 안에 있는 다른 숫자를 잘못 골라 쓴 답"], answer: 2,
        explain: "숫자가 조각 어딘가에 있으면 통과해요. 실습의 '5일' 답이 그랬어요. 이런 건 LLM 채점이나 사람 검토로 잡아요.",
      },
      scene(api) {
        const { s, say } = fx.stage(api);
        const A = api.accent;
        // 인용한 조각
        const src = fx.card(api, s, 20, 14, 320, 62, { c: GUIDE, icon: "doc" });
        api.t("[c6] 경조 휴가는 연차와 따로 준다.", { x: 60, y: 38, "font-size": 11, "font-weight": 800, fill: INK }, s);
        api.t("본인 결혼은 5일 … 조부모 사망은 3일이다.", { x: 60, y: 58, "font-size": 11, fill: INK }, s);
        // 관문 셋
        const G = [["인용 있나", "key"], ["숫자가 조각에 있나", "search"], ["뜻이 맞나 (LLM·사람)", "user"]];
        const gates = G.map(([n, ic], i) => {
          const y = 104 + i * 70;
          const g = api.n("g", {}, s);
          api.n("rect", { x: 212, y, width: 128, height: 52, rx: 10, fill: i === 2 ? PAPER : "#fff", stroke: i === 2 ? MUTED : INK, "stroke-width": 1.4, "stroke-dasharray": i === 2 ? "4 3" : "none" }, g);
          fx.icon(api, g, ic, 228, y + 26, 18, i === 2 ? MUTED : INK);
          const lines = n.split(" (");
          api.t(lines[0], { x: 242, y: y + (lines[1] ? 23 : 31), "font-size": 10.5, "font-weight": 800, fill: INK }, g);
          if (lines[1]) api.t("(" + lines[1], { x: 242, y: y + 39, "font-size": 9.5, fill: MUTED }, g);
          return { g, y };
        });
        // 답 카드
        const A4 = [["3일 [c6]", 3, GUIDE, "통과"], ["7일 [c6]", 1, BAD, "막음: 7일이 조각에 없음"], ["3일 (인용 없음)", 0, BAD, "막음: 인용 없음"], ["5일 [c6]", 2, HARN, "코드는 통과, 뜻이 틀림"]];
        const card = api.n("g", {}, s);
        api.n("rect", { x: 0, y: 0, width: 168, height: 40, rx: 10, fill: "#fff", stroke: INK, "stroke-width": 1.4, filter: "url(#fxsh)" }, card);
        api.t("조부모상은", { x: 12, y: 16, "font-size": 10, fill: MUTED }, card);
        const cT = api.t("", { x: 12, y: 32, "font-size": 12.5, "font-weight": 900, fill: INK }, card);
        const verdict = fx.card(api, s, 20, 330, 320, 50, { c: GUIDE });
        const vT = api.t("", { x: 38, y: 360, "font-size": 12.5, "font-weight": 900, fill: GUIDE }, s);
        const lamps = G.map((_, i) => api.n("circle", { cx: 200, cy: 130 + i * 70, r: 6, fill: LINE }, s));
        const D = 3.6;
        api.loop(t => {
          const k = Math.floor(t / D) % A4.length, u = t % D, [txt, stop, c, v] = A4[k];
          cT.textContent = txt;
          // 카드가 관문을 따라 내려감. stop = 멈추는 관문 번호 (3 = 다 통과)
          const reach = Math.min(stop, 2);
          const prog = seg(u, 0.2, 0.4 + reach * 0.6);
          const y = lerp(110, 110 + reach * 70, prog);
          card.setAttribute("transform", `translate(20, ${y})`);
          card.setAttribute("opacity", 1 - seg(u, D - 0.3, D));
          lamps.forEach((l, i) => {
            const passed = u > 0.5 + i * 0.6 && (i < stop || stop === 3);
            const failed = i === stop && stop < 3 && u > 0.6 + reach * 0.6;
            const warn = k === 3 && i === 2 && u > 1.8;
            l.setAttribute("fill", warn ? HARN : failed ? BAD : passed ? GUIDE : LINE);
          });
          const done = u > 0.8 + reach * 0.6;
          verdict.setAttribute("opacity", done ? 1 - seg(u, D - 0.3, D) : 0);
          vT.textContent = done ? v : "";
          vT.setAttribute("fill", c);
          verdict.querySelector("rect:nth-child(2)").setAttribute("fill", c);
          say(t % (D * 4), [[0.1, D * 4, k === 3 ? "코드 검사만으로는 못 잡는 게 있어요" : "답이 나가기 전에 관문을 거쳐요"]]);
        }, 5);
      },
    }
