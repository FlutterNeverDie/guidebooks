export default {
  "title": "손실 계산에서 실제 임베딩 학습으로 이어요",
  "tag": "별도 평가",
  "lead": "파인튜닝 코드를 실행하기 전에 어떤 잘못을 벌점으로 주는지 이해해요. 손실이 내려가는 것과 새로운 질문에서 좋아지는 것은 다를 수 있어요.",
  "body": "<h3>작은 손실 계산에서 실제 인코더 학습으로 이어요</h3><p>양성은 질문에 답하는 문서, 음성은 답하지 못하는 문서예요. 작은 순위기는 양성과 음성의 특징 차이 [1.0,-0.5]에 가중치를 곱해 점수 차이를 만들어요. 처음 [0,0]이던 가중치는 약 [2.626,-1.068]로 바뀌고 첫 샘플의 차이는 약 3.16이 됐어요. 이것은 문장 인코더가 아닌 두 특징의 계산 모형이에요.</p><p>별도 train_embeddings.py는 사전학습 multilingual-MiniLM의 파라미터를 실제로 갱신해요. 한 배치의 질문은 자기 양성 문서와 가까워지고 다른 질문의 문서와는 구별되도록 MultipleNegativesRankingLoss를 써요. 같은 조각 ID가 배치의 음성이 되지 않게 중복 제거하지만, 다른 조각에도 답이 있으면 거짓 음성이 될 수 있어요.</p><p>CPU, seed 42, 배치 4, 학습률 0.00002, 고정 12단계로 실행했어요. 문서 그룹을 나눈 검증 5개의 hit@1은 3/5로 그대로였고 MRR은 0.7667에서 0.8이 됐어요. 새 문서 6개의 시험은 전후 모두 6/6이었어요. 시험이 작고 쉬워 개선을 입증하지 못했으므로 파인튜닝이 더 좋다고 결론 내리지 않아요.</p><p>배치 손실은 매번 다른 배치와 dropout의 영향을 받아 오르내렸어요. 파라미터가 바뀌었다는 사실, 학습 손실이 작아진 사실, 미사용 문서 품질이 좋아진 사실은 따로 확인해야 해요. 학습 후에는 문서 벡터도 다시 만들고 별도 모델 디렉터리에 저장했어요.</p><h3>핵심 코드 · 실행 파일에서 발췌·축약</h3><pre style=\"white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.7;font-size:12px;padding:12px;border:1px solid var(--line);border-radius:8px;background:var(--soft)\"><code style=\"background:none;border:0;padding:0;white-space:inherit\">features = [model.tokenize(questions), model.tokenize(positives)]\noptimizer.zero_grad()\nloss = loss_fn(features, None)\nloss.backward()\ntorch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)\noptimizer.step()\n# 상세 설정과 평가 분리는 train_embeddings.py에 있어요.</code></pre><h3>사전학습 인코더 실제 학습 · 고정 1회 실행</h3><table class=\"vs\"><tr><th>확인 항목</th><th>결과</th></tr><tr><td>학습 단계</td><td>12</td></tr><tr><td>검증 hit@1</td><td>3/5 → 3/5</td></tr><tr><td>검증 MRR</td><td>0.7667 → 0.8</td></tr><tr><td>새 문서 시험 hit@1</td><td>6/6 → 6/6</td></tr></table><div class=\"try\"><span class=\"lbl\">직접 해 보기 · D</span><p><code>rag-study/course/a1_embeddings.py</code>에서 작은 입력의 원리를 확인해요. 실행 위치는 <code>labs/rag-study</code>예요.</p><p>별도 Python 환경에서 train_embeddings.py를 실행하거나 저장된 training.json을 읽어요. batch_losses와 validation_before/after, test_before/after를 세 항목으로 구분해요.</p></div><p class=\"small\">더 읽기: <a href=\"https://www.sbert.net/docs/sentence_transformer/training_overview.html\" target=\"_blank\" rel=\"noopener\">Sentence Transformers 학습 문서</a></p>",
  "lab": "loss 감소는 최적화가 움직였다는 신호예요. 일반화는 별도의 평가로 확인해요.",
  "quiz": {
    "q": "파라미터는 변했고 손실은 낮지만 시험 hit@1이 전후 6/6이에요. 결론은?",
    "options": [
      "손실이 낮으니 모든 새 문서가 개선돼요",
      "시험을 더 쉽게 만들어 차이를 내요",
      "이 시험에서 개선을 입증하지 못했어요"
    ],
    "answer": 2,
    "explain": "학습이 수행됐다는 증거와 일반화 개선의 증거는 달라요. 쉬운 소표본의 천장 효과도 살펴봐요."
  },
  scene(api) { COURSE.detail(api, {"kind": "loss", "title": "학습과 평가를 분리해요"}); }
};
