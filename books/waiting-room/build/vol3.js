BOOKS.push({
  no: 3,
  short: "손님 쪽 코드",
  series: "웨이팅룸 코드 읽기",
  kicker: "FROM THE BROWSER TO THE SERVER",
  title: "손님 화면에서 서버까지",
  subtitle: "서버 바깥에 있는 코드들이에요.<br>브라우저 SDK, 대기 페이지, 엣지 함수, PHP 코드, 관리자 웹이 서버와 어떻게 이어지는지 봐요.",
  color: { accent: "#0f9b8e", ink: "#0a6b62", soft: "#e3f6f3" },
  labLabel: "쉽게 비유하면",
  coverTag: "손님 쪽 코드 다섯 가지",
  recapTag: "3권에서 배운 것",

  coverScene(api) {
    const s = api.svg();
    const srv = api.box(s, 150, 115, 100, 70, "서버", { sub: "server/", stroke: api.accent, fill: "#e3f6f3" });
    const names = ["sdk-js", "waitpage", "edge", "sdk-php", "admin"];
    const chips = names.map(n => api.box(s, 0, 0, 84, 30, n, { size: 13, rx: 15, stroke: api.accent }));
    const lines = names.map(() => api.n("line", { stroke: api.accent, "stroke-opacity": .4, "stroke-width": 1.5, "stroke-dasharray": "4 4" }, s));
    lines.forEach(l => s.insertBefore(l, s.firstChild));
    api.loop(t => {
      chips.forEach((c, i) => {
        const a = t * .25 + i * Math.PI * 2 / 5;
        const x = 200 + Math.cos(a) * 150, y = 150 + Math.sin(a) * 110;
        c.setAttribute("transform", `translate(${x - 42},${y - 15})`);
        api.set(lines[i], { x1: x, y1: y, x2: 200, y2: 150, "stroke-dashoffset": -t * 20 });
      });
    }, 0);
  },

  chapters: [
    {
      title: "브라우저 SDK: 줄 서기를 대신 돌려 주는 코드",
      tag: "enter → status 반복 → pass → renew 반복",
      lead: "손님은 버튼 한 번만 눌러요. 나머지(줄 서기, 몇 초마다 조회, 차례가 되면 입장권 받기, 30초마다 연장)는 sdk-js가 자동으로 돌려요. 핵심은 src/core/client.ts 한 파일이에요.",
      body: `
<h3>client.ts가 도는 순서</h3>
<ol class="steps">
  <li><code>enter</code><small>NOT_OPEN · PRE · WAIT이면 서버가 준 nextPollMs만큼 기다려요.</small></li>
  <li><code>status</code> 반복<small>READY가 될 때까지. 사이사이 숫자는 countdown.ts가 1초마다 줄여 보여 줘요(서버 값은 아니에요).</small></li>
  <li><code>pass</code><small>입장권을 메모리와 쿠키 <code>wr_pass_{seg}</code>에 저장해요.</small></li>
  <li><code>renew</code> 반복<small>페이지가 보이는 동안 30초마다. 보이는지는 visibility.ts가 봐요.</small></li>
</ol>
<h3>폴더 안</h3>
<table class="map">
  <tr><th>파일</th><th>하는 일</th></tr>
  <tr><td><code>core/client.ts</code></td><td>위 흐름 전체, 장애 처리 (4장)</td></tr>
  <tr><td><code>core/http.ts</code></td><td>요청 보내기, 시간 초과</td></tr>
  <tr><td><code>core/types.ts</code></td><td>응답 모양 (서버 DTO와 맞춤)</td></tr>
  <tr><td><code>react/QueueGate.tsx</code></td><td>React 화면을 감싸는 문</td></tr>
</table>
<h3>애핏 웹(React)은 이렇게 붙여요</h3>
<pre>&lt;<span class="k">QueueGate</span> options={...}&gt;
  &lt;CouponEventPage /&gt;   <span class="c">// 입장권을 받으면 이 화면이 보여요</span>
&lt;/<span class="k">QueueGate</span>&gt;</pre>
<p>주소 이동 없이 <b>같은 화면 안에서</b> 대기 화면 → 이벤트 화면으로 바뀌어요.</p>`,
      files: "<code>sdk-js/src/core/client.ts</code> (맨 위 흐름 주석부터) → <code>react/QueueGate.tsx</code> → <code>dev_guide/sdk-js/README.md</code>",
      lab: "<b>식당 진동벨</b>이에요. 손님은 벨만 들고 있으면 돼요. 벨(SDK)이 알아서 주방과 연락하다가, 차례가 되면 울려서 알려 줘요. 손님이 계산대에 계속 \"제 차례예요?\"라고 물으러 갈 필요가 없어요.",
      quiz: {
        q: "SDK가 renew를 보내는 조건은 무엇일까요?",
        options: ["항상 1초마다", "입장권을 받은 뒤, 페이지가 보이는 동안 30초마다", "손님이 버튼을 누를 때만"],
        answer: 1,
        explain: "입장한 뒤 페이지가 보이는 동안 30초마다 연장해요. 창을 닫으면 연장이 끊기고 2분 뒤 자리가 반납돼요(2권 5장).",
      },
      scene(api) {
        const s = api.svg();
        const st = [["enter", 60, 60], ["status", 290, 60], ["pass", 290, 200], ["renew", 60, 200]];
        const B = st.map(([n, x, y]) => api.box(s, x - 45, y - 20, 90, 40, n, { stroke: api.accent }));
        const path = api.n("path", { d: "M105 60 H245 M290 80 V180 M245 200 H105", stroke: "#cfcabe", "stroke-width": 2, fill: "none" }, s);
        s.insertBefore(path, s.firstChild);
        const loopS = api.n("path", { d: "M300 40 a 22 22 0 1 1 30 0", fill: "none", stroke: api.accent, "stroke-width": 2 }, s);
        const loopR = api.n("path", { d: "M50 220 a 22 22 0 1 0 30 0", fill: "none", stroke: api.accent, "stroke-width": 2 }, s);
        const dot = api.n("circle", { r: 8, fill: "#d9a21b" }, s);
        const cap = api.t("", { x: 200, y: 140, "text-anchor": "middle", "font-size": 13, "font-weight": 700, fill: "#0a6b62" }, s);
        api.loop(t => {
          t = t % 12;
          let x, y, k, c;
          if (t < 1.5) { k = 0; const p = seg(t, .3, 1.5); x = 105 + p * 140; y = 60; c = "번호표 받음"; }
          else if (t < 5.5) { k = 1; const a = (t - 1.5) * Math.PI; x = 315 + Math.sin(a) * 18; y = 30 - Math.cos(a) * 10; c = `앞 ${Math.max(0, 300 - Math.floor((t - 1.5) * 75))}명 · 조회 중`; }
          else if (t < 7) { k = 2; const p = seg(t, 5.5, 6.8); x = 290; y = 80 + p * 100; c = "READY → 입장권"; }
          else if (t < 8.5) { k = 3; const p = seg(t, 7, 8.4); x = 245 - p * 140; y = 200; c = "입장!"; }
          else { k = 3; const a = (t - 8.5) * Math.PI * .8; x = 65 - Math.sin(a) * 18; y = 238 + Math.cos(a) * 8; c = "30초마다 연장"; }
          dot.setAttribute("cx", x); dot.setAttribute("cy", y);
          B.forEach((b, i) => b.rect.setAttribute("fill", i === k ? "#e3f6f3" : "#fff"));
          cap.textContent = c;
          loopS.setAttribute("opacity", k === 1 ? 1 : .2); loopR.setAttribute("opacity", t > 8.5 ? 1 : .2);
        }, 3);
      },
    },
    {
      title: "리다이렉트 길: 엣지 함수와 표준 대기 페이지",
      tag: "입장권 쿠키가 없으면 대기 페이지로, 받으면 원래 주소로",
      lead: "PHP 브랜드처럼 React SDK를 바로 못 붙이는 사이트는 '주소 이동'으로 줄을 세워요. CloudFront에서 도는 작은 함수(edge/gate.js)가 입구에서 쿠키를 보고, 없으면 표준 대기 페이지로 보내요.",
      body: `
<h3>손님이 겪는 순서</h3>
<ol class="steps">
  <li>손님이 <code>brand.com/event/coupon?id=7</code>에 들어와요.</li>
  <li><b>엣지 gate.js</b>가 쿠키 <code>wr_pass_{seg}</code>를 봐요.<small>맞으면 그대로 통과. 없거나 틀리면 302로 대기 페이지에 보내요.</small></li>
  <li><code>/wr/wait/index.html?seg=coupon-1013&amp;return=/event/coupon?id=7</code><small>표준 대기 페이지(waitpage/)가 SDK로 줄을 세워요.</small></li>
  <li>입장권을 받으면 쿠키에 넣고 <code>return</code> 주소로 돌아가요.</li>
  <li>이번엔 쿠키가 있어서 엣지가 통과시켜요.</li>
</ol>
<h3>엣지 함수란?</h3>
<p>CloudFront(전 세계에 퍼진 AWS 캐시 서버)가 요청을 원본 서버로 넘기기 <b>전에</b> 실행하는 아주 작은 자바스크립트예요.<br>어느 사이트의 어느 경로를 막을지는 서버의 <code>edgesync</code>가 <b>KeyValueStore</b>(CloudFront 안의 작은 저장소)에 5초마다 복사해 둬요.</p>
<h3>보안 포인트 하나</h3>
<p><code>return</code>은 <b>같은 사이트 경로만</b> 받아요(<code>/</code>로 시작). 아니면 <code>/</code>로 바꿔요.<br>그러지 않으면 나쁜 사이트로 보내는 데 악용될 수 있어서예요(열린 리다이렉트). <code>waitpage/src/params.ts</code>가 막아요.</p>`,
      files: "<code>edge/gate.js</code> (handler 함수) → <code>waitpage/src/main.tsx</code>, <code>params.ts</code> → <code>dev_guide/contracts/edge-kvs.md</code>",
      lab: "<b>공연장 입구 검표원</b>이에요. 표(쿠키)가 있으면 바로 들여보내고, 없으면 \"매표소(대기 페이지)로 가세요\" 하며 안내해요. 매표소에서 표를 받으면 아까 그 입구로 다시 돌아오지요.",
      quiz: {
        q: "대기 페이지 주소의 return 값이 https://evil.com 이면 어떻게 될까요?",
        options: ["evil.com으로 보내요", "다른 사이트라서 / 로 바꿔요", "오류 화면을 띄워요"],
        answer: 1,
        explain: "return은 같은 사이트 경로(/로 시작)만 받아요. 다른 사이트 주소는 /로 바꿔서 열린 리다이렉트를 막아요.",
      },
      scene(api) {
        const s = api.svg();
        const user = api.box(s, 15, 125, 70, 50, "손님", {});
        const edge = api.box(s, 140, 120, 80, 60, "엣지", { sub: "gate.js", stroke: api.accent });
        const ev = api.box(s, 290, 50, 95, 50, "이벤트", { sub: "brand.com", fill: "#e3f5ec", stroke: "#2f9e5b" });
        const wp = api.box(s, 290, 200, 95, 50, "대기 페이지", { sub: "/wr/wait", fill: "#fff3c4", stroke: "#d9a21b", size: 13 });
        const dot = api.n("g", {}, s);
        api.n("circle", { r: 9, fill: api.accent }, dot);
        const ck = api.t("", { x: 0, y: -14, "text-anchor": "middle", "font-size": 11, "font-weight": 700, fill: "#d9a21b" }, dot);
        const cap = api.t("", { x: 200, y: 28, "text-anchor": "middle", "font-size": 13, "font-weight": 700, fill: "#23272f" }, s);
        const P = (a, b, p) => [a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p];
        const U = [85, 150], E = [180, 150], EV = [290, 75], WP = [290, 225];
        api.loop(t => {
          t = t % 12;
          let pt, c, cookie = false;
          if (t < 1.5) { pt = P(U, E, seg(t, .2, 1.4)); c = "1. 이벤트 주소로 접속"; }
          else if (t < 3.5) { pt = P(E, WP, seg(t, 1.8, 3.2)); c = "2. 쿠키 없음 → 302 대기 페이지"; }
          else if (t < 6) { pt = [WP[0] + 45 + Math.sin(t * 3) * 6, WP[1]]; c = "3. 줄 서고 입장권 받음"; cookie = t > 5; }
          else if (t < 8) { pt = P([WP[0], WP[1]], E, seg(t, 6.2, 7.6)); c = "4. return 주소로 돌아감"; cookie = true; }
          else { pt = P(E, EV, seg(t, 8.2, 9.6)); c = "5. 쿠키 확인 → 통과"; cookie = true; }
          dot.setAttribute("transform", `translate(${pt[0]},${pt[1]})`);
          ck.textContent = cookie ? "wr_pass" : "";
          cap.textContent = c;
          edge.rect.setAttribute("fill", (t > 1.5 && t < 2.2) ? "#fde2df" : (t > 8 && t < 8.8) ? "#e3f5ec" : "#fff");
          s.setAttribute("opacity", 1 - seg(t, 11.3, 12));
        }, 9);
      },
    },
    {
      title: "PHP 브랜드: 입장권을 직접 검사해요",
      tag: "서명 · 줄 · 만료 · 브랜드를 확인해요. 회원은 몰라요",
      lead: "PHP로 된 브랜드 사이트는 sdk-php/WaitingRoom.php 한 파일을 가져다 써요. 엣지가 1차로 막고, 브랜드 서버가 같은 규칙으로 한 번 더 검사해요.",
      body: `
<h3>쓰는 함수 두 개</h3>
<div class="cards">
  <div class="card"><b>guardPage(seg, waitUrl)</b>이벤트 <b>페이지</b>를 열 때. 입장권이 없으면 대기 페이지로 보내는 HTML을 돌려줘요.</div>
  <div class="card"><b>guardAction(seg)</b>쿠폰 받기 같은 <b>동작</b>(API)을 할 때. 입장권이 없으면 오류 JSON을 돌려줘요.</div>
</div>
<h3>입장권 검사란?</h3>
<p>입장권은 2권 2장의 번호표처럼 <code>내용.서명</code> 모양이에요. 다만 서명 키가 <b>브랜드 키</b>예요.</p>
<ol class="steps">
  <li>서명이 그 브랜드 키로 만든 게 맞나</li>
  <li>이 줄(seg)의 입장권인가, 이 브랜드(brd)의 입장권인가</li>
  <li>만료(exp)가 지나지 않았나</li>
</ol>
<p>서버에 물어보지 않고 <b>키 하나로 혼자</b> 검사해요. 그래서 대기열 서버가 바빠도 브랜드 사이트는 빨라요.</p>
<h3>브랜드 키는요?</h3>
<p>마스터 키와 브랜드 ID로 계산한 키예요. 브랜드마다 달라서, A 브랜드 입장권으로 B 브랜드에 들어갈 수 없어요.<br>형식은 <code>dev_guide/contracts/tokens.md</code>에 있고, <b>키 값 자체는 문서나 코드에 절대 적지 않아요.</b></p>`,
      files: "<code>sdk-php/WaitingRoom.php</code>의 <code>guardPage</code>, <code>verifyPass</code> → <code>dev_guide/contracts/tokens.md</code> → <code>dev_guide/sdk-php/README.md</code>",
      lab: "<b>위조 방지 홀로그램 도장</b>이에요. 검표원은 매표소에 전화하지 않고도 표의 홀로그램만 보고 진짜인지 알아요. 공연마다 홀로그램 모양(브랜드 키)이 달라서 다른 공연 표로는 못 들어가요.",
      quiz: {
        q: "PHP 브랜드 서버가 입장권을 검사할 때 대기열 서버에 물어볼까요?",
        options: ["네, 매번 서버에 확인해요", "아니요, 브랜드 키로 서명을 혼자 확인해요", "Redis를 직접 읽어요"],
        answer: 1,
        explain: "입장권은 서명된 토큰이라 키만 있으면 혼자 검사할 수 있어요. 엣지 gate.js도 같은 방식이에요.",
      },
      scene(api) {
        const s = api.svg();
        const tk = api.n("g", {}, s);
        api.n("rect", { x: -90, y: -40, width: 180, height: 80, rx: 10, fill: "#fff", stroke: "#cfcabe", "stroke-width": 1.5 }, tk);
        api.t("입장권", { x: -74, y: -16, "font-size": 13, "font-weight": 800, fill: "#23272f" }, tk);
        api.t("seg: coupon-1013", { x: -74, y: 4, "font-size": 11.5, fill: "#6b7280" }, tk);
        api.t("brd: brand-a · exp", { x: -74, y: 22, "font-size": 11.5, fill: "#6b7280" }, tk);
        tk.setAttribute("transform", "translate(200,90)");
        const checks = ["서명 (브랜드 키)", "줄 · 브랜드", "만료 시각"].map((c, i) => {
          const g = api.n("g", { transform: `translate(110,${170 + i * 32})` }, s);
          const box = api.n("rect", { width: 20, height: 20, rx: 5, fill: "#fff", stroke: api.accent, "stroke-width": 1.5 }, g);
          const mk = api.t("✓", { x: 10, y: 15, "text-anchor": "middle", "font-size": 15, "font-weight": 800, fill: "#2f9e5b" }, g);
          api.t(c, { x: 30, y: 15, "font-size": 13.5, "font-weight": 600, fill: "#23272f" }, g);
          return { box, mk };
        });
        const stamp = api.t("통과", { x: 300, y: 225, "text-anchor": "middle", "font-size": 26, "font-weight": 900, fill: "#2f9e5b" }, s);
        api.loop(t => {
          t = t % 8;
          checks.forEach((c, i) => { const p = seg(t, 1 + i * .9, 1.5 + i * .9); c.mk.setAttribute("opacity", p); c.box.setAttribute("fill", p > .5 ? "#e3f5ec" : "#fff"); });
          const sp = seg(t, 4.2, 4.8);
          stamp.setAttribute("opacity", sp * (1 - seg(t, 7.3, 8)));
          stamp.setAttribute("transform", `rotate(-12 300 225) translate(${0},${0}) scale(1)`);
        }, 5);
      },
    },
    {
      title: "대기열이 아프면: 장애 정책과 긴급 스위치",
      tag: "서버에 닿지 못하면 config.json의 장애 정책을 따라요",
      lead: "대기열 서버가 죽었다고 이벤트까지 멈추면 안 되겠지요. SDK는 서버에 닿지 못하면 S3에 있는 공개 설정 파일 /wr/config.json을 읽고, 그 줄의 장애 정책(OPEN 또는 CLOSED)을 따라요.",
      body: `
<h3>장애 정책 두 가지</h3>
<div class="cards">
  <div class="card"><b>OPEN (기본)</b>대기열 없이 통과시켜요. 이벤트 서버가 조금 힘들어도 손님을 막지 않는 쪽이에요.</div>
  <div class="card"><b>CLOSED</b>통과시키지 않고 계속 다시 시도해요. 이벤트 서버를 꼭 지켜야 할 때예요.</div>
</div>
<p>"서버에 닿지 못함"은 연결 실패, 10초 초과, 5xx 응답이에요.<br>config.json도 못 읽으면 SDK 옵션 값을 쓰고, 30초 동안은 다시 읽지 않아요.</p>
<h3>운영자의 긴급 스위치</h3>
<table class="map">
  <tr><th>스위치</th><th>결과</th></tr>
  <tr><td>입장 멈춤 (CLOSE)</td><td>새 줄 서기를 막아요 (<code>SEGMENT_CLOSED</code>). 기다리던 사람은 계속 기다려요</td></tr>
  <tr><td>모두 통과 (OPEN)</td><td>줄 없이 바로 입장권을 줘요</td></tr>
</table>
<h3>대기 페이지의 함정</h3>
<p>장애로 "입장권 없이 통과"가 되면 대기 페이지는 원래 주소로 <b>이동하지 않고</b> "잠시 후 다시"를 띄워요.<br>입장권 없이 돌아가면 엣지가 또 대기 페이지로 보내서 무한 반복되기 때문이에요.</p>`,
      files: "<code>sdk-js/src/core/client.ts</code>의 <code>outagePolicy</code> → <code>dev_guide/contracts/public-config.md</code> → <code>server/.../backup/</code> (config.json을 S3에 쓰는 곳)",
      lab: "<b>정전 때의 자동문</b>이에요. 상가 자동문은 정전이 나면 열린 채로 멈추게(OPEN) 해서 사람들이 나갈 수 있게 해요. 금고 문은 정전이 나도 잠긴 채로(CLOSED) 있어요. 무엇을 지킬지에 따라 정책을 고르는 거예요.",
      quiz: {
        q: "대기열 서버가 응답하지 않고 그 줄의 장애 정책이 OPEN이면 SDK는 어떻게 할까요?",
        options: ["손님을 대기열 없이 통과시켜요", "영원히 대기 화면을 보여 줘요", "브라우저를 새로고침해요"],
        answer: 0,
        explain: "OPEN은 '장애 때는 막지 않는다'는 정책이에요. 입장권 없이 통과(bypassed)시켜요.",
      },
      scene(api) {
        const s = api.svg();
        const sdk = api.box(s, 20, 120, 80, 60, "SDK", { stroke: api.accent });
        const srv = api.box(s, 160, 40, 90, 50, "서버", {});
        const cfg = api.box(s, 160, 210, 110, 50, "config.json", { sub: "S3", size: 13 });
        const x = api.t("✕", { x: 205, y: 34, "text-anchor": "middle", "font-size": 22, "font-weight": 900, fill: "#e2483d" }, s);
        const a1 = api.n("line", { x1: 100, y1: 140, x2: 160, y2: 70, stroke: "#e2483d", "stroke-width": 2, "stroke-dasharray": "5 4" }, s);
        const a2 = api.n("line", { x1: 100, y1: 165, x2: 160, y2: 230, stroke: api.accent, "stroke-width": 2 }, s);
        const open = api.box(s, 300, 90, 90, 44, "OPEN", { sub: "통과", fill: "#e3f5ec", stroke: "#2f9e5b" });
        const closed = api.box(s, 300, 160, 90, 44, "CLOSED", { sub: "재시도", fill: "#fde2df", stroke: "#e2483d" });
        const pick = api.n("rect", { x: 294, y: 84, width: 102, height: 56, rx: 12, fill: "none", stroke: "#d9a21b", "stroke-width": 3 }, s);
        api.loop(t => {
          t = t % 10;
          srv.setAttribute("opacity", t > 1.5 ? .35 : 1);
          x.setAttribute("opacity", seg(t, 1.5, 2));
          a1.setAttribute("opacity", seg(t, .3, .8));
          a2.setAttribute("opacity", seg(t, 2.6, 3.2));
          cfg.rect.setAttribute("fill", t > 3 && t < 4.5 ? "#fff3c4" : "#fff");
          const which = t < 7 ? 0 : 1;
          const p = seg(t, 4.5, 5);
          pick.setAttribute("opacity", p);
          pick.setAttribute("y", which ? 154 : 84);
        }, 6);
      },
    },
    {
      title: "운영 관리자 웹과 관리자 API",
      tag: "운영자는 관리자 웹으로 줄을 만들고 지켜봐요",
      lead: "운영자는 admin/(운영 관리자 웹)에서 줄을 만들고, 이벤트 당일 서버 상태를 지켜보고, 긴급 스위치를 눌러요. 이 화면은 서버의 관리자 API(/admin/*)만 불러요.",
      body: `
<h3>화면과 하는 일</h3>
<table class="map">
  <tr><th>화면 (admin/src/pages)</th><th>하는 일</th></tr>
  <tr><td><code>Dashboard</code></td><td>서버 신호등, 서버별 표, 모든 줄</td></tr>
  <tr><td><code>SegmentDetail</code> · <code>SegmentForm</code></td><td>줄 상황, 입장 제어, 줄 설정(엣지 규칙 · 장애 정책)</td></tr>
  <tr><td><code>Brands</code></td><td>브랜드 만들기 · 켜고 끄기</td></tr>
  <tr><td><code>EdgeBackup</code></td><td>엣지 KVS 반영 상태, 설정 백업 · 복구</td></tr>
  <tr><td><code>Audit</code></td><td>누가 무엇을 바꿨는지 (변경 기록)</td></tr>
</table>
<h3>관리자 API는 바깥에 안 열려요</h3>
<ol class="steps">
  <li>모든 요청에 <code>Authorization: Admin &lt;토큰&gt;</code>이 필요해요.<small>서버 <code>admin/AdminAuthFilter.kt</code>가 검사해요.</small></li>
  <li>CloudFront의 경로 함수가 <code>/admin</code>, <code>/actuator</code>를 <b>403으로 막아요</b>.<small>인터넷에서는 관리자 API에 닿을 수 없어요.</small></li>
  <li>바꾼 내용은 모두 변경 기록에 남아요.</li>
</ol>
<h3>demo/는 무엇인가요?</h3>
<p>시범 페이지예요. 가짜 휴대폰 여러 대로 줄 서기를 <b>눈으로</b> 볼 수 있어요. 운영에는 배포하지 않아요.<br>처음 왔다면 <code>npm run demo</code>로 한 번 돌려 보세요(5권 1장).</p>`,
      files: "<code>admin/src/App.tsx</code> → <code>admin/src/api.ts</code> → <code>server/.../api/AdminController.kt</code> → <code>dev_guide/ops/runbook.md</code>(이벤트 당일 절차)",
      lab: "<b>놀이공원 관제실</b>이에요. 손님은 들어갈 수 없는 방에서 직원만 출입증(관리자 토큰)으로 들어가요. CCTV(대시보드)로 줄을 보고, 문제가 생기면 탑승을 멈추는 버튼(긴급 스위치)을 눌러요. 누가 버튼을 눌렀는지는 일지(변경 기록)에 남아요.",
      quiz: {
        q: "인터넷에서 https://도메인/wr/admin/... 으로 요청하면 어떻게 될까요?",
        options: ["관리자 토큰만 있으면 돼요", "CloudFront 경로 함수가 403으로 막아요", "서버가 자동으로 로그인 화면을 보여 줘요"],
        answer: 1,
        explain: "CloudFront의 wr 경로 함수가 /admin, /dev, /actuator를 막아요. 관리자 API는 회사 안쪽 경로로만 써요.",
      },
      scene(api) {
        const s = api.svg();
        api.n("rect", { x: 30, y: 30, width: 340, height: 230, rx: 14, fill: "#fff", stroke: "#cfcabe", "stroke-width": 1.5 }, s);
        api.n("rect", { x: 30, y: 30, width: 80, height: 230, rx: 14, fill: "#e3f6f3" }, s);
        ["대시보드", "줄", "브랜드", "엣지·백업", "변경 기록"].forEach((m, i) => api.t(m, { x: 42, y: 62 + i * 30, "font-size": 12, "font-weight": 600, fill: "#0a6b62" }, s));
        const lights = [0, 1, 2].map(i => api.n("circle", { cx: 150 + i * 36, cy: 70, r: 12, fill: "#2f9e5b" }, s));
        api.t("서버 신호등", { x: 260, y: 75, "font-size": 12, fill: "#6b7280" }, s);
        const bars = Array.from({ length: 8 }, (_, i) => api.n("rect", { x: 140 + i * 26, width: 16, rx: 3, fill: api.accent }, s));
        api.t("초당 입장", { x: 140, y: 245, "font-size": 11.5, fill: "#6b7280" }, s);
        const btn = api.box(s, 250, 110, 105, 34, "입장 멈춤", { size: 12.5, fill: "#fde2df", stroke: "#e2483d", color: "#e2483d" });
        api.loop(t => {
          t = t % 9;
          const stopped = t > 5.2 && t < 8.5;
          bars.forEach((b, i) => {
            const h = stopped && i >= 6 ? 4 : 30 + 40 * Math.abs(Math.sin(t * 1.2 + i * .7));
            b.setAttribute("y", 230 - h); b.setAttribute("height", h);
          });
          lights[1].setAttribute("fill", t > 2.5 && t < 4.5 ? "#d9a21b" : "#2f9e5b");
          btn.rect.setAttribute("fill", stopped ? "#e2483d" : "#fde2df");
          btn.label.setAttribute("fill", stopped ? "#fff" : "#e2483d");
        }, 6);
      },
    },
  ],

  recap: {
    title: "3권에서 배운 것",
    points: [
      "<b>sdk-js</b>의 client.ts가 enter → status → pass → renew를 자동으로 돌려요. React는 QueueGate로 감싸요.",
      "<b>엣지 gate.js</b>가 쿠키 없는 손님을 <b>표준 대기 페이지</b>로 보내고, 입장권을 받으면 return 주소로 돌아가요.",
      "<b>PHP 브랜드</b>는 WaitingRoom.php로 브랜드 키 서명 · 줄 · 만료를 서버 없이 혼자 검사해요.",
      "서버에 닿지 못하면 <b>config.json의 장애 정책</b>(OPEN 통과 / CLOSED 재시도)을 따라요.",
      "운영자는 <b>관리자 웹</b>으로 일하고, 관리자 API는 토큰이 필요하며 인터넷에서는 막혀 있어요.",
    ],
    nextLabel: "4권 예고 · 인프라가 처음이라면",
    next: "이 모든 코드는 AWS 위에서 돌아요. CloudFront, ALB, ECS Fargate, ElastiCache가 무엇인지, 그리고 그걸 만드는 Terraform 코드(infra/)를 어떤 순서로 읽는지 봐요.",
  },

  recapScene(api) {
    const s = api.svg();
    const nodes = [["손님", 50, 150], ["엣지", 145, 150], ["대기 페이지", 235, 75], ["서버", 340, 150], ["관리자 웹", 235, 225]];
    const B = nodes.map(([n, x, y]) => api.box(s, x - 42, y - 17, 84, 34, n, { size: 12.5, rx: 17, stroke: api.accent }));
    const lk = [[0, 1], [1, 2], [2, 3], [4, 3]].map(([a, b]) => api.n("line", { x1: nodes[a][1], y1: nodes[a][2], x2: nodes[b][1], y2: nodes[b][2], stroke: api.accent, "stroke-opacity": .4, "stroke-width": 2 }, s));
    lk.forEach(l => s.insertBefore(l, s.firstChild));
    api.loop(t => {
      t = t % 8;
      B.forEach((b, i) => b.setAttribute("opacity", seg(t, .2 + i * .5, .7 + i * .5) * (1 - seg(t, 7.3, 8))));
      lk.forEach((l, i) => l.setAttribute("opacity", seg(t, 2.8 + i * .4, 3.2 + i * .4) * (1 - seg(t, 7.3, 8))));
    }, 6);
  },
});
