"""독립 SQLite 연결 두 개로 경쟁을 재현해요. 외부 서비스 보장은 아니에요."""

from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import sqlite3
from contextlib import closing
import tempfile
from threading import Barrier


def race(kind="atomic"):
    with tempfile.TemporaryDirectory() as tmp:
        path = str(Path(tmp) / "budget.db")
        with closing(sqlite3.connect(path)) as db, db:
            db.execute("CREATE TABLE budget (remaining INTEGER)")
            db.execute("INSERT INTO budget VALUES (10)")
        barrier = Barrier(2)

        def reserve(_):
            with closing(sqlite3.connect(path, timeout=5)) as db, db:
                if kind == "unsafe":
                    balance = db.execute("SELECT remaining FROM budget").fetchone()[0]
                    barrier.wait(timeout=5)  # 두 작업자가 모두 10을 읽은 뒤 진행해요.
                    if balance >= 6:
                        db.execute("UPDATE budget SET remaining = remaining - 6")
                        return True
                    return False
                barrier.wait(timeout=5)
                cur = db.execute("UPDATE budget SET remaining = remaining - 6 WHERE remaining >= 6")
                return cur.rowcount == 1

        with ThreadPoolExecutor(2) as pool:
            accepted = list(pool.map(reserve, range(2)))
        with closing(sqlite3.connect(path)) as db, db:
            remaining = db.execute("SELECT remaining FROM budget").fetchone()[0]
        return {"accepted": sum(accepted), "remaining": remaining}


def approval_race(action_hash, supplied_hash=None):
    """내용 결합과 원자적 1회 소비를 같은 UPDATE 조건으로 검사해요."""
    with tempfile.TemporaryDirectory() as tmp:
        path = str(Path(tmp) / "approval.db")
        with closing(sqlite3.connect(path)) as db, db:
            db.execute("CREATE TABLE approvals (id TEXT PRIMARY KEY, hash TEXT, actor TEXT, tenant TEXT, expires INTEGER, used INTEGER)")
            db.execute("INSERT INTO approvals VALUES ('a1', ?, 'reader', 'alpha', 100, 0)", (action_hash,))
        barrier = Barrier(2)

        def consume(_):
            with closing(sqlite3.connect(path, timeout=5)) as db, db:
                barrier.wait(timeout=5)
                cur = db.execute("""UPDATE approvals SET used = 1 WHERE id = ? AND hash = ?
                    AND actor = ? AND tenant = ? AND expires > ? AND used = 0""",
                    ("a1", supplied_hash if supplied_hash is not None else action_hash, "reader", "alpha", 10))
                return cur.rowcount
        with ThreadPoolExecutor(2) as pool:
            return sum(pool.map(consume, range(2)))


if __name__ == "__main__":
    print({"unsafe": race("unsafe"), "atomic": race(), "approval_consumers": approval_race("example-hash")})
