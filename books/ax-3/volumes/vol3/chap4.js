export default {
  "title": "전체 주제 질문은 경로 검색과 달라요",
  "tag": "근거 범위 확인",
  "lead": "“이 자산은 어느 본부 소속인가?”와 “전체 문서에 반복되는 문제는 무엇인가?”는 읽어야 할 범위가 달라요. 하나의 그래프 질의로 모두 해결하려 하지 않아요.",
  "body": "<h3>경로·집계·요약 범위를 실제로 비교해요</h3><p>“이 자산의 본부는?”은 한 자산에서 두 관계를 따라가는 경로 질문이에요. “자산은 몇 개?”는 OWNED_BY 관계의 주어를 중복 제거해 세는 집계 질문이에요. “전체 조직 구조를 정리해 줘”는 어떤 범위의 관계를 모을지 먼저 정해야 하는 요약 질문이에요.</p><p>graph_query는 이 세 연산을 실제로 실행해요. path는 두 출처의 경로, count는 중복 제거한 자산 수 1, summary는 선택한 관계 사실과 출처 목록을 돌려줘요. asset-register만 선택하면 현재 관계 두 개 중 하나를 포함해 coverage=0.5, 전체를 선택하면 1.0이에요.</p><p>여기서 coverage는 현재 장난감 그래프의 관계 수 비율이에요. 세상 지식의 완전성이나 답의 진실 확률이 아니에요. 요약 출력은 사실을 나열한 결정적 모형이며 LLM의 커뮤니티 요약이나 Microsoft GraphRAG 전체 구현이라고 부르지 않아요.</p><p>넓은 질문에서 한 경로만 보고 전체라고 말하는 오류를 피하려면 선택 범위를 응답에 붙여야 해요. 데이터가 많아지면 범위별 요약과 원문 계보, 빠진 부분, 갱신 시점까지 관리해야 해요. 정확 집계가 필요한 질문을 요약문 숫자로 대신 세지 않아요.</p><h3>핵심 코드 · 실행 파일에서 발췌·축약</h3><pre style=\"white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.7;font-size:12px;padding:12px;border:1px solid var(--line);border-radius:8px;background:var(--soft)\"><code style=\"background:none;border:0;padding:0;white-space:inherit\">graph_query(&quot;path&quot;, edges)\ngraph_query(&quot;count&quot;, edges)\ngraph_query(&quot;summary&quot;, edges, {&quot;asset-register&quot;})\ngraph_query(&quot;summary&quot;, edges)\n# facts, sources, coverage를 함께 비교해요.</code></pre><h3>현재 관계 2개에 실행한 세 연산</h3><table class=\"vs\"><tr><th>확인 항목</th><th>결과</th></tr><tr><td>자산 중복 제거 집계</td><td>1</td></tr><tr><td>제한 요약 coverage</td><td>0.5</td></tr><tr><td>전체 요약 coverage</td><td>1</td></tr></table><div class=\"try\"><span class=\"lbl\">직접 해 보기 · D</span><p><code>rag-study/course/a3_graph.py</code>에서 작은 입력의 원리를 확인해요. 실행 위치는 <code>labs/rag-study</code>예요.</p><p>a3_graph.py D의 제한 요약과 전체 요약을 비교해요. --include-old로 소유 관계가 늘어도 자산 수는 1인 이유와 충돌 상태를 함께 설명해요.</p></div><p class=\"small\">더 읽기: <a href=\"https://microsoft.github.io/graphrag/\" target=\"_blank\" rel=\"noopener\">Microsoft GraphRAG 공식 문서</a></p>",
  "lab": "한 고객 조회와 전체 매출 집계가 다르듯, 질문 범위에 맞는 검색 계획을 골라요.",
  "quiz": {
    "q": "한 자산에 소유 관계가 두 개예요. 자산 개수 질문에는 무엇을 세나요?",
    "options": [
      "소유 관계 행 수를 그대로",
      "정의한 범위의 서로 다른 자산 ID",
      "요약문에 나온 숫자를 추측해서"
    ],
    "answer": 1,
    "explain": "집계 단위와 중복 제거 기준을 먼저 정해야 해요. 관계 충돌은 별도 상태로 남겨요."
  },
  scene(api) { COURSE.scene(api, {
  "label": "3.4 · AX 심화편",
  "nodes": [
    "질문 범위",
    "개체 주변",
    "전체 요약",
    "근거 범위 확인"
  ],
  "mode": "fork"
}); }
};
