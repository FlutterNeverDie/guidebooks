"""응답·권한·재시도의 실패 경계를 확인해요. LLM과 네트워크를 사용하지 않아요."""

import os
import json
from pathlib import Path
import subprocess
import sys
import unittest
from unittest.mock import patch
from types import SimpleNamespace

from a3_graph import compile_plan
from a4_security import action_hash, consume_approval
from a5_agents import merge, reserve
from common import DOCS, answer_key, pack, retrieve, validate_answer
from m1_generation import events, live
from m5_agent import bounded_search, execute
from pipeline import Policy, handbook, run_request, scenarios


class Contracts(unittest.TestCase):
    def setUp(self):
        self.docs = retrieve("연차 신청")
        self.response = {"answer": "3일 전까지 신청해요.", "citations": ["leave-v2"], "abstain": False}

    def test_response_rejects_wrong_shape_and_types(self):
        for obj in [None, [], {}, {**self.response, "extra": True},
                    {**self.response, "abstain": 1}, {**self.response, "answer": " "},
                    {**self.response, "citations": "leave-v2"}, {**self.response, "citations": [1]}]:
            with self.subTest(obj=obj):
                self.assertFalse(validate_answer(obj, self.docs))

    def test_citations_are_request_scoped(self):
        self.assertTrue(validate_answer(self.response, self.docs))
        for ids in [[], ["made-up"], ["beta-leave"], ["leave-v1"], ["travel-v2"], ["leave-v2", "leave-v2"]]:
            with self.subTest(ids=ids):
                self.assertFalse(validate_answer({**self.response, "citations": ids}, self.docs))

    def test_abstention_requires_no_citations(self):
        self.assertTrue(validate_answer({**self.response, "abstain": True, "citations": []}, []))
        self.assertFalse(validate_answer({**self.response, "abstain": True}, self.docs))
        self.assertFalse(validate_answer(self.response, []))

    def test_packer_preserves_complete_chunks_and_counts_ids(self):
        size = len(f"[{self.docs[0].id}] {self.docs[0].text}")
        self.assertEqual(pack(self.docs, size - 1), ([], 0))
        self.assertEqual(pack(self.docs, size), (self.docs, size))
        packed, used = pack(DOCS, 100)
        self.assertLessEqual(used, 100)
        self.assertTrue(all(d in DOCS for d in packed))

    def test_retrieval_enforces_tenant_and_version(self):
        self.assertEqual([d.id for d in retrieve("연차 신청")], ["leave-v2"])
        self.assertEqual([d.id for d in retrieve("연차 신청", "beta")], ["beta-leave"])
        self.assertEqual([d.id for d in retrieve("연차 신청", "alpha", 1)], ["leave-v1"])
        self.assertEqual(retrieve("연차 신청", "unknown"), [])

    def test_cache_key_changes_with_each_context_field(self):
        args = ["연차 신청", "alpha", 1, 2, "model1", "prompt1", self.docs]
        original = answer_key(*args)
        for i, replacement in enumerate(["휴가", "beta", 2, 3, "model2", "prompt2", []]):
            other = args.copy()
            other[i] = replacement
            self.assertNotEqual(original, answer_key(*other))

    def test_failed_stream_never_emits_done(self):
        for fail_at in [0, 1]:
            emitted = list(events(["a", "b"], fail_at))
            self.assertEqual(emitted[-1]["type"], "error")
            self.assertNotIn("done", [e["type"] for e in emitted])

    def test_agent_stops_at_budget_and_duplicate(self):
        self.assertEqual(bounded_search(["연차 신청"], 0), ("budget_exhausted", 0))
        self.assertEqual(bounded_search(["보험", "보험"], 5), ("duplicate_query", 1))
        state = execute(execute({"node": "retrieve", "query": "보험", "ids": []}))
        self.assertEqual(state["node"], "abstain")

    def test_query_template_does_not_interpolate_values(self):
        supplied = "x') DELETE a //"
        query, params = compile_plan({"intent": "asset_division", "asset": supplied})
        self.assertNotIn(supplied, query)
        self.assertEqual(params["asset"], supplied)
        for plan in [{"intent": "delete_all", "asset": "x"}, {"intent": "asset_division", "asset": "x", "query": "x"}]:
            with self.assertRaises(ValueError):
                compile_plan(plan)

    def test_approval_is_bound_and_consumed_once(self):
        action = {"tool": "export", "doc": "leave-v2"}
        approval = {"hash": action_hash(action), "actor": "reader", "tenant": "alpha", "expires": 100, "used": False}
        for args in [(action, "other", "alpha", 1), (action, "reader", "beta", 1),
                     (action, "reader", "alpha", 100), ({**action, "doc": "other"}, "reader", "alpha", 1)]:
            self.assertFalse(consume_approval(approval, *args))
            self.assertFalse(approval["used"])
        self.assertTrue(consume_approval(approval, action, "reader", "alpha", 99))
        self.assertFalse(consume_approval(approval, action, "reader", "alpha", 99))

    def test_join_is_deterministic_and_rejects_conflicts(self):
        a = {"task_id": "a", "status": "ok"}
        b = {"task_id": "b", "status": "ok"}
        self.assertEqual(merge([a, b, a]), merge([b, a]))
        with self.assertRaises(ValueError):
            merge([a, {**a, "status": "failed"}])

    def test_budget_rejects_negative_and_excess_reservations(self):
        self.assertEqual(reserve(10, -1), (10, False))
        self.assertEqual(reserve(10, 11), (10, False))
        self.assertEqual(reserve(10, 10), (0, True))

    def test_live_entry_is_blocked_in_ci_even_before_cache(self):
        file = Path(__file__).with_name("m1_generation.py")
        for variable in ["CI", "GITHUB_ACTIONS"]:
            env = {k: v for k, v in os.environ.items() if k not in {"CI", "GITHUB_ACTIONS"}}
            env[variable] = "true"
            proc = subprocess.run([sys.executable, str(file), "--live"], env=env, capture_output=True, text=True, timeout=5)
            self.assertNotEqual(proc.returncode, 0)
            self.assertIn("로컬 CLI", proc.stderr)

    def test_generation_adapter_validates_mocked_output(self):
        response = {**self.response, "citations": ["h2-2"]}
        with patch.dict(os.environ, {}, clear=True):
            fake = SimpleNamespace(ask=lambda *_: {"text": json.dumps(response), "seconds": 0, "cached": False})
            with patch.dict(sys.modules, {"llm": fake}):
                self.assertEqual(live("연차 신청")["response"], response)
            for text in ["not JSON", json.dumps({**self.response, "citations": ["beta-leave"]})]:
                fake = SimpleNamespace(ask=lambda *_, text=text: {"text": text, "seconds": 0, "cached": False})
                with patch.dict(sys.modules, {"llm": fake}), self.assertRaises(SystemExit):
                    live("연차 신청")

    def test_no_evidence_skips_generation(self):
        def forbidden(*args):
            raise AssertionError("자료가 없는데 모델을 호출했어요")
        with patch.dict(os.environ, {}, clear=True), patch.dict(sys.modules, {"llm": SimpleNamespace(ask=forbidden)}):
            self.assertTrue(live("양자중력보험")["response"]["abstain"])

    def test_variations_produce_results_instead_of_fixed_assertions(self):
        from m1_generation import run as generation
        from a2_scale import run as scale
        from a3_graph import run as graph
        self.assertEqual(generation(20)["A"]["포장 조각"], 0)
        self.assertEqual(scale(1)["B"]["원본 재점수 1위"], "a")
        self.assertIsNone(scale(0)["B"]["원본 재점수 1위"])
        self.assertEqual(graph(True)["A"]["소유 판정"]["status"], "conflict")

    def test_pipeline_scenarios_are_real_end_to_end_calls(self):
        rows = scenarios()
        self.assertEqual(rows["정상"]["response"]["citations"], ["h2-2"])
        self.assertEqual([t["stage"] for t in rows["정상"]["trace"]],
                         ["authorize", "retrieve", "pack", "generate", "parse", "validate"])
        self.assertEqual(rows["JSON 오류"]["reason"], "invalid_json")
        self.assertEqual(rows["위조 인용"]["reason"], "invalid_response")
        self.assertEqual(rows["캐시 반환 전 권한 변경"]["reason"], "permission_changed")
        self.assertIsNone(rows["캐시 반환 전 권한 변경"]["response"])

    def test_pipeline_rejects_search_scope_violation(self):
        from dataclasses import replace
        forbidden = replace(handbook()[0], tenant="beta")
        result = run_request("연차", search=lambda *_: [forbidden])
        self.assertEqual(result["reason"], "retrieval_scope")
        self.assertNotIn("generate", [t["stage"] for t in result["trace"]])

    def test_pipeline_denial_and_zero_budget_skip_generator(self):
        def forbidden(*_):
            raise AssertionError("generation must be skipped")
        for kwargs in [{"budget": 0}, {"policy": Policy(tenant="unknown")}]:
            self.assertEqual(run_request("연차 신청", generator=forbidden, **kwargs)["status"], "abstain")

    def test_tampered_cache_and_generator_timeout_fail_closed(self):
        cache = {}
        run_request("연차 신청", cache=cache)
        next(iter(cache.values()))["citations"] = ["forged"]
        self.assertEqual(run_request("연차 신청", cache=cache)["reason"], "invalid_cached_response")
        def fail(*_):
            raise TimeoutError()
        self.assertEqual(run_request("연차 신청", generator=fail)["reason"], "generation_failed")

    def test_stream_cancel_does_not_commit_partial_text(self):
        from m1_generation import consume
        self.assertIsNone(consume([{"type": "delta", "text": "partial"}, {"type": "cancel"}])["committed"])
        self.assertIsNone(consume([{"type": "delta", "text": "disconnected"}])["committed"])

    def test_document_replacement_removes_old_children_and_scopes_parent(self):
        from store import experiment
        output = experiment()
        self.assertEqual(output["남은 조각"], ["leave-1", "leave-2"])
        self.assertNotIn("폐지", output["현재 부모"])
        self.assertEqual(output["다음 버전 부모"], "2일 전 신청")
        self.assertEqual(output["범위 밖 부모"], "")

    def test_checkpoint_restarts_in_new_process(self):
        from recovery import experiment
        self.assertEqual(experiment("before-save")["retrieval_calls"], 2)
        after = experiment("after-save")
        self.assertEqual(after["retrieval_calls"], 1)
        self.assertEqual(after["status"], "answer")

    def test_atomic_reservations_prevent_overspending(self):
        from concurrency import race, approval_race
        self.assertEqual(race("unsafe"), {"accepted": 2, "remaining": -2})
        self.assertEqual(race(), {"accepted": 1, "remaining": 4})
        self.assertEqual(approval_race("original"), 1)
        self.assertEqual(approval_race("original", "changed"), 0)

    def test_graph_scope_and_transitive_invalidation(self):
        from a3_graph import EDGES, graph_query, invalidate
        self.assertEqual(graph_query("count", EDGES), 1)
        self.assertEqual(graph_query("summary", EDGES, {"asset-register"})["coverage"], .5)
        self.assertEqual(invalidate({"source"}, {"edge": {"source"}, "summary": {"edge"}, "answer": {"summary"}}),
                         ["answer", "edge", "summary"])

    def test_store_changes_flow_through_same_pipeline(self):
        from store import pipeline_experiment
        result = pipeline_experiment()
        self.assertIn("3일 전", result["before"]["answer"])
        self.assertIn("2일 전", result["after"]["answer"])
        self.assertEqual(result["in_flight"], result["before"])
        self.assertFalse(result["changed_context_cache_hit"])
        self.assertEqual(result["after_delete"], "abstain")

    def test_dispatch_executes_scoped_count(self):
        from m5_agent import dispatch
        self.assertEqual(dispatch("경비 규정 조각 몇 개")["value"], 3)
        self.assertEqual(dispatch("경비 규정 조각 몇 개", Policy(tenant="unknown"))["value"], 0)

    def test_dispatch_does_not_answer_unknown_count_with_expense_count(self):
        from m5_agent import dispatch
        for question in ["노트북 몇 개", "자산 몇 개", "연차 규정 조각 몇 개"]:
            result = dispatch(question)
            self.assertEqual(result["operation"], "clarify")
            self.assertNotIn("value", result)

    def test_parent_reconstruction_preserves_order_past_nine_chunks(self):
        from contextlib import closing
        from store import connect, replace_document, parent_text
        paragraphs = [f"문단{i}" for i in range(1, 13)]
        with closing(connect()) as db:
            replace_document(db, "alpha", 1, "p", paragraphs)
            self.assertEqual(parent_text(db, "alpha", 1, "p"), " ".join(paragraphs))

    def test_response_mutation_does_not_modify_cached_citations(self):
        cache = {}
        first = run_request("연차 신청", cache=cache)
        expected = first["response"]["citations"].copy()
        first["response"]["citations"].clear()
        hit = run_request("연차 신청", cache=cache)
        self.assertEqual(hit["response"]["citations"], expected)
        hit["response"]["citations"].append("forged")
        again = run_request("연차 신청", cache=cache)
        self.assertEqual(again["response"]["citations"], expected)

    def test_all_live_entrypoints_reject_ci(self):
        for name in ["pipeline.py", "model_experiments.py"]:
            proc = subprocess.run([sys.executable, str(Path(__file__).with_name(name)), "--live"],
                                  env={**os.environ, "CI": "true"}, capture_output=True, text=True, timeout=5)
            self.assertNotEqual(proc.returncode, 0)
            self.assertIn("로컬", proc.stderr)


if __name__ == "__main__":
    unittest.main()
