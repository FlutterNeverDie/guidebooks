export default {
  "title": "최종 과제: 정상과 보류를 끝까지 연결해요",
  "tag": "로컬 통합 평가",
  "lead": "이제 검색 함수 하나의 정확성보다 요청 전체가 정한 계약대로 끝나는지 확인해요. 정상 답변과 답 없는 질문을 같은 경로로 재현해요.",
  "body": "<h3>하나의 CLI로 성공·보류·오류를 끝까지 실행해요</h3><p>이제 pipeline.py가 완성물이에요. 가상 규정 handbook.md를 읽고 권한 확인, 검색, 포장, 생성, JSON 파싱, 응답 검사, 캐시 반환을 연결해요. --scenarios는 정상·캐시·JSON 오류·위조 인용·자료 없음·예산 부족·반환 전 권한 변경의 일곱 경우를 같은 함수로 실행해요.</p><p>기본 생성기는 근거를 복사하므로 계약 검사에 적합해요. --semantic은 실제 로컬 임베딩·재정렬 검색기로 교체하고 --live는 기존 practice/llm.py를 통한 Claude 생성기로 교체해요. 모델이 바뀌어도 형식·인용·권한 경계는 같아요. CI와 브라우저에서는 실제 모델 호출을 하지 않아요.</p><p>실제 --semantic --live 실행에서는 KTX 일반실 규정을 찾았지만 특실 허용 여부를 단정하지 않는 보류 답을 받았어요. 이것은 단순히 검색 실패라고 분류할 수 없어요. 정답 정책과 원문을 대조하고, 더 넓은 업무 질문으로 평가 세트를 확장해야 해요.</p><p>별도의 --operations는 SQLite 문서 교체·삭제를 같은 run_request에 연결해요. 3일 규정을 2일로 바꾼 새 요청, 이전 snapshot을 유지한 진행 중 요청, 삭제 뒤 보류를 비교해요. 이 완성물은 로컬 교육용 CLI예요. 영속 권한 서비스, 사용자 세션, 스트리밍 서버, 운영 배포를 구현했다고 주장하지 않아요. 이제는 책의 각 부품을 바꿀 때 최종 요청에서 어떤 계약이 깨지는지 확인할 수 있어요.</p><h3>핵심 코드 · 실행 파일에서 발췌·축약</h3><pre style=\"white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.7;font-size:12px;padding:12px;border:1px solid var(--line);border-radius:8px;background:var(--soft)\"><code style=\"background:none;border:0;padding:0;white-space:inherit\">python3 course/pipeline.py --scenarios\npython3 course/pipeline.py --operations\npython3 course/pipeline.py --query &quot;연차 신청&quot;\n# 아래는 로컬에서만 선택 실행해요.\n.venv/bin/python course/pipeline.py --semantic --live \\\n  --query &quot;국내 출장 때 KTX 특실을 타도 돼?&quot;</code></pre><h3>같은 run_request로 실행한 7개 시나리오</h3><table class=\"vs\"><tr><th>확인 항목</th><th>결과</th></tr><tr><td>정상·캐시</td><td>answer</td></tr><tr><td>자료 없음·예산 부족</td><td>abstain</td></tr><tr><td>JSON·인용·권한 변경</td><td>error</td></tr></table><div class=\"try\"><span class=\"lbl\">직접 해 보기 · E</span><p><code>rag-study/course/m5_agent.py</code>에서 작은 입력의 원리를 확인해요. 실행 위치는 <code>labs/rag-study</code>예요.</p><p>하나의 생성기를 정상 JSON 대신 위조 인용을 반환하도록 교체해요. 검색 결과가 같아도 최종 response가 사라지고 error가 되는지 확인해요.</p></div>",
  "lab": "작은 기능을 끝까지 연결한 뒤 같은 경로에 실패 입력을 흘려보내요.",
  "quiz": {
    "q": "기본 생성기와 실제 Claude를 바꿀 때 유지할 계약은?",
    "options": [
      "Claude 출력은 항상 검증 생략",
      "포장·JSON·인용·권한 검사 경로",
      "실제 모델에서는 권한을 프롬프트만으로 판단"
    ],
    "answer": 1,
    "explain": "모델 어댑터는 내용 생성 역할을 맡고 서버의 경계 검사를 대체하지 않아요."
  },
  scene(api) { COURSE.scene(api, {
  "label": "5.5 · AX 중급편",
  "nodes": [
    "요청 계약",
    "검색·생성 경계",
    "실패 경로 검사",
    "로컬 통합 평가"
  ],
  "mode": "flow"
}); }
};
