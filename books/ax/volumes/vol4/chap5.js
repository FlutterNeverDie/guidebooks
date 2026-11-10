export default {
      title: "한계와 대응",
      tag: "답이 없어도 무언가를 찾아오고, 자료가 낡거나 위험할 수 있어요",
      lead: "검색은 답이 없는 질문에도 가장 비슷한 조각을 돌려줘요. 점수로 거르면 될 것 같지만 실제로 재 보면 답이 있는 질문과 점수가 겹쳐요. 이 장에서는 이런 구조적 한계와, 실무에서 쓰는 대응을 정리해요.",
      body: `
<h3>답이 없는 질문: 점수로는 못 거른다</h3>
<p>정답 세트에 문서에 없는 질문 5개를 넣었어요(육아휴직, 헬스장, 스톡옵션, 명절 선물, 야근 식대). 다섯 개 모두 그럴듯한 조각을 1위로 돌려받았어요. 재정렬 최고점은 답 없는 질문이 -8.99~-4.33, 답 있는 질문이 -8.36~6.56이었어요. -4.33 아래를 버리면 답 있는 질문 22개 중 3개도 같이 버려져요.</p>
<p>'야근 식대'는 특히 까다로워요. 문서에 '식대' 규정은 있지만 '야근 식대'는 없어서, 식대 문단이 1위로 나와요. LLM이 이걸 보고 "5만 원"이라고 답하면 그럴듯한 오답이 돼요.</p>
<ul>
  <li>프롬프트에 <b>"자료에 없으면 없다고 답하라"</b>를 넣고, 정답 세트에 답 없는 질문을 넣어 <b>"모른다"고 답하는지도 재요</b>.</li>
  <li>답이 나가기 전에 <b>근거 검사</b>(3장)를 거쳐요.</li>
</ul>

<h3>그 밖의 한계</h3>
<table class="vs">
  <tr><th>한계</th><th>무슨 일</th><th>대응</th></tr>
  <tr><td>낡은 색인</td><td>문서를 고쳤는데 옛 조각이 검색돼요. 지운 문서가 남아요</td><td>문서 ID로 조각을 묶어 바꿀 때 통째로 지우고 다시 넣기, 변경 감지 후 재색인</td></tr>
  <tr><td>버전 충돌</td><td>옛 규정과 새 규정이 같이 나와요</td><td>수정일·버전 메타데이터, 최신 우선, 옛 문서 빼기</td></tr>
  <tr><td>권한</td><td>볼 수 없는 문서가 답에 섞여요</td><td>검색 단계에서 필터(3권 5장)</td></tr>
  <tr><td>부정과 숫자</td><td>'된다'와 '안 된다'를 못 가려요</td><td>후보는 넉넉히, 판단은 LLM이 원문으로(2권 4장)</td></tr>
  <tr><td>문서 속 지시</td><td>문서에 "앞의 지시를 무시하라" 같은 글이 있으면 그대로 프롬프트에 들어가요</td><td>자료는 자료일 뿐 지시가 아니라고 프롬프트에 적고, 도구 권한을 좁히고, 출력을 검사</td></tr>
</table>

<div class="try"><span class="lbl">직접 해 보기</span>
<p><code>rag-study/step6_eval.py</code>: D 부분이 답 없는 질문 실험이에요. <code>data/eval.json</code>의 <code>unanswerable</code>에 질문을 더해 봐요.</p></div>`,
      lab: "검색 결과가 <b>항상 200 OK</b>인 API와 같아요. 해당 데이터가 없어도 404가 아니라 '가장 비슷한 것'을 돌려줘요. 그래서 호출하는 쪽(LLM과 검사 코드)이 '이게 정말 답인가'를 따로 판단해야 해요. 그리고 색인은 <b>캐시</b>라서 원본이 바뀌면 무효화 전략이 필요해요.",
      quiz: {
        q: "문서에 없는 '야근 식대' 질문에 검색이 일반 '식대' 문단을 1위로 줬어요. 가장 알맞은 대응은?",
        options: ["점수 문턱을 아주 높여 거의 모든 결과를 버린다", "자료에 없으면 없다고 답하게 지시하고, 답 없는 질문도 정답 세트에 넣어 잰다", "임베딩 차원을 늘린다"], answer: 1,
        explain: "점수 범위가 겹쳐서 문턱만으로는 답 있는 질문도 같이 버려요. 지시와 근거 검사, 그리고 '모른다'를 제대로 하는지 재는 평가를 같이 써요.",
      },
      scene(api) {
        const { s, say } = fx.stage(api);
        const A = api.accent;
        // 재정렬 최고점 분포 (step6_eval D 실측)
        const YES = [-8.36, -8.35, -7.36, -3.79, -2.98, -2.88, -2.67, -2.61, -2.51, -2.39, -2.18, -1.12, -0.8, -0.36, 0.07, 0.39, 0.42, 0.72, 1.46, 3.16, 3.3, 6.56];
        const NO = [-6.87, -5.02, -8.99, -7.2, -4.33];
        const NON = ["육아휴직", "헬스장", "스톡옵션", "명절 선물", "야근 식대"];
        api.n("rect", { x: 20, y: 14, width: 320, height: 248, rx: 12, fill: "#fff", filter: "url(#fxsh)" }, s);
        api.t("재정렬 최고점 (실측)", { x: 34, y: 38, "font-size": 12, "font-weight": 800, fill: INK }, s);
        const X = v => 46 + (v + 9.5) / 17 * 272;
        api.n("line", { x1: 40, y1: 150, x2: 324, y2: 150, stroke: LINE, "stroke-width": 1.6 }, s);
        [-8, -4, 0, 4].forEach(v => api.t(String(v), { x: X(v), y: 168, "text-anchor": "middle", "font-size": 10, fill: MUTED }, s));
        api.t("답 있는 질문 22개", { x: 34, y: 66, "font-size": 10.5, "font-weight": 800, fill: GUIDE }, s);
        api.t("답 없는 질문 5개", { x: 34, y: 226, "font-size": 10.5, "font-weight": 800, fill: BAD }, s);
        const yes = YES.map((v, i) => api.n("circle", { cx: X(v), cy: 120 - (i % 3) * 14, r: 5.5, fill: GUIDE, opacity: 0 }, s));
        const no = NO.map((v, i) => {
          const g = api.n("g", { opacity: 0 }, s);
          api.n("circle", { cx: X(v), cy: 182 + (i % 2) * 16, r: 6, fill: BAD }, g);
          return g;
        });
        const night = api.t("야근 식대", { x: X(-4.33) + 9, y: 186, "font-size": 10, "font-weight": 800, fill: BAD, opacity: 0 }, s);
        const band = api.n("rect", { x: X(-8.99), y: 80, width: X(-4.33) - X(-8.99), height: 136, rx: 6, fill: HARN, opacity: 0 }, s);
        const cut = api.n("line", { x1: X(-4.33), y1: 76, x2: X(-4.33), y2: 230, stroke: HARN, "stroke-width": 2, "stroke-dasharray": "4 3", opacity: 0 }, s);
        const cutT = api.t("여기서 자르면 답 있는 질문 3개도 버려져요", { x: 34, y: 248, "font-size": 11, "font-weight": 800, fill: HARN, opacity: 0 }, s);
        // 야근 식대 예시
        const q = fx.bubble(api, s, 20, 278, 200, 32, "야근 식대는 얼마야?", { c: INK, fs: 12, tail: "left" });
        const hit = fx.card(api, s, 20, 320, 320, 40, { title: "1위: 4. 경비 처리 > 식대가 1회 5만 원을 넘으면…", c: HARN, fs: 11 });
        const ans = fx.bubble(api, s, 110, 368, 230, 34, "", { c: GUIDE, fs: 11.5, tail: null });
        api.loop(t => {
          t = t % 13;
          yes.forEach((d, i) => d.setAttribute("opacity", seg(t, 0.3 + i * 0.05, 0.6 + i * 0.05)));
          no.forEach((g, i) => g.setAttribute("opacity", seg(t, 1.8 + i * 0.2, 2.1 + i * 0.2)));
          night.setAttribute("opacity", seg(t, 2.8, 3.1));
          band.setAttribute("opacity", 0.12 * seg(t, 3.4, 3.8));
          cut.setAttribute("opacity", seg(t, 4.2, 4.5));
          cutT.setAttribute("opacity", seg(t, 4.5, 4.8));
          yes.forEach((d, i) => d.setAttribute("stroke", t > 4.5 && YES[i] <= -4.33 ? BAD : "none"));
          yes.forEach((d, i) => d.setAttribute("stroke-width", 2.4));
          q.setAttribute("opacity", seg(t, 6.6, 7.0));
          hit.setAttribute("opacity", seg(t, 7.4, 7.8));
          ans.setAttribute("opacity", seg(t, 8.8, 9.1));
          fx.type(ans.textEl, t < 10.6 ? "1회 5만 원이에요" : "자료에 야근 식대는 없어요", seg(t, 9.0, 9.8) * (t < 10.6 ? 1 : seg(t, 10.7, 11.5)));
          ans.textEl.setAttribute("fill", t < 10.6 ? BAD : GUIDE);
          say(t, [[0.2, 3.3, "답이 없어도 검색은 무언가를 돌려줘요"], [3.4, 6.5, "점수 범위가 겹쳐 문턱 하나로는 못 걸러요"], [6.6, 10.5, "비슷한 문단이 오면 그럴듯한 오답이 나와요"], [10.6, 12.8, "자료에 없으면 없다고 답하게 해요"]]);
        }, 11.8);
      },
    }
