export default {
      title: "저장과 질의",
      tag: "그래프 DB와 Cypher, RDF와 SPARQL, 그리고 그냥 테이블",
      lead: "지식 그래프를 담는 방법은 크게 둘이에요. 노드와 관계에 속성을 붙이는 속성 그래프(대표 질의어 Cypher)와, 모든 것을 트리플로 적는 RDF(질의어 SPARQL)예요. 작게 시작할 때는 기존 관계형 DB의 테이블이나 메모리 라이브러리로도 충분해요.",
      body: `
<h3>같은 질문, 세 가지 질의</h3>
<p>"박세나가 속한 본부의 본부장은?"</p>
<pre class="code"><code>// Cypher (속성 그래프)
MATCH (:사람 {name:'박세나'})-[:소속]->(:팀)-[:속함]->(:본부)-[:본부장]->(b)
RETURN b.name</code></pre>
<pre class="code"><code># SPARQL (RDF)
SELECT ?b WHERE { :박세나 :소속 ?t . ?t :속함 ?h . ?h :본부장 ?b . }</code></pre>
<pre class="code"><code>-- SQL (관계형)
SELECT d.head FROM members m JOIN teams t ON m.team = t.name
  JOIN divisions d ON t.division = d.name WHERE m.name = '박세나';</code></pre>
<p>모양은 달라도 하는 일은 같아요. 차이는 단계 수가 정해지지 않은 질문("이 사람 위로 끝까지")과 관계 종류가 자주 늘어나는 경우에 커져요. 그래프 쪽은 패턴 한 줄이 그대로 늘어나고, SQL은 재귀 쿼리나 테이블 변경이 필요해요.</p>

<h3>고르는 감</h3>
<table class="vs">
  <tr><th>갈래</th><th>예</th><th>이럴 때</th></tr>
  <tr><td>속성 그래프 DB</td><td>Neo4j, 관리형 그래프 서비스, PostgreSQL + Apache AGE</td><td>관계를 따라가는 질의가 많고 앱에서 바로 쓸 때</td></tr>
  <tr><td>RDF 트리플 스토어</td><td>Apache Jena, GraphDB</td><td>표준 어휘(OWL)와 추론 규칙, 기관 간 데이터 연결이 중요할 때</td></tr>
  <tr><td>관계형 테이블</td><td>지금 쓰는 DB</td><td>관계 종류가 적고 단계가 정해져 있을 때</td></tr>
  <tr><td>메모리 라이브러리</td><td>networkx</td><td>실습, 프로토타입, 수만 개 이하</td></tr>
</table>

<div class="try"><span class="lbl">직접 해 보기</span>
<p><code>rag-study/step7_ontology.py</code>: <code>approver()</code> 함수가 위 질의를 networkx로 한 칸씩 따라가요. 그래프 DB 없이도 개념은 같아요.</p></div>`,
      lab: "Cypher의 <code>MATCH</code> 패턴은 <b>조인 경로를 그림으로 적은 것</b>이에요. <code>(a)-[:소속]->(t)</code>는 <code>JOIN teams t ON a.team = t.id</code>와 같아요. 다른 점은 그래프 DB가 각 노드에서 이웃으로 가는 포인터를 저장해 두어서, 단계가 늘어도 전체 테이블을 조인하지 않고 이웃만 따라간다는 거예요.",
      quiz: {
        q: "\"이 사람의 상사의 상사의 … 끝까지\"처럼 단계 수가 정해지지 않은 질문에서 그래프 질의어가 편한 이유는?",
        options: ["그래프 DB가 항상 SQL보다 빨라서", "경로 길이를 패턴으로 바로 적을 수 있고 이웃만 따라가서", "그래프 DB는 스키마가 없어서"], answer: 1,
        explain: "Cypher는 -[:상사*]-> 처럼 길이가 정해지지 않은 경로를 한 줄로 써요. SQL에서는 재귀 CTE가 필요해요. 빠르기는 데이터와 질의에 따라 달라요.",
      },
      scene(api) {
        const { s, say } = fx.stage(api);
        const A = api.accent;
        const PUR = "#8a5cc2";
        // 질의 패턴
        const pat = api.n("g", {}, s);
        api.n("rect", { x: 20, y: 14, width: 320, height: 76, rx: 12, fill: "#1f2430" }, pat);
        api.t("MATCH 패턴", { x: 34, y: 34, "font-size": 10.5, "font-weight": 800, fill: "#9aa3b5" }, pat);
        const ret = api.t("RETURN b = 오일곱", { x: 326, y: 34, "text-anchor": "end", "font-size": 12, "font-weight": 900, fill: "#5fd39a", opacity: 0 }, pat);
        const PN = [["박세나", A], ["팀", GUIDE], ["본부", PUR], ["b", A]];
        const PR = ["소속", "속함", "본부장"];
        const pchip = PN.map(([n, c], i) => {
          const x = 52 + i * 84;
          const g = api.n("g", {}, pat);
          const r = api.n("circle", { cx: x, cy: 62, r: 15, fill: "none", stroke: c, "stroke-width": 2 }, g);
          api.t(n, { x, y: 66, "text-anchor": "middle", "font-size": n.length > 2 ? 9 : 10.5, "font-weight": 800, fill: "#fff" }, g);
          if (i < 3) { api.n("line", { x1: x + 16, y1: 62, x2: x + 68, y2: 62, stroke: "#5b6475", "stroke-width": 1.6 }, g); api.t(PR[i], { x: x + 42, y: 56, "text-anchor": "middle", "font-size": 9.5, "font-weight": 800, fill: "#9aa3b5" }, g); }
          return r;
        });
        // 그래프
        api.n("rect", { x: 20, y: 102, width: 320, height: 310, rx: 12, fill: "#fff", filter: "url(#fxsh)" }, s);
        const N = {
          박세나: [70, 360, A], 최네오: [170, 380, A], 김하나: [270, 380, A],
          영업팀: [100, 270, GUIDE], IT팀: [260, 290, GUIDE],
          사업본부: [110, 180, PUR], 기술본부: [250, 190, PUR],
          오일곱: [90, 126, A], 정다섯: [270, 130, A],
        };
        const E = [["박세나", "영업팀"], ["최네오", "영업팀"], ["김하나", "IT팀"], ["영업팀", "사업본부"], ["IT팀", "기술본부"], ["사업본부", "오일곱"], ["기술본부", "정다섯"]];
        const match = [["박세나", "영업팀"], ["영업팀", "사업본부"], ["사업본부", "오일곱"]];
        const el = E.map(([a, b]) => ({ a, b, l: api.n("line", { x1: N[a][0], y1: N[a][1], x2: N[b][0], y2: N[b][1], stroke: LINE, "stroke-width": 2.2 }, s) }));
        const nd = Object.entries(N).map(([n, [x, y, c]]) => {
          const w = n.length * 11 + 18;
          const r = api.n("rect", { x: x - w / 2, y: y - 14, width: w, height: 28, rx: 14, fill: "#fff", stroke: c, "stroke-width": 2 }, s);
          api.t(n, { x, y: y + 4.5, "text-anchor": "middle", "font-size": 11, "font-weight": 800, fill: INK }, s);
          return { n, r, c };
        });
        api.loop(t => {
          t = t % 11;
          const order = ["박세나", "영업팀", "사업본부", "오일곱"];
          const k = Math.floor(clamp((t - 1.0) / 5.0) * 4);
          pchip.forEach((r, i) => { r.setAttribute("fill", i < k || (t > 6 && i < 4) ? PN[i][1] : "none"); });
          nd.forEach(({ n, r, c }) => {
            const i = order.indexOf(n);
            const on = i >= 0 && (i < k || t > 6);
            r.setAttribute("fill", on ? c : "#fff");
            r.setAttribute("stroke-width", on ? 3 : 2);
            r.nextSibling.setAttribute("fill", on ? "#fff" : INK);
          });
          el.forEach(({ a, b, l }) => {
            const mi = match.findIndex(([x, y]) => x === a && y === b);
            const on = mi >= 0 && (mi + 1 < k || t > 6);
            l.setAttribute("stroke", on ? A : LINE); l.setAttribute("stroke-width", on ? 4 : 2.2);
          });
          ret.setAttribute("opacity", seg(t, 6.4, 6.8) * (1 - seg(t, 10.4, 10.9)));
          say(t, [[0.2, 6.2, "패턴과 맞는 경로를 이웃만 따라가며 찾아요"], [6.3, 10.8, "경로 끝의 b가 답이에요"]]);
        }, 8);
      },
    }
