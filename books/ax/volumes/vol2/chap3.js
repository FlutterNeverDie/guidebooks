export default {
      title: "크기에는 정답이 없어요",
      tag: "작으면 또렷하고, 크면 맥락이 많고, 너무 크면 잘려요",
      lead: "조각이 작으면 뜻이 또렷해서 정확히 찾지만 앞뒤 맥락이 모자라요. 크면 맥락은 넉넉하지만 여러 이야기가 섞이고 LLM에 넘기는 글이 늘어요. 그리고 임베딩 모델의 입력 한도를 넘으면 뒷부분은 아예 검색에 안 잡혀요.",
      body: `
<h3>실습 결과: 같은 문서, 같은 질문 12개</h3>
<table class="vs">
  <tr><th>자르는 방법</th><th>조각</th><th>평균</th><th>1위</th><th>3위 안</th><th>넘기는 글</th></tr>
  <tr><td>고정 150자</td><td>14</td><td>146자</td><td>8</td><td>11</td><td>450자</td></tr>
  <tr><td>고정 150자 + 겹침 50</td><td>21</td><td>144자</td><td>9</td><td><span class="good">12</span></td><td>449자</td></tr>
  <tr><td>문단</td><td>23</td><td>82자</td><td>9</td><td><span class="poor">10</span></td><td><span class="good">242자</span></td></tr>
  <tr><td>문단 + 제목</td><td>23</td><td>92자</td><td><span class="poor">5</span></td><td><span class="good">12</span></td><td>277자</td></tr>
  <tr><td>절 통째로</td><td>7</td><td>280자</td><td>10</td><td>12</td><td><span class="poor">847자</span></td></tr>
</table>
<p><small>넘기는 글 = 질문마다 상위 3개 조각 길이의 합(평균). 문서 하나, 질문 12개짜리 작은 실험이라 숫자 자체보다 경향을 봐요.</small></p>

<h3>표에서 읽을 것</h3>
<ul>
  <li><b>절 통째로가 1위를 가장 많이 맞혔지만 함정이 있어요.</b> 조각이 7개뿐이라 상위 3개가 문서의 절반 가까이 돼요. LLM에 넘기는 글도 문단의 3.5배예요.</li>
  <li><b>모델 입력 한도.</b> 실습 모델은 128토큰(이 문서에서 약 225자)까지만 읽어요. '2. 연차와 휴가' 절은 402자라서 뒤쪽의 이월과 경조 휴가 문단이 벡터에 들어가지 않아요. 앞 250자로 만든 벡터와 절 전체 벡터의 코사인이 1.0000으로 똑같았어요. 그 절이 검색된 건 앞부분이 연차 이야기라서였지, 답 문장 덕이 아니에요.</li>
  <li><b>제목 붙이기는 양날이에요.</b> 답 조각의 점수는 0.57에서 0.63으로 올랐어요. 그런데 같은 절 문단끼리 서로 비슷해져서 1위는 9개에서 5개로 줄었어요. 3위 안은 10개에서 12개로 늘었어요.</li>
</ul>

<h3>그래서 어디서 시작하나</h3>
<ol class="steps">
  <li><b>모델 입력 한도보다 작게</b><small>한도를 넘는 조각은 뒷부분이 검색되지 않아요. 모델 설명에서 한도를 먼저 확인해요.</small></li>
  <li><b>문단 기준 + 긴 문단만 더 자르기 + 약간의 겹침</b><small>재귀 분할이 이 출발점이에요.</small></li>
  <li><b>내 질문으로 재기</b><small>정답 크기는 문서와 질문에 따라 달라요. 질문 세트로 재는 방법은 4권에서 다뤄요.</small></li>
</ol>

<div class="try"><span class="lbl">직접 해 보기</span>
<p><code>rag-study/step3_chunking.py</code>: A 부분이 위 표, D 부분이 입력 한도 실험이에요. <code>fixed(150)</code>의 숫자를 바꿔 다시 돌려 봐요.</p></div>`,
      lab: "<b>API 페이지 크기</b>와 같아요. 페이지가 너무 작으면 요청이 많아지고 한 화면에 필요한 정보가 모자라요. 너무 크면 쓸데없는 데이터까지 내려보내요. 게다가 게이트웨이에 요청 본문 한도가 있으면 넘는 부분은 조용히 잘려요. 임베딩 모델의 입력 한도가 바로 그 조용한 잘림이에요.",
      quiz: {
        q: "임베딩 모델의 입력 한도가 128토큰인데 조각을 1,000자로 잘랐어요. 무슨 일이 생길까요?",
        options: ["모델이 오류를 내서 바로 알 수 있다", "조각 앞부분만 벡터가 되고 뒷부분 내용은 검색에 안 잡힌다", "자동으로 여러 벡터로 나눠 저장된다"], answer: 1,
        explain: "대부분 라이브러리는 한도를 넘는 부분을 오류 없이 잘라 버려요. 실습에서도 앞 250자 벡터와 전체 벡터가 똑같았어요. 그래서 조각 크기는 모델 한도보다 작게 잡아요.",
      },
      scene(api) {
        const { s, say } = fx.stage(api);
        const A = api.accent;
        // 1부: 크기 슬라이더
        const p1 = api.n("g", {}, s);
        api.t("조각 크기", { x: 22, y: 30, "font-size": 12, "font-weight": 800, fill: INK }, p1);
        const sizeT = api.t("", { x: 338, y: 30, "text-anchor": "end", "font-size": 12, "font-weight": 800, fill: A }, p1);
        const X0 = 22, PX = 0.79; // 1자 = 0.79px, 400자까지
        api.n("rect", { x: X0, y: 44, width: 316, height: 40, rx: 8, fill: "#fff", filter: "url(#fxsh)" }, p1);
        for (let k = 0; k < 15; k++) api.n("rect", { x: X0 + 8 + k * 21, y: 54 + (k % 2) * 12, width: 16, height: 5, rx: 2.5, fill: LINE }, p1);
        const win = api.n("rect", { x: X0, y: 44, width: 40, height: 40, rx: 8, fill: A, opacity: 0.18, stroke: A, "stroke-width": 2 }, p1);
        const over = api.n("rect", { x: 0, y: 44, width: 0, height: 40, fill: MUTED, opacity: 0.35 }, p1);
        const wallX = X0 + 225 * PX;
        api.n("line", { x1: wallX, y1: 38, x2: wallX, y2: 92, stroke: BAD, "stroke-width": 2, "stroke-dasharray": "4 3" }, p1);
        api.t("입력 한도 128토큰", { x: wallX - 4, y: 104, "text-anchor": "end", "font-size": 10, "font-weight": 800, fill: BAD }, p1);
        const overT = api.t("벡터에 안 들어감", { x: wallX + 6, y: 104, "font-size": 10, "font-weight": 800, fill: MUTED, opacity: 0 }, p1);
        const meters = [["뜻이 또렷함", A, v => 1 - 0.8 * v], ["앞뒤 맥락", GUIDE, v => 0.15 + 0.85 * v], ["LLM에 넘기는 글", HARN, v => 0.1 + 0.9 * v]].map(([w, c, f], i) => {
          const y = 132 + i * 38;
          api.t(w, { x: 22, y: y + 4, "font-size": 11, "font-weight": 700, fill: INK }, p1);
          api.n("rect", { x: 132, y: y - 6, width: 206, height: 12, rx: 6, fill: PAPER }, p1);
          const b = api.n("rect", { x: 132, y: y - 6, width: 10, height: 12, rx: 6, fill: c }, p1);
          return { b, f };
        });
        // 2부: 실습 결과 막대
        const p2 = api.n("g", {}, s);
        api.t("실습 결과 · 질문 12개", { x: 22, y: 262, "font-size": 12, "font-weight": 800, fill: INK }, p2);
        api.t("넘기는 글(자)", { x: 338, y: 262, "text-anchor": "end", "font-size": 10, fill: MUTED }, p2);
        const R = [["문단", 242, 9, GUIDE], ["문단+제목", 277, 5, A], ["고정", 450, 8, MUTED], ["고정+겹침", 449, 9, HOOK], ["절 통째로", 847, 10, HARN]];
        const bars = R.map(([n, v, top1, c], i) => {
          const y = 284 + i * 27;
          api.t(n, { x: 22, y: y + 11, "font-size": 11, "font-weight": 700, fill: INK }, p2);
          const b = api.n("rect", { x: 96, y, width: 0, height: 15, rx: 4, fill: c, opacity: 0.85 }, p2);
          const l = api.t(`${v}자 · 1위 ${top1}`, { x: 100, y: y + 11, "font-size": 10, "font-weight": 800, fill: INK, opacity: 0 }, p2);
          return { b, l, w: v / 847 * 150 };
        });
        api.loop(t => {
          t = t % 13;
          // 크기: 40 -> 400 -> 160
          const v = t < 5 ? seg(t, 0.4, 4.6) : 1 - 0.65 * seg(t, 5.2, 6.4);
          const chars = Math.round(40 + 360 * v);
          sizeT.textContent = `${chars}자`;
          const w = chars * PX;
          win.setAttribute("width", w);
          const ov = Math.max(0, X0 + w - wallX);
          over.setAttribute("x", wallX); over.setAttribute("width", ov);
          overT.setAttribute("opacity", ov > 4 ? 1 : 0);
          win.setAttribute("stroke", ov > 4 ? BAD : A);
          meters.forEach(({ b, f }) => b.setAttribute("width", 206 * f(v)));
          p1.setAttribute("opacity", t < 6.8 ? 1 : 0.45);
          p2.setAttribute("opacity", seg(t, 6.6, 7.0));
          bars.forEach(({ b, l, w: bw }, i) => {
            const g = seg(t, 7.0 + i * 0.3, 7.7 + i * 0.3);
            b.setAttribute("width", bw * g);
            l.setAttribute("x", 96 + bw * g + 6);
            l.setAttribute("opacity", seg(t, 7.6 + i * 0.3, 7.9 + i * 0.3));
          });
          say(t, [[0.2, 2.6, "작을수록 뜻이 또렷해요"], [2.7, 5.1, "한도를 넘으면 뒤쪽은 검색에 안 잡혀요"], [5.2, 6.7, "그래서 한도보다 작게 잡아요"], [6.8, 12.6, "절 통째로는 잘 맞혀도 글을 3.5배 넘겨요"]]);
        }, 9.5);
      },
    }
