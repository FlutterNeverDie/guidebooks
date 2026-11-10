BOOKS.push({
  no: 2,
  short: "서버 코드",
  series: "웨이팅룸 코드 읽기",
  kicker: "READING THE SERVER",
  title: "서버 코드 읽기",
  subtitle: "server/ 폴더를 실제로 열어요.<br>번호표 한 장이 만들어져 입장권이 될 때까지, 파일을 순서대로 따라가요.",
  color: { accent: "#6d4ae0", ink: "#3f2a9e", soft: "#f1ecff" },
  labLabel: "쉽게 비유하면",
  coverTag: "요청 하나가 지나가는 파일들",
  recapTag: "2권에서 배운 것",

  coverScene(api) {
    const s = api.svg();
    const steps = ["QueueController", "QueueService", "NumberAllocator", "TokenCodec"];
    const boxes = steps.map((n, i) => api.box(s, 110, 40 + i * 58, 180, 40, n, { size: 13.5, stroke: api.accent }));
    const dot = api.n("circle", { r: 8, fill: "#d9a21b" }, s);
    api.loop(t => {
      const p = (t % 5) / 5 * 4;
      const i = Math.min(3, Math.floor(p));
      boxes.forEach((b, k) => b.rect.setAttribute("fill", k === i ? "#f1ecff" : "#fff"));
      const y = 60 + p * 58 - (p > 3.6 ? 0 : 0);
      dot.setAttribute("cx", 90); dot.setAttribute("cy", Math.min(234, y));
    }, 2);
  },

  chapters: [
    {
      title: "서버 폴더 지도와 Spring 한 장 요약",
      tag: "의존은 한 방향으로만 흘러요. 거꾸로 부르면 빌드가 실패해요",
      lead: "서버 코드는 server/src/main/kotlin/com/waldlust/platform/waitingroom/ 아래에 약 4천 줄이에요. 폴더(모듈) 열 개 정도로 나뉘고, 서로 부를 수 있는 방향이 정해져 있어요.",
      body: `
<h3>먼저 볼 폴더 다섯 개</h3>
<table class="map">
  <tr><th>폴더</th><th>하는 일</th></tr>
  <tr><td><code>api/</code></td><td>HTTP 입구 (컨트롤러). 판단은 하지 않아요</td></tr>
  <tr><td><code>queue/</code></td><td><b>핵심.</b> 줄 서기 · 순번 · 입장 · 연장 · 퇴장</td></tr>
  <tr><td><code>scheduler/</code></td><td>입장선(cursor)을 미는 일</td></tr>
  <tr><td><code>token/</code></td><td>번호표 · 입장권 서명과 검증</td></tr>
  <tr><td><code>segment/</code></td><td>줄 설정, Redis 키 이름</td></tr>
</table>
<p>나머지(<code>brand/ edgesync/ backup/ metrics/ admin/ config/ common/</code>)는 처음엔 건너뛰어도 돼요.<br>Redis 안에서 도는 Lua 스크립트는 <code>server/src/main/resources/scripts/</code>에 있어요.</p>
<h3>Spring을 몰라도 이것만</h3>
<pre><span class="k">@RestController</span>   <span class="c">// 이 클래스가 HTTP 요청을 받는다</span>
<span class="k">class</span> QueueController(<span class="k">private val</span> queue: QueueService)
                      <span class="c">// ↑ 필요한 부품을 생성자로 받는다 (Spring이 넣어 줌)</span>
<span class="k">@Component</span>        <span class="c">// Spring이 하나 만들어 두고 필요한 곳에 넣어 주는 부품</span>
<span class="k">class</span> NumberAllocator(...)</pre>
<div class="cards">
  <div class="card"><b>val / var</b><code>val</code>은 한 번 넣으면 못 바꾸는 값, <code>var</code>는 바꿀 수 있는 값이에요.</div>
  <div class="card"><b>when</b>여러 경우를 나누는 문법이에요. 다른 언어의 switch와 비슷해요.</div>
  <div class="card"><b>가상 스레드</b>요청 하나마다 가벼운 실행 흐름 하나가 붙어요. 그래서 코드를 위에서 아래로 순서대로 읽으면 돼요.</div>
</div>`,
      files: "<code>dev_guide/server/architecture.md</code> - 모듈 표와 의존 방향<br><code>server/src/test/.../architecture/ModuleDependencyTest.kt</code> - 방향을 빌드에서 검사하는 테스트",
      lab: "<b>회사 결재선</b>이에요. 사원(api)은 팀장(queue)에게 올리고, 팀장은 부서장(segment, token)에게 올려요. 부서장이 사원에게 거꾸로 결재를 올리지 않지요. 순서가 정해져 있으니 누가 누구를 부르는지 헷갈리지 않아요.",
      quiz: {
        q: "queue 모듈 코드에서 api 모듈의 컨트롤러를 불러다 쓰면 어떻게 될까요?",
        options: ["잘 돌아가요", "ModuleDependencyTest가 빌드를 실패시켜요", "실행할 때만 오류가 나요"],
        answer: 1,
        explain: "의존 방향은 api → queue 한쪽뿐이에요. 거꾸로 부르면 ModuleDependencyTest가 잡아서 ./gradlew build가 실패해요.",
      },
      scene(api) {
        const s = api.svg();
        const pos = { api: [150, 30], queue: [150, 105], scheduler: [290, 105], brand: [40, 180], token: [150, 180], segment: [260, 180], config: [150, 250] };
        const B = {};
        for (const [k, [x, y]] of Object.entries(pos)) B[k] = api.box(s, x, y, 100, 34, k, { size: 13, rx: 17, stroke: k === "queue" ? api.accent : "#cfcabe", fill: k === "queue" ? "#f1ecff" : "#fff" });
        const c = (k, dx = 50, dy = 17) => [pos[k][0] + dx, pos[k][1] + dy];
        const arrow = (a, b, col = api.accent) => {
          const [x1, y1] = c(a, 50, 34), [x2, y2] = c(b, 50, 0);
          return api.n("line", { x1, y1, x2, y2, stroke: col, "stroke-width": 2, "marker-end": "url(#ah)" }, s);
        };
        const defs = api.n("defs", {}, s);
        const mk = api.n("marker", { id: "ah", viewBox: "0 0 10 10", refX: 9, refY: 5, markerWidth: 6, markerHeight: 6, orient: "auto" }, defs);
        api.n("path", { d: "M0 0 L10 5 L0 10 z", fill: api.accent }, mk);
        const arrows = [arrow("api", "queue"), arrow("queue", "brand"), arrow("queue", "token"), arrow("queue", "segment"), arrow("scheduler", "segment"), arrow("token", "config")];
        arrows.forEach(a => s.insertBefore(a, s.children[1]));
        const bad = api.n("path", { d: "M175 105 C 120 80, 120 70, 175 64", fill: "none", stroke: "#e2483d", "stroke-width": 2.5, "stroke-dasharray": "5 4" }, s);
        const x = api.t("✕ 빌드 실패", { x: 30, y: 82, "font-size": 13, "font-weight": 800, fill: "#e2483d" }, s);
        api.loop(t => {
          t = t % 9;
          arrows.forEach((a, i) => a.setAttribute("opacity", seg(t, .3 + i * .4, .8 + i * .4)));
          const b = seg(t, 4.5, 5.2) * (1 - seg(t, 8.2, 8.8));
          bad.setAttribute("opacity", b); x.setAttribute("opacity", b);
        }, 6);
      },
    },
    {
      title: "번호표 받기: enter를 따라가요",
      tag: "번호는 Redis에서 묶음으로 받아 와 메모리에서 나눠 줘요",
      lead: "손님이 POST /enter를 보내면 컨트롤러 → QueueService.enter → NumberAllocator(번호) → TokenCodec(서명) 순서로 번호표가 만들어져요. 이 길이 서버 코드의 첫 회차예요.",
      body: `
<h3>QueueService.enter (줄여서 옮김)</h3>
<pre><span class="k">fun</span> enter(seg: String): QueueResponse {
    <span class="k">val</span> state = stateOf(seg)   <span class="c">// 메모리 캐시의 줄 상태</span>
    <span class="c">// ① 브랜드가 있고 켜져 있나</span>
    <span class="c">// ② 긴급 스위치 (CLOSE 막기 / OPEN 바로 입장)</span>
    <span class="k">when</span> (state.phase(now)) {
        NOT_OPEN -> <span class="k">return</span> notOpenResponse(state)
        PRE      -> <span class="k">return</span> preResponse(...)
        OPEN     -> Unit
    }
    <span class="k">val</span> ticket = newTicket(state) <span class="c">// 번호 + 서명</span>
    <span class="c">// 아직 차례 아니면 WAIT</span>
    <span class="k">if</span> (ticket.seq > state.cursor) <span class="k">return</span> waitResponse(...)
    <span class="k">return</span> claim(...)  <span class="c">// 이미 차례면 바로 입장권</span>
}</pre>
<h3>번호는 어떻게 나오나요? (NumberAllocator)</h3>
<ol class="steps">
  <li>요청마다 Redis에 "번호 하나 주세요"를 하면 키 하나에 부하가 몰려요.<small>이걸 핫키라고 불러요.</small></li>
  <li>그래서 <b>번호 묶음</b>(최근 속도의 약 20ms분)을 <code>allocate.lua</code>로 한 번에 받아 와요.</li>
  <li>묶음은 서버 메모리에서 하나씩 나눠 줘요. <b>enter의 Redis 호출은 묶음이 떨어질 때뿐</b>이에요.</li>
</ol>
<h3>번호표는 서명된 문자열이에요 (TokenCodec)</h3>
<p><code>내용(JSON).서명</code> 모양이에요. 내용에는 줄 · 세대 · 번호가 들어 있고,<br>서버만 아는 키로 서명해서 손님이 번호를 고치면 바로 들통나요.</p>`,
      files: "<code>api/QueueController.kt</code> → <code>queue/QueueService.kt</code>의 <code>enter</code>, <code>newTicket</code> → <code>queue/NumberAllocator.kt</code> → <code>resources/scripts/allocate.lua</code> → <code>token/TokenCodec.kt</code>(형식만)",
      lab: "<b>번호표 발급기의 두루마리</b>예요. 손님이 올 때마다 본사에 전화해서 번호를 받으면 전화가 불통이 돼요. 대신 번호 100장짜리 두루마리를 한 번에 받아 와서 매장에서 한 장씩 떼어 줘요. 다 떨어질 때만 본사에 전화해요.",
      quiz: {
        q: "enter 요청 하나가 올 때마다 Redis를 부를까요?",
        options: ["네, 매번 번호를 하나씩 받아요", "아니요, 번호 묶음이 떨어질 때만 불러요", "Redis는 전혀 쓰지 않아요"],
        answer: 1,
        explain: "NumberAllocator가 번호 묶음을 미리 받아 메모리에서 나눠 줘요. 그래서 수만 명이 몰려도 Redis 호출은 훨씬 적어요. (이미 차례인 손님은 pass.lua도 불러요.)",
      },
      scene(api) {
        const s = api.svg();
        const red = api.box(s, 300, 30, 80, 56, "Redis", { sub: "seq 키", fill: "#fdeee6", stroke: "#e2483d" });
        const srv = api.box(s, 130, 120, 140, 70, "NumberAllocator", { sub: "메모리 묶음", size: 12.5, stroke: api.accent });
        const blockT = api.t("", { x: 200, y: 112, "text-anchor": "middle", "font-size": 12, "font-weight": 700, fill: api.accent }, s);
        const call = api.n("g", {}, s);
        api.n("rect", { x: -48, y: -12, width: 96, height: 24, rx: 12, fill: "#fff", stroke: "#e2483d" }, call);
        const callT = api.t("", { x: 0, y: 4, "text-anchor": "middle", "font-size": 11.5, "font-weight": 700, fill: "#e2483d" }, call);
        const tickets = Array.from({ length: 6 }, () => {
          const g = api.n("g", {}, s);
          api.n("rect", { x: -26, y: -12, width: 52, height: 24, rx: 5, fill: "#fff3c4", stroke: "#d9a21b" }, g);
          g.tx = api.t("", { x: 0, y: 4, "text-anchor": "middle", "font-size": 11.5, "font-weight": 700, fill: "#23272f" }, g);
          return g;
        });
        const people = api.t("손님", { x: 40, y: 265, "font-size": 13, fill: "#6b7280" }, s);
        api.loop(t => {
          t = t % 10;
          // 0~1.5 묶음 받아 오기, 1.5~ 한 장씩
          const fetch = t < 1.6;
          const q = seg(t, 0.2, 1.4);
          call.setAttribute("transform", `translate(${300 - q * 80},${60 + q * 40})`);
          callT.textContent = "101~106번 묶음";
          call.setAttribute("opacity", fetch ? 1 : 0);
          const used = Math.max(0, Math.min(6, Math.floor((t - 1.6) / 1.2) + 1));
          blockT.textContent = t < 1.4 ? "묶음 없음" : `남은 번호 ${6 - used}`;
          tickets.forEach((g, i) => {
            const st = 1.6 + i * 1.2, p = seg(t, st, st + .9);
            g.tx.textContent = `${101 + i}번`;
            g.setAttribute("transform", `translate(${200 - p * 140 + i * 0},${200 + p * 50 - i * 0})`);
            g.setAttribute("opacity", t < st ? 0 : 1 - seg(t, st + .9, st + 1.2));
          });
          srv.rect.setAttribute("fill", fetch ? "#fff" : "#f1ecff");
          people.setAttribute("opacity", 1);
        }, 3);
      },
    },
    {
      title: "순번 조회는 Redis를 부르지 않아요",
      tag: "status 요청 수만 건이 와도 Redis에는 200ms마다 한 번",
      lead: "가장 많이 불리는 GET /status는 Redis에 가지 않아요. 번호표 서명을 확인하고, 서버 메모리에 있는 입장선과 비교만 해요. 이 설계 덕분에 수십만 명이 기다려도 Redis가 편해요.",
      body: `
<h3>status가 하는 일</h3>
<ol class="steps">
  <li><code>tokens.verifyTicket</code>: 번호표 서명을 확인하고 안의 번호(seq)를 꺼내요.</li>
  <li>세대(ep)가 지금 세대와 다르면 <code>STALE_EPOCH</code> (다시 줄 서기)</li>
  <li>seq ≤ cursor면 <b>READY</b>, 아니면 <b>WAIT</b>와 앞 대기 인원</li>
</ol>
<h3>입장선은 어디서 오나요? (SegmentStateCache)</h3>
<p>서버마다 <b>200ms마다</b> Redis에서 줄 목록 · 설정 · cursor · tail을 읽어 메모리에 둬요.<br>status는 이 메모리 값만 봐요. 그래서 최대 0.2초 늦을 수 있지만 문제없어요.</p>
<h3>다음 조회는 언제? (PollInterval)</h3>
<table class="map">
  <tr><th>앞 대기 인원</th><th>다음 조회까지</th></tr>
  <tr><td>100명 이하</td><td>1초</td></tr>
  <tr><td>1천 명 이하</td><td>2초</td></tr>
  <tr><td>1만 명 이하</td><td>5초</td></tr>
  <tr><td>그보다 많으면</td><td>10초</td></tr>
</table>
<p>서버가 응답에 <code>nextPollMs</code>를 넣어 주면 SDK가 그만큼 기다렸다 다시 물어요.<br>시작 시각 직전에는 <code>PreQueue</code>가 간격을 무작위로 흩어서 한순간에 몰리지 않게 해요.</p>`,
      files: "<code>queue/QueueService.kt</code>의 <code>status</code> → <code>queue/SegmentStateCache.kt</code> → <code>queue/PollInterval.kt</code>, <code>queue/PreQueue.kt</code>",
      lab: "<b>공항 출발 안내판</b>이에요. 승객 수천 명이 항공사에 \"제 비행기 언제 떠요?\"라고 전화하면 항공사가 마비돼요. 대신 안내판(메모리 캐시)이 몇 초마다 새 정보를 받아 오고, 승객은 안내판만 봐요.",
      quiz: {
        q: "status 응답의 입장선 값은 어디에서 읽은 값일까요?",
        options: ["요청마다 Redis에서 새로 읽은 값", "서버 메모리 캐시(200ms마다 갱신)의 값", "손님 브라우저가 보낸 값"],
        answer: 1,
        explain: "SegmentStateCache가 200ms마다 Redis에서 읽어 둔 값이에요. status는 Redis를 부르지 않아요.",
      },
      scene(api) {
        const s = api.svg();
        const srv = api.box(s, 150, 105, 110, 90, "서버", { sub: "메모리 캐시", stroke: api.accent });
        const cache = api.t("", { x: 205, y: 182, "text-anchor": "middle", "font-size": 12, "font-weight": 700, fill: api.accent }, s);
        const red = api.box(s, 310, 120, 70, 60, "Redis", { fill: "#fdeee6", stroke: "#e2483d" });
        const pulse = api.n("line", { x1: 260, y1: 150, x2: 310, y2: 150, stroke: "#e2483d", "stroke-width": 3 }, s);
        const reqs = Array.from({ length: 16 }, (_, i) => api.n("circle", { r: 4.5, fill: api.accent }, s));
        const count = api.t("", { x: 200, y: 260, "text-anchor": "middle", "font-size": 13, fill: "#6b7280" }, s);
        api.loop(t => {
          const tick = (t % 1) < 0.2;
          pulse.setAttribute("opacity", tick ? 1 : .08);
          cache.textContent = `cursor = ${4700 + Math.floor(t) * 20}`;
          reqs.forEach((d, i) => {
            const p = ((t * 0.9 + i / 16) % 1);
            const y0 = 30 + (i * 53) % 240;
            d.setAttribute("cx", 15 + p * 135); d.setAttribute("cy", y0 + (150 - y0) * p);
            d.setAttribute("opacity", p > .92 ? (1 - p) * 12 : 1);
          });
          count.textContent = `status 요청 ${(Math.floor(t * 16)).toLocaleString()}건 · Redis 읽기 ${Math.floor(t) * 5}번`;
        }, 3.1);
      },
    },
    {
      title: "입장선 밀기: 리더 한 대와 Lua 스크립트",
      tag: "왕관(리더 락)을 가진 서버만 입장선을 밀어요",
      lead: "모든 서버의 Advancer가 200ms마다 깨어나지만, 실제로 입장선을 미는 건 리더 한 대뿐이에요. 리더가 죽으면 몇 초 안에 다른 서버가 왕관을 이어받아요.",
      body: `
<h3>200ms마다 일어나는 일 (scheduler/Advancer.kt)</h3>
<ol class="steps">
  <li><code>leader.lua</code>: Redis의 <code>wr:leader</code> 키를 잡거나 연장해요.<small>키가 비었으면 내가 리더, 남이 들고 있으면 이번 틱은 쉬어요.</small></li>
  <li><code>advance.lua</code>: 리더만 부르고, 줄마다 cursor를 올려요.<small>RATE면 초당 limit만큼, CONCURRENCY면 빈자리만큼</small></li>
  <li>시작 시각 전이거나 세대가 다르면 <b>SKIP</b>. 사전 대기 중엔 아무도 못 들어가요.</li>
</ol>
<h3>왜 Lua 스크립트일까요?</h3>
<p>"cursor를 읽고 → 계산해서 → 다시 쓰기"를 서버에서 따로따로 하면, 그 사이에 다른 서버가 끼어들 수 있어요.<br>Lua 스크립트는 <b>Redis 안에서 한 번에(원자적으로)</b> 실행돼서 아무도 끼어들지 못해요.</p>
<pre><span class="c">-- leader.lua (거의 전체)</span>
<span class="k">local</span> owner = redis.call(<span class="s">'GET'</span>, KEYS[1])
<span class="k">if</span> owner == ARGV[1] <span class="k">then</span> <span class="c">-- 내가 리더면 연장</span>
  redis.call(<span class="s">'PEXPIRE'</span>, KEYS[1], ARGV[2])
  <span class="k">return</span> 1
<span class="k">end</span>
<span class="k">if not</span> owner <span class="k">then</span>          <span class="c">-- 비었으면 내가 잡음</span>
  redis.call(<span class="s">'SET'</span>, KEYS[1], ARGV[1], <span class="s">'PX'</span>, ARGV[2])
  <span class="k">return</span> 1
<span class="k">end</span>
<span class="k">return</span> 0</pre>
<p>리더 키에는 만료 시간이 있어서, 리더가 죽어 연장을 못 하면 저절로 풀려요. 부하테스트에서는 리더를 강제로 죽인 뒤 약 2.4~3.3초 만에 다음 입장이 이어졌어요.</p>`,
      files: "<code>scheduler/Advancer.kt</code> → <code>resources/scripts/leader.lua</code> → <code>resources/scripts/advance.lua</code> (주석이 자세해요)",
      lab: "<b>회의실 발언 막대</b>예요. 막대를 든 사람만 말할 수 있어서 둘이 동시에 결정하지 않아요. 막대에는 모래시계가 달려 있어서, 든 사람이 쓰러지면 시간이 다 된 뒤 다른 사람이 집어 들어요.",
      quiz: {
        q: "서버 세 대가 모두 200ms마다 Advancer를 돌리면 입장선이 세 배로 밀릴까요?",
        options: ["네, 세 배로 밀려요", "아니요, 리더 락을 가진 한 대만 밀어요", "서버 수에 따라 limit를 나눠요"],
        answer: 1,
        explain: "leader.lua로 리더 한 대만 정해요. advance.lua에도 '한 틱에 한 번만' 막는 장치(펜싱)가 있어서, 잠깐 리더가 둘이 되어도 두 번 밀리지 않아요.",
      },
      scene(api) {
        const s = api.svg();
        const srvs = [40, 160, 280].map((x, i) => api.box(s, x, 170, 90, 50, `서버 ${i + 1}`, { size: 13 }));
        const crown = api.t("👑", { "text-anchor": "middle", "font-size": 24 }, s);
        const red = api.box(s, 150, 30, 110, 54, "Redis", { sub: "wr:leader", fill: "#fdeee6", stroke: "#e2483d" });
        const ticks = srvs.map(() => api.n("line", { stroke: api.accent, "stroke-width": 2, "stroke-dasharray": "4 3" }, s));
        const note = api.t("", { x: 200, y: 260, "text-anchor": "middle", "font-size": 13, "font-weight": 700 }, s);
        api.loop(t => {
          t = t % 12;
          const dead = t > 4 && t < 11.5;
          const leader = t < 4 ? 0 : t < 7 ? -1 : 1;
          srvs[0].setAttribute("opacity", dead ? .3 : 1);
          srvs.forEach((b, i) => b.rect.setAttribute("fill", i === leader ? "#f1ecff" : "#fff"));
          if (leader >= 0) { crown.setAttribute("x", 85 + leader * 120); crown.setAttribute("y", 160); crown.setAttribute("opacity", 1); }
          else crown.setAttribute("opacity", 0);
          ticks.forEach((l, i) => {
            const on = (t * 5 + i * .3) % 1 < .35 && !(dead && i === 0);
            api.set(l, { x1: 85 + i * 120, y1: 170, x2: 205, y2: 84, opacity: on ? (i === leader ? 1 : .25) : 0, stroke: i === leader ? api.accent : "#b9b4a8" });
          });
          note.textContent = t < 4 ? "서버 1이 리더: 입장선을 밂" : t < 7 ? "서버 1 꺼짐 → 락 만료 기다리는 중" : "서버 2가 왕관을 이어받음";
          note.setAttribute("fill", t >= 4 && t < 7 ? "#e2483d" : "#23272f");
        }, 2);
      },
    },
    {
      title: "입장권 · 연장 · 오류, 그리고 읽는 순서",
      tag: "입장권은 2분짜리, 30초마다 연장해요",
      lead: "차례가 되면 POST /pass로 번호표를 입장권으로 바꿔요. pass.lua가 결과를 숫자로 돌려주고, 서버는 그 숫자를 응답으로 바꿔요. 이 장 끝에 서버 코드 읽는 순서를 정리했어요.",
      body: `
<h3>pass.lua의 답</h3>
<table class="map">
  <tr><th>결과</th><th>뜻</th><th>손님에게</th></tr>
  <tr><td>성공</td><td>입장권 발급, active에 등록</td><td>PASS</td></tr>
  <tr><td>-1</td><td>아직 차례 아님</td><td>WAIT (조금 뒤 다시)</td></tr>
  <tr><td>-3</td><td>자리 꽉 참 (CONCURRENCY)</td><td>WAIT</td></tr>
  <tr><td>-4</td><td>늦은 수령 (차례 지나고 너무 늦게 옴)</td><td>410 TICKET_LATE → 다시 줄 서기</td></tr>
  <tr><td>-5</td><td>세대 다름</td><td>STALE_EPOCH</td></tr>
</table>
<h3>입장한 뒤</h3>
<p>SDK가 페이지가 보이는 동안 <b>30초마다</b> <code>POST /renew</code> → <code>renew.lua</code>가 만료 시각을 늘려요.<br>창을 닫으면 연장이 끊기고 <b>2분 뒤</b> 자리가 자동 반납돼요. 최대 이용 시간은 30분이에요.</p>
<h3>오류는 한 곳에서 모양을 만들어요</h3>
<p>코드 어디서든 <code>throw ApiException(ErrorCode.XXX)</code>를 던지면 <code>api/ErrorHandler.kt</code>가 <code>{ code, message }</code> JSON으로 바꿔요. 코드 목록은 <code>dev_guide/contracts/error-codes.md</code>예요.</p>
<h3>서버 코드 읽는 순서 (회차)</h3>
<ol class="steps">
  <li>번호표 받기<small>QueueController → QueueService.enter → NumberAllocator + allocate.lua</small></li>
  <li>순번 조회와 입장선<small>status → SegmentStateCache → PollInterval · PreQueue → Advancer + advance.lua</small></li>
  <li>입장권과 연장<small>pass · claim + pass.lua → renew + renew.lua → ReservationWindow</small></li>
  <li>브랜드와 토큰<small>BrandRegistry → TokenCodec(검증, 브랜드 키) → contracts/tokens.md</small></li>
  <li>오류와 설정<small>ErrorHandler → ApiException → SegmentConfig → resources/*.yml</small></li>
</ol>
<p>회차마다 테스트를 같이 보면 빨라요. 예: <code>server/src/test/.../queue/PreQueueTest.kt</code></p>`,
      files: "<code>queue/QueueService.kt</code>의 <code>pass</code>, <code>claim</code>, <code>renew</code> → <code>resources/scripts/pass.lua</code>, <code>renew.lua</code> → <code>api/ErrorHandler.kt</code>",
      lab: "<b>도서관 열람실 좌석표</b>예요. 번호가 불리면 좌석표(입장권)를 받고, 2시간마다 연장 버튼을 눌러야 해요. 안 누르고 나가면 시간이 지나 좌석이 자동으로 다음 사람에게 가요.",
      quiz: {
        q: "손님이 입장한 뒤 브라우저 창을 닫으면 자리는 어떻게 될까요?",
        options: ["30분 동안 계속 차지해요", "연장이 끊겨 약 2분 뒤 자동 반납돼요", "관리자가 직접 지워야 해요"],
        answer: 1,
        explain: "입장권은 2분짜리이고 30초마다 연장해야 유지돼요. 연장이 끊기면 만료 시각이 지나 active에서 빠져요.",
      },
      scene(api) {
        const s = api.svg();
        const cx = 200, cy = 140, R = 80;
        api.n("circle", { cx, cy, r: R, fill: "none", stroke: "#e4e1d8", "stroke-width": 14 }, s);
        const arc = api.n("circle", { cx, cy, r: R, fill: "none", stroke: api.accent, "stroke-width": 14, "stroke-linecap": "round", transform: `rotate(-90 ${cx} ${cy})`, "stroke-dasharray": `${2 * Math.PI * R}` }, s);
        const lbl = api.t("", { x: cx, y: cy - 2, "text-anchor": "middle", "font-size": 22, "font-weight": 800, fill: "#23272f" }, s);
        const sub = api.t("입장권 남은 시간", { x: cx, y: cy + 22, "text-anchor": "middle", "font-size": 12, fill: "#6b7280" }, s);
        const ev = api.t("", { x: cx, y: 260, "text-anchor": "middle", "font-size": 14, "font-weight": 700 }, s);
        // 1초 = 10초로 축소. 처음엔 30초마다 연장, 7초(=70초) 지점에 창을 닫음
        api.loop(t => {
          t = t % 22;
          const sec = t * 10;
          let left;
          const closed = sec >= 70;
          if (!closed) left = 120 - (sec % 30);
          else left = Math.max(0, 120 - (sec - 60));
          const frac = left / 120;
          arc.setAttribute("stroke-dashoffset", 2 * Math.PI * R * (1 - frac));
          arc.setAttribute("stroke", left <= 0 ? "#e2483d" : closed ? "#d9a21b" : api.accent);
          lbl.textContent = left <= 0 ? "반납" : `${Math.floor(left / 60)}:${String(Math.floor(left % 60)).padStart(2, "0")}`;
          const renewing = !closed && sec % 30 < 6 && sec > 5;
          ev.textContent = left <= 0 ? "연장이 끊겨 자리 자동 반납" : closed ? "창 닫음 · 연장 없음" : renewing ? "POST /renew → 2:00으로" : "이용 중";
          ev.setAttribute("fill", left <= 0 ? "#e2483d" : renewing ? "#2f9e5b" : "#23272f");
        }, 3.2);
      },
    },
  ],

  recap: {
    title: "2권에서 배운 것",
    points: [
      "서버는 <b>api → queue → segment · token</b>처럼 한 방향으로만 의존하고, 테스트가 빌드에서 검사해요.",
      "enter는 <b>NumberAllocator</b>가 Redis에서 받은 번호 묶음을 나눠 주고, <b>TokenCodec</b>이 서명해요.",
      "status는 <b>Redis를 부르지 않아요.</b> 200ms마다 갱신되는 메모리 캐시만 봐요.",
      "<b>리더 한 대</b>가 leader.lua로 락을 잡고 advance.lua로 입장선을 밀어요. Lua는 Redis 안에서 한 번에 실행돼요.",
      "입장권은 <b>2분짜리, 30초마다 연장</b>. 오류는 ErrorHandler가 한 모양으로 바꿔요.",
    ],
    nextLabel: "3권 예고 · 손님 화면에서 서버까지",
    next: "서버만으로는 손님이 줄을 설 수 없어요. 브라우저 SDK, 표준 대기 페이지, CloudFront 엣지 함수, PHP 브랜드 코드, 운영 관리자 웹이 서버와 어떻게 이어지는지 봐요.",
  },

  recapScene(api) {
    const s = api.svg();
    const files = ["QueueController", "QueueService", "NumberAllocator", "SegmentStateCache", "Advancer", "leader.lua", "advance.lua", "pass.lua", "renew.lua", "ErrorHandler"];
    const chips = files.map((f, i) => api.box(s, 0, 0, 128, 26, f, { size: 11.5, rx: 13, stroke: api.accent }));
    api.loop(t => {
      t = t % 9;
      chips.forEach((c, i) => {
        const col = i % 2, row = Math.floor(i / 2);
        const p = seg(t, .2 + i * .25, .8 + i * .25);
        c.setAttribute("transform", `translate(${60 + col * 160},${30 + row * 50 + (1 - p) * 20})`);
        c.setAttribute("opacity", p * (1 - seg(t, 8.3, 9)));
      });
    }, 6);
  },
});
