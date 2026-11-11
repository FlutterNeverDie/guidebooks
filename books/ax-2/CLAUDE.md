# AX 중급편: 끝까지 돌아가는 RAG 만들기

입문편과 실무편을 읽은 백엔드 개발자가 독자예요. 5권 x 5장으로 생성 계약, 검색, 평가, 운영, 상태 기반 RAG를 연결해요.

- 원고의 정본은 `volumes/volN/*.js`예요. 직접 수정해요. 실무편의 비공개 생성기와 무관해요.
- 장마다 설계 문제, 구현 계약, 실패 경로, 실행 결과, 변형 과제, 퀴즈를 넣어요.
- 실습은 `labs/rag-study/course/m1_generation.py`부터 `m5_agent.py`까지예요. A~E가 각 권의 1~5장이에요.
- `python3 labs/rag-study/course/run_all.py`로 50개 항목과 저장된 결과를 확인해요. 실습 결과 변경 시 `results.json`과 본문 표를 함께 갱신해요.
- 기본 실습은 표준 라이브러리만 사용해요. 작은 합성 데이터 결과를 실제 모델·서비스 성능이라고 쓰지 않아요. 글자 예산과 토큰 예산을 구분해요.
- 실제 LLM 호출은 `pipeline.py --live`, `model_experiments.py --live`, `m1_generation.py --live`에서 기존 `practice/llm.py`를 통해서만 가능해요. CI 차단과 로컬 전용 규칙을 유지해요.
- pgvector·LangGraph 문법은 공식 문서로 확인해요. 설치·실행하지 않은 통합을 검증했다고 쓰지 않아요.
- 그림은 360x480의 `COURSE` 장면 도구로 그려요. 그림:글은 1:1.875, 긴 문장은 오른쪽 본문에 둬요.
- 실무편의 실수 설명은 링크로 연결하고, 여기서는 요청·데이터·상태 계약을 발전시켜요.

- 실제 모델·학습·ANN·pgvector 실행 기록은 `course/reports/`에 있어요. 기본 snapshot과 분리하고 재실행 조건과 한계를 본문에도 유지해요.
