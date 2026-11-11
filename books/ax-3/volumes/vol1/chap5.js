export default {
  "title": "모델 교체는 색인 이행 작업이에요",
  "tag": "전환·롤백",
  "lead": "새 모델의 차원이 같아도 기존 벡터와 섞어서 검색할 수 있다는 뜻은 아니에요. 좌표축의 의미가 바뀌면 거리가 비교 가능한 공간이 아니에요.",
  "body": "<h3>임베딩 규약을 버전으로 묶어요</h3><p>모델 체크포인트, 토크나이저, 풀링, 정규화, 질의·문서 접두어, 차원을 색인 manifest에 넣어요. 질의 인코더는 해당 색인과 짝이 맞아야 해요. 차원 검사는 필요한 조건이지만 충분한 조건이 아니에요.</p><h3>새 공간을 병렬로 검증해요</h3><p>새 모델로 전체 문서를 다시 임베딩해 별도 색인을 만들어요. 같은 질문을 두 경로로 실행해 품질과 지연을 비교한 뒤 활성 포인터를 전환해요. 답변 캐시도 모델·색인 버전으로 분리하고 이전 버전을 보존해 롤백해요. 훈련 코드 완료와 서비스 교체 완료를 같은 일로 보지 않아요.</p><h3>같은 차원이어도 같은 공간은 아니에요</h3><p>실제 학습 전후 인코더로 23×384 문서 행렬 두 개를 만들었어요. 차원은 같지만 좌표가 바뀌었어요. index_migration.py는 각 버전의 질문 인코더와 문서 행렬을 묶고 같은 질문을 두 묶음에 보내요.</p><p>“회의실은 언제부터 잡을 수 있어?”의 v1 top3는 [h1-2,h6-1,h1-3], v2는 [h6-1,h1-2,h6-2]였어요. 활성 버전을 v2로 바꾼 뒤에도 진행 중 A는 v1을 읽고 새 B는 v2를 읽어요. 롤백 뒤 새 요청은 v1 순위를 되찾았어요. 한 질문의 개선이 전체 품질 향상이라는 뜻은 아니에요.</p><h3>핵심 코드 · 실행 파일에서 발췌·축약</h3><pre style=\"white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.7;font-size:12px;padding:12px;border:1px solid var(--line);border-radius:8px;background:var(--soft)\"><code style=\"background:none;border:0;padding:0;white-space:inherit\">bundle = bundles[request_version]\nscores = bundle[&quot;matrix&quot;] @ bundle[&quot;query&quot;]\n# v2 질문 벡터와 v1 문서 행렬을 섞지 않아요.\n# 재임베딩한 .npy와 모델 파일은 .cache/에만 저장해요.</code></pre><h3>실제 모델별 재임베딩 · 로컬 색인 전환</h3><table class=\"vs\"><tr><th>확인 항목</th><th>결과</th></tr><tr><td>행렬 크기</td><td>23 × 384</td></tr><tr><td>v1 top3</td><td>[&quot;h1-2&quot;, &quot;h6-1&quot;, &quot;h1-3&quot;]</td></tr><tr><td>v2 top3</td><td>[&quot;h6-1&quot;, &quot;h1-2&quot;, &quot;h6-2&quot;]</td></tr><tr><td>롤백 top3</td><td>[&quot;h1-2&quot;, &quot;h6-1&quot;, &quot;h1-3&quot;]</td></tr></table><div class=\"try\"><span class=\"lbl\">직접 해 보기 · E</span><p><code>rag-study/course/a1_embeddings.py</code>에서 작은 입력의 원리를 확인해요. 실행 위치는 <code>labs/rag-study</code>예요.</p><p>reports/migration.json을 읽고 during_switch와 after_rollback을 비교해요. 색인 ID에 모델·문서·설정 버전을 함께 기록할 방법을 설계해요.</p></div>",
  "lab": "동일한 SQL 타입이라도 단위가 다르면 더할 수 없듯, 같은 차원도 같은 공간을 뜻하지 않아요.",
  "quiz": {
    "q": "새 모델도 384차원이에요. 옛 문서 벡터를 그대로 써도 될까요?",
    "options": [
      "좌표 공간이 달라질 수 있어 재임베딩하고 비교해요",
      "차원만 같으면 의미도 같아요",
      "문서 ID를 바꾸면 벡터가 자동 변환돼요"
    ],
    "answer": 0,
    "explain": "차원은 배열 크기이고 각 축의 의미까지 같다는 보장은 없어요."
  },
  scene(api) { COURSE.detail(api, {"kind": "timeline", "title": "모델과 색인을 함께 전환해요"}); }
};
