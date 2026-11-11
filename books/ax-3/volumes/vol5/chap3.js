export default {
  "title": "재시도와 정확히 한 번의 효과를 구별해요",
  "tag": "효과 한 번",
  "lead": "작업 완료 응답을 받기 전에 연결이 끊기면 실행됐는지 모를 수 있어요. 재시도는 전달을 늘리지만 효과가 중복되지 않게 하는 장치가 필요해요.",
  "body": "<h3>DB 안에서는 원자적으로 묶어요</h3><p>실습은 고유 멱등성 키를 receipts에 넣고 실제 카운터 변경을 같은 트랜잭션에서 수행해요. 키 삽입이 처음 성공한 경우에만 값을 증가시켜 두 번 전달돼도 한 번만 반영해요. 키와 업무 데이터 갱신이 다른 트랜잭션이면 그 사이 장애를 따져야 해요.</p><h3>외부 API에는 별도의 보장이 필요해요</h3><p>DB에 기록한 뒤 외부 전송 전에 죽거나, 전송 후 기록 전에 죽을 수 있어요. outbox로 실행 의도를 내구성 있게 남기고, 대상이 지원하는 멱등성 키와 결과 조회를 활용해요. 외부 대상이 이를 지원하지 않으면 조정·중복 탐지·보상 절차가 필요해요. 로컬 DB 예제를 외부 시스템 exactly-once 보장으로 부르지 않아요.</p><h3>효과와 영수증을 같은 트랜잭션에 둬요</h3><p>receipts의 key는 이미 처리한 작업인지 나타내는 멱등 키예요. INSERT OR IGNORE가 새 행을 만들 때만 counter를 증가시키고 둘을 같은 DB 트랜잭션으로 묶어요. 같은 키를 두 번 전달해도 DB 효과는 한 번이에요.</p><p>DB commit 후 외부 API 호출 전에 죽는 경우와, 외부 호출 성공 후 완료 기록 전에 죽는 경우를 타임라인에 그려 보세요. DB 영수증만으로 외부 효과의 정확히 한 번을 보장하지 못해요. outbox는 업무 변경과 보낼 이벤트를 같은 DB에 기록해 유실 틈을 줄이며, 전달 소비자는 멱등 키로 중복을 처리해야 해요.</p><h3>핵심 코드 · 실행 파일에서 발췌·축약</h3><pre style=\"white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.7;font-size:12px;padding:12px;border:1px solid var(--line);border-radius:8px;background:var(--soft)\"><code style=\"background:none;border:0;padding:0;white-space:inherit\">with db:\n    cur = db.execute(&quot;INSERT OR IGNORE INTO receipts VALUES (?)&quot;, (key,))\n    if cur.rowcount:\n        db.execute(&quot;UPDATE counter SET value = value + 1&quot;)\n# 이 트랜잭션 밖의 API 효과는 별도 계약이에요.</code></pre><h3>작은 입력으로 실행한 계약 결과</h3><table class=\"vs\"><tr><th>확인 항목</th><th>결과</th></tr><tr><td>재전달 횟수 포함 시도</td><td>2</td></tr><tr><td>DB 안의 반영 횟수</td><td>1</td></tr><tr><td>외부 API 보장</td><td>아니요</td></tr></table><div class=\"try\"><span class=\"lbl\">직접 해 보기 · C</span><p><code>rag-study/course/a5_agents.py</code>에서 작은 입력의 원리를 확인해요. 실행 위치는 <code>labs/rag-study</code>예요.</p><p>counter 갱신을 트랜잭션 밖으로 옮겼다고 가정하고 실패 지점을 두 곳에 표시해요. outbox를 넣어도 소비자 중복 제거가 필요한 이유를 설명해요.</p></div>",
  "lab": "메시지 전달 횟수와 업무 효과의 횟수는 다른 문제예요.",
  "quiz": {
    "q": "DB 영수증 기록과 외부 결제가 서로 다른 시스템이에요. 영수증 UNIQUE만으로 보장되는 것은?",
    "options": [
      "외부 결제까지 항상 정확히 한 번",
      "네트워크 실패 없는 전달",
      "그 DB 안의 중복 기록 방지"
    ],
    "answer": 2,
    "explain": "단일 DB 트랜잭션의 보장 범위를 외부 서비스까지 확대하면 안 돼요."
  },
  scene(api) { COURSE.scene(api, {
  "label": "5.3 · AX 심화편",
  "nodes": [
    "재전달",
    "고유 키 삽입",
    "동일 트랜잭션",
    "효과 한 번"
  ],
  "mode": "flow"
}); }
};
