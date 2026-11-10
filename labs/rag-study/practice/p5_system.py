"""실무편 5권: 에이전트와 시스템에서 자주 하는 실수. ai-native에 실제로 있는 대응을 작게 재현한다. LLM 없이 돈다.

실행 (rag-study 폴더에서):
    uv run practice/p5_system.py

A. 금지를 프롬프트 문장으로만 건다              (ai-native: block-risky.sh 훅, 워커 단계에 토큰 없음)
B. 비밀값이 로그와 답에 남는다                  (ai-native: ask_run.sh의 MCP 로그 지우기, slackSafe.ts의 redact)
C. 출력을 거르는 정규식이 긴 글에서 느려진다     (ai-native: redact 제곱 시간 수정 커밋)
D. 모델 출력 형식을 그대로 믿는다               (ai-native: extract_json.py, ask_check.py의 BAD_OUTPUT)
E. 턴·시간 제한 없이 에이전트를 돌린다          (ai-native: --max-turns, machine.ts의 LIMITS)
"""

import json
import random
import re
import time


def part_a() -> None:
    print("=== A. 금지를 프롬프트로만 걸면 ===")
    # 에이전트가 실제로 시도한 수정 경로라고 치자. 대부분은 정상, 가끔 금지 경로가 섞인다
    rnd = random.Random(1)
    allowed = ["lib/ui/home.dart", "lib/ui/cart.dart", "assets/logo.png", "lib/l10n/ko.arb"]
    forbidden = ["lib/features/pay/approve.dart", ".github/workflows/deploy.yml", "packages/kiosk_core/van.dart"]
    tries = [rnd.choice(forbidden) if rnd.random() < 0.03 else rnd.choice(allowed) for _ in range(1000)]
    blocked_pattern = re.compile(r"^(lib/features/pay/|\.github/|packages/kiosk_core/)")
    def hook(path: str) -> bool:
        """수정 전에 부르는 검사. True면 막는다 (block-risky.sh가 하는 일)."""
        return bool(blocked_pattern.match(path))
    attempts = sum(bool(blocked_pattern.match(p)) for p in tries)
    slipped = sum(bool(blocked_pattern.match(p)) and not hook(p) for p in tries)
    print(f"   가정: 에이전트가 3% 확률로 지시를 어긴다. 수정 시도 1,000번 중 금지 경로 시도 {attempts}번")
    print(f"   프롬프트만: {attempts}번 그대로 수정됨   수정 전 훅으로 경로 검사: {slipped}번")
    print("   지시는 확률로 지켜지고, 코드 검사는 매번 지켜져요. 막아야 하는 건 코드로 막아요")


SECRET_PATTERNS = [
    (re.compile(r"(https?://[^\s/]+/[^\s?]*\?)[^\s]*(key|token)=[^\s&]+", re.I), r"\1[가림]"),
    (re.compile(r"\b(xox[abpr]-)[\w-]+"), r"\1[가림]"),
    (re.compile(r"\b(gh[opsu]_)[A-Za-z0-9]{10,}"), r"\1[가림]"),
]


def mask(text: str) -> str:
    for re_, rep in SECRET_PATTERNS:
        text = re_.sub(rep, text)
    return text


def part_b() -> None:
    print("\n=== B. 비밀값이 로그와 답에 남으면 ===")
    log = [
        "[mcp] connecting https://guide.example.com/mcp?key=EXAMPLE0KEY0NOT0REAL",
        "[slack] posting with token xoxb-EXAMPLE-NOT-REAL",
        "[git] push with ghp_EXAMPLE0NOT0REAL",
        "[ask] 답변: 오류 8006은 카드 한도 초과예요",
    ]
    for line in log:
        print(f"   원본  {line}")
        print(f"   가림  {mask(line)}")
    print("   도구가 남기는 로그(MCP 로그 등)는 내가 쓰는 로그가 아니라서 놓치기 쉬워요. 실행 전후로 지우거나 가려요")


def part_c() -> None:
    print("\n=== C. 출력을 거르는 정규식이 긴 글에서 느려지면 ===")
    old = re.compile(r"\b[a-z]{2,}[a-z0-9]*[A-Z]\w*\b")   # 고치기 전 모양: 두 반복이 같은 글자를 나눠 가짐
    new = re.compile(r"\b[a-z]{2}[a-z0-9]*[A-Z]\w*\b")    # 고친 모양: 앞을 두 글자로 고정
    for n in (2000, 4000, 8000):
        text = "a" * n  # 대문자 없는 아주 긴 낱말 (붙여 쓴 영문, 해시, 긴 주소 조각 같은 입력)
        t = []
        for re_ in (old, new):
            t0 = time.perf_counter(); re_.findall(text); t.append((time.perf_counter() - t0) * 1000)
        print(f"   {n:>5}자  고치기 전 {t[0]:8.1f}ms   고친 뒤 {t[1]:6.2f}ms")
    print("   길이가 2배면 고치기 전은 약 4배(제곱). 걸러내는 코드도 긴 입력으로 시험해요")


RAW_OUTPUTS = [
    '{"found": true, "answer": "8006은 카드 한도 초과예요"}',
    '```json\n{"found": true, "answer": "8006은 카드 한도 초과예요"}\n```',
    '확인해 보니 이래요.\n{"found": true, "answer": "8006은 카드 한도 초과예요"}',
    '{"found": "yes", "answer": "8006은 카드 한도 초과예요"}',
    '{"found": true}',
    '답을 찾지 못했어요.',
]


def extract(text: str):
    """코드 블록 표시를 떼고 첫 JSON 객체를 꺼낸다."""
    text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text.strip())
    start = text.find("{")
    if start < 0:
        return None
    try:
        obj, _ = json.JSONDecoder().raw_decode(text[start:])
        return obj
    except json.JSONDecodeError:
        return None


def valid(obj) -> bool:
    return isinstance(obj, dict) and isinstance(obj.get("found"), bool) and isinstance(obj.get("answer"), str)


def part_d() -> None:
    print("\n=== D. 모델 출력 형식을 그대로 믿으면 ===")
    for raw in RAW_OUTPUTS:
        try:
            json.loads(raw); naive = "읽음"
        except json.JSONDecodeError:
            naive = "오류"
        obj = extract(raw)
        safe = "통과" if valid(obj) else "BAD_OUTPUT"
        print(f"   json.loads {naive:<3} | 꺼내기+검증 {safe:<10} | {raw[:40].replace(chr(10), ' ')}")
    print("   그냥 읽으면 멀쩡한 답도 버리고(코드 블록), 틀린 답도 받아들여요(found가 문자열). 꺼낸 뒤 스키마로 검증해요")


def part_e() -> None:
    print("\n=== E. 턴 제한 없이 돌리면 ===")
    per_turn_new, system = 600, 3000  # 턴마다 새로 붙는 토큰(도구 결과 등), 처음 지시
    total, hist = 0, system
    rows = []
    for turn in range(1, 41):
        total += hist  # 턴마다 지금까지의 대화를 다시 보낸다
        hist += per_turn_new
        if turn in (6, 10, 20, 40):
            rows.append((turn, total))
    for turn, tok in rows:
        print(f"   {turn:>2}턴에서 멈추면 누적 입력 {tok:>9,}토큰")
    print("   대화가 길어질수록 턴마다 보내는 양이 늘어서, 누적은 턴 수의 제곱에 가깝게 커져요")
    print("   프롬프트 캐싱이 비용을 줄여 주지만, 지연과 컨텍스트 한도는 그대로 늘어요")
    print("   ai-native는 질문 6턴, 중앙 40턴, 워커 80턴으로 끊고, 단계마다 시간 한도(15분, 15분, 50분)를 둬요")


if __name__ == "__main__":
    part_a()
    part_b()
    part_c()
    part_d()
    part_e()
