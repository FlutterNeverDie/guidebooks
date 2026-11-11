"""합성 벡터의 필터 후 ANN 손실과 한국어 문서의 실제 임베딩을 구분해 측정해요."""
from importlib.metadata import version
import json
from pathlib import Path
import time


def run():
    import faiss
    import numpy as np
    from pipeline import DATA, handbook
    from retrieval import SemanticSearch
    faiss.omp_set_num_threads(2)
    rng = np.random.default_rng(42)
    vectors = rng.normal(size=(5000, 64)).astype("float32")
    queries = rng.normal(size=(20, 64)).astype("float32")
    faiss.normalize_L2(vectors)
    faiss.normalize_L2(queries)
    index = faiss.IndexHNSWFlat(64, 16, faiss.METRIC_INNER_PRODUCT)
    index.hnsw.efConstruction = 80
    index.add(vectors)
    index.hnsw.efSearch = 64
    rows = []
    for stride in [1, 10, 100]:
        allowed = np.arange(len(vectors)) % stride == 0
        ids = np.flatnonzero(allowed)
        exact = ids[np.argsort(-(queries @ vectors[allowed].T), axis=1)[:, :3]]
        for candidates in [3, 30, 300]:
            t0 = time.perf_counter()
            _, retrieved = index.search(queries, candidates)
            filtered = [[int(i) for i in row if i >= 0 and allowed[i]][:3] for row in retrieved]
            elapsed = (time.perf_counter()-t0)*1000
            rows.append({"selectivity": 1/stride, "candidates": candidates,
                         "mean_returned": round(sum(map(len, filtered))/len(queries), 3),
                         "recall3": round(sum(len(set(a) & set(b))/3 for a,b in zip(exact, filtered))/len(queries), 4),
                         "batch_ms": round(elapsed, 3)})
    docs = handbook()
    search = SemanticSearch()
    matrix = search.embed([d.text for d in docs]).astype("float32")
    cases = json.loads((DATA / "eval.json").read_text())["answerable"]
    q = search.embed([c["q"] for c in cases]).astype("float32")
    exact_ranks = np.argsort(-(q @ matrix.T), axis=1)
    small = faiss.IndexHNSWFlat(matrix.shape[1], 16, faiss.METRIC_INNER_PRODUCT)
    small.hnsw.efSearch = 32
    small.add(matrix)
    _, ann = small.search(q, 3)
    negatives = []
    for case, ranking in zip(cases[:4], exact_ranks[:4]):
        positive = next(d for d in docs if case["key"] in d.text)
        negative = next(docs[i] for i in ranking if docs[i].parent != positive.parent and docs[i].text != positive.text)
        negatives.append({"query": case["q"], "positive_id": positive.id, "positive": positive.text,
                          "negative_id": negative.id, "negative": negative.text,
                          "exclusion": "동일 부모·동일 본문 제외. 남은 후보도 사람이 오답인지 검토해야 해요."})
    report = {"scope": "고정 seed 합성 5000x64, 질문20, HNSW M16 efSearch64, warm 반복 없음. 시간은 이 실행만의 값.",
              "seed": 42, "versions": {x: version(x) for x in ["faiss-cpu", "numpy", "fastembed"]},
              "filtered_ann": rows,
              "handbook": {"documents": len(docs), "questions": len(cases),
                  "exact_hit1": sum(case["key"] in docs[row[0]].text for case,row in zip(cases,exact_ranks)),
                  "ann_hit1": sum(case["key"] in docs[row[0]].text for case,row in zip(cases,ann)),
                  "ann_recall3_against_exact": round(sum(len(set(a[:3]) & set(b))/3 for a,b in zip(exact_ranks,ann))/len(cases),4)},
              "hard_negative_candidates": negatives}
    Path(__file__).with_name("reports").joinpath("ann.json").write_text(json.dumps(report, ensure_ascii=False, indent=2)+"\n")
    return report


if __name__ == "__main__":
    print(json.dumps(run(), ensure_ascii=False, indent=2))
