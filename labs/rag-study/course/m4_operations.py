"""중급 4권 A~E: 증분 갱신, 전환, 권한, 저장 계층, 지연 로그."""

import hashlib
import math
import sqlite3
from contextlib import closing
from statistics import mean

from common import DOCS, retrieve, show


def digest(text):
    return hashlib.sha256(text.encode()).hexdigest()


def changes(old, new):
    upsert = sorted(k for k in new if old.get(k) != new[k])
    delete = sorted(set(old) - set(new))
    return upsert, delete


def run():
    old = {"leave": digest("3일"), "travel": digest("영수증"), "retired": digest("구규정")}
    new = {"leave": digest("2일"), "travel": digest("영수증"), "device": digest("4년")}
    upsert, delete = changes(old, new)
    from store import experiment
    a = {"upsert": upsert, "delete": delete, "재실행 변경": len(changes(new, new)[0]), "저장소 반영": experiment()}

    versions = {"v1": {"leave": "7일"}, "v2": {"leave": "3일"}}
    active = "v1"
    request_snapshot = active
    active = "v2"
    old_result, new_result = versions[request_snapshot]["leave"], versions[active]["leave"]
    active = "v1"
    b = {"진행 중 요청": old_result, "새 요청": new_result, "롤백 후": versions[active]["leave"]}

    permitted = retrieve("연차 신청", tenant="alpha", version=2)
    c = {"검색 결과 ID": [d.id for d in permitted], "다른 테넌트 조각": sum(d.tenant != "alpha" for d in permitted)}

    # 여기서는 SQL 필터 계약만 SQLite로 실행해요. pgvector 성능 실험이 아니에요.
    with closing(sqlite3.connect(":memory:")) as db, db:
        db.execute("CREATE TABLE chunks (id TEXT PRIMARY KEY, tenant TEXT, version INTEGER, body TEXT)")
        db.executemany("INSERT INTO chunks VALUES (?, ?, ?, ?)", [(d.id, d.tenant, d.version, d.text) for d in DOCS])
        rows = db.execute("SELECT id FROM chunks WHERE tenant = ? AND version = ? ORDER BY id", ("alpha", 2)).fetchall()
    d = {"SQL 권한·버전 필터 후 행": len(rows), "벡터 DB 실행": False}

    # 합성 지연 자료이며 이 컴퓨터의 속도 실측이 아니에요.
    samples = [10] * 18 + [100, 300]
    p95 = sorted(samples)[math.ceil(0.95 * len(samples)) - 1]
    e = {"합성 지연 평균 ms": mean(samples), "nearest-rank p95 ms": p95, "최대 ms": max(samples)}
    return dict(A=a, B=b, C=c, D=d, E=e)


if __name__ == "__main__":
    show(run())
