export default {
      title: "HNSW: 그래프를 타고 찾기",
      tag: "위층에서 크게 건너뛰고, 아래층에서 촘촘히 좁혀요",
      lead: "HNSW는 가장 널리 쓰이는 벡터 색인이에요. 점마다 가까운 이웃 몇 개를 선으로 이어 그래프를 만들고, 질문이 오면 '이웃 중 질문에 더 가까운 쪽'으로 계속 건너가요. 층을 여러 개 두어 위층에서는 멀리, 아래층에서는 가까이 움직여요.",
      body: `
<ol class="steps">
  <li><b>위층에서 출발</b><small>위층일수록 점이 적고 연결이 길어서 한 번에 멀리 가요.</small></li>
  <li><b>더 가까운 이웃으로 이동</b><small>지금 점의 이웃 중 질문에 더 가까운 점이 있으면 옮겨요. 없으면 한 층 내려가요.</small></li>
  <li><b>맨 아래층에서 마무리</b><small>모든 점이 있는 층에서 후보 ef개를 들고 다니며 가장 가까운 k개를 골라요.</small></li>
</ol>

<h3>파라미터 세 개</h3>
<table class="vs">
  <tr><th>이름</th><th>뜻</th><th>키우면</th></tr>
  <tr><td><code>M</code></td><td>점마다 잇는 이웃 수</td><td>정확해지고 메모리와 색인 시간이 늘어요</td></tr>
  <tr><td><code>efConstruction</code></td><td>색인을 만들 때 살펴보는 후보 수</td><td>그래프 품질이 좋아지고 만드는 시간이 늘어요</td></tr>
  <tr><td><code>ef</code>(efSearch)</td><td>찾을 때 들고 다니는 후보 수</td><td>정확해지고 질문마다 느려져요</td></tr>
</table>

<h3>실습: 벡터 20만 개, M=32</h3>
<table class="vs">
  <tr><th>ef</th><th>질문당</th><th>recall@10</th></tr>
  <tr><td>전부 비교</td><td>6.50ms</td><td>1.00</td></tr>
  <tr><td>16</td><td><span class="good">0.11ms</span></td><td><span class="poor">0.81</span></td></tr>
  <tr><td>64</td><td>0.38ms</td><td><span class="good">0.99</span></td></tr>
  <tr><td>256</td><td>1.37ms</td><td>0.99</td></tr>
</table>
<p>ef=64에서 전부 비교보다 17배 빠르고, 진짜 상위 10개 중 거의 다를 찾았어요. ef를 더 키우면 느려지기만 해요. 대신 색인을 만드는 데 60초가 걸렸고, 그래프 전체가 메모리에 있어야 빨라요. 삭제는 많은 구현이 표시만 해 두고 나중에 정리해서, 삭제가 많으면 재색인을 고려해요.</p>

<div class="try"><span class="lbl">직접 해 보기</span>
<p><code>rag-study/step4_ann_index.py</code>: B 부분에서 <code>efSearch</code> 목록이나 M 값(32)을 바꿔 recall과 시간이 어떻게 움직이는지 봐요.</p></div>`,
      lab: "HNSW는 <b>스킵 리스트</b>를 그래프로 옮긴 거예요. Redis sorted set이 쓰는 스킵 리스트는 위층에 원소가 드문드문 있어서 멀리 건너뛰고, 아래층으로 내려가며 정확한 위치를 찾죠. HNSW도 같아요. 다만 '정렬 순서' 대신 '거리'로 건너가서 지역 최솟값에 걸리면 진짜 가장 가까운 점을 놓칠 수 있고, 그걸 ef로 줄여요.",
      quiz: {
        q: "HNSW 검색 recall이 0.81이에요. 질문당 지연이 조금 늘어도 괜찮다면 먼저 바꿀 값은?",
        options: ["ef(efSearch)를 키운다", "벡터 차원을 줄인다", "M을 1로 줄인다"], answer: 0,
        explain: "ef는 검색할 때만 쓰여서 색인을 다시 만들 필요가 없어요. 실습에서 16에서 64로 키우니 recall이 0.81에서 0.99가 됐어요.",
      },
      scene(api) {
        const { s, say } = fx.stage(api);
        const A = api.accent;
        let sd = 3;
        const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
        // 바닥층 점 (띠 안 좌표 0~1)
        const P = Array.from({ length: 26 }, () => [0.04 + rnd() * 0.92, 0.12 + rnd() * 0.76]);
        const L1 = P.map((_, i) => i).filter(i => i % 3 === 0);
        const L2 = [L1[0], L1[4], L1[8]].filter(i => i !== undefined);
        const layers = [L2, L1, P.map((_, i) => i)];
        const Q = [0.86, 0.62];
        const d = (a, b) => (a[0] - b[0]) ** 2 + ((a[1] - b[1]) * 0.3) ** 2;
        const BAND = [[20, 22], [20, 132], [20, 242]], BW = 320, BH = 96;
        const xy = (L, p) => [BAND[L][0] + 10 + p[0] * (BW - 20), BAND[L][1] + p[1] * BH];
        const M = [2, 2, 3];
        const nbr = layers.map((ids, L) => {
          const m = {};
          ids.forEach(i => { m[i] = ids.filter(j => j !== i).sort((a, b) => d(P[a], P[i]) - d(P[b], P[i])).slice(0, M[L]); });
          ids.forEach(i => m[i].forEach(j => { if (!m[j].includes(i)) m[j].push(i); }));
          return m;
        });
        const names = ["층 2 · 고속도로", "층 1", "층 0 · 모든 점"];
        layers.forEach((ids, L) => {
          api.n("rect", { x: BAND[L][0], y: BAND[L][1], width: BW, height: BH, rx: 12, fill: "#fff", filter: "url(#fxsh)" }, s);
          api.t(names[L], { x: BAND[L][0] + 10, y: BAND[L][1] + 14, "font-size": 10, "font-weight": 800, fill: MUTED }, s);
          const done = new Set();
          ids.forEach(i => nbr[L][i].forEach(j => {
            const k = [i, j].sort().join(); if (done.has(k)) return; done.add(k);
            const [x1, y1] = xy(L, P[i]), [x2, y2] = xy(L, P[j]);
            api.n("line", { x1, y1, x2, y2, stroke: LINE, "stroke-width": 1.3 }, s);
          }));
          ids.forEach(i => { const [x, y] = xy(L, P[i]); api.n("circle", { cx: x, cy: y, r: L === 2 ? 3.6 : 4.6, fill: "#aab3c4" }, s); });
          const [qx, qy] = xy(L, Q);
          api.n("circle", { cx: qx, cy: qy, r: 7, fill: "none", stroke: INK, "stroke-width": 2, "stroke-dasharray": "3 2" }, s);
        });
        // 탐욕 탐색 (실제로 계산)
        let cur = L2.slice().sort((a, b) => d(P[b], Q) - d(P[a], Q))[0];
        const entry = cur, moves = [];
        for (let L = 0; L < 3; L++) {
          if (L > 0) moves.push({ down: true, L, i: cur });
          for (;;) {
            const n = nbr[L][cur].slice().sort((a, b) => d(P[a], Q) - d(P[b], Q))[0];
            if (n === undefined || d(P[n], Q) >= d(P[cur], Q)) break;
            moves.push({ L, from: cur, to: n }); cur = n;
          }
        }
        const segs = moves.map(m => {
          const a = m.down ? xy(m.L - 1, P[m.i]) : xy(m.L, P[m.from]);
          const b = m.down ? xy(m.L, P[m.i]) : xy(m.L, P[m.to]);
          const l = api.n("line", { x1: a[0], y1: a[1], x2: a[0], y2: a[1], stroke: m.down ? MUTED : A, "stroke-width": m.down ? 1.8 : 3.2, "stroke-dasharray": m.down ? "4 3" : "none", "stroke-linecap": "round" }, s);
          return { a, b, l };
        });
        const start = xy(0, P[entry]);
        const walker = api.n("circle", { cx: start[0], cy: start[1], r: 7.5, fill: A, stroke: "#fff", "stroke-width": 2 }, s);
        const hit = api.n("g", { opacity: 0 }, s);
        const fin = xy(2, P[cur]);
        api.n("circle", { cx: fin[0], cy: fin[1], r: 13, fill: "none", stroke: GUIDE, "stroke-width": 2.6 }, hit);
        api.t("가장 가까운 점", { x: fin[0], y: fin[1] - 18, "text-anchor": "middle", "font-size": 10.5, "font-weight": 800, fill: GUIDE }, hit);
        const tip = api.t("", { x: 180, y: 364, "text-anchor": "middle", "font-size": 11.5, "font-weight": 800, fill: INK }, s);
        const STEP = 0.75, T0 = 0.8, END = T0 + segs.length * STEP;
        api.loop(t => {
          t = t % (END + 3.4);
          segs.forEach(({ a, b, l }, k) => {
            const u = clamp((t - T0 - k * STEP) / STEP);
            l.setAttribute("x2", lerp(a[0], b[0], u)); l.setAttribute("y2", lerp(a[1], b[1], u));
          });
          const k = Math.min(segs.length - 1, Math.max(0, Math.floor((t - T0) / STEP)));
          const u = clamp((t - T0 - k * STEP) / STEP);
          const sg = segs[k];
          if (sg) { walker.setAttribute("cx", t < T0 ? sg.a[0] : lerp(sg.a[0], sg.b[0], u)); walker.setAttribute("cy", t < T0 ? sg.a[1] : lerp(sg.a[1], sg.b[1], u)); }
          hit.setAttribute("opacity", seg(t, END, END + 0.4));
          const mv = moves[k];
          tip.textContent = t < T0 ? "위층 입구에서 출발" : t > END ? `${moves.filter(m => !m.down).length}번 건너서 도착. 26개를 다 보지 않았어요` : mv.down ? "더 가까운 이웃이 없으면 한 층 아래로" : "이웃 중 질문에 더 가까운 점으로";
          say(t, [[0.1, END * 0.5, "위층에서 크게 건너뛰어요"], [END * 0.5, END, "아래층에서 촘촘히 좁혀요"], [END + 0.1, END + 3.2, "ef를 키우면 더 넓게 살펴서 정확해져요"]]);
        }, 20);
      },
    }
