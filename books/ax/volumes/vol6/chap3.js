export default {
      title: "코드가 하는 일, Claude가 하는 일",
      tag: "개발 요청 하나를 단계별로 나눠 보면",
      lead: "ai-native를 '완전히 Claude에 기대는 시스템'이라고 느낄 수 있어요. 개발 요청 하나를 단계로 나눠 보면 Claude가 맡는 건 판단이 필요한 두 단계뿐이고, 나머지 입력·권한·순서·검사·커밋·알림은 모두 코드가 해요. 다만 Claude를 부르는 방식에 묶인 곳이 몇 군데 있어요.",
      body: `
<h3>개발 요청 하나의 단계</h3>
<table class="vs">
  <tr><th>단계</th><th>누가</th><th>어디서</th></tr>
  <tr><td>메뉴와 입력 받기</td><td>코드</td><td><code>bot/src/app.ts</code>, <code>bot/src/cards.ts</code></td></tr>
  <tr><td>요청자·개발 권한 확인</td><td>코드</td><td><code>bot/src/machine.ts</code>의 <code>reduce</code>, <code>canDevelop</code></td></tr>
  <tr><td>저장소를 읽고 질문이나 기획서 쓰기</td><td><b>Claude(중앙)</b></td><td><code>prompts/central-menu.md</code></td></tr>
  <tr><td>기획서 확인</td><td>사람</td><td>Slack 카드</td></tr>
  <tr><td>코드 고치기</td><td><b>Claude(워커)</b></td><td><code>prompts/worker-task.md</code></td></tr>
  <tr><td>금지 경로·크기·허용 경로 검사</td><td>코드</td><td><code>scripts/block-risky.sh</code>, <code>scripts/gate.sh</code></td></tr>
  <tr><td>커밋, 푸시, PR</td><td>코드</td><td><code>.github/workflows/agent-task.yml</code></td></tr>
  <tr><td>결과 알림(문구 필터 거침)</td><td>코드</td><td><code>bot/src/engine.ts</code>, <code>bot/src/slackSafe.ts</code></td></tr>
</table>

<h3>Claude에 묶인 곳</h3>
<p>판단을 다른 모델로 바꾸고 싶다면 고칠 곳은 여기예요.</p>
<ul>
  <li><b>호출</b>: 워크플로와 <code>scripts/ask_run.sh</code>의 <code>claude -p</code>와 그 옵션(<code>--allowedTools</code>, <code>--max-turns</code>, <code>--output-format</code>)</li>
  <li><b>출력 해석</b>: <code>scripts/extract_json.py</code>와 <code>scripts/ask_check.py</code>가 Claude CLI의 출력 형식(<code>result</code>, <code>is_error</code>, stream-json 이벤트)을 읽어요</li>
  <li><b>훅</b>: 워커의 수정 전 검사는 Claude Code의 PreToolUse 훅(<code>scripts/worker-settings.json</code>)으로 걸려요</li>
  <li><b>대상 저장소의 스킬</b>: 워커가 읽는 <code>.claude/skills/&lt;skill&gt;/SKILL.md</code></li>
</ul>
<p>반대로 상태 기계, 저장, 권한, 검사, PR 생성은 모델과 무관해요. 이 경계를 지켜 두면 모델을 바꾸거나 단계를 더할 때 고칠 범위가 작아요.</p>`,
      lab: "<b>헥사고날 아키텍처의 포트와 어댑터</b>로 보면 깔끔해요. 도메인(상태 기계 <code>reduce</code>)은 Slack도 GitHub도 Claude도 몰라요. Slack과 GitHub는 <code>SlackPort</code>, <code>GitHubPort</code> 어댑터 뒤에 있고, Claude는 워크플로 단계라는 어댑터 뒤에 있어요. 다만 Claude 어댑터는 CLI 옵션과 출력 형식이라는 구체적인 계약에 묶여 있어요.",
      quiz: {
        q: "ai-native에서 Claude를 다른 모델로 바꾸려면 가장 먼저 손볼 곳은?",
        options: ["bot/src/machine.ts의 reduce", "워크플로의 claude -p 호출과 그 출력을 읽는 extract_json.py, ask_check.py", "store.ts의 저장 형식"], answer: 1,
        explain: "상태 기계와 저장은 모델과 무관해요. 모델에 묶인 곳은 호출 명령과 옵션, 그리고 그 출력 형식을 해석하는 스크립트예요.",
      },
      scene(api) {
        const { s, say } = fx.stage(api);
        const A = api.accent;
        const ST = [["메뉴·입력", 0], ["권한 확인", 0], ["질문·기획서", 1], ["기획서 확인", 2], ["코드 수정", 1], ["경로·크기 검사", 0], ["커밋·푸시·PR", 0], ["결과 알림", 0]];
        const COL = [[INK, "코드", "gear"], [A, "Claude", "llm"], [HOOK, "사람", "user"]];
        const X = [70, 180, 290];
        COL.forEach(([c, n, ic], i) => {
          api.n("rect", { x: X[i] - 52, y: 14, width: 104, height: 34, rx: 10, fill: c, opacity: 0.1 }, s);
          fx.icon(api, s, ic, X[i] - 26, 31, 16, c);
          api.t(n, { x: X[i] - 12, y: 36, "font-size": 12, "font-weight": 900, fill: c }, s);
          api.n("line", { x1: X[i], y1: 54, x2: X[i], y2: 384, stroke: LINE, "stroke-width": 1.4, "stroke-dasharray": "3 4" }, s);
        });
        const items = ST.map(([n, w], i) => {
          const y = 66 + i * 40;
          const g = api.n("g", { opacity: 0 }, s);
          const r = api.n("rect", { x: X[w] - 52, y, width: 104, height: 30, rx: 8, fill: "#fff", stroke: COL[w][0], "stroke-width": 1.8, filter: "url(#fxsh)" }, g);
          const tx = api.t(n, { x: X[w], y: y + 19.5, "text-anchor": "middle", "font-size": 10.5, "font-weight": 800, fill: INK }, g);
          return { g, r, tx, w, y };
        });
        const tok = api.n("circle", { r: 6, fill: A, opacity: 0 }, s);
        const sum = fx.card(api, s, 20, 386, 320, 30, { title: "8단계 중 Claude 2단계 · 사람 1단계 · 코드 5단계", c: A, fs: 11 });
        api.loop(t => {
          t = t % 12;
          const f = clamp((t - 0.3) / 8.4) * ST.length;
          const k = Math.min(ST.length - 1, Math.floor(f));
          items.forEach(({ g, r, tx, w }, i) => {
            g.setAttribute("opacity", i <= k ? 1 : 0.15);
            const on = i === k && t < 8.9;
            r.setAttribute("fill", on ? COL[w][0] : "#fff"); tx.setAttribute("fill", on ? "#fff" : INK);
          });
          const a = items[Math.max(0, k - 1)], b = items[k];
          const u = seg(f - k, 0, 0.4);
          tok.setAttribute("cx", lerp(X[a.w], X[b.w], k ? u : 1)); tok.setAttribute("cy", lerp(a.y + 15, b.y + 15, k ? u : 1));
          tok.setAttribute("opacity", t < 8.9 ? 1 : 0);
          sum.setAttribute("opacity", seg(t, 9.0, 9.4));
          say(t, [[0, 8.8, ST[k][1] === 1 ? "판단이 필요한 곳만 Claude가 해요" : ST[k][1] === 2 ? "사람이 확인해야 다음으로 가요" : "입력, 권한, 순서, 검사는 코드가 해요"], [8.9, 11.8, "판단은 Claude, 경계는 코드"]]);
        }, 9.5);
      },
    }
