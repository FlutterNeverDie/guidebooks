"""1단계: 프레임워크 없이 Claude API를 직접 부르고, tool use 루프를 손으로 돌린다.

실행:
    uv run step1_tool_use.py "연차 남은 거 내년에 쓸 수 있어?"

배울 것:
    A. 한 번 호출하면 무엇이 돌아오는가 (content 블록, stop_reason, usage)
    B. tool use 루프: 모델이 도구를 "요청"하고, 실행은 우리 코드가 한다
    C. 키워드 검색의 한계 -> 2단계(임베딩)로 넘어가는 이유
"""

import json
import sys
from pathlib import Path

import anthropic

MODEL = "claude-opus-5-5"
DOCS = json.loads(Path(__file__).with_name("data").joinpath("docs.json").read_text())

client = anthropic.Anthropic()  # ANTHROPIC_API_KEY 또는 `ant auth login` 프로필을 읽는다


def ask(messages, tools=None):
    """API 한 번 호출. LangChain의 ChatModel.invoke()가 안에서 하는 일이 이것이다."""
    return client.beta.messages.create(
        model=MODEL,
        max_tokens=16000,
        system="너는 사내 규정 안내 담당이다. 반드시 도구로 찾은 문서에 근거해 한국어로 짧게 답하고, 근거 문서 id를 끝에 적는다. 찾지 못하면 모른다고 답한다.",
        messages=messages,
        tools=tools or [],
        output_config={"effort": "low"},  # 단순 질의응답이라 low. 품질이 부족하면 medium/high로 올린다
        # 안전 분류기가 거절하면 서버가 권장 모델로 다시 돌린다
        betas=["server-side-fallback-2026-07-01"],
        fallbacks="default",
    )


# --- 도구 정의: 모델에게는 이름, 설명, 입력 스키마만 보인다 -----------------
TOOLS = [
    {
        "name": "search_policy",
        "description": "사내 규정 문서를 키워드로 찾는다. 질문에서 핵심 명사 하나를 골라 넣는다.",
        "input_schema": {
            "type": "object",
            "properties": {"keyword": {"type": "string", "description": "찾을 단어 하나"}},
            "required": ["keyword"],
            "additionalProperties": False,
        },
        "strict": True,
    }
]


def search_policy(keyword: str) -> str:
    """일부러 단순한 키워드 검색. 단어가 그대로 들어 있어야만 찾는다."""
    hits = [d for d in DOCS if keyword in d["title"] or keyword in d["text"]]
    if not hits:
        return f"'{keyword}'가 들어간 문서가 없다."
    return "\n".join(f"[{d['id']}] {d['title']}: {d['text']}" for d in hits)


def run(question: str) -> None:
    messages = [{"role": "user", "content": question}]

    # --- tool use 루프: LangGraph의 "agent 노드 <-> tool 노드" 왕복과 같은 구조 ---
    for turn in range(1, 6):  # 무한 루프 방지
        response = ask(messages, TOOLS)
        print(f"\n[턴 {turn}] stop_reason={response.stop_reason} "
              f"입력 {response.usage.input_tokens} / 출력 {response.usage.output_tokens} 토큰")

        if response.stop_reason == "refusal":
            print("요청이 거절되었다:", response.stop_details)
            return

        # 모델 응답 전체(생각 블록, 도구 호출 포함)를 그대로 대화에 붙인다. 텍스트만 뽑아 붙이면 안 된다
        messages.append({"role": "assistant", "content": response.content})

        tool_calls = [b for b in response.content if b.type == "tool_use"]
        if not tool_calls:
            answer = "".join(b.text for b in response.content if b.type == "text")
            print("\n=== 최종 답 ===\n" + answer)
            return

        results = []
        for call in tool_calls:
            print(f"  모델이 요청한 도구: {call.name}({call.input})")
            output = search_policy(**call.input)  # 실행은 모델이 아니라 우리 코드가 한다
            print("  도구 결과:", output.replace("\n", " | ")[:200])
            results.append({"type": "tool_result", "tool_use_id": call.id, "content": output})
        # 같은 턴의 도구 결과는 한 user 메시지에 모아 보낸다
        messages.append({"role": "user", "content": results})

    print("턴 한도에 걸렸다.")


if __name__ == "__main__":
    run(sys.argv[1] if len(sys.argv) > 1 else "연차 남은 거 내년에 쓸 수 있어?")
