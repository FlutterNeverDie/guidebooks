export default {
  "title": "Text-to-Cypher는 실행 경계를 좁혀요",
  "tag": "읽기 제한 실행",
  "lead": "자연어를 질의로 바꾸는 기능이 DB 전체 권한을 가져야 하는 것은 아니에요. 허용된 질문 유형을 명시적인 질의 계획으로 변환할 수 있어요.",
  "body": "<h3>의도와 값만 모델이 제안하게 해요</h3><p>실습은 intent와 asset 두 필드를 받아, 등록된 intent를 고정 Cypher로 바꿔요. 자산 ID는 <code>$asset</code> 매개변수로 전달해요. 자유로운 Cypher 원문을 실행하는 것보다 표현 범위는 좁지만 검증할 경계가 작아요. 허용 목록에 없는 intent는 거절해요.</p><h3>매개변수화만으로 충분하지 않아요</h3><p>매개변수는 값을 문자열 이어 붙이기와 분리해요. 읽기 전용 DB 역할, 테넌트 필터, 경로 깊이·결과 수·실행 시간 제한은 따로 필요해요. 실습은 질의 문자열과 매개변수만 만들며 Neo4j를 실행하지 않아요. 자유 질의를 지원한다면 파서와 허용 연산 검사를 두고 정규식 한 개로 보안을 보장하지 않아요.</p><h3>질의 계획과 실행 권한은 분리해요</h3><p>계획은 {intent:asset_division, asset:asset-031}처럼 제한된 구조예요. compile_plan은 intent를 확인하고 고정 MATCH 템플릿과 $asset 매개변수로 바꿔요. 입력 ID에 따옴표나 DELETE 문구가 있어도 질의 원문에 이어 붙이지 않아요.</p><p>실습은 템플릿 생성과 Python 관계 조회를 실행했으며 Neo4j 서버 실행은 하지 않았어요. 실제 Neo4j로 옮기면 읽기 전용 역할, tenant 조건, 시간 제한, 결과 수 제한, 비용 검토가 추가로 필요해요. LIMIT은 반환 행 제한이지 앞선 탐색 비용 상한을 자동 보장하지 않아요.</p><h3>핵심 코드 · 실행 파일에서 발췌·축약</h3><pre style=\"white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.7;font-size:12px;padding:12px;border:1px solid var(--line);border-radius:8px;background:var(--soft)\"><code style=\"background:none;border:0;padding:0;white-space:inherit\">plan = {&quot;intent&quot;: &quot;asset_division&quot;, &quot;asset&quot;: &quot;asset-031&quot;}\nquery, params = compile_plan(plan)\n# query: MATCH ... {id: $asset} ... LIMIT 20\n# params: {&quot;asset&quot;: &quot;asset-031&quot;}\n# Python 근거 조회: paths(params[&quot;asset&quot;])</code></pre><h3>작은 입력으로 실행한 계약 결과</h3><table class=\"vs\"><tr><th>확인 항목</th><th>결과</th></tr><tr><td>미등록 intent 거절</td><td>예</td></tr><tr><td>Neo4j 실행</td><td>아니요</td></tr></table><div class=\"try\"><span class=\"lbl\">직접 해 보기 · B</span><p><code>rag-study/course/a3_graph.py</code>에서 작은 입력의 원리를 확인해요. 실행 위치는 <code>labs/rag-study</code>예요.</p><p>asset 값에 따옴표가 든 문자열을 넣고 query와 params를 따로 출력해요. intent를 delete_all로 바꾸면 계획 단계에서 거절되는지 확인해요.</p></div>",
  "lab": "모델에게 SQL 콘솔을 주기보다 먼저 제한된 저장소 메서드를 제공해요.",
  "quiz": {
    "q": "$asset으로 바인딩하고 LIMIT 20도 있어요. 이것만으로 보장되지 않는 것은?",
    "options": [
      "입력 값을 질의 문자열과 분리하기",
      "허용 intent만 템플릿으로 변환하기",
      "테넌트 권한과 탐색 비용 상한"
    ],
    "answer": 2,
    "explain": "매개변수화는 문자열 경계를 지켜요. 권한과 자원 예산은 별도 설계예요."
  },
  scene(api) { COURSE.scene(api, {
  "label": "3.2 · AX 심화편",
  "nodes": [
    "질문",
    "intent + 값",
    "허용 템플릿",
    "읽기 제한 실행"
  ],
  "mode": "flow"
}); }
};
