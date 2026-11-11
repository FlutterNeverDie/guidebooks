export default {
  "title": "모델 비교에서 고정할 것을 정해요",
  "tag": "유형별 평가",
  "lead": "서로 다른 모델로 만든 검색 결과를 비교하려면 모델 외의 조건이 같아야 해요. 청크나 후보 수까지 바뀌면 어느 변화가 효과였는지 알 수 없어요.",
  "body": "<h3>임베딩 자체와 ANN 손실을 분리해요</h3><p>같은 원문·청크·질문·정답 ID로 임베딩을 만들고 먼저 정확 검색으로 평가해요. 모델별 질의·문서 접두어, 풀링, 정규화, 입력 한도를 지켜야 공정해요. 이후 ANN을 적용해 정확 검색 대비 회수 손실을 측정하면 표현 품질과 색인 품질을 분리할 수 있어요.</p><h3>전체 평균을 쪼개요</h3><p>한국어 조사, 약어, 부정, 숫자, 긴 문서, 답 없는 질문을 나눠 보세요. a1의 작은 계산은 2차원 좌표로 순위 변화의 구조를 보여 줘요. 아래 별도 실험은 실제 한국어 임베딩을 측정해요. 실제 모델 순위를 뜻하지 않아요. 모델 선택의 결론은 로컬 코퍼스로 재측정해야 해요.</p><h3>인코더 오차와 ANN 오차를 나눠요</h3><p>먼저 모든 문서 벡터를 비교하는 정확 검색을 기준선으로 둬요. 그다음 같은 벡터를 HNSW로 검색해요. ANN은 계산을 줄이기 위해 일부 후보를 놓칠 수 있는 근사 검색이에요. 질문·문서·인코더가 바뀌면 ANN 때문인지 구분할 수 없어요.</p><p>실제 한국어 조각 23개와 개발 질문 22개에서 정확 벡터 검색과 HNSW의 hit@1은 모두 13/22였고, 정확 검색 top3 대비 ANN recall은 1.0이었어요. 이 작은 집합에서는 놓친 정답의 원인을 ANN 탐색보다 임베딩·질문·조각 구성 쪽에서 먼저 살펴볼 수 있어요. RRF를 더한 중급 실험의 14/22와는 기준선이 달라요.</p><h3>핵심 코드 · 실행 파일에서 발췌·축약</h3><pre style=\"white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.7;font-size:12px;padding:12px;border:1px solid var(--line);border-radius:8px;background:var(--soft)\"><code style=\"background:none;border:0;padding:0;white-space:inherit\">exact = np.argsort(-(queries @ documents.T), axis=1)\n_, approximate = index.search(queries, 3)\n# 동일 벡터·동일 질문으로 top3 겹침을 비교해요.\n# 정답 hit@1과 정확 순위 대비 ANN recall은 다른 값이에요.</code></pre><h3>실제 임베딩 · 정확 검색과 HNSW 비교</h3><table class=\"vs\"><tr><th>확인 항목</th><th>결과</th></tr><tr><td>documents</td><td>23</td></tr><tr><td>questions</td><td>22</td></tr><tr><td>exact_hit1</td><td>13</td></tr><tr><td>ann_hit1</td><td>13</td></tr><tr><td>ann_recall3_against_exact</td><td>1.0</td></tr></table><div class=\"try\"><span class=\"lbl\">직접 해 보기 · A</span><p><code>rag-study/course/a1_embeddings.py</code>에서 작은 입력의 원리를 확인해요. 실행 위치는 <code>labs/rag-study</code>예요.</p><p>ann_experiment.py의 handbook 결과를 읽어요. 정확 검색은 맞는데 ANN만 놓친 질문이 있는지 확인한 뒤 efSearch를 바꿔요.</p></div>",
  "lab": "모델 비교는 통제 실험이에요. 데이터·전처리·검색 설정을 manifest로 남겨요.",
  "quiz": {
    "q": "정확 검색과 ANN이 모두 같은 오답을 1위로 뽑았어요. 먼저 볼 대상은?",
    "options": [
      "ANN만의 탐색 누락",
      "HNSW 색인을 무조건 더 크게 만들기",
      "표현·임베딩·조각과 정답 정의"
    ],
    "answer": 2,
    "explain": "정확 검색부터 틀렸다면 근사 탐색만 고쳐도 같은 벡터 순위의 오류는 남아요."
  },
  scene(api) { COURSE.scene(api, {
  "label": "1.1 · AX 심화편",
  "nodes": [
    "고정 코퍼스",
    "모델별 규약",
    "정확 검색",
    "유형별 평가"
  ],
  "mode": "flow"
}); }
};
