export default {
  "title": "LLM이 만든 문제는 검토할 후보예요",
  "tag": "고정 평가 세트",
  "lead": "질문을 많이 만드는 것은 쉬워도 정답 근거가 분명한 평가 세트를 만드는 것은 어려워요. 자동 생성과 최종 승인을 별도 단계로 둬요.",
  "body": "<h3>질문과 정답을 원문에 묶어요</h3><p>후보에는 질문, 정답 조각 ID, 근거 문장, 답변 가능 여부, 질문 유형을 저장해요. 숫자·예외·부정 조건을 바꾼 질문과 답 없는 질문도 포함해요. 모델이 원문 밖의 상식을 섞은 답을 정답으로 승인하면 평가 전체가 잘못된 방향으로 움직여요.</p><h3>생성과 채점의 공통 편향을 줄여요</h3><p>같은 모델이 문제도 만들고 자기 답도 채점하면 특정 문체를 유리하게 볼 수 있어요. 사람이 원문과 대조한 소량의 기준 세트를 먼저 만들고, 자동 후보의 오류 유형을 표본 검토해요. 실습은 후보 승인 계약만 검사해요. 실제 생성은 로컬에서 기존 LLM 래퍼로 수행하고, CI에는 승인된 고정 데이터만 둬요.</p><h3>승인 플래그 앞에 검토 근거를 남겨요</h3><p>후보 레코드에는 질문, 답, source, 원문 인용, review_reason이 함께 있어야 해요. “연차 기한?”과 답 “3일 전”만 있으면 긴급 예외를 묻는 질문인지 모호해요. 질문을 일반 신청으로 좁히거나 예외까지 정답에 포함할지 사람이 결정해요.</p><p>실습의 approved=True는 검토 완료 상태를 표현할 뿐이에요. 자동으로 진실을 알아낸 결과가 아니에요. 후보를 만든 모델과 채점 모델이 같으면 비슷한 표현을 선호할 수 있어요. 원문 대비 숫자·조건·예외가 맞는지 표본을 직접 읽는 절차를 남겨요.</p><h3>핵심 코드 · 실행 파일에서 발췌·축약</h3><pre style=\"white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.7;font-size:12px;padding:12px;border:1px solid var(--line);border-radius:8px;background:var(--soft)\"><code style=\"background:none;border:0;padding:0;white-space:inherit\">{&quot;q&quot;: &quot;일반 연차 신청 기한은?&quot;,\n &quot;answer&quot;: &quot;3일 전&quot;, &quot;source&quot;: &quot;h2-2&quot;,\n &quot;quote&quot;: &quot;신청은 3일 전까지&quot;,\n &quot;review_reason&quot;: &quot;일반 신청으로 질문 범위를 한정&quot;,\n &quot;approved&quot;: True}</code></pre><h3>작은 입력으로 실행한 계약 결과</h3><table class=\"vs\"><tr><th>확인 항목</th><th>결과</th></tr><tr><td>후보 질문</td><td>2</td></tr><tr><td>출처·검토 통과</td><td>1</td></tr></table><div class=\"try\"><span class=\"lbl\">직접 해 보기 · B</span><p><code>rag-study/course/m3_evaluation.py</code>에서 작은 입력의 원리를 확인해요. 실행 위치는 <code>labs/rag-study</code>예요.</p><p>B의 후보 하나에 답과 검토 이유를 추가해요. 답 없는 후보는 답이 없다고 판단한 검색 범위도 함께 적어요.</p></div>",
  "lab": "모델의 초안은 검토 대기 레코드예요. source와 approved가 있어야 평가 데이터가 돼요.",
  "quiz": {
    "q": "LLM이 만든 질문과 답은 자연스럽지만 source가 비어 있어요. 시험 세트에 넣을까요?",
    "options": [
      "문장이 자연스러우면 승인해요",
      "같은 LLM이 동의하면 승인해요",
      "출처와 답을 검토할 때까지 보류해요"
    ],
    "answer": 2,
    "explain": "시험 정답 자체가 검증되지 않으면 모델을 잘못 비교할 수 있어요."
  },
  scene(api) { COURSE.scene(api, {
  "label": "3.2 · AX 중급편",
  "nodes": [
    "문제 후보",
    "원문 근거",
    "사람의 검토",
    "고정 평가 세트"
  ],
  "mode": "flow"
}); }
};
