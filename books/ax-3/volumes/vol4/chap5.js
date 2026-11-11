export default {
  "title": "감사 로그는 필요한 사실만 남겨요",
  "tag": "접근·보관 정책",
  "lead": "장애를 추적하려고 모든 입력을 저장하면 로그가 민감 정보의 새 저장소가 돼요. 관측성과 최소 수집을 함께 설계해요.",
  "body": "<h3>허용 필드를 정해 기록해요</h3><p>request_id, 도구 이름, 테넌트의 비민감 식별자, 정책 결과, 근거 ID·버전, 결과 수, 지연 같은 구조화 필드를 우선해요. 질문 원문·인증 토큰·전체 문서를 기본 로그에 넣지 않아요. 실습은 필요한 필드만 고르는 allowlist 방식이에요.</p><h3>재현용 원문은 분리 관리해요</h3><p>원문이 꼭 필요한 진단은 별도 접근 제어·보관 기간·삭제 절차를 둬요. 해시만 남겨도 짧고 추측 가능한 값은 대조될 수 있으므로 익명화라고 단정하지 않아요. 로그 열람 권한과 내보내기 경로도 점검해요. 보안 로그 자체가 새로운 권한 우회 경로가 되면 안 돼요.</p><h3>원문 대신 판단에 필요한 필드를 남겨요</h3><p>요청에는 query와 예시 토큰이 있지만 감사 레코드는 request_id·tenant·tool·result_count·authorized만 남겨요. 허용 목록 방식은 새 필드가 요청에 추가돼도 자동으로 로그에 퍼지지 않게 해요.</p><p>실제 모델 응답과 원문을 디버깅용으로 저장하는 파일은 일반 운영 로그와 목적이 달라요. 이 저장소 보고서는 가상 규정만 담고 있어요. 실제 사내 자료로 바꾸면 보존 기간·열람 주체·마스킹 기준을 정한 별도 저장 경계가 필요해요. 실패 메시지에도 입력 전체를 그대로 붙이지 않아요.</p><h3>핵심 코드 · 실행 파일에서 발췌·축약</h3><pre style=\"white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.7;font-size:12px;padding:12px;border:1px solid var(--line);border-radius:8px;background:var(--soft)\"><code style=\"background:none;border:0;padding:0;white-space:inherit\">log = {k: request[k] for k in (&quot;request_id&quot;, &quot;tenant&quot;)}\nlog.update(tool=&quot;search&quot;, result_count=len(docs), authorized=True)\n# query, token, 모델 원문은 자동 복사하지 않아요.</code></pre><h3>작은 입력으로 실행한 계약 결과</h3><table class=\"vs\"><tr><th>확인 항목</th><th>결과</th></tr><tr><td>기록 필드</td><td>[&quot;authorized&quot;, &quot;request_id&quot;, &quot;result_count&quot;, &quot;tenant&quot;, &quot;tool&quot;]</td></tr><tr><td>원문·토큰 기록</td><td>아니요</td></tr></table><div class=\"try\"><span class=\"lbl\">직접 해 보기 · E</span><p><code>rag-study/course/a4_security.py</code>에서 작은 입력의 원리를 확인해요. 실행 위치는 <code>labs/rag-study</code>예요.</p><p>요청에 새 private_note 필드를 넣고 기록 필드가 그대로인지 확인해요. 어떤 사건을 추적하려는지 먼저 정하고 로그 필드를 늘려요.</p></div>",
  "lab": "민감 필드를 나중에 지우는 방식보다 처음부터 필요한 필드만 수집하는 쪽이 단순해요.",
  "quiz": {
    "q": "새로운 요청 필드에 민감한 메모가 들어왔어요. 허용 목록 로그의 기본 동작은?",
    "options": [
      "목록에 없으면 기록하지 않아요",
      "요청 전체를 자동 저장해요",
      "오류일 때만 무조건 전체 저장해요"
    ],
    "answer": 0,
    "explain": "필요한 필드만 고르면 새 입력이 의도치 않게 로그로 확산되는 것을 줄일 수 있어요."
  },
  scene(api) { COURSE.scene(api, {
  "label": "4.5 · AX 심화편",
  "nodes": [
    "요청 데이터",
    "허용 필드 선택",
    "구조화 감사 로그",
    "접근·보관 정책"
  ],
  "mode": "flow"
}); }
};
