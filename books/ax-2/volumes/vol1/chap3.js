export default {
  "title": "답변 보류도 정상적인 결과예요",
  "tag": "없으면 보류",
  "lead": "검색 결과가 없다는 것은 처리 오류가 아니에요. 자료 부족, 접근 권한 부족, 검색 실패를 구분해야 사용자에게 정확한 다음 행동을 안내할 수 있어요.",
  "body": "<h3>보류 상태를 응답에 넣어요</h3><p><code>abstain=true</code>와 빈 citations를 정상 계약으로 정의해요. 질문에 답할 자료가 없으면 모델 호출 없이 반환할 수 있어요. 다만 어휘 검색이 실패한 것을 세상에 답이 없다는 뜻으로 바꾸면 안 돼요. 표현은 “제공된 자료에서 찾지 못했어요”가 적절해요.</p><h3>점수 하나로 결정하지 않아요</h3><p>벡터 유사도는 답할 수 있을 확률이 아니에요. 질문에 필요한 조건이 포함됐는지, 근거끼리 충돌하는지, 원문이 유효한지 함께 봐요. 임계값은 답 있는 질문과 답 없는 질문을 나눈 검증 세트로 정해요. 숫자를 다른 임베딩 모델에 그대로 옮기지 않아요.</p><h3>같은 질문도 보류 원인이 달라요</h3><p>“연차 신청”을 세 조건에서 실행해요. 기본 권한이면 근거가 들어오고, tenant를 unknown으로 바꾸면 허용 문서가 없어요. budget=0이면 검색된 근거를 담지 못해요. 세 결과를 구분하려면 최종 문자열만 보지 말고 authorize·retrieve·pack trace를 읽어야 해요.</p><p>외부 응답은 “허용된 자료와 예산 안에서 근거를 찾지 못했다”로 모으고, 내부에서는 후보 수와 선택 수로 원인을 좁혀요. 권한 밖에 자료가 있다는 사실을 사용자에게 노출하지 않아요. 검색 누락인지 판단하려면 허용된 범위의 정답 자료와 오프라인 대조가 더 필요해요.</p><h3>핵심 코드 · 실행 파일에서 발췌·축약</h3><pre style=\"white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.7;font-size:12px;padding:12px;border:1px solid var(--line);border-radius:8px;background:var(--soft)\"><code style=\"background:none;border:0;padding:0;white-space:inherit\">run_request(&quot;연차 신청&quot;)\nrun_request(&quot;연차 신청&quot;, policy=Policy(tenant=&quot;unknown&quot;))\nrun_request(&quot;연차 신청&quot;, budget=0)\n# 세 결과의 pack.candidates와 pack.selected를 비교해요.</code></pre><h3>작은 입력으로 실행한 계약 결과</h3><table class=\"vs\"><tr><th>확인 항목</th><th>결과</th></tr><tr><td>답 없는 질문의 조각</td><td>0</td></tr><tr><td>생성 호출 필요</td><td>아니요</td></tr></table><div class=\"try\"><span class=\"lbl\">직접 해 보기 · C</span><p><code>rag-study/course/m1_generation.py</code>에서 작은 입력의 원리를 확인해요. 실행 위치는 <code>labs/rag-study</code>예요.</p><p>pipeline.py의 --scenarios를 실행해 자료 없음과 예산 부족의 status·reason·trace를 비교해요.</p></div>",
  "lab": "404, 403, 503을 구별하듯 내부 원인을 나누되, 공개 응답에는 허용된 정보만 담아요.",
  "quiz": {
    "q": "허용 문서는 있지만 글자 예산이 0이에요. 보류를 검색 품질 하락으로 집계해도 될까요?",
    "options": [
      "보류는 모두 검색 실패로 집계해요",
      "포장 실패로 분리한 뒤 검색 품질을 평가해요",
      "모든 권한 문서를 생성기에 넣어 해결해요"
    ],
    "answer": 1,
    "explain": "단계별 원인을 섞으면 검색기를 바꿔도 해결되지 않는 문제를 잘못 최적화해요."
  },
  scene(api) { COURSE.scene(api, {
  "label": "1.3 · AX 중급편",
  "nodes": [
    "허용 범위 검색",
    "근거 있음",
    "답변 생성",
    "없으면 보류"
  ],
  "mode": "branch"
}); }
};
