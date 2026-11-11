export default {
  "title": "작게 찾고 부모 문맥을 복원해요",
  "tag": "문맥 복원",
  "lead": "작은 조각은 질문에 잘 맞지만 예외 조건을 놓칠 수 있어요. 자식 조각으로 찾고 부모 문단을 반환하면 검색 단위와 답변 단위를 다르게 설계할 수 있어요.",
  "body": "<h3>자식에는 부모 식별자를 남겨요</h3><p>각 조각에 parent_id, 문서 버전, 원문 위치를 저장해요. “3일 전”을 찾은 뒤 같은 규정의 “긴급은 당일”을 함께 복원할 수 있어요. 부모가 다른 버전이면 검색한 근거와 반환한 문장이 달라지므로 버전까지 묶어 조회해요.</p><h3>중복과 권한을 다시 처리해요</h3><p>자식 두 개가 같은 부모를 가리키면 부모를 두 번 넣지 않아요. 부모 문서 전체를 볼 권한이 없고 일부 조각만 허용된 경우에는 확장을 제한해야 해요. 부모가 지나치게 길면 주변 문단 창을 사용하고 예산 초과 여부를 다시 확인해요.</p><h3>부모를 가져올 때도 범위를 조인해요</h3><p>“연차 신청”을 작은 조각으로 검색해 h2-2를 찾은 뒤, 같은 h2 부모의 다른 문단을 복원하면 이월·경조 휴가도 함께 볼 수 있어요. 부모는 문맥을 넓히는 단위예요. 복원할 때는 정수 position으로 원문 순서를 지켜요. ID 문자열로 정렬하면 1번 다음에 10번이 와서 문맥이 섞일 수 있어요. 답에 필요한 예외가 다른 문단에 있을 때 도움이 되지만 관련 없는 문장도 예산을 차지해요.</p><p>부모 ID만으로 조회하면 다른 테넌트나 이전 버전의 같은 이름을 섞을 수 있어요. store.parent_text는 tenant·version·parent를 모두 조건으로 써요. 본 실습은 테넌트 단위 권한이며, 부모 안에서도 문단별 권한이 다르면 복원된 각 조각에 추가 검사가 필요해요.</p><h3>핵심 코드 · 실행 파일에서 발췌·축약</h3><pre style=\"white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.7;font-size:12px;padding:12px;border:1px solid var(--line);border-radius:8px;background:var(--soft)\"><code style=\"background:none;border:0;padding:0;white-space:inherit\">SELECT body FROM chunks\nWHERE tenant = ? AND version = ? AND parent = ?\nORDER BY position;\n-- 부모 중복 제거 뒤에도 pack의 예산 검사를 거쳐요.</code></pre><h3>작은 입력으로 실행한 계약 결과</h3><table class=\"vs\"><tr><th>확인 항목</th><th>결과</th></tr><tr><td>검색된 자식</td><td>2</td></tr><tr><td>중복 제거한 부모</td><td>1</td></tr></table><div class=\"try\"><span class=\"lbl\">직접 해 보기 · D</span><p><code>rag-study/course/m2_search.py</code>에서 작은 입력의 원리를 확인해요. 실행 위치는 <code>labs/rag-study</code>예요.</p><p>m2_search.py의 실제 자식 검색 결과와 복원 문맥 길이를 비교해요. store.py에서 beta의 같은 부모가 섞이지 않는지도 확인해요.</p></div>",
  "lab": "검색 인덱스의 작은 레코드로 원본 aggregate를 찾아오되 버전과 권한을 유지해요.",
  "quiz": {
    "q": "alpha의 자식 조각을 찾았고 beta에도 같은 parent ID가 있어요. 부모 복원 조건은?",
    "options": [
      "tenant·version·parent를 함께 묶어요",
      "parent만 같으면 합쳐요",
      "부모 문서가 길수록 모두 넣어요"
    ],
    "answer": 0,
    "explain": "검색 단계의 권한을 지켰더라도 부모 조인에서 범위를 잃으면 다른 자료가 섞여요."
  },
  scene(api) { COURSE.scene(api, {
  "label": "2.4 · AX 중급편",
  "nodes": [
    "자식 조각 검색",
    "부모 ID + 버전",
    "중복·권한 확인",
    "문맥 복원"
  ],
  "mode": "flow"
}); }
};
