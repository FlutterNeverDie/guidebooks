export default {
      title: "벡터가 못 하는 질문",
      tag: "답이 여러 사실에 흩어져 있고, 중간 사실은 질문과 닮지 않았어요",
      lead: "\"박세나가 해외 출장 가려면 누가 승인해?\" 답을 내려면 사실 네 개를 이어야 해요. 박세나의 팀, 그 팀의 본부, 그 본부의 본부장, 그리고 해외 출장은 본부장 승인이라는 규정. 문제는 가운데 사실들이 질문과 단어도 뜻도 닮지 않았다는 거예요.",
      body: `
<h3>실습: 같은 사실 19개를 벡터 검색에 넣으면</h3>
<table class="vs">
  <tr><th>질문</th><th>필요한 사실</th><th>상위 5개에 든 것</th></tr>
  <tr><td>김하나가 노트북 잃어버리면 새 기기는 누가 승인해?</td><td>3개</td><td><span class="poor">1개</span></td></tr>
  <tr><td>박세나가 해외 출장 가려면 누가 승인해?</td><td>4개</td><td><span class="poor">2개</span></td></tr>
</table>
<p>박세나 질문에서 빠진 두 사실은 '영업팀은 사업본부에 속한다'(14위)와 '사업본부의 본부장은 오일곱이다'(12위)예요. 질문에 영업팀도 사업본부도 오일곱도 안 나오니 가까울 이유가 없어요. 조각을 더 많이 가져오면 들어오긴 하지만, 사실이 수만 개면 몇 위에 있을지 알 수 없어요.</p>

<h3>그래프는 경로를 따라가요</h3>
<pre class="code"><code>role = follow("해외 출장 규정", "승인역할")   # 본부장
team = follow("박세나", "소속")              # 영업팀
hq   = follow(team, "속함")                  # 사업본부
boss = follow(hq, "본부장")                  # 오일곱</code></pre>
<p>한 칸씩 따라가니 답과 함께 근거 네 줄이 그대로 남아요. 왜 오일곱인지 설명할 수 있어요.</p>

<h3>이런 질문이 그래프 쪽이에요</h3>
<ul>
  <li><b>여러 단계</b>: 누구의 팀장의 상사, 이 부품이 들어간 제품을 산 고객</li>
  <li><b>관계 자체를 묻는 것</b>: A와 B는 어떻게 연결돼 있나</li>
  <li><b>전체 구조</b>: 이 규정의 영향을 받는 사람은 모두 누구인가</li>
</ul>

<div class="try"><span class="lbl">직접 해 보기</span>
<p><code>rag-study/step7_ontology.py</code>: C 부분이 그래프 탐색, D 부분이 같은 사실로 한 벡터 검색이에요.</p></div>`,
      lab: "<b>조인이 필요한 질문을 전문 검색으로 푸는 것</b>과 같아요. '박세나의 본부장'은 users → teams → divisions를 조인해야 나오는데, 문서 검색 엔진에 넣으면 '박세나'가 들어간 글만 나와요. 그래프는 이 조인을 경로로 저장해 둔 거예요.",
      quiz: {
        q: "\"박세나가 해외 출장 가려면 누가 승인해?\"에 벡터 검색이 '사업본부의 본부장은 오일곱이다'를 못 가져온 이유는?",
        options: ["임베딩 모델이 이름을 못 읽어서", "그 사실이 질문과 단어도 뜻도 닮지 않아서", "사실이 19개뿐이라서"], answer: 1,
        explain: "벡터 검색은 질문과 비슷한 것을 찾아요. 중간 단계 사실은 질문과 닮지 않아 순위가 낮아요(12위). 그래프는 닮았는지가 아니라 연결돼 있는지로 따라가요.",
      },
      scene(api) {
        const { s, say } = fx.stage(api);
        const A = api.accent;
        fx.bubble(api, s, 20, 12, 320, 34, "박세나가 해외 출장 가려면 누가 승인해?", { c: INK, fs: 12, tail: null });
        // 필요한 사실 넷
        const F = [["해외 출장 규정의 승인자는 본부장이다.", 1, 1], ["박세나는 영업팀 소속이다.", 3, 1], ["영업팀은 사업본부에 속한다.", 14, 0], ["사업본부의 본부장은 오일곱이다.", 12, 0]];
        api.t("필요한 사실", { x: 20, y: 72, "font-size": 11.5, "font-weight": 900, fill: INK }, s);
        api.t("벡터 순위", { x: 340, y: 72, "text-anchor": "end", "font-size": 10.5, "font-weight": 800, fill: MUTED }, s);
        const rows = F.map(([f, r, ok], i) => {
          const y = 82 + i * 34;
          const g = api.n("g", { opacity: 0 }, s);
          const bg = api.n("rect", { x: 20, y, width: 320, height: 28, rx: 7, fill: "#fff", filter: "url(#fxsh)" }, g);
          api.t(f, { x: 32, y: y + 18, "font-size": 11, "font-weight": 700, fill: INK }, g);
          const rk = api.t(`${r}위`, { x: 328, y: y + 18, "text-anchor": "end", "font-size": 11.5, "font-weight": 900, fill: ok ? GUIDE : BAD }, g);
          return { g, bg, rk, ok };
        });
        const cutL = api.n("g", { opacity: 0 }, s);
        api.t("상위 5개 안: 2 / 4", { x: 20, y: 236, "font-size": 12, "font-weight": 900, fill: BAD }, cutL);
        // 그래프 경로
        const G = api.n("g", { opacity: 0 }, s);
        api.n("rect", { x: 20, y: 252, width: 320, height: 162, rx: 12, fill: "#fff", filter: "url(#fxsh)" }, G);
        const nodes = [["박세나", 64, 300, A], ["영업팀", 150, 300, GUIDE], ["사업본부", 240, 300, "#8a5cc2"], ["오일곱", 240, 380, A], ["해외 출장 규정", 100, 380, "#c28a1b"]];
        const edges = [[0, 1, "소속"], [1, 2, "속함"], [2, 3, "본부장"], [4, 3, "승인: 본부장"]];
        const el = edges.map(([a, b, r]) => {
          const [, x1, y1] = nodes[a], [, x2, y2] = nodes[b];
          const l = api.n("line", { x1, y1, x2, y2, stroke: LINE, "stroke-width": 2.4, "stroke-dasharray": a === 4 ? "5 4" : "none" }, G);
          const t = api.t(r, { x: (x1 + x2) / 2 + (a === 2 ? 30 : 0), y: (y1 + y2) / 2 - 8, "text-anchor": "middle", "font-size": 10, "font-weight": 800, fill: MUTED }, G);
          return { l, t };
        });
        nodes.forEach(([n, x, y, c]) => {
          const w = n.length * 11 + 18;
          api.n("rect", { x: x - w / 2, y: y - 14, width: w, height: 28, rx: 14, fill: "#fff", stroke: c, "stroke-width": 2 }, G);
          api.t(n, { x, y: y + 4.5, "text-anchor": "middle", "font-size": 11, "font-weight": 800, fill: INK }, G);
        });
        const walker = api.n("circle", { r: 7, fill: A, opacity: 0 }, G);
        api.loop(t => {
          t = t % 13;
          rows.forEach(({ g, bg, ok }, i) => {
            g.setAttribute("opacity", seg(t, 0.4 + i * 0.4, 0.7 + i * 0.4));
            bg.setAttribute("fill", t > 2.6 && t < 6.4 ? (ok ? "#e6f4ec" : "#fbe9e9") : "#fff");
          });
          cutL.setAttribute("opacity", seg(t, 2.8, 3.1) * (1 - seg(t, 6.2, 6.5)));
          G.setAttribute("opacity", seg(t, 6.4, 6.8));
          const P = [0, 1, 2, 3];
          const f = clamp((t - 7.0) / 3.0) * 3;
          const k = Math.min(2, Math.floor(f)), u = f - k;
          const [, ax, ay] = nodes[P[k]], [, bx, by] = nodes[P[k + 1]];
          walker.setAttribute("cx", lerp(ax, bx, clamp(u))); walker.setAttribute("cy", lerp(ay, by, clamp(u)));
          walker.setAttribute("opacity", t > 7.0 && t < 10.2 ? 1 : 0);
          el.forEach(({ l, t: tx }, i) => {
            const on = i < 3 ? f > i + 0.9 : t > 10.4;
            l.setAttribute("stroke", on ? A : LINE); l.setAttribute("stroke-width", on ? 3.6 : 2.4);
            tx.setAttribute("fill", on ? A : MUTED);
          });
          rows.forEach(({ rk }, i) => rk.setAttribute("opacity", t > 6.4 ? 0.3 : 1));
          say(t, [[0.3, 6.3, "중간 사실은 질문과 닮지 않아 순위가 낮아요"], [6.4, 10.3, "그래프는 연결을 따라가요"], [10.4, 12.8, "규정과 만나는 곳이 답: 오일곱"]]);
        }, 11);
      },
    }
