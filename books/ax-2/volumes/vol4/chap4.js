export default {
  "title": "pgvector로 옮길 때 계약을 보존해요",
  "tag": "정확 검색과 비교",
  "lead": "벡터 DB를 도입하는 이유는 벡터 함수 하나보다 문서·버전·권한·갱신을 함께 운영하려는 데 있어요. 기존 계약을 SQL로 옮겨요.",
  "body": "<h3>SQL을 실행하고 실제 계획을 읽어요</h3><p>pgvector_lab.sql을 별도의 PostgreSQL 17 컨테이너에서 실행했어요. 합성 3차원 벡터 네 개 중 alpha v2만 남기면 leave-v2와 travel-v2 두 행이 나오고 코사인 거리는 각각 0과 1이에요. 이 값은 의미 임베딩 품질이 아닌 연산자와 필터 계약 확인용이에요.</p><p>HNSW 색인을 만들었지만 실제 계획은 Seq Scan → Sort → Limit였어요. 네 행에서는 순차 스캔이 더 싸다고 플래너가 판단할 수 있어요. 색인이 존재한다는 사실과 쿼리가 그 색인을 사용했다는 사실은 달라요. reports/pgvector.txt에 EXPLAIN (ANALYZE, BUFFERS) 원문을 보존했어요.</p><p>정확 검색 결과를 기준선으로 남긴 뒤 데이터 규모·필터 선택도·탐색 예산을 바꿔 결과 수와 recall을 비교해야 해요. 이번 결과를 HNSW 속도 검증이라고 부르지 않아요. WHERE의 tenant 상수는 데모 값이며 실제 서비스에서는 인증한 서버 주체에서 바인딩해요. DB 계정이 임의로 조건을 빼도 안전한지는 별도 RLS 설계와 역할 검사가 필요해요.</p><p>실습은 BEGIN 안에서 임시 테이블을 만들고 ROLLBACK으로 끝나요. 서버가 없으면 README의 격리 컨테이너 절차를 사용해요. 기존 업무 DB에 연결할 필요가 없어요.</p><h3>핵심 코드 · 실행 파일에서 발췌·축약</h3><pre style=\"white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.7;font-size:12px;padding:12px;border:1px solid var(--line);border-radius:8px;background:var(--soft)\"><code style=\"background:none;border:0;padding:0;white-space:inherit\">SELECT id, embedding &lt;=&gt; &#x27;[1,0,0]&#x27;::vector AS distance\nFROM ax_course_chunks\nWHERE tenant = &#x27;alpha&#x27; AND version = 2\nORDER BY embedding &lt;=&gt; &#x27;[1,0,0]&#x27;::vector\nLIMIT 2;\n-- EXPLAIN 결과: Seq Scan -&gt; Sort -&gt; Limit</code></pre><h3>PostgreSQL 17 실행 · 합성 벡터 4개</h3><table class=\"vs\"><tr><th>확인 항목</th><th>결과</th></tr><tr><td>alpha v2 결과</td><td>leave-v2, travel-v2</td></tr><tr><td>코사인 거리</td><td>0, 1</td></tr><tr><td>실제 접근</td><td>Seq Scan + Sort</td></tr></table><div class=\"try\"><span class=\"lbl\">직접 해 보기 · D</span><p><code>rag-study/course/m4_operations.py</code>에서 작은 입력의 원리를 확인해요. 실행 위치는 <code>labs/rag-study</code>예요.</p><p>course/pgvector_lab.sql을 격리 DB에서 실행해요. 실행 계획의 Rows Removed by Filter와 반환 행 수를 함께 읽고, HNSW 사용 여부를 연산자 이름으로 판단해요.</p></div><p class=\"small\">더 읽기: <a href=\"https://github.com/pgvector/pgvector\" target=\"_blank\" rel=\"noopener\">pgvector 공식 문서</a></p>",
  "lab": "저장소 구현을 교체해도 요청 DTO와 권한·버전 조건은 같게 유지해요.",
  "quiz": {
    "q": "HNSW 색인을 만든 뒤 EXPLAIN에 Seq Scan이 나왔어요. 어떤 결론이 맞나요?",
    "options": [
      "색인 생성이 실패했다는 뜻이에요",
      "HNSW가 순차 스캔이라는 뜻이에요",
      "이 실행은 HNSW 탐색을 검증하지 않았어요"
    ],
    "answer": 2,
    "explain": "플래너는 비용에 따라 접근 방법을 선택해요. 실제 계획을 확인해야 해요."
  },
  scene(api) { COURSE.scene(api, {
  "label": "4.4 · AX 중급편",
  "nodes": [
    "조각 + 메타데이터",
    "SQL 필터",
    "거리 정렬",
    "정확 검색과 비교"
  ],
  "mode": "flow"
}); }
};
