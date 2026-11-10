/**
 * book_cover.js - AX 실무편 표지, 책 고유 문구, 그리고 이 책의 장면 틀(PR)
 * PR은 이 책의 장 파일에서만 쓴다. 빌드 때 같은 스크립트로 묶여서 장 파일에서 바로 부를 수 있다.
 */

const PR_RED = "#fbe9e9", PR_GREEN = "#e6f4ec";

const PR = {
  // 증상 → 틀린 방식 → 고친 방식 → 숫자. 숫자는 모두 labs/rag-study/practice 실습 결과
  // c = { q, bad: {label, rows: [[글, 1|0|-1], ...]}, good: {...}, metric: {name, bars: [[이름, 값, 표시], ...], max}, caps: [3줄] }
  scene(api, c) {
    const { s, say } = fx.stage(api);
    const q = fx.bubble(api, s, 20, 12, 320, 34, c.q, { c: INK, fs: 11.5, tail: null });
    const panel = (y, d, bad) => {
      const col = bad ? BAD : GUIDE;
      const g = api.n("g", { opacity: 0 }, s);
      api.n("rect", { x: 20, y, width: 320, height: 148, rx: 12, fill: "#fff", filter: "url(#fxsh)" }, g);
      api.n("rect", { x: 20, y, width: 5, height: 148, rx: 2.5, fill: col }, g);
      fx.icon(api, g, bad ? "x" : "check", 42, y + 21, 16, col);
      api.t(d.label, { x: 56, y: y + 26, "font-size": 12, "font-weight": 900, fill: col }, g);
      const rows = d.rows.map(([txt, st], i) => {
        const yy = y + 40 + i * 34;
        const r = api.n("g", { opacity: 0 }, g);
        api.n("rect", { x: 34, y: yy, width: 292, height: 28, rx: 7, fill: st === 1 ? PR_GREEN : st === 0 ? PR_RED : PAPER }, r);
        api.t(txt, { x: 44, y: yy + 18.5, "font-size": 10.8, "font-weight": 700, fill: INK }, r);
        if (st !== -1) {
          api.n("circle", { cx: 312, cy: yy + 14, r: 8, fill: st ? GUIDE : BAD }, r);
          fx.icon(api, r, st ? "check" : "x", 312, yy + 14, 10, "#fff");
        }
        return { r, st, yy };
      });
      const stamp = api.n("g", { opacity: 0 }, g);
      const word = bad ? "실수" : "처방";
      api.n("rect", { x: 270, y: y + 8, width: 56, height: 24, rx: 6, fill: "#fff", stroke: col, "stroke-width": 2, transform: `rotate(-8 298 ${y + 20})` }, stamp);
      api.t(word, { x: 298, y: y + 25, "text-anchor": "middle", "font-size": 12, "font-weight": 900, fill: col, transform: `rotate(-8 298 ${y + 20})` }, stamp);
      return { g, rows, stamp };
    };
    const B = panel(56, c.bad, true), G = panel(212, c.good, false);
    // 숫자 막대
    const m = c.metric;
    const mg = api.n("g", { opacity: 0 }, s);
    api.t(m.name, { x: 20, y: 380, "font-size": 10.5, "font-weight": 800, fill: MUTED }, mg);
    const bars = m.bars.map(([n, v, txt], i) => {
      const y = 388 + i * 17;
      api.t(n, { x: 20, y: y + 10, "font-size": 10, "font-weight": 800, fill: i ? GUIDE : BAD }, mg);
      api.n("rect", { x: 92, y, width: 200, height: 12, rx: 6, fill: PAPER }, mg);
      const b = api.n("rect", { x: 92, y, width: 0, height: 12, rx: 6, fill: i ? GUIDE : BAD }, mg);
      const l = api.t(txt, { x: 298, y: y + 10, "font-size": 10, "font-weight": 900, fill: INK, opacity: 0 }, mg);
      return { b, l, w: 200 * Math.min(1, v / m.max) };
    });
    api.loop(t => {
      t = t % 12.5;
      const out = 1 - seg(t, 12, 12.4);
      q.setAttribute("opacity", seg(t, 0, 0.4) * out);
      [[B, 0.6], [G, 4.6]].forEach(([P, t0]) => {
        P.g.setAttribute("opacity", seg(t, t0, t0 + 0.3) * out);
        P.rows.forEach(({ r, st, yy }, i) => {
          const a = seg(t, t0 + 0.4 + i * 0.45, t0 + 0.7 + i * 0.45);
          const shake = st === 0 && t > t0 + 2.0 && t < t0 + 2.5 ? Math.sin(t * 50) * 2 : 0;
          r.setAttribute("opacity", a);
          r.setAttribute("transform", `translate(${(1 - a) * 12 + shake}, 0)`);
        });
        P.stamp.setAttribute("opacity", seg(t, t0 + 1.9, t0 + 2.1));
      });
      B.g.setAttribute("opacity", (t < 4.6 ? 1 : 0.55) * seg(t, 0.6, 0.9) * out);
      mg.setAttribute("opacity", seg(t, 8.2, 8.5) * out);
      bars.forEach(({ b, l, w }, i) => {
        const g = seg(t, 8.5 + i * 0.4, 9.2 + i * 0.4);
        b.setAttribute("width", w * g);
        l.setAttribute("opacity", g);
      });
      say(t, [[0.3, 4.5, c.caps[0]], [4.6, 8.1, c.caps[1]], [8.2, 12.1, c.caps[2]]]);
    }, 9.5);
  },

  // 권 표지: 실수 카드가 처방으로 뒤집힌다. items = [[실수, 처방], ...]
  volCover(api, items) {
    const { s, say } = fx.stage(api);
    const cards = items.map(([bad, good], i) => {
      const y = 22 + i * 78;
      const g = api.n("g", {}, s);
      const bg = api.n("rect", { x: 20, y, width: 320, height: 64, rx: 12, fill: "#fff", filter: "url(#fxsh)" }, g);
      const strip = api.n("rect", { x: 20, y, width: 5, height: 64, rx: 2.5, fill: BAD }, g);
      const mark = api.n("circle", { cx: 46, cy: y + 32, r: 12, fill: BAD }, g);
      const ic = api.n("g", {}, g);
      fx.icon(api, ic, "x", 46, y + 32, 14, "#fff");
      const ic2 = api.n("g", { opacity: 0 }, g);
      fx.icon(api, ic2, "check", 46, y + 32, 14, "#fff");
      const t1 = api.t(bad, { x: 68, y: y + 28, "font-size": 12, "font-weight": 800, fill: INK }, g);
      const t2 = api.t(good, { x: 68, y: y + 47, "font-size": 10.5, "font-weight": 700, fill: GUIDE, opacity: 0 }, g);
      return { g, strip, mark, ic, ic2, t2, y };
    });
    api.loop(t => {
      t = t % 10;
      const out = 1 - seg(t, 9.5, 9.9);
      cards.forEach(({ g, strip, mark, ic, ic2, t2, y }, i) => {
        fx.rise(g, 0, 0, seg(t, 0.2 + i * 0.25, 0.5 + i * 0.25) * out);
        const f = t > 3.4 + i * 0.7;
        strip.setAttribute("fill", f ? GUIDE : BAD); mark.setAttribute("fill", f ? GUIDE : BAD);
        ic.setAttribute("opacity", f ? 0 : 1); ic2.setAttribute("opacity", f ? 1 : 0);
        t2.setAttribute("opacity", seg(t, 3.4 + i * 0.7, 3.7 + i * 0.7));
      });
      say(t, [[0.3, 3.3, "실무에서 자주 하는 실수들이에요"], [3.4, 9.6, "직접 재현하고, 숫자로 확인하고, 고쳐요"]]);
    }, 8);
  },

  recap(api, title, items) {
    const { s } = fx.stage(api);
    api.t(title, { x: 180, y: 40, "text-anchor": "middle", "font-size": 15, "font-weight": 900, fill: INK }, s);
    const cards = items.map(([w, ic], i) => {
      const g = fx.card(api, s, 30, 64 + i * 66, 300, 52, { title: w, c: GUIDE, icon: ic, fs: 12.5 });
      const ck = api.n("g", { opacity: 0 }, g);
      api.n("circle", { cx: 272, cy: 26, r: 12, fill: GUIDE }, ck);
      fx.icon(api, ck, "check", 272, 26, 16, "#fff");
      return { g, ck, y: 64 + i * 66 };
    });
    api.loop(t => {
      t = t % 7;
      cards.forEach(({ g, ck, y }, i) => {
        fx.rise(g, 30, y, seg(t, 0.2 + i * 0.3, 0.6 + i * 0.3) * (1 - seg(t, 6.4, 6.9)));
        ck.setAttribute("opacity", seg(t, 2.2 + i * 0.3, 2.5 + i * 0.3));
      });
    }, 5);
  },
};

export const BOOK_COVER = {
  title: "AX 실무편: 자주 하는 실수와 감각",
  kicker: "MISTAKES WORTH MAKING ONCE",
  subtitle: "RAG와 에이전트를 만들 때 실무에서 자주 하는 실수 25가지를 직접 재현해요. 장마다 증상, 원인, 실습 숫자, 처방, 그리고 다음에 바로 떠올릴 감각 한 줄로 정리해요.",
  tag: "재현하고, 재고, 고치기",
  color: { accent: "#6d4ac2", ink: "#4b2f8f", soft: "#efe9fb" },
  storageKey: "ax-practice",
  layout: { stage: "1fr", text: "1.875fr" },
  text: {
    coverLeft: "AX 실무편 · 입문편 다음 책",
    coverRight: "자주 하는 실수 25가지",
    coverBadge: "5권 종합본",
    runhead: "AX 실무편",
    labLabel: "감각 한 줄",
    outroLeft: "끝까지 읽었어요",
    outroTag: "5권 완독",
    outroTitle: "실수를 한 번씩 미리 해 봤어요",
    outroBody: `
        <p>데이터를 꺼낼 때, 검색할 때, 답을 만들 때, 평가하고 운영할 때, 에이전트를 돌릴 때 생기는 실수 25가지를 직접 재현했어요. 숫자는 모두 이 맥에서 돌린 결과예요.</p>
        <div class="card" style="margin: 16px 0;"><b>다음 걸음</b>실수 목록을 체크리스트로 두고, 새 기능을 만들 때마다 정답 세트로 한 번 재 보세요. 실습은 <code>labs/rag-study/practice</code>에 그대로 있어요.</div>`,
  },

  scene(api) {
    const { s, say } = fx.stage(api);
    const A = api.accent;
    api.t("자주 하는 실수 25", { x: 180, y: 40, "text-anchor": "middle", "font-size": 16, "font-weight": 900, fill: INK }, s);
    const VOL = ["데이터", "검색", "생성", "평가·운영", "시스템"];
    const tiles = [];
    for (let r = 0; r < 5; r++) {
      api.t(VOL[r], { x: 20, y: 86 + r * 60, "font-size": 10.5, "font-weight": 800, fill: MUTED }, s);
      for (let c = 0; c < 5; c++) {
        const x = 92 + c * 50, y = 64 + r * 60;
        const g = api.n("g", {}, s);
        const bg = api.n("rect", { x, y, width: 42, height: 42, rx: 9, fill: BAD, filter: "url(#fxsh)" }, g);
        const ix = api.n("g", {}, g); fx.icon(api, ix, "x", x + 21, y + 21, 18, "#fff");
        const ok = api.n("g", { opacity: 0 }, g); fx.icon(api, ok, "check", x + 21, y + 21, 18, "#fff");
        tiles.push({ bg, ix, ok, k: r * 5 + c });
      }
    }
    const cnt = api.t("", { x: 180, y: 384, "text-anchor": "middle", "font-size": 13, "font-weight": 900, fill: GUIDE }, s);
    api.loop(t => {
      t = t % 11;
      const n = Math.floor(clamp((t - 1.5) / 6) * 25.99);
      tiles.forEach(({ bg, ix, ok, k }) => {
        const done = k < n;
        bg.setAttribute("fill", done ? GUIDE : BAD);
        ix.setAttribute("opacity", done ? 0 : 1); ok.setAttribute("opacity", done ? 1 : 0);
      });
      cnt.textContent = `${Math.min(25, n)} / 25 재현하고 고침`;
      say(t, [[0.2, 1.4, "실수는 대부분 조용히 일어나요"], [1.5, 10.6, "하나씩 재현하고, 숫자로 확인하고, 고쳐요"]]);
    }, 9);
  },
};
