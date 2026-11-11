export default {
  "title": "필터가 좁으면 ANN의 경로도 달라져요",
  "tag": "예산 안 추가 탐색",
  "lead": "가까운 이웃 대부분이 다른 테넌트라면 먼저 몇 개만 찾고 필터하는 방식으로는 결과를 채우지 못해요. 권한과 회수율을 함께 설계해야 해요.",
  "body": "<h3>후보 부족을 숫자로 드러내요</h3><p>a2의 작은 모형은 전역 순위 앞부분을 beta가 차지한 상황이에요. 앞의 두 개를 필터하면 alpha 결과가 없지만 다섯 후보를 보면 허용 결과 두 개를 얻어요. 실제 그래프 탐색이 아니라 후보 수와 필터의 관계를 보여 주는 순서 목록 모형이에요.</p><h3>추가 탐색과 분할을 비교해요</h3><p>pgvector의 iterative scan은 지원 버전에서 더 많은 후보를 탐색하도록 설정할 수 있지만 탐색 상한이 있어요. 극히 작은 허용 집합은 먼저 필터한 뒤 정확 검색하는 편이 나을 수도 있어요. 테넌트별 분할은 격리에 유리하지만 작은 색인이 많아지는 운영 비용이 있어요. 필터 선택도별 recall·지연·반환 개수를 측정해요.</p><h3>결과 개수와 recall을 함께 봐요</h3><p>필터 선택도는 전체 문서 중 허용되는 비율이에요. 합성 5,000개·64차원 벡터와 질문 20개, HNSW M=16·efSearch=64에서 필터 뒤 정확 top3를 기준선으로 뒀어요. 탐색 후보 3·30·300개를 가져와 필터링했어요.</p><p>허용 비율 1%일 때 후보 3개는 평균 0.05개만 반환했고 recall@3은 0.0167이었어요. 후보 300개는 평균 2.5개, recall@3 0.6833이었어요. 10% 조건에서는 후보 300개가 결과 3개를 채워도 recall은 0.8667이었어요. 개수를 채우는 것과 가장 가까운 문서를 회수하는 것은 달라요.</p><p>이 실험은 검색 후 필터 방식이며 필터 인지형 HNSW 구현을 비교하지 않았어요. 시간은 20개 질문 배치의 한 번 측정이에요. 선택도가 좁아질 때 정확 검색으로 전환할지 후보 예산을 늘릴지는 품질·비용을 함께 비교해 정해요.</p><h3>핵심 코드 · 실행 파일에서 발췌·축약</h3><pre style=\"white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.7;font-size:12px;padding:12px;border:1px solid var(--line);border-radius:8px;background:var(--soft)\"><code style=\"background:none;border:0;padding:0;white-space:inherit\">allowed_ids = np.flatnonzero(allowed)\nexact = allowed_ids[np.argsort(\n    -(queries @ vectors[allowed].T), axis=1)[:, :3]]\n_, found = index.search(queries, candidates)\nfiltered = [[i for i in row if allowed[i]][:3] for row in found]</code></pre><h3>합성 벡터 실제 HNSW · 허용 비율 1%</h3><table class=\"vs\"><tr><th>확인 항목</th><th>결과</th></tr><tr><td>후보 3</td><td>반환 0.05개 / recall 0.0167</td></tr><tr><td>후보 30</td><td>반환 0.6개 / recall 0.2</td></tr><tr><td>후보 300</td><td>반환 2.5개 / recall 0.6833</td></tr></table><div class=\"try\"><span class=\"lbl\">직접 해 보기 · C</span><p><code>rag-study/course/a2_scale.py</code>에서 작은 입력의 원리를 확인해요. 실행 위치는 <code>labs/rag-study</code>예요.</p><p>reports/ann.json에서 selectivity=0.1의 후보 30과 300을 비교해요. 반환 수가 3이어도 recall이 1보다 작을 수 있는 이유를 원본 정확 검색과 대조해요.</p></div>",
  "lab": "LIMIT k는 검색 과정에서 항상 k개를 확보한다는 뜻이 아니에요.",
  "quiz": {
    "q": "필터 후 세 문서를 채웠는데 정확 top3 중 하나를 놓쳤어요. 상태는?",
    "options": [
      "세 개이므로 정확 검색과 같아요",
      "권한 위반이 발생했다는 뜻이에요",
      "개수 목표는 충족했지만 recall은 부족해요"
    ],
    "answer": 2,
    "explain": "결과 수, 권한 적합성, 정답 회수율은 각각 별도 조건이에요."
  },
  scene(api) { COURSE.scene(api, {
  "label": "2.3 · AX 심화편",
  "nodes": [
    "전역 후보",
    "권한 필터",
    "결과 부족",
    "예산 안 추가 탐색"
  ],
  "mode": "loop"
}); }
};
