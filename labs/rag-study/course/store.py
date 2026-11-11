"""문서 단위 교체와 부모 복원의 범위를 실행하는 작은 SQLite 저장 계층."""
import sqlite3


def connect():
    db = sqlite3.connect(":memory:")
    db.execute("CREATE TABLE chunks (tenant TEXT, version INTEGER, parent TEXT, id TEXT, body TEXT, position INTEGER NOT NULL, PRIMARY KEY (tenant, version, id))")
    return db


def replace_document(db, tenant, version, parent, paragraphs):
    with db:
        db.execute("DELETE FROM chunks WHERE tenant=? AND version=? AND parent=?", (tenant, version, parent))
        db.executemany("INSERT INTO chunks VALUES (?, ?, ?, ?, ?, ?)",
            [(tenant, version, parent, f"{parent}-{i}", body, i) for i, body in enumerate(paragraphs, 1)])


def parent_text(db, tenant, version, parent):
    return " ".join(row[0] for row in db.execute(
        "SELECT body FROM chunks WHERE tenant=? AND version=? AND parent=? ORDER BY position",
        (tenant, version, parent)))


def snapshot(db):
    from common import Chunk
    return [Chunk(id_, tenant, version, parent, body) for tenant, version, parent, id_, body in
            db.execute("SELECT tenant, version, parent, id, body FROM chunks ORDER BY tenant, version, parent, position")]


def pipeline_experiment():
    from pipeline import handbook, run_request
    db = connect()
    try:
        docs = handbook()
        for parent in sorted({d.parent for d in docs}):
            replace_document(db, "alpha", 1, parent, [d.text for d in docs if d.parent == parent])
        old = snapshot(db)
        cache = {}
        before = run_request("연차 신청", docs=old, cache=cache)
        replace_document(db, "alpha", 1, "h2", ["연차 신청은 2일 전까지예요."])
        after = run_request("연차 신청", docs=snapshot(db), cache=cache)
        in_flight = run_request("연차 신청", docs=old, cache=cache)
        replace_document(db, "alpha", 1, "h2", [])
        # 다른 주제의 어휘 겹침을 답으로 삼지 않도록 이 비교는 연차 범위를 고정해요.
        deleted = run_request("연차 신청", docs=[d for d in snapshot(db) if d.parent == "h2"], cache=cache)
        return {"before": before["response"], "after": after["response"],
                "in_flight": in_flight["response"], "after_delete": deleted["status"],
                "changed_context_cache_hit": any(t["stage"] == "cache" for t in after["trace"])}
    finally:
        db.close()


def experiment():
    db = connect()
    try:
        replace_document(db, "alpha", 1, "leave", ["3일 전 신청", "긴급 예외", "폐지할 조항"])
        replace_document(db, "beta", 1, "leave", ["다른 테넌트 전용"])
        replace_document(db, "alpha", 2, "leave", ["2일 전 신청"])
        replace_document(db, "alpha", 1, "leave", ["3일 전 신청", "긴급 예외"])
        rows = db.execute("SELECT id FROM chunks WHERE tenant='alpha' AND version=1 ORDER BY id").fetchall()
        return {"남은 조각": [row[0] for row in rows], "현재 부모": parent_text(db, "alpha", 1, "leave"),
                "다음 버전 부모": parent_text(db, "alpha", 2, "leave"), "범위 밖 부모": parent_text(db, "unknown", 1, "leave")}
    finally:
        db.close()
