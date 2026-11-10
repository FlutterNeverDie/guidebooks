export default {
      title: "LLM이 모르는 세 가지",
      tag: "학습이 끝난 뒤의 일, 우리 회사 일, 모르는데 아는 척",
      lead: "LLM은 학습이 끝나는 순간 지식이 굳어요. 그 뒤에 생긴 일과 공개되지 않은 사내 자료는 모르고, 모를 때도 그럴듯하게 지어낼 수 있어요. RAG는 이 세 구멍을 메우려고 나왔어요.",
      body: `
<h3>구멍 1. 학습 기준일 이후의 일</h3>
<p>모델은 어느 날짜까지의 글로 학습하고 배포돼요. 그 뒤에 바뀐 규정, 새 버전 API, 어제 장애 기록은 모델 안에 없어요.</p>

<h3>구멍 2. 공개되지 않은 자료</h3>
<p>사내 위키, 설계 문서, 고객 문의 기록은 학습 데이터에 들어간 적이 없어요. 모델이 아무리 커도 본 적 없는 문서는 몰라요.</p>

<h3>구멍 3. 모르는데 아는 척 (환각)</h3>
<p>LLM은 "다음에 올 그럴듯한 말"을 고르는 기계예요. 사실인지 확인하는 단계가 따로 없어서, 모르는 질문에도 문장은 매끄럽게 나와요.</p>

<div class="cards">
  <div class="card"><b>모델을 다시 학습시키면 되지 않나요?</b>비용과 시간이 크고, 문서가 바뀔 때마다 다시 해야 해요. 그리고 학습시켜도 "어느 문서의 몇 번째 줄"이라는 출처는 남지 않아요.</div>
  <div class="card"><b>그래서 나온 생각</b>모델은 그대로 두고, 질문이 올 때마다 <b>관련 자료를 찾아 프롬프트에 같이 넣는다</b>. 이게 RAG예요.</div>
</div>`,
      lab: "LLM은 <b>빌드할 때 상수가 박힌 바이너리</b>와 같아요. 배포 뒤에 바뀐 설정값은 모르죠. 그래서 실서비스는 설정을 바이너리에 넣지 않고, 요청이 올 때 설정 서버에서 읽어 와요. RAG도 지식을 모델에 굽지 않고 요청 시점에 읽어 오는 방식이에요.",
      quiz: {
        q: "LLM이 사내 휴가 규정을 틀리게 말하는 가장 근본적인 이유는 무엇일까요?",
        options: ["모델 크기가 작아서", "그 규정 문서를 학습 중에 본 적이 없고, 모를 때도 그럴듯한 문장을 만들어서", "프롬프트가 영어가 아니어서"], answer: 1,
        explain: "모델이 아무리 커도 본 적 없는 문서는 몰라요. 그리고 모른다고 멈추는 장치가 기본으로는 없어서 지어낸 답이 나와요.",
      },
      scene(api) {
        const { s, say } = fx.stage(api);
        const A = api.accent;
        // 구멍 1: 시간축
        const z1 = api.n("g", {}, s);
        api.t("1  학습 기준일 이후", { x: 20, y: 26, "font-size": 12, "font-weight": 800, fill: INK }, z1);
        api.n("rect", { x: 20, y: 42, width: 180, height: 76, rx: 10, fill: A, opacity: 0.1 }, z1);
        api.t("모델이 아는 구간", { x: 30, y: 60, "font-size": 10.5, "font-weight": 700, fill: A }, z1);
        api.n("line", { x1: 20, y1: 104, x2: 340, y2: 104, stroke: LINE, "stroke-width": 2.4 }, z1);
        const cutL = api.n("line", { x1: 200, y1: 38, x2: 200, y2: 124, stroke: BAD, "stroke-width": 2, "stroke-dasharray": "5 4" }, z1);
        fx.icon(api, z1, "clock", 214, 52, 18, BAD);
        api.t("기준일", { x: 226, y: 57, "font-size": 10.5, "font-weight": 800, fill: BAD }, z1);
        const known = [44, 82, 120, 160].map((x, i) => api.n("circle", { cx: x, cy: 104 - (i % 2) * 18, r: 6, fill: A }, z1));
        const after = [[238, "새 규정"], [292, "v2 API"]].map(([x, w], i) => {
          const g = api.n("g", { opacity: 0 }, z1);
          api.n("circle", { cx: x, cy: 104 - i * 18, r: 6.5, fill: "#fff", stroke: MUTED, "stroke-width": 2, "stroke-dasharray": "2 2" }, g);
          api.t(w, { x, y: 92 - i * 18, "text-anchor": "middle", "font-size": 10, "font-weight": 700, fill: MUTED }, g);
          api.t("?", { x: x + 10, y: 112 - i * 18, "font-size": 12, "font-weight": 900, fill: BAD }, g);
          return g;
        });
        // 구멍 2: 사내 자료
        const z2 = api.n("g", {}, s);
        api.t("2  공개되지 않은 사내 자료", { x: 20, y: 160, "font-size": 12, "font-weight": 800, fill: INK }, z2);
        const vault = fx.card(api, z2, 20, 172, 320, 74, { title: "사내 위키 · 설계 문서 · 고객 문의", sub: "학습 데이터에 들어간 적 없음", c: MUTED, icon: "lock" });
        const lockGlow = api.n("circle", { cx: 47, cy: 209, r: 18, fill: BAD, opacity: 0 }, z2);
        // 구멍 3: 환각
        const z3 = api.n("g", {}, s);
        api.t("3  모를 때도 아는 척", { x: 20, y: 282, "font-size": 12, "font-weight": 800, fill: INK }, z3);
        const q = fx.bubble(api, z3, 20, 294, 200, 34, "결제 오류 E-9 뜻이 뭐야?", { c: INK, fs: 11, tail: "left" });
        const a = fx.bubble(api, z3, 110, 344, 230, 36, "", { c: BAD, fs: 11, tail: "right" });
        const st = api.n("g", { opacity: 0 }, z3);
        api.n("rect", { x: 34, y: 344, width: 62, height: 26, rx: 6, fill: "#fff", stroke: BAD, "stroke-width": 2, transform: "rotate(-10 65 357)" }, st);
        api.t("지어냄", { x: 65, y: 362, "text-anchor": "middle", "font-size": 12.5, "font-weight": 900, fill: BAD, transform: "rotate(-10 65 357)" }, st);
        api.loop(t => {
          t = t % 11;
          z1.setAttribute("opacity", t < 3.6 ? 1 : 0.35);
          z2.setAttribute("opacity", t < 3.6 ? 0.35 : t < 7.2 ? 1 : 0.35);
          z3.setAttribute("opacity", t < 7.2 ? 0.35 : 1);
          if (t > 10.4) [z1, z2, z3].forEach(z => z.setAttribute("opacity", 1));
          known.forEach((c, i) => c.setAttribute("r", 6 * seg(t, 0.1 + i * 0.15, 0.4 + i * 0.15)));
          after.forEach((g, i) => g.setAttribute("opacity", seg(t, 1.2 + i * 0.5, 1.6 + i * 0.5)));
          cutL.setAttribute("stroke-width", 2 + fx.pulse(t, 4));
          lockGlow.setAttribute("opacity", t > 3.6 && t < 7.2 ? 0.18 * fx.pulse(t, 5) : 0);
          vault.setAttribute("transform", `translate(${20 + (t > 4 && t < 5 ? Math.sin(t * 40) * 2 * (1 - seg(t, 4.4, 5)) : 0)}, 172)`);
          q.setAttribute("opacity", seg(t, 7.3, 7.7));
          a.setAttribute("opacity", seg(t, 8.0, 8.3));
          fx.type(a.textEl, "카드 한도 초과 오류예요 (확실)", seg(t, 8.1, 9.2));
          st.setAttribute("opacity", seg(t, 9.4, 9.6));
          say(t, [[0.1, 3.5, "학습 기준일 뒤에 생긴 일은 몰라요"], [3.6, 7.1, "회사 안 문서는 본 적이 없어요"], [7.2, 10.8, "모르면 그럴듯하게 지어내요"]]);
        }, 10);
      },
    }
