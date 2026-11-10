export default {
      title: "에이전트 패턴과 권한 나누기",
      tag: "역할마다 다른 Claude, 서로는 JSON으로만 넘겨요",
      lead: "에이전트는 '모델이 도구를 부르고, 결과를 보고, 다시 부르는' 루프예요. 멀티 에이전트는 이 루프를 역할별로 여러 개 두는 것이고요. ai-native의 Claude 셋은 서로 대화하지 않아요. 각자 다른 권한으로 한 번씩 돌고, 결과 JSON을 코드가 검사해서 다음 단계로 넘겨요.",
      body: `
<h3>흔한 패턴</h3>
<table class="vs">
  <tr><th>패턴</th><th>모양</th><th>ai-native</th></tr>
  <tr><td>단일 에이전트 + 도구</td><td>한 루프가 도구를 골라 씀</td><td>질문하기(ask): 안내 도구 하나</td></tr>
  <tr><td>라우터</td><td>질문을 분류해 맞는 곳으로</td><td><b>사람이</b> Slack 메뉴에서 고름</td></tr>
  <tr><td>파이프라인</td><td>정해진 순서로 단계를 넘김</td><td>중앙 → 사람 확인 → 워커 → 검사 → PR</td></tr>
  <tr><td>감독자-작업자</td><td>감독 에이전트가 작업자에게 일을 나눔</td><td>쓰지 않음. 순서는 코드가 정함</td></tr>
</table>

<h3>세 Claude의 권한 (agent-task.yml)</h3>
<table class="vs">
  <tr><th>역할</th><th>도구</th><th>턴</th><th>못 하는 것</th></tr>
  <tr><td>중앙</td><td><code>Read,Grep,Glob</code></td><td>40</td><td>코드 수정</td></tr>
  <tr><td>워커</td><td>읽기·수정 + <code>flutter analyze</code>, <code>dart format</code>, <code>git status</code>, <code>git diff</code></td><td>80</td><td>커밋, 푸시(토큰도 없음)</td></tr>
  <tr><td>질문</td><td>기본 도구 없음(<code>--tools ""</code>), 고른 안내 도구 하나</td><td>6</td><td>저장소 읽기(빈 임시 폴더에서 돔)</td></tr>
</table>

<h3>넘김은 JSON, 검사는 코드</h3>
<ul>
  <li>중앙과 워커는 정해진 JSON 하나를 출력하고, <code>scripts/extract_json.py</code>가 꺼내서 형식을 확인해요. 형식이 틀리면 <code>BAD_OUTPUT</code>으로 실패해요.</li>
  <li>워커가 파일을 고치려 할 때마다 <code>scripts/block-risky.sh</code>가 훅(PreToolUse)으로 금지 경로를 막아요.</li>
  <li>워커가 끝난 뒤 <code>scripts/gate.sh</code>가 금지·민감·크기·허용 경로를 다시 보고, 그다음에야 푸시용 토큰을 대상 저장소 하나에만 발급해요.</li>
</ul>
<div class="try"><span class="lbl">직접 해 보기</span>
<p><code>rag-study/step1_tool_use.py</code>: 에이전트 루프의 가장 작은 모양이에요(API 키 필요). ai-native의 각 Claude도 안에서는 이 루프를 돌아요.</p></div>`,
      lab: "<b>마이크로서비스의 최소 권한 원칙</b>과 같아요. 조회 서비스에는 읽기 DB 계정만, 쓰기 서비스에는 쓰기 계정만 주고, 서비스끼리는 정해진 스키마의 메시지로만 이야기하죠. 에이전트도 '똑똑하니까 알아서 조심하겠지'가 아니라 권한과 검사로 묶어요. ai-native 규칙에도 '지침 문장으로 대신하지 않는다'고 적혀 있어요.",
      quiz: {
        q: "ai-native 워커가 커밋과 푸시를 못 하게 막는 방법으로 맞는 것은?",
        options: ["프롬프트에 '푸시하지 마'라고만 적었다", "워커 단계에는 푸시 토큰이 없고, 검사 뒤에 워크플로가 커밋·푸시한다", "워커가 스스로 판단해서 하지 않는다"], answer: 1,
        explain: "프롬프트에도 적혀 있지만 그것만 믿지 않아요. 워커 단계에는 토큰이 없고, gate.sh 검사를 통과한 뒤에 워크플로가 커밋하고 푸시 토큰을 받아요.",
      },
      scene(api) {
        const { s, say } = fx.stage(api);
        const A = api.accent;
        const R = [["중앙", "Read · Grep · Glob", "턴 40", GUIDE, "search"], ["워커", "Edit · Write · analyze", "턴 80 · 토큰 없음", HARN, "tool"], ["질문", "안내 도구 하나", "턴 6 · 빈 폴더", HOOK, "llm"]];
        const cards = R.map(([n, tools, lim, c, ic], i) => {
          const y = 14 + i * 118;
          const g = api.n("g", {}, s);
          api.n("rect", { x: 20, y, width: 196, height: 84, rx: 12, fill: "#fff", filter: "url(#fxsh)" }, g);
          api.n("rect", { x: 20, y, width: 6, height: 84, rx: 3, fill: c }, g);
          fx.icon(api, g, ic, 50, y + 26, 24, c);
          api.t(`${n} Claude`, { x: 70, y: y + 31, "font-size": 13, "font-weight": 900, fill: INK }, g);
          api.t(tools, { x: 36, y: y + 56, "font-size": 10.5, "font-weight": 700, fill: INK }, g);
          api.t(lim, { x: 36, y: y + 73, "font-size": 10, fill: MUTED }, g);
          return { g, y, c };
        });
        // 코드 검사 관문
        const G = [["extract_json.py", "형식"], ["block-risky.sh · gate.sh", "경로·크기"], ["ask_check.py", "근거"]];
        const gates = G.map(([n, w], i) => {
          const y = 14 + i * 118 + 18;
          const g = api.n("g", {}, s);
          api.n("rect", { x: 236, y, width: 104, height: 48, rx: 10, fill: "#1f2430" }, g);
          fx.icon(api, g, "lock", 254, y + 24, 16, "#fff");
          api.t(w, { x: 268, y: y + 21, "font-size": 11, "font-weight": 900, fill: "#fff" }, g);
          api.t("코드 검사", { x: 268, y: y + 37, "font-size": 9.5, fill: "#9aa3b5" }, g);
          return { g, y };
        });
        // JSON 배턴
        const bat = api.n("g", {}, s);
        api.n("rect", { x: -22, y: -12, width: 44, height: 24, rx: 6, fill: "#fff", stroke: INK, "stroke-width": 1.6 }, bat);
        api.t("JSON", { x: 0, y: 4.5, "text-anchor": "middle", "font-size": 10.5, "font-weight": 900, fill: INK }, bat);
        const human = fx.card(api, s, 20, 372, 320, 40, { title: "사람이 기획서를 확인해야 워커가 시작해요", c: HOOK, icon: "user", fs: 11.5 });
        const D = 3.2;
        api.loop(t => {
          t = t % (D * 3 + 1.5);
          const i = Math.min(2, Math.floor(t / D)), u = (t % D) / D;
          cards.forEach(({ g }, k) => g.setAttribute("opacity", k === i || t > D * 3 ? 1 : 0.35));
          gates.forEach(({ g }, k) => g.setAttribute("opacity", k === i || t > D * 3 ? 1 : 0.35));
          const y = cards[i].y + 42;
          const x = lerp(120, 288, seg(u, 0.3, 0.7));
          bat.setAttribute("transform", `translate(${x}, ${y}) scale(${t > D * 3 ? 0 : 1})`);
          bat.querySelector("rect").setAttribute("stroke", u > 0.75 ? GUIDE : INK);
          human.setAttribute("opacity", i === 1 && u < 0.3 ? 1 : 0.5);
          say(t, [[0, D, "중앙은 읽기만 하고 기획서 JSON을 내요"], [D, D * 2, "워커는 고치기만, 커밋과 푸시는 워크플로가"], [D * 2, D * 3 + 1.4, "질문은 도구 하나로 답하고 근거 검사를 거쳐요"]]);
        }, 5);
      },
    }
