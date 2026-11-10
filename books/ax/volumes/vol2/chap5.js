export default {
      title: "임베딩 모델 고르기",
      tag: "모델마다 좌표계가 달라요. 바꾸면 전부 다시 매겨요",
      lead: "임베딩 모델은 답을 쓰는 LLM과 따로 골라요. 볼 것은 언어, 입력 한도, 차원, 실행 위치예요. 그리고 한 번 고르면 색인과 질문이 반드시 같은 모델을 써야 해요. 모델마다 좌표계가 달라서 섞으면 거리가 의미 없어져요.",
      body: `
<table class="vs">
  <tr><th>기준</th><th>볼 것</th><th>실습 모델</th></tr>
  <tr><td>언어</td><td>한국어를 학습했는지</td><td>다국어(약 50개 언어)</td></tr>
  <tr><td>입력 한도</td><td>몇 토큰까지 읽는지. 조각 크기의 상한</td><td>128토큰</td></tr>
  <tr><td>차원</td><td>벡터 길이. 저장량과 검색 속도에 바로 영향</td><td>384</td></tr>
  <tr><td>접두어</td><td>질문과 문서 앞에 <code>query:</code>, <code>passage:</code> 같은 표시가 필요한지(E5 계열이 그래요)</td><td>필요 없음</td></tr>
  <tr><td>실행 위치</td><td>내 서버에서 돌리나, API로 부르나</td><td>로컬, 0.22GB</td></tr>
  <tr><td>분야</td><td>법률, 의료, 코드처럼 전문 용어가 많은 문서인지</td><td>일반 문장</td></tr>
</table>

<h3>차원은 곧 메모리예요</h3>
<p>벡터 숫자 하나는 보통 4바이트(float32)예요. 384차원이면 조각 하나에 1,536바이트, 조각 100만 개면 벡터만 약 1.5GB예요. 1,024차원이면 약 4GB가 돼요. 여기에 색인 구조가 쓰는 메모리가 더 붙어요(3권).</p>

<h3>로컬이냐 API냐</h3>
<table class="vs">
  <tr><th></th><th>로컬 모델</th><th>API 모델</th></tr>
  <tr><td>데이터</td><td><span class="good">문서가 밖으로 안 나가요</span></td><td><span class="poor">색인할 문서 전체가 외부로 가요</span></td></tr>
  <tr><td>비용</td><td>서버 자원만</td><td>호출량만큼</td></tr>
  <tr><td>운영</td><td><span class="poor">모델 서빙을 직접 해요</span></td><td><span class="good">호출만 하면 돼요</span></td></tr>
</table>

<h3>지켜야 할 규칙</h3>
<ol class="steps">
  <li><b>색인과 질문은 같은 모델, 같은 버전, 같은 접두어</b><small>하나라도 다르면 다른 좌표계예요.</small></li>
  <li><b>모델을 바꾸면 전부 다시 임베딩</b><small>새 모델로 질문만 바꾸는 방법은 없어요. 그래서 조각마다 어떤 모델로 만들었는지 메타데이터로 남겨요.</small></li>
  <li><b>순위표는 참고만</b><small>MTEB 리더보드에서 한국어 과제 점수를 볼 수 있지만 순위는 자주 바뀌고 내 문서와 달라요. 후보 두세 개를 내 질문 세트로 재요(4권).</small></li>
</ol>

<div class="try"><span class="lbl">직접 해 보기</span>
<p><code>rag-study/step3_chunking.py</code>: G 부분이 fastembed 모델 목록에서 차원, 입력 한도, 접두어 필요 여부를 읽어요. 목록의 다른 모델로 바꿔 A 부분 표가 어떻게 달라지는지 봐요.</p></div>`,
      lab: "<b>DB 정렬 규칙(collation)이나 비밀번호 해시 알고리즘을 바꾸는 것</b>과 같아요. 규칙이 바뀌면 기존 인덱스와 저장된 해시를 새 값과 비교할 수 없어서, 인덱스를 다시 만들거나 값을 다시 계산해야 해요. 임베딩 모델 교체는 벡터 색인 전체 재구축이에요. 그래서 처음 고를 때 신중하고, 바꿀 때는 새 색인을 따로 만든 뒤 전환해요.",
      quiz: {
        q: "조각 1,000만 개를 1,024차원 float32 벡터로 저장해요. 벡터만 대략 얼마나 될까요?",
        options: ["약 4GB", "약 40GB", "약 400GB"], answer: 1,
        explain: "1,024 x 4바이트 = 4,096바이트(약 4KB)이고, 1,000만 개면 약 40GB예요. 색인 구조 메모리는 따로예요. 차원이 저장 비용을 바로 정해요.",
      },
      scene(api) {
        const { s, say } = fx.stage(api);
        const A = api.accent;
        // 모델 칩
        const chip = (x, w, c) => {
          const g = api.n("g", {}, s);
          api.n("rect", { x, y: 14, width: 150, height: 40, rx: 10, fill: "#fff", filter: "url(#fxsh)" }, g);
          api.t(w, { x: x + 12, y: 30, "font-size": 10, "font-weight": 800, fill: MUTED }, g);
          const v = api.t("", { x: x + 12, y: 46, "font-size": 12.5, "font-weight": 900, fill: c }, g);
          return v;
        };
        const idxT = chip(20, "색인에 쓴 모델", INK), qT = chip(190, "질문에 쓴 모델", INK);
        // 좌표 평면
        api.n("rect", { x: 20, y: 68, width: 320, height: 240, rx: 12, fill: "#fff", filter: "url(#fxsh)" }, s);
        api.n("path", { d: "M40 292V84M40 292h284", stroke: LINE, "stroke-width": 1.4, fill: "none" }, s);
        const G = [["휴가", A, [110, 140], [236, 236]], ["출장", HARN, [258, 132], [108, 238]], ["장비", GUIDE, [196, 238], [124, 128]]];
        const off = [[-16, -8], [10, -14], [14, 10], [-10, 14]];
        const pts = [];
        G.forEach(([n, c, a, b], gi) => off.forEach(([dx, dy], j) => {
          const d = api.n("circle", { r: 6, fill: c }, s);
          pts.push({ d, a: [a[0] + dx, a[1] + dy], b: [b[0] + dx, b[1] + dy], gi });
        }));
        const glabels = G.map(([n, c]) => api.t(n, { "text-anchor": "middle", "font-size": 11, "font-weight": 800, fill: c }, s));
        // 질문 점
        const q = api.n("g", {}, s);
        api.n("circle", { cx: 0, cy: 0, r: 8, fill: "#fff", stroke: INK, "stroke-width": 2.4 }, q);
        api.n("circle", { cx: 0, cy: 0, r: 2.6, fill: INK }, q);
        const ring = api.n("circle", { r: 24, fill: "none", stroke: GUIDE, "stroke-width": 2, "stroke-dasharray": "4 3", opacity: 0 }, s);
        const mark = api.n("g", { opacity: 0 }, s);
        const markBg = api.n("circle", { cx: 0, cy: 0, r: 12, fill: GUIDE }, mark);
        const markIc = api.n("g", {}, mark);
        // 질문 말풍선과 결과
        const ask = fx.bubble(api, s, 20, 322, 320, 34, "할머니 돌아가시면 며칠 쉬어?", { c: INK, fs: 12, tail: null });
        const res = fx.card(api, s, 20, 366, 320, 46, { c: GUIDE });
        const resT = api.t("", { x: 36, y: 394, "font-size": 12, "font-weight": 800, fill: INK }, s);
        const prog = api.n("rect", { x: 20, y: 408, width: 0, height: 4, rx: 2, fill: HOOK }, s);
        const qA = [124, 150], qB = [232, 228];
        let lastMark = "";
        api.loop(t => {
          t = t % 12.5;
          const ph = t < 3.8 ? 0 : t < 7.6 ? 1 : 2;
          const re = seg(t, 8.0, 9.6); // 다시 임베딩
          idxT.textContent = ph < 2 ? "모델 A" : re < 1 ? "모델 B로 다시 매기는 중" : "모델 B";
          idxT.setAttribute("fill", ph < 2 ? A : HOOK);
          qT.textContent = ph === 0 ? "모델 A" : "모델 B";
          qT.setAttribute("fill", ph === 0 ? A : HOOK);
          pts.forEach(p => {
            const x = lerp(p.a[0], p.b[0], ph === 2 ? re : 0), y = lerp(p.a[1], p.b[1], ph === 2 ? re : 0);
            p.d.setAttribute("cx", x); p.d.setAttribute("cy", y);
          });
          G.forEach(([n, c, a, b], gi) => {
            const k = ph === 2 ? re : 0;
            glabels[gi].setAttribute("x", lerp(a[0], b[0], k)); glabels[gi].setAttribute("y", lerp(a[1], b[1], k) + 36);
          });
          const u = ph === 0 ? t : ph === 1 ? t - 3.8 : t - 9.6;
          const tgt = ph === 0 ? qA : qB;
          const f = seg(u, 0.4, 1.4);
          q.setAttribute("transform", `translate(${lerp(300, tgt[0], f)}, ${lerp(96, tgt[1], f)})`);
          q.setAttribute("opacity", ph === 2 && t < 9.6 ? 0 : 1);
          const good = ph !== 1;
          const show = u > 1.5 && !(ph === 2 && t < 9.6);
          ring.setAttribute("cx", tgt[0]); ring.setAttribute("cy", tgt[1]);
          ring.setAttribute("stroke", good ? GUIDE : BAD);
          ring.setAttribute("opacity", show ? 1 : 0);
          mark.setAttribute("transform", `translate(${tgt[0] + 24}, ${tgt[1] - 24})`);
          mark.setAttribute("opacity", show ? 1 : 0);
          if (lastMark !== String(good)) { lastMark = String(good); markIc.innerHTML = ""; markBg.setAttribute("fill", good ? GUIDE : BAD); fx.icon(api, markIc, good ? "check" : "x", 0, 0, 16, "#fff"); }
          res.setAttribute("opacity", show || (ph === 2 && t >= 8.0) ? 1 : 0.3);
          resT.textContent = ph === 2 && t < 9.6 ? `조각 ${Math.round(12 * re)}/12 다시 임베딩` : !show ? "" : good ? "가까운 조각: 휴가 무리" : "가까운 조각: 장비 무리 (엉뚱해요)";
          resT.setAttribute("fill", good || !show ? INK : BAD);
          prog.setAttribute("width", ph === 2 ? 320 * re * (t < 9.6 ? 1 : 0) : 0);
          ask.setAttribute("opacity", 1);
          say(t, [[0.2, 3.7, "같은 모델로 색인하고 질문하면 맞게 찾아요"], [3.8, 7.5, "질문만 다른 모델이면 좌표계가 달라 엉뚱해요"], [7.6, 12.3, "모델을 바꾸면 조각을 전부 다시 임베딩해요"]]);
        }, 2.5);
      },
    }
