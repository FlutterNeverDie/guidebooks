"""2단계: 임베딩과 벡터 검색. API 키 없이 로컬에서 돈다.

실행:
    uv run step2_vector_search.py

배울 것:
    A. 임베딩 = 문장을 숫자 벡터로 바꾼 것. 뜻이 비슷하면 벡터가 가깝다
    B. 벡터 검색 = 질문 벡터와 가장 가까운 문서 k개 찾기 (numpy로 직접)
    C. 벡터 DB(Chroma) = B를 저장, 색인, 메타데이터 필터와 함께 대신 해 주는 것
    D. 1단계 키워드 검색이 놓치는 질문을 벡터 검색은 찾는다
"""

import json
from pathlib import Path

import chromadb
import numpy as np
from fastembed import TextEmbedding

DOCS = json.loads(Path(__file__).with_name("data").joinpath("docs.json").read_text())

# 한국어를 다루는 작은 다국어 모델. 처음 실행할 때 한 번 내려받는다
model = TextEmbedding("sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")


def embed(texts: list[str]) -> np.ndarray:
    return np.array(list(model.embed(texts)))


# 문서에 쓰인 단어를 피해서 바꿔 말한 질문들
QUESTIONS = [
    "작년에 못 쓴 휴가 올해로 넘길 수 있어?",      # 정답 leave-2 ("휴가"는 문서에 없다)
    "회사 컴퓨터를 택시에 두고 내렸어",            # 정답 it-2 ("컴퓨터", "택시" 없음)
    "손님 차는 어디에 세워?",                      # 정답 office-2
    "밥값 많이 나오면 뭘 더 적어야 해?",           # 정답 expense-1
]


def part_a_b() -> None:
    print("=== A, B. numpy로 직접 하는 벡터 검색 ===")
    doc_vecs = embed([f"{d['title']}. {d['text']}" for d in DOCS])
    print(f"문서 {len(DOCS)}개 -> 벡터 모양 {doc_vecs.shape} (문서 수 x 차원)\n")

    # 코사인 유사도 = 길이를 1로 맞춘 뒤 내적. 1에 가까울수록 비슷하다
    doc_unit = doc_vecs / np.linalg.norm(doc_vecs, axis=1, keepdims=True)
    for q in QUESTIONS:
        q_vec = embed([q])[0]
        scores = doc_unit @ (q_vec / np.linalg.norm(q_vec))
        top = np.argsort(-scores)[:2]
        ranked = ", ".join(f"{DOCS[i]['id']}({scores[i]:.2f})" for i in top)
        print(f"Q: {q}\n   -> {ranked}")


def part_c() -> None:
    print("\n=== C. 같은 일을 벡터 DB(Chroma)로 ===")
    db = chromadb.Client()  # 메모리 전용. 파일로 남기려면 chromadb.PersistentClient(path="...")
    col = db.create_collection("policy", metadata={"hnsw:space": "cosine"})
    texts = [f"{d['title']}. {d['text']}" for d in DOCS]
    col.add(
        ids=[d["id"] for d in DOCS],
        documents=texts,
        embeddings=embed(texts).tolist(),
        metadatas=[{"category": d["id"].split("-")[0]} for d in DOCS],  # 필터용 메타데이터
    )

    q = QUESTIONS[0]
    res = col.query(query_embeddings=embed([q]).tolist(), n_results=2)
    print(f"Q: {q}\n   -> {res['ids'][0]} (거리 {[round(x, 2) for x in res['distances'][0]]}, 작을수록 가깝다)")

    # 메타데이터 필터: 검색 범위를 먼저 좁히는 것. 실무 RAG 품질에 크게 영향을 준다
    q = "비밀번호 언제 바꿔?"
    res = col.query(query_embeddings=embed([q]).tolist(), n_results=1, where={"category": "it"})
    print(f"Q: {q} (category=it만)\n   -> {res['ids'][0]}")


def part_d() -> None:
    print("\n=== D. 1단계 키워드 검색과 비교 ===")
    for q, word in [(QUESTIONS[0], "휴가"), (QUESTIONS[1], "컴퓨터")]:
        hits = [d["id"] for d in DOCS if word in d["text"] or word in d["title"]]
        print(f"키워드 '{word}' -> {hits or '못 찾음'}   (질문: {q})")


if __name__ == "__main__":
    part_a_b()
    part_c()
    part_d()
