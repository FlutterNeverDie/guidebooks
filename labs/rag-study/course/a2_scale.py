"""심화 2권: 메모리 계산, 스칼라 양자화, 필터, 샤드, 페이지 캐시 모형."""

from collections import OrderedDict

from common import dot, show


def quantize(vector, scale=127):
    # 입력 범위 [-1, 1]을 가정한 스칼라 양자화. PQ가 아니에요.
    return [max(-127, min(127, round(x * scale))) / scale for x in vector]


def cache_misses(pages, capacity):
    cache, misses = OrderedDict(), 0
    for page in pages:
        if page not in cache:
            misses += 1
        else:
            cache.move_to_end(page)
        cache[page] = True
        if len(cache) > capacity:
            cache.popitem(last=False)
    return misses


def run(candidates=2):
    n, dims = 1_000_000, 384
    a = {"가정 벡터 수": n, "float32 원본 MiB": round(n * dims * 4 / 1024**2, 2),
         "int8 원본 MiB": round(n * dims / 1024**2, 2), "그래프·메타데이터 포함": False}

    q = [1, 0]
    vectors = {"a": [0.5001, 0.3], "b": [0.5002, 0.3], "c": [0.2, 0.8]}
    exact = sorted(vectors, key=lambda k: (-dot(q, vectors[k]), k))
    compressed = sorted(vectors, key=lambda k: (-dot(q, quantize(vectors[k])), k))
    reranked = sorted(compressed[:max(0, candidates)], key=lambda k: (-dot(q, vectors[k]), k))
    b = {"원본 1위": exact[0], "양자화 1위": compressed[0], "원본 재점수 1위": reranked[0] if reranked else None, "후보 수": candidates,
         "양자화 값": {k: quantize(v) for k, v in vectors.items()}}

    ranked = [("x1", "beta"), ("x2", "beta"), ("x3", "beta"), ("a1", "alpha"), ("a2", "alpha")]
    post = [d for d, tenant in ranked[:2] if tenant == "alpha"]
    adaptive = []
    visited = 0
    for d, tenant in ranked:
        visited += 1
        if tenant == "alpha":
            adaptive.append(d)
        if len(adaptive) == 2:
            break
    c = {"2개 탐색 후 필터 결과": len(post), "추가 탐색 결과": len(adaptive), "방문 후보": visited}

    shards = [[("a", .99), ("b", .98), ("c", .97)], [("d", .50), ("e", .49), ("f", .48)]]
    global_top = sorted(sum(shards, []), key=lambda x: -x[1])[:3]
    too_few = sorted([s[0] for s in shards], key=lambda x: -x[1])[:3]
    sufficient = sorted(sum([s[:3] for s in shards], []), key=lambda x: -x[1])[:3]
    d = {"전역 top3": [x[0] for x in global_top], "샤드당 1개 수집": [x[0] for x in too_few],
         "샤드당 3개 수집": [x[0] for x in sufficient]}

    pages = [0, 1, 2, 0, 1, 2, 3, 0]
    e = {"LRU 2페이지 miss": cache_misses(pages, 2), "LRU 4페이지 miss": cache_misses(pages, 4),
         "실제 SSD 측정": False}
    return dict(A=a, B=b, C=c, D=d, E=e)


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--candidates", type=int, default=2)
    show(run(parser.parse_args().candidates))
