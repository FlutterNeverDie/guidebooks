export default {
  "title": "체크포인트와 부작용을 분리해요",
  "tag": "멱등 실행",
  "lead": "상태를 저장했다고 모든 외부 작업이 정확히 한 번 실행되는 것은 아니에요. 저장 전후의 장애가 어떤 작업을 다시 실행할지 따져야 해요.",
  "body": "<h3>프로세스를 끝낸 뒤 새로 시작해 봐요</h3><p>체크포인트는 중단 후 이어 갈 상태를 저장한 기록이에요. 같은 함수에서 파일을 읽었다 쓰는 것만으로는 프로세스 복구를 시험했다고 하기 어려워요. recovery.experiment는 별도 Python 프로세스를 실행하고 검색 저장 직전 또는 직후에 종료 코드 75로 끝낸 뒤 새 프로세스를 띄워요.</p><p>저장 전에 끝내면 새 프로세스가 검색을 다시 해서 총 검색 호출은 2회예요. 저장 뒤에 끝내면 저장된 generate 상태에서 이어 가 총 1회예요. 두 경우 모두 실제 공통 생성·검증 경로를 거쳐 answer로 끝났어요. 호출 횟수는 두 프로세스가 남긴 파일 기록으로 셌어요.</p><p>이 예제는 읽기 전용 검색을 다시 해도 외부 부작용이 없는 조건이에요. 결제나 전송을 넣으면 체크포인트와 외부 효과 사이에 틈이 생겨요. 복구 자체가 중복 효과 방지를 보장하지 않으므로 멱등 키·DB 트랜잭션·outbox 같은 별도 경계를 설계해야 해요.</p><p>임시 파일을 쓴 뒤 rename으로 교체하지만 전원 장애 내구성을 검증한 것은 아니에요. schema=1을 검사하고 문서 버전도 저장해요. 현재 권한·원문이 달라졌다면 복구한 조각을 그대로 답에 쓰지 않도록 pipeline이 다시 대조해요.</p><h3>핵심 코드 · 실행 파일에서 발췌·축약</h3><pre style=\"white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.7;font-size:12px;padding:12px;border:1px solid var(--line);border-radius:8px;background:var(--soft)\"><code style=\"background:none;border:0;padding:0;white-space:inherit\">temporary.write_text(json.dumps(state))\ntemporary.replace(checkpoint)\nif fail == &quot;after-save&quot;:\n    return 75\n# 부모 프로세스가 종료를 확인한 뒤 새 Python을 실행해요.\nsubprocess.run(command, check=True)</code></pre><h3>새 Python 프로세스 두 번으로 복구</h3><table class=\"vs\"><tr><th>확인 항목</th><th>결과</th></tr><tr><td>저장 전 종료: 검색 횟수</td><td>2</td></tr><tr><td>저장 후 종료: 검색 횟수</td><td>1</td></tr><tr><td>복구 후 상태</td><td>둘 다 answer</td></tr></table><div class=\"try\"><span class=\"lbl\">직접 해 보기 · D</span><p><code>rag-study/course/m5_agent.py</code>에서 작은 입력의 원리를 확인해요. 실행 위치는 <code>labs/rag-study</code>예요.</p><p>python3 course/recovery.py로 두 실패 지점을 비교해요. 첫 프로세스 종료 코드와 재시작 코드, 검색 호출 횟수를 함께 확인해요.</p></div>",
  "lab": "체크포인트는 실행 위치의 기록이고, 부작용 중복 방지는 별도의 트랜잭션 문제예요.",
  "quiz": {
    "q": "검색 결과를 저장하기 직전에 프로세스가 끝났어요. 복구 시 검색이 두 번 실행된 것은?",
    "options": [
      "읽기 전용 재시도로 허용할 수 있어요",
      "체크포인트가 외부 효과까지 한 번만 보장해요",
      "어떤 작업도 재실행하면 안 돼요"
    ],
    "answer": 0,
    "explain": "이 실습은 검색의 재실행 비용을 보여 줘요. 쓰기 부작용의 중복 보장은 별도로 설계해요."
  },
  scene(api) { COURSE.detail(api, {"kind": "recovery", "title": "프로세스 종료와 복구"}); }
};
