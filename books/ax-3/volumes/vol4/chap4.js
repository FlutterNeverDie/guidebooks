export default {
  "title": "승인은 정확한 실행 내용에 묶어요",
  "tag": "원자적 1회 소비",
  "lead": "사용자가 승인한 뒤 모델이 대상이나 목적지를 바꾸면 그 승인은 새 작업에 적용되지 않아요. 승인 여부만 저장하는 불리언은 충분하지 않아요.",
  "body": "<h3>승인할 페이로드를 고정해요</h3><p>도구 이름, 대상 자원, 목적지, 주요 인자를 정규화해 해시로 묶어요. 승인 레코드에는 actor, tenant, 만료 시각, 일회성 사용 상태를 넣어요. 실행 직전 실제 페이로드와 비교하고 현재 권한도 다시 확인해요. 해시는 승인자의 신원 인증을 대신하지 않아요.</p><h3>사용 처리와 실행의 경쟁 조건</h3><p>작은 딕셔너리의 used 플래그만으로는 동시 소비를 막지 못해요. 이번에는 그 계약을 독립 DB 연결 두 개의 원자적 갱신으로 확장해요. 원자적인 조건부 갱신이나 트랜잭션으로 소비하고, 외부 효과에는 멱등성 키를 함께 사용해요. 만료와 재승인 경로도 사용자에게 보여야 해요.</p><h3>같은 승인을 두 작업자가 소비해 봐요</h3><p>내용 결합은 승인받은 도구·대상·목적지를 해시로 묶는 것이고, 1회 소비는 같은 승인을 두 번 실행하지 못하게 하는 것이에요. 해시가 맞는지만 검사하면 두 작업자가 동시에 used=False를 보고 둘 다 실행할 수 있어요.</p><p>concurrency.approval_race는 서로 다른 SQLite 연결 두 개를 barrier로 맞춰 같은 UPDATE를 실행해요. id·hash·actor·tenant·만료·used=0 조건을 모두 만족한 한 작업자만 행을 바꿔요. 실제 실행에서 원본 승인 소비 성공 수는 1, 내용 변경 시 성공 수는 0이었어요.</p><p>승인을 소비한 뒤 외부 전송 전에 죽으면 승인만 사용되고 전송은 없을 수 있어요. 이 실습은 승인 행의 원자적 소비까지만 보장해요. 외부 효과까지 다루려면 실행 상태와 멱등 요청 키, 재시도·보상 정책을 함께 설계해야 해요.</p><h3>핵심 코드 · 실행 파일에서 발췌·축약</h3><pre style=\"white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.7;font-size:12px;padding:12px;border:1px solid var(--line);border-radius:8px;background:var(--soft)\"><code style=\"background:none;border:0;padding:0;white-space:inherit\">UPDATE approvals SET used = 1\nWHERE id = ? AND hash = ? AND actor = ? AND tenant = ?\n  AND expires &gt; ? AND used = 0;\n-- rowcount == 1인 실행자만 승인 소비에 성공해요.</code></pre><h3>작은 입력으로 실행한 계약 결과</h3><table class=\"vs\"><tr><th>확인 항목</th><th>결과</th></tr><tr><td>변경된 내용 승인 재사용</td><td>아니요</td></tr><tr><td>원본 첫 실행</td><td>예</td></tr><tr><td>두 번째 실행</td><td>아니요</td></tr><tr><td>동시 승인 소비 성공 수</td><td>1</td></tr><tr><td>변경 내용 동시 소비 수</td><td>0</td></tr></table><div class=\"try\"><span class=\"lbl\">직접 해 보기 · D</span><p><code>rag-study/course/a4_security.py</code>에서 작은 입력의 원리를 확인해요. 실행 위치는 <code>labs/rag-study</code>예요.</p><p>python3 course/concurrency.py를 실행해 동시 승인 성공 수를 봐요. supplied_hash를 바꾸면 두 연결 모두 거절되는지도 테스트해요.</p></div>",
  "lab": "승인은 특정 주체가 특정 내용에 내린 결정이에요. 내용이 바뀌면 다시 승인받아요.",
  "quiz": {
    "q": "서로 다른 실행자 두 명이 같은 승인을 동시에 받았어요. 1회 소비를 지키려면?",
    "options": [
      "각자 해시를 확인한 뒤 used를 써요",
      "실행자마다 승인 사본을 만들어요",
      "검사와 used 변경을 원자적 조건부 갱신으로 묶어요"
    ],
    "answer": 2,
    "explain": "내용 일치와 동시 소비 방지는 별개의 조건이므로 둘 다 같은 변경 경계에 넣어요."
  },
  scene(api) { COURSE.scene(api, {
  "label": "4.4 · AX 심화편",
  "nodes": [
    "실행 내용 고정",
    "주체·만료 승인",
    "내용 재검증",
    "원자적 1회 소비"
  ],
  "mode": "flow"
}); }
};
