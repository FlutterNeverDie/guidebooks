"""검색 저장 직전/직후 프로세스를 끝내고 새 프로세스로 복구해요.

외부 부작용이 없는 검색만 재시도해요. 파일 rename은 이 로컬 실험의 원자적 교체예요.
전원 장애 내구성, 다중 작업자 잠금, 외부 API exactly-once는 보장하지 않아요.
"""
import argparse
from dataclasses import asdict
import json
from pathlib import Path
import subprocess
import sys
import tempfile

from common import Chunk
from pipeline import handbook, lexical, run_request


def worker(folder, fail="none"):
    folder = Path(folder)
    checkpoint, calls = folder / "state.json", folder / "calls.txt"
    state = json.loads(checkpoint.read_text()) if checkpoint.exists() else {
        "schema": 1, "query": "연차 신청", "node": "retrieve", "version": 1}
    if state.get("schema") != 1:
        raise ValueError("unsupported checkpoint schema")
    if state["node"] == "retrieve":
        with calls.open("a") as out:
            out.write("retrieve\n")
        state["docs"] = [asdict(d) for d in lexical(state["query"], handbook())]
        state["node"] = "generate"
        if fail == "before-save":
            return 75
        temporary = checkpoint.with_suffix(".tmp")
        temporary.write_text(json.dumps(state, ensure_ascii=False))
        temporary.replace(checkpoint)
        if fail == "after-save":
            return 75
    saved = [Chunk(**d) for d in state["docs"]]
    # 현재 문서·권한과 대조하는 공통 경로가 복구된 검색 결과도 검사해요.
    result = run_request(state["query"], version=state["version"], search=lambda *_: saved)
    (folder / "result.json").write_text(json.dumps(result, ensure_ascii=False))
    return 0


def experiment(fail="after-save"):
    with tempfile.TemporaryDirectory() as tmp:
        command = [sys.executable, str(Path(__file__).resolve()), "--worker", tmp]
        first = subprocess.run(command + ["--fail", fail], capture_output=True, text=True, timeout=10)
        second = subprocess.run(command, capture_output=True, text=True, timeout=10)
        if first.returncode != 75 or second.returncode != 0:
            raise RuntimeError(first.stderr + second.stderr)
        folder = Path(tmp)
        return {"failure": fail, "first_exit": first.returncode, "restart_exit": second.returncode,
                "retrieval_calls": len((folder / "calls.txt").read_text().splitlines()),
                "status": json.loads((folder / "result.json").read_text())["status"]}


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--worker")
    parser.add_argument("--fail", choices=["none", "before-save", "after-save"], default="none")
    args = parser.parse_args()
    if args.worker:
        sys.exit(worker(args.worker, args.fail))
    print(json.dumps([experiment("before-save"), experiment("after-save")], ensure_ascii=False, indent=2))
