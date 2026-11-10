export default {
      title: "자르는 방법 네 가지",
      tag: "고정 길이, 겹침, 구조, 부모-자식",
      lead: "문서를 통째로 검색하면 너무 크고, 한 문장씩 검색하면 앞뒤 맥락이 없어요. 그래서 중간 크기로 잘라요. 자르는 방법은 크게 네 가지이고, 실무에서는 섞어 써요.",
      body: `
<table class="vs">
  <tr><th>방법</th><th>어떻게</th><th>좋은 점</th><th>약한 점</th></tr>
  <tr><td>고정 길이</td><td>N글자(또는 N토큰)마다</td><td><span class="good">가장 단순, 크기가 고름</span></td><td><span class="poor">문장이 중간에 잘림</span></td></tr>
  <tr><td>고정 + 겹침</td><td>앞 조각 끝 일부를 다음 조각 앞에 다시 넣음</td><td><span class="good">경계에서 잘린 문장을 살림</span></td><td>조각 수와 저장량이 늘어남</td></tr>
  <tr><td>구조 기준</td><td>제목, 문단, 문장 경계에서</td><td><span class="good">조각마다 한 가지 이야기</span></td><td><span class="poor">크기가 들쭉날쭉</span></td></tr>
  <tr><td>부모-자식</td><td>작은 조각으로 찾고, 그 조각이 속한 큰 절을 넘김</td><td><span class="good">정확히 찾고 맥락도 충분</span></td><td>저장 구조가 복잡해짐</td></tr>
</table>

<h3>고정 길이 + 겹침은 세 줄이에요</h3>
<pre class="code"><code>def fixed(text, size=150, overlap=50):
    step = size - overlap
    return [text[i:i + size] for i in range(0, len(text), step)]</code></pre>
<p>실습에서 150자로 자르니 "출근한 시각부터 <b>9시</b> | <b>간 뒤에 퇴근</b>한다"처럼 답이 두 조각으로 갈라졌어요. 이 질문은 상위 3개 안에서 답을 못 찾았고, 겹침 50자를 주니 한 조각에 같이 들어가서 1위로 찾았어요.</p>

<h3>실무에서 자주 쓰는 조합</h3>
<ul>
  <li><b>재귀 분할</b>: 문단으로 먼저 자르고, 한도를 넘는 문단만 줄, 문장, 글자 순으로 더 잘라요. LangChain의 <code>RecursiveCharacterTextSplitter</code>가 이 방식이에요.</li>
  <li><b>제목 붙이기</b>: 조각 앞에 "3. 출장 &gt;"처럼 절 제목을 붙여 "무슨 이야기인지"를 남겨요.</li>
  <li><b>의미 기준 분할</b>: 문장마다 임베딩해서 뜻이 크게 바뀌는 곳에서 잘라요. 비용이 더 들어요.</li>
</ul>

<div class="try"><span class="lbl">직접 해 보기</span>
<p><code>rag-study/step3_chunking.py</code>: 다섯 가지로 잘라 같은 질문 12개를 검색해요. B 부분이 잘린 답과 겹침으로 살아난 답을 보여 줘요.</p></div>`,
      lab: "<b>부모-자식</b>은 DB 조회와 똑같아요. 검색은 작은 색인 키로 빠르고 정확하게 하고, 돌려줄 때는 PK로 원본 행 전체를 읽어요. 색인에는 문장 크기 조각을 넣고, 찾은 조각의 <code>parent_id</code>로 절 전체를 꺼내 LLM에 넘겨요. <b>겹침</b>은 로그를 파일 크기로 나눌 때 경계 앞뒤 몇 줄을 양쪽 파일에 다 남기는 것과 같아요.",
      quiz: {
        q: "고정 길이로 잘랐더니 답 문장이 두 조각 경계에서 갈라졌어요. 가장 먼저 해 볼 간단한 방법은?",
        options: ["임베딩 모델을 큰 것으로 바꾼다", "조각 사이에 겹침을 둔다", "검색 결과 개수 k를 1로 줄인다"], answer: 1,
        explain: "겹침을 두면 경계 근처 문장이 앞뒤 조각 중 하나에는 통째로 들어가요. 실습에서도 겹침 50자로 잘린 답을 1위로 찾았어요.",
      },
      scene(api) {
        const { s, say } = fx.stage(api);
        const A = api.accent;
        const C = [A, HARN, GUIDE, HOOK, "#8a5cc2"];
        // 단어 배치: 0 = 제목1, 1-6 문장1, 7-13 문장2, 14-18 문장3, 19 = 제목2, 20-25 문장4, 26-31 문장5
        const sent = i => i === 0 || i === 19 ? -1 : i < 7 ? 0 : i < 14 ? 1 : i < 19 ? 2 : i < 26 ? 3 : 4;
        const W = [], X0 = 26, X1 = 334;
        let x = X0, y = 104;
        for (let i = 0; i < 32; i++) {
          const w = sent(i) < 0 ? 44 : 16 + ((i * 37) % 24);
          if (x + w > X1) { x = X0; y += 30; }
          W.push({ x, y, w }); x += w + 5;
          if (i === 18) { x = X0; y += 30; }
        }
        const words = api.n("g", {}, s);
        const bg = W.map(({ x, y, w }) => api.n("rect", { x: x - 2, y: y - 4, width: w + 4, height: 16, rx: 4, fill: GUIDE, opacity: 0 }, words));
        W.forEach(({ x, y, w }, i) => api.n("rect", { x, y, width: w, height: 8, rx: 4, fill: sent(i) < 0 ? INK : "#c3c9d6" }, words));
        const ul = W.map(({ x, y, w }) => [0, 1].map(l => api.n("rect", { x, y: y + 12 + l * 5, width: w + 5, height: 3.2, rx: 1.6, fill: A, opacity: 0 }, words)));
        api.t("문서", { x: 26, y: 88, "font-size": 10.5, "font-weight": 800, fill: MUTED }, s);
        // 모드 표시
        const head = fx.card(api, s, 20, 14, 320, 52, { c: A });
        const hT = api.t("", { x: 38, y: 36, "font-size": 13.5, "font-weight": 900, fill: INK }, s);
        const hS = api.t("", { x: 38, y: 54, "font-size": 10.5, fill: MUTED }, s);
        // 잘림 표시
        const cut = api.n("g", { opacity: 0 }, s);
        const cw = W[10];
        api.n("line", { x1: cw.x - 3, y1: cw.y - 10, x2: cw.x - 3, y2: cw.y + 22, stroke: BAD, "stroke-width": 2.4 }, cut);
        fx.icon(api, cut, "cut", cw.x - 3, cw.y - 18, 14, BAD);
        // 부모 괄호
        const par = api.n("rect", { x: 20, y: W[19].y - 10, width: 320, height: W[31].y - W[19].y + 34, rx: 10, fill: "none", stroke: HOOK, "stroke-width": 2, "stroke-dasharray": "5 4", opacity: 0 }, s);
        const mag = api.n("g", { opacity: 0 }, s);
        api.n("circle", { cx: 0, cy: 0, r: 13, fill: "#fff", filter: "url(#fxsh)" }, mag);
        fx.icon(api, mag, "search", 0, 0, 16, A);
        // 결과 카드
        const res = api.n("g", {}, s);
        const rc = api.n("rect", { x: 20, y: 268, width: 320, height: 136, rx: 12, fill: "#fff", filter: "url(#fxsh)" }, res);
        const rStrip = api.n("rect", { x: 20, y: 268, width: 5, height: 136, rx: 2.5, fill: A }, res);
        const rIcon = api.n("g", {}, res);
        const rL = api.t("검색에 걸린 조각", { x: 38, y: 290, "font-size": 10.5, "font-weight": 800, fill: MUTED }, res);
        const r1 = api.t("", { x: 38, y: 318, "font-size": 12, "font-weight": 700, fill: INK }, res);
        const r2 = api.t("", { x: 38, y: 340, "font-size": 12, "font-weight": 700, fill: INK }, res);
        const r3 = api.t("", { x: 38, y: 380, "font-size": 11.5, "font-weight": 800, fill: A }, res);
        const M = [
          { t: "1  고정 길이", sub: "글자 수로 자른다. 경계를 보지 않는다", ch: [[0, 9], [10, 19], [20, 29], [30, 31]],
            r: ["조각 1: …출근한 시각부터 9시", "조각 2: 간 뒤에 퇴근한다. 핵심 근무…", "답 '9시간 뒤에 퇴근'이 두 조각으로 갈라짐"], c: BAD, cap: "고정 길이는 문장을 중간에 잘라요" },
          { t: "2  고정 + 겹침", sub: "앞 조각 끝을 다음 조각 앞에 다시 넣는다", ch: [[0, 9], [7, 16], [14, 23], [21, 30], [28, 31]],
            r: ["조각 2: …출근한 시각부터 9시간 뒤에", "퇴근한다. 핵심 근무 시간은…", "겹친 50자 덕분에 한 조각에 다 들어감"], c: GUIDE, cap: "겹침을 두면 잘린 문장이 한쪽에 살아요" },
          { t: "3  구조 기준", sub: "제목과 문단 경계에서 자른다", ch: [[0, 18], [19, 31]],
            r: ["1. 근무 시간 > 기본 근무 시간은 하루", "… 출근한 시각부터 9시간 뒤에 퇴근한다.", "조각마다 한 가지 이야기, 크기는 제각각"], c: A, cap: "제목·문단 경계에서 자르면 뜻이 온전해요" },
          { t: "4  부모-자식", sub: "작은 조각으로 찾고, 큰 절을 넘긴다", ch: [[1, 6], [7, 13], [14, 18], [20, 25], [26, 31]],
            r: ["찾기: 문장 조각 '경조 휴가는 연차와…'", "넘기기: 그 문장이 든 '2. 연차' 절 전체", "찾을 땐 정확하게, 넘길 땐 넉넉하게"], c: HOOK, cap: "작게 찾고 크게 넘겨요" },
        ];
        const D = 4.2;
        api.loop(t => {
          const mi = Math.floor(t / D) % M.length, u = t % D, m = M[mi];
          if (hT.textContent !== m.t) {
            hT.textContent = m.t; hS.textContent = m.sub;
            [r1, r2, r3].forEach((e, k) => e.textContent = "");
            rStrip.setAttribute("fill", m.c); r3.setAttribute("fill", m.c);
            rIcon.innerHTML = ""; fx.icon(api, rIcon, m.c === BAD ? "x" : "check", 318, 286, 18, m.c);
          }
          head.setAttribute("opacity", seg(u, 0, 0.3));
          [hT, hS].forEach(e => e.setAttribute("opacity", seg(u, 0, 0.3)));
          // 밑줄: 조각마다 차례로
          ul.forEach(l => l.forEach(r => r.setAttribute("opacity", 0)));
          m.ch.forEach(([a, b], k) => {
            const on = seg(u, 0.3 + k * 0.25, 0.5 + k * 0.25);
            for (let i = a; i <= b; i++) {
              const r = ul[i][k % 2];
              r.setAttribute("fill", C[k % C.length]); r.setAttribute("opacity", on);
            }
          });
          // 강조
          const hl = seg(u, 1.6, 1.9) * (1 - seg(u, D - 0.3, D));
          bg.forEach((r, i) => {
            let o = 0, c = GUIDE;
            if (mi === 0 && sent(i) === 1) { o = hl * 0.22; c = BAD; }
            if (mi === 1 && sent(i) === 1) o = hl * 0.25;
            if (mi === 3 && sent(i) === 3) { o = seg(u, 1.4, 1.7) * 0.25; c = A; }
            r.setAttribute("opacity", o); r.setAttribute("fill", c);
          });
          cut.setAttribute("opacity", mi === 0 ? hl : 0);
          par.setAttribute("opacity", mi === 3 ? seg(u, 2.2, 2.5) * (1 - seg(u, D - 0.3, D)) : 0);
          const w4 = W[22];
          mag.setAttribute("opacity", mi === 3 ? seg(u, 0.9, 1.2) * (1 - seg(u, D - 0.3, D)) : 0);
          mag.setAttribute("transform", `translate(${lerp(300, w4.x + 10, seg(u, 0.9, 1.4))}, ${w4.y - 16})`);
          res.setAttribute("opacity", seg(u, 1.8, 2.1) * (1 - seg(u, D - 0.25, D)));
          fx.type(r1, m.r[0], seg(u, 2.0, 2.6)); fx.type(r2, m.r[1], seg(u, 2.5, 3.1));
          r3.textContent = u > 3.1 ? m.r[2] : "";
          say(u + mi * D, [[mi * D + 0.2, mi * D + D - 0.1, m.cap]]);
        }, 6.4);
      },
    }
