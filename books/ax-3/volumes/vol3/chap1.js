export default {
  "title": "관계에도 출처와 유효 시간이 필요해요",
  "tag": "유효 관계",
  "lead": "그래프에 선을 그었다고 사실이 확정되는 것은 아니에요. 누가 언제 어떤 원문에서 얻은 관계인지 남겨야 오류와 변경을 처리할 수 있어요.",
  "body": "<h3>개체 ID와 표시 이름을 분리해요</h3><p>이름이 같은 팀이나 자산을 하나로 합치면 잘못된 경로가 생겨요. 안정된 ID와 별칭을 구별하고 관계 타입별 허용 출발·도착 타입을 정해요. 추출 모델의 confidence는 사실 확률로 단정하지 말고 검토 우선순위 신호로 사용해요.</p><h3>충돌은 지우지 말고 해석 규칙을 둬요</h3><p>한 자산이 서로 다른 팀 소속이라는 기록이 나오면 출처·유효 기간·검토 상태를 비교해요. 실습은 from·until 기간에서 현재 active를 계산해요. 실제로는 valid_from·valid_to와 기록 시점을 구분하고, 확인되지 않은 충돌이 있으면 단일 정답을 만들지 않아요.</p><h3>충돌은 하나를 임의로 고르는 문제가 아니에요</h3><p>관계는 주어·관계명·목적어에 출처와 유효 기간을 더한 기록이에요. 이번 실습의 시점은 3이고 기간은 [from,until)로 읽어요. 종료 시점 2인 old-note는 현재 관계에서 빠져요.</p><p>--include-old로 이전 소유 관계도 현재 유효하게 만들면 asset-031의 소유 팀이 team-a와 team-b 두 개예요. resolve_ownership은 conflict를 반환해요. 목록 첫 행을 정답으로 고르면 충돌을 숨겨요. 어느 출처가 우선인지 업무 규칙이 없다면 원문 확인이나 보류가 필요해요.</p><h3>핵심 코드 · 실행 파일에서 발췌·축약</h3><pre style=\"white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.7;font-size:12px;padding:12px;border:1px solid var(--line);border-radius:8px;background:var(--soft)\"><code style=\"background:none;border:0;padding:0;white-space:inherit\">owners = {e[&quot;o&quot;] for e in edges\n          if e[&quot;active&quot;] and e[&quot;r&quot;] == &quot;OWNED_BY&quot;}\nstatus = &quot;conflict&quot; if len(owners) &gt; 1 else &quot;resolved&quot;\n# 실제 함수는 관계가 없을 때 missing도 반환해요.</code></pre><h3>작은 입력으로 실행한 계약 결과</h3><table class=\"vs\"><tr><th>확인 항목</th><th>결과</th></tr><tr><td>기본 현재 관계</td><td>2</td></tr><tr><td>기본 소유 판정</td><td>resolved</td></tr><tr><td>--include-old 판정</td><td>conflict</td></tr></table><div class=\"try\"><span class=\"lbl\">직접 해 보기 · A</span><p><code>rag-study/course/a3_graph.py</code>에서 작은 입력의 원리를 확인해요. 실행 위치는 <code>labs/rag-study</code>예요.</p><p>python3 course/a3_graph.py --include-old를 실행해 현재 관계 수와 소유 판정을 비교해요. conflict인데 단일 답을 내지 않도록 후속 정책을 정해요.</p></div>",
  "lab": "관계는 외래 키 하나보다 풍부한 사실 레코드예요. 출처와 시간을 함께 저장해요.",
  "quiz": {
    "q": "동일 시점에 서로 다른 팀 소유라는 출처 두 개가 있어요. 어떻게 하나요?",
    "options": [
      "먼저 읽은 관계를 자동 정답으로 써요",
      "충돌을 표시하고 출처 우선순위를 확인해요",
      "최신 생성 문장이 원문보다 우선이에요"
    ],
    "answer": 1,
    "explain": "유효 기간 필터와 사실 충돌 해결은 서로 다른 단계예요."
  },
  scene(api) { COURSE.scene(api, {
  "label": "3.1 · AX 심화편",
  "nodes": [
    "원문 + 시점",
    "관계 후보",
    "타입·충돌 검토",
    "유효 관계"
  ],
  "mode": "flow"
}); }
};
