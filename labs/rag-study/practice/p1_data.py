"""실무편 1권: 데이터와 자르기에서 자주 하는 실수. API 키도 LLM도 없이 돈다.

실행 (rag-study 폴더에서):
    uv run practice/p1_data.py

A. 머리말·꼬리말이 모든 조각에 섞인다
B. 표를 그대로 글로 꺼내 칸 관계가 사라진다
C. 옛 규정과 새 규정이 같이 색인돼 있다
D. 조각이 모델 입력 한도를 넘어 뒷부분이 조용히 잘린다
E. 같은 문서가 두 번 색인돼 상위 결과를 중복이 차지한다
"""

import numpy as np

from common import EVAL, MODEL_NAME, embed, metrics, model, paragraphs, run_eval, search, sections, flat

P = paragraphs()
TEXTS = [p["text"] for p in P]


def part_a() -> None:
    print("=== A. 머리말이 모든 조각에 섞이면 ===")
    head = "가나 소프트 직원 안내서 · 대외비 · 무단 배포 금지 | "
    for name, texts in [("깨끗한 조각", TEXTS), ("머리말 섞인 조각", [head + t + " | - 3 -" for t in TEXTS])]:
        v = embed(texts)
        sim = v @ v.T
        avg = (sim.sum() - len(v)) / (len(v) * (len(v) - 1))
        print(f"   {name:<10} 조각끼리 평균 코사인 {avg:.2f}   {metrics(run_eval(texts, v))}")
    print("   모든 조각이 같은 문구를 품으면 서로 닮아져서 구분이 흐려져요")


def part_b() -> None:
    print("\n=== B. 표를 그대로 꺼내면 ===")
    base = [t for t in TEXTS if not t.startswith(("숙박비는", "해외에서는 하루"))]
    raw = "구분 국내 해외 숙박비 10만 원 200달러 일비 - 50달러"
    rows = "출장 숙박비 한도는 국내 1박 10만 원, 해외 1박 200달러다. 해외 출장 일비는 하루 50달러다."
    qs = [("해외에서 호텔 하룻밤 얼마까지 돼?", "200달러"), ("해외 가면 밥값은 따로 줘?", "50달러")]
    for name, chunk in [("표를 그대로", raw), ("행을 문장으로", rows)]:
        texts = base + [chunk]
        v = embed(texts)
        out = []
        for q, key in qs:
            order = search(v, q)
            r = next((k for k, i in enumerate(order, 1) if key in texts[i]), None)
            out.append(f"'{q[:10]}…' {r}위({float(v[-1] @ embed([q])[0]):.2f})")
        print(f"   {name:<8} {'  '.join(out)}")
    print("   괄호는 표 조각과 질문의 코사인. 칸 이름(숙박비, 해외)이 숫자와 떨어지면 뜻이 흐려져요")


def part_c() -> None:
    print("\n=== C. 옛 규정과 새 규정이 같이 있으면 ===")
    old = {"section": "2. 연차와 휴가", "version": 2023,
           "text": "쓰지 못한 연차는 다음 해 6월 30일까지 최대 10일을 넘겨 쓸 수 있다. 6월 30일이 지나면 남은 날은 사라지고 돈으로 바꿔 주지 않는다."}
    docs = [{**p, "version": 2026} for p in P] + [old]
    texts = [d["text"] for d in docs]
    v = embed(texts)
    q = "올해 남은 휴가 내년에 써도 돼?"
    order = search(v, q, 3)
    print(f"   Q: {q}   (옛 2023판은 '6월 30일까지 최대 10일', 지금 2026판은 '3월 31일까지 최대 5일')")
    for r, i in enumerate(order, 1):
        print(f"      {r}위 [{docs[i]['version']}판] {texts[i][:30]}…")
    keep = [i for i, d in enumerate(docs) if d["version"] == 2026]
    order2 = [keep[i] for i in search(v[keep], q, 3)]
    print("   최신판만 남기는 필터를 걸면:")
    for r, i in enumerate(order2, 1):
        print(f"      {r}위 [{docs[i]['version']}판] {texts[i][:30]}…")


def part_d() -> None:
    print("\n=== D. 조각이 모델 입력 한도를 넘으면 ===")
    # 1) 여러 안건이 섞인 긴 조각(회의록 같은 것) 끝에 답이 있으면
    office = [p["text"] for p in P if p["section"].startswith(("6.", "7."))]
    target = next(t for t in TEXTS if t.startswith("경조 휴가"))
    long_chunk = " ".join(office) + " " + target
    rest = [t for t in TEXTS if t not in office and t != target]
    q = "할머니 돌아가시면 며칠 쉬어?"
    for name, texts in [("긴 조각 하나(사무실·교육 안건 + 경조 휴가)", rest + [long_chunk]), ("문단으로 나눔", TEXTS)]:
        v = embed(texts)
        order = search(v, q)
        r = next((k for k, i in enumerate(order, 1) if "조부모" in texts[i]), None)
        print(f"   {name:<26} '{q}' 답 조각 {f'{r}위' if r else '10위 밖'}")
    tok = model().model.tokenizer
    print(f"   경조 휴가 앞의 안건 글: {len(tok.encode(' '.join(office)).ids)}토큰 (한도 {tok.truncation['max_length']})")
    v1, v2 = embed([long_chunk, " ".join(office)])
    print(f"   긴 조각 벡터와 경조 휴가를 뺀 벡터의 코사인: {float(v1 @ v2):.4f}  (1이면 뒷부분이 전혀 반영되지 않은 것)")
    # 2) 절 통째로 자를 때 한도 뒤에 답이 있는 질문
    secs = [flat(f"{t} {b}") for t, b in sections()]
    v_sec = embed(secs)
    v_par = embed(TEXTS)
    hidden = []
    for x in EVAL["answerable"]:
        s = next((s for s in secs if x["key"] in s), None)
        if not s:
            continue
        cut = len(tok.encode(s[: s.index(x["key"])]).ids) >= tok.truncation["max_length"] - 2
        if cut:
            hidden.append(x)
    print(f"   한도 {tok.truncation['max_length']}토큰. 절 통째로 자르면 답이 한도 뒤에 있는 질문: {len(hidden)}개 / {len(EVAL['answerable'])}개")
    for x in hidden:
        print(f"      {x['q']}  (답: {x['key']})")
    print(f"   이 질문들만 재면  절 통째로: {metrics(run_eval(secs, v_sec, hidden))}")
    print(f"                     문단으로:   {metrics(run_eval(TEXTS, v_par, hidden))}")
    print("   여기서는 절 앞부분이 같은 주제라 운 좋게 찾았어요. 답 문장 덕이 아니에요. 주제가 섞이면 위 1)처럼 놓쳐요")


def part_e() -> None:
    print("\n=== E. 같은 문서가 두 번 색인되면 ===")
    dup = [f"[FAQ] {p['text']}" for p in P if p["section"].startswith(("2.", "4."))]
    texts = TEXTS + dup
    v = embed(texts)
    norm = lambda t: t.replace("[FAQ] ", "")
    wasted = 0
    for x in EVAL["answerable"]:
        top = [norm(texts[i]) for i in search(v, x["q"], 3)]
        wasted += 3 - len(set(top))
    total = 3 * len(EVAL["answerable"])
    print(f"   중복 있음: 상위 3칸 {total}칸 중 {wasted}칸이 같은 내용의 사본   {metrics(run_eval(texts, v))}")
    sims = [float(v[i] @ v[TEXTS.index(norm(texts[i]))]) for i in range(len(TEXTS), len(texts))]
    print(f"   사본과 원본의 코사인: {min(sims):.2f}~{max(sims):.2f}. 머리표 하나만 달라도 1이 아니라서 0.95 기준으로는 못 잡아요")
    # 고치기: 머리표 같은 장식을 떼고 글자가 같으면 하나만 남긴다 (색인 전에)
    seen, keep = set(), []
    for i, t in enumerate(texts):
        k = flat(norm(t))
        if k not in seen:
            seen.add(k); keep.append(i)
    kt = [texts[i] for i in keep]
    wasted2 = sum(3 - len({norm(kt[i]) for i in search(v[keep], x["q"], 3)}) for x in EVAL["answerable"])
    print(f"   정규화한 글자로 중복 제거: 조각 {len(texts)}개 -> {len(kt)}개, 사본이 차지한 칸 {wasted2}칸   {metrics(run_eval(kt, v[keep]))}")


if __name__ == "__main__":
    print(f"조각 {len(P)}개(문단), 정답 세트 {len(EVAL['answerable'])}개, 모델 {MODEL_NAME}\n")
    part_a()
    part_b()
    part_c()
    part_d()
    part_e()
