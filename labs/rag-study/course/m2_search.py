"""중급 2권 A~E. 작은 검색기와 수작업 질의 확장으로 메커니즘을 확인해요."""

from collections import Counter
from math import log

from common import rrf, show, tokens


def bm25(query, texts, tokenize=tokens, k1=1.2, b=0.75):
    docs = [tokenize(t) for t in texts]
    if not docs:
        return []
    avg = sum(map(len, docs)) / len(docs)
    if not avg:
        return [0.0] * len(docs)
    scores = []
    for terms in docs:
        freq, score = Counter(terms), 0.0
        for term in set(tokenize(query)):
            df = sum(term in d for d in docs)
            idf = log(1 + (len(docs) - df + 0.5) / (df + 0.5))
            tf = freq[term]
            score += idf * tf * (k1 + 1) / (tf + k1 * (1 - b + b * len(terms) / avg))
        scores.append(round(score, 4))
    return scores


def controlled_tokens(text):
    # 실습용 통제 어휘예요. 범용 형태소 분석기라고 부르지 않아요.
    aliases = {"휴가를": "휴가", "휴가는": "휴가", "신청은": "신청"}
    return [aliases.get(t, t) for t in tokens(text)]


def run():
    texts = ["휴가를 신청해요", "출장을 정산해요"]
    plain = bm25("휴가", texts)
    normal = bm25("휴가", texts, controlled_tokens)
    a = {"띄어쓰기 BM25": plain, "통제 어휘 BM25": normal}

    variants = [["travel", "leave"], ["leave", "travel"]]
    merged = rrf(variants)
    b = {"원질문 1위": variants[0][0], "재작성 1위": variants[1][0], "RRF 결과": merged,
         "동점 규칙": "ID 오름차순"}
    from pipeline import lexical, handbook
    actual = [[d.id for d in lexical(q, handbook())] for q in ["기차표 돌려받기", "출장 교통비 정산"]]
    b["실제 어휘 검색 순위"] = actual
    b["실제 RRF 병합"] = rrf(actual)

    # HyDE의 실제 LLM/인코더 대신 미리 쓴 가상 문서와 어휘 점수를 써요.
    corpus = ["국내 출장 영수증 정산", "연차 신청 기한"]
    original = bm25("기차표 돌려받기", corpus)
    hypothetical = bm25("출장 교통비는 영수증으로 정산", corpus)
    c = {"원질문 최고 점수": max(original), "가상 문서 최고 점수": max(hypothetical),
         "가상 문서는 출처인가": False}

    children = [("p1-c1", "p1", "신청은 3일 전"), ("p1-c2", "p1", "긴급은 당일"),
                ("p2-c1", "p2", "영수증 정산")]
    parents = {"p1": "연차 규정: 신청은 3일 전. 긴급 연차는 당일 신청.", "p2": "출장 규정: 영수증 정산."}
    from store import connect, replace_document, parent_text
    found = lexical("연차 신청", handbook(), k=2)
    db = connect()
    for parent in sorted({d.parent for d in handbook()}):
        replace_document(db, "alpha", 1, parent, [d.text for d in handbook() if d.parent == parent])
    hits = [(d.id, d.parent, d.text) for d in found]
    parents = {d.parent: parent_text(db, d.tenant, d.version, d.parent) for d in found}
    db.close()
    expanded = list(dict.fromkeys(parent for _, parent, _ in hits))
    d = {"검색된 자식": len(hits), "중복 제거한 부모": len(expanded), "복원 문맥": parents[expanded[0]]}

    gold = {"q1": "leave", "q2": "travel", "q3": "device"}
    baseline = {"q1": ["travel", "leave"], "q2": ["travel"], "q3": ["leave", "device"]}
    reranked = {"q1": ["leave", "travel"], "q2": ["travel"], "q3": ["device", "leave"]}
    hits_before = sum(baseline[q][0] == g for q, g in gold.items())
    hits_after = sum(reranked[q][0] == g for q, g in gold.items())
    # 손으로 만든 재정렬 결과예요. 신경망 재정렬 성능으로 해석하지 않아요.
    e = {"고정 fixture 기준선 hit@1": f"{hits_before}/3", "고정 fixture 재정렬 hit@1": f"{hits_after}/3",
         "입력 후보 밖 정답 복구": False}
    return dict(A=a, B=b, C=c, D=d, E=e)


if __name__ == "__main__":
    show(run())
