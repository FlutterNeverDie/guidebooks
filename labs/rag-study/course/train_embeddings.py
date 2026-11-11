"""실제 사전학습 인코더 미세조정. 별도 Python 환경에서 수동 실행해요.

uv run --no-project --python 3.12 --with 'sentence-transformers>=5,<6' python course/train_embeddings.py
작은 교육용 코퍼스이며 품질 향상을 보장하지 않아요. 학습 후 문서 벡터도 다시 만들어요.
"""

import hashlib
from importlib.metadata import version
import json
import os
from pathlib import Path
import random
import time

from pipeline import DATA, handbook


def run(steps=12):
    if os.environ.get("CI") or os.environ.get("GITHUB_ACTIONS"):
        raise SystemExit("학습은 로컬 선택 실습이에요.")
    import numpy as np
    import torch
    from sentence_transformers import SentenceTransformer, losses
    torch.manual_seed(42)
    torch.set_num_threads(2)
    random.seed(42)
    docs = handbook()
    questions = json.loads((DATA / "eval.json").read_text())["answerable"]
    train, validation = [], []
    by_id = {d.id: d for d in docs}
    for item in questions:
        positive = next(d for d in docs if item["key"] in d.text)
        (validation if positive.parent in {"h6", "h7"} else train).append((item["q"], positive.id))
    # 새로 작성한 고정 문서 그룹은 학습·설정 선택에 사용하지 않아요.
    test = json.loads(Path(__file__).with_name("heldout.json").read_text())
    test_docs = [row["text"] for row in test]
    test_queries = [row["query"] for row in test]
    model_id = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
    model = SentenceTransformer(model_id, device="cpu")
    model.max_seq_length = 128

    def evaluate(queries, texts, targets):
        model.eval()
        matrix = model.encode(texts, normalize_embeddings=True, show_progress_bar=False)
        q = model.encode(queries, normalize_embeddings=True, show_progress_bar=False)
        ranks = np.argsort(-(q @ matrix.T), axis=1)
        places = [int(np.where(row == target)[0][0])+1 for row, target in zip(ranks, targets)]
        return {"ranks": places, "hit1": sum(r == 1 for r in places), "count": len(places),
                "mrr": round(sum(1/r for r in places)/len(places), 4)}

    before = evaluate(test_queries, test_docs, list(range(len(test))))
    valid_targets = [[d.id for d in docs].index(i) for _, i in validation]
    valid_before = evaluate([q for q,_ in validation], [d.text for d in docs], valid_targets)
    loss_fn = losses.MultipleNegativesRankingLoss(model)
    optimizer = torch.optim.AdamW(model.parameters(), lr=2e-5)
    tracked = next(model.parameters())
    initial = tracked.detach().clone()
    losses_seen = []
    t0 = time.perf_counter()
    for i in range(steps):
        model.train()
        # 같은 조각이 배치에서 다른 질의의 음성이 되지 않게 ID를 중복 제거해요.
        choices = train.copy()
        random.shuffle(choices)
        batch, seen = [], set()
        for query, doc_id in choices:
            if doc_id not in seen:
                batch.append((query, by_id[doc_id].text))
                seen.add(doc_id)
            if len(batch) == 4:
                break
        features = [model.tokenize([pair[j] for pair in batch]) for j in [0, 1]]
        optimizer.zero_grad()
        loss = loss_fn(features, None)
        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
        optimizer.step()
        losses_seen.append(round(float(loss.detach()), 6))
    elapsed = round(time.perf_counter()-t0, 2)
    changed = float((tracked.detach()-initial).abs().max())
    after = evaluate(test_queries, test_docs, list(range(len(test))))
    valid_after = evaluate([q for q,_ in validation], [d.text for d in docs], valid_targets)
    dest = Path(__file__).with_name(".cache") / "trained-encoder"
    model.save(str(dest))
    report = {"scope": f"교육용 소표본. 고정 {steps} step 단일 실행, test로 checkpoint를 고르지 않음.",
              "model": model_id, "steps": steps, "seed": 42, "learning_rate": 2e-5, "device": "cpu", "seconds": elapsed,
              "versions": {x: version(x) for x in ["sentence-transformers", "torch", "transformers"]},
              "manifest": {"train_groups": sorted({by_id[i].parent for _, i in train}),
                           "validation_groups": sorted({by_id[i].parent for _, i in validation}),
                           "test_groups": [d["id"] for d in test],
                           "train_pairs": len(train), "validation_pairs": len(validation),
                           "test_sha256": hashlib.sha256(Path(__file__).with_name("heldout.json").read_bytes()).hexdigest()},
              "batch_losses": losses_seen, "max_embedding_parameter_change": changed,
              "validation_before": valid_before, "validation_after": valid_after,
              "test_before": before, "test_after": after,
              "reembedded_documents": True, "saved_model": "course/.cache/trained-encoder"}
    out = Path(__file__).with_name("reports") / "training.json"
    out.parent.mkdir(exist_ok=True)
    out.write_text(json.dumps(report, ensure_ascii=False, indent=2)+"\n")
    return report


if __name__ == "__main__":
    print(json.dumps(run(), ensure_ascii=False, indent=2))
