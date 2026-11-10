BOOKS.push({
  no: 3,
  series: "AX 실무편",
  kicker: "GENERATION AND PROMPTS",
  title: "생성과 프롬프트",
  subtitle: "맞는 조각을 찾아도 답을 만드는 단계에서 또 틀려요.<br>이 권은 이 맥의 claude -p(haiku)를 실제로 불러 재현했어요.",
  color: {"accent": "#6d4ac2", "ink": "#4b2f8f", "soft": "#efe9fb"},
  coverTag: "찾은 다음에 틀리는 것들",
  recapTag: "3권에서 본 것",

  coverScene(api) {
    PR.volCover(api, [["넣는 조각 수를 감으로 정함", "정답 세트로 k를 정해요"], ["출처를 받지 않음", "[c3]처럼 번호를 달게 해요"], ["'없으면 없다고'를 안 넣음", "정해진 문구로 답하게 해요"], ["사실인 척하는 가짜 문서", "누가 색인 문서를 고치나가 방어선"], ["짧게만 답하라고 함", "숫자, 기한, 절차를 빠짐없이"]]);
  },
