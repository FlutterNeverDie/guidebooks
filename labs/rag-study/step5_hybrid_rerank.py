"""5단계: 키워드 검색(BM25) + 벡터 검색 = 하이브리드, 그리고 재정렬. API 키 없이 로컬에서 돈다.

실행:
    uv run step5_hybrid_rerank.py

배울 것:
    A. BM25는 단어가 겹쳐야 찾는다. 한국어는 조사 때문에 띄어쓰기로 자르면 잘 안 겹친다
    B. 벡터는 뜻으로, BM25는 정확한 단어로 찾는다. 서로 놓치는 질문이 다르다
    C. RRF: 점수 대신 순위로 두 결과를 합친다
    D. 재정렬(cross-encoder): 후보 10개를 질문과 한 쌍씩 다시 읽어 순서를 고친다
"""

import re
from pathlib import Path

import numpy as np
from fastembed import TextEmbedding
from fastembed.rerank.cross_encoder import TextCrossEncoder
from rank_bm25 import BM25Okapi

DOC = Path(__file__).with_name("data").joinpath("handbook.md").read_text()
embedder = TextEmbedding("sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")
# 다국어 재정렬 모델. 처음 실행할 때 한 번 내려받는다(약 0.57GB)
reranker = TextCrossEncoder("BAAI/bge-reranker-v2-m3-int8")


def chunks() -> list[str]:
    """3단계의 '문단 + 제목' 조각. 3위 안에는 다 들어왔지만 1위가 흔들렸던 방식이다."""
    out = []
    for block in DOC.split("\n## ")[1:]:
        title, _, body = block.partition("\n")
        out += [f"{title.strip()} > {re.sub(r'\s+', ' ', p).strip()}" for p in body.strip().split("\n\n")]
    return out


CHUNKS = chunks()

QUESTIONS = [  # 3단계의 12개 + 2단계에서 틀린 1개: 문서 단어를 피해서 바꿔 말한 질문
    ("해외 가면 밥값은 따로 줘?", "일비 50달러"),
    ("비행기 오래 타면 좋은 자리 앉아도 돼?", "프리미엄 이코노미"),
    ("올해 남은 휴가 내년에 써도 돼?", "최대 5일"),
    ("할머니 돌아가시면 며칠 쉬어?", "조부모 사망은 3일"),
    ("노트북 잃어버렸는데 새 거 받으려면 뭐 필요해?", "분실 신고 접수증"),
    ("손님 차는 어디 대?", "손님 전용"),
    ("집에서 일하는 거 며칠 돼?", "주 2회"),
    ("책 사는 돈 회사가 내줘?", "100만 원"),
    ("술 마신 거 경비 처리 얼마까지?", "1인 3만 원"),
    ("개인 카드로 산 거 언제 돌려받아?", "급여일"),
    ("해외에서 호텔 하룻밤 얼마까지 돼?", "해외 1박 200달러"),
    ("출근하고 언제 집에 가도 돼?", "9시간 뒤에 퇴근"),
    ("밥값 많이 나오면 뭘 더 적어야 해?", "함께 먹은 사람"),  # 2단계에서 벡터가 놓친 질문
    # 새로 넣은 4개: 문서에 있는 정확한 단어를 그대로 쓴 질문
    ("USB 꽂아도 돼?", "USB"),
    ("KTX 특실 타도 돼?", "KTX 일반실"),
    ("VPN 비밀번호 주기는?", "90일"),
    ("반반차 쓸 수 있어?", "반반차는 없다"),
]


# ---------- 키워드 검색 ----------
def words(s: str) -> list[str]:
    return re.findall(r"\w+", s.lower())


def bigrams(s: str) -> list[str]:
    """단어마다 두 글자씩 겹쳐 자른다. '휴가를' -> 휴가, 가를. 조사가 붙어도 앞 두 글자는 겹친다."""
    out = []
    for w in words(s):
        out += [w] if len(w) < 2 else [w[i:i + 2] for i in range(len(w) - 1)]
    return out


def bm25_ranker(tokenize):
    bm = BM25Okapi([tokenize(c) for c in CHUNKS])
    return lambda q: list(np.argsort(-bm.get_scores(tokenize(q))))


# ---------- 벡터 검색 ----------
VECS = np.array(list(embedder.embed(CHUNKS)))
VECS /= np.linalg.norm(VECS, axis=1, keepdims=True)


def vector_rank(q: str) -> list[int]:
    v = np.array(list(embedder.embed([q])))[0]
    return list(np.argsort(-(VECS @ (v / np.linalg.norm(v)))))


# ---------- 합치기와 재정렬 ----------
def rrf(*rankings: list[int], k: int = 60) -> list[int]:
    """Reciprocal Rank Fusion: 각 목록에서 r위면 1/(k+r)점. 점수 크기가 다른 검색기를 순위만으로 합친다."""
    score: dict[int, float] = {}
    for ranking in rankings:
        for r, i in enumerate(ranking[:20], 1):
            score[i] = score.get(i, 0) + 1 / (k + r)
    return sorted(score, key=lambda i: -score[i])


def rerank(q: str, cand: list[int], top: int = 10) -> list[int]:
    cand = cand[:top]
    scores = list(reranker.rerank(q, [CHUNKS[i] for i in cand]))
    return [cand[j] for j in np.argsort(-np.array(scores))]


bm25_words = bm25_ranker(words)
bm25_bi = bm25_ranker(bigrams)

METHODS = {
    "BM25 띄어쓰기": bm25_words,
    "BM25 두 글자": bm25_bi,
    "벡터": vector_rank,
    "하이브리드(RRF)": lambda q: rrf(vector_rank(q), bm25_bi(q)),
    "하이브리드+재정렬": lambda q: rerank(q, rrf(vector_rank(q), bm25_bi(q))),
}


def rank_of(order: list[int], key: str) -> int | None:
    for r, i in enumerate(order[:10], 1):
        if key in CHUNKS[i]:
            return r
    return None


def main() -> None:
    print(f"조각 {len(CHUNKS)}개('문단 + 제목'), 질문 {len(QUESTIONS)}개. 표의 숫자 = 답이 든 조각의 순위(10위 밖이면 -)\n")
    print("=== A. 띄어쓰기로 자르면 조사 때문에 단어가 안 겹친다 ===")
    print(f"   '휴가를 넘겨' -> {words('휴가를 넘겨')}  /  두 글자: {bigrams('휴가를 넘겨')}\n")

    res = {n: [rank_of(f(q), key) for q, key in QUESTIONS] for n, f in METHODS.items()}
    short = ["BM25띄", "BM25두", "벡터", "RRF", "재정렬"]
    print("=== B, C, D. 방식별 순위 ===")
    print("질문".ljust(26) + "".join(s.rjust(8) for s in short))
    for qi, (q, _) in enumerate(QUESTIONS):
        if qi == 13:
            print("-- 아래 4개는 문서 단어를 그대로 쓴 질문")
        print(q[:22].ljust(26) + "".join((f"{res[n][qi]}" if res[n][qi] else "-").rjust(8) for n in METHODS))

    print()
    for n, rs in res.items():
        top1 = sum(r == 1 for r in rs)
        top3 = sum(r is not None and r <= 3 for r in rs)
        mrr = np.mean([1 / r if r else 0 for r in rs])
        print(f"{n:<14} 1위 {top1:>2}/{len(rs)}, 3위 안 {top3:>2}/{len(rs)}, MRR {mrr:.2f}")
    print("\nMRR = 답 순위의 역수 평균(1위 1, 2위 0.5, 3위 0.33 ...). 1에 가까울수록 답이 위에 있다")


if __name__ == "__main__":
    main()
