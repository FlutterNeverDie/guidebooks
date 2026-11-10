export default {
      title: "구축 절차",
      tag: "풀 질문부터 정하고, 뽑고, 막고, 사람이 봐요",
      lead: "온톨로지는 세상 전체를 모델링하려 들면 끝나지 않아요. 풀고 싶은 질문 목록에서 시작해 거기 필요한 종류와 관계만 정해요. 사실은 정형 데이터에서 먼저 가져오고, 문서에서는 LLM으로 뽑되 제약 검사와 사람 검토를 거쳐요.",
      body: `
<ol class="steps">
  <li><b>풀 질문 정하기</b><small>"누가 승인하나", "이 장비 담당은 누구인가"처럼 그래프가 답해야 할 질문 목록. 온톨로지 설계에서는 역량 질문이라고 불러요.</small></li>
  <li><b>용어 모으기</b><small>질문과 문서에 나오는 명사. 같은 것의 다른 이름(IT팀, 정보기술팀)을 하나로 정해요.</small></li>
  <li><b>클래스와 관계 정하기</b><small>질문에 필요한 것만. 관계마다 방향과 '무엇에서 무엇으로' 제약을 적어요.</small></li>
  <li><b>사실 채우기: 정형 데이터 먼저</b><small>인사 DB의 소속, 조직도처럼 이미 표로 있는 건 변환만 하면 돼요. 가장 정확해요.</small></li>
  <li><b>사실 채우기: 문서는 LLM으로</b><small>스키마를 주고 트리플을 뽑게 해요. 출처 문장을 같이 남겨요.</small></li>
  <li><b>검증</b><small>제약 검사(코드), 같은 대상의 다른 표기 합치기, 사람 표본 검토.</small></li>
  <li><b>유지</b><small>원천이 바뀌면 다시 뽑아요. 색인과 마찬가지로 그래프도 캐시예요.</small></li>
</ol>

<h3>LLM 추출은 도구 스키마로 묶어요</h3>
<pre class="code"><code>{"name": "add_fact", "strict": true,
 "input_schema": {"type": "object", "properties": {
   "subject":  {"type": "string"},
   "relation": {"enum": ["소속", "속함", "팀장", "본부장", "사용", "알림", "승인역할"]},
   "object":   {"type": "string"},
   "source":   {"type": "string"}},
  "required": ["subject", "relation", "object", "source"]}}</code></pre>
<p>관계를 <code>enum</code>으로 묶으면 모델이 없는 관계를 지어내지 못해요. 그래도 주어와 목적어의 종류가 맞는지는 따로 검사해요. 실습에서는 '노트북-031은 영업팀 소속이다'가 장비→팀이라 막혔어요.</p>

<div class="try"><span class="lbl">직접 해 보기</span>
<p><code>rag-study/step7_ontology.py</code>: B 부분이 추출과 제약 검사예요. 문장 모양이 정해진 실습 데이터라 정규식으로 뽑았어요. <code>data/org.md</code>에 잘못된 문장을 더해 막히는지 봐요.</p>
<p><code>rag-study/step1_tool_use.py</code>: <code>strict</code> 도구를 쓰는 예예요. 이 방식으로 추출기를 바꿀 수 있어요(API 키 필요).</p></div>`,
      lab: "<b>ETL과 데이터 품질 검사</b> 그대로예요. 원천 시스템(HR DB)에서 먼저 가져오고, 비정형 원천(문서)은 파서(LLM)로 뽑고, 적재 전에 스키마 검증과 중복 제거(엔티티 정리)를 하고, 일부는 사람이 샘플링해 봐요. 그래프를 만드는 일의 대부분은 그래프 DB가 아니라 이 파이프라인이에요.",
      quiz: {
        q: "온톨로지 설계를 시작할 때 가장 먼저 할 일은?",
        options: ["회사의 모든 개념을 빠짐없이 클래스로 만든다", "그래프가 답해야 할 질문 목록을 정한다", "그래프 DB 제품부터 고른다"], answer: 1,
        explain: "질문 목록이 범위를 정해 줘요. 그 질문에 필요한 종류와 관계만 정하면 작게 시작해서 늘려 갈 수 있어요.",
      },
      scene(api) {
        const { s, say } = fx.stage(api);
        const A = api.accent;
        // 단계 띠
        const ST = [["질문", "spark"], ["용어", "doc"], ["스키마", "table"], ["추출", "llm"], ["검증", "check"]];
        const chips = ST.map(([n, ic], i) => {
          const g = api.n("g", {}, s);
          const x = 20 + i * 66;
          const bg = api.n("rect", { x, y: 14, width: 58, height: 52, rx: 10, fill: "#fff", filter: "url(#fxsh)" }, g);
          fx.icon(api, g, ic, x + 29, 32, 18, INK);
          api.t(n, { x: x + 29, y: 58, "text-anchor": "middle", "font-size": 10.5, "font-weight": 800, fill: INK }, g);
          return { g, bg };
        });
        // 문장 -> 트리플
        const SN = [["김하나는 IT팀 소속이다.", ["김하나", "소속", "IT팀"], 1], ["영업팀은 사업본부에 속한다.", ["영업팀", "속함", "사업본부"], 1], ["노트북-031은 영업팀 소속이다.", ["노트북-031", "소속", "영업팀"], 0]];
        api.t("문서 문장", { x: 20, y: 92, "font-size": 11, "font-weight": 900, fill: MUTED }, s);
        const sent = SN.map(([t], i) => {
          const g = api.n("g", { opacity: 0 }, s);
          api.n("rect", { x: 20, y: 100 + i * 32, width: 196, height: 26, rx: 6, fill: PAPER }, g);
          api.t(t, { x: 28, y: 117 + i * 32, "font-size": 10.5, "font-weight": 700, fill: INK }, g);
          return g;
        });
        const llm = api.n("g", { opacity: 0 }, s);
        api.n("circle", { cx: 278, cy: 148, r: 34, fill: "#fff", filter: "url(#fxsh)" }, llm);
        fx.icon(api, llm, "llm", 278, 142, 30, A);
        api.t("LLM 추출", { x: 278, y: 172, "text-anchor": "middle", "font-size": 9.5, "font-weight": 800, fill: A }, llm);
        const pulse = api.n("circle", { cx: 278, cy: 148, r: 34, fill: "none", stroke: A, "stroke-width": 2, opacity: 0 }, s);
        // 트리플 카드
        api.t("뽑은 사실", { x: 20, y: 222, "font-size": 11, "font-weight": 900, fill: MUTED }, s);
        const tri = SN.map(([, [a, r, b], ok], i) => {
          const g = api.n("g", { opacity: 0 }, s);
          const y = 230 + i * 40;
          const bg = api.n("rect", { x: 20, y, width: 320, height: 32, rx: 8, fill: "#fff", filter: "url(#fxsh)" }, g);
          [[a, 70], [r, 165], [b, 255]].forEach(([w, x], k) => {
            api.n("rect", { x: x - 42, y: y + 6, width: 84, height: 20, rx: 10, fill: k === 1 ? INK : PAPER }, g);
            api.t(w, { x, y: y + 20, "text-anchor": "middle", "font-size": 10.5, "font-weight": 800, fill: k === 1 ? "#fff" : INK }, g);
          });
          const mark = api.n("g", { opacity: 0 }, g);
          api.n("circle", { cx: 318, cy: y + 16, r: 10, fill: ok ? GUIDE : BAD }, mark);
          fx.icon(api, mark, ok ? "check" : "x", 318, y + 16, 13, "#fff");
          return { g, bg, mark, ok };
        });
        const why = api.t("제약: 소속은 사람 → 팀. 장비 → 팀이라 막음", { x: 20, y: 364, "font-size": 11, "font-weight": 800, fill: BAD, opacity: 0 }, s);
        const human = fx.card(api, s, 20, 376, 320, 36, { title: "사람 검토: 막힌 것과 표본 몇 개를 확인", c: HOOK, icon: "user", fs: 11 });
        api.loop(t => {
          t = t % 13;
          const step = t < 1.2 ? 0 : t < 2.2 ? 1 : t < 3.2 ? 2 : t < 8.4 ? 3 : 4;
          chips.forEach(({ bg }, i) => { bg.setAttribute("fill", i === step ? "#e9effc" : "#fff"); bg.setAttribute("stroke", i === step ? A : "none"); });
          sent.forEach((g, i) => g.setAttribute("opacity", seg(t, 3.3 + i * 0.3, 3.6 + i * 0.3)));
          llm.setAttribute("opacity", seg(t, 4.2, 4.5));
          pulse.setAttribute("r", 34 + 10 * ((t * 1.2) % 1));
          pulse.setAttribute("opacity", t > 4.5 && t < 6.5 ? 0.6 * (1 - ((t * 1.2) % 1)) : 0);
          tri.forEach(({ g, bg, mark, ok }, i) => {
            g.setAttribute("opacity", seg(t, 5.2 + i * 0.5, 5.5 + i * 0.5));
            mark.setAttribute("opacity", seg(t, 8.6 + i * 0.4, 8.8 + i * 0.4));
            bg.setAttribute("fill", !ok && t > 9.4 ? "#fbe9e9" : "#fff");
          });
          why.setAttribute("opacity", seg(t, 9.6, 9.9));
          human.setAttribute("opacity", seg(t, 10.4, 10.8));
          say(t, [[0.1, 3.2, "풀 질문에서 시작해 필요한 것만 정해요"], [3.3, 8.4, "문서는 LLM이 스키마에 맞춰 사실을 뽑아요"], [8.5, 12.8, "제약에 안 맞으면 막고, 사람이 확인해요"]]);
        }, 11);
      },
    }
