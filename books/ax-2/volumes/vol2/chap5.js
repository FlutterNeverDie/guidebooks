export default {
  "title": "재정렬은 후보 안에서만 순서를 바꿔요",
  "tag": "최종 hit@1",
  "lead": "재정렬기가 아무리 좋아도 검색 단계에서 빠진 문서를 되살릴 수는 없어요. 후보 확보와 최종 순위 개선을 분리해서 측정해야 해요.",
  "body": "<h3>같은 후보를 질문과 함께 다시 읽어요</h3><p>“국내 출장 때 KTX 특실을 타도 돼요?”라는 질문에는 국내 열차·해외 항공·식비 규정이 모두 검색될 수 있어요. 벡터 검색은 문서 벡터를 미리 만들어 두고 질문 벡터와 비교해요. cross-encoder 재정렬기는 후보마다 질문과 본문을 한 쌍으로 넣어 이번 조건에 맞는지 점수화해요.</p><p>실제로 같은 개발 질문 22개를 실행했어요. multilingual-MiniLM 벡터 순위와 어휘 순위를 RRF로 합친 후보 최대 10개를 고정하고, bge-reranker-v2-m3-int8로 순서만 바꿨어요. 1위 정답은 14/22에서 22/22가 됐어요. 이미 개발에 쓰던 질문이라 새로운 문서 일반화 점수는 아니에요.</p><p>보고서에는 후보 ID·본문·점수와 정답의 전후 순위가 있어요. 점수의 절댓값을 정답 확률로 읽지 말고 같은 질문 안의 상대 순위로 읽어요. 후보에 없는 정답은 복구할 수 없으므로 후보 recall과 최종 hit@1을 따로 남겨요.</p><p>첫 질의 시간에는 모델 초기화가 들어가고, 질문마다 처리한 쌍 수도 달라질 수 있어요. 이번 단일 실행의 시간을 서비스 p95로 쓰지 않아요. 캐시·워밍업·동시성 조건을 고정해 반복 측정해야 비용과 품질의 선택이 가능해요.</p><h3>핵심 코드 · 실행 파일에서 발췌·축약</h3><pre style=\"white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.7;font-size:12px;padding:12px;border:1px solid var(--line);border-radius:8px;background:var(--soft)\"><code style=\"background:none;border:0;padding:0;white-space:inherit\">candidates = search.candidates_for(query, docs)\nscores = search.score(query, candidates)\norder = sorted(range(len(scores)),\n    key=lambda i: (-scores[i], candidates[i].id))\nselected = [candidates[i] for i in order[:3]]</code></pre><h3>실제 재정렬 · 기존 개발 질문 22개</h3><table class=\"vs\"><tr><th>확인 항목</th><th>결과</th></tr><tr><td>RRF 후보 1위 정답</td><td>14/22</td></tr><tr><td>같은 후보 재정렬 후</td><td>22/22</td></tr><tr><td>후보 밖 정답 복구</td><td>불가</td></tr></table><div class=\"try\"><span class=\"lbl\">직접 해 보기 · E</span><p><code>rag-study/course/m2_search.py</code>에서 작은 입력의 원리를 확인해요. 실행 위치는 <code>labs/rag-study</code>예요.</p><p>retrieval.json에서 전후 순위가 달라진 질문 하나를 고르세요. retrieval.py의 candidates를 1로 줄이면 재정렬이 바꿀 수 있는 범위가 어떻게 줄어드는지 실행해요.</p></div><p class=\"small\">더 읽기: <a href=\"https://github.com/qdrant/fastembed/blob/main/fastembed/rerank/cross_encoder/text_cross_encoder.py\" target=\"_blank\" rel=\"noopener\">FastEmbed 재정렬 구현</a></p>",
  "lab": "필터 후 정렬과 같아요. 앞에서 버린 행은 정렬 알고리즘이 복구하지 못해요.",
  "quiz": {
    "q": "후보 한 개로 줄였더니 정답이 빠졌어요. 재정렬 모델을 더 크게 바꾸면?",
    "options": [
      "모델이 정답 문서를 새로 검색해요",
      "이번 후보 밖 정답은 복구할 수 없어요",
      "점수를 정규화하면 정답이 생겨요"
    ],
    "answer": 1,
    "explain": "재정렬은 주어진 후보 집합의 순서만 바꾸므로 먼저 후보 회수 단계를 확인해요."
  },
  scene(api) { COURSE.detail(api, {"kind": "ranking", "title": "실제 후보의 순위 변화"}); }
};
