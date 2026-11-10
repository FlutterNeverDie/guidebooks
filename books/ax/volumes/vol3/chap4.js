export default {
      title: "하이브리드 검색과 재정렬",
      tag: "키워드와 벡터로 후보를 모으고, 질문과 함께 다시 읽어 순서를 고쳐요",
      lead: "벡터는 뜻으로, 키워드 검색(BM25)은 정확한 단어로 찾아요. 놓치는 질문이 서로 달라서 둘을 섞으면 후보가 넉넉해져요. 그리고 후보 몇십 개만 질문과 한 쌍씩 다시 읽어 순서를 고치는 재정렬이 정확도를 크게 올려요.",
      body: `
<h3>실습: 조각 23개, 질문 17개</h3>
<table class="vs">
  <tr><th>방식</th><th>1위</th><th>3위 안</th><th>MRR</th></tr>
  <tr><td>BM25, 띄어쓰기로 자름</td><td>6</td><td>9</td><td><span class="poor">0.43</span></td></tr>
  <tr><td>BM25, 두 글자씩 자름</td><td>11</td><td>13</td><td>0.70</td></tr>
  <tr><td>벡터</td><td>9</td><td>16</td><td>0.71</td></tr>
  <tr><td>하이브리드(RRF)</td><td>9</td><td>13</td><td>0.67</td></tr>
  <tr><td>하이브리드 + 재정렬</td><td><span class="good">16</span></td><td><span class="good">16</span></td><td><span class="good">0.94</span></td></tr>
</table>
<p><small>MRR = 답 순위의 역수 평균(1위면 1, 2위면 0.5). 질문 13개는 문서 단어를 피해 바꿔 말했고, 4개는 'USB', 'KTX'처럼 문서 단어를 그대로 썼어요.</small></p>

<h3>표에서 읽을 것</h3>
<ul>
  <li><b>한국어 BM25는 자르는 법이 중요해요.</b> '휴가를'과 '휴가'는 띄어쓰기로 자르면 다른 단어예요. 두 글자씩 자르니 MRR이 0.43에서 0.70이 됐어요. 실무에서는 형태소 분석기를 써요.</li>
  <li><b>합치기만으로는 늘 좋아지지 않아요.</b> 이 실험에서 RRF는 벡터 단독보다 조금 낮았어요. 그런데 후보를 고르게 모으는 역할은 했어요.</li>
  <li><b>재정렬이 결정적이었어요.</b> 1위가 9개에서 16개가 됐어요.</li>
  <li><b>재정렬은 후보 안에서만 고쳐요.</b> '책 사는 돈 회사가 내줘?'는 벡터로는 1위였는데 RRF에서 10위 밖으로 밀려나, 재정렬도 살리지 못했어요.</li>
</ul>

<h3>RRF: 점수 대신 순위로 합치기</h3>
<pre class="code"><code>def rrf(*rankings, k=60):
    score = {}
    for ranking in rankings:
        for r, doc in enumerate(ranking[:20], 1):
            score[doc] = score.get(doc, 0) + 1 / (k + r)
    return sorted(score, key=lambda d: -score[d])</code></pre>
<p>BM25 점수와 코사인은 크기가 달라서 그냥 더할 수 없어요. RRF는 순위만 써서 이 문제를 피해요.</p>

<h3>재정렬(cross-encoder)은 왜 정확한가</h3>
<p>임베딩은 질문과 조각을 <b>따로</b> 벡터로 만들어 비교해요. 재정렬 모델은 질문과 조각을 <b>한 입력으로 같이</b> 읽고 점수를 매겨요. 그래서 정확하지만 조각마다 모델을 한 번씩 돌려야 해서 느려요. 그래서 후보 10~50개에만 써요.</p>

<div class="try"><span class="lbl">직접 해 보기</span>
<p><code>rag-study/step5_hybrid_rerank.py</code>: 위 표를 만들어요. 처음 실행할 때 다국어 재정렬 모델(약 0.57GB)을 받아요.</p></div>`,
      lab: "<b>검색 엔진의 2단계 랭킹</b>이고, DB로 치면 <b>인덱스로 후보 PK를 뽑은 뒤 애플리케이션에서 정밀 필터</b>를 거는 것과 같아요. 1단계(인덱스, BM25, 벡터)는 싸고 넓게, 2단계(재정렬)는 비싸고 좁게 해요. 1단계가 후보에 못 넣은 건 2단계가 아무리 좋아도 못 찾아요.",
      quiz: {
        q: "재정렬 모델을 조각 전체가 아니라 후보 10~50개에만 쓰는 이유는?",
        options: ["재정렬 모델은 조각을 50개까지만 저장할 수 있어서", "질문과 조각을 한 쌍씩 모델에 넣어야 해서 느리고 비싸서", "후보가 많으면 정확도가 떨어지게 설계돼서"], answer: 1,
        explain: "cross-encoder는 조각마다 모델을 한 번씩 돌려요. 수백만 개에 쓰면 질문 하나에 몇 분이 걸려요. 빠른 1단계 검색으로 후보를 줄인 뒤에 써요.",
      },
      scene(api) {
        const { s, say } = fx.stage(api);
        const A = api.accent;
        fx.bubble(api, s, 30, 12, 300, 34, "할머니 돌아가시면 며칠 쉬어?", { c: INK, fs: 12, tail: null });
        const ANS = "경조 휴가";
        const mk = (name, w, c) => {
          const g = api.n("g", {}, s);
          const hit = name === ANS;
          api.n("rect", { x: 0, y: 0, width: w, height: 26, rx: 7, fill: hit ? GUIDE : "#fff", filter: "url(#fxsh)" }, g);
          if (!hit) api.n("rect", { x: 0, y: 0, width: 4, height: 26, rx: 2, fill: c }, g);
          const n = api.t("", { x: 12, y: 17.5, "font-size": 11, "font-weight": 800, fill: hit ? "#fff" : MUTED }, g);
          api.t(name, { x: 30, y: 17.5, "font-size": 11.5, "font-weight": 800, fill: hit ? "#fff" : INK }, g);
          g.num = n; return g;
        };
        // 1부: 두 목록 (step5 실제 상위 5개)
        const V = ["숙박비", "경조 휴가", "연차 이월", "연차 생김", "회의실"];
        const K = ["근무 시간", "택배", "주차", "회의실", "USB"];
        const hV = api.t("벡터", { x: 20, y: 72, "font-size": 11.5, "font-weight": 900, fill: A }, s);
        const hK = api.t("BM25 키워드", { x: 186, y: 72, "font-size": 11.5, "font-weight": 900, fill: HARN }, s);
        const c1 = [...V.map((n, i) => ({ g: mk(n, 154, A), x: 20, i })), ...K.map((n, i) => ({ g: mk(n, 154, HARN), x: 186, i }))];
        c1.forEach(({ g, i }) => { g.num.textContent = i + 1; });
        // 2부: 합친 목록과 재정렬
        const RRF = ["회의실", "근무 시간", "숙박비", "택배", "경조 휴가"];
        const RR = ["경조 휴가", "연차 이월", "근무 시간", "회의실", "영수증"];
        const names = [...new Set([...RRF, ...RR])];
        const c2 = names.map(n => ({ n, g: mk(n, 220, INK), a: RRF.indexOf(n), b: RR.indexOf(n) }));
        const hM = api.t("", { x: 70, y: 72, "font-size": 11.5, "font-weight": 900, fill: INK }, s);
        // 재정렬 막대
        const scan = api.n("rect", { x: 64, y: 80, width: 232, height: 30, rx: 8, fill: "none", stroke: HOOK, "stroke-width": 2.4, opacity: 0 }, s);
        const box = fx.card(api, s, 20, 266, 320, 140, { c: HOOK });
        const bT = api.t("", { x: 36, y: 292, "font-size": 12, "font-weight": 900, fill: INK }, s);
        const b1 = api.t("", { x: 36, y: 318, "font-size": 11, fill: INK }, s);
        const b2 = api.t("", { x: 36, y: 340, "font-size": 11, fill: INK }, s);
        const b3 = api.t("", { x: 36, y: 380, "font-size": 11.5, "font-weight": 800, fill: GUIDE }, s);
        const Y = i => 82 + i * 34;
        api.loop(t => {
          t = t % 15;
          const out = 1 - seg(t, 14.4, 14.9);
          const p1 = 1 - seg(t, 4.0, 4.6);
          [hV, hK].forEach(e => e.setAttribute("opacity", p1 * out));
          c1.forEach(({ g, x, i }) => {
            const a = seg(t, 0.2 + i * 0.15, 0.5 + i * 0.15);
            g.setAttribute("transform", `translate(${lerp(x, 70, 1 - p1)}, ${Y(i)})`);
            g.setAttribute("opacity", a * p1 * out);
          });
          const ph = t < 4.6 ? 0 : t < 8.4 ? 1 : 2;
          hM.textContent = ph === 1 ? "RRF로 합친 순서" : ph === 2 ? "재정렬한 순서" : "";
          hM.setAttribute("opacity", out);
          const rr = seg(t, 9.8, 10.8);
          c2.forEach(({ n, g, a, b }) => {
            let y, o;
            if (a >= 0 && b >= 0) { y = lerp(Y(a), Y(b), rr); o = 1; }
            else if (a >= 0) { y = Y(a) + 40 * rr; o = 1 - rr; }
            else { y = Y(b) + 40 * (1 - rr); o = rr; }
            g.setAttribute("transform", `translate(70, ${y})`);
            g.setAttribute("opacity", (ph === 0 ? 0 : seg(t, 4.6, 5.0)) * o * out);
            const pos = rr > 0.5 ? b : a;
            g.num.textContent = pos >= 0 ? pos + 1 : "";
          });
          const sc = clamp((t - 8.6) / 1.2);
          scan.setAttribute("y", Y(Math.min(4, Math.floor(sc * 5))) - 2);
          scan.setAttribute("opacity", t > 8.6 && t < 9.8 ? 1 : 0);
          box.setAttribute("opacity", seg(t, 4.8, 5.2) * out);
          bT.textContent = ph < 2 ? "RRF: 순위로 합쳐요" : "재정렬: 질문과 조각을 함께 읽어요";
          b1.textContent = ph < 2 ? "점수 = 1/(60+벡터 순위) + 1/(60+BM25 순위)" : "후보마다 (질문, 조각) 쌍을 모델에 넣어";
          b2.textContent = ph < 2 ? "경조 휴가: 벡터 2위지만 BM25에서 밀려 5위" : "관련 있는 정도를 다시 매겨요";
          b3.textContent = ph === 2 && t > 10.8 ? "경조 휴가 5위 → 1위" : "";
          [bT, b1, b2, b3].forEach(e => e.setAttribute("opacity", seg(t, 4.8, 5.2) * out));
          say(t, [[0.2, 4.4, "벡터와 키워드가 찾는 게 서로 달라요"], [4.6, 8.4, "두 목록을 순위로 합쳐 후보를 모아요"], [8.5, 14.6, "재정렬 모델이 다시 읽고 순서를 고쳐요"]]);
        }, 12);
      },
    }
