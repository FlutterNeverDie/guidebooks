"""기존 실습과 같은 모델·RRF를 사용하는 지연 초기화 검색기. import는 모델을 받지 않아요."""

from common import rrf
from pipeline import lexical

EMBEDDER = "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
RERANKER = "BAAI/bge-reranker-v2-m3-int8"


class SemanticSearch:
    def __init__(self, candidates=10, top=3):
        self.candidates, self.top = candidates, top
        self._encoder = self._reranker = None
        self._vectors = {}

    def embed(self, texts):
        import numpy as np
        if self._encoder is None:
            from fastembed import TextEmbedding
            self._encoder = TextEmbedding(EMBEDDER, threads=2)
        vectors = np.array(list(self._encoder.embed(texts)), dtype="float32")
        norms = np.linalg.norm(vectors, axis=1, keepdims=True)
        return vectors / np.maximum(norms, 1e-12)

    def candidates_for(self, query, docs):
        if not docs:
            return []
        import numpy as np
        signature = tuple((d.id, d.text) for d in docs)
        if signature not in self._vectors:
            self._vectors[signature] = self.embed([d.text for d in docs])
        scores = self._vectors[signature] @ self.embed([query])[0]
        vector_ids = [docs[i].id for i in np.argsort(-scores)]
        lexical_ids = [d.id for d in lexical(query, docs, self.candidates)]
        ids = rrf([vector_ids[:self.candidates], lexical_ids])[:self.candidates]
        by_id = {d.id: d for d in docs}
        return [by_id[i] for i in ids]

    def score(self, query, docs):
        if not docs:
            return []
        if self._reranker is None:
            from fastembed.rerank.cross_encoder import TextCrossEncoder
            self._reranker = TextCrossEncoder(RERANKER, threads=2)
        return list(self._reranker.rerank(query, [d.text for d in docs]))

    def __call__(self, query, docs):
        candidates = self.candidates_for(query, docs)
        scores = self.score(query, candidates)
        order = sorted(range(len(scores)), key=lambda i: (-scores[i], candidates[i].id))
        return [candidates[i] for i in order[:self.top]]
