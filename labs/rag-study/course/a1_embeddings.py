"""심화 1권: 작은 수치 실험. 사전학습 언어 모델을 파인튜닝하지 않아요."""

import math

from common import cosine, dot, show


def loss(weights, triples):
    return sum(math.log1p(math.exp(-dot(weights, diff))) for diff in triples) / len(triples)


def train(weights, triples, steps=100, lr=0.2):
    w = list(weights)
    for _ in range(steps):
        gradient = [0.0] * len(w)
        for diff in triples:
            factor = -1 / (1 + math.exp(dot(w, diff)))
            for j, x in enumerate(diff):
                gradient[j] += factor * x / len(triples)
        w = [x - lr * g for x, g in zip(w, gradient)]
    return w


def run():
    # 학습된 임베딩이 아닌 좌표 fixture로 평가 분해를 연습해요.
    query = [1, 0]
    models = {"fixture-A": {"relevant": [0.6, 0.8], "noise": [0.8, 0.6]},
              "fixture-B": {"relevant": [0.9, 0.1], "noise": [0.1, 0.9]}}
    winners = {name: max(docs, key=lambda k: cosine(query, docs[k])) for name, docs in models.items()}
    a = {"동조건 좌표 fixture 1위": winners, "실제 모델 순위인가": False}

    positives = {"leave", "leave-copy"}
    candidates = ["leave-copy", "travel", "device"]
    negatives = [x for x in candidates if x not in positives]
    b = {"어려운 후보": len(candidates), "정답 사본 제외 후 음성": len(negatives)}

    train_groups, eval_groups = {"policy-a", "policy-b"}, {"policy-c"}
    c = {"학습 문서 그룹": len(train_groups), "평가 문서 그룹": len(eval_groups), "중복": len(train_groups & eval_groups)}

    # 두 특징의 양성-음성 차이: 주제 신호, 우연한 표면 신호.
    triples = [[1.0, -0.5], [0.8, -1.0], [1.2, 0.2]]
    before = [0.0, 0.0]
    after = train(before, triples)
    initial, final = loss(before, triples), loss(after, triples)
    d = {"선형 순위기 학습 전 loss": round(initial, 4), "학습 후 loss": round(final, 4),
         "학습된 가중치": [round(x, 3) for x in after], "언어 모델 파인튜닝": False}

    old = {"model": "m1", "dimension": 2, "normalize": True}
    new = {"model": "m2", "dimension": 2, "normalize": True}
    compatible = old == new
    e = {"차원 같음": old["dimension"] == new["dimension"], "색인 혼용 허용": compatible}
    return dict(A=a, B=b, C=c, D=d, E=e)


if __name__ == "__main__":
    show(run())
