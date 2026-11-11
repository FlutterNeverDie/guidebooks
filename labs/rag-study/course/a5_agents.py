"""심화 5권: 작업 분해, 합류, 중복 실행, 예산, 실패 격리의 결정적 모형."""

from concurrent.futures import ThreadPoolExecutor
import sqlite3
from contextlib import closing

from common import show


def worker(task):
    from pipeline import handbook, lexical
    if task.get("fail"):
        raise TimeoutError("injected worker deadline")
    docs = lexical(task["query"], handbook(), k=1)
    return {"task_id": task["id"], "status": "ok" if docs else "abstain", "evidence": [d.id for d in docs]}


def merge(results):
    by_task = {}
    for result in results:
        if result["task_id"] in by_task and by_task[result["task_id"]] != result:
            raise ValueError("conflicting results")
        by_task[result["task_id"]] = result
    return [by_task[k] for k in sorted(by_task)]


def reserve(remaining, amount):
    if amount < 0 or amount > remaining:
        return remaining, False
    return remaining - amount, True


def run():
    tasks = [{"id": "policy", "query": "연차 신청"}, {"id": "asset", "query": "노트북 교체"}]
    with ThreadPoolExecutor(max_workers=2) as pool:
        results = list(pool.map(worker, tasks))
    a = {"독립 작업": len(tasks), "반환된 근거": [r["evidence"][0] if r["evidence"] else None for r in results], "LLM 에이전트 호출": 0}

    joined = merge(results + results[:1])
    conflict = False
    try:
        merge([results[0], {**results[0], "status": "failed"}])
    except ValueError:
        conflict = True
    b = {"중복 포함 입력": 3, "합류 결과": len(joined), "충돌 거절": conflict}

    # 단일 DB 트랜잭션 안의 효과만 exactly-once처럼 만들어요. 외부 API 보장은 아니에요.
    with closing(sqlite3.connect(":memory:")) as db, db:
        db.execute("CREATE TABLE receipts (key TEXT PRIMARY KEY)")
        db.execute("CREATE TABLE counter (value INTEGER)")
        db.execute("INSERT INTO counter VALUES (0)")
        db.commit()
        for _ in range(2):
            with db:
                cur = db.execute("INSERT OR IGNORE INTO receipts VALUES (?)", ("task-1:commit",))
                if cur.rowcount:
                    db.execute("UPDATE counter SET value = value + 1")
        count = db.execute("SELECT value FROM counter").fetchone()[0]
    c = {"재전달 횟수 포함 시도": 2, "DB 안의 반영 횟수": count, "외부 API 보장": False}

    from concurrency import race
    d = {"동시 예약 전 확인": race("unsafe"), "원자적 조건부 갱신": race("atomic")}
    batch = []
    with ThreadPoolExecutor(2) as pool:
        pending = [(t, pool.submit(worker, {**t, "fail": t["id"] == "asset"})) for t in tasks]
        for task, future in pending:
            try:
                result = future.result(timeout=5)
            except TimeoutError:
                result = {"task_id": task["id"], "status": "timeout"}
            batch.append({**result, "required": True})
    complete = all(r["status"] == "ok" for r in batch if r["required"])
    degraded = "partial" if not complete else "complete"
    e = {"필수 작업 타임아웃": 1, "최종 상태": degraded, "완료로 표시": complete}
    return dict(A=a, B=b, C=c, D=d, E=e)


if __name__ == "__main__":
    show(run())
