"""6단계: 숫자로 재기. 정답 세트, 지연 시간, 답이 없는 질문, 근거 검사. API 키 없이 로컬에서 돈다.

실행:
    uv run step6_eval.py

배울 것:
    A. 정답 세트(data/eval.json)로 방식마다 hit@k, MRR을 잰다. 바꿔 말한 질문과 단어를 그대로 쓴 질문을 나눠 본다
    B. 지연 시간을 단계별로 나눠 본다. 어디가 비싼지 알아야 줄일 수 있다
    C. 재정렬 후보 수를 바꾸면 품질과 지연이 같이 움직인다
    D. 답이 없는 질문에도 검색은 무언가를 돌려준다. 점수로 거를 수 있나
    E. 근거 검사: 답에 적힌 숫자가 인용한 조각에 실제로 있는지 코드로 확인한다. 무엇을 못 막는지도 본다
"""

import json
import re
import time
from pathlib import Path

import numpy as np

import step5_hybrid_rerank as h  # 조각, 임베딩, BM25, RRF, 재정렬을 그대로 쓴다

EVAL = json.loads(Path(__file__).with_name("data").joinpath("eval.json").read_text())
ITEMS = EVAL["answerable"]


def rank_of(order: list[int], key: str, depth: int = 10) -> int | None:
    for r, i in enumerate(order[:depth], 1):
        if key in h.CHUNKS[i]:
            return r
    return None


def report(name: str, ranks: list[int | None]) -> str:
    n = len(ranks)
    hit1 = sum(r == 1 for r in ranks) / n
    hit3 = sum(r is not None and r <= 3 for r in ranks) / n
    mrr = float(np.mean([1 / r if r else 0 for r in ranks]))
    return f"{name:<16} hit@1 {hit1:.2f}  hit@3 {hit3:.2f}  MRR {mrr:.2f}"


def part_a() -> None:
    print(f"=== A. 정답 세트 {len(ITEMS)}개로 재기 ===")
    methods = {
        "벡터": h.vector_rank,
        "BM25 두 글자": h.bm25_bi,
        "하이브리드(RRF)": lambda q: h.rrf(h.vector_rank(q), h.bm25_bi(q)),
        "하이브리드+재정렬": lambda q: h.rerank(q, h.rrf(h.vector_rank(q), h.bm25_bi(q))),
    }
    for kind in ["paraphrase", "keyword", None]:
        items = [x for x in ITEMS if kind is None or x["kind"] == kind]
        label = {"paraphrase": "바꿔 말한 질문", "keyword": "문서 단어를 쓴 질문", None: "전체"}[kind]
        print(f"-- {label} {len(items)}개")
        for name, f in methods.items():
            print("   " + report(name, [rank_of(f(x["q"]), x["key"]) for x in items]))


def ms(f, n: int = 5) -> float:
    f()  # 첫 호출(준비)은 빼고 잰다
    t0 = time.perf_counter()
    for _ in range(n):
        f()
    return (time.perf_counter() - t0) / n * 1000


def part_b() -> None:
    print("\n=== B. 질문 하나의 지연 시간 나눠 보기 (이 맥 기준) ===")
    q = ITEMS[0]["q"]
    cand = h.rrf(h.vector_rank(q), h.bm25_bi(q))
    steps = [
        ("질문 임베딩", lambda: list(h.embedder.embed([q]))),
        ("벡터 검색(조각 23개)", lambda: h.VECS @ h.VECS[0]),
        ("BM25", lambda: h.bm25_bi(q)),
        ("재정렬(후보 10개)", lambda: h.rerank(q, cand, 10)),
    ]
    for name, f in steps:
        print(f"   {name:<18} {ms(f):8.2f}ms")
    print("   여기에 LLM이 답을 쓰는 시간이 더해져요. 보통 이게 가장 커요(이 실습은 LLM을 부르지 않아요)")


def part_c() -> None:
    print("\n=== C. 재정렬 후보 수: 품질과 지연 ===")
    for top in [3, 5, 10, 20]:
        ranks, t0 = [], time.perf_counter()
        for x in ITEMS:
            ranks.append(rank_of(h.rerank(x["q"], h.rrf(h.vector_rank(x["q"]), h.bm25_bi(x["q"])), top), x["key"]))
        per = (time.perf_counter() - t0) / len(ITEMS) * 1000
        print(f"   후보 {top:>2}개  " + report("", ranks).strip() + f"  질문당 {per:.0f}ms")


def part_d() -> None:
    print("\n=== D. 답이 없는 질문에도 검색은 결과를 낸다 ===")

    def top_scores(q: str) -> tuple[float, float, str]:
        v = np.array(list(h.embedder.embed([q])))[0]
        cos = h.VECS @ (v / np.linalg.norm(v))
        cand = h.rrf(h.vector_rank(q), h.bm25_bi(q))[:10]
        rr = np.array(list(h.reranker.rerank(q, [h.CHUNKS[i] for i in cand])))
        return float(cos.max()), float(rr.max()), h.CHUNKS[cand[int(rr.argmax())]][:24]

    ans = [top_scores(x["q"]) for x in ITEMS]
    print(f"   답이 있는 질문 {len(ans)}개: 벡터 최고점 {min(a[0] for a in ans):.2f}~{max(a[0] for a in ans):.2f}, "
          f"재정렬 최고점 {min(a[1] for a in ans):.2f}~{max(a[1] for a in ans):.2f}")
    worst = -1e9
    for q in EVAL["unanswerable"]:
        c, r, top = top_scores(q)
        worst = max(worst, r)
        print(f"   [답 없음] {q:<18} 벡터 {c:.2f}  재정렬 {r:+.2f}  1위: {top}")
    below = sum(a[1] <= worst for a in ans)
    print(f"   재정렬 점수 {worst:+.2f}(답 없는 질문 중 최고) 이하로 거르면, 답이 있는 질문 {below}개도 같이 버려져요")
    print("   점수 범위가 겹치면 문턱값 하나로는 못 거른다. 그래서 '자료에 없으면 없다고 답하라'는 지시와 근거 검사를 같이 쓴다")


def part_e() -> None:
    print("\n=== E. 근거 검사: 답의 숫자가 인용한 조각에 있나 ===")
    src = {f"c{i}": c for i, c in enumerate(h.CHUNKS)}

    def check(answer: str) -> list[str]:
        problems = []
        cited = re.findall(r"\[(c\d+)\]", answer)
        if not cited:
            return ["인용이 없음"]
        text = " ".join(src.get(c, "") for c in cited)
        for c in cited:
            if c not in src:
                problems.append(f"없는 조각 {c}")
        for num in re.findall(r"\d[\d,]*\s*(?:일|원|달러|만 원|시간|회|건)", answer):
            if num.replace(" ", "") not in text.replace(" ", ""):
                problems.append(f"'{num}'이 인용한 조각에 없음")
        return problems

    i = next(k for k, c in enumerate(h.CHUNKS) if "경조 휴가" in c)
    for answer in [f"조부모상은 3일 쉴 수 있어요 [c{i}]", f"조부모상은 7일 쉴 수 있어요 [c{i}]", "조부모상은 3일이에요",
                   f"조부모상은 5일 쉴 수 있어요 [c{i}]"]:
        p = check(answer)
        print(f"   {'통과' if not p else '막음'}  {answer}  {p if p else ''}")
    print("   마지막 답은 틀렸는데 통과했어요. 같은 조각에 '본인 결혼은 5일'이 있어서예요")
    print("   코드 검사는 지어낸 숫자와 빠진 인용은 막지만, 조각 안의 다른 숫자를 잘못 고른 건 못 막아요")
    print("   그래서 코드 검사 + LLM 채점 + 사람 표본 검토를 겹쳐 써요")


if __name__ == "__main__":
    part_a()
    part_b()
    part_c()
    part_d()
    part_e()
