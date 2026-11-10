"""실무편 2권: 임베딩과 검색에서 자주 하는 실수.

실행 (rag-study 폴더에서):
    uv run practice/p2_search.py

A. 색인과 질문에 다른 임베딩 모델을 쓴다 (차원이 같으면 오류도 안 난다)
B. 정규화하지 않은 벡터로 내적한다
C. 대화 중 이어지는 질문("그럼 해외는?")을 그대로 검색한다   <- 이 부분만 로컬 claude -p를 부른다
D. 상위 k개를 뽑은 뒤에 조건으로 거른다 (사후 필터)
E. 한국어를 띄어쓰기로 잘라 키워드 검색한다
"""

import re

import numpy as np
from rank_bm25 import BM25Okapi

import llm
from common import EVAL, embed, metrics, paragraphs, rank_of, run_eval, search

P = paragraphs()
TEXTS = [p["text"] for p in P]
ITEMS = EVAL["answerable"]


def part_a() -> None:
    print("=== A. 색인과 질문의 모델이 다르면 ===")
    other = "sentence-transformers/all-MiniLM-L6-v2"  # 같은 384차원, 영어 모델
    v = embed(TEXTS)
    same = run_eval(TEXTS, v)
    mixed = [rank_of(TEXTS, list(np.argsort(-(v @ embed([x["q"]], other)[0]))[:10]), x["key"]) for x in ITEMS]
    print(f"   색인·질문 같은 모델        {metrics(same)}")
    print(f"   질문만 다른 모델(384차원) {metrics(mixed)}")
    print("   차원이 같아서 오류 없이 돌아요. 숫자만 조용히 무너져요")


def part_b() -> None:
    print("\n=== B. 정규화하지 않고 내적하면 ===")
    raw = embed(TEXTS, normalize=False)
    n = np.linalg.norm(raw, axis=1)
    print(f"   이 모델의 벡터 길이: {n.min():.2f}~{n.max():.2f} (1로 맞춰져 있지 않아요)")
    dot = [rank_of(TEXTS, list(np.argsort(-(raw @ embed([x["q"]], normalize=False)[0]))[:10]), x["key"]) for x in ITEMS]
    print(f"   내적(정규화 안 함)  {metrics(dot)}")
    print(f"   코사인(정규화)      {metrics(run_eval(TEXTS, embed(TEXTS)))}")
    long_ = int(np.argmax(n))
    print(f"   가장 긴 벡터: {TEXTS[long_][:28]}… (길이 {n[long_]:.2f}). 내적에서는 뜻과 상관없이 길이만큼 점수가 커져요")


CONVERSATIONS = [
    ("국내 출장 숙박비 한도 얼마야?", "그럼 해외는?", "해외 1박 200달러"),
    ("재택 근무 며칠까지 돼?", "그건 누구한테 말해?", "팀장에게 메신저로"),
    ("노트북 잃어버리면 어떻게 해?", "새 거 받으려면?", "분실 신고 접수증"),
]
REWRITE = ("너는 검색어를 만드는 도구다. 앞 질문과 이어지는 질문을 보고, 앞 대화를 몰라도 뜻이 통하는 "
           "검색용 질문 한 문장만 출력한다. 설명, 따옴표, 머리말은 쓰지 않는다.")


def part_c() -> None:
    print("\n=== C. 이어지는 질문을 그대로 검색하면 (로컬 claude -p 사용) ===")
    v = embed(TEXTS)
    for prev, follow, key in CONVERSATIONS:
        res = llm.ask(REWRITE, f"앞 질문: {prev}\n이어지는 질문: {follow}")
        rew = res["text"].splitlines()[0]
        print(f"   대화: '{prev}' -> '{follow}'")
        for name, q in [("그대로", follow), ("앞 질문 붙이기", f"{prev} {follow}"), ("LLM이 바꿔 씀", rew)]:
            r = rank_of(TEXTS, search(v, q), key)
            print(f"      {name:<10} {f'{r}위' if r else '10위 밖':>6}   {q}")
        print(f"      (바꿔 쓰기 {res['seconds']}초{', 캐시' if res['cached'] else ''})")


def part_d() -> None:
    print("\n=== D. 뽑고 나서 거르면 (사후 필터) ===")
    v = embed(TEXTS)
    q, want, k = "비용은 어떻게 처리해?", "3. 출장", 3
    post = [i for i in search(v, q, k) if P[i]["section"] == want]
    pool = [i for i, p in enumerate(P) if p["section"] == want]
    pre = [pool[i] for i in search(v[pool], q, k)]
    print(f"   Q: '{q}' 조건: 절 = '{want}', k = {k}")
    print(f"   사후 필터: 상위 {k}개 중 조건에 맞는 것 {len(post)}개")
    print(f"   사전 필터: 조건에 맞는 {len(pool)}개 안에서 {len(pre)}개")
    for i in pre:
        print(f"      {P[i]['text'][:34]}…")


def part_e() -> None:
    print("\n=== E. 한국어를 띄어쓰기로 잘라 키워드 검색하면 ===")
    words = lambda s: re.findall(r"\w+", s.lower())
    def bigrams(s):
        out = []
        for w in words(s):
            out += [w] if len(w) < 2 else [w[i:i + 2] for i in range(len(w) - 1)]
        return out
    for name, tok in [("띄어쓰기", words), ("두 글자씩", bigrams)]:
        bm = BM25Okapi([tok(t) for t in TEXTS])
        ranks = [rank_of(TEXTS, list(np.argsort(-bm.get_scores(tok(x["q"]))))[:10], x["key"]) for x in ITEMS]
        print(f"   {name:<6} {metrics(ranks)}")
    print(f"   '휴가를' 띄어쓰기: {words('휴가를 넘겨')}  두 글자: {bigrams('휴가를 넘겨')}")


if __name__ == "__main__":
    part_a()
    part_b()
    part_c()
    part_d()
    part_e()
