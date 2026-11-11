export default {
  "title": "CI에는 결정적인 계약 검사를 넣어요",
  "tag": "통과 또는 실패",
  "lead": "매번 모델을 호출해야만 회귀 검사를 할 수 있는 것은 아니에요. 권한·형식·색인·상태 전이처럼 코드로 보장할 부분은 고정 데이터로 검사해요.",
  "body": "<h3>품질 점수와 필수 조건을 나눠요</h3><p>recall이 높아도 다른 테넌트 문서를 반환하면 통과시키지 않아요. 권한 위반 0, 스키마 오류 0 같은 필수 조건과 검색 품질 임계값을 별도로 판정해요. 실패 메시지에는 어떤 질문과 규칙이 깨졌는지 남겨야 원인을 찾기 쉬워요.</p><h3>실제 모델 평가는 로컬에서 해요</h3><p>CI에는 고정 fixture, 파서, 출처 ID, 상태 전이, 결과 재현 검사를 둘 수 있어요. LLM 호출은 기존 규칙대로 로컬에서만 해요. 저장된 응답을 재생하는 검사는 처리 코드의 회귀를 잡지만 현재 모델 품질을 검증한 것은 아니에요. 이번 실습은 <code>python3 course/run_all.py</code> 한 번으로 오프라인 검증돼요.</p><h3>회귀 게이트가 실제 요청 결과를 읽게 해요</h3><p>게이트는 배포 전에 지켜야 할 조건을 판정하는 검사예요. 이번 E는 점수 딕셔너리를 손으로 넣지 않고 pipeline.scenarios의 일곱 요청을 실행해요. 정상·캐시는 answer, 자료 없음·예산 부족은 abstain, JSON 오류·위조 인용·반환 전 권한 변경은 error여야 해요.</p><p>기대 상태만 맞는지 보는 것으로 끝내지 않아요. test_contracts는 권한 변경 때 response가 None인지, 자료가 없을 때 생성기를 부르지 않는지, 잘못된 인용과 캐시를 거절하는지도 검사해요. CI는 이 결정적인 계약만 실행하고 실제 로컬 LLM 호출은 하지 않아요.</p><h3>핵심 코드 · 실행 파일에서 발췌·축약</h3><pre style=\"white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.7;font-size:12px;padding:12px;border:1px solid var(--line);border-radius:8px;background:var(--soft)\"><code style=\"background:none;border:0;padding:0;white-space:inherit\">outcomes = scenarios()\nchecks = {name: row[&quot;status&quot;] == expected[name]\n          for name, row in outcomes.items()}\npassed = all(checks.values())\n# 상세 원인은 reason과 trace에서 확인해요.</code></pre><h3>작은 입력으로 실행한 계약 결과</h3><table class=\"vs\"><tr><th>확인 항목</th><th>결과</th></tr><tr><td>통합 시나리오 수</td><td>7</td></tr><tr><td>회귀 게이트 통과</td><td>예</td></tr></table><div class=\"try\"><span class=\"lbl\">직접 해 보기 · E</span><p><code>rag-study/course/m3_evaluation.py</code>에서 작은 입력의 원리를 확인해요. 실행 위치는 <code>labs/rag-study</code>예요.</p><p>정상 기대 상태를 일부러 abstain으로 바꿔 게이트가 실패하는지 확인한 뒤 되돌려요. 고정 snapshot 갱신으로 실패를 덮지 않아요.</p></div>",
  "lab": "단위 계약과 외부 의존 통합 검사를 나누되, 각각 무엇을 보장하는지 표시해요.",
  "quiz": {
    "q": "JSON 오류가 발생한 요청이 error로 끝났어요. 회귀 게이트는 실패해야 하나요?",
    "options": [
      "오류가 한 번이라도 있으면 무조건 실패예요",
      "오류 요청은 평가에서 삭제해요",
      "의도한 오류를 안전하게 처리했다면 해당 검사는 통과해요"
    ],
    "answer": 2,
    "explain": "실패 주입 검사는 올바른 실패 처리를 성공 조건으로 삼아요."
  },
  scene(api) { COURSE.scene(api, {
  "label": "3.5 · AX 중급편",
  "nodes": [
    "고정 입력",
    "계약 검사",
    "품질 임계값",
    "통과 또는 실패"
  ],
  "mode": "flow"
}); }
};
