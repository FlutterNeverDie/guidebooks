export default {
  "title": "한국어 BM25는 토큰부터 확인해요",
  "tag": "BM25 점수",
  "lead": "BM25 설정을 바꾸기 전에 검색어와 문서가 같은 단어 단위로 만나고 있는지 봐야 해요. “휴가”와 “휴가를”이 다르면 점수 계산은 시작도 못 해요.",
  "body": "<h3>점수의 재료를 분해해요</h3><p>BM25는 질의 단어의 문서 내 빈도, 문서 집합에서의 희소성, 문서 길이를 사용해요. 단어를 반복하면 무한히 같은 비율로 점수가 오르지 않도록 빈도를 포화시키고 긴 문서를 보정해요. 하지만 토큰이 안 맞으면 그 단어의 빈도는 0이에요.</p><h3>형태소 분석과 통제 어휘를 구별해요</h3><p>실습은 휴가를·휴가는을 휴가로 바꾸는 작은 사전만 써요. 범용 한국어 분석기가 아니에요. 실제로는 조사 처리, 사내 약어, 모델 번호, 영문 코드가 함께 있는 샘플로 분석기 후보를 비교해요. 단순히 모든 어미를 자르면 제품명이나 부정 표현이 망가질 수 있어요.</p><h3>조사·제품 코드·부정을 직접 토큰으로 봐요</h3><p>“휴가”와 “휴가를”은 띄어쓰기만 나누면 다른 토큰이에요. controlled_tokens는 실습에 필요한 몇 단어만 맞춰 줘요. “KTX”, “KTX를”, “허용”, “허용하지 않는다”를 출력해 보면 한 사전이 모든 문제를 해결하지 않는다는 점이 보여요. 부정문은 같은 주제 단어를 포함해도 결론이 반대일 수 있어요.</p><p>공통 파이프라인의 lexical은 별도의 글자 2개 묶음 기준선이에요. 원질문의 표현 차이를 줄이는 용도이며 범용 형태소 분석기가 아니에요. handbook의 실제 한국어 문서를 대상으로 후보를 보고, 이후 임베딩·재정렬과 비교할 출발점으로 써요.</p><h3>핵심 코드 · 실행 파일에서 발췌·축약</h3><pre style=\"white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.7;font-size:12px;padding:12px;border:1px solid var(--line);border-radius:8px;background:var(--soft)\"><code style=\"background:none;border:0;padding:0;white-space:inherit\">for text in [&quot;휴가&quot;, &quot;휴가를&quot;, &quot;KTX를&quot;, &quot;허용하지 않는다&quot;]:\n    print(text, tokens(text), controlled_tokens(text))\nfrom pipeline import handbook, lexical\nprint([d.id for d in lexical(&quot;기차표 돌려받기&quot;, handbook())])</code></pre><h3>작은 입력으로 실행한 계약 결과</h3><table class=\"vs\"><tr><th>확인 항목</th><th>결과</th></tr><tr><td>띄어쓰기 BM25</td><td>[0.0, 0.0]</td></tr><tr><td>통제 어휘 BM25</td><td>[0.6931, 0.0]</td></tr></table><div class=\"try\"><span class=\"lbl\">직접 해 보기 · A</span><p><code>rag-study/course/m2_search.py</code>에서 작은 입력의 원리를 확인해요. 실행 위치는 <code>labs/rag-study</code>예요.</p><p>A의 통제 어휘에서 “휴가를” 항목을 지우고 BM25 점수를 비교해요. 부정문을 같은 토큰으로 바꿔도 답이 같아지는 것은 아닌지 따로 검토해요.</p></div>",
  "lab": "DB 정렬 규칙과 인덱스 정의를 맞추듯 검색과 적재의 분석 규칙을 맞춰요.",
  "quiz": {
    "q": "검색 점수는 높지만 문서가 “특실을 허용하지 않는다”고 해요. 다음으로 확인할 것은?",
    "options": [
      "질문의 조건과 문서의 부정 표현",
      "단어 수가 많으므로 정답 처리",
      "BM25 점수를 정답 확률로 변환"
    ],
    "answer": 0,
    "explain": "어휘 일치는 후보 확보에 쓰고 사실 판단은 문장과 조건까지 읽어야 해요."
  },
  scene(api) { COURSE.scene(api, {
  "label": "2.1 · AX 중급편",
  "nodes": [
    "휴가 / 휴가를",
    "분석 규칙",
    "같은 토큰",
    "BM25 점수"
  ],
  "mode": "flow"
}); }
};
