export default {
      title: "왜 벡터 DB인가",
      tag: "전부 비교는 정확하지만 벡터 수만큼 느려져요",
      lead: "가장 단순한 벡터 검색은 질문 벡터를 저장된 벡터 전부와 하나씩 비교하는 거예요. 정확하지만 벡터가 늘면 그만큼 느려져요. 벡터 DB는 '대충 가장 가까운 것'을 훨씬 빨리 찾는 색인과, 운영에 필요한 저장·필터·갱신을 함께 줘요.",
      body: `
<h3>전부 비교는 벡터 수에 비례해요</h3>
<table class="vs">
  <tr><th>벡터 수(384차원)</th><th>질문당 시간</th></tr>
  <tr><td>2만 개</td><td>0.62ms</td></tr>
  <tr><td>10만 개</td><td>3.26ms</td></tr>
  <tr><td>20만 개</td><td>6.39ms</td></tr>
  <tr><td>1,000만 개(비례로 어림)</td><td><span class="poor">약 320ms</span></td></tr>
</table>
<p><small>이 맥(Apple M2) 스레드 1개 기준. 기기마다 다르니 경향만 봐요.</small></p>
<p>질문 하나에 320ms면 견딜 만해 보여도, 동시에 수십 명이 물으면 CPU가 그만큼 더 필요해요. 그래서 정답 10개 중 9~10개만 찾는 대신 수십 배 빠른 <b>근사 최근접 이웃(ANN)</b> 색인을 써요. 다음 두 장에서 HNSW, IVF, PQ를 봐요.</p>

<h3>벡터 DB가 함께 주는 것</h3>
<table class="vs">
  <tr><th>기능</th><th>왜 필요한가</th></tr>
  <tr><td>ANN 색인</td><td>빠른 검색</td></tr>
  <tr><td>메타데이터 필터</td><td>부서, 날짜, 권한으로 범위를 좁힘(5장)</td></tr>
  <tr><td>추가·수정·삭제</td><td>문서가 바뀌면 그 조각만 바꿈</td></tr>
  <tr><td>저장·복제·백업</td><td>서버가 꺼져도 다시 임베딩하지 않음</td></tr>
  <tr><td>키워드 검색(일부 제품)</td><td>하이브리드 검색(4장)</td></tr>
</table>

<div class="try"><span class="lbl">직접 해 보기</span>
<p><code>rag-study/step4_ann_index.py</code>: 무작위 벡터 20만 개로 전부 비교와 색인 세 가지를 비교해요. 색인을 만드는 데 1분쯤 걸려요.</p>
<p><code>rag-study/step2_vector_search.py</code>: C 부분이 Chroma에 넣고 찾는 가장 작은 예예요.</p></div>`,
      lab: "<b>풀 테이블 스캔과 인덱스</b>의 차이예요. 다만 B-트리는 정확한 값과 범위를 찾고 답이 틀리지 않아요. 벡터 색인은 '가장 가까운 것'을 찾고, 속도를 위해 진짜 가장 가까운 것 몇 개를 놓칠 수 있어요. 정확도를 파라미터로 사고파는 인덱스라고 보면 돼요.",
      quiz: {
        q: "벡터 색인(ANN)이 B-트리 인덱스와 가장 다른 점은?",
        options: ["항상 정확한 답을 보장한다", "빠른 대신 진짜 가장 가까운 것 일부를 놓칠 수 있다", "디스크를 전혀 쓰지 않는다"], answer: 1,
        explain: "ANN은 Approximate, 즉 근사예요. 진짜 상위 10개 중 몇 개를 찾았는지(recall)를 재면서 속도와 맞바꿔요.",
      },
      scene(api) {
        const { s, say } = fx.stage(api);
        const A = api.accent;
        let sd = 5;
        const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
        api.n("rect", { x: 20, y: 14, width: 320, height: 214, rx: 12, fill: "#fff", filter: "url(#fxsh)" }, s);
        const P = Array.from({ length: 48 }, () => [40 + rnd() * 280, 40 + rnd() * 176]);
        const Q = [184, 124];
        const d2 = p => (p[0] - Q[0]) ** 2 + (p[1] - Q[1]) ** 2;
        const near = P.map((p, i) => [i, d2(p)]).sort((a, b) => a[1] - b[1]).slice(0, 3).map(([i]) => i);
        const line = api.n("line", { x1: Q[0], y1: Q[1], stroke: HARN, "stroke-width": 1.6, opacity: 0 }, s);
        const dots = P.map(([x, y]) => api.n("circle", { cx: x, cy: y, r: 4.5, fill: "#b8c0cf" }, s));
        api.n("circle", { cx: Q[0], cy: Q[1], r: 8, fill: "#fff", stroke: INK, "stroke-width": 2.4 }, s);
        const cnt = api.t("", { x: 32, y: 34, "font-size": 11.5, "font-weight": 800, fill: HARN }, s);
        // 막대
        const p2 = api.n("g", {}, s);
        api.t("질문당 시간 · 전부 비교", { x: 22, y: 256, "font-size": 12, "font-weight": 800, fill: INK }, p2);
        const B = [["2만", 0.62], ["10만", 3.26], ["20만", 6.39], ["1,000만", 320]];
        const bars = B.map(([n, v], i) => {
          const y = 272 + i * 34;
          api.t(n, { x: 22, y: y + 14, "font-size": 11, "font-weight": 700, fill: INK }, p2);
          const b = api.n("rect", { x: 76, y, width: 0, height: 20, rx: 5, fill: i === 3 ? BAD : HARN, opacity: 0.85 }, p2);
          const l = api.t(i === 3 ? "약 320ms (어림)" : `${v}ms`, { x: 80, y: y + 14, "font-size": 10.5, "font-weight": 800, fill: INK, opacity: 0 }, p2);
          return { b, l, w: i === 3 ? 260 : v / 6.39 * 150 };
        });
        const brk = api.n("path", { d: "M236 392 l6 -16 l6 16 l6 -16", stroke: "#fff", "stroke-width": 2.4, fill: "none", opacity: 0 }, p2);
        api.loop(t => {
          t = t % 12;
          const f = clamp((t - 0.5) / 4.2), n = Math.floor(f * P.length);
          cnt.textContent = t < 0.5 ? "" : `비교 ${Math.min(n, P.length)} / ${P.length}`;
          dots.forEach((d, i) => {
            const done = i < n, top = t > 4.9 && near.includes(i);
            d.setAttribute("fill", top ? GUIDE : done ? "#8f98aa" : "#d5dae3");
            d.setAttribute("r", top ? 7 : 4.5);
          });
          if (n < P.length && t > 0.5) { line.setAttribute("x2", P[n][0]); line.setAttribute("y2", P[n][1]); }
          line.setAttribute("opacity", t > 0.5 && t < 4.7 ? 0.9 : 0);
          p2.setAttribute("opacity", seg(t, 5.4, 5.8));
          bars.forEach(({ b, l, w }, i) => {
            const g = seg(t, 5.8 + i * 0.5, 6.4 + i * 0.5);
            b.setAttribute("width", w * g);
            l.setAttribute("x", i === 3 ? 84 : 76 + w * g + 6);
            l.setAttribute("fill", i === 3 ? "#fff" : INK);
            l.setAttribute("opacity", seg(t, 6.3 + i * 0.5, 6.6 + i * 0.5));
          });
          brk.setAttribute("opacity", seg(t, 7.6, 8.0));
          say(t, [[0.3, 5.2, "질문을 모든 벡터와 하나씩 비교해요"], [5.3, 8.4, "벡터가 늘면 시간도 그만큼 늘어요"], [8.5, 11.8, "그래서 근사 색인(ANN)을 써요"]]);
        }, 9);
      },
    }
