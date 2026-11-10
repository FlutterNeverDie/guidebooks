export default {
      title: "파이프라인은 두 개예요",
      tag: "미리 해 두는 색인 파이프라인, 요청마다 도는 질문 파이프라인",
      lead: "RAG 시스템은 시간이 다른 두 파이프라인으로 나뉘어요. 문서를 미리 잘라 벡터로 바꿔 저장하는 색인 파이프라인(오프라인), 그리고 질문이 올 때마다 찾고 답하는 질문 파이프라인(온라인)이에요.",
      body: `
<table class="vs">
  <tr><th></th><th>색인 파이프라인</th><th>질문 파이프라인</th></tr>
  <tr><td>언제</td><td>문서가 들어오거나 바뀔 때</td><td>사용자 요청마다</td></tr>
  <tr><td>단계</td><td>적재 → 파싱 → 청크 → 임베딩 → 저장</td><td>질문 임베딩 → 검색 → (재정렬) → 프롬프트 → 생성 → (검증)</td></tr>
  <tr><td>신경 쓸 것</td><td>처리량, 재처리 비용, 바뀐 문서만 다시 하기</td><td>지연 시간, 요청당 비용, 정확도</td></tr>
  <tr><td>2~4권</td><td>2권 청크·임베딩</td><td>3권 검색·색인, 4권 평가</td></tr>
</table>

<h3>두 파이프라인을 묶는 약속 하나</h3>
<p><b>문서와 질문은 같은 임베딩 모델로 바꿔야 해요.</b> 모델이 다르면 같은 뜻이어도 좌표계가 달라서 거리가 의미 없어요. 임베딩 모델을 바꾸면 문서 전체를 다시 색인해야 해요.</p>

<h3>자주 놓치는 것</h3>
<div class="cards">
  <div class="card"><b>삭제와 수정</b>원본 문서가 지워지면 조각도 지워야 해요. 안 그러면 없는 규정을 근거로 답해요. 조각마다 원본 id와 버전을 메타데이터로 남겨요.</div>
  <div class="card"><b>권한</b>보면 안 되는 문서 조각이 검색되면 그대로 답에 섞여요. 권한은 생성 단계가 아니라 검색 단계에서 걸러요(3권 필터).</div>
</div>`,
      lab: "<b>배치 ETL과 조회 API</b>의 관계와 같아요. 밤마다 원천 데이터를 가공해 조회용 테이블을 만들어 두고(색인), API는 그 테이블만 빠르게 읽어요(질문). 원천 스키마가 바뀌면 ETL을 다시 돌려야 하듯, 임베딩 모델이 바뀌면 다시 색인해야 해요.",
      quiz: {
        q: "임베딩 모델을 더 좋은 것으로 바꿨어요. 꼭 해야 하는 일은 무엇일까요?",
        options: ["질문 파이프라인만 새 모델로 바꾼다", "저장된 문서 조각 전체를 새 모델로 다시 임베딩한다", "아무것도 안 해도 된다"], answer: 1,
        explain: "문서 벡터와 질문 벡터가 같은 모델의 좌표계에 있어야 거리를 비교할 수 있어요. 모델을 바꾸면 전부 다시 색인해요.",
      },
      scene(api) {
        const { s, say } = fx.stage(api);
        const A = api.accent;
        const node = (p, x, y, icon, label, c) => {
          const g = api.n("g", {}, p);
          const ring = api.n("circle", { cx: x, cy: y, r: 24, fill: "#fff", filter: "url(#fxsh)" }, g);
          fx.icon(api, g, icon, x, y, 24, c);
          api.t(label, { x, y: y + 40, "text-anchor": "middle", "font-size": 11, "font-weight": 800, fill: INK }, g);
          g.ring = ring;
          return g;
        };
        // 색인 (위)
        const top = api.n("g", {}, s);
        api.n("rect", { x: 10, y: 10, width: 340, height: 132, rx: 14, fill: MUTED, opacity: 0.07 }, top);
        api.t("색인 파이프라인 · 미리", { x: 22, y: 30, "font-size": 12, "font-weight": 800, fill: MUTED }, top);
        const T = [node(top, 50, 74, "doc", "적재", MUTED), node(top, 130, 74, "cut", "청크", MUTED), node(top, 210, 74, "vec", "임베딩", HOOK)];
        const fTop = fx.stream(api, top, [[74, 74], [106, 74]], { c: MUTED, n: 2, speed: 0.8 });
        const fTop2 = fx.stream(api, top, [[154, 74], [186, 74]], { c: MUTED, n: 2, speed: 0.8 });
        const fTop3 = fx.stream(api, top, [[234, 74], [290, 74], [290, 170]], { c: MUTED, n: 4, speed: 0.6 });
        // 벡터 DB (가운데)
        const db = fx.card(api, s, 220, 172, 130, 52, { title: "벡터 DB", sub: "조각 + 벡터", c: INK, icon: "db" });
        // 같은 모델 배지
        const badge = fx.card(api, s, 12, 180, 176, 36, { title: "같은 임베딩 모델", c: HOOK, icon: "spark", fs: 11.5 });
        const link1 = api.n("path", { d: "M210 98 C210 140, 140 150, 120 180", fill: "none", stroke: HOOK, "stroke-width": 1.8, "stroke-dasharray": "4 3" }, s);
        const link2 = api.n("path", { d: "M130 292 C130 260, 100 240, 100 216", fill: "none", stroke: HOOK, "stroke-width": 1.8, "stroke-dasharray": "4 3" }, s);
        // 질문 (아래)
        const bot = api.n("g", {}, s);
        api.n("rect", { x: 10, y: 250, width: 340, height: 160, rx: 14, fill: A, opacity: 0.07 }, bot);
        api.t("질문 파이프라인 · 요청마다", { x: 22, y: 270, "font-size": 12, "font-weight": 800, fill: A }, bot);
        const B = [node(bot, 50, 316, "user", "질문", A), node(bot, 130, 316, "vec", "임베딩", HOOK), node(bot, 210, 316, "search", "검색", A), node(bot, 300, 316, "llm", "생성", A)];
        const fB1 = fx.stream(api, bot, [[74, 316], [106, 316]], { c: A, n: 2, speed: 1.1 });
        const fB2 = fx.stream(api, bot, [[154, 316], [186, 316]], { c: A, n: 2, speed: 1.1 });
        const fB3 = fx.stream(api, bot, [[210, 292], [250, 226]], { c: A, n: 3, speed: 1.1 });
        const fB4 = fx.stream(api, bot, [[234, 316], [276, 316]], { c: A, n: 2, speed: 1.1 });
        const ans = fx.bubble(api, s, 200, 366, 140, 30, "답 + 출처", { c: GUIDE, fs: 11.5, tail: null });
        api.loop(t => {
          t = t % 10.5;
          const ph1 = t < 3.4, ph2 = t >= 3.4 && t < 6.8, ph3 = t >= 6.8;
          top.setAttribute("opacity", ph2 ? 0.4 : 1);
          bot.setAttribute("opacity", ph1 ? 0.4 : 1);
          fTop(t, ph1 || ph3 ? 1 : 0); fTop2(t, ph1 || ph3 ? 1 : 0); fTop3(t, ph1 || ph3 ? 1 : 0);
          [fB1, fB2, fB3, fB4].forEach(f => f(t, ph2 || ph3 ? 1 : 0));
          db.setAttribute("opacity", 0.75 + 0.25 * fx.pulse(t, 3));
          const b = ph3 ? seg(t, 6.8, 7.3) : 0;
          [badge, link1, link2].forEach(e => e.setAttribute("opacity", 0.15 + 0.85 * b));
          T[2].ring.setAttribute("stroke", ph3 ? HOOK : "none"); T[2].ring.setAttribute("stroke-width", 2.4);
          B[1].ring.setAttribute("stroke", ph3 ? HOOK : "none"); B[1].ring.setAttribute("stroke-width", 2.4);
          ans.setAttribute("opacity", (ph2 ? seg(t, 5.2, 5.6) : ph3 ? 1 : 0) * (1 - seg(t, 10, 10.4)));
          say(t, [[0.1, 3.3, "색인: 미리 잘라서 벡터로 저장해요"], [3.4, 6.7, "질문: 요청마다 찾아서 답해요"], [6.8, 10.3, "둘은 같은 임베딩 모델로 묶여요"]]);
        }, 7.5);
      },
    }
