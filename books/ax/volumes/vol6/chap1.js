export default {
      title: "오케스트레이션이란",
      tag: "누가 다음에 무엇을 하는지, 어디까지 했는지",
      lead: "LLM 앱이 커지면 모델 호출보다 '다음에 무엇을 할지'와 '지금 어디까지 했는지'를 관리하는 일이 커져요. 이걸 오케스트레이션이라고 불러요. LangGraph 같은 프레임워크가 이 일을 해 주고, ai-native는 같은 일을 TypeScript 상태 기계와 GitHub Actions로 직접 해요.",
      body: `
<h3>세 층으로 나눠 보면</h3>
<table class="vs">
  <tr><th>층</th><th>하는 일</th><th>도구 예</th></tr>
  <tr><td>부품</td><td>문서 읽기, 자르기, 임베딩, 검색, 프롬프트</td><td>LangChain(1~5권에서 손으로 짠 것들의 묶음)</td></tr>
  <tr><td>제어 흐름과 상태</td><td>다음 단계 고르기, 사람 승인 기다리기, 실패 시 재시도, 진행 저장</td><td>LangGraph, 직접 만든 상태 기계</td></tr>
  <tr><td>실행</td><td>모델을 어디서 어떤 권한으로 돌리나</td><td>서버, 큐, CI 러너</td></tr>
</table>

<h3>LangGraph 개념으로 ai-native 읽기</h3>
<table class="vs">
  <tr><th>LangGraph</th><th>ai-native</th></tr>
  <tr><td>상태(State)</td><td><code>bot/src/machine.ts</code>의 <code>Workflow</code> 타입. 상태값은 <code>menu</code>, <code>specifying</code>, <code>asking</code>, <code>awaiting_confirm</code>, <code>building</code>, <code>done</code> 등</td></tr>
  <tr><td>노드</td><td>워크플로의 단계(stage) 셋: <code>spec</code>(중앙), <code>build</code>(워커), <code>ask</code>(질문)</td></tr>
  <tr><td>엣지와 조건 분기</td><td>순수 함수 <code>reduce(wf, event, ctx)</code>가 다음 상태와 할 일(Effect)을 돌려줌</td></tr>
  <tr><td>사람 개입(interrupt)</td><td><code>asking</code>(객관식 질문), <code>awaiting_confirm</code>(기획서 확인) 상태에서 사람의 버튼을 기다림</td></tr>
  <tr><td>체크포인터</td><td><code>bot/src/store.ts</code>: 작업 하나 = <code>data/wf/wf-NNNN.json</code> 하나</td></tr>
</table>

<h3>상태 기계를 직접 둔 이유가 보여요</h3>
<ul>
  <li><b>테스트</b>: <code>reduce</code>가 순수 함수라 Slack 없이 이벤트만 넣어 시험해요(Vitest).</li>
  <li><b>한도</b>: <code>LIMITS</code>에 중앙 15분, 질문 15분, 워커 50분, 사람 답 24시간, 수정 3번, 재시도 3번이 적혀 있어요.</li>
  <li><b>권한</b>: 사람이 누르는 이벤트는 <code>reduce</code> 맨 앞에서 요청한 사람인지 먼저 확인해요.</li>
</ul>`,
      lab: "오케스트레이션은 <b>주문 처리 같은 사가(saga)나 워크플로 엔진</b>과 같은 문제예요. 단계마다 외부 호출(여기서는 Claude)이 있고, 실패와 타임아웃이 있고, 사람 승인이 끼고, 중간 상태를 저장해야 해요. LangGraph는 LLM용 워크플로 엔진이고, ai-native의 <code>reduce</code> + <code>engine.ts</code>는 이벤트 소싱 스타일로 직접 만든 엔진이에요.",
      quiz: {
        q: "ai-native에서 LangGraph의 '사람 개입(interrupt)'에 해당하는 것은?",
        options: ["store.ts가 JSON 파일을 쓰는 것", "awaiting_confirm 상태에서 사람이 기획서를 확인할 때까지 기다리는 것", "worker가 flutter analyze를 돌리는 것"], answer: 1,
        explain: "흐름이 멈추고 사람의 입력을 기다리는 지점이 interrupt예요. ai-native는 객관식 질문(asking)과 기획서 확인(awaiting_confirm)에서 멈춰요. 기획서 확인 전에는 build를 시작하지 않아요.",
      },
      scene(api) {
        const { s, say } = fx.stage(api);
        const A = api.accent;
        // 상태 노드 (machine.ts의 Status 일부)
        const S = {
          menu: [180, 30, "menu", INK], specifying: [180, 96, "specifying", GUIDE], asking: [70, 160, "asking", HOOK],
          awaiting_confirm: [180, 224, "awaiting_confirm", HOOK], building: [180, 290, "building", HARN], done: [110, 356, "done", GUIDE], failed: [260, 356, "failed", BAD],
        };
        const who = { specifying: "중앙 Claude", asking: "사람", awaiting_confirm: "사람", building: "워커 Claude" };
        const E = [["menu", "specifying"], ["specifying", "asking"], ["asking", "specifying"], ["specifying", "awaiting_confirm"], ["awaiting_confirm", "building"], ["building", "done"], ["building", "failed"]];
        const el = E.map(([a, b]) => {
          const [x1, y1] = S[a], [x2, y2] = S[b];
          const bend = a === "asking" ? -26 : b === "asking" ? 26 : 0;
          const mx = (x1 + x2) / 2 + bend, my = (y1 + y2) / 2;
          return { a, b, l: api.n("path", { d: `M${x1} ${y1 + 14} Q${mx} ${my} ${x2} ${y2 - 14}`, fill: "none", stroke: LINE, "stroke-width": 2 }, s) };
        });
        const nd = Object.entries(S).map(([k, [x, y, n, c]]) => {
          const w = n.length * 7.6 + 22;
          const g = api.n("g", {}, s);
          const r = api.n("rect", { x: x - w / 2, y: y - 14, width: w, height: 28, rx: 14, fill: "#fff", stroke: c, "stroke-width": 2, filter: "url(#fxsh)" }, g);
          const tx = api.t(n, { x, y: y + 4.5, "text-anchor": "middle", "font-size": 11, "font-weight": 800, fill: INK, "font-family": "ui-monospace, Menlo, monospace" }, g);
          if (who[k]) api.t(who[k], { x: x + w / 2 + 6, y: y + 4, "font-size": 10, "font-weight": 800, fill: c }, g);
          return { k, r, tx, c };
        });
        const tok = api.n("circle", { r: 7, fill: A, stroke: "#fff", "stroke-width": 2 }, s);
        const store = fx.card(api, s, 20, 386, 320, 30, { title: "store.ts → data/wf/wf-NNNN.json에 저장", c: MUTED, icon: "db", fs: 10.5 });
        const PATH = ["menu", "specifying", "asking", "specifying", "awaiting_confirm", "building", "done"];
        api.loop(t => {
          t = t % 13;
          const f = clamp((t - 0.5) / 10) * (PATH.length - 1);
          const k = Math.min(PATH.length - 2, Math.floor(f)), u = f - k;
          const a = S[PATH[k]], b = S[PATH[k + 1]];
          const m = seg(u, 0.55, 1);
          tok.setAttribute("cx", lerp(a[0], b[0], m)); tok.setAttribute("cy", lerp(a[1], b[1], m));
          const cur = u < 0.55 ? PATH[k] : PATH[k + 1];
          nd.forEach(({ k: name, r, tx, c }) => {
            const on = name === cur;
            r.setAttribute("fill", on ? c : "#fff"); tx.setAttribute("fill", on ? "#fff" : INK);
          });
          el.forEach(({ a: x, b: y, l }) => {
            const on = PATH.some((p, i) => i < PATH.length - 1 && p === x && PATH[i + 1] === y && i <= k);
            l.setAttribute("stroke", on ? A : LINE);
          });
          store.setAttribute("opacity", 0.6 + 0.4 * fx.pulse(t, 4));
          const capt = cur === "specifying" ? "중앙 Claude가 저장소를 읽고 질문이나 기획서를 내요" : cur === "asking" || cur === "awaiting_confirm" ? "사람이 답할 때까지 멈춰 기다려요" : cur === "building" ? "확인된 기획서로만 워커가 고쳐요" : cur === "done" ? "PR이 열리면 끝나요" : "메뉴에서 작업 종류를 골라요";
          say(t, [[0, 12.8, capt]]);
        }, 6);
      },
    }
