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

## 데이터
- `data/docs.json`: 짧은 가짜 규정 8개 (1~2단계)
- `data/handbook.md`: 긴 가짜 직원 안내서, `## 제목`으로 절이 나뉜다 (3단계부터)
- `data/eval.json`: handbook.md 검색 정답 세트. 답 있는 질문 22개, 답 없는 질문 5개 (6단계)
- `data/org.md`: 가짜 조직도 문장. 일부러 틀린 사실 한 줄이 들어 있다 (7단계)

## 처음 한 번
```bash
uv sync
```
임베딩 모델(`paraphrase-multilingual-MiniLM-L12-v2`, 약 0.22GB)은 처음 실행할 때 한 번 내려받는다.
