export default {
      title: "GraphRAG와 하이브리드",
      tag: "질문 속 대상에서 그래프를 펼쳐 사실을 모으고, 글 검색과 합쳐요",
      lead: "그래프와 벡터 검색은 경쟁자가 아니에요. 벡터는 '어떤 이야기인지'로 찾고, 그래프는 '무엇과 이어져 있는지'로 찾아요. GraphRAG는 질문에 나온 대상에서 그래프를 몇 칸 펼쳐 관련 사실을 모은 뒤, 글 조각과 함께 LLM에 넘기는 방식이에요.",
      body: `
<h3>실습: 그래프를 펼쳐 모은 사실</h3>
<ol class="steps">
  <li><b>시작 대상 찾기</b><small>질문 "박세나가 해외 출장 가려면 누가 승인해?"에서 박세나, 해외 출장 규정을 찾았어요. 규정 이름의 단어 하나만 맞춰도 잡게 해서 국내 출장 규정도 같이 잡혔어요.</small></li>
  <li><b>세 칸 펼치기</b><small>시작 대상에서 관계를 따라 세 칸까지 이웃을 모았어요.</small></li>
  <li><b>사실 8개를 LLM에 넘기기</b><small>필요한 사실 4개(소속, 속함, 본부장, 해외 출장 승인자)가 모두 들어 있어요. 같은 사실을 벡터로 찾았을 때는 상위 5개에 2개만 들어왔어요.</small></li>
</ol>
<p>대신 관계없는 사실도 섞여요(노트북-044, 국내 출장 규정). 펼치는 칸 수가 늘수록 사실이 기하급수로 늘어서, 실무에서는 관계 종류를 골라 펼치거나 모은 사실을 다시 재정렬해요.</p>

<h3>그래프를 RAG에 붙이는 세 가지 방식</h3>
<table class="vs">
  <tr><th>방식</th><th>어떻게</th><th>맞는 질문</th></tr>
  <tr><td>펼치기(로컬)</td><td>질문 속 대상에서 이웃 몇 칸을 모아 넘김</td><td>특정 대상에 대한 여러 단계 질문</td></tr>
  <tr><td>질의 생성</td><td>LLM이 Cypher나 SPARQL을 쓰고 코드가 실행(SQL 도구와 같은 모양)</td><td>정확한 조건, 집계</td></tr>
  <tr><td>묶음 요약(전역)</td><td>그래프를 무리로 나눠 무리마다 요약을 미리 만들어 둠. Microsoft의 GraphRAG가 이 방식으로 알려졌어요</td><td>"이 문서들의 주요 주제는?" 같은 전체 질문</td></tr>
</table>

<h3>먼저 따져 볼 것</h3>
<p>그래프는 만들고 유지하는 데 손이 많이 가요. 조직도처럼 이미 표로 있는 관계라면 그래프 DB를 세우기 전에 <b>SQL 도구 하나</b>로 충분할 수 있어요. 관계 종류가 많고, 단계가 정해지지 않고, 여러 원천을 이어야 할 때 그래프의 값어치가 커져요.</p>

<div class="try"><span class="lbl">직접 해 보기</span>
<p><code>rag-study/step7_ontology.py</code>: E 부분이 그래프 펼치기예요. 펼치는 칸 수(<code>range(3)</code>)를 1로 바꾸면 필요한 사실이 빠지는 걸 볼 수 있어요.</p></div>`,
      lab: "API 응답을 만들 때 <b>연관 엔티티를 몇 단계까지 함께 불러오는 것</b>(ORM의 eager loading, GraphQL의 중첩 필드)과 같아요. 너무 얕으면 화면에 필요한 값이 없고, 너무 깊으면 쓸데없는 데이터가 쏟아지죠. GraphRAG의 펼치는 칸 수와 관계 종류 선택이 바로 그 깊이 조절이에요.",
      quiz: {
        q: "실습에서 GraphRAG가 넘긴 사실에 '박세나는 노트북-044를 쓴다'가 섞였어요. 이걸 줄이는 방법으로 알맞은 것은?",
        options: ["그래프를 지운다", "질문에 맞는 관계 종류만 골라 펼치거나 모은 사실을 재정렬한다", "펼치는 칸 수를 10으로 늘린다"], answer: 1,
        explain: "승인자 질문에는 소속, 속함, 본부장, 승인역할만 필요해요. 관계 종류를 골라 펼치면 잡음이 줄고, 넘기는 글도 줄어요.",
      },
      scene(api) {
        const { s, say } = fx.stage(api);
        const A = api.accent;
        const PUR = "#8a5cc2", RUL = "#c28a1b";
        fx.bubble(api, s, 20, 12, 320, 32, "박세나가 해외 출장 가려면 누가 승인해?", { c: INK, fs: 11.5, tail: null });
        api.n("rect", { x: 20, y: 54, width: 320, height: 200, rx: 12, fill: "#fff", filter: "url(#fxsh)" }, s);
        // [x, y, 색, 시작에서 칸 수]
        const N = {
          박세나: [80, 150, A, 0], "해외 출장 규정": [250, 222, RUL, 0], "국내 출장 규정": [250, 82, RUL, 0],
          영업팀: [150, 110, GUIDE, 1], "노트북-044": [78, 222, HARN, 1], 본부장: [292, 150, MUTED, 1], 팀장: [180, 82, MUTED, 1],
          사업본부: [170, 190, PUR, 2], 최네오: [70, 76, A, 2],
          오일곱: [158, 238, A, 3],
        };
        const E = [["박세나", "영업팀"], ["박세나", "노트북-044"], ["해외 출장 규정", "본부장"], ["국내 출장 규정", "팀장"], ["영업팀", "사업본부"], ["영업팀", "최네오"], ["사업본부", "오일곱"]];
        const el = E.map(([a, b]) => ({ a, b, l: api.n("line", { x1: N[a][0], y1: N[a][1], x2: N[b][0], y2: N[b][1], stroke: LINE, "stroke-width": 2 }, s) }));
        const cp = api.n("clipPath", { id: "gr5clip" }, api.n("defs", {}, s));
        api.n("rect", { x: 20, y: 54, width: 320, height: 200, rx: 12 }, cp);
        const ring = api.n("circle", { cx: 80, cy: 150, r: 0, fill: A, opacity: 0.06, "clip-path": "url(#gr5clip)" }, s);
        const nd = Object.entries(N).map(([n, [x, y, c, h]]) => {
          const g = api.n("g", {}, s);
          const w = n.length * 10 + 16;
          const r = api.n("rect", { x: x - w / 2, y: y - 12, width: w, height: 24, rx: 12, fill: "#fff", stroke: c, "stroke-width": 2 }, g);
          const tx = api.t(n, { x, y: y + 4, "text-anchor": "middle", "font-size": 10, "font-weight": 800, fill: INK }, g);
          return { n, g, r, tx, c, h };
        });
        // 모은 사실
        api.t("LLM에 넘기는 사실 (8개 중 6개)", { x: 20, y: 276, "font-size": 11, "font-weight": 900, fill: INK }, s);
        const F = [["박세나는 영업팀 소속이다.", 1], ["해외 출장 규정의 승인자는 본부장이다.", 1], ["영업팀은 사업본부에 속한다.", 1], ["사업본부의 본부장은 오일곱이다.", 1], ["박세나는 노트북-044를 쓴다.  (잡음)", 0], ["국내 출장 규정의 승인자는 팀장이다.  (잡음)", 0]];
        const fl = F.map(([f, need], i) => api.t(f, { x: 30 + (i % 2) * 0, y: 296 + i * 19, "font-size": 10.5, "font-weight": need ? 800 : 500, fill: need ? GUIDE : MUTED, opacity: 0 }, s));
        api.loop(t => {
          t = t % 12;
          const hop = t < 1.2 ? -1 : t < 2.4 ? 0 : t < 3.6 ? 1 : t < 4.8 ? 2 : 3;
          ring.setAttribute("r", hop < 0 ? 0 : 50 + hop * 55);
          nd.forEach(({ r, tx, c, h, g }) => {
            const on = h <= hop;
            r.setAttribute("fill", on ? (h === 0 ? c : "#fff") : "#fff");
            r.setAttribute("stroke-width", on ? 2.6 : 1.4);
            tx.setAttribute("fill", on && h === 0 ? "#fff" : INK);
            g.setAttribute("opacity", on ? 1 : 0.3);
          });
          el.forEach(({ a, b, l }) => {
            const on = Math.max(N[a][3], N[b][3]) <= hop;
            l.setAttribute("stroke", on ? A : LINE); l.setAttribute("opacity", on ? 0.8 : 0.4);
          });
          fl.forEach((e, i) => e.setAttribute("opacity", seg(t, 5.4 + i * 0.35, 5.7 + i * 0.35)));
          say(t, [[0.2, 2.3, "질문에 나온 대상에서 시작해요"], [2.4, 5.3, "관계를 따라 한 칸씩 펼쳐요"], [5.4, 11.8, "필요한 사실 4개가 모두 모여요. 잡음도 조금"]]);
        }, 9.5);
      },
    }
