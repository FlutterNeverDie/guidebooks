"""4단계: 벡터 색인. 전부 비교(정확) vs HNSW, IVF, PQ(근사). API 키 없이 로컬에서 돈다.

실행:
    uv run step4_ann_index.py

배울 것:
    A. 전부 비교는 정확하지만 벡터 수에 비례해 느려진다
    B. HNSW: 그래프를 타고 가까운 쪽으로 이동. ef를 키우면 정확해지고 느려진다
    C. IVF: 공간을 칸으로 나누고 질문 근처 칸 nprobe개만 본다
    D. PQ: 벡터를 압축해 메모리를 크게 줄이고 정확도를 조금 내준다

데이터는 임베딩 모델 대신 무작위로 만든 384차원 벡터다(무리 10,000개 + 잡음).
숫자는 이 맥(Apple M2, 스레드 1개) 기준이고 기기마다 다르다. 볼 것은 경향이다.
"""

import time

import faiss
import numpy as np

faiss.omp_set_num_threads(1)
rng = np.random.default_rng(0)
D, N, NQ, K = 384, 200_000, 200, 10


def unit(x: np.ndarray) -> np.ndarray:
    return (x / np.linalg.norm(x, axis=1, keepdims=True)).astype("float32")


def make_data() -> tuple[np.ndarray, np.ndarray]:
    centers = rng.normal(size=(10_000, D))
    pick = rng.integers(0, 10_000, N + NQ)
    x = unit(centers[pick] + rng.normal(scale=1.0, size=(N + NQ, D)))
    return x[:N], x[N:]


def measure(index, q: np.ndarray) -> tuple[np.ndarray, float]:
    """질문을 하나씩 던져 질문당 평균 시간(ms)을 잰다."""
    out = np.empty((len(q), K), dtype="int64")
    t0 = time.perf_counter()
    for i in range(len(q)):
        _, out[i] = index.search(q[i:i + 1], K)
    return out, (time.perf_counter() - t0) / len(q) * 1000


def recall(found: np.ndarray, truth: np.ndarray) -> float:
    """정답(전부 비교) 상위 10개 중 몇 개를 찾았나."""
    return float(np.mean([len(set(f) & set(t)) / K for f, t in zip(found, truth)]))


def main() -> None:
    xb, xq = make_data()
    print(f"벡터 {N:,}개 x {D}차원, 질문 {NQ}개. 벡터만 {xb.nbytes / 1e6:.0f}MB\n")
    rows = []

    print("=== A. 전부 비교 (정확한 답) ===")
    flat = faiss.IndexFlatIP(D)
    flat.add(xb)
    truth, ms = measure(flat, xq)
    rows.append(("전부 비교", "-", ms, 1.0, D * 4))
    for n in [20_000, 100_000, 200_000]:
        f = faiss.IndexFlatIP(D)
        f.add(xb[:n])
        print(f"   벡터 {n:>7,}개: 질문당 {measure(f, xq)[1]:.2f}ms")

    print("\n=== B. HNSW (M=32) ===")
    t0 = time.perf_counter()
    hnsw = faiss.IndexHNSWFlat(D, 32, faiss.METRIC_INNER_PRODUCT)
    hnsw.hnsw.efConstruction = 40
    hnsw.add(xb)
    print(f"   색인 만드는 데 {time.perf_counter() - t0:.0f}초")
    for ef in [16, 64, 256]:
        hnsw.hnsw.efSearch = ef
        found, ms = measure(hnsw, xq)
        rows.append(("HNSW", f"ef={ef}", ms, recall(found, truth), D * 4 + 32 * 2 * 4))

    print("\n=== C. IVF (칸 1,024개) ===")
    quant = faiss.IndexFlatIP(D)
    ivf = faiss.IndexIVFFlat(quant, D, 1024, faiss.METRIC_INNER_PRODUCT)
    ivf.train(xb[:50_000])
    ivf.add(xb)
    for nprobe in [1, 8, 64]:
        ivf.nprobe = nprobe
        found, ms = measure(ivf, xq)
        rows.append(("IVF", f"nprobe={nprobe}", ms, recall(found, truth), D * 4))

    print("\n=== D. IVF + PQ (벡터 하나를 48바이트로 압축) ===")
    quant2 = faiss.IndexFlatIP(D)
    pq = faiss.IndexIVFPQ(quant2, D, 1024, 48, 8, faiss.METRIC_INNER_PRODUCT)
    pq.train(xb[:50_000])
    pq.add(xb)
    for nprobe in [8, 64]:
        pq.nprobe = nprobe
        found, ms = measure(pq, xq)
        rows.append(("IVF+PQ", f"nprobe={nprobe}", ms, recall(found, truth), 48))

    print("\n=== 정리 ===")
    print(f"{'방식':<10}{'설정':<12}{'질문당':>9}{'recall@10':>11}{'벡터당 메모리':>14}")
    for name, opt, ms, r, b in rows:
        print(f"{name:<10}{opt:<12}{ms:>7.2f}ms{r:>11.2f}{b:>12,}B")
    print("\nrecall@10 = 전부 비교로 구한 진짜 상위 10개 중 찾은 비율. HNSW 메모리는 이웃 연결(대략 M x 2 x 4바이트)을 더한 어림값")


if __name__ == "__main__":
    main()
