BOOKS.push({
  no: 6,
  series: "AX 개발자 첫걸음",
  kicker: "ORCHESTRATION, REVISITED",
  title: "내 시스템 다시 보기",
  subtitle: "Slack에서 요청을 받아 PR을 만들고 질문에 답하는 ai-native 허브를,<br>지금까지 배운 말로 다시 읽어요. 무엇을 코드가 하고 무엇을 Claude가 하는지부터요.",
  color: { accent: "#2f5fd0", ink: "#1d3f94", soft: "#e9effc" },
  coverTag: "판단은 Claude, 경계는 코드",
  recapTag: "6권에서 본 것",

  coverScene(api) {
    const { s, say } = fx.stage(api);
    const A = api.accent;
    const box = (x, y, w, title, sub, c, icon) => fx.card(api, s, x, y, w, 46, { title, sub, c, icon, fs: 11.5 });
    const slack = box(20, 16, 150, "Slack", "메뉴 · 카드", INK, "user");
    const bot = box(190, 16, 150, "봇", "reduce 상태 기계", A, "gear");
    const gha = box(105, 92, 150, "GitHub Actions", "agent-task.yml", INK, "api");
    const roles = [["중앙", "읽기만", GUIDE, "search"], ["워커", "수정만", HARN, "tool"], ["질문", "도구 하나", HOOK, "llm"]].map(([n, sub, c, ic], i) => box(20 + i * 112, 176, 104, n, sub, c, ic));
    const gate = box(105, 260, 150, "검사", "gate.sh · ask_check.py", BAD, "lock");
    const outs = [box(20, 340, 150, "PR", "기준 브랜치로", GUIDE, "check"), box(190, 340, 150, "답변", "근거 통과 시", GUIDE, "check")];
    const all = [slack, bot, gha, ...roles, gate, ...outs];
    const P = [[[95, 39], [190, 39]], [[265, 62], [180, 92]], [[180, 138], [72, 176]], [[180, 138], [180, 176]], [[180, 138], [292, 176]], [[72, 222], [180, 260]], [[180, 222], [180, 260]], [[292, 222], [180, 260]], [[150, 306], [95, 340]], [[210, 306], [265, 340]]];
    const flows = P.map(pts => fx.stream(api, s, pts, { n: 2, c: A, r: 3, speed: 0.9 }));
    api.loop(t => {
      t = t % 10;
      const out = 1 - seg(t, 9.4, 9.9);
      all.forEach((g, i) => g.setAttribute("opacity", seg(t, 0.1 + i * 0.25, 0.4 + i * 0.25) * out));
      flows.forEach((f, i) => f(t, (t > 3 ? 1 : 0) * out));
      roles.forEach((g, i) => g.setAttribute("transform", `translate(${20 + i * 112}, ${176 - (t > 4 && Math.floor(t * 0.8) % 3 === i ? 3 : 0)})`));
      say(t, [[0.2, 3.0, "사람, 봇, 워크플로, Claude 셋이 일을 나눠요"], [3.1, 9.6, "Claude가 판단하고, 코드가 경계를 지켜요"]]);
    }, 6);
  },
