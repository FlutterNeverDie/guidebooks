export default {
      title: "어디가 느린가: 지연을 나눠 보기",
      tag: "임베딩, 검색, 재정렬, 생성 중 어디에 시간이 드나",
      lead: "RAG 응답이 느리면 벡터 DB부터 의심하기 쉬워요. 그런데 단계별로 재 보면 검색은 대개 아주 빠르고, 재정렬과 LLM 생성이 시간을 거의 다 써요. 줄이려면 먼저 나눠서 재요.",
      body: `
<h3>실습: 질문 하나를 단계별로</h3>
<table class="vs">
  <tr><th>단계</th><th>시간(이 맥, CPU)</th></tr>
  <tr><td>질문 임베딩</td><td>4.83ms</td></tr>
  <tr><td>벡터 검색(조각 23개)</td><td>0.01ms 미만</td></tr>
  <tr><td>BM25</td><td>0.04ms</td></tr>
  <tr><td>재정렬(후보 10개)</td><td><span class="poor">487.82ms</span></td></tr>
  <tr><td>LLM 답 생성</td><td>실습에서는 안 불렀어요. 보통 가장 커요</td></tr>
</table>

<h3>재정렬 후보 수는 품질과 지연을 같이 움직여요</h3>
<table class="vs">
  <tr><th>후보 수</th><th>hit@1</th><th>질문당</th></tr>
  <tr><td>3</td><td>0.82</td><td>176ms</td></tr>
  <tr><td>5</td><td>0.91</td><td>276ms</td></tr>
  <tr><td>10</td><td>0.95</td><td>551ms</td></tr>
  <tr><td>20</td><td><span class="good">1.00</span></td><td><span class="poor">1,151ms</span></td></tr>
</table>
<p>후보를 두 배로 늘리면 시간도 거의 두 배예요. 어디서 멈출지는 서비스가 허용하는 지연으로 정해요.</p>

<h3>줄이는 방법</h3>
<ul>
  <li><b>재정렬</b>: GPU에서 돌리기, 더 작은 모델, 후보 수 줄이기, 재정렬이 필요 없는 질문은 건너뛰기</li>
  <li><b>LLM</b>: 넘기는 조각 줄이기(2권 3장), 스트리밍으로 첫 글자를 빨리 보여 주기, 같은 앞부분 프롬프트는 프롬프트 캐싱</li>
  <li><b>임베딩</b>: 자주 오는 질문은 벡터를 캐시</li>
  <li><b>색인</b>: 조각이 수백만 개가 되면 그때 HNSW의 <code>ef</code>나 IVF의 <code>nprobe</code>를 조정(3권)</li>
</ul>

<div class="try"><span class="lbl">직접 해 보기</span>
<p><code>rag-study/step6_eval.py</code>: B 부분이 단계별 시간, C 부분이 재정렬 후보 수 실험이에요.</p></div>`,
      lab: "API 응답이 느릴 때 <b>APM 트레이스로 구간을 나눠 보는 것</b>과 같아요. DB 쿼리를 튜닝하려 했는데 막상 재 보면 외부 API 호출 하나가 시간을 다 쓰는 일이 흔하죠. RAG에서는 그 외부 호출이 재정렬 모델과 LLM이에요. 단계마다 시간을 로그로 남겨 두면 나중에 어디를 줄일지 바로 보여요.",
      quiz: {
        q: "RAG 응답이 3초 걸려요. 벡터 DB를 더 빠른 제품으로 바꾸기 전에 먼저 할 일은?",
        options: ["벡터 차원을 줄인다", "단계마다 시간을 재서 어디에 드는지 본다", "HNSW의 M을 키운다"], answer: 1,
        explain: "실습에서 검색은 0.01ms도 안 걸렸고 재정렬이 0.5초 가까이 썼어요. 느린 곳을 모르고 바꾸면 효과가 없어요.",
      },
      scene(api) {
        const { s, say } = fx.stage(api);
        const A = api.accent;
        // 워터폴
        api.n("rect", { x: 20, y: 14, width: 320, height: 214, rx: 12, fill: "#fff", filter: "url(#fxsh)" }, s);
        api.t("질문 하나의 시간 (실측)", { x: 34, y: 38, "font-size": 12, "font-weight": 800, fill: INK }, s);
        const S = [["질문 임베딩", 4.83, A], ["벡터 검색", 0.01, GUIDE], ["BM25", 0.04, GUIDE], ["재정렬 10개", 487.82, HARN], ["LLM 생성", null, MUTED]];
        const PX = 0.34; // 1ms = 0.34px
        let acc = 0;
        const rows = S.map(([n, v, c], i) => {
          const y = 56 + i * 32;
          api.t(n, { x: 34, y: y + 15, "font-size": 11, "font-weight": 700, fill: INK }, s);
          const x0 = 112 + acc * PX;
          const w = v === null ? 50 : Math.max(2, v * PX);
          const b = api.n("rect", { x: x0, y, width: 0, height: 20, rx: 4, fill: c, opacity: v === null ? 0.25 : 0.9, "stroke-dasharray": v === null ? "4 3" : "none", stroke: v === null ? MUTED : "none" }, s);
          const l = api.t(v === null ? "보통 가장 김" : v < 1 ? "0.1ms 미만" : `${v.toFixed(v < 10 ? 1 : 0)}ms`, { x: x0 + w + 6, y: y + 14, "font-size": 10.5, "font-weight": 800, fill: c === MUTED ? MUTED : INK, opacity: 0 }, s);
          if (v !== null) acc += v;
          return { b, l, w, x0 };
        });
        rows[4].l.setAttribute("x", 112 + acc * PX - 80);
        rows[4].b.setAttribute("x", 112 + acc * PX);
        rows[4].x0 = 112 + acc * PX;
        // 후보 수 곡선
        const p2 = api.n("g", {}, s);
        api.n("rect", { x: 20, y: 240, width: 320, height: 172, rx: 12, fill: "#fff", filter: "url(#fxsh)" }, p2);
        api.t("재정렬 후보 수", { x: 34, y: 262, "font-size": 12, "font-weight": 800, fill: INK }, p2);
        const C = [[3, 0.82, 176], [5, 0.91, 276], [10, 0.95, 551], [20, 1.0, 1151]];
        const cx = n => 70 + (Math.log2(n) - Math.log2(3)) / (Math.log2(20) - Math.log2(3)) * 230;
        const qy = v => 392 - (v - 0.78) / 0.24 * 100;
        const ty = v => 392 - v / 1200 * 100;
        api.n("path", { d: "M60 392h270", stroke: LINE, "stroke-width": 1.4 }, p2);
        const qPath = api.n("polyline", { points: C.map(([n, q]) => `${cx(n)},${qy(q)}`).join(" "), fill: "none", stroke: GUIDE, "stroke-width": 2.6, "stroke-dasharray": 400, "stroke-dashoffset": 400 }, p2);
        const tPath = api.n("polyline", { points: C.map(([n, , m]) => `${cx(n)},${ty(m)}`).join(" "), fill: "none", stroke: HARN, "stroke-width": 2.6, "stroke-dasharray": 400, "stroke-dashoffset": 400 }, p2);
        C.forEach(([n]) => api.t(`${n}개`, { x: cx(n), y: 406, "text-anchor": "middle", "font-size": 10, fill: MUTED }, p2));
        api.t("hit@1", { x: 150, y: 262, "text-anchor": "start", "font-size": 10.5, "font-weight": 800, fill: GUIDE }, p2);
        api.t("지연", { x: 194, y: 262, "text-anchor": "start", "font-size": 10.5, "font-weight": 800, fill: HARN }, p2);
        const pick = api.n("g", { opacity: 0 }, p2);
        const pl = api.n("line", { y1: 270, y2: 392, stroke: INK, "stroke-width": 1.2, "stroke-dasharray": "3 3" }, pick);
        const pt = api.t("", { y: 282, "text-anchor": "middle", "font-size": 10.5, "font-weight": 800, fill: INK }, pick);
        api.loop(t => {
          t = t % 13;
          rows.forEach(({ b, l, w }, i) => {
            const g = seg(t, 0.4 + i * 0.7, 1.0 + i * 0.7);
            b.setAttribute("width", w * g);
            l.setAttribute("opacity", seg(t, 0.9 + i * 0.7, 1.2 + i * 0.7));
          });
          p2.setAttribute("opacity", seg(t, 5.0, 5.4));
          qPath.setAttribute("stroke-dashoffset", 400 * (1 - seg(t, 5.4, 7.0)));
          tPath.setAttribute("stroke-dashoffset", 400 * (1 - seg(t, 5.8, 7.4)));
          const k = Math.min(3, Math.floor(clamp((t - 7.8) / 4) * 4));
          pick.setAttribute("opacity", t > 7.8 ? 1 : 0);
          const [n, q, m] = C[k];
          pl.setAttribute("x1", cx(n)); pl.setAttribute("x2", cx(n));
          pt.setAttribute("x", clamp(cx(n), 120, 240)); pt.textContent = `${n}개: hit@1 ${q.toFixed(2)}, ${m}ms`;
          say(t, [[0.2, 4.9, "검색은 빠르고, 재정렬이 시간을 거의 다 써요"], [5.0, 12.8, "후보를 늘리면 정확도와 지연이 같이 올라가요"]]);
        }, 10);
      },
    }
