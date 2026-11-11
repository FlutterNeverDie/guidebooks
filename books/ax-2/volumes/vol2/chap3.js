export default {
  "title": "HyDE의 가상 문서는 근거가 아니에요",
  "tag": "원문으로 답",
  "lead": "짧은 질문과 설명형 문서는 표현이 멀 수 있어요. HyDE는 질문에 대한 가상의 문서를 만들어 검색의 출발 표현으로 사용해요.",
  "body": "<h3>가상 답을 원문으로 돌아가는 검색 힌트로 써요</h3><p>HyDE는 질문으로 가상의 답변 문서를 생성하고, 그 문서의 임베딩으로 실제 코퍼스를 찾는 방법이에요. 짧은 질문보다 답 같은 문장이 문서와 가까울 것이라는 가정을 시험해요. 생성 문장 자체를 출처 목록에 넣으면 안 돼요.</p><p>이번 실험은 로컬 Claude로 가상 규정을 만들고, 원질문과 가상 규정을 같은 multilingual-MiniLM 인코더에 넣었어요. 코퍼스도 같은 23개 조각이에요. 따라서 비교에서 바뀐 것은 검색 벡터를 만드는 입력이에요.</p><p>“기차표 돌려받기”의 정답 순위는 4위에서 7위로 나빠졌어요. 생성된 문장이 기차표 취소·환불 쪽으로 뜻을 좁혔고, 1위로 회수한 원문은 회의실 규정이었어요. 반면 “올해 남은 휴가 내년에 써도 돼?”는 2위에서 1위가 됐어요. 두 건은 예시 관찰이며 일반적인 개선율로 읽지 않아요.</p><p>생성 출력에는 길이 지시를 넘는 설명과 원문에 없는 조건도 있었어요. reports/retrieval.json은 가설과 실제 회수 원문을 둘 다 남겨요. 가설은 검증하지 않은 검색 입력으로만 다루고, 최종 답은 handbook의 근거로 다시 만들어요. 원질문 검색을 유지하고 후보 합류·재정렬에서 손실을 살펴볼 수 있어요.</p><h3>핵심 코드 · 실행 파일에서 발췌·축약</h3><pre style=\"white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.7;font-size:12px;padding:12px;border:1px solid var(--line);border-radius:8px;background:var(--soft)\"><code style=\"background:none;border:0;padding:0;white-space:inherit\">hypothesis = ask(system, question)[&quot;text&quot;]\nq_vector = search.embed([question])[0]\nh_vector = search.embed([hypothesis])[0]\ncorpus = search.embed([d.text for d in docs])\noriginal = corpus @ q_vector\nexpanded = corpus @ h_vector\n# 가설은 docs에 추가하지 않아요.</code></pre><h3>로컬 HyDE 실행 · 23개 조각, 예시 질문 2개</h3><table class=\"vs\"><tr><th>확인 항목</th><th>결과</th></tr><tr><td>기차표 돌려받기</td><td>정답 순위 4 → 7</td></tr><tr><td>올해 남은 휴가 내년에 써도 돼?</td><td>정답 순위 2 → 1</td></tr></table><div class=\"try\"><span class=\"lbl\">직접 해 보기 · C</span><p><code>rag-study/course/m2_search.py</code>에서 작은 입력의 원리를 확인해요. 실행 위치는 <code>labs/rag-study</code>예요.</p><p>로컬 선택 실습 model_experiments.py --live의 hyde 두 항목을 읽어요. 가설에 새로 생긴 조건을 표시하고 실제 회수 원문과 구분해요.</p></div><p class=\"small\">더 읽기: <a href=\"https://arxiv.org/abs/2212.10496\" target=\"_blank\" rel=\"noopener\">HyDE 논문</a></p>",
  "lab": "검색 힌트는 증거 자료가 아니에요. 검색용 임시 문서와 인용할 원문을 분리해요.",
  "quiz": {
    "q": "HyDE 가설에 “3영업일 안에 총무팀 제출”이 있지만 원문에는 없어요. 이 조건은?",
    "options": [
      "가상 문서도 인용하면 사용할 수 있어요",
      "생성 모델이 썼으므로 회사 규정이에요",
      "검색 힌트로만 취급하고 답의 근거에서 빼요"
    ],
    "answer": 2,
    "explain": "HyDE의 목적은 실제 자료 회수예요. 가상의 조건을 정책 사실로 승격하지 않아요."
  },
  scene(api) { COURSE.scene(api, {
  "label": "2.3 · AX 중급편",
  "nodes": [
    "질문",
    "가상 문서",
    "실제 문서 검색",
    "원문으로 답"
  ],
  "mode": "flow"
}); }
};
