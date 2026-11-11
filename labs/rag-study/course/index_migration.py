"""실제 v1/v2 인코더와 각 문서 행렬을 묶어 병렬 조회·전환·롤백해요."""
import json
from pathlib import Path

from pipeline import handbook
from retrieval import EMBEDDER


def run():
    import numpy as np
    import torch
    from sentence_transformers import SentenceTransformer
    torch.set_num_threads(2)
    folder = Path(__file__).parent
    docs = handbook()
    bundles = {}
    query = "회의실은 언제부터 잡을 수 있어?"
    for label, source in [("v1", EMBEDDER), ("v2", str(folder / ".cache/trained-encoder"))]:
        encoder = SentenceTransformer(source, device="cpu")
        encoder.max_seq_length = 128
        matrix = encoder.encode([d.text for d in docs], normalize_embeddings=True)
        q = encoder.encode([query], normalize_embeddings=True)[0]
        np.save(folder / f".cache/{label}-documents.npy", matrix)
        bundles[label] = {"matrix": matrix, "query": q}

    def lookup(version):
        bundle = bundles[version]
        scores = bundle["matrix"] @ bundle["query"]
        return {"version": version, "top3": [docs[i].id for i in np.argsort(-scores)[:3]]}

    active = "v1"
    request_a = active
    active = "v2"
    request_b = active
    during = [lookup(request_a), lookup(request_b)]
    active = "v1"
    report = {"query": query, "documents": len(docs), "shape": list(bundles["v1"]["matrix"].shape),
              "matrix_max_change": float(np.max(np.abs(bundles["v1"]["matrix"]-bundles["v2"]["matrix"]))),
              "during_switch": during, "after_rollback": lookup(active),
              "scope": "로컬 NumPy 색인 두 개. 분산 서비스의 원자적 배포나 무중단 운영 검증은 아니에요."}
    (folder / "reports/migration.json").write_text(json.dumps(report, ensure_ascii=False, indent=2)+"\n")
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    run()
