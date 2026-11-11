"""중급 1권 A~E: 계약, 근거 검증, 보류, 이벤트, 캐시. 기본 실행은 LLM 없음."""

import argparse
import json
import os
import sys
from pathlib import Path

from common import DOCS, answer_key, pack, retrieve, show, validate_answer


def events(parts, fail_at=None):
    yield {"type": "start"}
    for i, part in enumerate(parts):
        if i == fail_at:
            yield {"type": "error", "code": "upstream_failed"}
            return
        yield {"type": "delta", "text": part}
    yield {"type": "done"}


def consume(stream):
    buffer, committed = "", None
    for event in stream:
        if event["type"] == "delta":
            buffer += event["text"]
        elif event["type"] == "done":
            committed = buffer
        elif event["type"] in {"error", "cancel"}:
            buffer, committed = "", None
            break
    return {"preview": buffer, "committed": committed}


def run(budget=100):
    docs = retrieve("연차 신청")
    selected, used = pack(docs, budget)
    a = {"검색 조각": len(docs), "포장 조각": len(selected), "본문+ID 글자": used}

    valid = {"answer": "3일 전까지 신청해요.", "citations": ["leave-v2"], "abstain": False}
    forged = {**valid, "citations": ["made-up"]}
    wrong_fact = {**valid, "answer": "30일 전까지 신청해요."}
    # 형식 검사는 사실의 참/거짓을 판단하지 못한다는 반례예요.
    b = {"정상 ID 통과": validate_answer(valid, docs), "없는 ID 통과": validate_answer(forged, docs),
         "잘못된 사실도 형식 통과": validate_answer(wrong_fact, docs)}

    missing = retrieve("반려동물 보험")
    withheld = {"answer": "제공된 자료에서 찾지 못했어요.", "citations": [], "abstain": True}
    c = {"답 없는 질문의 조각": len(missing), "생성 호출 필요": bool(missing)}

    ok = list(events(["연차는 ", "3일 전이에요."]))
    failed = list(events(["연차는 ", "3일 전이에요."], fail_at=1))
    d = {"정상 이벤트": [e["type"] for e in ok], "중단 이벤트": [e["type"] for e in failed]}

    args = ["연차 신청", "alpha", 1, 2, "fixture", "p1", docs]
    key = answer_key(*args)
    changed_acl = args.copy()
    changed_acl[2] = 2
    changed_version = args.copy()
    changed_version[3] = 3
    e = {"동일 요청 캐시 일치": key == answer_key(*args), "권한 변경 캐시 일치": key == answer_key(*changed_acl),
         "색인 변경 캐시 일치": key == answer_key(*changed_version)}
    from pipeline import run_request
    cache = {}
    first = run_request("연차 신청", cache=cache)
    again = run_request("연차 신청", cache=cache)
    revoked = run_request("연차 신청", cache=cache, before_return=lambda p: setattr(p, "revision", 2))
    e.update({"첫 응답": first["status"], "두 번째 hit": any(t["stage"] == "cache" for t in again["trace"]),
              "반환 전 철회": revoked["reason"]})
    d.update({"완료 후 확정": consume(ok)["committed"], "중단 후 확정": consume(failed)["committed"]})
    return dict(A=a, B=b, C=c, D=d, E=e)


def live(query):
    # 캐시 여부와 무관하게 이 진입점에서는 CI를 먼저 막아요.
    if os.environ.get("CI") or os.environ.get("GITHUB_ACTIONS"):
        raise SystemExit("실제 모델 호출은 로컬 CLI에서만 허용해요.")
    from pipeline import claude_generator, run_request
    result = run_request(query, generator=claude_generator, model="local-claude")
    if result["status"] == "error":
        raise SystemExit("응답 계약 검증에 실패했어요: " + result["reason"])
    return result


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--live", action="store_true", help="기존 practice/llm.py로 로컬 Claude를 호출해요")
    parser.add_argument("--query", default="연차 신청")
    parser.add_argument("--budget", type=int, default=100)
    opts = parser.parse_args()
    show(live(opts.query) if opts.live else run(opts.budget))
