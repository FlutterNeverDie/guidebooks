"""실무편 실습 공통 도구: 데이터 읽기, 임베딩, 검색, 지표."""

import json
import re
from pathlib import Path

import numpy as np
from fastembed import TextEmbedding

DATA = Path(__file__).resolve().parent.parent / "data"
DOC = (DATA / "handbook.md").read_text()
EVAL = json.loads((DATA / "eval.json").read_text())
MODEL_NAME = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
_models: dict[str, TextEmbedding] = {}


def flat(s: str) -> str:
    return re.sub(r"\s+", " ", s).strip()


def sections() -> list[tuple[str, str]]:
    out = []
    for block in DOC.split("\n## ")[1:]:
        title, _, body = block.partition("\n")
        out.append((title.strip(), body.strip()))
    return out


def paragraphs() -> list[dict]:
    """문단 하나 = 조각 하나. 절 제목은 메타데이터로 따로 둔다."""
    return [{"section": t, "text": flat(p)} for t, b in sections() for p in b.split("\n\n")]


def model(name: str = MODEL_NAME) -> TextEmbedding:
    if name not in _models:
        _models[name] = TextEmbedding(name)
    return _models[name]


def embed(texts: list[str], name: str = MODEL_NAME, normalize: bool = True) -> np.ndarray:
    v = np.array(list(model(name).embed(texts)), dtype="float32")
    return v / np.linalg.norm(v, axis=1, keepdims=True) if normalize else v


def search(vecs: np.ndarray, q: str, k: int = 10, name: str = MODEL_NAME) -> list[int]:
    return list(np.argsort(-(vecs @ embed([q], name)[0]))[:k])


def rank_of(texts: list[str], order: list[int], key: str) -> int | None:
    for r, i in enumerate(order, 1):
        if key in texts[i]:
            return r
    return None


def metrics(ranks: list[int | None]) -> str:
    n = len(ranks)
    h1 = sum(r == 1 for r in ranks) / n
    h3 = sum(r is not None and r <= 3 for r in ranks) / n
    mrr = float(np.mean([1 / r if r else 0 for r in ranks]))
    return f"hit@1 {h1:.2f}  hit@3 {h3:.2f}  MRR {mrr:.2f}"


def run_eval(texts: list[str], vecs: np.ndarray, items=None) -> list[int | None]:
    items = items or EVAL["answerable"]
    return [rank_of(texts, search(vecs, x["q"]), x["key"]) for x in items]
