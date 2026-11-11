# rag-study

가이드북 「AX 개발자 첫걸음」(https://flutterneverdie.github.io/guidebooks/ax/, 로컬은 저장소 루트의 `dist/ax/index.html`)의 실습 코드다. 이 폴더에서 실행한다. 숫자는 이 맥(Apple M2)에서 돌린 결과이고, 기기마다 다르다. 단계마다 파일 하나이고 `uv run <파일>`로 돈다.

| 파일 | 가이드북 | API 키 | 하는 일 |
|---|---|---|---|
| `step1_tool_use.py` | 1권 2장 | 필요 | 모델이 검색 도구를 직접 부르는 tool use 루프 |
| `step2_vector_search.py` | 1권 2장, 2권 4장 | 없음 | numpy 코사인 검색과 Chroma 비교, 키워드 검색이 놓치는 질문 |
| `step3_chunking.py` | 2권 2~5장 | 없음 | 자르는 방법 다섯 가지 비교, 겹침, 입력 한도, 3차원 좌표, 부정과 숫자, 모델 정보 |
| `step4_ann_index.py` | 3권 1~3장 | 없음 | 무작위 벡터 20만 개로 전부 비교, HNSW, IVF, PQ의 속도·recall·메모리 비교 (색인 만드는 데 1분쯤) |
| `step5_hybrid_rerank.py` | 3권 4장 | 없음 | BM25(띄어쓰기, 두 글자), 벡터, RRF, 재정렬 비교. 처음에 재정렬 모델(약 0.57GB)을 받는다 |
| `step6_eval.py` | 4권 1~3, 5장 | 없음 | 정답 세트 평가, 단계별 지연, 재정렬 후보 수, 답 없는 질문, 숫자 근거 검사 |
| `step7_ontology.py` | 5권 | 없음 | 조직도 문장으로 온톨로지·지식 그래프 만들기, 제약 검사, 여러 단계 질문, 벡터와 비교, GraphRAG |

## 실무편 실습 (`practice/`)
가이드북 「AX 실무편」(`/ax-practice/`)의 실습이다. 실수를 재현하고 고친 방식과 숫자로 비교한다. 이 폴더(`labs/rag-study`)에서 `uv run practice/p1_data.py`처럼 돌린다.

| 파일 | 실무편 | LLM | 하는 일 |
|---|---|---|---|
| `practice/p1_data.py` | 1권 | 없음 | 머리말, 표, 옛 버전, 입력 한도, 중복 |
| `practice/p2_search.py` | 2권 | C만 | 모델 불일치, 정규화, 이어지는 질문, 사후 필터, 한국어 토큰 |
| `practice/p3_generation.py` | 3권 | 있음 | 넣는 조각 수, 출처, '없음' 처리, 숨은 지시와 가짜 사실, 조건 누락 |
| `practice/p4_eval_ops.py` | 4권 | 없음 | 몇 개로 판단, 평균만 보기, 평가 누수, 옛 조각, 재 보지 않은 최적화 |
| `practice/p5_system.py` | 5권 | 없음 | 프롬프트로만 막기, 로그 속 비밀값, 느린 정규식, 출력 검증, 턴 제한 |

LLM은 이 맥의 `claude -p`(`practice/llm.py`, 모델 haiku)로만 부른다. API 키 방식은 없다. `CI`나 `GITHUB_ACTIONS` 환경이면 부르지 않고 멈춘다. 결과는 `practice/.cache`에 남아(git에는 올리지 않음) 두 번째부터는 부르지 않는다.

## 중급·심화편 실습 (`course/`)
중급편(`/ax-2/`)과 심화편(`/ax-3/`) 실습은 [course/README.md](course/README.md)에 있어요. 각각 5권 x 5장이고, 파일별 A~E가 장에 대응해요. `python3 course/run_all.py`로 표준 라이브러리만 사용하는 50개 항목을 검사해요. 합성 입력·설계 모형의 결과와 실제 모델·서비스 성능은 구분해요. `pipeline.py`의 공통 요청 경로와 실제 로컬 검색·재정렬·HyDE·인코더 학습·pgvector 실행 기록을 함께 제공해요. 실행 조건과 한계는 course README와 reports에 있어요. 실제 생성은 기존 로컬 Claude 래퍼만 사용해요.

## 데이터 파일
- `data/docs.json`: 짧은 가짜 규정 8개 (1~2단계)
- `data/handbook.md`: 긴 가짜 직원 안내서, `## 제목`으로 절이 나뉜다 (3단계부터)
- `data/eval.json`: handbook.md 검색 정답 세트. 답 있는 질문 22개, 답 없는 질문 5개 (6단계)
- `data/org.md`: 가짜 조직도 문장. 일부러 틀린 사실 한 줄이 들어 있다 (7단계)

## 처음 한 번
```bash
uv sync
```
임베딩 모델(`paraphrase-multilingual-MiniLM-L12-v2`, 약 0.22GB)은 처음 실행할 때 한 번 내려받는다.
