export default {
  "title": "부분 실패를 완성된 답으로 숨기지 않아요",
  "tag": "복구 경로",
  "lead": "필수 자료를 담당한 작업자가 실패했는데 성공한 결과만 요약하면 누락된 조건을 모른 채 그럴듯한 답이 나올 수 있어요. 합류 상태를 명시해요.",
  "body": "<h3>필수와 선택 작업을 사전에 정해요</h3><p>각 작업에 required 여부와 timeout, 실패 시 fallback을 정해요. 필수 작업이 실패하면 재시도·보류·부분 응답 중 하나로 처리해요. 선택 작업 실패는 생략할 수 있어도 누락한 범위를 표시해요. 실패를 관찰한 뒤 임의로 선택 작업으로 바꾸지 않아요.</p><h3>전체 시스템으로 회귀 평가해요</h3><p>정상 입력 외에 작업자 지연, 중복 결과, 충돌, 권한 철회, 취소, 예산 소진, 재시작을 주입해요. 단일 작업자 기준선과 품질·총 호출 수·완료율·p95를 비교해 실제 이득을 판단해요. 이 책의 실습은 제어 계약을 확인하는 기준선이에요. 실제 모델을 붙인 평가는 로컬 전용 경로에서 별도로 수행해요.</p><h3>실패를 주입해 합류 상태가 바뀌는지 봐요</h3><p>두 번째 worker에 fail 플래그를 주면 실제로 TimeoutError를 던져요. Future.result에서 예외를 받아 해당 작업을 timeout으로 기록하고 필수 작업이 모두 ok인지 검사해요. 이번 결과는 partial이며 완료로 표시하지 않았어요.</p><p>이것은 타임아웃 처리 경로를 시험하기 위한 결정적 실패 주입이에요. 실제 원격 모델이 제한 시간을 넘기는 벤치마크는 아니에요. Future 대기 제한만 걸어도 이미 시작한 작업이 자동 취소되는 것은 아니므로 원격 호출의 취소·정산·늦은 응답 정책도 필요해요.</p><p>정책 검색만 성공하고 자산 검색이 실패했다면 “정책 부분은 확인했지만 자산은 확인하지 못했다”처럼 범위를 표시해요. 실패가 필수 작업인지 선택 작업인지에 따라 보류·부분 답·전체 오류를 구분해요. 도착한 자료만 합쳐 완성처럼 보이는 답을 만들지 않아요.</p><h3>핵심 코드 · 실행 파일에서 발췌·축약</h3><pre style=\"white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.7;font-size:12px;padding:12px;border:1px solid var(--line);border-radius:8px;background:var(--soft)\"><code style=\"background:none;border:0;padding:0;white-space:inherit\">try:\n    result = future.result(timeout=5)\nexcept TimeoutError:\n    result = {&quot;task_id&quot;: task[&quot;id&quot;], &quot;status&quot;: &quot;timeout&quot;}\ncomplete = all(r[&quot;status&quot;] == &quot;ok&quot; for r in batch if r[&quot;required&quot;])</code></pre><h3>작은 입력으로 실행한 계약 결과</h3><table class=\"vs\"><tr><th>확인 항목</th><th>결과</th></tr><tr><td>필수 작업 타임아웃</td><td>1</td></tr><tr><td>최종 상태</td><td>partial</td></tr><tr><td>완료로 표시</td><td>아니요</td></tr></table><div class=\"try\"><span class=\"lbl\">직접 해 보기 · E</span><p><code>rag-study/course/a5_agents.py</code>에서 작은 입력의 원리를 확인해요. 실행 위치는 <code>labs/rag-study</code>예요.</p><p>E의 required를 한 작업에서 False로 바꾸면 최종 상태 정책이 어떻게 달라져야 하는지 비교해요. 실패 정보를 삭제하지 않고 범위를 설명해요.</p></div>",
  "lab": "완료는 결과가 몇 개 도착했다는 뜻이 아니라 필수 조건이 모두 충족됐다는 뜻이에요.",
  "quiz": {
    "q": "필수 작업 두 개 중 하나가 timeout이고 하나만 성공했어요. 최종 표시는?",
    "options": [
      "성공한 근거가 있으니 전체 완료예요",
      "부분 결과나 보류로 미완료 범위를 밝혀요",
      "실패한 작업은 없었던 것으로 처리해요"
    ],
    "answer": 1,
    "explain": "합류는 텍스트 결합뿐 아니라 완성 여부와 증거 범위를 판정하는 단계예요."
  },
  scene(api) { COURSE.scene(api, {
  "label": "5.5 · AX 심화편",
  "nodes": [
    "작업별 상태",
    "필수 결과 검사",
    "부분·실패 표시",
    "복구 경로"
  ],
  "mode": "flow"
}); }
};
