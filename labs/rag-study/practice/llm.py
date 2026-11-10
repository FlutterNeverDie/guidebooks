"""LLM 호출: 이 맥의 claude -p만 쓴다. API 키 방식은 없다.

- CI나 GitHub Actions 환경이면 부르지 않고 멈춘다 (남의 환경에서 내 구독을 쓰지 않게).
- 같은 (모델, 시스템 지시, 입력)은 practice/.cache에 저장해 다시 부르지 않는다.
- Claude Code 기본 지시 대신 --system-prompt로 실습용 지시만 준다. 도구는 하나도 주지 않는다.
"""

import hashlib
import json
import os
import subprocess
import sys
import time
from pathlib import Path

MODEL = "claude-haiku-5-5"  # 실습은 작고 빠른 모델로. 바꾸면 결과도 달라진다
CACHE = Path(__file__).resolve().parent / ".cache"


def _guard() -> None:
    if os.environ.get("CI") or os.environ.get("GITHUB_ACTIONS"):
        sys.exit("CI 환경에서는 claude -p를 부르지 않아요. 이 실습은 로컬 맥에서만 돌려요.")


def ask(system: str, user: str, model: str = MODEL) -> dict:
    """{'text', 'seconds', 'cached'}를 돌려준다."""
    key = hashlib.sha256(json.dumps([model, system, user], ensure_ascii=False).encode()).hexdigest()[:20]
    path = CACHE / f"{key}.json"
    if path.exists():
        return {**json.loads(path.read_text()), "cached": True}
    _guard()
    t0 = time.perf_counter()
    r = subprocess.run(
        ["claude", "-p", "--model", model, "--system-prompt", system, "--tools", "",
         "--setting-sources", "", "--no-session-persistence", "--output-format", "json"],
        input=user, capture_output=True, text=True, timeout=180,
    )
    out = json.loads(r.stdout or "{}")
    if out.get("is_error") or "result" not in out:
        sys.exit(f"claude -p 실패: {(out.get('result') or r.stderr)[:200]}")
    res = {"text": out["result"].strip(), "seconds": round(time.perf_counter() - t0, 1)}
    CACHE.mkdir(exist_ok=True)
    path.write_text(json.dumps(res, ensure_ascii=False))
    return {**res, "cached": False}
