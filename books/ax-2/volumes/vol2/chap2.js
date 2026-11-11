export default {
  "title": "질문 재작성 결과는 원질문과 합쳐요",
  "tag": "RRF 합류",
  "lead": "“그건 언제까지야?”를 검색어로 바꾸려면 앞 대화의 대상을 복원해야 해요. 재작성은 검색을 돕지만 사용자가 하지 않은 조건을 만들어 낼 수도 있어요.",
  "body": "<h3>보존할 조건을 먼저 뽑아요</h3><p>대상, 기간, 금액, 부정, 지역 같은 제약을 원질문에서 보존해요. 대화에 없는 대상을 확신하면 사용자에게 물어야 해요. 검색용 재작성은 사용자 질문을 대체하는 사실 기록이 아니므로 원질문도 함께 저장해 비교해요.</p><h3>서로 다른 검색 결과를 합쳐요</h3><p>원질문·재작성 질의로 각각 찾은 순위는 RRF로 합칠 수 있어요. 각 목록의 1위부터 <code>1/(c+rank)</code>를 더하므로 서로 다른 점수 범위를 직접 비교하지 않아도 돼요. 같은 목록의 중복 ID는 한 번만 세고 동점 처리도 고정해요.</p><h3>재작성은 원질문과 경쟁하는 후보예요</h3><p>“기차표 돌려받기”를 “출장 교통비 정산”으로 바꾸면 실제 어휘 검색의 목록이 달라져요. B는 두 목록을 출력한 뒤 RRF로 합쳐요. RRF는 점수 크기 대신 각 목록의 순위를 더하는 방법이에요. 상수 k=60인 예제에서 1위와 2위에 나온 문서의 합은 1/61+1/62예요.</p><p>한 문서가 두 목록에서 1·2위, 다른 문서가 2·1위면 합이 같아요. 이 구현은 ID 오름차순으로 동점을 풀어요. 재작성 문장에는 검색 의도가 보태질 수 있지만, 사용자가 말하지 않은 날짜·승인·조건을 새 사실로 답하면 안 돼요.</p><h3>핵심 코드 · 실행 파일에서 발췌·축약</h3><pre style=\"white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.7;font-size:12px;padding:12px;border:1px solid var(--line);border-radius:8px;background:var(--soft)\"><code style=\"background:none;border:0;padding:0;white-space:inherit\">lists = [[d.id for d in lexical(q, handbook())]\n         for q in [&quot;기차표 돌려받기&quot;, &quot;출장 교통비 정산&quot;]]\nmerged = rrf(lists)\nprint(lists, merged)\nprint(1 / 61 + 1 / 62)</code></pre><h3>작은 입력으로 실행한 계약 결과</h3><table class=\"vs\"><tr><th>확인 항목</th><th>결과</th></tr><tr><td>원질문 1위</td><td>travel</td></tr><tr><td>재작성 1위</td><td>leave</td></tr><tr><td>RRF 결과</td><td>[&quot;leave&quot;, &quot;travel&quot;]</td></tr><tr><td>동점 규칙</td><td>ID 오름차순</td></tr><tr><td>실제 어휘 검색 순위</td><td>[[&quot;h3-2&quot;], [&quot;h3-4&quot;, &quot;h3-2&quot;, &quot;h3-3&quot;, &quot;h3-1&quot;]]</td></tr></table><div class=\"try\"><span class=\"lbl\">직접 해 보기 · B</span><p><code>rag-study/course/m2_search.py</code>에서 작은 입력의 원리를 확인해요. 실행 위치는 <code>labs/rag-study</code>예요.</p><p>재작성 질의를 “출장 취소 수수료”로 바꿔요. 원질문 후보를 합치지 않았을 때 놓치는 근거를 확인해요.</p></div>",
  "lab": "기존 경로를 남긴 채 새 경로를 병합하면, 재작성 하나에 모든 결과를 걸지 않아도 돼요.",
  "quiz": {
    "q": "두 검색 목록의 1·2위가 서로 뒤집혀 RRF 합이 같아요. 1위 결정 근거는?",
    "options": [
      "정답일 확률이 더 높은 문서",
      "명시한 ID 동점 규칙",
      "최근에 실행한 검색 목록"
    ],
    "answer": 1,
    "explain": "RRF 자체가 풀지 못하는 동점에는 결정적인 정렬 규칙이 필요해요."
  },
  scene(api) { COURSE.scene(api, {
  "label": "2.2 · AX 중급편",
  "nodes": [
    "원질문",
    "원질문 검색",
    "재작성 후 검색",
    "RRF 합류"
  ],
  "mode": "fork"
}); }
};
