# AX 중급·심화편 실습

중급편 `books/ax-2`, 심화편 `books/ax-3`의 실행 자료예요. `m1`~`m5`, `a1`~`a5`의 A~E가 각 권의 1~5장에 대응해요. 가상 규정과 합성 데이터만 사용해요. 원고 정본은 각 책의 JS이며 실무편 비공개 생성기와 무관해요.

## 기본 실행

저장소 루트에서 Python 3.12 이상으로 실행해요. 표준 라이브러리만 필요하며 모델·네트워크·DB 서버를 사용하지 않아요. SQLite 연결 두 개의 동시 실행과 별도 Python 프로세스 복구 실험은 포함돼요.

```bash
python3 labs/rag-study/course/run_all.py
python3 labs/rag-study/course/test_contracts.py
npm test
```

`run_all.py`는 50개 절의 기본 출력을 `results.json`과 비교해요. 개별 `run()`에는 정해진 결과를 강제하는 assertion을 두지 않아 입력을 바꿔 관찰할 수 있어요. 별도 계약 검사는 응답·인용·권한·캐시·CI 차단·복구·동시 갱신 등을 확인해요. `npm test`는 전체 책 빌드와 두 검사를 실행해요. Pages 워크플로도 Python 3.12 환경에서 같은 명령을 실행한 뒤 빌드 결과만 업로드하도록 구성했어요. 실제 모델은 CI에서 실행하지 않아요.

이후 명령의 실행 위치는 `labs/rag-study`예요.

```bash
python3 course/m1_generation.py --budget 20
python3 course/a2_scale.py --candidates 1
python3 course/a3_graph.py --include-old
python3 course/pipeline.py --scenarios
python3 course/pipeline.py --operations
python3 course/recovery.py
python3 course/concurrency.py
```

각 변형은 빈 문맥, 후보 누락, 소유 관계 충돌을 출력해요. 부모 문맥은 정수 position으로 복원하고, 반환된 인용 목록은 캐시와 분리해요. m5의 dispatch는 명시한 경비 규정 집계만 지원하며 다른 집계 질문은 clarify로 반환해요. `pipeline.py`는 handbook 규정의 권한 → 검색 → 포장 → 생성 → 파싱 → 검증 → 캐시 반환 경로예요. 기본 생성기는 첫 근거를 복사하는 fixture예요. `--scenarios`는 정상·캐시·JSON 오류·위조 인용·자료 없음·예산 부족·반환 전 권한 변경을 실행해요. `--operations`는 SQLite 갱신·삭제와 진행 중 요청의 snapshot을 같은 경로에서 비교해요. 두 시나리오 모드는 고정된 오프라인 어댑터를 사용해요.

## 권별 대응

| 권 | 작은 실습 | 실제 연결·추가 실험 |
|---|---|---|
| 중급 1 생성 계약 | `m1_generation.py` | `pipeline.py`: 포장·인용·보류·캐시, `consume`: 완료·취소 이벤트 |
| 중급 2 검색 | `m2_search.py` | `retrieval.py`, `model_experiments.py`: 실제 임베딩·재정렬·HyDE |
| 중급 3 평가 | `m3_evaluation.py` | 공통 요청 7개로 계산한 게이트, `test_contracts.py` |
| 중급 4 운영 | `m4_operations.py` | `store.py`, `pipeline.py --operations`, `pgvector_lab.sql` |
| 중급 5 상태·복구 | `m5_agent.py` | `dispatch`, `recovery.py`, 최종 `pipeline.py` CLI |
| 심화 1 임베딩 | `a1_embeddings.py` | `ann_experiment.py`, `train_embeddings.py`, `index_migration.py` |
| 심화 2 색인 | `a2_scale.py` | `ann_experiment.py`: 필터 선택도별 실제 HNSW |
| 심화 3 그래프 | `a3_graph.py` | 유효 기간·충돌·경로·집계·범위 요약·다단계 무효화 |
| 심화 4 권한 | `a4_security.py` | 실제 캐시 반환 시 철회, `concurrency.py`의 승인 소비 |
| 심화 5 작업자 | `a5_agents.py` | 실제 자료 조회·실패 주입, 독립 DB 연결의 경쟁 예약 |

## 선택: 로컬 검색·재정렬·Claude

기존 `labs/rag-study` uv 환경을 사용해요. `uv sync`는 모델 실습 의존성을 설치하며 최초 모델 실행은 공개 모델을 내려받을 수 있어요.

```bash
uv sync
uv run course/model_experiments.py --output course/reports/retrieval-local.json
uv run course/ann_experiment.py
uv run course/pipeline.py --semantic --query "연차 신청"
# 아래 두 명령만 실제 LLM을 사용해요.
uv run course/model_experiments.py --live
uv run course/pipeline.py --semantic --live --query "KTX 특실 타도 돼?"
```

LLM은 기존 `practice/llm.py:ask()`의 로컬 `claude -p`만 사용해요. 기존 CI·GitHub Actions 차단과 세션 비저장 옵션을 유지해요. 로컬 로그인·네트워크가 필요하고 구독 사용량이 발생할 수 있어요. 기존 캐시는 `practice/.cache/`에 있고 공개하지 않아요. 브라우저·CI 호출 경로와 API 키는 추가하지 않아요. `m1_generation.py --live`도 같은 공통 파이프라인을 사용해요.

이번 적용에서 실제 실행한 결과는 `reports/retrieval.json`에 있어요. 기존 개발 질문 22개에서 RRF 후보 hit@1은 14/22, 같은 후보의 실제 재정렬 뒤에는 22/22였어요. HyDE 두 사례는 정답 순위가 각각 4→7, 2→1이었어요. 가설에는 원문에 없는 조건과 불필요한 설명도 있으므로 검증된 회사 규정으로 읽지 않아요. 실제 원문만 답변 근거로 사용해요.

`reports/ann.json`은 실제 문서 23개·개발 질문 22개의 정확 검색/ANN 비교와, seed 42 합성 벡터 5,000×64의 필터 후 HNSW 실험을 구분해요. 후자는 질문 20개, M=16, efSearch=64예요. 단일 배치 시간이며 서비스 p95가 아니에요. 스레드 스케줄과 라이브러리에 따라 근사 결과·시간은 달라질 수 있어요.

## 선택: 실제 사전학습 인코더 미세조정

기존 프로젝트와 분리한 Python 3.12 환경으로 실행해요. 모델 파일은 `course/.cache/`에 저장하며 git에서 제외해요. 공개 모델 다운로드 외의 학습·추론은 로컬 CPU에서 해요.

```bash
uv run --no-project --python 3.12 --with 'sentence-transformers==5.7.0' --with 'torch==2.15.0' --with 'transformers==5.22.2' python course/train_embeddings.py
uv run --no-project --python 3.12 --with 'sentence-transformers==5.7.0' --with 'torch==2.15.0' --with 'transformers==5.22.2' python course/index_migration.py
```

고정 seed 42, 배치 4, 학습률 2e-5, 12 step이에요. 문서 그룹 h1~h5의 17쌍을 학습하고 h6~h7의 5쌍을 검증해요. `heldout.json`의 새 문서 6개는 학습·checkpoint 선택에 쓰지 않았어요. 파일 해시·그룹·라이브러리·손실·평가는 `reports/training.json`에 있어요. 시험은 전후 6/6이라 개선을 입증하지 못했어요. 질문과 배치가 작은 교육용 실험이에요.

`index_migration.py`는 저장된 학습 모델이 필요해요. v1/v2 인코더로 각각 문서를 다시 임베딩하고 23×384 NumPy 행렬 두 개를 저장해 병렬 조회·포인터 전환·롤백을 실행해요. `reports/migration.json`은 단일 로컬 프로세스 결과이며 분산 배포 검증이 아니에요.

## 선택: 격리된 PostgreSQL + pgvector

실제 검증에 쓴 이미지는 `pgvector/pgvector:pg17`이며 이미지 digest는 `sha256:7d0a41464797aeb9862dfdc0bbf1526b82cfd324cdd8036df19e3545f4a9ccb8`예요. 호스트 포트를 열지 않고 실습 전용 컨테이너 안에서만 접속해요.

```bash
docker run --detach --rm --name ax-course-pg -e POSTGRES_HOST_AUTH_METHOD=trust pgvector/pgvector:pg17
# 서버 준비를 확인한 뒤 다음 명령을 실행해요.
docker exec ax-course-pg pg_isready -U postgres
docker exec -i ax-course-pg psql -U postgres -X -v ON_ERROR_STOP=1 < course/pgvector_lab.sql
docker stop ax-course-pg
```

기존 PostgreSQL이 있다면 별도의 실습 DB에서 `psql -X -v ON_ERROR_STOP=1 -d ax_course -f course/pgvector_lab.sql`을 실행할 수도 있어요. SQL은 임시 테이블과 ROLLBACK을 사용해요. 네 개의 합성 3차원 벡터에서 alpha v2 두 행이 반환됐어요. 실제 계획은 Seq Scan + Sort였고 HNSW 사용을 검증한 것은 아니에요. 원문 실행 기록은 `reports/pgvector.txt`예요. RLS·ANN 운영 성능·분산 동시성은 별도 검증 대상이에요.

## 실험의 보장 범위

- 글자 예산은 토큰 예산이 아니에요. 스키마·ID 검사는 답의 사실 일치를 보장하지 않아요.
- `common.py`는 작은 어휘 기준선, `pipeline.lexical`은 글자 2개 묶음 기준선이에요. 형태소 분석기는 아니에요.
- `m2`의 고정 HyDE·재정렬 목록은 원리 계산용이에요. 본문의 실제 모델 수치는 별도 `model_experiments.py` 결과예요.
- `m3` bootstrap과 `m4` 지연 분포는 합성 입력이에요. 실제 요청 trace와 섞어 서비스 통계로 쓰지 않아요.
- 이벤트 소비자는 HTTP/SSE 서버가 아니에요. Python 상태·복구 구현은 LangGraph 실행 검증이 아니에요.
- `a1`의 두 가중치 순위기와 별도 사전학습 인코더 학습을 구분해요. 스칼라 양자화는 PQ가 아니고 LRU는 DiskANN·SSD 벤치마크가 아니에요.
- 그래프 요약은 선택한 관계 사실의 나열이에요. Neo4j·Microsoft GraphRAG를 실행하지 않았어요.
- SQLite 승인 소비·예산 차감은 실제 독립 연결로 경쟁을 재현해요. 외부 API 효과까지 정확히 한 번을 보장하지 않아요. 예약 ID·정산·취소·분산 권한 전파는 추가 설계 대상이에요.
- `recovery.py`는 실제 새 프로세스의 저장 전후 실패를 시험해요. 전원 장애 내구성이나 다중 복구자 잠금을 보장하지 않아요.
- 실제 모델 보고서는 기본 CI에서 재생성하지 않아요. 저장된 결과와 조건을 읽고 수동으로 재실행해요.

## 결과와 원고를 고칠 때

```bash
python3 labs/rag-study/course/run_all.py --write-results
npm test
```

명령은 저장소 루트에서 실행해요. 의도한 기본 출력 변경일 때만 snapshot을 갱신하고 해당 책 표도 수정해요. 실제 모델 보고서는 별도 실험의 실행 기록이며 기본 snapshot과 분리해요. 각 책의 `book_cover.js`에 그림 도구가 있어요. 그림·코드 블록·퀴즈는 데스크톱과 모바일에서 확인해요.
