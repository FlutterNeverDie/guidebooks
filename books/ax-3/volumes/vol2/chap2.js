export default {
  "title": "양자화는 저장량과 순위를 함께 바꿔요",
  "tag": "원본 재점수",
  "lead": "가까운 점수끼리는 작은 반올림 오차만으로도 순위가 뒤집혀요. 압축률만 보고 색인을 고르면 정답이 후보에서 빠질 수 있어요.",
  "body": "<h3>SQ와 PQ의 차이</h3><p>스칼라 양자화는 좌표 값을 제한된 단계로 나타내요. PQ는 벡터를 부분 공간으로 나누고 각 부분을 학습한 코드북의 ID로 표현해요. 실습은 [-1,1] 범위의 단순 스칼라 양자화이며 PQ 학습을 구현한 것이 아니에요.</p><h3>후보를 넓히고 원본으로 재점수화해요</h3><p>실습에서는 가까운 두 점수가 같은 값으로 반올림돼 ID 동점 규칙이 1위를 바꿔요. 압축 검색으로 뽑은 후보를 원본 벡터로 재점수화하면 복구할 수 있어요. 다만 정답이 후보에 없으면 복구할 수 없고, 원본 저장·조회 비용도 추가돼요. 회수율과 후보 수를 함께 측정해요.</p><h3>반올림으로 사라진 차이를 봐요</h3><p>질문 벡터 [1,0]에서 a의 첫 좌표는 0.5001, b는 0.5002예요. 원본은 b를 먼저 뽑아요. scale=127로 반올림하면 둘 다 64/127≈0.503937이 되어 동점이고 ID 규칙으로 a가 앞서요.</p><p>압축 후보를 두 개 가져와 원본 점수를 다시 계산하면 b가 복구돼요. --candidates 1이면 b가 후보 밖이라 a가 그대로 남고, 0이면 결과가 없어요. 이제 실습은 이 변형을 정상 출력해요. 이 코드는 스칼라 양자화이며 부분공간 코드북을 쓰는 PQ 구현은 아니에요.</p><h3>핵심 코드 · 실행 파일에서 발췌·축약</h3><pre style=\"white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.7;font-size:12px;padding:12px;border:1px solid var(--line);border-radius:8px;background:var(--soft)\"><code style=\"background:none;border:0;padding:0;white-space:inherit\">compressed = sorted(vectors,\n    key=lambda k: (-dot(q, quantize(vectors[k])), k))\nreranked = sorted(compressed[:candidates],\n    key=lambda k: (-dot(q, vectors[k]), k))</code></pre><h3>작은 입력으로 실행한 계약 결과</h3><table class=\"vs\"><tr><th>확인 항목</th><th>결과</th></tr><tr><td>원본 1위</td><td>b</td></tr><tr><td>양자화 1위</td><td>a</td></tr><tr><td>원본 재점수 1위</td><td>b</td></tr><tr><td>후보 수</td><td>2</td></tr></table><div class=\"try\"><span class=\"lbl\">직접 해 보기 · B</span><p><code>rag-study/course/a2_scale.py</code>에서 작은 입력의 원리를 확인해요. 실행 위치는 <code>labs/rag-study</code>예요.</p><p>python3 course/a2_scale.py --candidates 1과 기본 실행을 비교해요. b의 원본 값이 아무리 좋아도 후보 밖이면 복구되지 않는 이유를 말해요.</p></div>",
  "lab": "압축 검색은 빠른 후보 선정이고, 원본 재점수화는 별도의 정확도·비용 선택이에요.",
  "quiz": {
    "q": "양자화로 a,b가 동점이고 후보를 a 하나만 남겼어요. 원본 재점수 결과는?",
    "options": [
      "반드시 b가 돌아와요",
      "a가 남아요",
      "원본 벡터 전체를 자동으로 검색해요"
    ],
    "answer": 1,
    "explain": "재점수화는 입력 후보에 대해서만 수행돼요."
  },
  scene(api) { COURSE.detail(api, {"kind": "quantization", "title": "반올림이 순위를 바꿔요"}); }
};
