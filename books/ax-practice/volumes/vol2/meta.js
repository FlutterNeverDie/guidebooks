BOOKS.push({
  no: 2,
  series: "AX 실무편",
  kicker: "EMBEDDING AND SEARCH",
  title: "임베딩과 검색",
  subtitle: "조각이 깨끗해도 검색 단계에서 또 조용히 틀려요.<br>오류 없이 숫자만 무너지는 실수 다섯 가지예요.",
  color: {"accent": "#6d4ac2", "ink": "#4b2f8f", "soft": "#efe9fb"},
  coverTag: "오류 없이 무너지는 검색",
  recapTag: "2권에서 본 것",

  coverScene(api) {
    PR.volCover(api, [["색인과 질문에 다른 모델", "같은 모델, 같은 버전을 메타데이터로"], ["정규화 없이 내적", "길이를 1로 맞추거나 코사인으로"], ["이어지는 질문을 그대로 검색", "앞 대화를 넣어 질문을 다시 써요"], ["뽑고 나서 조건으로 거름", "조건을 먼저 걸고 찾아요"], ["한국어를 띄어쓰기로 자름", "형태소나 두 글자 단위로"]]);
  },
