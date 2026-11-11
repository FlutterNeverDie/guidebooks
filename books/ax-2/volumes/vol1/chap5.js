export default {
  "title": "답변 캐시의 키에 권한과 버전을 넣어요",
  "tag": "캐시 키",
  "lead": "질문 문자열만 같다고 같은 답을 돌려주면 안 돼요. 같은 질문도 사용자에게 보이는 자료와 규정 버전이 다르면 답이 달라져요.",
  "body": "<h3>답을 결정한 입력을 키로 만들어요</h3><p>정규화한 질문, 테넌트, ACL 개정 번호, 색인 버전, 모델, 프롬프트 버전, 근거 내용을 키에 포함해요. 실습은 정렬된 JSON을 SHA-256으로 해시해요. 해시는 입력의 식별자일 뿐 암호화나 개인정보 보호를 대신하지 않아요.</p><h3>캐시 적중 뒤에도 권한을 확인해요</h3><p>키에 ACL 버전을 넣어도 서버가 최신 값을 읽지 않으면 오래된 권한으로 적중해요. 응답 전 현재 접근 권한을 재확인하고 권한 철회 이벤트로 관련 항목을 무효화해요. 질문뿐 아니라 사용자별 개인화 조건도 분리해야 해요.</p><h3>캐시 hit 뒤에도 반환 검사를 해요</h3><p>캐시는 비싼 생성을 건너뛰는 저장소예요. 같은 질문을 cache={}와 함께 두 번 보내면 두 번째 trace에는 cache가 있고 generate가 없어요. 이 구현은 근거를 확인한 뒤 응답 캐시를 찾으므로 검색 비용까지 없애지는 않아요. 저장과 반환 때는 인용 목록까지 깊게 복사해요. 반환된 citations를 호출자가 수정해도 저장된 캐시는 바뀌지 않아야 해요.</p><p>그런데 hit 직후 권한 revision이 바뀌면 저장된 답을 그대로 내보내면 안 돼요. before_return 훅으로 그 순간을 재현해요. 결과는 permission_changed이고 response는 None이에요. 실서비스에서는 최신 권한 조회와 반환 경계를 일관되게 설계해야 하며, 이 메모리 객체는 분산 권한 시스템을 대신하지 않아요.</p><h3>핵심 코드 · 실행 파일에서 발췌·축약</h3><pre style=\"white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.7;font-size:12px;padding:12px;border:1px solid var(--line);border-radius:8px;background:var(--soft)\"><code style=\"background:none;border:0;padding:0;white-space:inherit\">cache = {}\nrun_request(&quot;연차 신청&quot;, cache=cache)\nhit = run_request(&quot;연차 신청&quot;, cache=cache)\nrevoked = run_request(&quot;연차 신청&quot;, cache=cache,\n    before_return=lambda p: setattr(p, &quot;revision&quot;, 2))</code></pre><h3>작은 입력으로 실행한 계약 결과</h3><table class=\"vs\"><tr><th>확인 항목</th><th>결과</th></tr><tr><td>동일 요청 캐시 일치</td><td>예</td></tr><tr><td>권한 변경 캐시 일치</td><td>아니요</td></tr><tr><td>색인 변경 캐시 일치</td><td>아니요</td></tr><tr><td>첫 응답</td><td>answer</td></tr><tr><td>두 번째 hit</td><td>예</td></tr></table><div class=\"try\"><span class=\"lbl\">직접 해 보기 · E</span><p><code>rag-study/course/m1_generation.py</code>에서 작은 입력의 원리를 확인해요. 실행 위치는 <code>labs/rag-study</code>예요.</p><p>캐시의 citations를 없는 ID로 바꾸고 다시 요청해요. invalid_cached_response가 나오는지 테스트와 함께 확인해요.</p></div>",
  "lab": "캐시는 빠른 데이터베이스이므로 접근 제어와 만료도 데이터베이스처럼 설계해요.",
  "quiz": {
    "q": "캐시를 찾은 직후 권한이 철회됐어요. 키에 예전 ACL이 포함됐으니 반환해도 되나요?",
    "options": [
      "최신 권한 검사에서 거절해요",
      "캐시 hit이면 항상 반환해요",
      "모델에게 반환 여부를 물어요"
    ],
    "answer": 0,
    "explain": "키 분리와 반환 시점 검사는 서로 다른 경계를 지켜요."
  },
  scene(api) { COURSE.scene(api, {
  "label": "1.5 · AX 중급편",
  "nodes": [
    "질문 + 테넌트",
    "ACL + 색인",
    "모델 + 프롬프트",
    "캐시 키"
  ],
  "mode": "flow"
}); }
};
