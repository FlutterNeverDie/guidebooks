export default {
      title: "메타데이터 필터와 제품 고르기",
      tag: "범위는 먼저 좁히고, 제품은 이미 쓰는 인프라부터 봐요",
      lead: "실무 검색은 '뜻이 가까운 것'만으로 끝나지 않아요. 이 부서 문서만, 올해 것만, 이 사람이 볼 수 있는 것만 같은 조건이 붙어요. 이 조건을 언제 거느냐에 따라 결과 개수가 달라져요. 그리고 벡터 DB는 새로 들이기 전에 이미 쓰는 DB에 붙일 수 있는지부터 봐요.",
      body: `
<h3>사전 필터와 사후 필터</h3>
<table class="vs">
  <tr><th></th><th>사후 필터</th><th>사전 필터</th></tr>
  <tr><td>순서</td><td>가까운 k개를 찾고 조건으로 거름</td><td>조건에 맞는 것 안에서 가까운 k개를 찾음</td></tr>
  <tr><td>결과</td><td><span class="poor">k개보다 적게 남을 수 있어요</span></td><td><span class="good">k개를 채워요</span></td></tr>
  <tr><td>주의</td><td>k를 넉넉히 잡아 보완</td><td>조건이 아주 좁으면 색인 효율이 떨어져 제품마다 처리 방식이 달라요</td></tr>
</table>
<p><b>권한 필터는 검색 단계에서 걸어요.</b> 볼 수 없는 문서를 LLM에게 넘기고 "이건 말하지 마"라고 하는 건 막는 게 아니에요. 프롬프트에 들어간 내용은 새어 나올 수 있다고 봐야 해요.</p>

<h3>제품 지도</h3>
<table class="vs">
  <tr><th>갈래</th><th>예</th><th>이럴 때</th></tr>
  <tr><td>이미 쓰는 DB에 붙이기</td><td>PostgreSQL + pgvector, OpenSearch, Elasticsearch</td><td><span class="good">운영 중인 DB가 있고 규모가 감당될 때.</span> 조인, 트랜잭션, 키워드 검색을 같이 써요</td></tr>
  <tr><td>전용 벡터 DB</td><td>Qdrant, Milvus, Weaviate</td><td>벡터가 아주 많거나 필터·하이브리드 기능이 많이 필요할 때</td></tr>
  <tr><td>가볍게 시작</td><td>Chroma, FAISS(라이브러리)</td><td>실습, 프로토타입, 서버 없이 한 프로세스 안에서</td></tr>
  <tr><td>관리형 서비스</td><td>Pinecone, 클라우드 업체 검색 서비스</td><td>운영 인력이 없고 비용을 감당할 때</td></tr>
</table>

<h3>고르는 순서</h3>
<ol class="steps">
  <li><b>규모</b><small>조각 수 x 차원 x 4바이트로 메모리를 어림해요(2권 5장).</small></li>
  <li><b>이미 쓰는 인프라</b><small>새 DB 하나는 백업, 모니터링, 장애 대응이 하나 더 생긴다는 뜻이에요.</small></li>
  <li><b>필요한 기능</b><small>필터, 하이브리드, 멀티테넌시, 갱신 빈도.</small></li>
  <li><b>내 데이터로 측정</b><small>공개 벤치마크(ann-benchmarks 같은 곳)는 참고만 하고, recall과 지연을 내 데이터로 재요.</small></li>
</ol>

<div class="try"><span class="lbl">직접 해 보기</span>
<p><code>rag-study/step2_vector_search.py</code>: C 부분의 <code>where={"category": "it"}</code>가 메타데이터 필터예요. 조건을 바꿔 결과가 어떻게 달라지는지 봐요.</p></div>`,
      lab: "권한 필터는 <b>행 수준 보안(row-level security)</b>이에요. 화면에서 숨기는 게 아니라 쿼리 단계에서 볼 수 없는 행을 빼야 안전하죠. 사후 필터의 개수 부족은 <b>LIMIT 10 뒤에 WHERE를 거는 것</b>과 같아요. 10개를 먼저 자르고 거르면 10개보다 적게 나와요.",
      quiz: {
        q: "가까운 조각 5개를 찾은 뒤 'IT팀 문서만' 조건으로 거르니 1개만 남았어요. 왜 그럴까요?",
        options: ["IT팀 문서가 원래 1개뿐이라서", "사후 필터라서 상위 5개 안에 IT팀 문서가 1개뿐이었어서", "벡터 DB가 고장 나서"], answer: 1,
        explain: "먼저 5개를 자르고 걸렀기 때문이에요. 사전 필터를 쓰거나 k를 넉넉히 잡아야 IT팀 문서 5개를 채울 수 있어요.",
      },
      scene(api) {
        const { s, say } = fx.stage(api);
        const A = api.accent;
        let sd = 3;
        const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
        const DEPT = [["IT팀", GUIDE], ["인사팀", A], ["영업팀", HARN]];
        api.n("rect", { x: 20, y: 58, width: 320, height: 250, rx: 12, fill: "#fff", filter: "url(#fxsh)" }, s);
        const Q = [180, 182];
        const P = [];
        while (P.length < 30) {
          const p = [40 + rnd() * 280, 98 + rnd() * 196];
          if (Math.hypot(p[0] - Q[0], p[1] - Q[1]) > 16) P.push([...p, P.length % 5 === 0 ? 0 : 1 + (P.length % 2)]);
        }
        const dist = p => Math.hypot(p[0] - Q[0], p[1] - Q[1]);
        const byDist = P.map((p, i) => i).sort((a, b) => dist(P[a]) - dist(P[b]));
        const top5 = byDist.slice(0, 5);
        const itTop5 = byDist.filter(i => P[i][2] === 0).slice(0, 5);
        const dots = P.map(([x, y, d]) => api.n("circle", { cx: x, cy: y, r: 6, fill: DEPT[d][1] }, s));
        const rings = P.map(([x, y]) => api.n("circle", { cx: x, cy: y, r: 11, fill: "none", stroke: INK, "stroke-width": 2, opacity: 0 }, s));
        api.n("circle", { cx: Q[0], cy: Q[1], r: 8, fill: "#fff", stroke: INK, "stroke-width": 2.6 }, s);
        // 범례
        DEPT.forEach(([n, c], i) => { api.n("circle", { cx: 34 + i * 78, cy: 30, r: 6, fill: c }, s); api.t(n, { x: 44 + i * 78, y: 34, "font-size": 11, "font-weight": 700, fill: INK }, s); });
        const mode = api.t("", { x: 34, y: 80, "font-size": 12, "font-weight": 900, fill: INK }, s);
        const res = fx.card(api, s, 20, 322, 320, 52, { c: INK });
        const rT = api.t("", { x: 38, y: 343, "font-size": 12, "font-weight": 800, fill: INK }, s);
        const rS = api.t("", { x: 38, y: 362, "font-size": 10.5, fill: MUTED }, s);
        const lock = api.n("g", { opacity: 0 }, s);
        fx.icon(api, lock, "lock", 316, 348, 20, GUIDE);
        api.loop(t => {
          t = t % 13;
          const post = t < 6.3;
          const u = post ? t : t - 6.3;
          mode.textContent = post ? "사후 필터: 찾고 나서 거르기" : "사전 필터: 거르고 나서 찾기";
          dots.forEach((d, i) => {
            let o = 1;
            if (post && u > 2.6 && P[i][2] !== 0) o = 0.15;
            if (!post && u > 0.6 && P[i][2] !== 0) o = 0.15;
            d.setAttribute("opacity", o);
          });
          rings.forEach((r, i) => {
            let o = 0, c = INK;
            if (post && u > 1.0 && top5.includes(i)) { o = 1; if (u > 2.6) { c = P[i][2] === 0 ? GUIDE : BAD; o = P[i][2] === 0 ? 1 : 0.35; } }
            if (!post && u > 1.6 && itTop5.includes(i)) { o = 1; c = GUIDE; }
            r.setAttribute("opacity", o); r.setAttribute("stroke", c);
          });
          const kept = top5.filter(i => P[i][2] === 0).length;
          rT.textContent = post ? (u > 2.6 ? `가까운 5개 중 IT팀은 ${kept}개만 남아요` : u > 1 ? "가까운 5개를 먼저 찾고" : "") : (u > 1.6 ? "IT팀 안에서 가까운 5개를 채워요" : u > 0.6 ? "IT팀 문서만 남기고" : "");
          rT.setAttribute("fill", post && u > 2.6 ? BAD : !post && u > 1.6 ? GUIDE : INK);
          rS.textContent = post && u > 2.6 ? "LIMIT 5 뒤에 WHERE를 건 셈" : !post && u > 2.6 ? "권한 조건도 이렇게 검색 단계에서 걸어요" : "";
          lock.setAttribute("opacity", !post && u > 2.6 ? 1 : 0);
          say(t, [[0.2, 6.2, "찾고 나서 거르면 개수가 모자랄 수 있어요"], [6.4, 12.8, "먼저 거르고 찾으면 k개를 채워요"]]);
        }, 9.5);
      },
    }
