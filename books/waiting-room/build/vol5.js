BOOKS.push({
  no: 5,
  short: "실행과 운영",
  series: "웨이팅룸 코드 읽기",
  kicker: "RUN IT, TEST IT, KEEP IT UP",
  title: "돌려 보고 버티게 하기",
  subtitle: "읽기만 해서는 반만 알아요.<br>직접 돌려 보고, 테스트하고, 부하테스트와 장애에서 배운 것까지 정리해요.",
  color: { accent: "#3a9a4a", ink: "#24692f", soft: "#e8f5e9" },
  labLabel: "쉽게 비유하면",
  coverTag: "실행 → 테스트 → 부하 → 장애 → 다음 2주",
  recapTag: "시리즈 전체 정리",

  coverScene(api) {
    const s = api.svg();
    const steps = ["실행", "테스트", "부하", "장애", "2주"];
    const B = steps.map((n, i) => api.box(s, 22 + i * 74, 125, 64, 50, n, { size: 14, stroke: api.accent }));
    const bar = api.n("rect", { x: 22, y: 195, height: 8, rx: 4, fill: api.accent }, s);
    api.loop(t => {
      const p = Math.max(0, t % 6) / 6;
      bar.setAttribute("width", 356 * p);
      B.forEach((b, i) => b.rect.setAttribute("fill", p * 5 > i ? "#e8f5e9" : "#fff"));
    }, 5);
  },

  chapters: [
    {
      title: "내 컴퓨터에서 돌려 보기",
      tag: "Redis → 서버 → 브랜드 · 줄 만들기 → 줄 서기",
      lead: "Docker로 Redis(Valkey)만 띄우고, 서버를 내 컴퓨터에서 실행하면 바로 줄을 세워 볼 수 있어요. 처음 온 날 꼭 한 번 해 보세요.",
      body: `
<h3>서버 띄우기</h3>
<pre><span class="c"># 저장소 루트에서 Redis(Valkey)만</span>
docker compose up -d redis
<span class="c"># 서버 (local 프로파일, 포트 8090)</span>
cd server && ./gradlew bootRun</pre>
<h3>Swagger로 줄 서 보기</h3>
<ol class="steps">
  <li><code>http://localhost:8090/swagger-ui.html</code>을 열어요.<small>관리자 API는 Authorize에 <code>local-admin-token</code>을 넣어요(내 컴퓨터 전용 값).</small></li>
  <li>브랜드 만들기: <code>PUT /admin/brands/demo</code> <code>{"enabled":true}</code></li>
  <li>줄 만들기: <code>PUT /admin/segments/test1</code> <code>{"brand":"demo","mode":"RATE","limit":1}</code></li>
  <li>줄 서기: <code>POST /v1/segments/test1/enter</code><small>여러 번 부르면 번호가 하나씩 늘어나요. 1초에 1명씩 입장선이 밀리는 것도 status로 볼 수 있어요.</small></li>
</ol>
<h3>눈으로 보기</h3>
<pre>npm install
npm run demo    <span class="c"># 시범 페이지 http://localhost:5173 (가짜 휴대폰 여러 대)</span>
npm run admin   <span class="c"># 관리자 웹 http://localhost:5174</span></pre>
<p>IntelliJ에서 코드 이동이 안 되면 <code>server/build.gradle.kts</code>를 Gradle 프로젝트로 열고 JDK 25를 지정하세요.</p>`,
      files: "<code>dev_guide/server/code-reading-guide.md</code> 7장 \"직접 돌려 보기\" → 저장소 루트 <code>CLAUDE.md</code> \"자주 쓰는 명령\"",
      lab: "<b>운전 연수</b>예요. 교통 법규 책을 다 읽어도 처음 운전대를 잡으면 새로 보이는 게 많아요. 빈 주차장(내 컴퓨터)에서 한 바퀴 돌아 보면 책에서 읽은 깜빡이와 브레이크가 어디 있는지 몸으로 알게 돼요.",
      quiz: {
        q: "줄 서기(enter)를 해 보기 전에 꼭 먼저 만들어야 하는 것 두 가지는?",
        options: ["브랜드와 줄(세그먼트)", "입장권과 쿠키", "ECR과 ALB"],
        answer: 0,
        explain: "enter는 줄의 브랜드가 있고 켜져 있는지 먼저 봐요(2권 2장). 그래서 브랜드 → 줄 순서로 만들고 enter를 불러요.",
      },
      scene(api) {
        const s = api.svg();
        api.n("rect", { x: 20, y: 30, width: 360, height: 240, rx: 12, fill: "#1f2430" }, s);
        [0, 1, 2].forEach(i => api.n("circle", { cx: 40 + i * 16, cy: 46, r: 5, fill: ["#e2483d", "#d9a21b", "#2f9e5b"][i] }, s));
        const lines = [
          ["$ docker compose up -d redis", "#e6e1d6"], ["✓ redis started", "#9fd38a"],
          ["$ ./gradlew bootRun", "#e6e1d6"], ["Started on port 8090", "#9fd38a"],
          ["PUT /admin/brands/demo → 200", "#f4b860"], ["PUT /admin/segments/test1 → 200", "#f4b860"],
          ["POST /enter → WAIT, seq 1", "#e6e1d6"], ["POST /enter → WAIT, seq 2", "#e6e1d6"],
        ];
        const T = lines.map(([l, c], i) => api.t("", { x: 34, y: 78 + i * 24, "font-size": 12.5, "font-family": "ui-monospace, Menlo, monospace", fill: c }, s));
        api.loop(t => {
          t = t % 12;
          T.forEach((e, i) => {
            const st = .3 + i * 1.1, n = Math.floor(clamp((t - st) / .8) * lines[i][0].length);
            e.textContent = lines[i][0].slice(0, n);
          });
          s.setAttribute("opacity", 1 - seg(t, 11.3, 12));
        }, 10);
      },
    },
    {
      title: "테스트: 고친 뒤 무엇을 돌릴까요?",
      tag: "빠른 테스트부터, 무거운 테스트는 필요할 때",
      lead: "코드를 고쳤으면 ./gradlew build가 반드시 통과해야 해요. 줄 서기 흐름이나 Lua를 건드렸다면 Redis를 띄워 통합 테스트와 e2e 시나리오까지 돌려요.",
      body: `
<h3>테스트 사다리</h3>
<table class="map">
  <tr><th>명령</th><th>무엇을</th><th>언제</th></tr>
  <tr><td><code>./gradlew build</code></td><td>컴파일 + 코드 스타일(ktlint) + 단위 테스트</td><td><b>항상</b></td></tr>
  <tr><td><code>./gradlew integrationTest</code></td><td>진짜 Redis(Docker)로 흐름 검사</td><td>queue 흐름, Lua를 바꿨을 때</td></tr>
  <tr><td><code>python3 tools/e2e_scenarios.py ...</code></td><td>서버 두 대 + Redis로 시나리오</td><td>queue 흐름, Lua를 바꿨을 때</td></tr>
  <tr><td><code>npm test</code></td><td>sdk-js, 엣지 게이트, 대기 페이지</td><td>손님 쪽 코드를 바꿨을 때</td></tr>
</table>
<h3>테스트가 지켜 주는 규칙</h3>
<div class="cards">
  <div class="card"><b>ModuleDependencyTest</b>모듈 의존 방향(2권 1장)을 어기면 빌드가 실패해요.</div>
  <div class="card"><b>QueueMathTest, PreQueueTest</b>앞 대기 계산, 사전 대기 흩기 같은 계산 규칙이에요. 코드를 읽을 때 같이 보면 "이 함수가 무엇을 약속하는지" 바로 보여요.</div>
</div>
<h3>PR을 올리면</h3>
<p><code>.github/workflows/ci.yml</code>이 위 명령들을 자동으로 돌려요.<br>내 컴퓨터에서 먼저 통과시키고 올리면 기다리는 시간이 줄어요.</p>`,
      files: "<code>dev_guide/server/testing.md</code> → <code>server/src/test/.../queue/</code> → <code>server/src/integrationTest/.../QueueFlowIntegrationTest.kt</code>",
      lab: "<b>자동차 정비 점검</b>이에요. 매번 타이어 공기압과 등(build)은 보고, 엔진을 손댔으면 시운전(통합 테스트)까지 해요. 큰 수리 뒤엔 고속도로 주행(e2e)으로 확인하지요.",
      quiz: {
        q: "pass.lua를 고쳤어요. ./gradlew build 말고 무엇을 더 돌려야 할까요?",
        options: ["아무것도 안 해도 돼요", "integrationTest와 e2e 시나리오", "npm run demo만"],
        answer: 1,
        explain: "Lua는 진짜 Redis에서만 돌아요. 단위 테스트로는 확인이 안 되니 integrationTest와 e2e 시나리오를 돌려요.",
      },
      scene(api) {
        const s = api.svg();
        const rows = [["build", 260, "항상"], ["integrationTest", 200, "Lua · 흐름"], ["e2e", 140, "Lua · 흐름"]];
        const B = rows.map(([n, w, sub], i) => api.box(s, 200 - w / 2, 190 - i * 62, w, 48, n, { sub, size: 13.5, stroke: api.accent }));
        const marks = rows.map((_, i) => api.t("✓", { x: 200 + rows[i][1] / 2 - 18, y: 222 - i * 62, "font-size": 18, "font-weight": 900, fill: "#2f9e5b" }, s));
        api.loop(t => {
          t = t % 8;
          rows.forEach((_, i) => {
            const p = seg(t, .5 + i * 1.6, 1.4 + i * 1.6);
            B[i].rect.setAttribute("fill", p > .99 ? "#e8f5e9" : p > 0 ? "#fff8e1" : "#fff");
            marks[i].setAttribute("opacity", p > .99 ? 1 : 0);
          });
          s.setAttribute("opacity", 1 - seg(t, 7.4, 8));
        }, 6);
      },
    },
    {
      title: "부하테스트로 배운 것",
      tag: "같은 2만 건 몰림에 2GB는 꺼지고 4GB는 버텼어요 (로컬 Docker 측정)",
      lead: "k6라는 도구로 가짜 손님 수만 명을 만들어 서버를 눌러 봤어요(loadtest/k6/). 숫자 몇 개만 기억해 두면 설정을 바꿀 때 '왜 이 값인지' 판단할 수 있어요.",
      body: `
<h3>서버 한 대(1 vCPU)가 버티는 양 (대략)</h3>
<table class="map">
  <tr><th>요청</th><th>초당</th><th>이유</th></tr>
  <tr><td>순번 조회 status</td><td>약 14,000건</td><td>Redis를 안 불러서 (2권 3장)</td></tr>
  <tr><td>줄 서기 enter</td><td>약 4,000건</td><td>서명과 번호 발급이 더 무거워서</td></tr>
</table>
<h3>한꺼번에 몰릴 때 죽는 이유</h3>
<ol class="steps">
  <li>서버는 연결을 최대 3만 개까지 받아들이도록 설정돼 있어요(Tomcat <code>max-connections</code>).</li>
  <li>요청 하나하나가 메모리를 조금씩 쓰는데, 수만 개가 동시에 들어오면 <b>메모리가 모자라</b> 서버가 꺼져요.<small>1 vCPU / 2GB는 약 1만 5천 건 몰림에서, 4GB는 약 3만 건에서 꺼졌어요.</small></li>
  <li>대책 후보: 메모리를 4GB로, 연결 한도를 낮추기, 서버를 미리 늘리기. <b>아직 결정 중</b>이에요.</li>
</ol>
<h3>몰림을 흩으면 거의 공짜</h3>
<p>사전 대기 손님 3만 명이 시작 순간 한꺼번에 오면 느려지지만,<br><b>10초에 걸쳐 흩으면</b> 응답이 수십 ms로 돌아와요. <code>PreQueue</code>가 하는 일이에요.</p>
<h3>오래 돌려도 괜찮았어요</h3>
<p>7시간 넘게 쉬지 않고 돌려 800만 명 넘게 입장시켰는데 실패가 0건이었어요.<br>메모리는 처음에 오르다가 약 3GB에서 멈춰요. 새는 게 아니라 정상이에요.</p>
<p><small>로컬 Docker로 Fargate 크기를 흉내 낸 결과라 실제 AWS에서는 다를 수 있어요. AWS 환경에서 다시 잴 예정이에요.</small></p>`,
      files: "<code>dev_guide/server/capacity.md</code> (측정 기록, 크기 정하기) → <code>loadtest/k6/</code> → <code>dev_guide/server/testing.md</code>",
      lab: "<b>엘리베이터 정원</b>이에요. 엘리베이터(서버)는 평소엔 잘 다니지만 한 번에 너무 많이 타면 멈춰요. 더 큰 엘리베이터로 바꾸거나(메모리), 한 번에 타는 인원을 제한하거나(연결 한도), 사람들이 조금씩 나눠 오게 하면(흩기) 멈추지 않아요.",
      quiz: {
        q: "사전 대기 손님이 시작 순간 한꺼번에 몰리는 문제를 가장 싸게 줄이는 방법은?",
        options: ["서버를 열 배로 늘린다", "도착 시각을 몇 초에 걸쳐 흩는다", "Redis를 하나 더 둔다"],
        answer: 1,
        explain: "부하테스트에서 3만 명을 10초에 걸쳐 흩자 응답이 수십 ms로 돌아왔어요. 서버를 늘리지 않아도 되는 가장 싼 방법이에요.",
      },
      scene(api) {
        const s = api.svg();
        const cols = [["1 vCPU / 2GB", 90], ["1 vCPU / 4GB", 280]];
        const bars = cols.map(([n, x]) => {
          api.t(n, { x, y: 40, "text-anchor": "middle", "font-size": 13.5, "font-weight": 800, fill: "#23272f" }, s);
          api.n("rect", { x: x - 35, y: 60, width: 70, height: 170, rx: 8, fill: "#fff", stroke: "#cfcabe", "stroke-width": 1.5 }, s);
          const f = api.n("rect", { x: x - 33, width: 66, rx: 6, fill: api.accent }, s);
          const r = api.t("", { x, y: 262, "text-anchor": "middle", "font-size": 14, "font-weight": 800 }, s);
          return { f, r, x };
        });
        const cnt = api.t("", { x: 185, y: 150, "text-anchor": "middle", "font-size": 13, "font-weight": 700, fill: "#6b7280" }, s);
        api.loop(t => {
          t = t % 10;
          const n = Math.floor(seg(t, .5, 5.5) * 20000);
          cnt.textContent = `몰림 ${n.toLocaleString()}건`;
          bars.forEach((b, i) => {
            const cap = i === 0 ? 15000 : 30000;
            const used = Math.min(1, n / cap);
            const dead = n >= cap;
            const h = 166 * used;
            b.f.setAttribute("y", 228 - h); b.f.setAttribute("height", h);
            b.f.setAttribute("fill", dead ? "#e2483d" : used > .75 ? "#d9a21b" : api.accent);
            b.r.textContent = dead ? "메모리 부족, 꺼짐" : n > 0 ? "버팀" : "";
            b.r.setAttribute("fill", dead ? "#e2483d" : "#2f9e5b");
          });
          s.setAttribute("opacity", 1 - seg(t, 9.3, 10));
        }, 6);
      },
    },
    {
      title: "장애 때 무슨 일이 일어날까요?",
      tag: "무엇이 고장 나면 어떻게 되는지 미리 알아 두면 덜 무서워요",
      lead: "부품은 언젠가 고장 나요. 웨이팅룸은 고장마다 대비가 되어 있어요. 무엇이 어떻게 버티는지 알면 장애 때 당황하지 않고 runbook을 펼 수 있어요.",
      body: `
<h3>고장별로</h3>
<table class="map">
  <tr><th>고장</th><th>무슨 일이</th></tr>
  <tr><td>서버 한 대 꺼짐</td><td>ALB가 그 서버를 빼고, ECS가 새로 띄워요. 기록은 Redis에 있어서 손님 번호는 그대로예요</td></tr>
  <tr><td>리더 서버 꺼짐</td><td>리더 락이 만료될 때까지 약 3초 입장이 멈췄다가 다른 서버가 이어서 밀어요 (2권 4장)</td></tr>
  <tr><td>Valkey 주 노드 고장</td><td>복제본이 주 노드로 올라가요. 번호 · 입장선이 과거 값으로 돌아가도 되감김 방지 장치가 중복을 막아요</td></tr>
  <tr><td>Redis가 느림 (1초 넘김)</td><td>지금은 500 오류 → SDK가 장애 정책을 따라요 (3권 4장). "바쁨"으로 답하게 바꿀 예정이에요</td></tr>
  <tr><td>대기열 전체가 안 됨</td><td>SDK가 <code>config.json</code>의 장애 정책: OPEN이면 통과, CLOSED면 재시도</td></tr>
</table>
<h3>장애 때 보는 곳</h3>
<ol class="steps">
  <li>관리자 웹 대시보드<small>신호등, 리더 수가 정확히 1인지, 초당 입장</small></li>
  <li><code>dev_guide/ops/runbook.md</code><small>이벤트 준비 · 당일 · 장애 대응 순서</small></li>
  <li><code>dev_guide/server/troubleshooting.md</code><small>증상별 원인 찾기</small></li>
  <li>CloudWatch Logs <code>/ecs/waiting-room-&lt;env&gt;</code><small>서버 로그 (JSON)</small></li>
</ol>`,
      files: "<code>dev_guide/ops/runbook.md</code> → <code>dev_guide/server/troubleshooting.md</code> → <code>resources/scripts/allocate.lua</code>, <code>advance.lua</code>의 \"되감김 방지\" 주석",
      lab: "<b>비행기 안전 수칙 카드</b>예요. 엔진 하나가 꺼져도 나머지로 날 수 있고(서버 여러 대), 산소가 떨어지면 마스크가 내려와요(장애 정책). 승무원은 카드를 미리 외워 두기 때문에 실제 상황에서 침착해요.",
      quiz: {
        q: "리더 서버가 갑자기 꺼지면 손님 입장은 어떻게 될까요?",
        options: ["영원히 멈춰요", "몇 초 멈췄다가 다른 서버가 리더를 이어받아 계속돼요", "모든 손님이 처음부터 다시 줄 서요"],
        answer: 1,
        explain: "리더 락에 만료 시간이 있어서, 연장이 끊기면 몇 초 뒤 다른 서버가 락을 잡고 입장선을 계속 밀어요. 부하테스트에서는 약 2.4~3.3초였어요.",
      },
      scene(api) {
        const s = api.svg();
        const cards = [["서버 꺼짐", "ALB가 빼고 새로 띄움"], ["리더 꺼짐", "약 3초 뒤 이어받음"], ["Valkey 주 고장", "복제본이 주로"], ["대기열 전체 장애", "config.json 정책"]];
        const B = cards.map(([a, b], i) => {
          const g = api.n("g", {}, s);
          const r = api.n("rect", { x: -150, y: -24, width: 300, height: 48, rx: 10, fill: "#fff", stroke: "#cfcabe", "stroke-width": 1.5 }, g);
          const ta = api.t(a, { x: -136, y: 5, "font-size": 13.5, "font-weight": 800, fill: "#e2483d" }, g);
          const tb = api.t("→ " + b, { x: -10, y: 5, "font-size": 13, "font-weight": 700, fill: "#2f9e5b" }, g);
          g.setAttribute("transform", `translate(200,${50 + i * 64})`);
          return { g, r, tb };
        });
        api.loop(t => {
          t = t % 10;
          B.forEach((c, i) => {
            const a = seg(t, .3 + i * 1.8, .8 + i * 1.8), b = seg(t, 1.1 + i * 1.8, 1.6 + i * 1.8);
            c.g.setAttribute("opacity", a * (1 - seg(t, 9.3, 10)));
            c.tb.setAttribute("opacity", b);
            c.r.setAttribute("stroke", b > .5 ? "#2f9e5b" : "#e2483d");
          });
        }, 8.5);
      },
    },
    {
      title: "처음 2주, 그리고 작업 규칙",
      tag: "하루 한 회차씩, 읽고 돌려 보고 퀴즈 풀기",
      lead: "한 번에 다 읽으려 하지 말고 하루에 한 주제씩 가요. 2주 뒤에는 '이 버그는 어느 파일을 열어야 하지?'에 바로 답할 수 있을 거예요.",
      body: `
<h3>2주 계획 (예시)</h3>
<table class="map">
  <tr><th>날</th><th>할 일</th></tr>
  <tr><td>1일</td><td>이 책 1권 + <code>dev_guide/README.md</code> + 서버 띄워서 줄 서 보기 (5권 1장)</td></tr>
  <tr><td>2~3일</td><td>2권 2장: enter 따라가기 + <code>NumberAllocator</code> 테스트 읽기</td></tr>
  <tr><td>4일</td><td>2권 3~4장: status, 캐시, Advancer, Lua 두 개</td></tr>
  <tr><td>5일</td><td>2권 5장: pass · renew, 오류 코드 문서</td></tr>
  <tr><td>6~7일</td><td>3권: <code>npm run demo</code>로 SDK를 눈으로 보며 client.ts</td></tr>
  <tr><td>8~9일</td><td>4권: infra/를 envs → stack → 모듈 순서로</td></tr>
  <tr><td>10일</td><td>runbook 읽고, 관리자 웹으로 줄 하나 만들어 운영해 보기</td></tr>
</table>
<h3>코드를 고칠 때 지키는 규칙</h3>
<div class="cards">
  <div class="card"><b>계약은 함께 바꿔요</b>API · 토큰 · 오류 코드는 컴포넌트끼리의 약속이에요. <code>dev_guide/contracts/</code> 문서의 "구현한 곳" 표에 있는 파일을 전부 같이 고쳐요.</div>
  <div class="card"><b>기록을 남겨요</b>코드를 바꾸면 해당 기능 문서의 "변경 이력"에 <code>날짜 - 무엇을 - 왜</code> 한 줄</div>
  <div class="card"><b>열린 문제부터</b>작업 전에 <code>dev_guide/issues/</code>를 봐요.</div>
  <div class="card"><b>비밀값은 어디에도 적지 않아요</b>서명 키, 관리자 토큰, API 키는 코드 · 문서 · 채팅에 남기지 않아요.</div>
</div>
<p>모르는 게 생기면 <b>문서와 코드가 다를 때는 코드가 맞아요.</b> 다른 점을 찾으면 문서를 고쳐 주세요. 그것도 큰 기여예요.</p>`,
      files: "저장소 루트 <code>CLAUDE.md</code> (작업 규칙 · 체크리스트) → <code>dev_guide/server/conventions.md</code> → <code>dev_guide/server/howto/</code>",
      lab: "<b>새 동네 익히기</b>예요. 첫날 지도를 보고, 다음 날부터 매일 골목 하나씩 걸어 보면 2주 뒤엔 지도 없이도 다녀요. 걷다가 지도와 다른 길을 발견하면 지도에 표시해 두면 다음 사람이 덜 헤매요.",
      quiz: {
        q: "오류 코드 하나를 새로 추가했어요. 무엇을 같이 해야 할까요?",
        options: ["서버 코드만 고치면 끝", "contracts/error-codes.md의 '구현한 곳'을 전부 고치고 변경 이력을 남겨요", "PHP SDK만 고쳐요"],
        answer: 1,
        explain: "오류 코드는 서버, SDK, PHP 등 여러 곳이 함께 쓰는 약속이에요. 계약 문서의 '구현한 곳'을 모두 맞추고 변경 이력을 남겨요. 순서는 dev_guide/server/howto/에 있어요.",
      },
      scene(api) {
        const s = api.svg();
        const days = Array.from({ length: 10 }, (_, i) => {
          const x = 40 + (i % 5) * 66, y = 70 + Math.floor(i / 5) * 90;
          const b = api.box(s, x, y, 56, 64, `${i + 1}일`, { size: 13, stroke: "#cfcabe" });
          const ck = api.t("✓", { x: x + 28, y: y + 54, "text-anchor": "middle", "font-size": 16, "font-weight": 900, fill: "#2f9e5b" }, s);
          return { b, ck };
        });
        const msg = api.t("어느 파일을 열지 바로 알아요", { x: 200, y: 268, "text-anchor": "middle", "font-size": 14, "font-weight": 800, fill: api.accent }, s);
        api.loop(t => {
          t = t % 10;
          days.forEach((d, i) => {
            const p = seg(t, .3 + i * .6, .7 + i * .6);
            d.ck.setAttribute("opacity", p);
            d.b.rect.setAttribute("fill", p > .5 ? "#e8f5e9" : "#fff");
            d.b.rect.setAttribute("stroke", p > .5 ? api.accent : "#cfcabe");
          });
          msg.setAttribute("opacity", seg(t, 6.6, 7.2) * (1 - seg(t, 9.3, 10)));
        }, 7.5);
      },
    },
  ],

  recap: {
    title: "다섯 권 정리",
    points: [
      "<b>1권</b> 웨이팅룸은 번호표와 입장선(seq, cursor) 두 숫자로 돌아가고, 진짜 기록은 Redis 한 곳에 있어요.",
      "<b>2권</b> 서버는 Controller → QueueService → NumberAllocator · TokenCodec, 리더가 Lua로 입장선을 밀어요.",
      "<b>3권</b> SDK · 대기 페이지 · 엣지 · PHP · 관리자 웹이 서버와 이어지고, 장애 땐 config.json 정책을 따라요.",
      "<b>4권</b> CloudFront → ALB → ECS → Valkey를 Terraform이 만들고, plan · apply는 사람이 해요.",
      "<b>5권</b> 직접 돌리고, 맞는 테스트를 돌리고, 부하 · 장애에서 배운 숫자로 판단해요.",
    ],
    nextLabel: "맺음말",
    next: "이 책은 dev_guide/server/code-reading-guide.md와 dev_guide 문서들을 바탕으로 만들었어요. 코드가 바뀌면 책보다 코드와 dev_guide가 먼저예요. 읽다가 다른 점을 찾으면 알려 주세요. 그게 이 책의 다음 판이 돼요.",
  },

  recapScene(api) {
    const s = api.svg();
    const vols = [["1", "#3462c9", "기초"], ["2", "#6d4ae0", "서버"], ["3", "#0f9b8e", "손님 쪽"], ["4", "#e07a1f", "인프라"], ["5", "#3a9a4a", "운영"]];
    const B = vols.map(([n, c, l], i) => {
      const g = api.n("g", {}, s);
      api.n("rect", { x: -26, y: -80, width: 52, height: 160, rx: 6, fill: c }, g);
      api.t(n + "권", { x: 0, y: -55, "text-anchor": "middle", "font-size": 13, "font-weight": 800, fill: "#fff" }, g);
      const tt = api.t(l, { x: 0, y: 0, "text-anchor": "middle", "font-size": 13, "font-weight": 700, fill: "#fff", "writing-mode": "vertical-rl" }, g);
      return g;
    });
    api.n("rect", { x: 40, y: 232, width: 320, height: 10, rx: 4, fill: "#cfb796" }, s);
    api.loop(t => {
      t = t % 8;
      B.forEach((g, i) => {
        const p = seg(t, .3 + i * .5, 1 + i * .5);
        g.setAttribute("transform", `translate(${80 + i * 60},${150 - (1 - p) * 40})`);
        g.setAttribute("opacity", p * (1 - seg(t, 7.3, 8)));
      });
    }, 5);
  },
});
