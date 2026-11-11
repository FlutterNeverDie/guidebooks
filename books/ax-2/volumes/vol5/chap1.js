export default {
  "title": "에이전트 전에 라우터를 만들어요",
  "tag": "타입별 응답",
  "lead": "모든 질문을 벡터 검색에 넣을 필요는 없어요. 개수를 묻는 질문과 규정 설명을 묻는 질문은 필요한 도구가 달라요.",
  "body": "<h3>선택 공간을 작게 정해요</h3><p>예를 들어 search와 count 두 경로부터 시작해요. count는 권한 범위 안에서 DB 집계를 수행하고 search는 원문 근거를 찾아요. 도구 설명에는 입력 스키마·결과 타입·실패 상태를 넣어요. 모델이 경로를 고르더라도 허용 도구 목록과 인자는 서버가 검증해요.</p><h3>규칙으로 충분한 곳을 먼저 구현해요</h3><p>실습은 “몇 개”가 있으면 count로 보내고 허용된 규정 조각을 실제로 세는 단순 규칙이에요. 자연어 이해 모델이나 자산 관리 DB는 아니에요. 애매한 질문, 복합 질문, 경로 선택 실패를 평가 세트에 추가해 규칙의 한계를 확인해요. 항상 모델 라우터를 추가해야 하는 것은 아니에요.</p><h3>라우터가 고른 함수를 실제로 호출해요</h3><p>“자산 몇 개”와 “연차 신청”은 다른 계산이 필요해요. count는 문서 개수인지 실제 자산 개수인지 먼저 정의해야 해요. 이번 예제는 허용된 규정 조각 수를 세는 함수이며 실물 자산 수라고 부르지 않아요.</p><p>m5의 A는 서버 Policy를 적용한 handbook 조각 중 선택한 범위를 실제로 세어요. dispatch는 “경비 규정 조각 몇 개” 형식만 집계해요. “노트북 몇 개”처럼 지원하지 않는 집계는 clarify로 돌려주고 숫자를 내지 않아요. 검색 경로는 같은 자료를 lexical로 읽어요. 라우터에 업무가 두 개뿐이고 분기가 명확하면 모델을 추가하기보다 입력 종류와 허용된 함수 목록을 먼저 고정할 수 있어요.</p><h3>핵심 코드 · 실행 파일에서 발췌·축약</h3><pre style=\"white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.7;font-size:12px;padding:12px;border:1px solid var(--line);border-radius:8px;background:var(--soft)\"><code style=\"background:none;border:0;padding:0;white-space:inherit\">operation = route(question)\nif operation == &quot;count&quot; and question.strip().rstrip(&quot;?&quot;) != &quot;경비 규정 조각 몇 개&quot;:\n    return {&quot;operation&quot;: &quot;clarify&quot;}\nif operation == &quot;count&quot;:\n    result = sum(d.parent == &quot;h4&quot; and policy.permits(d)\n                 for d in handbook())\nelse:\n    result = run_request(question, policy=policy)</code></pre><h3>작은 입력으로 실행한 계약 결과</h3><table class=\"vs\"><tr><th>확인 항목</th><th>결과</th></tr><tr><td>집계 질문</td><td>count</td></tr><tr><td>규정 질문</td><td>search</td></tr><tr><td>허용 자산 조각 수</td><td>3</td></tr></table><div class=\"try\"><span class=\"lbl\">직접 해 보기 · A</span><p><code>rag-study/course/m5_agent.py</code>에서 작은 입력의 원리를 확인해요. 실행 위치는 <code>labs/rag-study</code>예요.</p><p>먼저 dispatch에 “노트북 몇 개”를 넣어 clarify를 확인해요. 새 집계 범위를 추가하려면 허용 질문·범위·응답 단위를 함께 바꿔요. “규정 조각 수”와 “자산 수”를 다른 API 이름으로 나누는 이유를 적어요.</p></div>",
  "lab": "작은 switch문으로 계약을 먼저 확인한 뒤 필요할 때 선택기를 바꿔요.",
  "quiz": {
    "q": "라우터가 count를 골랐고 저장소에는 규정 조각만 있어요. “노트북 수”로 반환해도 될까요?",
    "options": [
      "집계 대상이 다르므로 질문 범위를 확인해요",
      "문서 개수가 자산 개수예요",
      "count라는 도구 이름이면 충분해요"
    ],
    "answer": 0,
    "explain": "도구 선택 뒤에도 무엇을 세는지 데이터 계약이 맞아야 해요."
  },
  scene(api) { COURSE.scene(api, {
  "label": "5.1 · AX 중급편",
  "nodes": [
    "질문",
    "규정 검색",
    "허용 범위 집계",
    "타입별 응답"
  ],
  "mode": "fork"
}); }
};
