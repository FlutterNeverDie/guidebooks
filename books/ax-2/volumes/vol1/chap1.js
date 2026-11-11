export default {
  "title": "검색 결과를 생성 입력으로 포장해요",
  "tag": "구조화된 답",
  "lead": "검색 함수가 조각을 돌려주는 것과 사용자에게 답이 도착하는 것은 달라요. 두 단계 사이에 근거 ID, 입력 예산, 응답 형식을 전달하는 얇은 경계가 필요해요.",
  "body": "<h3>입력 계약부터 정해요</h3><p>요청에는 질문과 서버가 확인한 사용자·테넌트 정보를 넣어요. 검색 결과에는 조각 ID, 문서 버전, 본문을 보존해요. 모델에 본문만 보내면 답의 출처를 다시 찾기 어려워요. 검색기와 생성기를 따로 교체할 수 있도록 이 구조를 먼저 고정해요.</p><h3>문장을 자르기 전에 예산을 나눠요</h3><p>전체 입력 한도에서 시스템 지시, 질문, 대화 이력, 출력 여유를 빼고 근거 예산을 정해요. 조각 경계에서 넣거나 제외하고, 필수 예외 조건을 잘라 버리지 않아요. 실습의 <code>pack()</code>은 ID와 본문의 <b>글자 수</b>를 세요. 실제 모델에서는 해당 토크나이저와 메시지 포장 비용으로 교체해야 해요.</p><h3>같은 질문이 어디까지 도착했는지 따라가요</h3><p>완성할 도구는 가상의 사내 규정에 답하는 CLI예요. “휴가 언제까지 내야 해?”를 입력하면 handbook.md의 h2-2를 찾아요. h2-2는 연차 신청 기한과 급한 병가 예외를 함께 가진 조각이에요. 질문, 근거 ID, 응답, 단계별 trace를 한 결과에서 확인할 수 있어요.</p><p>pack은 조각을 자르지 않고 ID와 본문이 예산 안에 들어가는 것만 골라요. 여기서 예산은 Python 문자열의 글자 수예요. 모델 토큰 수와 같지 않아요. 단일 조각이 예산을 넘으면 이번 구현은 건너뛰므로, 검색 성공 뒤에도 문맥이 비어 보류될 수 있어요.</p><p>run_request의 search와 generator는 교체 가능한 함수예요. 기본 생성기는 첫 근거를 복사하는 추출형 fixture예요. --live는 생성기만 로컬 Claude로 바꾸며, 포장·JSON 해석·인용 검사·권한 재확인은 같은 함수를 지나가요.</p><h3>핵심 코드 · 실행 파일에서 발췌·축약</h3><pre style=\"white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.7;font-size:12px;padding:12px;border:1px solid var(--line);border-radius:8px;background:var(--soft)\"><code style=\"background:none;border:0;padding:0;white-space:inherit\">visible = [d for d in docs if policy.permits(d)]\nhits = search(query, visible)\nselected, used = pack(hits, budget)\nif not selected:\n    return abstain(&quot;no_context&quot;)\nraw = generator(query, selected)\n# 실제 전체 구현: pipeline.py의 run_request</code></pre><h3>작은 입력으로 실행한 계약 결과</h3><table class=\"vs\"><tr><th>확인 항목</th><th>결과</th></tr><tr><td>검색 조각</td><td>1</td></tr><tr><td>포장 조각</td><td>1</td></tr><tr><td>본문+ID 글자</td><td>55</td></tr></table><div class=\"try\"><span class=\"lbl\">직접 해 보기 · A</span><p><code>rag-study/course/m1_generation.py</code>에서 작은 입력의 원리를 확인해요. 실행 위치는 <code>labs/rag-study</code>예요.</p><p>python3 course/m1_generation.py --budget 20을 실행해 포장 조각 0을 확인해요. pipeline.py --scenarios의 “예산 부족”에서는 generate 단계도 없는지 찾아보세요.</p></div>",
  "lab": "컨트롤러가 DTO를 넘기듯, 검색과 생성 사이에도 버전이 있는 계약을 둬요.",
  "quiz": {
    "q": "검색은 성공했는데 포장 예산을 1글자로 줄였어요. 이 요청의 다음 동작은?",
    "options": [
      "검색된 원문을 예산과 무관하게 모두 보내요",
      "ID를 지워 본문만 보내요",
      "빈 문맥으로 생성하지 않고 보류해요"
    ],
    "answer": 2,
    "explain": "포장 결과도 별도로 검사해야 검색 성공을 생성 가능으로 잘못 읽지 않아요."
  },
  scene(api) { COURSE.scene(api, {
  "label": "1.1 · AX 중급편",
  "nodes": [
    "질문 + 권한",
    "검색 + 버전",
    "근거 ID + 예산",
    "구조화된 답"
  ],
  "mode": "flow"
}); }
};
