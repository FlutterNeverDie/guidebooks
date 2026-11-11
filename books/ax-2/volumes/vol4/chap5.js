export default {
  "title": "지연과 비용은 단계별로 기록해요",
  "tag": "병목 가설 검증",
  "lead": "사용자가 느끼는 느림은 평균 지연 하나로 드러나지 않아요. 재검색, 캐시 실패, 긴 문맥이 어떤 요청에서 발생했는지 연결해야 해요.",
  "body": "<h3>하나의 요청을 단계로 나눠요</h3><p>request_id 아래 검색·재정렬·생성·후처리 span을 남겨요. 캐시 적중 여부, 후보 수, 입력·출력 토큰 수, 모델·색인 버전도 함께 기록해요. 원문 질문과 비밀값은 기본 로그에 넣지 않아요. 비용은 확인된 사용량과 해당 시점 단가를 별도로 결합해 계산해요.</p><h3>분포와 실패율을 같이 봐요</h3><p>p95는 정렬한 지연 중 지정한 분위 위치의 값이에요. 작은 표본에서는 계산 방식에 따라 값이 달라지므로 정의를 고정해요. 실습은 nearest-rank를 사용한 합성 지연이에요. 평균 29ms만 보면 최대 300ms 요청을 놓쳐요. 동시성·콜드 캐시·재시도 조건을 통제해 실제 측정을 추가해요.</p><h3>느린 단계를 trace로 좁혀요</h3><p>pipeline의 trace는 authorize·retrieve·pack·generate·parse·validate를 기록해요. 실제 로컬 실행의 retrieve와 generate 시간은 reports/retrieval.json의 live_pipeline에 있어요. 오류가 나도 시작한 단계의 시간은 finally에서 기록해 원인을 좁혀요.</p><p>캐시 hit는 generate를 생략하지만 retrieve는 다시 실행해요. 따라서 전체 지연 감소가 생성 시간과 연관되는지 읽을 수 있어요. 단일 실행 trace를 p95라고 부르지 않아요. 아래 합성 분포는 평균과 nearest-rank p95 계산을 배우기 위한 별도 데이터예요. 토큰 비용은 이 어댑터가 제공하지 않으므로 시간에서 비용을 추정하지 않아요.</p><h3>핵심 코드 · 실행 파일에서 발췌·축약</h3><pre style=\"white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.7;font-size:12px;padding:12px;border:1px solid var(--line);border-radius:8px;background:var(--soft)\"><code style=\"background:none;border:0;padding:0;white-space:inherit\">for stage in result[&quot;trace&quot;]:\n    print(stage[&quot;stage&quot;], stage[&quot;ms&quot;])\n# pack에는 candidates, selected, characters도 있어요.\n# 요청 원문 대신 단계와 개수 위주로 운영 로그를 만들어요.</code></pre><h3>작은 입력으로 실행한 계약 결과</h3><table class=\"vs\"><tr><th>확인 항목</th><th>결과</th></tr><tr><td>합성 지연 평균 ms</td><td>29</td></tr><tr><td>nearest-rank p95 ms</td><td>100</td></tr><tr><td>최대 ms</td><td>300</td></tr></table><div class=\"try\"><span class=\"lbl\">직접 해 보기 · E</span><p><code>rag-study/course/m4_operations.py</code>에서 작은 입력의 원리를 확인해요. 실행 위치는 <code>labs/rag-study</code>예요.</p><p>정상 요청과 캐시 요청 trace를 나란히 놓고 생략된 단계를 표시해요. 실제 시간은 재실행마다 달라져도 계약 검사는 통과해야 해요.</p></div>",
  "lab": "느린 SQL을 추적하듯 최종 요청에서 가장 큰 지연 항목까지 내려갈 수 있어야 해요.",
  "quiz": {
    "q": "첫 요청이 느렸는데 모델 초기화가 포함돼 있어요. 이 한 건을 무엇으로 쓸 수 있나요?",
    "options": [
      "해당 실행의 단계별 원인 분석",
      "운영 서비스 p95 확정값",
      "모든 요청의 평균 비용"
    ],
    "answer": 0,
    "explain": "분포 통계에는 같은 조건의 여러 표본이 필요해요. 첫 실행의 초기화도 분리해요."
  },
  scene(api) { COURSE.scene(api, {
  "label": "4.5 · AX 중급편",
  "nodes": [
    "요청 trace",
    "단계별 span",
    "분위수 + 실패율",
    "병목 가설 검증"
  ],
  "mode": "flow"
}); }
};
