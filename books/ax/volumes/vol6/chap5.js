export default {
      title: "다음 걸음: AX 학습 로드맵",
      tag: "개념은 실습 숫자로, 실습은 내 시스템으로",
      lead: "이 책에서 RAG, 청크, 임베딩, 벡터 DB, 평가, 온톨로지, 오케스트레이션을 큰 그림으로 봤어요. 다음은 같은 걸 내 시스템에서 숫자로 재 보는 거예요. 작은 것부터, 측정하고, 하나씩 붙여요.",
      body: `
<ol class="steps">
  <li><b>실습을 내 손으로 다시</b><small><code>rag-study</code>의 step2~7을 돌리고 숫자를 바꿔 봐요. API 키가 생기면 step1로 에이전트 루프를 직접 돌려요.</small></li>
  <li><b>ask 정답 세트 늘리기</b><small><code>evals/ask-cases.json</code>에 바꿔 말한 질문과 답 없는 질문을 더해 지금 수준을 재요. 실제 사용량을 쓰므로 돌리기 전에 확인을 받아요.</small></li>
  <li><b>검색 실험은 따로</b><small>안내 문서를 로컬로 받아 BM25, 벡터, 하이브리드, 재정렬을 같은 정답 세트로 비교해요(step5, step6 방식). 허브 코드는 건드리지 않아요.</small></li>
  <li><b>LangGraph로 ask 다시 짜 보기</b><small>학습용으로 검색 노드, 생성 노드, 근거 검사 노드, 재시도 엣지를 그래프로 만들어 보면 6권 1장의 표가 손에 잡혀요.</small></li>
  <li><b>작은 온톨로지</b><small>오류 코드, CFG, 화면, 기능을 클래스로 두고 관계 서너 개만 정해 그래프를 만들어요(step7 방식). 풀 질문 목록부터요.</small></li>
  <li><b>평가를 습관으로</b><small>무엇을 바꾸든 정답 세트 숫자, 단계별 지연, 실패 사례를 같이 남겨요.</small></li>
</ol>

<h3>이 책 전체를 한 줄씩</h3>
<table class="vs">
  <tr><th>권</th><th>한 줄</th></tr>
  <tr><td>1</td><td>LLM이 모르는 것을 요청마다 찾아 넣는 게 RAG예요</td></tr>
  <tr><td>2</td><td>품질은 자르기와 임베딩에서 대부분 정해지고, 입력 한도를 넘으면 조용히 잘려요</td></tr>
  <tr><td>3</td><td>색인은 정확도를 속도와 바꾸고, 재정렬이 순서를 바로잡아요</td></tr>
  <tr><td>4</td><td>감이 아니라 정답 세트와 단계별 시간으로 재요</td></tr>
  <tr><td>5</td><td>여러 단계 관계는 그래프가 따라가요</td></tr>
  <tr><td>6</td><td>판단은 모델, 경계는 코드</td></tr>
</table>

<div class="try"><span class="lbl">직접 해 보기</span>
<p><code>rag-study/README.md</code>: 실습 파일과 이 책의 장을 짝지은 표예요. 여기서 다시 시작해요.</p></div>`,
      lab: "새 기술을 들일 때 하던 순서 그대로예요. <b>작은 PoC → 지표 정의 → 기준선 측정 → 하나만 바꾸고 다시 측정 → 운영에 붙일지 판단</b>. RAG와 그래프도 마찬가지예요. 프레임워크나 벡터 DB 제품을 고르는 건 맨 마지막이고, 정답 세트와 기준선이 먼저예요.",
      quiz: {
        q: "ask에 벡터 검색을 붙여 볼까 해요. 가장 먼저 할 일은?",
        options: ["벡터 DB 제품부터 고른다", "바꿔 말한 질문을 정답 세트에 더해 지금 수준(기준선)을 잰다", "운영 허브에 바로 붙여 본다"], answer: 1,
        explain: "기준선이 없으면 붙인 뒤 좋아졌는지 알 수 없어요. 그리고 허브는 운영 중인 Slack 흐름이라, 실험은 따로 하고 숫자로 확인한 뒤에 붙일지 정해요.",
      },
      scene(api) {
        const { s, say } = fx.stage(api);
        const A = api.accent;
        const M = [["실습 다시", "rag-study step2~7", "tool"], ["정답 세트", "ask-cases 늘리기", "table"], ["검색 실험", "BM25·벡터·재정렬", "search"], ["LangGraph", "ask를 그래프로", "graph"], ["작은 온톨로지", "오류·CFG·화면", "key"], ["평가 습관", "숫자·지연·실패", "check"]];
        const P = [[60, 380], [180, 340], [300, 300], [180, 240], [60, 180], [180, 120]];
        const road = api.n("path", { d: "M60 380 Q120 380 180 340 T300 300 Q300 260 180 240 T60 180 Q60 140 180 120", fill: "none", stroke: LINE, "stroke-width": 10, "stroke-linecap": "round" }, s);
        const prog = api.n("path", { d: "M60 380 Q120 380 180 340 T300 300 Q300 260 180 240 T60 180 Q60 140 180 120", fill: "none", stroke: A, "stroke-width": 4, "stroke-linecap": "round", "stroke-dasharray": 900, "stroke-dashoffset": 900 }, s);
        const ms = M.map(([n, sub, ic], i) => {
          const [x, y] = P[i];
          const g = api.n("g", { opacity: 0.35 }, s);
          const c = api.n("circle", { cx: x, cy: y, r: 16, fill: "#fff", stroke: A, "stroke-width": 2.4, filter: "url(#fxsh)" }, g);
          fx.icon(api, g, ic, x, y, 16, A);
          const lx = x > 240 ? x - 24 : x + 24, an = x > 240 ? "end" : "start";
          api.t(`${i + 1} ${n}`, { x: lx, y: y - 2, "text-anchor": an, "font-size": 11.5, "font-weight": 900, fill: INK }, g);
          api.t(sub, { x: lx, y: y + 13, "text-anchor": an, "font-size": 9.5, fill: MUTED }, g);
          return { g, c };
        });
        const flag = api.n("g", { opacity: 0 }, s);
        api.n("rect", { x: 106, y: 40, width: 148, height: 40, rx: 10, fill: GUIDE }, flag);
        api.t("AX 개발자", { x: 180, y: 65, "text-anchor": "middle", "font-size": 14, "font-weight": 900, fill: "#fff" }, flag);
        api.n("line", { x1: 180, y1: 80, x2: 180, y2: 104, stroke: GUIDE, "stroke-width": 2.4 }, flag);
        api.loop(t => {
          t = t % 11;
          const p = seg(t, 0.4, 8.0);
          prog.setAttribute("stroke-dashoffset", 900 * (1 - p));
          ms.forEach(({ g, c }, i) => {
            const on = p >= i / (M.length - 1) - 0.02;
            g.setAttribute("opacity", on ? 1 : 0.35);
            c.setAttribute("fill", on ? "#e9effc" : "#fff");
          });
          flag.setAttribute("opacity", seg(t, 8.2, 8.6) * (1 - seg(t, 10.5, 10.9)));
          say(t, [[0.2, 8.1, "작게 시작해서, 재고, 하나씩 붙여요"], [8.2, 10.8, "개념은 숫자로, 숫자는 내 시스템으로"]]);
        }, 9);
      },
    }
