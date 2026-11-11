export default {
  "title": "독립적인 작업만 나눠 실행해요",
  "tag": "검증 후 합류",
  "lead": "에이전트를 여러 개 만들면 자동으로 정확해지는 것은 아니에요. 나눌 수 있는 입력과 합칠 수 있는 결과가 명확할 때 병렬화가 의미 있어요.",
  "body": "<h3>작업 계약에 경계를 넣어요</h3><p>task_id, 목표, 입력 자료, 허용 도구, 결과 스키마, 시간·비용 예산을 정해요. 정책 조회와 자산 조회처럼 독립된 일을 나눌 수 있어요. 앞 작업의 결과가 있어야 다음 작업을 시작할 수 있다면 의존 그래프로 표현하고 순서를 지켜요.</p><h3>작업자 수보다 검증 비용을 봐요</h3><p>여러 작업자가 같은 모델·같은 자료로 같은 오류를 낼 수 있어요. 다수결이 독립적인 증거는 아니에요. 실습은 ThreadPoolExecutor로 서로 다른 질문을 실제 검색하는 두 작업자를 실행해요. 실제 LLM 에이전트의 품질이나 속도 향상을 측정한 결과가 아니에요. 한 작업자 기준선과 총비용을 비교해요.</p><h3>작업자가 실제로 다른 자료를 조회해요</h3><p>policy 작업자는 “연차 신청”, asset 작업자는 “노트북 교체”를 같은 handbook에서 독립적으로 검색해요. worker는 지정된 답 ID를 그대로 돌려주는 대신 lexical을 실행하고 실제 근거 ID를 반환해요. 기본 실습은 LLM 에이전트가 아닌 두 검색 작업자예요.</p><p>두 질문은 서로의 결과가 없어도 시작할 수 있어 병렬 실행이 가능해요. 반면 자산의 소유 팀을 먼저 알아야 그 팀 정책을 읽을 수 있다면 선행 결과에 의존해요. 작업자를 늘리기 전에 공유 권한·버전·예산을 고정하고, 독립 작업과 의존 작업을 나눠요.</p><h3>핵심 코드 · 실행 파일에서 발췌·축약</h3><pre style=\"white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.7;font-size:12px;padding:12px;border:1px solid var(--line);border-radius:8px;background:var(--soft)\"><code style=\"background:none;border:0;padding:0;white-space:inherit\">with ThreadPoolExecutor(max_workers=2) as pool:\n    results = list(pool.map(worker, tasks))\n# worker: query -&gt; lexical -&gt; evidence ID\n# 각 작업의 필수 여부와 시간 제한은 합류 정책에서 다뤄요.</code></pre><h3>작은 입력으로 실행한 계약 결과</h3><table class=\"vs\"><tr><th>확인 항목</th><th>결과</th></tr><tr><td>독립 작업</td><td>2</td></tr><tr><td>반환된 근거</td><td>[&quot;h2-2&quot;, &quot;h5-1&quot;]</td></tr><tr><td>LLM 에이전트 호출</td><td>0</td></tr></table><div class=\"try\"><span class=\"lbl\">직접 해 보기 · A</span><p><code>rag-study/course/a5_agents.py</code>에서 작은 입력의 원리를 확인해요. 실행 위치는 <code>labs/rag-study</code>예요.</p><p>A의 두 번째 query를 자료에 없는 질문으로 바꾸고 status를 확인해요. 빈 근거를 가진 작업을 완료로 집계하지 않도록 합류 조건도 확인해요.</p></div>",
  "lab": "작업 분해는 분산 시스템 설계예요. 입력 독립성과 결과 계약이 먼저예요.",
  "quiz": {
    "q": "두 번째 작업이 첫 번째가 찾은 팀 ID를 필요로 해요. 바로 병렬로 시작할까요?",
    "options": [
      "선행 결과 뒤에 두 번째 작업을 시작해요",
      "입력이 없어도 병렬이면 항상 빨라요",
      "임의 팀 ID를 넣어 먼저 실행해요"
    ],
    "answer": 0,
    "explain": "병렬화는 작업 간 데이터 의존성을 없애 주지 않아요."
  },
  scene(api) { COURSE.scene(api, {
  "label": "5.1 · AX 심화편",
  "nodes": [
    "작업 계약",
    "정책 작업자",
    "자산 작업자",
    "검증 후 합류"
  ],
  "mode": "fork"
}); }
};
