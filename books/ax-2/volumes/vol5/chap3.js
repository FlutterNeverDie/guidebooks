export default {
  "title": "상태 전이를 함수로 드러내요",
  "tag": "abstain",
  "lead": "검색·검증·생성을 긴 함수 하나에 넣으면 어디서 실패했고 어디부터 다시 실행할지 알기 어려워요. 단계와 상태를 데이터로 만들어요.",
  "body": "<h3>노드는 상태를 읽고 변경분을 만들어요</h3><p>입문용 execute는 retrieve → verify → answer 또는 abstain의 작은 전이 함수예요. 이어지는 C의 실행은 공통 파이프라인의 생성·파싱·검증까지 포함한 실제 trace를 출력해요. 모델의 긴 대화 기록을 제어 상태 대신 사용하지 않아요.</p><h3>LangGraph로 옮길 때의 대응</h3><p>상태 스키마는 TypedDict 같은 구조, 단계는 node, 분기는 conditional edge로 대응시킬 수 있어요. 실제 라이브러리를 도입할 때는 reducer가 여러 노드의 결과를 어떻게 합치는지 정해야 해요. 여기의 파이썬 상태 머신은 라이브러리 설치 없이 제어 흐름을 검증하는 기준선이에요.</p><h3>상태에는 다음 작업과 검증 결과를 남겨요</h3><p>상태는 지금까지 얻은 값과 다음에 할 작업을 명시한 기록이에요. 공통 요청의 실제 경로는 authorize → retrieve → pack → generate → parse → validate → answer예요. JSON이 틀리면 parse에서 error로 끝나고, 문맥이 비면 generate 전에 abstain으로 끝나요.</p><p>recovery.py는 재시도 경계를 retrieve와 generate 사이에 둬요. 저장한 검색 결과를 다시 사용할 때도 현재 문서·권한과 대조하는 pipeline 경로를 지나가요. 이 책은 명시적인 Python 함수로 실행하며 LangGraph 설치나 호환 API를 흉내 내지 않아요. 그래프 라이브러리로 옮길 때도 상태 필드와 종료 조건은 그대로 필요해요.</p><h3>핵심 코드 · 실행 파일에서 발췌·축약</h3><pre style=\"white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.7;font-size:12px;padding:12px;border:1px solid var(--line);border-radius:8px;background:var(--soft)\"><code style=\"background:none;border:0;padding:0;white-space:inherit\">state = {&quot;schema&quot;: 1, &quot;query&quot;: &quot;연차 신청&quot;,\n         &quot;node&quot;: &quot;retrieve&quot;, &quot;version&quot;: 1}\nstate[&quot;docs&quot;] = [asdict(d) for d in hits]\nstate[&quot;node&quot;] = &quot;generate&quot;\n# 복구 뒤에도 run_request에서 범위·형식·인용을 검증해요.</code></pre><h3>작은 입력으로 실행한 계약 결과</h3><table class=\"vs\"><tr><th>확인 항목</th><th>결과</th></tr><tr><td>통합 상태 경로</td><td>[&quot;authorize&quot;, &quot;retrieve&quot;, &quot;pack&quot;, &quot;generate&quot;, &quot;parse&quot;, &quot;validate&quot;, &quot;answer&quot;]</td></tr><tr><td>최종 근거</td><td>[&quot;h2-2&quot;, &quot;h2-3&quot;, &quot;h2-1&quot;, &quot;h3-1&quot;, &quot;h7-2&quot;]</td></tr></table><div class=\"try\"><span class=\"lbl\">직접 해 보기 · C</span><p><code>rag-study/course/m5_agent.py</code>에서 작은 입력의 원리를 확인해요. 실행 위치는 <code>labs/rag-study</code>예요.</p><p>m5의 C와 E에서 정상 상태 경로와 위조 인용의 종료 상태를 비교해요. error 뒤에 answer가 나오지 않는지 검사해요.</p></div>",
  "lab": "워크플로를 코드 속 호출 순서가 아니라 검사 가능한 상태 전이로 만들어요.",
  "quiz": {
    "q": "검색 성공 뒤 모델이 잘못된 JSON을 냈어요. 최종 상태는?",
    "options": [
      "검색이 성공했으므로 answer예요",
      "검증 없이 원문 출력을 답으로 써요",
      "error로 끝내고 완성 답을 반환하지 않아요"
    ],
    "answer": 2,
    "explain": "검색 성공과 전체 요청 완료는 다르며 파싱·검증 실패도 상태에 남겨야 해요."
  },
  scene(api) { COURSE.scene(api, {
  "label": "5.3 · AX 중급편",
  "nodes": [
    "retrieve",
    "verify",
    "answer",
    "abstain"
  ],
  "mode": "branch"
}); }
};
