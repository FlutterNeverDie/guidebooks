# guidebooks

공부한 것을 펼친 책 모양 HTML로 정리하는 저장소다. 원본은 이 맥에서 관리하고, main에 푸시하면 GitHub Pages(공개)에 올라간다. 새 책은 `books/<id>/`를 더하면 목록과 주소(`/<id>/`)가 자동으로 생긴다.

## 구조

| 경로 | 내용 |
|---|---|
| `engine/core/` | 공통 런타임(넘김, `#pN` 주소, 책장), 장면 도구(`api.js`), 그림 부품(`components.js`), 스타일 |
| `engine/build.js` | `node engine/build.js [책 id...]` 책을 단일 HTML로 묶어 `dist/<책 id>/index.html`에 두고, 책 목록 `dist/index.html`을 만든다. 인자가 없으면 전부 |
| `engine/harness.js` | `node engine/harness.js <책 id>` 필수 필드, 퀴즈, 긴 대시, 표지 문구, 실습 파일 참조 검사. 빌드가 먼저 돌린다 |
| `books/<id>/book.json` | 제목(`title`), 목록 소개(`blurb`), 목록 순서(`order`), 권마다 최소 장 수. 옛 엔진 책은 `legacy`에 자체 빌드 스크립트(첫 인자 = 출력 파일) |
| `books/<id>/book_cover.js` | 표지와 머리글·꼬리말·비유 상자 이름·에필로그 문구(`text`), 진도 저장 키(`storageKey`) |
| `books/<id>/volumes/volN/` | `meta.js`(권 표지), `chap1.js`~(장 하나 = 파일 하나), `recap.js`(정리) |
| `dist/` | 결과물. 직접 고치지 않고 git에도 올리지 않는다 |
| `.github/workflows/pages.yml` | main에 푸시하면 전부 빌드해 GitHub Pages에 올린다. 공개 사이트다 |

## 책

| id | 책 | 독자 | 엔진 |
|---|---|---|---|
| `cesco` | 신서아를 위한 AI 에이전트 업무 사용 입문편 | 이물 분석 연구원, 코드 없음 | 공통 |
| `waiting-room` | 웨이팅룸 코드 읽기 | 서버 처음인 주니어 개발자 | 옛 엔진(`build/engine.html`). 공통 엔진으로 옮기는 일은 따로 한다 |
| `ax` | AX 개발자 첫걸음 | 백엔드 개발자(사용자 본인) | 공통 |

책마다 독자와 형식 규칙이 다르다. 그 책을 고칠 때는 `books/<id>/CLAUDE.md`를 먼저 읽는다.

## 공통 규칙

- 해요체로 쓰고, 긴 대시(—, –) 대신 하이픈을 쓴다. 하네스가 장 파일과 표지를 검사한다.
- 왼쪽은 그림(SVG 애니메이션이나 3D), 오른쪽은 글이다. 장면 글자는 짧은 라벨만 쓴다.
- `engine/`을 고치면 모든 책에 영향이 간다. `npm run build`로 모든 책을 다시 만들고, 바뀐 쪽 글자를 브라우저로 비교한다.
- 책 고유 문구는 런타임에 넣지 않고 `book_cover.js`의 `text`에 둔다.
- 공개 사이트에 올라간다. 비밀값, 접속 주소, 사내에서만 봐야 할 정보를 쓰지 않는다. Artifact에는 올리지 않는다.
- 커밋과 푸시는 사용자가 요청할 때만 한다. 푸시하면 바로 공개된다.
