export default {
      title: "모델 출력 형식을 그대로 믿는다",
      tag: "코드 블록에 싸인 JSON은 버리고, found가 'yes'인 JSON은 받아요",
      lead: "모델에게 'JSON 하나만 출력하라'고 해도 가끔 코드 블록 표시를 붙이거나, 앞에 한 줄 설명을 달거나, 필드 타입을 바꿔요. <code>json.loads</code> 한 줄로 받으면 멀쩡한 답을 버리고, 틀린 답은 받아들여요.",
      body: "\n<h3>재현: 모델 출력 여섯 가지</h3>\n<table class=\"vs\">\n  <tr><th>출력</th><th><code>json.loads</code></th><th>꺼내기 + 검증</th></tr>\n  <tr><td>{\"found\": true, \"answer\": \"…\"}</td><td>읽음</td><td>통과</td></tr>\n  <tr><td>```json { … } ```</td><td><span class=\"poor\">오류</span></td><td>통과</td></tr>\n  <tr><td>확인해 보니 이래요. { … }</td><td><span class=\"poor\">오류</span></td><td>통과</td></tr>\n  <tr><td>{\"found\": \"yes\", \"answer\": \"…\"}</td><td><span class=\"poor\">읽음</span></td><td>BAD_OUTPUT</td></tr>\n  <tr><td>{\"found\": true}</td><td><span class=\"poor\">읽음</span></td><td>BAD_OUTPUT</td></tr>\n  <tr><td>답을 찾지 못했어요.</td><td>오류</td><td>BAD_OUTPUT</td></tr>\n</table>\n<h3>ai-native는 이렇게 받아요</h3>\n<ul>\n  <li><code>scripts/extract_json.py</code>: 중앙·워커 출력에서 JSON 하나를 꺼내고, 못 꺼내면 실패해요. 워크플로(<code>agent-task.yml</code>)는 그 실패를 사용량 한도면 <code>MAX_LIMIT</code>, 나머지는 <code>BAD_OUTPUT</code>으로 나눠 기록해요.</li>\n  <li><code>scripts/ask_check.py</code>: 코드 블록 표시를 떼고 첫 JSON을 꺼낸 뒤 <code>found</code>가 참거짓인지, <code>answer</code>가 글인지 확인해요.</li>\n  <li>봇은 결과를 zod 스키마(<code>bot/src/types.ts</code>의 <code>SpecResultSchema</code> 등)로 다시 검증해요.</li>\n  <li>실패 이유를 나눠 두면 Slack에 \"정해진 형식으로 답하지 않았어요\"처럼 사람이 알아들을 말로 알려 줄 수 있어요.</li>\n</ul><div class=\"try\"><span class=\"lbl\">직접 해 보기</span><p><code>rag-study/practice/p5_system.py</code>: D 부분이에요. LLM 없이 돌아요.</p></div>",
      lab: "<b>모델 출력은 외부 API 응답처럼 다뤄요.</b> 남이 만든 API 응답을 검증 없이 쓰지 않듯이, 모델 출력도 꺼내고, 스키마로 검증하고, 실패 이유를 나눠요.",
      quiz: {
        q: "모델이 {\"found\": \"yes\"}처럼 타입이 틀린 JSON을 냈어요. json.loads만 쓰면?",
        options: ["오류가 나서 바로 안다", "그대로 읽혀서 틀린 값이 뒤로 흘러간다", "자동으로 true로 바뀐다"], answer: 1,
        explain: "JSON 문법은 맞아서 읽혀요. 스키마 검증이 없으면 'yes'가 그대로 흘러가요. 꺼낸 뒤 타입까지 검증해야 BAD_OUTPUT으로 막혀요.",
      },
      scene(api) {
        PR.scene(api, {"q": "JSON만 출력하라고 했는데…", "bad": {"label": "json.loads만", "rows": [["```json 블록 → 오류로 버림", 0], ["설명 + JSON → 오류로 버림", 0], ["found: \"yes\" → 그대로 받음", 0]]}, "good": {"label": "꺼내기 + 스키마 검증", "rows": [["코드 블록 떼고 첫 JSON 꺼냄", 1], ["found는 참거짓, answer는 글", 1], ["틀리면 BAD_OUTPUT으로 실패", 1]]}, "metric": {"name": "6가지 출력을 맞게 처리한 수", "bars": [["json.loads", 2, "2개"], ["꺼내기+검증", 6, "6개"]], "max": 6}, "caps": ["모델은 형식을 가끔 바꿔요", "꺼낸 뒤 스키마로 검증해요", "모델 출력은 외부 API 응답처럼 다뤄요"]});
      },
    }
