"""중급 3권 A~E: 평가 데이터 분리, 채점, 표본 변동, 회귀 게이트."""

import random
from statistics import mean

from common import show


def metrics(ranking, relevant):
    recall = len(set(ranking) & relevant) / len(relevant) if relevant else 0
    rr = next((1 / i for i, d in enumerate(ranking, 1) if d in relevant), 0)
    return recall, rr


def run():
    rows = [("leave-1", "leave"), ("leave-2", "leave"), ("travel-1", "travel"), ("device-1", "device")]
    naive_train, naive_test = rows[::2], rows[1::2]
    naive_overlap = {x[1] for x in naive_train} & {x[1] for x in naive_test}
    train = [r for r in rows if r[1] != "leave"]
    test = [r for r in rows if r[1] == "leave"]
    overlap = {r[1] for r in train} & {r[1] for r in test}
    a = {"행 분리의 문서 중복": len(naive_overlap), "문서 분리의 중복": len(overlap)}

    # LLM이 만들었다고 가정한 후보를 사람이 승인하는 계약이에요. 실제 LLM 호출은 없어요.
    candidates = [{"q": "연차 기한?", "source": "leave", "answer": "3일 전", "quote": "신청은 3일 전까지", "review_reason": "기한과 예외를 원문 대조", "approved": True},
                  {"q": "해외 지사 보험?", "source": None, "approved": False}]
    accepted = [r for r in candidates if r["source"] and r["approved"]]
    b = {"후보 질문": len(candidates), "출처·검토 통과": len(accepted)}

    recall, rr = metrics(["noise", "a", "b"], {"a", "b"})
    c = {"recall@3": recall, "RR": rr, "생성 정확성 판정 가능": False}

    # 합성 이진 결과의 paired bootstrap. 실서비스 신뢰구간이 아니에요.
    delta = [1, 0, -1, 1, 0, 0, 1, 0]
    rng = random.Random(42)
    means = sorted(mean(rng.choices(delta, k=len(delta))) for _ in range(2000))
    interval = [means[49], means[1949]]
    d = {"합성 표본 수": len(delta), "평균 차이": mean(delta), "bootstrap 95% 구간": interval}

    proposed = {"recall": 0.9, "unauthorized": 1, "schema_errors": 0}
    passed = proposed["recall"] >= 0.8 and proposed["unauthorized"] == 0 and proposed["schema_errors"] == 0
    e = {"가정한 recall": proposed["recall"], "권한 위반": proposed["unauthorized"], "회귀 게이트 통과": passed}
    from pipeline import scenarios
    outcomes = scenarios()
    expected = {"정상": "answer", "캐시": "answer", "JSON 오류": "error", "위조 인용": "error",
                "자료 없음": "abstain", "예산 부족": "abstain", "캐시 반환 전 권한 변경": "error"}
    checks = {name: value["status"] == expected[name] for name, value in outcomes.items()}
    e = {"통합 시나리오 수": len(checks), "회귀 게이트 통과": all(checks.values()),
         "종료 이유": {name: value["reason"] for name,value in outcomes.items()}}
    return dict(A=a, B=b, C=c, D=d, E=e)


if __name__ == "__main__":
    show(run())
