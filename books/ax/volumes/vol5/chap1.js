export default {
      title: "온톨로지란",
      tag: "무엇이 있고, 서로 어떤 관계이고, 무엇이 허용되나",
      lead: "온톨로지는 한 분야에 무엇이 있고(클래스), 각각 무엇을 갖고(속성), 서로 어떻게 이어지며(관계), 무엇이 허용되는지(제약)를 정한 약속이에요. 그 약속대로 실제 사실을 채운 것이 지식 그래프예요. DB로 치면 온톨로지는 스키마, 지식 그래프는 데이터예요.",
      body: `
<h3>네 가지 재료</h3>
<table class="vs">
  <tr><th>재료</th><th>뜻</th><th>실습 예</th></tr>
  <tr><td>클래스</td><td>대상의 종류</td><td>사람, 팀, 본부, 장비, 규정, 역할</td></tr>
  <tr><td>속성</td><td>대상이 가진 값</td><td>사람의 입사일, 장비의 구매일</td></tr>
  <tr><td>관계</td><td>대상과 대상 사이의 이름 있는 연결</td><td>소속(사람→팀), 속함(팀→본부), 본부장(본부→사람)</td></tr>
  <tr><td>제약</td><td>허용되는 연결의 모양</td><td>'소속'은 사람에서 팀으로만</td></tr>
</table>

<h3>사실 하나 = 세 칸짜리 줄</h3>
<p>지식 그래프의 사실은 (주어, 관계, 목적어) 세 칸으로 적어요. 이걸 트리플이라고 불러요.</p>
<pre class="code"><code>(박세나, 소속, 영업팀)
(영업팀, 속함, 사업본부)
(사업본부, 본부장, 오일곱)
(해외 출장 규정, 승인역할, 본부장)</code></pre>

<h3>헷갈리는 말</h3>
<table class="vs">
  <tr><th>말</th><th>뜻</th></tr>
  <tr><td>분류 체계(택소노미)</td><td>종류의 위아래 나무만. "노트북은 장비의 하나"</td></tr>
  <tr><td>온톨로지</td><td>종류 + 관계 + 제약까지 정한 약속(스키마)</td></tr>
  <tr><td>지식 그래프</td><td>온톨로지에 맞춰 실제 사실을 채운 그래프(데이터)</td></tr>
</table>

<div class="try"><span class="lbl">직접 해 보기</span>
<p><code>rag-study/step7_ontology.py</code>: 맨 위의 <code>RELATIONS</code>가 이 실습의 온톨로지예요. 관계 일곱 개와 각각의 제약이 적혀 있어요.</p>
<p><code>rag-study/data/org.md</code>: 그래프로 바꿀 조직도 문장이에요.</p></div>`,
      lab: "<b>ERD와 외래 키</b>를 떠올리면 돼요. 클래스는 테이블, 속성은 컬럼, 관계는 외래 키, 제약은 외래 키 제약과 CHECK예요. 차이는 관계가 일급 시민이라는 점이에요. 관계에 이름과 방향이 있고, 새 관계를 더할 때 테이블을 바꿀 필요가 없고, '몇 단계 떨어진 대상'을 조인 없이 따라가요.",
      quiz: {
        q: "'노트북-031은 영업팀 소속이다'라는 문장이 들어왔어요. 온톨로지에 '소속은 사람에서 팀으로'라고 정해 뒀다면?",
        options: ["그대로 그래프에 넣는다", "제약에 맞지 않으니 막고 사람에게 확인을 요청한다", "노트북-031을 사람으로 바꾼다"], answer: 1,
        explain: "제약은 잘못 뽑힌 사실을 걸러 주는 그물이에요. 실습에서도 이 문장은 '장비→팀'이라 막혔어요. 장비의 담당 팀을 적고 싶다면 '관리팀' 같은 새 관계를 온톨로지에 더해요.",
      },
      scene(api) {
        const { s, say } = fx.stage(api);
        const A = api.accent;
        const C = { 사람: [A, 70, 70], 팀: [GUIDE, 180, 70], 본부: ["#8a5cc2", 290, 70], 장비: [HARN, 70, 196], 규정: ["#c28a1b", 180, 196], 역할: [MUTED, 290, 196] };
        api.t("온톨로지 (스키마)", { x: 20, y: 26, "font-size": 12, "font-weight": 900, fill: INK }, s);
        const box = {};
        Object.entries(C).forEach(([n, [c, x, y]]) => {
          const g = api.n("g", { opacity: 0 }, s);
          api.n("rect", { x: x - 40, y: y - 18, width: 80, height: 36, rx: 8, fill: "#fff", stroke: c, "stroke-width": 2.2, filter: "url(#fxsh)" }, g);
          api.t(n, { x, y: y + 5, "text-anchor": "middle", "font-size": 12.5, "font-weight": 900, fill: c }, g);
          box[n] = g;
        });
        const R = [["사람", "팀", "소속", 0, -14], ["팀", "본부", "속함", 0, -14], ["사람", "장비", "사용", -14, 0], ["규정", "역할", "승인역할", 0, -30], ["규정", "팀", "알림", 14, 0]];
        const rels = R.map(([a, b, n, dx, dy]) => {
          const [, x1, y1] = C[a], [, x2, y2] = C[b];
          const g = api.n("g", { opacity: 0 }, s);
          const sx = x1 + Math.sign(x2 - x1) * 40, sy = y1 + Math.sign(y2 - y1) * 18, ex = x2 - Math.sign(x2 - x1) * 44, ey = y2 - Math.sign(y2 - y1) * 22;
          api.n("line", { x1: sx, y1: sy, x2: ex, y2: ey, stroke: INK, "stroke-width": 1.6 }, g);
          const ang = Math.atan2(ey - sy, ex - sx);
          api.n("path", { d: `M${ex} ${ey} l${-8 * Math.cos(ang - 0.4)} ${-8 * Math.sin(ang - 0.4)} M${ex} ${ey} l${-8 * Math.cos(ang + 0.4)} ${-8 * Math.sin(ang + 0.4)}`, stroke: INK, "stroke-width": 1.6, fill: "none" }, g);
          api.t(n, { x: (sx + ex) / 2 + dx, y: (sy + ey) / 2 + dy, "text-anchor": "middle", "font-size": 10.5, "font-weight": 800, fill: INK }, g);
          return g;
        });
        // 지식 그래프 (데이터)
        const kg = api.n("g", {}, s);
        api.n("rect", { x: 20, y: 240, width: 320, height: 176, rx: 12, fill: "#fff", filter: "url(#fxsh)" }, kg);
        api.t("지식 그래프 (사실)", { x: 34, y: 262, "font-size": 12, "font-weight": 900, fill: INK }, kg);
        const T = [["박세나", "소속", "영업팀", true], ["영업팀", "속함", "사업본부", true], ["사업본부", "본부장", "오일곱", true], ["노트북-031", "소속", "영업팀", false]];
        const rows = T.map(([a, r, b, ok], i) => {
          const g = api.n("g", { opacity: 0 }, kg);
          const y = 286 + i * 30;
          api.n("rect", { x: 34, y: y - 15, width: 260, height: 24, rx: 6, fill: ok ? PAPER : "#fbe9e9" }, g);
          api.t(`(${a}, ${r}, ${b})`, { x: 44, y: y + 2, "font-size": 11.5, "font-weight": 800, fill: INK }, g);
          const mark = api.n("g", {}, g);
          api.n("circle", { cx: 312, cy: y - 3, r: 10, fill: ok ? GUIDE : BAD }, mark);
          fx.icon(api, mark, ok ? "check" : "x", 312, y - 3, 13, "#fff");
          return { g, ok };
        });
        const why = api.t("'소속'은 사람→팀만 허용. 장비→팀이라 막음", { x: 34, y: 404, "font-size": 10.5, "font-weight": 800, fill: BAD, opacity: 0 }, kg);
        api.loop(t => {
          t = t % 12;
          const out = 1 - seg(t, 11.4, 11.9);
          Object.values(box).forEach((g, i) => g.setAttribute("opacity", seg(t, 0.2 + i * 0.2, 0.5 + i * 0.2) * out));
          rels.forEach((g, i) => g.setAttribute("opacity", seg(t, 1.8 + i * 0.35, 2.1 + i * 0.35) * out));
          kg.setAttribute("opacity", seg(t, 4.2, 4.5) * out);
          rows.forEach(({ g }, i) => g.setAttribute("opacity", seg(t, 4.6 + i * 0.7, 4.9 + i * 0.7)));
          why.setAttribute("opacity", seg(t, 7.6, 7.9));
          ["사람", "장비", "팀"].forEach(n => box[n].setAttribute("transform", t > 7.4 && t < 10 && n !== "팀" ? `translate(0, ${-2 * fx.pulse(t, 8)})` : ""));
          say(t, [[0.2, 4.1, "어떤 종류가 있고 어떻게 이어지는지 정해요"], [4.2, 7.3, "그 약속대로 사실을 채우면 지식 그래프예요"], [7.4, 11.6, "약속에 안 맞는 사실은 막아요"]]);
        }, 9);
      },
    }
