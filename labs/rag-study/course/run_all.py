"""LLM·네트워크 없는 50개 절 실습을 검증해요.

python3 course/run_all.py                 # 절 구성 + 저장된 결과와 비교
python3 course/run_all.py --write-results # 실측 결과 갱신(책 표도 함께 갱신해야 해요)
"""

import argparse
import importlib
import json
from pathlib import Path

MODULES = ["m1_generation", "m2_search", "m3_evaluation", "m4_operations", "m5_agent",
           "a1_embeddings", "a2_scale", "a3_graph", "a4_security", "a5_agents"]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--write-results", action="store_true")
    args = parser.parse_args()
    results = {}
    for name in MODULES:
        result = importlib.import_module(name).run()
        assert set(result) == set("ABCDE"), name
        results[name] = result
        print(f"PASS {name}: A B C D E")
    # JSON 왕복으로 tuple도 정규화해요.
    rendered = json.dumps(results, ensure_ascii=False, indent=2) + "\n"
    path = Path(__file__).with_name("results.json")
    if args.write_results:
        path.write_text(rendered, encoding="utf-8")
        print("결과 저장:", path.name)
    else:
        assert json.loads(path.read_text(encoding="utf-8")) == json.loads(rendered), "결과 변경: 차이를 확인하고 책의 표도 갱신하세요"
        print("PASS 저장된 결과와 일치 (모델 호출 0)")


if __name__ == "__main__":
    main()
