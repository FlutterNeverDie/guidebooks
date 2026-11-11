export default {
  "title": "도구 권한은 사용자와 서비스의 교집합이에요",
  "tag": "실효 권한",
  "lead": "서비스 계정이 할 수 있는 일을 모든 사용자가 요청할 수 있어서는 안 돼요. 에이전트가 권한을 대신 행사하는 경로를 좁혀야 해요.",
  "body": "<h3>행동마다 주체를 보존해요</h3><p>도구 호출에는 인증 주체, 테넌트, 요청 ID, 허용 작업 범위를 서버가 결합해요. 모델이 제안한 actor나 tenant를 그대로 믿지 않아요. 사용자 권한과 서비스 도구 권한, 해당 자원에 대한 정책을 모두 통과해야 실행해요.</p><h3>도구 이름만 허용해도 부족해요</h3><p>search 권한이 있다고 모든 문서를 검색할 수 있는 것은 아니에요. 인자의 자원 범위, 반환 필드, 외부 목적지까지 제한해야 해요. 실습은 도구 이름 교집합에 문서별 Policy 검사를 더해요. 실제 구현은 호출 시점의 자원 권한과 데이터 계층 필터까지 이어져야 해요.</p><h3>search 허용과 문서 허용은 달라요</h3><p>사용자와 서비스 모두 search를 허용해도 모든 문서를 볼 수 있는 것은 아니에요. B는 도구 교집합을 구한 뒤 Policy(denied={h2-2})로 특정 연차 조각을 거절하는 사례를 추가했어요.</p><p>서버에서 얻은 tenant와 개별 문서 허용 범위를 함께 적용해요. 모델이 tenant=beta라고 출력한다고 다른 조직으로 바꾸지 않아요. 실제 서비스에서는 사용자 그룹·문서 ACL·역할을 같은 요청 시점에 일관되게 해석해야 해요. 이 실습은 그 경계를 작은 객체로 표현해요.</p><h3>핵심 코드 · 실행 파일에서 발췌·축약</h3><pre style=\"white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.7;font-size:12px;padding:12px;border:1px solid var(--line);border-radius:8px;background:var(--soft)\"><code style=\"background:none;border:0;padding:0;white-space:inherit\">tool_ok = proposed in user_tools &amp; service_tools\nresource_ok = policy.permits(document)\nallowed = tool_ok and resource_ok\n# 도구와 자료 범위를 모두 통과해야 읽어요.</code></pre><h3>작은 입력으로 실행한 계약 결과</h3><table class=\"vs\"><tr><th>확인 항목</th><th>결과</th></tr><tr><td>사용자·서비스 권한 교집합</td><td>[&quot;search&quot;]</td></tr><tr><td>대리 전송 허용</td><td>아니요</td></tr><tr><td>search 허용 뒤 특정 문서 거절</td><td>예</td></tr></table><div class=\"try\"><span class=\"lbl\">직접 해 보기 · B</span><p><code>rag-study/course/a4_security.py</code>에서 작은 입력의 원리를 확인해요. 실행 위치는 <code>labs/rag-study</code>예요.</p><p>B에서 도구는 search를 유지하고 거절할 문서 ID만 바꿔요. 도구 허용 여부와 자료 허용 여부를 두 열로 출력해요.</p></div>",
  "lab": "대리 실행은 권한 위임이지 권한 증폭이 아니에요.",
  "quiz": {
    "q": "사용자에게 search 도구는 열려 있지만 h2-2는 금지됐어요. 결과는?",
    "options": [
      "해당 문서는 검색·생성 근거에서 빼요",
      "search가 열렸으니 읽어요",
      "사용자가 문서 ID를 알면 읽어요"
    ],
    "answer": 0,
    "explain": "도구 권한과 자원 범위는 함께 만족해야 해요."
  },
  scene(api) { COURSE.scene(api, {
  "label": "4.2 · AX 심화편",
  "nodes": [
    "사용자 권한",
    "서비스 권한",
    "자원 정책",
    "실효 권한"
  ],
  "mode": "compare"
}); }
};
