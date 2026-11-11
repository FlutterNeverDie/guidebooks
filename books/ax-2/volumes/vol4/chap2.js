export default {
  "title": "새 색인은 옆에서 만들고 전환해요",
  "tag": "v1 요청 마무리",
  "lead": "서비스가 읽는 색인을 제자리에서 교체하면 요청 중간에 모델과 문서 버전이 섞일 수 있어요. 준비와 활성화를 분리해요.",
  "body": "<h3>요청이 읽을 버전을 고정해요</h3><p>새 색인을 별도로 만들고 문서 수, 필터, 대표 질의를 검사해요. 통과하면 활성 버전 포인터를 바꿔요. 각 요청은 시작 시 버전을 잡고 검색·부모 복원·생성까지 같은 버전을 사용해야 해요. 전환 전에 시작한 요청은 이전 버전으로 끝낼 수 있어요.</p><h3>롤백에도 수명이 있어요</h3><p>이전 버전을 보관하면 문제 시 포인터를 되돌릴 수 있어요. 진행 중 요청이 끝나기 전에 이전 데이터를 지우지 않아요. 다만 권한 철회나 법적 삭제처럼 되살리면 안 되는 데이터는 롤백 대상에서 제외해야 해요. 실습의 두 사전은 버전 일관성을 보여 주는 모형이며 분산 트랜잭션 구현은 아니에요.</p><h3>요청 시작 때 버전을 붙잡아요</h3><p>시간순으로 A 시작(v1), 활성 포인터 v2 전환, B 시작(v2), A의 부모 조회를 놓아 보세요. A가 마지막 단계에서 활성 포인터를 다시 읽으면 v1의 자식과 v2의 부모를 섞어요. request_snapshot을 처음부터 끝까지 넘겨야 해요.</p><p>심화 실험 index_migration.py는 실제 인코더와 문서 행렬도 버전별로 묶어요. 23×384 행렬 두 개를 만든 뒤 A는 v1, B는 v2로 조회하고 롤백 뒤 새 요청이 v1 순위를 되찾는지 기록했어요. 이 로컬 포인터 전환은 분산 배포의 원자성까지 시험한 것은 아니에요.</p><h3>핵심 코드 · 실행 파일에서 발췌·축약</h3><pre style=\"white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.7;font-size:12px;padding:12px;border:1px solid var(--line);border-radius:8px;background:var(--soft)\"><code style=\"background:none;border:0;padding:0;white-space:inherit\">request_a = active  # v1\nactive = &quot;v2&quot;\nrequest_b = active  # v2\nlookup(request_a)   # v1 인코더 + v1 문서 행렬\nlookup(request_b)   # v2 인코더 + v2 문서 행렬\nactive = &quot;v1&quot;      # 롤백</code></pre><h3>작은 입력으로 실행한 계약 결과</h3><table class=\"vs\"><tr><th>확인 항목</th><th>결과</th></tr><tr><td>진행 중 요청</td><td>7일</td></tr><tr><td>새 요청</td><td>3일</td></tr><tr><td>롤백 후</td><td>7일</td></tr></table><div class=\"try\"><span class=\"lbl\">직접 해 보기 · B</span><p><code>rag-study/course/m4_operations.py</code>에서 작은 입력의 원리를 확인해요. 실행 위치는 <code>labs/rag-study</code>예요.</p><p>m4_operations.py B에서 request_snapshot 대신 active를 읽게 바꿔요. 진행 중 요청의 결과가 왜 달라지는지 타임라인으로 표시해요.</p></div>",
  "lab": "배포의 blue-green 전환처럼, 데이터도 준비 완료와 활성 시점을 나눠요.",
  "quiz": {
    "q": "A가 v1 검색 뒤 부모를 읽기 전에 v2로 전환됐어요. A의 부모 조회 버전은?",
    "options": [
      "A가 시작할 때 잡은 v1",
      "항상 최신 v2",
      "모델이 고른 버전"
    ],
    "answer": 0,
    "explain": "요청 전체가 같은 데이터 계약을 보도록 시작 시점의 버전을 유지해요."
  },
  scene(api) { COURSE.detail(api, {"kind": "timeline", "title": "진행 중 요청의 버전"}); }
};
