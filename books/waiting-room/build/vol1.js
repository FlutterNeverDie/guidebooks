BOOKS.push({
  no: 1,
  short: "서버 기초",
  series: "웨이팅룸 코드 읽기",
  kicker: "FIRST DAY ON THE SERVER",
  title: "서버가 처음이라면",
  subtitle: "웨이팅룸이 무슨 일을 하는지, 서버와 Redis가 왜 필요한지부터 시작해요.<br>코드를 열기 전에 머릿속에 그림 한 장을 만드는 권이에요.",
  color: { accent: "#3462c9", ink: "#1f3f8a", soft: "#e8eefb" },
  labLabel: "쉽게 비유하면",
  coverTag: "손님은 줄을 서고, 정해진 속도로만 들어가요",
  recapTag: "1권에서 배운 것",

  coverScene(api) {
    const s = api.svg();
    api.box(s, 14, 112, 76, 76, "대기실", { sub: "웨이팅룸", size: 13, fill: api.accent + "14", stroke: api.accent });
    api.box(s, 290, 100, 90, 100, "이벤트", { sub: "브랜드 사이트", fill: "#e3f5ec", stroke: "#2f9e5b" });
    const gate = api.n("rect", { x: 196, y: 120, width: 8, height: 60, rx: 3, fill: api.accent }, s);
    api.t("초당 N명", { x: 200, y: 108, "text-anchor": "middle", "font-size": 13, "font-weight": 700, fill: api.accent }, s);
    const dots = Array.from({ length: 14 }, () => api.n("circle", { r: 7, fill: api.accent }, s));
    api.loop(t => {
      dots.forEach((d, i) => {
        // 1.2초마다 한 명씩 문을 지난다
        const p = (t / 1.2 - i + 20) % 14;
        let x, y = 150 + ((i * 37) % 3 - 1) * 12;
        if (p < 9) { x = 100 + Math.min(p, 8) * 11; d.setAttribute("fill", api.accent); }
        else { const q = clamp((p - 9) / 2); x = 185 + q * 130; y = 150 + (q > .5 ? ((i * 53) % 5 - 2) * 12 : 0); d.setAttribute("fill", "#2f9e5b"); }
        d.setAttribute("cx", x); d.setAttribute("cy", y);
        d.setAttribute("opacity", p > 13 ? 1 - (p - 13) : 1);
      });
      gate.setAttribute("opacity", 0.6 + 0.4 * Math.abs(Math.sin(t * Math.PI / 1.2)));
    }, 4);
  },

  chapters: [
    {
      title: "웨이팅룸은 무슨 일을 할까요?",
      tag: "대기열이 없으면 서버가 쓰러지고, 있으면 버텨요",
      lead: "인기 이벤트가 열리는 순간 수십만 명이 한꺼번에 들어오면 이벤트 서버가 쓰러져요. 웨이팅룸은 손님을 줄 세우고, 서버가 감당할 만큼만 들여보내는 문지기예요.",
      body: `
<h3>은행 번호표와 같아요</h3>
<ol class="steps">
  <li>손님이 오면 <b>번호표</b>를 뽑아 줘요.<small>번호표에는 내 번호가 적혀 있어요.</small></li>
  <li>창구는 <b>1초에 N명씩</b>만 번호를 불러요.<small>N은 이벤트 서버가 버티는 양으로 운영자가 정해요.</small></li>
  <li>내 번호가 불리면 <b>입장권</b>을 받아 이벤트 페이지로 들어가요.</li>
</ol>
<h3>누가 쓰나요?</h3>
<p>여러 브랜드(애핏 브랜드들, PHP 브랜드들)가 <b>함께</b> 쓰는 시스템이에요.<br>원래 쓰던 외부 제품 NetFUNNEL을 대신하려고 직접 만들었어요.</p>
<h3>용어 세 개만 먼저</h3>
<div class="cards">
  <div class="card"><b>줄 (세그먼트, segment)</b>이벤트 하나에 세우는 대기열 하나예요. 코드에서는 <code>seg</code>라고 많이 써요.</div>
  <div class="card"><b>번호표 (ticket)</b>"줄 섰다"는 증명이에요.</div>
  <div class="card"><b>입장권 (pass)</b>"들어가도 된다"는 증명이에요. 2분짜리이고 30초마다 연장해요.</div>
</div>`,
      lab: "<b>놀이공원 인기 놀이기구</b>를 떠올려 보세요. 줄이 없으면 모두가 한꺼번에 탑승구로 몰려 다쳐요. 직원이 줄을 세우고 한 번에 정해진 인원만 태우니까 모두 안전하게 타요. 웨이팅룸이 그 직원이에요.",
      quiz: {
        q: "웨이팅룸이 1초에 들여보내는 인원 N은 무엇을 기준으로 정할까요?",
        options: ["줄 선 사람 수", "이벤트 서버가 버틸 수 있는 양", "웨이팅룸 서버 대수"],
        answer: 1,
        explain: "웨이팅룸의 목적은 뒤에 있는 이벤트 서버를 지키는 거예요. 그래서 N은 이벤트 서버가 버티는 양으로 정해요. 운영 절차서(dev_guide/ops/runbook.md)에도 그렇게 적혀 있어요.",
      },
      scene(api) {
        const s = api.svg();
        const title = api.t("", { x: 200, y: 30, "text-anchor": "middle", "font-size": 15, "font-weight": 700, fill: "#23272f" }, s);
        const srv = api.box(s, 290, 110, 90, 80, "이벤트 서버", { size: 13 });
        const face = api.t("", { x: 335, y: 220, "text-anchor": "middle", "font-size": 13, "font-weight": 700 }, s);
        const wr = api.box(s, 150, 105, 70, 90, "웨이팅룸", { size: 12.5, fill: api.accent + "18", stroke: api.accent });
        const dots = Array.from({ length: 40 }, (_, i) => api.n("circle", { r: 5, fill: "#9aa3b5" }, s));
        api.loop(t => {
          t = t % 12;
          const withQ = t >= 6, p = withQ ? t - 6 : t;
          title.textContent = withQ ? "웨이팅룸이 있으면" : "웨이팅룸이 없으면";
          wr.setAttribute("opacity", withQ ? seg(p, 0, .6) : 0);
          const fade = 1 - seg(p, 5.3, 6);
          let inside = 0;
          dots.forEach((d, i) => {
            const start = (i % 20) * 0.08 + Math.floor(i / 20) * 0.3;
            let x, y = 60 + ((i * 47) % 180);
            const q = clamp((p - start) / 1.4);
            if (!withQ) {
              const ex = 268 - (i % 5) * 11, ey = 108 + ((i * 17) % 9) * 10;
              x = 20 + q * (ex - 20); y = y + (ey - y) * q;
              if (q >= 1) inside++;
            } else {
              const turn = 1.0 + i * 0.11;  // 차례대로 하나씩
              if (p < turn) { x = 20 + q * 120; y = y + (150 - y) * q * .8; x = Math.min(x, 140 - (i % 6) * 2); }
              else { const r = clamp((p - turn) / .7); x = 225 + r * 70; y = 150; if (r >= 1) { inside++; d.setAttribute("opacity", 0); return; } }
            }
            d.setAttribute("cx", x); d.setAttribute("cy", y); d.setAttribute("opacity", fade);
          });
          const bad = !withQ && inside > 14;
          srv.rect.setAttribute("fill", bad ? "#fde2df" : "#e3f5ec");
          srv.rect.setAttribute("stroke", bad ? "#e2483d" : "#2f9e5b");
          face.textContent = bad ? "쓰러짐" : withQ && p > 1 ? "버팀" : "";
          face.setAttribute("fill", bad ? "#e2483d" : "#2f9e5b");
          face.setAttribute("opacity", fade);
        }, 9.5);
      },
    },
    {
      title: "요청과 응답: 브라우저와 서버가 주고받는 편지",
      tag: "SDK가 보내는 네 가지 요청",
      lead: "서버는 '요청이 오면 답을 돌려주는 프로그램'이에요. 손님 브라우저 안의 SDK가 웨이팅룸 서버에 편지(HTTP 요청)를 보내고, 서버는 JSON으로 답장을 보내요.",
      body: `
<h3>HTTP 요청은 이렇게 생겼어요</h3>
<pre><span class="k">POST</span> /v1/segments/coupon-1013/enter
<span class="c">← 서버 답장 (JSON)</span>
{ <span class="s">"status"</span>: <span class="s">"WAIT"</span>, <span class="s">"ahead"</span>: 1532, <span class="s">"nextPollMs"</span>: 5000, ... }</pre>
<div class="cards">
  <div class="card"><b>메서드 (POST, GET)</b>무엇을 하려는지예요. GET은 "보여 줘", POST는 "해 줘"에 가까워요.</div>
  <div class="card"><b>경로 (/v1/segments/.../enter)</b>어느 기능을 부르는지예요. 서버 코드에서 이 경로와 함수를 이어 주는 곳이 <b>컨트롤러</b>예요.</div>
  <div class="card"><b>상태 코드 (200, 403, 410, 500)</b>2xx는 성공, 4xx는 요청 쪽 문제, 5xx는 서버 쪽 문제예요.</div>
</div>
<h3>웨이팅룸의 다섯 가지 요청</h3>
<table class="map">
  <tr><th>요청</th><th>뜻</th></tr>
  <tr><td><code>POST /enter</code></td><td>줄 서기. 번호표를 받아요</td></tr>
  <tr><td><code>GET /status</code></td><td>내 차례 됐나요? (가장 많이 불려요)</td></tr>
  <tr><td><code>POST /pass</code></td><td>차례가 되면 번호표를 입장권으로 바꿔요</td></tr>
  <tr><td><code>POST /renew</code></td><td>입장권 연장 (30초마다)</td></tr>
  <tr><td><code>POST /complete</code></td><td>다 썼어요. 자리를 바로 돌려줘요</td></tr>
</table>
<p>손님은 이 요청을 직접 보내지 않아요. 브라우저에 붙은 <b>SDK</b>(남이 쓰라고 만든 코드 묶음)가 자동으로 돌려요. 3권에서 봐요.</p>`,
      files: "<code>server/src/main/kotlin/.../api/QueueController.kt</code> - 다섯 요청의 입구<br><code>dev_guide/contracts/http-api.md</code> - 요청 · 응답 약속 전체",
      lab: "<b>음식점 주문</b>이에요. 손님(브라우저)이 주문서(요청)를 내면 주방(서버)이 음식(응답)을 내줘요. 주문서에는 무엇을(메서드), 어느 메뉴를(경로) 적어요. 주방에 재료가 없으면 \"품절(4xx)\", 주방에 불이 나면 \"영업 중단(5xx)\"이에요.",
      quiz: {
        q: "손님이 기다리는 동안 가장 많이 불리는 요청은 무엇일까요?",
        options: ["POST /enter", "GET /status", "POST /complete"],
        answer: 1,
        explain: "기다리는 동안 몇 초마다 \"내 차례 됐나요?\"를 물어요. 그래서 status가 가장 많고, 서버는 이 요청을 Redis 없이 처리하도록 만들었어요. 2권 3장에서 봐요.",
      },
      scene(api) {
        const s = api.svg();
        api.box(s, 20, 110, 100, 80, "브라우저", { sub: "SDK", size: 14 });
        api.box(s, 280, 110, 100, 80, "웨이팅룸", { sub: "서버", size: 14, fill: api.accent + "14", stroke: api.accent });
        const reqs = [["POST /enter", "WAIT · 번호표"], ["GET /status", "WAIT · 앞 120명"], ["GET /status", "READY"], ["POST /pass", "PASS · 입장권"], ["POST /renew", "연장됨"]];
        const env = api.n("g", {}, s);
        const er = api.n("rect", { x: -62, y: -15, width: 124, height: 30, rx: 8, fill: "#fff", stroke: api.accent, "stroke-width": 1.5 }, env);
        const et = api.t("", { x: 0, y: 5, "text-anchor": "middle", "font-size": 12.5, "font-weight": 700, fill: "#1f3f8a" }, env);
        const cap = api.t("", { x: 200, y: 245, "text-anchor": "middle", "font-size": 13, fill: "#6b7280" }, s);
        api.loop(t => {
          const k = Math.floor(t / 2.4) % reqs.length, p = (t % 2.4) / 2.4;
          const go = p < .5, q = ease(go ? p / .5 : (p - .5) / .5);
          const x = go ? 120 + q * 160 : 280 - q * 160;
          env.setAttribute("transform", `translate(${x},${go ? 130 : 170})`);
          et.textContent = go ? reqs[k][0] : reqs[k][1];
          er.setAttribute("fill", go ? "#fff" : "#e3f5ec");
          er.setAttribute("stroke", go ? api.accent : "#2f9e5b");
          cap.textContent = go ? "요청" : "응답 (JSON)";
        }, 1);
      },
    },
    {
      title: "서버 여러 대와 Redis",
      tag: "서버가 하나 꺼져도 번호는 Redis에 남아 있어요",
      lead: "웨이팅룸 서버는 여러 대가 함께 돌아요. 그런데 '지금 몇 번까지 들어갔나' 같은 진짜 기록은 서버가 아니라 Redis 한 곳에 둬요. 그래서 서버는 몇 대가 되든, 하나가 꺼지든 괜찮아요.",
      body: `
<h3>왜 여러 대일까요?</h3>
<p>서버 한 대가 1초에 처리할 수 있는 요청은 정해져 있어요.<br>손님이 많으면 서버를 <b>여러 대</b> 띄우고, 앞에서 <b>로드밸런서(ALB)</b>가 요청을 골고루 나눠 줘요.</p>
<h3>기록은 한 곳에: Redis</h3>
<div class="cards">
  <div class="card"><b>Redis(우리는 Valkey)</b>메모리에 값을 저장하는 아주 빠른 저장소예요. 키 이름으로 값을 넣고 꺼내요. Valkey는 Redis와 똑같이 쓰는 호환 제품이에요.</div>
  <div class="card"><b>서버는 상태를 들고 있지 않아요</b>서버 메모리에는 Redis 값을 잠깐 복사해 둔 캐시만 있어요. 진짜 값은 Redis에 있어요.</div>
  <div class="card"><b>그래서 생기는 장점</b>어느 서버로 요청이 가도 같은 답이 나와요. 서버가 죽어도 다른 서버가 그대로 이어서 일해요.</div>
</div>
<h3>Redis에 있는 키 몇 개</h3>
<pre>wr:{seg}:seq      <span class="c">마지막으로 준 번호</span>
wr:{seg}:cursor   <span class="c">이 번호까지 입장 가능 (입장선)</span>
wr:{seg}:active   <span class="c">지금 안에 있는 사람들</span>
wr:{seg}:config   <span class="c">줄 설정</span></pre>`,
      files: "<code>server/.../segment/RedisKeys.kt</code> - Redis 키 이름 전부<br><code>server/src/main/resources/redis.yml</code> - Redis 주소와 1초 타임아웃",
      lab: "<b>프랜차이즈 매장과 본사 장부</b>예요. 매장(서버)은 여러 곳이지만, 몇 번까지 손님을 받았는지는 본사 장부(Redis) 한 권에 적어요. 매장 하나가 문을 닫아도 장부가 남아 있으니 다른 매장이 이어서 손님을 받아요.",
      quiz: {
        q: "웨이팅룸 서버 한 대가 갑자기 꺼지면 손님 번호는 어떻게 될까요?",
        options: ["그 서버에 있던 번호가 모두 사라져요", "번호는 Redis에 있어서 다른 서버가 이어서 처리해요", "모든 손님이 처음부터 다시 줄 서요"],
        answer: 1,
        explain: "진짜 기록은 Redis에 있어요. 서버는 캐시만 들고 있어서, 남은 서버들이 같은 Redis를 보고 계속 일해요.",
      },
      scene(api) {
        const s = api.svg();
        const alb = api.box(s, 20, 120, 70, 60, "ALB", { sub: "나눠 주기" });
        const srvs = [60, 130, 200].map((y, i) => api.box(s, 160, y, 90, 44, `서버 ${i + 1}`, { size: 13 }));
        const red = api.box(s, 310, 115, 76, 70, "Redis", { sub: "기록 한 곳", fill: "#fdeee6", stroke: "#e2483d" });
        const lines = srvs.map((g, i) => api.n("line", { x1: 250, y1: 82 + i * 70, x2: 310, y2: 150, stroke: "#b9b4a8", "stroke-dasharray": "4 4" }, s));
        const dots = Array.from({ length: 9 }, () => api.n("circle", { r: 5, fill: api.accent }, s));
        const note = api.t("", { x: 200, y: 280, "text-anchor": "middle", "font-size": 13, "font-weight": 700, fill: "#e2483d" }, s);
        api.loop(t => {
          t = t % 10;
          const dead = t > 4.5 && t < 9.2;
          srvs[1].setAttribute("opacity", dead ? .3 : 1);
          lines[1].setAttribute("opacity", dead ? .2 : 1);
          note.textContent = dead ? "서버 2가 꺼져도 Redis는 그대로" : "";
          dots.forEach((d, i) => {
            const p = ((t * 0.7 + i / 9) % 1);
            let target = i % 3; if (dead && target === 1) target = i % 2 ? 0 : 2;
            const ty = 82 + target * 70;
            const x = 90 + p * 70, y = 150 + (ty - 150) * p;
            d.setAttribute("cx", x); d.setAttribute("cy", y); d.setAttribute("opacity", p > .9 ? (1 - p) * 10 : 1);
          });
        }, 6);
      },
    },
    {
      title: "번호표와 입장선: 이 책의 핵심 숫자 두 개",
      tag: "입장선(cursor)이 내 번호(seq)를 넘으면 내 차례예요",
      lead: "웨이팅룸 코드 전체가 두 숫자로 돌아가요. 내 번호 seq, 그리고 '이 번호까지 들어가도 된다'는 입장선 cursor. 앞에 남은 사람은 seq - cursor예요.",
      body: `
<h3>숫자 두 개</h3>
<div class="cards">
  <div class="card"><b>seq (내 번호)</b>줄 설 때 받는 번호예요. 번호표 안에 서명돼 들어 있어서 손님이 고칠 수 없어요.</div>
  <div class="card"><b>cursor (입장선)</b>"이 번호까지 입장 가능"이라는 선이에요. 서버 한 대(리더)가 200ms마다 조금씩 앞으로 밀어요.</div>
  <div class="card"><b>앞 대기 인원 = seq - cursor</b>화면의 "앞에 1,532명"은 이 뺄셈이에요.</div>
</div>
<h3>입장선은 어떻게 움직이나요?</h3>
<ol class="steps">
  <li><b>RATE 방식</b>: 1초에 N명씩 밀어요.<small>예: 초당 100명이면 200ms마다 20칸</small></li>
  <li><b>CONCURRENCY 방식</b>: 안에 있는 사람이 최대 N명이 되게, 빈자리만큼 밀어요.</li>
</ol>
<h3>세대(epoch)도 하나 기억해요</h3>
<p>줄을 초기화하면 <b>세대 번호</b>가 바뀌어요.<br>예전 세대 번호표로 오면 "다시 줄 서세요"(<code>STALE_EPOCH</code>)라고 답해요.</p>`,
      files: "<code>dev_guide/server/architecture.md</code> - 핵심 개념 표<br><code>server/.../queue/QueueService.kt</code> - <code>ticket.seq &gt; state.cursor</code>를 찾아보세요",
      lab: "<b>마라톤 출발 구역</b>이에요. 참가자 번호(seq)가 정해져 있고, 진행 요원이 \"300번까지 출발!\" 하며 출발선(cursor)을 뒤로 넓혀 가요. 내 번호가 선 안에 들어오면 출발해요.",
      quiz: {
        q: "내 번호가 5,200이고 입장선이 4,700이면 앞에 몇 명이 남았을까요?",
        options: ["4,700명", "500명", "9,900명"],
        answer: 1,
        explain: "앞 대기 인원은 seq - cursor = 5,200 - 4,700 = 500이에요.",
      },
      scene(api) {
        const s = api.svg();
        const N = 12, w = 28, x0 = 32;
        const cells = Array.from({ length: N }, (_, i) => {
          const g = api.box(s, x0 + i * w, 130, w - 4, 40, String(101 + i), { size: 11.5, rx: 6 });
          return g;
        });
        const me = 9; // 110번
        api.t("내 번호 seq", { x: x0 + me * w + 12, y: 205, "text-anchor": "middle", "font-size": 12.5, "font-weight": 700, fill: "#d9a21b" }, s);
        api.n("path", { d: `M${x0 + me * w + 12} 192 l-6 -10 h12 z`, fill: "#d9a21b" }, s);
        const line = api.n("line", { y1: 100, y2: 200, stroke: api.accent, "stroke-width": 3 }, s);
        const ltxt = api.t("입장선 cursor", { y: 92, "text-anchor": "middle", "font-size": 12.5, "font-weight": 700, fill: api.accent }, s);
        const ahead = api.t("", { x: 200, y: 250, "text-anchor": "middle", "font-size": 16, "font-weight": 800, fill: "#23272f" }, s);
        api.loop(t => {
          t = t % 9;
          const c = Math.min(N, Math.floor(seg(t, .5, 7) * (N + 0.99)));   // 입장선 위치 (칸 수)
          const lx = x0 + c * w - 2;
          api.set(line, { x1: lx, x2: lx }); ltxt.setAttribute("x", Math.max(60, Math.min(340, lx)));
          cells.forEach((g, i) => {
            const passed = i < c;
            g.rect.setAttribute("fill", i === me ? (passed ? "#d6f0de" : "#fff3c4") : passed ? "#e3f5ec" : "#fff");
            g.rect.setAttribute("stroke", i === me ? "#d9a21b" : passed ? "#2f9e5b" : "#cfcabe");
          });
          const left = Math.max(0, me + 1 - c);
          ahead.textContent = left > 0 ? `앞 대기 = 110 - ${100 + c} = ${left}` : "내 차례! 입장권 받기";
          ahead.setAttribute("fill", left > 0 ? "#23272f" : "#2f9e5b");
          s.setAttribute("opacity", 1 - seg(t, 8.4, 9));
        }, 5);
      },
    },
    {
      title: "저장소 지도: 어느 폴더가 무엇일까요?",
      tag: "저장소 하나에 여러 구성 요소가 함께 있어요",
      lead: "waiting-room 저장소 하나에 서버, 손님 쪽 코드, 인프라 코드, 문서가 다 들어 있어요. 폴더 이름만 알아도 어디를 열지 반은 정한 거예요.",
      body: `
<h3>네 묶음으로 나눠 보세요</h3>
<table class="map">
  <tr><th>묶음</th><th>폴더</th><th>한 줄 설명</th></tr>
  <tr><td><b>서버</b></td><td><code>server/</code></td><td>대기열 서버 (Kotlin, Spring). 2권</td></tr>
  <tr><td><b>손님 쪽</b></td><td><code>sdk-js/</code> <code>sdk-php/</code> <code>waitpage/</code></td><td>브라우저 SDK, PHP 브랜드용 코드, 표준 대기 페이지. 3권</td></tr>
  <tr><td></td><td><code>edge/</code></td><td>CloudFront 함수. 입장권 없는 사람을 대기 페이지로 보내요. 3권</td></tr>
  <tr><td></td><td><code>admin/</code> <code>demo/</code></td><td>운영 관리자 웹, 시범 페이지</td></tr>
  <tr><td><b>인프라</b></td><td><code>infra/</code> <code>.github/workflows/</code></td><td>AWS를 만드는 Terraform 코드, 배포 자동화. 4권</td></tr>
  <tr><td><b>문서 · 시험</b></td><td><code>dev_guide/</code> <code>loadtest/</code> <code>tools/</code></td><td>개발 가이드, 부하테스트, e2e 시나리오. 5권</td></tr>
</table>
<h3>길을 잃으면 여기부터</h3>
<ol class="steps">
  <li><code>dev_guide/README.md</code><small>"작업별로 읽을 문서" 표가 있어요. 무엇을 하든 여기서 시작해요.</small></li>
  <li><code>dev_guide/server/architecture.md</code><small>서버 구조 한 장 요약</small></li>
  <li><code>dev_guide/server/code-reading-guide.md</code><small>이 책의 원본이에요. 더 자세한 흐름이 있어요.</small></li>
</ol>`,
      lab: "<b>대형 마트 층별 안내도</b>예요. 처음 가면 진열대를 하나씩 보지 않고 안내도부터 봐요. \"식품은 지하, 가전은 3층\"만 알아도 헤매지 않지요. <code>dev_guide/README.md</code>가 그 안내도예요.",
      quiz: {
        q: "AWS에 서버와 Redis를 만드는 코드는 어느 폴더에 있을까요?",
        options: ["server/", "infra/", "edge/"],
        answer: 1,
        explain: "infra/에 Terraform 코드가 있어요. edge/는 CloudFront에서 도는 작은 함수, server/는 대기열 서버 코드예요. 4권에서 infra/를 읽어요.",
      },
      scene(api) {
        const s = api.svg();
        const groups = [
          { name: "서버", c: "#3462c9", items: ["server/"] },
          { name: "손님 쪽", c: "#0f9b8e", items: ["sdk-js/", "sdk-php/", "waitpage/", "edge/", "admin/"] },
          { name: "인프라", c: "#e07a1f", items: ["infra/", "workflows/"] },
          { name: "문서 · 시험", c: "#3a9a4a", items: ["dev_guide/", "loadtest/", "tools/"] },
        ];
        const all = [];
        groups.forEach((g, gi) => g.items.forEach(it => all.push({ it, gi })));
        const chips = all.map((a, i) => {
          const b = api.box(s, 0, 0, 84, 26, a.it, { size: 11.5, rx: 13 });
          return { b, ...a };
        });
        const heads = groups.map((g, gi) => api.t(g.name, { x: 55 + gi * 97, y: 58, "text-anchor": "middle", "font-size": 13.5, "font-weight": 800, fill: g.c, opacity: 0 }, s));
        api.loop(t => {
          t = t % 10;
          const p = seg(t, 1.5, 3.5), out = 1 - seg(t, 9.2, 9.9);
          const cnt = groups.map(() => 0);
          chips.forEach((c, i) => {
            const fx = 20 + (i % 4) * 92, fy = 90 + Math.floor(i / 4) * 44;
            const k = cnt[c.gi]++;
            const tx = 13 + c.gi * 97, ty = 74 + k * 34;
            c.b.setAttribute("transform", `translate(${fx + (tx - fx) * p},${fy + (ty - fy) * p})`);
            c.b.rect.setAttribute("stroke", p > .5 ? groups[c.gi].c : "#cfcabe");
            c.b.setAttribute("opacity", out);
          });
          heads.forEach(h => h.setAttribute("opacity", seg(t, 3, 4) * out));
        }, 5);
      },
    },
  ],

  recap: {
    title: "1권에서 배운 것",
    points: [
      "<b>웨이팅룸</b>은 손님을 줄 세우고 이벤트 서버가 버티는 만큼만 들여보내요.",
      "브라우저의 SDK가 <b>enter · status · pass · renew · complete</b> 요청을 서버에 보내요.",
      "서버는 여러 대, 진짜 기록은 <b>Redis 한 곳</b>. 그래서 서버가 꺼져도 괜찮아요.",
      "코드는 <b>seq(내 번호)</b>와 <b>cursor(입장선)</b> 두 숫자로 돌아가요. 앞 대기 = seq - cursor.",
      "길을 잃으면 <b>dev_guide/README.md</b>의 '작업별로 읽을 문서' 표부터 봐요.",
    ],
    nextLabel: "2권 예고 · 서버 코드 읽기",
    next: "이제 server/ 폴더를 열어요. 번호표 한 장이 만들어지는 순간부터 입장권이 나가는 순간까지, 실제 Kotlin 파일과 Lua 스크립트를 순서대로 따라가 봐요.",
  },

  recapScene(api) {
    const s = api.svg();
    const items = ["대기열", "요청 · 응답", "Redis", "seq · cursor", "폴더 지도"];
    const nodes = items.map((it, i) => {
      const a = -Math.PI / 2 + i * Math.PI * 2 / 5;
      const x = 200 + Math.cos(a) * 100, y = 150 + Math.sin(a) * 95;
      const b = api.box(s, x - 52, y - 16, 104, 32, it, { size: 13, rx: 16, stroke: api.accent });
      return { b, x, y };
    });
    const lines = nodes.map((n, i) => { const m = nodes[(i + 1) % 5]; return api.n("line", { x1: n.x, y1: n.y, x2: m.x, y2: m.y, stroke: api.accent, "stroke-opacity": .35, "stroke-width": 2 }, s); });
    lines.forEach(l => s.insertBefore(l, s.firstChild));
    api.loop(t => {
      t = t % 8;
      nodes.forEach((n, i) => n.b.setAttribute("opacity", seg(t, .3 + i * .5, .9 + i * .5) * (1 - seg(t, 7.3, 8))));
      lines.forEach((l, i) => l.setAttribute("opacity", seg(t, 2.8 + i * .3, 3.3 + i * .3) * (1 - seg(t, 7.3, 8))));
    }, 6);
  },
});
