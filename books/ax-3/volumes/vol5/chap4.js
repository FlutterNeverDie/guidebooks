export default {
  "title": "공유 예산은 실행 전에 예약해요",
  "tag": "정산·반환",
  "lead": "각 작업자가 남은 예산을 따로 읽으면 모두 충분하다고 판단해 총액을 초과할 수 있어요. 실행 직전에 공유 예산을 원자적으로 예약해야 해요.",
  "body": "<h3>두 연결이 동시에 남은 예산을 읽게 해요</h3><p>전체 예산은 가정한 10단위이고 두 작업자가 각각 6단위를 예약해요. unsafe 실험은 두 연결이 모두 잔액 10을 읽을 때까지 barrier에서 기다린 뒤 차감해요. “먼저 확인하고 나중에 빼기”라서 둘 다 허용되고 잔액은 -2가 됐어요.</p><p>atomic 실험은 UPDATE budget SET remaining=remaining-6 WHERE remaining>=6을 한 문장으로 실행해요. 실제 두 연결 중 하나만 성공했고 나머지는 조건에 맞는 행을 갱신하지 못해요. 허용 수는 1, 잔액은 4였어요. 실행 순서는 달라도 이 계약은 같아야 해요.</p><p>이 단위는 실제 토큰 요금이 아닌 예약 모형이에요. 작업 후 실제 사용량을 정산하려면 reservation_id, 예약 상태, 사용량, 반환 여부를 저장해야 해요. 같은 예약 요청의 재전달을 중복 차감하지 않도록 멱등 키도 필요해요. 음수 예약을 거절하는 검사는 기존 reserve 함수와 계약 테스트에 남겨요.</p><p>SQLite가 같은 파일의 쓰기를 직렬화하는 조건에서 재현했어요. 다른 DB나 분산 예산 저장소로 옮기면 격리 수준과 조건부 갱신·충돌 처리 계약을 다시 검증해야 해요. 여러 프로세스가 공유하는 숫자를 Python 변수 하나로 관리하면 이 보장은 생기지 않아요.</p><h3>핵심 코드 · 실행 파일에서 발췌·축약</h3><pre style=\"white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.7;font-size:12px;padding:12px;border:1px solid var(--line);border-radius:8px;background:var(--soft)\"><code style=\"background:none;border:0;padding:0;white-space:inherit\">cur = db.execute(\n    &quot;UPDATE budget SET remaining = remaining - ? WHERE remaining &gt;= ?&quot;,\n    (amount, amount))\naccepted = cur.rowcount == 1\n# 검사와 차감 사이에 다른 예약이 끼어들 틈을 없애요.</code></pre><h3>SQLite 독립 연결 2개 · 가정 예산 10</h3><table class=\"vs\"><tr><th>확인 항목</th><th>결과</th></tr><tr><td>확인 후 별도 차감</td><td>2명 승인 / 잔액 -2</td></tr><tr><td>조건부 UPDATE</td><td>1명 승인 / 잔액 4</td></tr></table><div class=\"try\"><span class=\"lbl\">직접 해 보기 · D</span><p><code>rag-study/course/a5_agents.py</code>에서 작은 입력의 원리를 확인해요. 실행 위치는 <code>labs/rag-study</code>예요.</p><p>python3 course/concurrency.py에서 unsafe와 atomic을 비교해요. 승인된 작업자 수와 남은 잔액을 함께 읽고, 실패한 예약에 실제 작업이 시작되지 않도록 연결해요.</p></div>",
  "lab": "예산은 지갑처럼 공유 상태예요. 읽고 나중에 차감하면 경쟁 조건이 생겨요.",
  "quiz": {
    "q": "잔액 10을 두 작업자가 읽고 각각 6을 예약해요. 먼저 SELECT한 뒤 별도로 차감하면?",
    "options": [
      "둘 다 승인돼 예산을 초과할 수 있어요",
      "DB를 쓰면 언제나 한 명만 승인돼요",
      "차감이 빠르면 충돌이 사라져요"
    ],
    "answer": 0,
    "explain": "검사와 변경이 분리되면 동일 잔액으로 여러 결정을 내릴 수 있어요."
  },
  scene(api) { COURSE.detail(api, {"kind": "concurrency", "title": "같은 잔액을 동시에 읽으면"}); }
};
