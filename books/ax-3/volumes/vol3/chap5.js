export default {
  "title": "원문이 바뀌면 관계와 답도 무효화해요",
  "tag": "재계산·검사",
  "lead": "원문을 고쳐도 그래프 관계와 요약, 답변 캐시가 남아 있으면 옛 사실이 계속 돌아와요. 파생 데이터의 의존 관계를 기록해야 해요.",
  "body": "<h3>원문에서 파생물로 가는 연결</h3><p>원문 ID·버전 → 추출 관계 → 커뮤니티 요약 → 답변 근거로 의존 관계를 남겨요. 조직도가 바뀌면 영향을 받는 관계와 답을 찾을 수 있어요. 관계 하나에 출처가 여러 개면 한 출처 삭제가 관계 전체 삭제인지 재검토인지 구분해야 해요.</p><h3>재계산 범위를 검증해요</h3><p>실습은 조직도 원문에서 관계·요약·답으로 이어지는 의존성을 실제로 따라가요. 원문·관계·요약 버전을 함께 묶어 요청 중간에 섞이지 않게 하고, 변경 후 대표 경로와 권한 필터를 다시 검사해요.</p><h3>원문 변경을 여러 단계로 전파해요</h3><p>의존성은 결과가 어떤 입력에 기대는지 기록한 관계예요. org-register → edge-2 → summary-1 → answer-1로 이어져요. 원문만 지우고 answer-1을 캐시에 남겨 두면 오래된 관계가 계속 답에 나타나요.</p><p>invalidate는 바뀐 입력에서 시작해 새로 영향을 받는 노드를 더 이상 찾지 못할 때까지 확장해요. 이번에는 edge-2·summary-1·answer-1이 무효화되고 travel-policy만 참조한 answer-2는 유지돼요. 무효화는 재계산이 필요하다는 표시이며, 재계산 성공을 자동 의미하지 않아요.</p><h3>핵심 코드 · 실행 파일에서 발췌·축약</h3><pre style=\"white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.7;font-size:12px;padding:12px;border:1px solid var(--line);border-radius:8px;background:var(--soft)\"><code style=\"background:none;border:0;padding:0;white-space:inherit\">affected = set(changed)\nwhile True:\n    additions = {n for n, deps in dependencies.items()\n                 if deps &amp; affected} - affected\n    if not additions:\n        break\n    affected.update(additions)</code></pre><h3>작은 입력으로 실행한 계약 결과</h3><table class=\"vs\"><tr><th>확인 항목</th><th>결과</th></tr><tr><td>조직도 변경으로 무효화</td><td>[&quot;answer-1&quot;, &quot;edge-2&quot;, &quot;summary-1&quot;]</td></tr><tr><td>영향 없는 답</td><td>answer-2</td></tr></table><div class=\"try\"><span class=\"lbl\">직접 해 보기 · E</span><p><code>rag-study/course/a3_graph.py</code>에서 작은 입력의 원리를 확인해요. 실행 위치는 <code>labs/rag-study</code>예요.</p><p>answer-3이 answer-1에 의존하도록 한 단계를 추가해요. 직접 원문을 인용하지 않아도 무효화되는지 확인해요.</p></div>",
  "lab": "그래프와 요약은 materialized view예요. 원본 변경을 따라가는 갱신 정책이 필요해요.",
  "quiz": {
    "q": "답이 원문 대신 그 원문의 요약을 참조해요. 원문 변경 때 답도 무효화해야 하나요?",
    "options": [
      "직접 출처가 아니므로 유지해요",
      "답 문장 길이가 같으면 유지해요",
      "간접 의존성까지 따라가 무효화해요"
    ],
    "answer": 2,
    "explain": "파생 데이터의 계보를 추적해야 간접적으로 낡은 답도 찾을 수 있어요."
  },
  scene(api) { COURSE.scene(api, {
  "label": "3.5 · AX 심화편",
  "nodes": [
    "원문 변경",
    "관계 의존성",
    "요약·캐시 무효화",
    "재계산·검사"
  ],
  "mode": "flow"
}); }
};
