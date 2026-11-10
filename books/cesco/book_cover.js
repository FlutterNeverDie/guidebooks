/**
 * book_cover.js - 전체 단행본 표지 데이터 및 애니메이션
 *
 * "신서아를 위한 AI 에이전트 업무 사용 입문편"
 */

export const BOOK_COVER = {
  title: "신서아를 위한 AI 에이전트 업무 사용 입문편",
  kicker: "CESCO LAB AI PLAYBOOK",
  subtitle: "세스코 식품안전·이물 분석 연구원 신서아 님을 위한 맞춤 실전 가이드.<br>코딩 한 줄 없이, 실험실 이야기로 AI 원리부터 실무 에이전트까지 한 권으로 끝내요.",
  tag: "신서아 연구원 맞춤 실전 플레이북",
  color: { accent: "#0f9b8e", ink: "#0a6b62", soft: "#e3f6f3" },
  storageKey: "cesco-ai-playbook-single",
  // 런타임 머리글·꼬리말·에필로그 문구 (공통 엔진 이전과 같은 문구)
  text: {
    coverLeft: "세스코 식품안전연구소 · 맞춤 실전 가이드",
    coverRight: "신서아 연구원 전용 플레이북",
    coverBadge: "단행본 종합본",
    runhead: "신서아를 위한 실전 AI 플레이북",
    labLabel: "실험실로 바꾸면",
    outroLeft: "단행본 완독을 축하합니다!",
    outroTag: "5부작 + 특강 + 세스코 실전 완독",
    outroTitle: "축하합니다! 신서아 연구원님, 전 과정을 마쳤어요",
    outroBody: `
        <p style="font-size: 16px; line-height: 1.8; color: var(--body);">
          AI의 가장 밑바닥 원리부터 시작해서 프롬프트 SOP 지시서, 도구 사용과 에이전트 루프, 현미경 멀티모달의 한계, 
          그리고 <b>지침(Hook), 스킬(Skill), 검증(Harness)</b>으로 나만의 맞춤 에이전트를 조련하는 방법까지 한 권으로 모두 둘러보았습니다.
        </p>
        <div class="card" style="margin: 16px 0;">
          <b>연구원의 무기</b>
          <q>지루하고 반복적인 문서 정리와 초안 작성은 AI에게 맡기고, 신서아 연구원님은 현미경 관찰의 손끝 감각과 최종 판정의 날인에 집중하세요.</q>
        </div>
        <p style="font-size: 15.5px; line-height: 1.8;">
          이제 연구실 컴퓨터를 켜고 가벼운 마음으로 첫 번째 입력 양식을 던져 보세요.<br>
          3일 뒤면 든든한 시니어 조수 한 명이 연구원님 옆에서 일하고 있을 거예요!
        </p>`,
  },

  scene(api) {
    const s = api.svg();
    // 중앙 빛나는 AI 에이전트 코어
    api.n("circle", { cx: 200, cy: 150, r: 68, fill: api.accent, opacity: 0.12 }, s);
    const core = api.n("circle", { cx: 200, cy: 150, r: 46, fill: api.accent }, s);
    api.t("CESCO", { x: 200, y: 144, "text-anchor": "middle", "font-size": 13, "font-weight": 800, fill: "rgba(255,255,255,0.85)", "letter-spacing": "0.1em" }, s);
    api.t("AI", { x: 200, y: 168, "text-anchor": "middle", "font-size": 22, "font-weight": 900, fill: "#fff" }, s);

    // 연구원과 업무 상징 키워드들
    const items = [
      { text: "신서아 연구원", c: "#0a6b62", bg: "#e3f6f3" },
      { text: "이물 분석 · FT-IR", c: "#1f3f8a", bg: "#e8eefb" },
      { text: "성적서 요약", c: "#24692f", bg: "#e8f5e9" },
      { text: "엑셀 정리", c: "#9a4d0b", bg: "#fdf0e3" },
      { text: "스킬 & 하네스", c: "#7d1f47", bg: "#fbe8f0" },
      { text: "업무 에이전트", c: "#0a6b62", bg: "#e3f6f3" },
    ];

    const chips = items.map(it => {
      const g = api.n("g", {}, s);
      const wdt = it.text.length * 13 + 26;
      api.n("rect", { x: -wdt / 2, y: -15, width: wdt, height: 30, rx: 15, fill: it.bg, stroke: it.c, "stroke-width": 1.5 }, g);
      api.t(it.text, { x: 0, y: 5, "text-anchor": "middle", "font-size": 12, "font-weight": 700, fill: it.c }, g);
      return g;
    });

    api.loop(t => {
      core.setAttribute("r", 46 + Math.sin(t * 2) * 3);
      chips.forEach((g, i) => {
        const a = t * 0.35 + (i / chips.length) * Math.PI * 2;
        const x = 200 + Math.cos(a) * 145;
        const y = 150 + Math.sin(a) * 105;
        g.setAttribute("transform", `translate(${x},${y})`);
      });
    }, 0);
  }
};
