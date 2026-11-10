export default {
      title: "IVF와 PQ: 칸 나누기와 압축",
      tag: "가까운 칸만 보고, 벡터를 줄여서 저장해요",
      lead: "IVF는 벡터 공간을 칸 여러 개로 나눠 두고, 질문이 오면 가까운 칸 몇 개만 봐요. PQ는 벡터를 짧은 번호 묶음으로 압축해 메모리를 크게 줄여요. 둘 다 정확도를 조금 내주고 속도나 메모리를 얻어요.",
      body: `
<h3>IVF: 가까운 칸만 본다</h3>
<p>먼저 k-means로 대표점 <code>nlist</code>개를 정하고, 벡터마다 가장 가까운 대표점의 칸에 넣어요. 질문이 오면 질문과 가까운 칸 <code>nprobe</code>개 안에서만 비교해요. 진짜 가장 가까운 점이 옆 칸에 있으면 놓쳐요.</p>

<h3>PQ: 벡터를 번호로 압축</h3>
<p>384차원 벡터를 8차원씩 48토막으로 나누고, 토막마다 미리 뽑아 둔 대표값 256개 중 가장 비슷한 것의 번호(1바이트)만 저장해요. 1,536바이트가 48바이트가 돼요. 거리는 이 번호로 어림해서 재요. 그래서 실무에서는 PQ로 후보를 넉넉히 뽑고 원본 벡터로 다시 재는 단계를 붙이기도 해요.</p>

<h3>실습 전체: 벡터 20만 개</h3>
<table class="vs">
  <tr><th>방식</th><th>설정</th><th>질문당</th><th>recall@10</th><th>벡터당 메모리</th></tr>
  <tr><td>전부 비교</td><td>-</td><td>6.50ms</td><td>1.00</td><td>1,536B</td></tr>
  <tr><td>HNSW</td><td>ef=64</td><td>0.38ms</td><td><span class="good">0.99</span></td><td>약 1,792B</td></tr>
  <tr><td>IVF</td><td>nprobe=1</td><td><span class="good">0.04ms</span></td><td><span class="poor">0.49</span></td><td>1,536B</td></tr>
  <tr><td>IVF</td><td>nprobe=8</td><td>0.10ms</td><td>0.65</td><td>1,536B</td></tr>
  <tr><td>IVF</td><td>nprobe=64</td><td>0.49ms</td><td>0.84</td><td>1,536B</td></tr>
  <tr><td>IVF + PQ</td><td>nprobe=64</td><td>0.24ms</td><td>0.63</td><td><span class="good">48B</span></td></tr>
</table>
<p><small>칸 1,024개. 무작위로 만든 벡터라 실제 임베딩보다 무리가 덜 뚜렷할 수 있어요. 숫자보다 방향을 봐요.</small></p>

<h3>고르는 감</h3>
<ul>
  <li><b>메모리에 다 들어가면 HNSW</b>가 기본값이에요. 많은 벡터 DB가 HNSW를 기본이나 대표 색인으로 써요.</li>
  <li><b>메모리가 모자랄 만큼 크면</b> IVF + PQ나 디스크 기반 색인을 봐요.</li>
  <li>어느 쪽이든 <b>내 데이터로 recall과 지연을 같이</b> 재요. 한쪽만 보면 반드시 속아요.</li>
</ul>

<div class="try"><span class="lbl">직접 해 보기</span>
<p><code>rag-study/step4_ann_index.py</code>: C, D 부분의 <code>nprobe</code> 목록과 PQ 토막 수(48)를 바꿔 봐요.</p></div>`,
      lab: "<b>IVF는 파티셔닝</b>이에요. 테이블을 파티션으로 나눠 두고 조건에 맞는 파티션만 읽는 것처럼, 질문 근처 칸만 읽어요. 다만 경계가 애매해서 옆 파티션을 몇 개 더 읽는 게 nprobe예요. <b>PQ는 손실 압축</b>이에요. 원본 PNG 대신 JPEG를 저장하면 용량이 크게 줄고 화질이 조금 떨어지는 것과 같아요.",
      quiz: {
        q: "IVF에서 nprobe=1일 때 recall이 0.49로 낮았어요. 가장 큰 이유는?",
        options: ["칸이 너무 적어서 계산이 느려서", "진짜 가까운 이웃이 질문과 다른 칸에 들어 있으면 보지 않아서", "PQ 압축 때문에"], answer: 1,
        explain: "칸 경계 근처의 질문은 진짜 이웃이 옆 칸에 있을 수 있어요. nprobe를 늘리면 옆 칸도 봐서 recall이 올라가고 그만큼 느려져요.",
      },
      scene(api) {
        const { s, say } = fx.stage(api);
        const A = api.accent;
        let sd = 9;
        const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
        api.n("rect", { x: 20, y: 14, width: 320, height: 238, rx: 12, fill: "#fff", filter: "url(#fxsh)" }, s);
        const C = [[80, 76], [190, 64], [290, 84], [86, 196], [200, 186], [298, 204]];
        const COL = [A, HARN, GUIDE, HOOK, "#8a5cc2", "#c28a1b"];
        const Q = [242, 124], S = [236, 138];
        const d2 = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;
        const cell = p => C.map((c, i) => [i, d2(p, c)]).sort((a, b) => a[1] - b[1])[0][0];
        const P = [];
        C.forEach(c => { for (let k = 0; k < 9; k++) { const p = [c[0] + (rnd() - 0.5) * 80, c[1] + (rnd() - 0.5) * 70]; if (d2(p, Q) > 900 && p[0] > 34 && p[0] < 326 && p[1] > 30 && p[1] < 240) P.push(p); } });
        P.push(S);
        const sIdx = P.length - 1;
        const qCell = cell(Q);
        const cellsBy = C.map((c, i) => [i, d2(Q, c)]).sort((a, b) => a[1] - b[1]).map(([i]) => i);
        const dots = P.map(p => api.n("circle", { cx: p[0], cy: p[1], r: 4.5, fill: COL[cell(p)] }, s));
        const cents = C.map(([x, y], i) => api.n("rect", { x: x - 6, y: y - 6, width: 12, height: 12, fill: "#fff", stroke: COL[i], "stroke-width": 2.4, transform: `rotate(45 ${x} ${y})` }, s));
        const qg = api.n("g", { opacity: 0 }, s);
        api.n("circle", { cx: Q[0], cy: Q[1], r: 8, fill: "#fff", stroke: INK, "stroke-width": 2.4 }, qg);
        api.t("질문", { x: Q[0] + 12, y: Q[1] - 8, "font-size": 10, "font-weight": 800, fill: INK }, qg);
        // 칸 안에서 찾은 가장 가까운 점
        const inCell = P.map((p, i) => [i, d2(p, Q)]).filter(([i]) => cell(P[i]) === qCell).sort((a, b) => a[1] - b[1])[0][0];
        const found = api.n("circle", { cx: P[inCell][0], cy: P[inCell][1], r: 11, fill: "none", stroke: HARN, "stroke-width": 2.4, opacity: 0 }, s);
        const miss = api.n("circle", { cx: S[0], cy: S[1], r: 11, fill: "none", stroke: BAD, "stroke-width": 2.4, "stroke-dasharray": "3 2", opacity: 0 }, s);
        const ok = api.n("circle", { cx: S[0], cy: S[1], r: 11, fill: "none", stroke: GUIDE, "stroke-width": 3, opacity: 0 }, s);
        const lab = api.t("", { x: 32, y: 36, "font-size": 11.5, "font-weight": 800, fill: INK }, s);
        // PQ
        const pq = api.n("g", {}, s);
        api.n("rect", { x: 20, y: 266, width: 320, height: 146, rx: 12, fill: "#fff", filter: "url(#fxsh)" }, pq);
        api.t("PQ: 토막마다 대표값 번호만 저장", { x: 34, y: 288, "font-size": 11.5, "font-weight": 800, fill: INK }, pq);
        const codes = [17, 203, 88, 5, 141, 66, 230, 12, 97, 180, 44, 251];
        const segs = codes.map((c, i) => {
          const x = 34 + i * 25;
          const r = api.n("rect", { x, y: 302, width: 22, height: 34, rx: 3, fill: COL[i % 6], opacity: 0.25 }, pq);
          const lines = [0, 1, 2, 3].map(k => api.n("rect", { x: x + 4, y: 307 + k * 7, width: 14, height: 3, rx: 1.5, fill: COL[i % 6] }, pq));
          const t = api.t(String(c), { x: x + 11, y: 323, "text-anchor": "middle", "font-size": 9.5, "font-weight": 800, fill: "#fff", opacity: 0 }, pq);
          return { r, lines, t, c: COL[i % 6] };
        });
        const sizeT = api.t("", { x: 34, y: 362, "font-size": 12.5, "font-weight": 900, fill: INK }, pq);
        const noteT = api.t("", { x: 34, y: 388, "font-size": 11, fill: MUTED }, pq);
        api.loop(t => {
          t = t % 13;
          // IVF
          const ivf = t < 7.2;
          qg.setAttribute("opacity", seg(t, 0.8, 1.1));
          const probe = t < 1.6 ? 6 : t < 4.2 ? 1 : 3;
          const show = cellsBy.slice(0, probe);
          dots.forEach((d, i) => d.setAttribute("opacity", show.includes(cell(P[i])) ? 1 : 0.15));
          cents.forEach((c, i) => c.setAttribute("opacity", show.includes(i) ? 1 : 0.2));
          found.setAttribute("opacity", t > 2.2 && t < 4.2 ? 1 : 0);
          miss.setAttribute("opacity", t > 2.9 && t < 4.2 ? 1 : 0);
          ok.setAttribute("opacity", t > 4.8 ? 1 : 0);
          lab.textContent = t < 1.6 ? "칸 6개 (IVF)" : t < 4.2 ? "nprobe = 1: 질문이 든 칸만" : "nprobe = 3: 가까운 칸 3개";
          lab.setAttribute("fill", t > 2.9 && t < 4.2 ? BAD : t > 4.8 ? GUIDE : INK);
          // PQ
          pq.setAttribute("opacity", t < 7.2 ? 0.35 : 1);
          const z = seg(t, 8.4, 9.6);
          segs.forEach(({ r, lines, t: tx }, i) => {
            const zi = seg(t, 8.4 + i * 0.08, 8.9 + i * 0.08);
            r.setAttribute("opacity", 0.25 + 0.75 * zi);
            lines.forEach(l => l.setAttribute("opacity", 1 - zi));
            tx.setAttribute("opacity", zi);
          });
          sizeT.textContent = t < 8.4 ? "벡터 하나: 숫자 384개 = 1,536바이트" : z < 1 ? "번호로 바꾸는 중…" : "번호 48개 = 48바이트 (32분의 1)";
          sizeT.setAttribute("fill", z >= 1 ? GUIDE : INK);
          noteT.textContent = t > 10 ? "대신 거리가 어림이라 recall이 0.63으로 내려가요" : "그림은 48토막 중 12토막";
          say(t, [[0.1, 2.8, "IVF는 칸을 나눠 가까운 칸만 봐요"], [2.9, 4.6, "진짜 이웃이 옆 칸에 있으면 놓쳐요"], [4.7, 7.1, "nprobe를 늘리면 찾지만 느려져요"], [7.3, 12.8, "PQ는 벡터를 번호로 압축해 메모리를 줄여요"]]);
        }, 5.5);
      },
    }
