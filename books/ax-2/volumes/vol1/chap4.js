export default {
  "title": "스트리밍에는 완료와 실패가 필요해요",
  "tag": "실패는 error",
  "lead": "글자가 먼저 보인다고 답변이 성공한 것은 아니에요. 연결이 끊긴 부분 답변을 완성된 답으로 저장하지 않도록 이벤트 계약을 설계해요.",
  "body": "<h3>텍스트와 완료 신호를 분리해요</h3><p>예제 이벤트는 <code>start → delta → done</code>이에요. 중간에 실패하면 <code>error</code>로 끝나며 done을 보내지 않아요. 실습은 이벤트 생성기와 소비자를 연결하지만 HTTP 서버나 실제 모델 스트림은 아니에요. 실제 전송에서는 요청 ID와 이벤트 순번을 더해 중복·재접속을 처리해요.</p><h3>검증 전 텍스트는 임시 상태예요</h3><p>먼저 도착한 문자열을 최종 답이나 캐시에 쓰지 않아요. 완료 시 구조와 인용을 검증한 뒤 확정해요. 민감한 내용을 절대 노출하면 안 되는 업무라면 검증할 때까지 버퍼링해야 해요. 화면에서 나중에 지워도 이미 보낸 내용은 회수할 수 없어요.</p><h3>임시 텍스트와 확정 답을 분리해요</h3><p>화면에 “연차는 ”까지 나왔는데 연결이 끊어졌다고 해 볼게요. consume은 delta를 preview에 모으지만 done 전에는 committed를 만들지 않아요. error나 cancel을 받으면 임시 버퍼를 비우고 확정 값은 None으로 남겨요. 연결 종료만 발생해도 done이 없으므로 확정하지 않아요.</p><p>이 예제는 이벤트 계약을 시험하는 모형이에요. 현재 로컬 Claude 어댑터는 완성된 JSON을 한 번에 받으며 실제 SSE 전송 구현은 없어요. 네트워크 스트리밍을 붙일 때는 마지막 JSON·인용 검사 성공 뒤에만 done을 보내고, 캐시도 검증된 완성 응답만 저장해야 해요.</p><h3>핵심 코드 · 실행 파일에서 발췌·축약</h3><pre style=\"white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.7;font-size:12px;padding:12px;border:1px solid var(--line);border-radius:8px;background:var(--soft)\"><code style=\"background:none;border:0;padding:0;white-space:inherit\">if event[&quot;type&quot;] == &quot;delta&quot;:\n    buffer += event[&quot;text&quot;]\nelif event[&quot;type&quot;] == &quot;done&quot;:\n    committed = buffer\nelif event[&quot;type&quot;] in {&quot;error&quot;, &quot;cancel&quot;}:\n    buffer, committed = &quot;&quot;, None</code></pre><h3>작은 입력으로 실행한 계약 결과</h3><table class=\"vs\"><tr><th>확인 항목</th><th>결과</th></tr><tr><td>정상 이벤트</td><td>[&quot;start&quot;, &quot;delta&quot;, &quot;delta&quot;, &quot;done&quot;]</td></tr><tr><td>중단 이벤트</td><td>[&quot;start&quot;, &quot;delta&quot;, &quot;error&quot;]</td></tr><tr><td>완료 후 확정</td><td>연차는 3일 전이에요.</td></tr><tr><td>중단 후 확정</td><td>없음</td></tr></table><div class=\"try\"><span class=\"lbl\">직접 해 보기 · D</span><p><code>rag-study/course/m1_generation.py</code>에서 작은 입력의 원리를 확인해요. 실행 위치는 <code>labs/rag-study</code>예요.</p><p>events의 fail_at을 0과 1로 바꿔요. consume 결과의 preview와 committed를 함께 확인해요.</p></div>",
  "lab": "트랜잭션의 commit처럼 done이 와야 결과를 확정해요.",
  "quiz": {
    "q": "두 번째 delta 전에 연결이 끝났고 done은 없어요. 캐시에 무엇을 써야 하나요?",
    "options": [
      "받은 delta를 정상 답으로 저장해요",
      "빈 문자열을 정상 답으로 저장해요",
      "완성 답을 저장하지 않아요"
    ],
    "answer": 2,
    "explain": "부분 텍스트가 사용자에게 보였어도 완성·검증 계약을 통과한 답은 아니에요."
  },
  scene(api) { COURSE.scene(api, {
  "label": "1.4 · AX 중급편",
  "nodes": [
    "start",
    "delta × N",
    "검증 후 done",
    "실패는 error"
  ],
  "mode": "branch"
}); }
};
