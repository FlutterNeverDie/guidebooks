BOOKS.push({
  no: 4,
  series: "AX 실무편",
  kicker: "EVALUATION AND OPERATIONS",
  title: "평가와 운영",
  subtitle: "실수를 눈으로 볼 수 있으면 다행이에요.<br>이 권은 숫자를 잘못 읽거나, 운영하다 쌓이는 실수예요.",
  color: {"accent": "#6d4ac2", "ink": "#4b2f8f", "soft": "#efe9fb"},
  coverTag: "숫자를 잘못 읽는 실수",
  recapTag: "4권에서 본 것",

  coverScene(api) {
    PR.volCover(api, [["질문 몇 개로 좋아졌다고 판단", "정답 세트 전체로 재요"], ["평균만 봄", "질문 종류별로 나눠 봐요"], ["튜닝한 질문으로 발표", "고를 때 안 쓴 질문으로 재요"], ["고친 문서의 옛 조각이 남음", "문서 단위로 지우고 넣어요"], ["재 보지 않고 최적화", "내 환경에서 먼저 재요"]]);
  },
