export default {
      title: "RAG = 검색 + 보강 + 생성",
      tag: "찾고, 프롬프트에 붙이고, 그걸 보고 답하게 해요",
      lead: "RAG(Retrieval-Augmented Generation)는 이름 그대로 세 단계예요. 질문과 관련된 자료를 찾고(검색), 그 자료를 프롬프트에 붙이고(보강), 모델이 그 자료를 근거로 답하게(생성) 해요. 모델은 바꾸지 않아요.",
      body: `
<ol class="steps">
  <li><b>검색 Retrieve</b><small>질문과 뜻이 가까운 문서 조각을 k개 찾아요. 벡터 검색, 키워드 검색, 또는 둘 다.</small></li>
  <li><b>보강 Augment</b><small>찾은 조각을 질문과 함께 프롬프트에 넣어요. "아래 자료로만 답하고, 없으면 모른다고 해"라는 지시도 같이.</small></li>
  <li><b>생성 Generate</b><small>모델이 자료를 읽고 답해요. 어느 조각에서 왔는지 출처 번호를 달게 하면 사람이 검증할 수 있어요.</small></li>
</ol>

<h3>코드로 보면 이게 전부예요</h3>
<pre class="code"><code># 1. 검색
chunks = search(question, k=4)
# 2. 보강
context = "\\n".join(f"[{c.id}] {c.text}" for c in chunks)
prompt = (f"자료:\\n{context}\\n\\n질문: {question}\\n"
          "자료에 있는 내용으로만 답하고 [id]를 달아라.")
# 3. 생성
answer = llm(prompt)</code></pre>
<p>LangChain 같은 프레임워크도 결국 이 세 줄을 감싸요. 어려운 부분은 프레임워크가 아니라 <b>search가 맞는 조각을 가져오느냐</b>예요. 이 책의 2~4권이 거의 다 그 이야기예요.</p>

<div class="try"><span class="lbl">직접 해 보기</span>
<p><code>rag-study/step2_vector_search.py</code>: 검색만 떼어서 돌려 봐요. API 키 없이 로컬에서 돌아요.</p>
<p><code>rag-study/step1_tool_use.py</code>: 모델이 검색 도구를 직접 부르는 방식이에요. API 키가 필요해요.</p></div>`,
      lab: "<b>API 게이트웨이가 요청을 넘기기 전에 사용자 정보를 조회해 헤더에 붙이는 것</b>과 같아요. 뒤쪽 서비스(LLM)는 바뀌지 않고, 앞에서 필요한 정보를 찾아 요청에 실어 줄 뿐이에요. 그래서 붙여 준 정보가 틀리면 뒤쪽이 아무리 좋아도 답이 틀려요.",
      quiz: {
        q: "RAG 답변이 틀렸을 때 가장 먼저 확인할 곳은 어디일까요?",
        options: ["모델의 temperature 값", "검색 단계가 질문에 맞는 조각을 가져왔는지", "프레임워크 버전"], answer: 1,
        explain: "생성 단계는 받은 자료로만 답하라고 했으니, 엉뚱한 조각을 받으면 답도 엉뚱해져요. RAG 디버깅은 거의 항상 검색 결과를 찍어 보는 데서 시작해요.",
      },
      scene(api) {
        const { s, say } = fx.stage(api);
        const A = api.accent;
        fx.icon(api, s, "user", 30, 34, 26, INK);
        const ask = fx.bubble(api, s, 52, 16, 200, 36, "휴가 이월 돼요?", { c: INK, fs: 12, tail: "left" });
        // 문서 조각 격자
        api.t("문서 저장소", { x: 20, y: 80, "font-size": 11, "font-weight": 800, fill: MUTED }, s);
        const tiles = [];
        for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
          const x = 20 + c * 82, y = 90 + r * 36;
          const g = api.n("g", { transform: `translate(${x}, ${y})` }, s);
          const bg = api.n("rect", { x: 0, y: 0, width: 74, height: 28, rx: 6, fill: "#fff", stroke: LINE, "stroke-width": 1.2 }, g);
          api.n("rect", { x: 8, y: 9, width: 44, height: 4, rx: 2, fill: LINE }, g);
          api.n("rect", { x: 8, y: 16, width: 30, height: 4, rx: 2, fill: LINE }, g);
          tiles.push({ g, bg, x, y });
        }
        const hit = [5, 2]; // 맞는 조각 둘
        const scores = hit.map((k, i) => api.t(["0.82", "0.71"][i], { x: tiles[k].x + 66, y: tiles[k].y + 19, "text-anchor": "end", "font-size": 10, "font-weight": 900, fill: GUIDE, opacity: 0 }, s));
        const lens = fx.icon(api, s, "search", 0, 0, 28, A);
        // 프롬프트 카드
        const pr = api.n("g", { transform: "translate(20, 210)" }, s);
        api.n("rect", { x: 0, y: 0, width: 320, height: 104, rx: 10, fill: "#fff", stroke: A, "stroke-width": 1.6, "stroke-dasharray": "5 4" }, pr);
        api.t("프롬프트", { x: 12, y: 18, "font-size": 10.5, "font-weight": 800, fill: A }, pr);
        const l1 = api.t("", { x: 12, y: 40, "font-size": 11, "font-weight": 600, fill: GUIDE }, pr);
        const l2 = api.t("", { x: 12, y: 58, "font-size": 11, "font-weight": 600, fill: GUIDE }, pr);
        const l3 = api.t("", { x: 12, y: 80, "font-size": 11, "font-weight": 700, fill: INK }, pr);
        const l4 = api.t("", { x: 12, y: 96, "font-size": 10, fill: MUTED }, pr);
        const fly = hit.map(() => { const g = pill(api, s, 0, 0, "조각", GUIDE, 10, GUIDE); g.setAttribute("opacity", 0); return g; });
        // 생성
        const chip = api.n("g", { transform: "translate(20, 334)" }, s);
        api.n("circle", { cx: 20, cy: 22, r: 20, fill: "#fff", filter: "url(#fxsh)" }, chip);
        fx.icon(api, chip, "llm", 20, 22, 24, A);
        const ans = fx.bubble(api, s, 54, 334, 286, 44, "", { c: GUIDE, fs: 11.5, tail: null });
        api.loop(t => {
          t = t % 12;
          const out = 1 - seg(t, 11.3, 11.9);
          fx.rise(ask, 52, 16, seg(t, 0, 0.4) * out);
          // 1. 검색: 돋보기가 격자를 훑는다
          const sp = seg(t, 0.6, 2.6);
          const path = [[40, 104], [350, 104], [40, 140], [350, 140], [40, 176], [350, 176]];
          const [lx, ly] = fx.along(path, sp);
          lens.setAttribute("transform", `translate(${lx - 14}, ${ly - 14})`);
          lens.setAttribute("opacity", (sp > 0 && sp < 1 ? 1 : 0) * out);
          tiles.forEach((tl, k) => {
            const isHit = hit.includes(k), on = isHit ? seg(t, 2.6, 3.0) : 0;
            tl.bg.setAttribute("stroke", isHit && on > 0.5 ? GUIDE : LINE);
            tl.bg.setAttribute("stroke-width", isHit ? 1.2 + 1.4 * on : 1.2);
            tl.bg.setAttribute("fill", isHit && on > 0.5 ? "#e3f5ec" : "#fff");
            tl.g.setAttribute("opacity", (t > 2.7 && !isHit ? 0.45 : 1) * out);
          });
          scores.forEach(sc => sc.setAttribute("opacity", seg(t, 2.8, 3.1) * (1 - seg(t, 3.8, 4.1)) * out));
          // 2. 보강: 조각이 프롬프트로
          fly.forEach((g, i) => {
            const k = hit[i], m = seg(t, 3.8 + i * 0.25, 4.7 + i * 0.25);
            g.setAttribute("transform", `translate(${lerp(tiles[k].x + 37, 60, m)}, ${lerp(tiles[k].y + 14, 246 + i * 18, m)})`);
            g.setAttribute("opacity", (m > 0 && m < 1 ? 1 : 0) * out);
          });
          fx.type(l1, "자료 [leave-2] 이월은 다음 해 3월까지 최대 5일", seg(t, 4.6, 5.6));
          fx.type(l2, "자료 [leave-1] 연차는 3일 전까지 신청", seg(t, 4.9, 5.8));
          fx.type(l3, "질문: 휴가 이월 돼요?", seg(t, 5.8, 6.3));
          fx.type(l4, "자료에 있는 내용으로만 답하고 [id]를 달 것", seg(t, 6.2, 6.8));
          // 3. 생성
          chip.setAttribute("opacity", (0.4 + 0.6 * seg(t, 7.0, 7.3)) * out);
          ans.setAttribute("opacity", seg(t, 7.3, 7.6) * out);
          fx.type(ans.textEl, "3월까지 최대 5일 이월돼요 [leave-2]", seg(t, 7.5, 9.2));
          say(t, [[0.4, 3.6, "1 검색: 뜻이 가까운 조각을 찾아요"], [3.7, 6.9, "2 보강: 찾은 조각을 프롬프트에 붙여요"], [7.0, 11.6, "3 생성: 자료를 근거로 출처를 달아 답해요"]]);
        }, 10);
      },
    }
