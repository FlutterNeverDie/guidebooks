"""로컬 임베딩·재정렬·HyDE 실측. 기본 CLI는 LLM을 호출하지 않아요."""

import argparse
import hashlib
from importlib.metadata import version
import json
import os
from pathlib import Path
import platform
import time

from pipeline import DATA, handbook, lexical, run_request, claude_generator
from retrieval import EMBEDDER, RERANKER, SemanticSearch


def rank(ids, gold):
    return next((i for i, d in enumerate(ids, 1) if d in gold), None)


def run(live=False):
    if live and (os.environ.get("CI") or os.environ.get("GITHUB_ACTIONS")):
        raise SystemExit("HyDE와 실제 생성은 로컬에서만 실행해요.")
    docs = handbook()
    questions = json.loads((DATA / "eval.json").read_text())["answerable"]
    search = SemanticSearch(candidates=10, top=3)
    rows = []
    for item in questions:
        gold = {d.id for d in docs if item["key"] in d.text}
        t0 = time.perf_counter()
        candidates = search.candidates_for(item["q"], docs)
        scores = search.score(item["q"], candidates)
        order = sorted(range(len(scores)), key=lambda i: (-scores[i], candidates[i].id))
        before, after = [d.id for d in candidates], [candidates[i].id for i in order]
        rows.append({"query": item["q"], "gold": sorted(gold), "before_rank": rank(before, gold),
                     "after_rank": rank(after, gold), "ms": round((time.perf_counter()-t0)*1000, 1),
                     "candidates": [{"id": d.id, "text": d.text, "score": round(float(s), 4)} for d, s in zip(candidates, scores)]})
    result = {"scope": "기존 개발 질문 22개. 최종 시험 성능이 아니에요. 첫 질의에는 모델 초기화가 포함돼요.",
              "model": EMBEDDER, "reranker": RERANKER, "platform": platform.machine(),
              "versions": {x: version(x) for x in ["fastembed", "numpy", "onnxruntime"]},
              "data_sha256": hashlib.sha256((DATA / "handbook.md").read_bytes()).hexdigest(),
              "before_hit1": sum(r["before_rank"] == 1 for r in rows),
              "after_hit1": sum(r["after_rank"] == 1 for r in rows), "questions": len(rows), "rows": rows}
    # 동일 검색기를 공통 파이프라인에 연결해 실제 포장·검증도 실행해요.
    result["pipeline"] = run_request("KTX 특실 타도 돼?", search=search)
    if live:
        import sys
        sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "practice"))
        from llm import ask
        import numpy as np
        vectors = search.embed([d.text for d in docs])
        hyde = []
        for query, gold_key in [("기차표 돌려받기", "KTX 일반실"), ("올해 남은 휴가 내년에 써도 돼?", "최대 5일")]:
            generation = ask("검색용 가상 직원 규정 한 문단을 한국어로 작성하라. 사실 확인된 근거가 아니라 검색 힌트다. 100자 안팎으로 써라.", query)
            original = np.argsort(-(vectors @ search.embed([query])[0]))
            imagined = np.argsort(-(vectors @ search.embed([generation["text"]])[0]))
            gold = {d.id for d in docs if gold_key in d.text}
            hyde.append({"query": query, "hypothesis": generation["text"], "cached": generation["cached"],
                         "original_rank": rank([docs[i].id for i in original], gold),
                         "hyde_rank": rank([docs[i].id for i in imagined], gold),
                         "retrieved_id": docs[imagined[0]].id, "retrieved_text": docs[imagined[0]].text})
        result["hyde"] = hyde
        result["live_pipeline"] = run_request("KTX 특실 타도 돼?", search=search, generator=claude_generator, model="local-claude")
    return result


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--live", action="store_true")
    parser.add_argument("--output", type=Path, default=Path(__file__).with_name("reports") / "retrieval.json")
    args = parser.parse_args()
    result = run(args.live)
    args.output.parent.mkdir(exist_ok=True, parents=True)
    args.output.write_text(json.dumps(result, ensure_ascii=False, indent=2)+"\n")
    print(json.dumps({k: v for k, v in result.items() if k not in {"rows", "pipeline"}}, ensure_ascii=False, indent=2))
