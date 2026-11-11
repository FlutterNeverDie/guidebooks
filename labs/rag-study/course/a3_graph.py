"""심화 3권: 출처가 있는 관계, 제한된 질의 계획, 경로 증거와 변경 영향."""

from common import show


EDGES = [
    {"s": "asset-031", "r": "OWNED_BY", "o": "team-a", "source": "asset-register", "active": True},
    {"s": "team-a", "r": "PART_OF", "o": "division-x", "source": "org-register", "active": True},
    {"s": "asset-031", "r": "OWNED_BY", "o": "team-b", "source": "old-note", "active": False},
]


def compile_plan(plan):
    # 모델이 Cypher 원문을 쓰지 않고 허용한 intent와 ID만 제안하는 설계예요.
    if not isinstance(plan, dict) or set(plan) != {"intent", "asset"}:
        raise ValueError("plan schema")
    if plan["intent"] != "asset_division" or not isinstance(plan["asset"], str) or len(plan["asset"]) > 80:
        raise ValueError("unsupported plan")
    query = ("MATCH (a:Asset {id: $asset})-[:OWNED_BY]->(t:Team)-[:PART_OF]->(d:Division) "
             "RETURN d.id LIMIT 20")
    return query, {"asset": plan["asset"]}


def paths(asset, edges=None):
    found = []
    edges = EDGES if edges is None else edges
    for e1 in edges:
        if e1["active"] and e1["s"] == asset and e1["r"] == "OWNED_BY":
            for e2 in edges:
                if e2["active"] and e2["s"] == e1["o"] and e2["r"] == "PART_OF":
                    found.append([e1, e2])
    return found


def resolve_ownership(edges):
    owners = sorted({e["o"] for e in edges if e["active"] and e["s"] == "asset-031" and e["r"] == "OWNED_BY"})
    return {"owners": owners, "status": "conflict" if len(owners) > 1 else "resolved" if owners else "missing"}


def graph_query(kind, edges, scope=None):
    active = [e for e in edges if e["active"]]
    if kind == "path":
        return [[e["source"] for e in p] for p in paths("asset-031", active)]
    if kind == "count":
        return len({e["s"] for e in active if e["r"] == "OWNED_BY"})
    if kind == "summary":
        selected = [e for e in active if scope is None or e["source"] in scope]
        return {"facts": [f'{e["s"]} {e["r"]} {e["o"]}' for e in selected],
                "sources": sorted({e["source"] for e in selected}),
                "coverage": len(selected) / len(active) if active else 0}
    raise ValueError("unsupported graph operation")


def invalidate(changed, dependencies):
    affected = set(changed)
    while True:
        additions = {node for node, inputs in dependencies.items() if inputs & affected} - affected
        if not additions:
            return sorted(affected - set(changed))
        affected.update(additions)


def run(include_old=False):
    # 유효 기간은 [from, until)예요. 같은 시점의 소유 관계 충돌을 숨기지 않아요.
    edges = [{**e, "from": 1, "until": None if e["active"] or include_old else 2} for e in EDGES]
    edges = [{**e, "active": e["from"] <= 3 and (e["until"] is None or 3 < e["until"])} for e in edges]
    active = [e for e in edges if e["active"]]
    a = {"전체 관계": len(edges), "현재 관계": len(active), "소유 판정": resolve_ownership(active)}

    text, params = compile_plan({"intent": "asset_division", "asset": "asset-031"})
    rejected = False
    try:
        compile_plan({"intent": "delete_all", "asset": "asset-031"})
    except ValueError:
        rejected = True
    b = {"허용 질의 매개변수": params, "미등록 intent 거절": rejected, "Neo4j 실행": False}

    result = paths("asset-031", edges)
    sources = [e["source"] for e in result[0]] if result else []
    conflict = resolve_ownership(edges)["status"] == "conflict"
    c = {"관계 hop": len(result[0]) if result else 0,
         "경로 결론": "충돌로 보류" if conflict else result[0][-1]["o"] if result else None,
         "근거 문서": sources}

    d = {"소속 경로": graph_query("path", edges), "중복 제거 자산 수": graph_query("count", edges),
         "제한 범위 요약": graph_query("summary", edges, {"asset-register"}),
         "전체 범위 요약": graph_query("summary", edges)}

    dependencies = {"edge-2": {"org-register"}, "summary-1": {"edge-2"},
                    "answer-1": {"summary-1", "asset-register"}, "answer-2": {"travel-policy"}}
    invalid = invalidate({"org-register"}, dependencies)
    e = {"조직도 변경으로 무효화": invalid, "영향 없는 답": "answer-2"}
    return dict(A=a, B=b, C=c, D=d, E=e)


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--include-old", action="store_true")
    show(run(parser.parse_args().include_old))
