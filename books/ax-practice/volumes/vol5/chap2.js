export default {
      title: "비밀값이 로그와 답에 남는다",
      tag: "내가 쓴 로그는 가렸는데 도구가 쓴 로그에 접속 키가 남아요",
      lead: "비밀값을 코드에 안 쓰는 건 다들 지켜요. 놓치기 쉬운 건 실행 중에 남는 것들이에요. 도구가 스스로 남기는 디버그 로그, 에러 메시지, 모델이 답에 옮겨 적은 주소. 내가 쓴 로그가 아니라서 가릴 생각을 못 해요.",
      body: "\n<h3>재현: 로그 줄에서 비밀값 가리기</h3>\n<table class=\"vs\">\n  <tr><th>원본 (예시 값)</th><th>가린 뒤</th></tr>\n  <tr><td>connecting https://guide.example.com/mcp?key=EXAMPLE…</td><td>connecting https://guide.example.com/mcp?[가림]</td></tr>\n  <tr><td>posting with token xoxb-EXAMPLE…</td><td>posting with token xoxb-[가림]</td></tr>\n  <tr><td>push with ghp_EXAMPLE…</td><td>push with ghp_[가림]</td></tr>\n  <tr><td>답변: 오류 8006은 카드 한도 초과예요</td><td>그대로</td></tr>\n</table>\n<h3>ai-native에 실제로 있는 대응</h3>\n<ul>\n  <li><b>도구 로그 지우기</b>: 질문하기를 돌릴 때 Claude가 MCP 로그에 접속 키가 든 주소를 남겨요. <code>scripts/ask_run.sh</code>는 실행 전과 끝난 뒤(<code>trap</code>) 그 로그 폴더를 지워요. 강제로 끊긴 실행이 남긴 것도 다음 실행 때 지워져요.</li>\n  <li><b>환경 변수에서 빼기</b>: 접속 주소를 환경 변수에서 지우고(<code>env -u</code>) 권한을 좁힌 임시 설정 파일로만 넘겨요.</li>\n  <li><b>OS마다 위치가 달라요</b>: 저장소 규칙에 \"macOS에서는 그 로그가 다른 캐시 폴더에 남으니 시험 뒤 지운다\"고 따로 적혀 있어요.</li>\n  <li><b>나가는 글 가리기</b>: Slack으로 나가는 AI 글은 <code>bot/src/slackSafe.ts</code>의 <code>redact</code>가 토큰·키 모양(<code>SECRETS</code>)과 내부 경로를 가려요.</li>\n</ul><div class=\"try\"><span class=\"lbl\">직접 해 보기</span><p><code>rag-study/practice/p5_system.py</code>: B 부분이에요. LLM 없이 돌아요.</p></div>",
      lab: "<b>비밀값은 '어디에 썼나'가 아니라 '어디에 남나'로 찾아요.</b> 내 코드, 도구 로그, 에러 메시지, 모델 출력, CI 출력까지. 한 번 실행하고 남은 파일을 모두 뒤져 보는 게 가장 확실해요.",
      quiz: {
        q: "코드와 설정 파일에는 비밀값이 없는데도 새는 가장 흔한 곳은?",
        options: ["소스 코드 주석", "도구가 스스로 남기는 로그와 모델 출력", "README"], answer: 1,
        explain: "내가 쓰지 않은 로그는 가릴 생각을 못 해요. ai-native도 MCP 로그에 접속 키가 남아서 실행 전후로 지워요.",
      },
      scene(api) {
        PR.scene(api, {"q": "키는 환경 변수에만 있는데 어디서 샜죠?", "bad": {"label": "내 로그만 가림", "rows": [["앱 로그: [가림] 처리됨", 1], ["MCP 로그: ...mcp?key=EXAMPLE…", 0], ["도구 로그는 안 봄", 0]]}, "good": {"label": "남는 곳을 모두 처리", "rows": [["실행 전후 MCP 로그 폴더 삭제", 1], ["환경 변수에서 빼고 임시 파일로", 1], ["나가는 글은 redact로 가림", 1]]}, "metric": {"name": "로그 속 비밀값 줄 (예시 4줄 중)", "bars": [["원본", 3, "3줄"], ["가린 뒤", 0, "0줄"]], "max": 3}, "caps": ["도구가 남긴 로그에 키가 남아요", "실행 전후로 지우고, 나가는 글은 가려요", "'어디에 썼나'보다 '어디에 남나'"]});
      },
    }
