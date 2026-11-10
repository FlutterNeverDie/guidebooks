export default {
      title: "자르기 전에: 적재와 정리",
      tag: "PDF는 보이는 대로 글이 나오지 않아요",
      lead: "청크를 고민하기 전에 먼저 할 일이 있어요. 문서를 깨끗한 글로 꺼내는 일이에요. 머리말이 조각마다 섞이거나 표가 숫자 더미로 깨지면, 뒤에서 아무리 잘 잘라도 검색이 흔들려요.",
      body: `
<h3>적재: 원본에서 글 꺼내기</h3>
<p>위키, 노션, PDF, 워드, 슬랙, DB 같은 원본마다 꺼내는 방법이 달라요. 마크다운이나 HTML처럼 구조가 있는 원본이 가장 쉽고, PDF가 가장 어려워요.</p>

<table class="vs">
  <tr><th>흔한 문제</th><th>무슨 일이 생기나</th><th>처리</th></tr>
  <tr><td>머리말·꼬리말</td><td>"대외비 · 3쪽"이 모든 조각에 들어가 조각끼리 비슷해져요</td><td>반복되는 줄을 지워요</td></tr>
  <tr><td>2단 편집</td><td>왼쪽 단과 오른쪽 단 문장이 한 줄씩 섞여 나와요</td><td>읽는 순서를 아는 파서를 써요</td></tr>
  <tr><td>표</td><td>"국내 10만 해외 200"처럼 칸 관계가 사라져요</td><td>행마다 문장으로 풀어요</td></tr>
  <tr><td>스캔본·이미지</td><td>글자가 아예 안 나와요</td><td>OCR이나 이미지를 읽는 모델</td></tr>
  <tr><td>옛 버전 공존</td><td>옛 규정과 새 규정이 둘 다 검색돼요</td><td>버전 메타데이터로 거르거나 옛 것을 빼요</td></tr>
</table>

<h3>메타데이터를 같이 붙여요</h3>
<p>조각마다 <b>출처 파일, 절 제목, 수정일, 볼 수 있는 사람</b>을 붙여 두면 나중에 쓸 데가 많아요. 답에 출처를 달고(1권), 검색 범위를 좁히고(3권), 권한이 없는 문서를 빼는 일이 모두 이 메타데이터로 돼요.</p>

<div class="try"><span class="lbl">직접 해 보기</span>
<p><code>rag-study/data/handbook.md</code>: 2권 실습에서 쓸 가짜 회사 안내서예요. <code>## 제목</code>으로 절이 나뉘어 있어서 다음 장에서 이 구조로 잘라 봐요.</p></div>`,
      lab: "이 단계는 데이터 파이프라인의 <b>ETL</b>이에요. 원본에서 꺼내고(Extract), 정리하고(Transform), 색인에 넣어요(Load). 데이터 웨어하우스 품질 문제의 상당수가 T 단계에서 생기듯, RAG가 엉뚱한 답을 낼 때도 원인이 파싱인 경우가 많아요. 그래서 색인에 들어간 조각을 직접 몇 개 찍어 보는 습관이 중요해요.",
      quiz: {
        q: "검색 결과를 찍어 보니 거의 모든 조각이 \"가나 소프트 대외비\"로 시작해요. 무엇이 문제일까요?",
        options: ["임베딩 모델이 너무 작다", "PDF 머리말이 조각마다 섞여 들어가 조각끼리 비슷해졌다", "벡터 DB 색인이 깨졌다"], answer: 1,
        explain: "모든 조각에 같은 문구가 들어가면 그 문구가 벡터에 섞여 조각끼리 구분이 흐려져요. 적재 단계에서 반복되는 머리말과 꼬리말을 지워요.",
      },
      scene(api) {
        const { s, say } = fx.stage(api);
        const A = api.accent;
        // PDF 쪽
        const page = api.n("g", {}, s);
        api.n("rect", { x: 20, y: 14, width: 320, height: 232, rx: 10, fill: "#fff", filter: "url(#fxsh)" }, page);
        const head = api.n("g", {}, page);
        api.t("가나 소프트 · 대외비", { x: 36, y: 34, "font-size": 10, "font-weight": 700, fill: MUTED }, head);
        api.n("line", { x1: 36, y1: 41, x2: 324, y2: 41, stroke: LINE, "stroke-width": 1 }, head);
        api.t("3. 출장", { x: 36, y: 62, "font-size": 12, "font-weight": 900, fill: INK }, page);
        // 2단 본문
        const colL = [0, 1, 2, 3].map(k => api.n("rect", { x: 36, y: 72 + k * 12, width: [130, 118, 126, 90][k], height: 5, rx: 2.5, fill: "#c9cfdb" }, page));
        const colR = [0, 1, 2, 3].map(k => api.n("rect", { x: 186, y: 72 + k * 12, width: [128, 132, 110, 120][k], height: 5, rx: 2.5, fill: "#c9cfdb" }, page));
        // 표
        const tbl = api.n("g", {}, page);
        api.n("rect", { x: 36, y: 128, width: 288, height: 72, rx: 6, fill: PAPER, stroke: LINE }, tbl);
        [["구분", "국내", "해외"], ["숙박비", "10만 원", "200달러"], ["일비", "-", "50달러"]].forEach((r, i) => {
          r.forEach((c, j) => api.t(c, { x: 60 + j * 96, y: 148 + i * 22, "font-size": 11, "font-weight": i === 0 || j === 0 ? 800 : 500, fill: INK }, tbl));
        });
        [150, 172].forEach(y => api.n("line", { x1: 40, y1: y + 4, x2: 320, y2: y + 4, stroke: LINE }, tbl));
        const foot = api.t("- 3 -", { x: 180, y: 232, "text-anchor": "middle", "font-size": 10, fill: MUTED }, page);
        // 스캔 막대
        const scan = api.n("rect", { x: 22, y: 0, width: 316, height: 3, fill: A, opacity: 0 }, s);
        // 지워짐 표시
        const strike = [[36, 34, 140], [164, 232, 32]].map(([x, y, w]) => api.n("line", { x1: x - 4, y1: y - 4, x2: x + w, y2: y - 4, stroke: BAD, "stroke-width": 2.4, opacity: 0 }, s));
        // 잘못 나온 글 (섞인 2단, 깨진 표)
        const raw = fx.card(api, s, 20, 262, 320, 66, { c: BAD, icon: "x" });
        const rawLabel = api.t("그냥 꺼내면", { x: 60, y: 282, "font-size": 10.5, "font-weight": 800, fill: BAD }, s);
        const rawT = api.t("", { x: 60, y: 304, "font-size": 11, fill: INK }, s);
        const rawT2 = api.t("", { x: 60, y: 320, "font-size": 11, fill: INK }, s);
        // 정리된 조각
        const clean = fx.card(api, s, 20, 340, 320, 76, { c: GUIDE, icon: "check" });
        const cleanT = api.t("", { x: 60, y: 364, "font-size": 11.5, "font-weight": 700, fill: INK }, s);
        const tags = [["출처 handbook.md", 56, 112], ["절 3. 출장", 174, 70], ["수정 2026-10", 250, 84]].map(([w, x, pw]) => {
          const g = api.n("g", { opacity: 0 }, s);
          api.n("rect", { x, y: 380, width: pw, height: 22, rx: 11, fill: A, opacity: 0.12 }, g);
          api.t(w, { x: x + 8, y: 395, "font-size": 10.5, "font-weight": 700, fill: A }, g);
          return g;
        });
        api.loop(t => {
          t = t % 12;
          const out = 1 - seg(t, 11.4, 11.9);
          page.setAttribute("opacity", seg(t, 0, 0.4) * out);
          // 1단계: 그냥 꺼내기 (스캔 + 섞인 결과)
          const sp = seg(t, 0.6, 2.4);
          scan.setAttribute("y", 14 + 230 * sp);
          scan.setAttribute("opacity", t > 0.6 && t < 2.5 ? 0.7 : t > 5.2 && t < 7.0 ? 0.7 : 0);
          if (t > 5.2 && t < 7.0) scan.setAttribute("y", 14 + 230 * seg(t, 5.2, 7.0));
          [raw, rawLabel].forEach(e => e.setAttribute("opacity", seg(t, 2.4, 2.8) * out * (t > 5 ? 0.45 : 1)));
          fx.type(rawT, "가나 소프트 · 대외비 3. 출장 국내 출장은 KTX", seg(t, 2.6, 3.6));
          fx.type(rawT2, "구분 국내 해외 숙박비 10만 원 200달러 - 3 -", seg(t, 3.6, 4.6));
          [rawT, rawT2].forEach(e => e.setAttribute("opacity", out * (t > 5 ? 0.45 : 1)));
          [colL, colR].forEach((col, ci) => col.forEach((r, k) => r.setAttribute("fill", t > 2.6 && t < 4.8 && (k + ci) % 2 === 0 ? BAD : "#c9cfdb")));
          // 2단계: 정리 (머리말·꼬리말 지우고 표를 문장으로)
          strike.forEach((l, i) => l.setAttribute("opacity", seg(t, 5.4 + i * 0.6, 5.7 + i * 0.6) * out));
          head.setAttribute("opacity", 1 - 0.7 * seg(t, 5.6, 6.0));
          foot.setAttribute("opacity", 1 - 0.7 * seg(t, 6.2, 6.6));
          tbl.setAttribute("transform", `translate(0, ${-3 * fx.pulse(t, 6) * (t > 6.6 && t < 7.6 ? 1 : 0)})`);
          clean.setAttribute("opacity", seg(t, 7.0, 7.4) * out);
          fx.type(cleanT, "3. 출장 > 해외 숙박비는 1박 200달러까지", seg(t, 7.2, 8.6));
          cleanT.setAttribute("opacity", out);
          tags.forEach((g, i) => g.setAttribute("opacity", seg(t, 8.8 + i * 0.35, 9.1 + i * 0.35) * out));
          say(t, [[0.2, 5.0, "그냥 꺼내면 머리말, 2단, 표가 뒤섞여요"], [5.1, 8.7, "반복 줄은 지우고 표는 문장으로 풀어요"], [8.8, 11.6, "조각마다 출처와 절 이름을 붙여 둬요"]]);
        }, 9.6);
      },
    }
