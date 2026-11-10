"""7단계: 작은 온톨로지와 지식 그래프. API 키 없이 로컬에서 돈다.

실행:
    uv run step7_ontology.py

배울 것:
    A. 온톨로지 = 클래스(사람, 팀, 본부, 장비, 규정, 역할)와 관계, 그리고 관계마다 '무엇에서 무엇으로'라는 제약
    B. 문장에서 (주어, 관계, 목적어) 세 개짜리 사실을 뽑고, 제약에 안 맞는 사실은 막는다
       (실무에서는 LLM이 뽑고 사람이 검토한다. 여기서는 문장 모양이 정해져 있어 정규식으로 뽑는다)
    C. 그래프에서는 여러 단계 질문을 경로를 따라가며 푼다
    D. 같은 사실을 벡터 검색에 넣으면, 여러 단계 질문에 필요한 사실을 다 가져오지 못한다
    E. GraphRAG: 질문에 나온 대상에서 그래프를 펼쳐 필요한 사실을 모아 LLM에 넘긴다
"""

import re
from pathlib import Path

import networkx as nx
import numpy as np
from fastembed import TextEmbedding

LINES = [l.strip() for l in Path(__file__).with_name("data").joinpath("org.md").read_text().splitlines()
         if l.strip().endswith("다.") and not l.startswith("실습용")]

# ---------- A. 온톨로지(스키마) ----------
RELATIONS = {  # 관계: (주어 클래스, 목적어 클래스)
    "소속": ("사람", "팀"),
    "속함": ("팀", "본부"),
    "팀장": ("팀", "사람"),
    "본부장": ("본부", "사람"),
    "사용": ("사람", "장비"),
    "알림": ("규정", "팀"),
    "승인역할": ("규정", "역할"),
}


def kind(name: str) -> str:
    """대상이 어느 클래스인지. 실무에서는 이것도 추출 단계에서 정한다."""
    if name in ("팀장", "본부장"):
        return "역할"
    if name.endswith("본부"):
        return "본부"
    if name.endswith("팀"):
        return "팀"
    if name.startswith("노트북-"):
        return "장비"
    if name.endswith("규정"):
        return "규정"
    return "사람"


# ---------- B. 추출과 검증 ----------
PATTERNS = [
    (r"^(\S+)의 본부장은 (\S+?)이다\.$", "본부장"),
    (r"^(\S+?)은 (\S+?)에 속한다\.$", "속함"),
    (r"^(\S+)의 팀장은 (\S+?)이다\.$", "팀장"),
    (r"^(\S+?)[은는] (\S+) 소속이다\.$", "소속"),
    (r"^(\S+?)[은는] (\S+?)[을를] 쓴다\.$", "사용"),
    (r"^(.+ 규정)은 (\S+?)에 알리게 한다\.$", "알림"),
    (r"^(.+ 규정)의 (?:새 기기 )?승인자는 (\S+?)이다\.$", "승인역할"),
]


def extract(line: str) -> tuple[str, str, str] | None:
    for pat, rel in PATTERNS:
        m = re.match(pat, line)
        if m:
            return (m.group(1), rel, m.group(2))
    return None


def build_graph() -> nx.MultiDiGraph:
    print("=== A, B. 문장 -> 사실 -> 제약 검사 -> 그래프 ===")
    g = nx.MultiDiGraph()
    for line in LINES:
        t = extract(line)
        if not t:
            print(f"   못 뽑음: {line}")
            continue
        s, rel, o = t
        want = RELATIONS[rel]
        got = (kind(s), kind(o))
        if got != want:
            print(f"   막음: ({s}, {rel}, {o}) -> '{rel}'은 {want[0]}->{want[1]}인데 {got[0]}->{got[1]}이에요")
            continue
        g.add_node(s, kind=got[0])
        g.add_node(o, kind=got[1])
        g.add_edge(s, o, rel=rel, text=line)
    print(f"   사실 {g.number_of_edges()}개, 대상 {g.number_of_nodes()}개로 그래프를 만들었어요")
    return g


def follow(g: nx.MultiDiGraph, node: str, rel: str) -> tuple[str, str]:
    """node에서 rel 관계를 한 칸 따라간다. (도착 대상, 근거 문장)"""
    for _, o, d in g.out_edges(node, data=True):
        if d["rel"] == rel:
            return o, d["text"]
    raise KeyError(f"{node} -{rel}-> 없음")


def approver(g: nx.MultiDiGraph, person: str, rule: str) -> tuple[str, list[str]]:
    """사람과 규정으로 승인자를 찾는다. 따라간 근거 문장도 돌려준다."""
    role, t1 = follow(g, rule, "승인역할")
    team, t2 = follow(g, person, "소속")
    if role == "팀장":
        boss, t3 = follow(g, team, "팀장")
        return boss, [t1, t2, t3]
    hq, t3 = follow(g, team, "속함")
    boss, t4 = follow(g, hq, "본부장")
    return boss, [t1, t2, t3, t4]


QUESTIONS = [
    ("김하나가 노트북 잃어버리면 새 기기는 누가 승인해?", "김하나", "노트북 분실 규정"),
    ("박세나가 해외 출장 가려면 누가 승인해?", "박세나", "해외 출장 규정"),
]


def part_c(g: nx.MultiDiGraph) -> None:
    print("\n=== C. 그래프로 여러 단계 질문 풀기 ===")
    for q, person, rule in QUESTIONS:
        boss, path = approver(g, person, rule)
        print(f"Q: {q}\n   -> {boss}  (근거 {len(path)}개를 따라감)")
        for t in path:
            print(f"      {t}")
    notify, t = follow(g, "노트북 분실 규정", "알림")
    print(f"Q: 노트북 잃어버리면 어디에 알려?\n   -> {notify}  ({t})")


def part_d_e(g: nx.MultiDiGraph) -> None:
    print("\n=== D. 같은 사실을 벡터 검색에 넣으면 ===")
    facts = [d["text"] for _, _, d in g.edges(data=True)]
    model = TextEmbedding("sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")
    vec = np.array(list(model.embed(facts)))
    vec /= np.linalg.norm(vec, axis=1, keepdims=True)
    for q, person, rule in QUESTIONS:
        _, need = approver(g, person, rule)
        qv = np.array(list(model.embed([q])))[0]
        order = np.argsort(-(vec @ (qv / np.linalg.norm(qv))))
        for k in (3, 5):
            got = [facts[i] for i in order[:k]]
            have = sum(n in got for n in need)
            print(f"Q: {q} | 상위 {k}개에 필요한 사실 {have}/{len(need)}개")
        missing = [n for n in need if n not in [facts[i] for i in order[:5]]]
        for n in missing:
            print(f"      빠짐(상위 5개 밖, {list(order).index(facts.index(n)) + 1}위): {n}")

    print("\n=== E. GraphRAG: 질문 속 대상에서 그래프를 펼쳐 사실 모으기 ===")
    for q, _, _ in QUESTIONS:
        # 1) 질문에 나온 대상 찾기. 이름이 그대로 있거나, 규정 이름의 단어가 하나라도 있으면
        #    (실무에서는 LLM이나 벡터 검색으로 찾는다. 단어 하나 기준이라 관계없는 규정도 조금 섞인다)
        seeds = [n for n in g.nodes if n in q or (g.nodes[n]["kind"] == "규정" and any(w in q for w in n.split()[:-1]))]
        # 2) 두세 칸 펼치기
        sub = set(seeds)
        for _ in range(3):
            sub |= {o for n in list(sub) for _, o in g.out_edges(n)}
        ctx = sorted({d["text"] for s, _, d in g.edges(data=True) if s in sub})
        print(f"Q: {q}\n   시작 대상 {seeds} -> 펼친 사실 {len(ctx)}개를 LLM에 넘김")
        for t in ctx:
            print(f"      {t}")


if __name__ == "__main__":
    graph = build_graph()
    part_c(graph)
    part_d_e(graph)
