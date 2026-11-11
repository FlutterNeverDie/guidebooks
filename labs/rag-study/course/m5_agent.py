"""중급 5권 A~E: 명시적 라우터와 상태 전이. LangGraph를 흉내 낸 API가 아니에요."""

from common import retrieve, show


def route(question):
    if "몇 개" in question:
        return "count"
    return "search"


def dispatch(question, policy=None):
    from pipeline import handbook, Policy, run_request
    policy = policy or Policy()
    if route(question) == "count":
        # 라우팅 성공과 집계 대상 확인은 달라요. 지원하는 질문 형식을 명시해요.
        if question.strip().rstrip("?") != "경비 규정 조각 몇 개":
            return {"operation": "clarify", "reason": "unsupported_count_scope",
                    "supported_question": "경비 규정 조각 몇 개"}
        return {"operation": "count", "unit": "경비 규정 조각", "scope": "h4",
                "value": sum(d.parent == "h4" and policy.permits(d) for d in handbook())}
    return run_request(question, policy=policy)


def bounded_search(queries, limit):
    seen, calls = set(), 0
    for q in queries:
        if calls >= limit:
            return "budget_exhausted", calls
        if q in seen:
            return "duplicate_query", calls
        seen.add(q)
        calls += 1
        if retrieve(q):
            return "answer", calls
    return "abstain", calls


def execute(state):
    """각 호출은 상태 전이 하나. 부작용이 없는 검색/검증만 수행해요."""
    s = dict(state)
    if s["node"] == "retrieve":
        s["ids"] = [d.id for d in retrieve(s["query"])]
        s["node"] = "verify"
    elif s["node"] == "verify":
        s["node"] = "answer" if s["ids"] else "abstain"
    return s


def run():
    a = {"집계 질문": route("자산 몇 개"), "규정 질문": route("연차 신청")}

    success = bounded_search(["휴가", "연차 신청"], 2)
    duplicate = bounded_search(["휴가", "휴가"], 3)
    exhausted = bounded_search(["휴가", "보험", "연차 신청"], 2)
    b = {"재검색 성공": success, "같은 질의 반복": duplicate, "호출 예산 종료": exhausted}

    state = {"node": "retrieve", "query": "연차 신청", "ids": []}
    path = [state["node"]]
    while state["node"] not in {"answer", "abstain"}:
        state = execute(state)
        path.append(state["node"])
    c = {"상태 경로": path, "최종 근거": state["ids"]}

    from recovery import experiment
    from pipeline import scenarios, handbook, Policy
    policy = Policy()
    a["집계 도구 실행"] = dispatch("경비 규정 조각 몇 개", policy)
    d = {"저장 전 종료": experiment("before-save"), "저장 후 종료": experiment("after-save")}
    outcomes = scenarios()
    c = {"통합 상태 경로": [t["stage"] for t in outcomes["정상"]["trace"]] + [outcomes["정상"]["status"]],
         "최종 근거": outcomes["정상"]["evidence_ids"]}
    e = {"전체 흐름 상태": {k: v["status"] for k, v in outcomes.items()}, "모델 호출": 0,
         "정상 경로": [t["stage"] for t in outcomes["정상"]["trace"]]}
    return dict(A=a, B=b, C=c, D=d, E=e)


if __name__ == "__main__":
    show(run())
