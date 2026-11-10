BOOKS.push({
  no: 5,
  series: "AX 실무편",
  kicker: "AGENTS AND SYSTEMS",
  title: "에이전트와 시스템",
  subtitle: "마지막 권은 시스템을 만들 때의 실수예요.<br>ai-native에 실제로 있는 대응을 작은 코드로 재현하며 왜 그렇게 만들었는지 봐요.",
  color: {"accent": "#6d4ac2", "ink": "#4b2f8f", "soft": "#efe9fb"},
  coverTag: "ai-native에서 배운 것",
  recapTag: "5권에서 본 것",

  coverScene(api) {
    PR.volCover(api, [["금지를 프롬프트 문장으로만", "수정 전 훅과 권한으로 막아요"], ["비밀값이 로그와 답에 남음", "도구 로그까지 지우고 가려요"], ["걸러내는 정규식이 느려짐", "긴 입력으로 성능을 시험해요"], ["모델 출력 형식을 그대로 믿음", "꺼낸 뒤 스키마로 검증해요"], ["턴·시간 제한 없이 돌림", "턴, 시간, 재시도 상한을 둬요"]]);
  },
