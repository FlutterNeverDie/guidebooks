"""3단계: 청크 전략에 따라 검색 결과가 어떻게 달라지나. API 키 없이 로컬에서 돈다.

실행:
    uv run step3_chunking.py

배울 것:
    A. 같은 문서, 같은 질문, 같은 모델이어도 자르는 방법만 바꾸면 검색 결과가 달라진다
    B. 고정 길이로 자르면 문장이 중간에 잘린다. 겹침(overlap)이 이걸 줄여 준다
    C. 문단으로 자르고 제목을 붙이면 조각마다 "무슨 이야기인지"가 남는다
    D. 임베딩 모델은 입력 길이 한도가 있다. 넘는 부분은 벡터에 반영되지 않는다
    E. 384차원 벡터를 3차원으로 줄여 보면 비슷한 조각끼리 대략 모인다 (가이드북 2권 4장 그림의 좌표)
    F. 임베딩이 약한 것: 반대 뜻이나 숫자만 다른 문장이, 같은 뜻을 바꿔 말한 문장보다 더 가깝게 나온다
    G. 모델 정보 확인: 차원, 입력 한도, 접두어 필요 여부
"""

import re
from pathlib import Path

import numpy as np
from fastembed import TextEmbedding

DOC = Path(__file__).with_name("data").joinpath("handbook.md").read_text()
model = TextEmbedding("sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")

# (질문, 답이 들어 있는 문구). 질문은 문서 단어를 일부러 피해서 바꿔 말했다
QUESTIONS = [
    ("해외 가면 밥값은 따로 줘?", "일비 50달러"),
    ("비행기 오래 타면 좋은 자리 앉아도 돼?", "프리미엄 이코노미"),
    ("올해 남은 휴가 내년에 써도 돼?", "최대 5일"),
    ("할머니 돌아가시면 며칠 쉬어?", "조부모 사망은 3일"),
    ("노트북 잃어버렸는데 새 거 받으려면 뭐 필요해?", "분실 신고 접수증"),
    ("손님 차는 어디 대?", "손님 전용"),
    ("집에서 일하는 거 며칠 돼?", "주 2회"),
    ("책 사는 돈 회사가 내줘?", "100만 원"),
    ("술 마신 거 경비 처리 얼마까지?", "1인 3만 원"),
    ("개인 카드로 산 거 언제 돌려받아?", "급여일"),
    ("해외에서 호텔 하룻밤 얼마까지 돼?", "해외 1박 200달러"),
    ("출근하고 언제 집에 가도 돼?", "9시간 뒤에 퇴근"),
]


def flat(s: str) -> str:
    return re.sub(r"\s+", " ", s).strip()


def sections() -> list[tuple[str, str]]:
    """'## 제목' 단위로 (제목, 본문)을 돌려준다."""
    out = []
    for block in DOC.split("\n## ")[1:]:
        title, _, body = block.partition("\n")
        out.append((title.strip(), body.strip()))
    return out


# ---------- 자르는 방법 다섯 가지 ----------
def fixed(size: int, overlap: int = 0) -> list[str]:
    """글자 수로 자른다. 문장, 문단 경계를 보지 않는다."""
    text = flat(DOC)
    step = size - overlap
    return [text[i:i + size] for i in range(0, len(text), step) if text[i:i + size].strip()]


def paragraphs(with_title: bool) -> list[str]:
    """빈 줄 기준 문단 하나가 조각 하나. with_title이면 절 제목을 앞에 붙인다."""
    out = []
    for title, body in sections():
        for p in body.split("\n\n"):
            out.append(f"{title} > {flat(p)}" if with_title else flat(p))
    return out


def whole_sections() -> list[str]:
    """절 하나를 통째로 조각 하나로."""
    return [flat(f"{t} {b}") for t, b in sections()]


STRATEGIES = {
    "고정 150자": fixed(150),
    "고정 150자 + 겹침 50": fixed(150, 50),
    "문단": paragraphs(False),
    "문단 + 제목": paragraphs(True),
    "절 통째로": whole_sections(),
}


def unit(v: np.ndarray) -> np.ndarray:
    return v / np.linalg.norm(v, axis=-1, keepdims=True)


def embed(texts: list[str]) -> np.ndarray:
    return unit(np.array(list(model.embed(texts))))


def search(chunks: list[str], vecs: np.ndarray, q: str, k: int = 3) -> list[int]:
    return list(np.argsort(-(vecs @ embed([q])[0]))[:k])


def rank_of_answer(chunks: list[str], top: list[int], key: str) -> int | None:
    """상위 조각 중 답 문구를 통째로 담은 첫 조각의 순위(1부터). 없으면 None."""
    for r, i in enumerate(top, 1):
        if key in chunks[i]:
            return r
    return None


def part_a() -> None:
    print("=== A. 자르는 방법별 검색 결과 (상위 3개 안에 답이 든 조각이 몇 위인가) ===\n")
    results, sent = {}, {}
    for name, chunks in STRATEGIES.items():
        vecs = embed(chunks)
        tops = [search(chunks, vecs, q) for q, _ in QUESTIONS]
        results[name] = [rank_of_answer(chunks, top, key) for top, (_, key) in zip(tops, QUESTIONS)]
        sent[name] = sum(sum(len(chunks[i]) for i in top) for top in tops) / len(tops)
        avg = sum(map(len, chunks)) / len(chunks)
        print(f"{name:<18} 조각 {len(chunks):>3}개, 평균 {avg:>4.0f}자")

    print()
    names = list(STRATEGIES)
    short = ["고정", "고정+겹침", "문단", "문단+제목", "절"]
    print("질문".ljust(28) + "".join(n.rjust(9) for n in short))
    for qi, (q, _) in enumerate(QUESTIONS):
        row = "".join((f"{results[n][qi]}위" if results[n][qi] else "-").rjust(9) for n in names)
        print(q[:24].ljust(28) + row)
    print()
    for n in names:
        top1 = sum(r == 1 for r in results[n])
        top3 = sum(r is not None for r in results[n])
        print(f"{n:<18} 1위 {top1}/{len(QUESTIONS)}, 3위 안 {top3}/{len(QUESTIONS)}, LLM에 넘기는 글 {sent[n]:.0f}자(상위 3개 합)")


def part_b() -> None:
    print("\n=== B. 고정 길이가 답을 반으로 자른 경우 (겹침이 없을 때) ===")
    chunks = STRATEGIES["고정 150자"]
    for _, key in QUESTIONS:
        if any(key in c for c in chunks):
            continue
        for i in range(len(chunks) - 1):
            joined = chunks[i] + chunks[i + 1]
            j = joined.find(key)
            if j != -1:
                cut = len(chunks[i]) - j
                print(f"'{key}' -> 조각 {i} 끝 '...{chunks[i][-12:]}' | 조각 {i + 1} 시작 '{chunks[i + 1][:12]}...'")
                print(f"   앞 조각에 '{key[:cut]}', 뒤 조각에 '{key[cut:]}'로 갈라졌어요. 겹침 50자 버전에서는 한 조각에 같이 들어 있어요:",
                      any(key in c for c in STRATEGIES["고정 150자 + 겹침 50"]))
                break


def part_c() -> None:
    print("\n=== C. 제목이 붙으면 무엇이 달라지나 ===")
    q, key = QUESTIONS[0]
    for name in ["문단", "문단 + 제목"]:
        chunks = STRATEGIES[name]
        vecs = embed(chunks)
        top = np.argsort(-(vecs @ embed([q])[0]))[:2]
        print(f"[{name}] Q: {q}")
        for i in top:
            print(f"   {float(vecs[i] @ embed([q])[0]):.2f}  {chunks[i][:46]}...")


def part_d() -> None:
    print("\n=== D. 모델 입력 한도: 넘는 부분은 벡터에 안 들어간다 ===")
    limit = model.model.tokenizer.truncation["max_length"]
    title, body = sections()[1]
    text = flat(f"{title} {body}")
    n_tok = len(model.model.tokenizer.encode(text).ids)
    print(f"이 모델의 입력 한도: {limit}토큰. '{title}' 절은 {len(text)}자이고, 한도에서 잘린 뒤 토큰 수는 {n_tok}개예요")
    full = embed([text])[0]
    for n in [100, 200, 250, 300]:
        print(f"   앞 {n}자만 넣은 벡터와 절 전체 벡터의 코사인: {float(embed([text[:n]])[0] @ full):.4f}")
    print("   1.0000이 나오는 지점부터 뒤쪽 글은 검색에 쓰이지 않아요. 이 절 뒤쪽의 '이월'과 '경조 휴가'가 그 부분이에요")


def part_e() -> None:
    print("\n=== E. 문단 조각을 3차원으로 줄이기 (PCA) ===")
    chunks = STRATEGIES["문단"]
    vecs = embed(chunks)
    mean = vecs.mean(axis=0)
    _, s, vt = np.linalg.svd(vecs - mean, full_matrices=False)
    keep = (s[:3] ** 2).sum() / (s ** 2).sum()
    print(f"3차원이 담는 정보(분산) 비율: {keep:.0%}. 나머지는 그림에서 사라져요. 그래서 가까움은 원래 384차원에서 재요")
    proj = (vecs - mean) @ vt[:3].T
    for c, p in zip(chunks, proj):
        print(f"   [{p[0]:+.2f}, {p[1]:+.2f}, {p[2]:+.2f}]  {c[:20]}")
    for q in ["할머니 돌아가시면 며칠 쉬어?", "해외 가면 밥값은 따로 줘?", "노트북 잃어버렸는데 새 거 받으려면 뭐 필요해?"]:
        qv = embed([q])[0]
        p = (qv - mean) @ vt[:3].T
        top = np.argsort(-(vecs @ qv))[:3]
        print(f"Q: {q} -> [{p[0]:+.2f}, {p[1]:+.2f}, {p[2]:+.2f}], 가까운 조각 {list(map(int, top))}")


def part_f() -> None:
    print("\n=== F. 임베딩이 약한 것: 부정과 숫자 ===")
    base = "연차는 다음 해로 이월된다"
    for a, b, note in [
        (base, "남은 휴가를 내년에 쓸 수 있다", "같은 뜻, 다른 단어"),
        (base, "연차는 다음 해로 이월되지 않는다", "반대 뜻"),
        ("연차는 최대 5일 이월된다", "연차는 최대 15일 이월된다", "숫자만 다름"),
        (base, "노트북을 잃어버리면 IT팀에 알린다", "관계없는 문장"),
    ]:
        v = embed([a, b])
        print(f"   {float(v[0] @ v[1]):.2f}  {note:<10} {a} | {b}")
    print("   반대 뜻이 같은 뜻보다 가까워요. 임베딩은 '무슨 이야기인가'를 잡고, '맞다/아니다'와 숫자는 잘 못 가려요")


def part_g() -> None:
    print("\n=== G. 모델 정보는 라이브러리 목록에서 확인 ===")
    for m in TextEmbedding.list_supported_models():
        if m["model"] == "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2":
            print(f"   차원 {m['dim']}, 크기 {m['size_in_GB']}GB")
            print(f"   {m['description']}")
    print("   다른 모델도 같은 목록에 있어요. 바꾸면 색인한 조각을 전부 다시 임베딩해야 해요")


if __name__ == "__main__":
    part_a()
    part_b()
    part_c()
    part_d()
    part_e()
    part_f()
    part_g()
