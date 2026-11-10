export default {
      title: "질문하기(ask)는 작은 RAG예요",
      tag: "검색은 키워드 도구, 질문 바꿔 쓰기는 Claude, 근거 검사는 코드",
      lead: "Slack '질문하기'를 RAG의 눈으로 보면 세 단계가 그대로 있어요. 안내 도구로 찾고(검색), 도구 결과를 대화에 넣고(보강), 그걸로만 답해요(생성). 그리고 4권에서 만든 것과 같은 모양의 근거 검사가 답이 나가기 전에 돌아요.",
      body: `
<h3>RAG 단계로 나눠 보면</h3>
<table class="vs">
  <tr><th>RAG</th><th>ask에서</th><th>근거</th></tr>
  <tr><td>라우팅</td><td>사람이 안내 도구 5개 중 하나를 고름(화면 문제, CFG, 오류 코드, 배포 내용, 일본)</td><td><code>bot/src/questions.ts</code>의 <code>QUESTION_TOOLS</code></td></tr>
  <tr><td>검색</td><td>kiosk-guide MCP 도구. 프롬프트에 "도구는 문장의 뜻을 이해하지 못하고 글자가 겹치는지만 본다"고 적혀 있어요. 즉 <b>키워드 검색</b>이에요</td><td><code>prompts/ask.md</code></td></tr>
  <tr><td>질문 바꿔 쓰기</td><td>Claude가 질문에서 짧은 핵심 낱말을 뽑아 찾고, 못 찾으면 다른 낱말로 2번까지 더 찾아요</td><td><code>prompts/ask.md</code></td></tr>
  <tr><td>생성</td><td>도구 결과로만, JSON <code>{"found", "answer"}</code> 하나로 답해요</td><td><code>prompts/ask.md</code></td></tr>
  <tr><td>근거 검사</td><td>답에 쓴 CFG 번호, 오류 코드, 주소, 네 자리 이상 숫자가 도구 결과나 질문에 없으면 답을 버려요</td><td><code>scripts/ask_check.py</code>의 <code>unsupported</code></td></tr>
  <tr><td>정답 세트</td><td>질문 13개로 도구, 찾음 여부, 기대 내용을 시험해요</td><td><code>evals/ask-cases.json</code>, <code>scripts/ask_eval.py</code></td></tr>
</table>

<h3>이 책의 말로 읽은 강점과 약점</h3>
<ul>
  <li><b>강점</b>: 오류 코드, CFG 번호처럼 정확한 키를 찾는 질문이 많아서 키워드 검색이 잘 맞아요(3권 4장에서 단어를 그대로 쓴 질문은 BM25도 강했어요). 근거 검사가 값 단위로 막아요.</li>
  <li><b>약점</b>: "쿠폰 쓰는 데가 없어요"처럼 바꿔 말한 질문은 Claude가 낱말을 잘 뽑아야만 찾아요. 1~3권의 실습에서 바꿔 말한 질문은 키워드 검색이 약했어요.</li>
  <li><b>근거 검사의 한계</b>: 4권 3장처럼, 도구 결과 안에 있는 다른 코드를 잘못 골라 쓰면 통과해요. 뜻이 맞는지는 정답 시험과 사람이 봐요.</li>
</ul>

<h3>다음에 붙일 수 있는 것 (제안)</h3>
<p>허브 코드를 고치자는 게 아니라, 배운 것을 어디에 쓸 수 있는지 보는 연습이에요.</p>
<ul>
  <li><b>바꿔 말한 질문</b>: 안내 도구 서버 쪽에 벡터 검색이나 하이브리드(RRF)를 더하면 낱말을 못 맞혀도 찾을 수 있어요. 먼저 <code>evals/ask-cases.json</code>에 바꿔 말한 질문을 더해 지금 수준을 재요(4권 2장).</li>
  <li><b>관계 질문</b>: "이 오류 코드가 나오면 어떤 CFG를 봐야 하나"처럼 오류 코드, CFG, 화면, 기능을 잇는 질문이 많다면 작은 그래프가 맞아요(5권).</li>
</ul>`,
      lab: "ask는 <b>검색 API 앞에 붙은 똑똑한 클라이언트</b>예요. 검색 서버(MCP 도구)는 단순한 키워드 매칭이고, 클라이언트(Claude)가 사용자의 말을 검색어로 바꾸고, 결과가 없으면 검색어를 바꿔 다시 부르고, 응답을 사람 말로 정리해요. 그리고 게이트웨이(<code>ask_check.py</code>)가 응답에 원본에 없는 값이 섞였는지 마지막으로 봐요.",
      quiz: {
        q: "ask의 안내 도구가 '글자가 겹치는지만' 본다면, 어떤 질문에서 가장 약할까요?",
        options: ["\"8006 오류가 뭐예요?\"", "\"결제 화면에 할인 받는 데가 안 보여요\"처럼 문서와 다른 말로 한 질문", "\"CFG 120이 뭐예요?\""], answer: 1,
        explain: "코드 번호는 글자가 그대로 겹쳐서 잘 찾아요. 문서와 다른 말로 한 질문은 Claude가 맞는 낱말을 뽑아야만 찾아요. 이런 질문에 강한 것이 벡터 검색이에요.",
      },
      scene(api) {
        const { s, say } = fx.stage(api);
        const A = api.accent;
        // 단계 띠: R / A / G / 검사
        const tag = (x, y, w, c) => { const g = api.n("g", {}, s); api.n("rect", { x, y, width: 64, height: 18, rx: 9, fill: c }, g); api.t(w, { x: x + 32, y: y + 13, "text-anchor": "middle", "font-size": 10, "font-weight": 900, fill: "#fff" }, g); return g; };
        const q = fx.bubble(api, s, 20, 14, 230, 34, "결제 화면에 쿠폰 쓰는 데가 없어요", { c: INK, fs: 11.5, tail: "left" });
        const pick = fx.card(api, s, 262, 14, 78, 34, { title: "화면 문제", c: HOOK, fs: 10.5 });
        const t0 = tag(262, 54, 0, HOOK); t0.querySelector("text").textContent = "사람이 고름";
        // Claude 낱말 뽑기
        const cl = fx.card(api, s, 20, 84, 320, 70, { c: A, icon: "llm" });
        api.t("Claude: 핵심 낱말로 찾기", { x: 58, y: 106, "font-size": 11.5, "font-weight": 800, fill: INK }, s);
        const kws = ["쿠폰", "할인", "버튼"].map((w, i) => {
          const g = api.n("g", { opacity: 0 }, s);
          api.n("rect", { x: 58 + i * 64, y: 118, width: 56, height: 24, rx: 12, fill: A, opacity: 0.12 }, g);
          api.t(w, { x: 86 + i * 64, y: 134, "text-anchor": "middle", "font-size": 11.5, "font-weight": 800, fill: A }, g);
          const st = api.t("", { x: 86 + i * 64, y: 152, "text-anchor": "middle", "font-size": 9.5, "font-weight": 800, fill: MUTED }, g);
          return { g, st };
        });
        const tR = tag(270, 92, 0, A); tR.querySelector("text").textContent = "검색";
        // 도구 결과
        const tool = fx.card(api, s, 20, 166, 320, 62, { c: HOOK, icon: "search" });
        api.t("troubleshoot_ui 결과 (그림용 예시)", { x: 58, y: 188, "font-size": 11, "font-weight": 800, fill: INK }, s);
        const toolT = api.t("", { x: 58, y: 210, "font-size": 11, fill: INK }, s);
        const tA = tag(270, 174, 0, HOOK); tA.querySelector("text").textContent = "보강";
        // 답
        const ans = fx.card(api, s, 20, 240, 320, 62, { c: GUIDE, icon: "doc" });
        api.t('{"found": true, "answer": …}', { x: 58, y: 262, "font-size": 11, "font-weight": 800, fill: INK, "font-family": "ui-monospace, Menlo, monospace" }, s);
        const ansT = api.t("", { x: 58, y: 284, "font-size": 11, fill: INK }, s);
        const tG = tag(270, 248, 0, GUIDE); tG.querySelector("text").textContent = "생성";
        // 검사
        const chk = api.n("g", {}, s);
        api.n("rect", { x: 20, y: 314, width: 320, height: 96, rx: 12, fill: "#1f2430" }, chk);
        fx.icon(api, chk, "lock", 44, 340, 18, "#fff");
        api.t("ask_check.py", { x: 62, y: 345, "font-size": 12, "font-weight": 900, fill: "#fff" }, chk);
        const c1 = api.t("", { x: 40, y: 370, "font-size": 11, "font-weight": 700, fill: "#cfd5e2" }, chk);
        const c2 = api.t("", { x: 40, y: 392, "font-size": 11, "font-weight": 700, fill: "#cfd5e2" }, chk);
        api.loop(t => {
          t = t % 14;
          pick.setAttribute("opacity", seg(t, 0.6, 0.9)); t0.setAttribute("opacity", seg(t, 0.6, 0.9));
          cl.setAttribute("opacity", seg(t, 1.2, 1.5)); tR.setAttribute("opacity", seg(t, 1.2, 1.5));
          kws.forEach(({ g, st }, i) => {
            g.setAttribute("opacity", seg(t, 1.8 + i * 1.1, 2.1 + i * 1.1));
            st.textContent = t > 2.5 + i * 1.1 ? (i === 0 ? "못 찾음" : i === 1 ? "찾음" : "") : "";
            st.setAttribute("fill", i === 1 ? GUIDE : MUTED);
          });
          [tool, tA].forEach(e => e.setAttribute("opacity", seg(t, 4.0, 4.3)));
          fx.type(toolT, "할인 항목이 안 보이면 관리자에서 설정을 확인", seg(t, 4.3, 5.6));
          [ans, tG].forEach(e => e.setAttribute("opacity", seg(t, 6.0, 6.3)));
          fx.type(ansT, "관리자 화면에서 할인 사용 설정을 먼저 켜 주세요", seg(t, 6.3, 7.6));
          chk.setAttribute("opacity", seg(t, 8.0, 8.3));
          c1.textContent = t > 8.6 ? "✓ 고른 도구만 불렀나 (TOOL_VIOLATION)" : "";
          c2.textContent = t > 9.4 ? "✓ CFG·오류 코드·주소·긴 숫자가 근거에 있나" : "";
          c2.setAttribute("fill", t > 10 ? "#5fd39a" : "#cfd5e2");
          say(t, [[0.2, 3.9, "사람이 도구를 고르고, Claude가 낱말을 바꿔 가며 찾아요"], [4.0, 7.9, "도구 결과만 보고 JSON으로 답해요"], [8.0, 13.8, "나가기 전에 코드가 근거를 확인해요"]]);
        }, 11);
      },
    }
