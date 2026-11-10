BOOKS.push({
  no: 1,
  series: "연구원을 위한 AI 그림책",
  kicker: "HOW AI TALKS",
  title: "AI는 어떻게 말을 할까",
  subtitle: "AI를 한 번도 배워 본 적 없어도 괜찮아요.<br>실험실 이야기로 AI의 작동 원리를 5장에 걸쳐 풀어 볼게요.",
  color: { accent: "#6d4ae0", ink: "#3f2a9e", soft: "#f1ecff" },
  coverTag: "AI 안에서 일어나는 일들",
  recapTag: "1권에서 배운 것",

  coverScene(api) {
    const s = api.svg();
    // 신경망 파동 씬: 입력 노드 → 중간 레이어 → 출력 노드, 전기 신호가 흘러가는 그래프
    const A = api.accent;
    const INK2 = "#3f2a9e";

    // 레이어 x 위치 및 노드 y 위치 정의
    const layers = [
      { x: 60,  ys: [90, 155, 220],        label: "입력" },
      { x: 160, ys: [70, 130, 190, 250],   label: "은닉" },
      { x: 260, ys: [70, 130, 190, 250],   label: "은닉" },
      { x: 360, ys: [110, 180],            label: "출력" },
    ];

    // 엣지(연결선) 먼저 그리기 — 신호 흐름 색 변화용으로 배열에 저장
    const edges = [];
    for (let li = 0; li < layers.length - 1; li++) {
      for (const y1 of layers[li].ys) {
        for (const y2 of layers[li + 1].ys) {
          const line = api.n("line", {
            x1: layers[li].x, y1,
            x2: layers[li + 1].x, y2,
            stroke: "#e0d9f8", "stroke-width": 1.2,
          }, s);
          // 어느 레이어(li)에서 출발하는지 저장
          edges.push({ line, li });
        }
      }
    }

    // 노드(원) 그리기 — 레이어 인덱스도 저장
    const nodes = [];
    layers.forEach((layer, li) => {
      layer.ys.forEach(cy => {
        const c = api.n("circle", {
          cx: layer.x, cy, r: 14,
          fill: li === 0 ? "#fff" : li === layers.length - 1 ? A : "#fff",
          stroke: A, "stroke-width": 2,
        }, s);
        nodes.push({ c, li, cy, cx: layer.x });
      });
    });

    // 레이어 레이블
    layers.forEach(l => {
      api.t(l.label, { x: l.x, y: 286, "text-anchor": "middle", "font-size": 10, "font-weight": 700, fill: "#9d8ecf" }, s);
    });

    // 상단 타이틀
    api.t("다음 단어 예측 중...", { x: 200, y: 38, "text-anchor": "middle", "font-size": 13, "font-weight": 800, fill: A }, s);

    // 신호 전파 애니메이션 — 각 레이어에 빛이 순서대로 켜짐
    api.loop(t => {
      // 4초 주기, 레이어별로 0.8초 간격으로 점등
      const cycle = t % 4;
      nodes.forEach(({ c, li }) => {
        const phase = li * 0.8; // 레이어 딜레이
        const on = cycle > phase && cycle < phase + 0.7;
        c.setAttribute("fill", on ? A : li === layers.length - 1 ? A : "#fff");
        c.setAttribute("opacity", on ? 1 : li === layers.length - 1 ? 0.45 : 0.85);
      });
      edges.forEach(({ line, li }) => {
        const phase = li * 0.8 + 0.3;
        const on = cycle > phase && cycle < phase + 0.6;
        line.setAttribute("stroke", on ? A : "#e0d9f8");
        line.setAttribute("stroke-width", on ? 2.2 : 1.2);
        line.setAttribute("opacity", on ? 1 : 0.5);
      });
    }, 0);
  },
