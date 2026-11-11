"""중급·심화편의 작은 가짜 데이터와 순수 파이썬 도구. 외부 호출은 없어요."""

import hashlib
import json
import math
import re
from dataclasses import asdict, dataclass


@dataclass(frozen=True)
class Chunk:
    id: str
    tenant: str
    version: int
    parent: str
    text: str


DOCS = [
    Chunk("leave-v2", "alpha", 2, "leave", "연차 신청은 사용일 3일 전까지 등록해요. 긴급 연차는 당일 신청할 수 있어요."),
    Chunk("travel-v2", "alpha", 2, "travel", "국내 출장 교통비는 영수증으로 정산해요. 해외 출장은 사전 승인이 필요해요."),
    Chunk("device-v2", "alpha", 2, "device", "노트북 교체 주기는 4년이에요. 고장은 자산 담당자에게 접수해요."),
    Chunk("leave-v1", "alpha", 1, "leave", "연차 신청은 사용일 7일 전까지 등록해요."),
    Chunk("beta-leave", "beta", 2, "leave", "연차 신청은 사용일 1일 전까지 등록해요."),
]


def tokens(text):
    return re.findall(r"[가-힣A-Za-z0-9]+", text.lower())


def retrieve(query, tenant="alpha", version=2, k=3):
    """교집합 개수로 정렬하는 작은 기준선. 의미 검색이나 형태소 분석은 아니에요."""
    q = set(tokens(query))
    scored = [(len(q & set(tokens(d.text))), d) for d in DOCS
              if d.tenant == tenant and d.version == version]
    return [d for score, d in sorted(scored, key=lambda x: (-x[0], x[1].id)) if score > 0][:k]


def pack(docs, budget, count=len):
    """budget 단위는 count가 결정해요. 기본값은 글자 수이고 토큰 수가 아니에요."""
    out, used = [], 0
    for d in docs:
        line = f"[{d.id}] {d.text}"
        size = count(line)
        if used + size <= budget:
            out.append(d)
            used += size
    return out, used


def validate_answer(obj, docs):
    if not isinstance(obj, dict) or set(obj) != {"answer", "citations", "abstain"}:
        return False
    if not isinstance(obj["answer"], str) or not obj["answer"].strip():
        return False
    cites = obj["citations"]
    if not isinstance(cites, list) or not all(isinstance(c, str) for c in cites):
        return False
    if type(obj["abstain"]) is not bool:
        return False
    allowed = {d.id for d in docs}
    if len(cites) != len(set(cites)) or not set(cites) <= allowed:
        return False
    return not cites if obj["abstain"] else bool(cites)


def answer_key(query, tenant, acl_revision, version, model, prompt, docs):
    payload = [query, tenant, acl_revision, version, model, prompt,
               [asdict(d) for d in docs]]
    return hashlib.sha256(json.dumps(payload, ensure_ascii=False, sort_keys=True).encode()).hexdigest()


def dot(a, b):
    return sum(x * y for x, y in zip(a, b))


def cosine(a, b):
    denom = math.sqrt(dot(a, a) * dot(b, b))
    return dot(a, b) / denom if denom else 0.0


def rrf(rankings, c=60):
    scores = {}
    for ranking in rankings:
        for rank, doc in enumerate(dict.fromkeys(ranking), 1):
            scores[doc] = scores.get(doc, 0) + 1 / (c + rank)
    return sorted(scores, key=lambda d: (-scores[d], d))


def show(result):
    print(json.dumps(result, ensure_ascii=False, indent=2))
