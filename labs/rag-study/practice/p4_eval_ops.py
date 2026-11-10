"""실무편 4권: 평가와 운영에서 자주 하는 실수. LLM 없이 돈다.

실행 (rag-study 폴더에서):
    uv run practice/p4_eval_ops.py

A. 눈에 띄는 질문 몇 개로 좋아졌다고 판단한다
B. 평균만 보고 질문 종류를 나눠 보지 않는다
C. 튜닝에 쓴 질문으로 성능을 발표한다 (평가 누수)
D. 문서를 고칠 때 옛 조각을 지우지 않는다
E. 남이 좋다던 최적화를 재 보지 않고 넣는다 (예: 묶어서 임베딩)
"""

import random
import re
import time

import chromadb
import numpy as np
from rank_bm25 import BM25Okapi

from common import DOC, EVAL, embed, flat, metrics, model, paragraphs, rank_of, run_eval, search

P = paragraphs()
TEXTS = [p["text"] for p in P]
TITLED = [f"{p['section']} > {p['text']}" for p in P]
ITEMS = EVAL["answerable"]


def part_a() -> None:
    print("=== A. 눈에 띄는 질문 몇 개로 판단하면 ===")
    v0, v1 = embed(TEXTS), embed(TITLED)
    gain = []
    for x in ITEMS:
        i = next(k for k, t in enumerate(TEXTS) if x["key"] in t)
        q = embed([x["q"]])[0]
        gain.append((float(v1[i] @ q - v0[i] @ q), x))
    picked = [x for _, x in sorted(gain, key=lambda g: -g[0])[:3]]
    print("   바꾼 것: 조각 앞에 절 제목 붙이기. 손으로 넣어 본 질문 3개(점수가 가장 오른 것):")
    for x in picked:
        i = next(k for k, t in enumerate(TEXTS) if x["key"] in t)
        q = embed([x["q"]])[0]
        print(f"      {x['q']:<26} 답 조각 점수 {float(v0[i] @ q):.2f} -> {float(v1[i] @ q):.2f}")
    print(f"   이 3개로 재면  전: {metrics(run_eval(TEXTS, v0, picked))}")
    print(f"                  후: {metrics(run_eval(TITLED, v1, picked))}")
    print(f"   정답 세트 22개 전: {metrics(run_eval(TEXTS, v0))}")
    print(f"                  후: {metrics(run_eval(TITLED, v1))}")


def part_b() -> None:
    print("\n=== B. 평균만 보면 ===")
    v = embed(TEXTS)
    def bigrams(s):
        out = []
        for w in re.findall(r"\w+", s.lower()):
            out += [w] if len(w) < 2 else [w[i:i + 2] for i in range(len(w) - 1)]
        return out
    bm = BM25Okapi([bigrams(t) for t in TEXTS])
    meth = {"벡터": lambda q: search(v, q), "BM25": lambda q: list(np.argsort(-bm.get_scores(bigrams(q))))[:10]}
    for kind, label in [(None, "전체 22개"), ("paraphrase", "바꿔 말한 16개"), ("keyword", "단어 그대로 6개")]:
        items = [x for x in ITEMS if kind is None or x["kind"] == kind]
        row = "  ".join(f"{n} {metrics([rank_of(TEXTS, f(x['q']), x['key']) for x in items]).split('  ')[2]}" for n, f in meth.items())
        print(f"   {label:<10} {row}")


def chunk_fixed(size: int, overlap: int) -> list[str]:
    text = flat(DOC)
    return [text[i:i + size] for i in range(0, len(text), size - overlap)]


def mrr(texts, vecs, items) -> float:
    rs = [rank_of(texts, search(vecs, x["q"]), x["key"]) for x in items]
    return float(np.mean([1 / r if r else 0 for r in rs]))


def part_c() -> None:
    print("\n=== C. 튜닝에 쓴 질문으로 발표하면 (평가 누수) ===")
    configs = [(s, o) for s in range(60, 321, 20) for o in (0, 20, 40) if o < s]
    built = {}
    for s, o in configs:
        t = chunk_fixed(s, o)
        built[(s, o)] = (t, embed(t))
    print(f"   후보 설정 {len(configs)}개(고정 길이 60~320자 x 겹침 0/20/40)")
    best = max(configs, key=lambda c: mrr(*built[c], ITEMS))
    print(f"   22개 전부로 고르고 같은 22개로 잰 MRR: {mrr(*built[best], ITEMS):.2f}  (고른 설정 {best})")
    rnd = random.Random(0)
    tune_scores, test_scores = [], []
    for _ in range(5):
        items = ITEMS[:]
        rnd.shuffle(items)
        tune, test = items[:11], items[11:]
        b = max(configs, key=lambda c: mrr(*built[c], tune))
        tune_scores.append(mrr(*built[b], tune)); test_scores.append(mrr(*built[b], test))
    print(f"   반으로 나눠 5번: 고를 때 쓴 반 MRR {np.mean(tune_scores):.2f}, 처음 보는 반 MRR {np.mean(test_scores):.2f}")


def part_d() -> None:
    print("\n=== D. 문서를 고칠 때 옛 조각을 지우지 않으면 ===")
    db = chromadb.Client()
    col = db.create_collection("handbook", metadata={"hnsw:space": "cosine"})
    v = embed(TEXTS)
    col.add(ids=[f"v1-{i}" for i in range(len(P))], documents=TEXTS, embeddings=v.tolist(),
            metadatas=[{"doc_id": "handbook", "version": 1} for _ in P])
    old = next(t for t in TEXTS if t.startswith("쓰지 못한 연차"))
    new = old.replace("최대 5일", "최대 3일")
    q = "올해 남은 휴가 내년에 써도 돼?"
    # 실수: 고친 문서를 새 id로 다시 넣기만 한다
    nt = [new if t == old else t for t in TEXTS]
    col.add(ids=[f"v2-{i}" for i in range(len(nt))], documents=nt, embeddings=embed(nt).tolist(),
            metadatas=[{"doc_id": "handbook", "version": 2} for _ in nt])
    res = col.query(query_embeddings=embed([q]).tolist(), n_results=4)
    print(f"   고친 내용: 이월 '최대 5일' -> '최대 3일'. 새로 넣기만 한 뒤 조각 수 {col.count()}개")
    for doc, meta in zip(res["documents"][0], res["metadatas"][0]):
        print(f"      [v{meta['version']}] {doc[:34]}…")
    # 고치기: 같은 문서의 옛 조각을 먼저 지우고 넣는다
    col.delete(where={"version": 1})
    res = col.query(query_embeddings=embed([q]).tolist(), n_results=2)
    print(f"   문서 단위로 옛 조각을 지운 뒤 조각 수 {col.count()}개")
    for doc, meta in zip(res["documents"][0], res["metadatas"][0]):
        print(f"      [v{meta['version']}] {doc[:34]}…")


def part_e() -> None:
    print("\n=== E. '묶으면 빠르다'를 재 보면 ===")
    texts = [f"{t} ({k})" for k in range(9) for t in TEXTS]
    m = model()
    list(m.embed(texts[:4]))  # 준비 호출
    t0 = time.perf_counter()
    for t in texts:
        list(m.embed([t]))
    one = time.perf_counter() - t0
    t0 = time.perf_counter()
    list(m.embed(texts, batch_size=64))
    batch = time.perf_counter() - t0
    print(f"   조각 {len(texts)}개  하나씩: {one:.2f}초   묶어서(64개씩): {batch:.2f}초   {one / batch:.1f}배")
    print("   이 맥의 로컬 모델에서는 이득이 없었어요. 묶음의 이득은 호출마다 네트워크 왕복이 드는 원격 API에서 커져요")
    print("   '보통 빠르다'를 그대로 넣지 말고 내 환경에서 재요")


if __name__ == "__main__":
    part_a()
    part_b()
    part_c()
    part_d()
    part_e()
