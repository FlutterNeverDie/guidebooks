BOOKS.push({
  no: 4,
  short: "인프라",
  series: "웨이팅룸 코드 읽기",
  kicker: "INFRA FOR BEGINNERS",
  title: "인프라가 처음이라면",
  subtitle: "코드는 결국 어딘가의 컴퓨터에서 돌아요.<br>AWS 부품 이름부터 Terraform 코드 읽는 순서, 배포까지 차근차근 봐요.",
  color: { accent: "#e07a1f", ink: "#9a4d0b", soft: "#fdf0e3" },
  labLabel: "쉽게 비유하면",
  coverTag: "infra/ 폴더가 만드는 것들",
  recapTag: "4권에서 배운 것",

  coverScene(api) {
    const s = api.svg();
    const layers = ["CloudFront", "ALB", "ECS Fargate", "ElastiCache Valkey"];
    const B = layers.map((n, i) => api.box(s, 90, 30 + i * 62, 220, 44, n, { stroke: api.accent, fill: i % 2 ? "#fff" : "#fdf0e3" }));
    const d = api.n("circle", { r: 7, fill: api.accent }, s);
    api.loop(t => {
      const p = (t % 4) / 4;
      B.forEach((b, i) => b.setAttribute("transform", `translate(${90 + Math.sin(t * 1.2 + i) * 4},${30 + i * 62})`));
      d.setAttribute("cx", 330); d.setAttribute("cy", 52 + p * 186);
    }, 1);
  },

  chapters: [
    {
      title: "요청이 지나는 길",
      tag: "드래그해서 돌려 보세요. 서버는 여러 대, Redis는 주 + 복제본",
      lead: "손님 요청은 CloudFront → ALB → ECS Fargate(우리 서버) → ElastiCache Valkey(Redis) 순서로 지나가요. infra/ 폴더는 이 네 칸과 그 주변을 만드는 코드예요.",
      body: `
<h3>네 칸</h3>
<div class="cards">
  <div class="card"><b>CloudFront</b>전 세계에 퍼진 AWS의 앞단 서버예요. <code>/wr/*</code> 요청을 받아 "/wr"를 떼고, <code>/admin</code> 같은 막을 경로는 403으로 돌려보내요.</div>
  <div class="card"><b>ALB (로드밸런서)</b>요청을 서버 여러 대에 골고루 나눠요. CloudFront가 붙인 비밀 헤더가 맞을 때만 서버로 보내요(직접 접근 차단).</div>
  <div class="card"><b>ECS Fargate</b>우리 서버 컨테이너를 돌려 주는 AWS 서비스예요. 서버 컴퓨터를 직접 관리하지 않아도 돼요.</div>
  <div class="card"><b>ElastiCache Valkey</b>AWS가 관리해 주는 Redis예요. 주 노드와 복제본이 서로 다른 데이터센터(가용 영역)에 있어서 하나가 죽으면 자동으로 넘어가요.</div>
</div>
<h3>서버 코드는 ALB를 몰라요</h3>
<p>서버 입장에서는 그냥 8080 포트로 HTTP 요청이 올 뿐이에요.<br>ALB는 <code>GET /actuator/health/readiness</code>로 서버가 건강한지 계속 물어보고, 대답이 없는 서버에는 요청을 안 보내요.</p>`,
      files: "<code>dev_guide/server/code-reading-guide.md</code> 2장 \"네트워크 경로\" → <code>infra/README.md</code> 맨 위 그림",
      lab: "<b>대형 병원</b>이에요. 정문 안내 데스크(CloudFront)가 방문 목적을 묻고 출입 금지 구역은 막아요. 접수처(ALB)가 비어 있는 진료실(서버)로 환자를 나눠 보내요. 모든 진료실은 같은 전자 차트(Valkey)를 봐요.",
      quiz: {
        q: "서버(ECS 태스크) 한 대가 건강 검사에 대답하지 않으면 ALB는 어떻게 할까요?",
        options: ["그 서버로 요청을 계속 보내요", "그 서버로는 요청을 보내지 않아요", "Valkey를 다시 시작해요"],
        answer: 1,
        explain: "ALB는 /actuator/health/readiness로 건강 검사를 하고, 실패한 대상에는 요청을 보내지 않아요. ECS는 그 태스크를 새로 띄워요.",
      },
      scene(api) {
        const k = makeThree(api, { distance: 14.5, tilt: 0.45 });
        if (!k) return;
        const { THREE, world, label } = k;
        const mat = c => new THREE.MeshLambertMaterial({ color: c });
        const add = (geo, c, x, y, z) => { const m = new THREE.Mesh(geo, mat(c)); m.position.set(x, y, z); world.add(m); return m; };
        const lab = (t, x, y, z, col = "#9a4d0b") => { const l = label(t, { color: col, size: .42, bg: "rgba(255,255,255,.85)" }); l.position.set(x, y, z); world.add(l); };
        add(new THREE.BoxGeometry(1.0, 1.4, 2.6), 0x6aa0e8, -3.0, 0, 0); lab("CloudFront", -3.0, 1.3, 0, "#1f3f8a");
        add(new THREE.BoxGeometry(.8, 1.0, 2.2), 0xe07a1f, -1.2, 0, 0); lab("ALB", -1.2, 1.0, 0);
        const ecs = [-1.1, 0, 1.1].map(z => add(new THREE.BoxGeometry(.9, .8, .8), 0x3a9a4a, 1.0, 0, z)); lab("ECS 서버들", 1.0, 1.0, 0, "#24692f");
        add(new THREE.CylinderGeometry(.45, .45, .9, 24), 0xe2483d, 3.2, 0, -.7); add(new THREE.CylinderGeometry(.45, .45, .9, 24), 0xf2a49c, 3.2, 0, .7);
        lab("Valkey 주", 3.2, .9, -.7, "#b42318"); lab("복제본", 3.2, -.9, .7, "#b42318");
        const floor = new THREE.Mesh(new THREE.PlaneGeometry(9.5, 4.2), new THREE.MeshBasicMaterial({ color: 0xe9e6df, transparent: true, opacity: .6, side: THREE.DoubleSide }));
        floor.rotation.x = -Math.PI / 2; floor.position.y = -.75; world.add(floor);
        const balls = Array.from({ length: 6 }, (_, i) => add(new THREE.SphereGeometry(.13, 12, 12), 0xd9a21b, 0, 0, 0));
        let last = 0;
        api.loop(t => {
          const dt = t - last; last = t;
          balls.forEach((b, i) => {
            const p = ((t * .35 + i / 6) % 1);
            const z = [-1.1, 0, 1.1][i % 3];
            let x, y = .2, zz;
            if (p < .33) { x = -3.9 + p / .33 * 2.7; zz = 0; }
            else if (p < .66) { const q = (p - .33) / .33; x = -1.2 + q * 2.2; zz = z * q; }
            else { const q = (p - .66) / .34; x = 1.0 + q * 2.2; zz = z + (-.7 - z) * q; }
            b.position.set(x, y, zz);
          });
          k.draw(dt);
        }, 1.4);
      },
    },
    {
      title: "AWS 부품 사전",
      tag: "VPC 안에 공개 서브넷과 비공개 서브넷이 있어요",
      lead: "인프라 코드에 나오는 낯선 단어는 대부분 이 장에 있어요. 처음엔 모두 외우지 말고, 코드를 읽다가 모르는 단어가 나오면 여기로 돌아오세요.",
      body: `
<h3>네트워크</h3>
<div class="cards">
  <div class="card"><b>VPC</b>AWS 안의 우리 회사 전용 네트워크예요. 회사 VPC를 쓰라는 결정이 있어서, 값만 넣으면 새로 만들지 않고 기존 것을 써요.</div>
  <div class="card"><b>서브넷 (공개 / 비공개)</b>VPC를 나눈 칸이에요. ALB는 인터넷과 닿는 <b>공개</b> 칸에, 서버와 Valkey는 인터넷에서 직접 못 닿는 <b>비공개</b> 칸에 둬요.</div>
  <div class="card"><b>NAT</b>비공개 칸의 서버가 밖(이미지 저장소, 비밀값 저장소)으로 나갈 때만 쓰는 출구예요. 밖에서 안으로는 못 들어와요.</div>
  <div class="card"><b>보안 그룹</b>부품마다 붙이는 방화벽이에요. 예: Valkey는 "서버 보안 그룹에서 온 6379 포트만 받기"</div>
</div>
<h3>실행과 저장</h3>
<table class="map">
  <tr><th>부품</th><th>우리에게는</th></tr>
  <tr><td>ECR</td><td>서버 컨테이너 이미지 저장소</td></tr>
  <tr><td>ECS 태스크</td><td>서버 컨테이너 1개. 크기는 vCPU · 메모리로 정해요 (지금 코드는 1 vCPU / 2GB, 부하테스트 결과로 4GB를 검토 중)</td></tr>
  <tr><td>Secrets Manager</td><td>서명 키 · 관리자 토큰 같은 비밀값. 서버에 환경변수로 넣어 줘요</td></tr>
  <tr><td>S3</td><td>파일 저장소. 설정 백업, <code>config.json</code>, 표준 대기 페이지</td></tr>
  <tr><td>CloudWatch Logs</td><td>서버 로그 보관 (30일). 대시보드 · 알림은 비용 때문에 안 써요</td></tr>
  <tr><td>IAM 역할</td><td>"누가 무엇을 해도 되는지" 권한 묶음. 서버, 배포 작업마다 따로 있어요</td></tr>
</table>`,
      files: "<code>dev_guide/infra/README.md</code> \"확정된 사실\" 표 (왜 이 부품을 골랐는지)",
      lab: "<b>회사 건물</b>이에요. 건물 전체가 VPC, 1층 로비가 공개 서브넷(손님 출입 가능), 위층 사무실이 비공개 서브넷(출입증 필요)이에요. NAT는 직원 전용 뒷문이라 나갈 수는 있지만 밖에서 열 수 없어요. 보안 그룹은 방마다 붙은 출입 카드 리더기예요.",
      quiz: {
        q: "우리 서버(ECS 태스크)와 Valkey는 어느 서브넷에 있을까요?",
        options: ["공개 서브넷 (인터넷에서 바로 접근 가능)", "비공개 서브넷 (인터넷에서 직접 못 닿음)", "VPC 바깥"],
        answer: 1,
        explain: "인터넷과 맞닿는 건 ALB뿐이에요. 서버와 Valkey는 비공개 서브넷에 있고, 보안 그룹으로 필요한 연결만 열어요.",
      },
      scene(api) {
        const s = api.svg();
        api.n("rect", { x: 15, y: 30, width: 370, height: 250, rx: 16, fill: "#fdf0e3", stroke: api.accent, "stroke-width": 2 }, s);
        api.t("VPC", { x: 30, y: 52, "font-size": 14, "font-weight": 800, fill: "#9a4d0b" }, s);
        const pub = api.n("rect", { x: 35, y: 65, width: 330, height: 70, rx: 10, fill: "#fff", stroke: "#6aa0e8", "stroke-dasharray": "5 4" }, s);
        api.t("공개 서브넷", { x: 45, y: 82, "font-size": 12, "font-weight": 700, fill: "#1f3f8a" }, s);
        const priv = api.n("rect", { x: 35, y: 150, width: 330, height: 115, rx: 10, fill: "#fff", stroke: "#3a9a4a", "stroke-dasharray": "5 4" }, s);
        api.t("비공개 서브넷", { x: 45, y: 167, "font-size": 12, "font-weight": 700, fill: "#24692f" }, s);
        api.box(s, 150, 88, 90, 36, "ALB", { size: 13, stroke: api.accent });
        api.box(s, 270, 88, 80, 36, "NAT", { size: 13 });
        const srv = [0, 1].map(i => api.box(s, 60 + i * 100, 185, 86, 36, "서버", { size: 12.5, stroke: "#3a9a4a" }));
        api.box(s, 270, 185, 80, 36, "Valkey", { size: 12.5, stroke: "#e2483d" });
        const net = api.t("인터넷", { x: 195, y: 20, "text-anchor": "middle", "font-size": 12.5, "font-weight": 700, fill: "#6b7280" }, s);
        const inA = api.n("line", { x1: 195, y1: 25, x2: 195, y2: 88, stroke: "#2f9e5b", "stroke-width": 2.5 }, s);
        const bad = api.n("line", { x1: 120, y1: 25, x2: 100, y2: 185, stroke: "#e2483d", "stroke-width": 2.5, "stroke-dasharray": "5 4" }, s);
        const badX = api.t("✕", { x: 108, y: 140, "font-size": 20, "font-weight": 900, fill: "#e2483d" }, s);
        const out = api.n("path", { d: "M190 203 C 230 150, 260 140, 300 124", fill: "none", stroke: "#d9a21b", "stroke-width": 2.5, "stroke-dasharray": "5 4" }, s);
        const outT = api.t("밖으로만", { x: 236, y: 150, "font-size": 11.5, "font-weight": 700, fill: "#9a6a00" }, s);
        api.loop(t => {
          t = t % 10;
          inA.setAttribute("opacity", seg(t, .5, 1.2));
          const b = seg(t, 2.5, 3.2) * (1 - seg(t, 5.5, 6));
          bad.setAttribute("opacity", b); badX.setAttribute("opacity", b);
          const o = seg(t, 6.2, 7) * (1 - seg(t, 9.3, 9.9));
          out.setAttribute("opacity", o); outT.setAttribute("opacity", o);
          out.setAttribute("stroke-dashoffset", -t * 20);
        }, 7);
      },
    },
    {
      title: "Terraform: 인프라를 코드로 적어요",
      tag: "코드 → plan(무엇이 바뀌나) → 사람 확인 → apply",
      lead: "AWS 콘솔에서 버튼을 눌러 만들면 누가 무엇을 바꿨는지 남지 않아요. Terraform은 '이런 부품이 있어야 한다'를 코드로 적고, 지금 상태와 비교해 필요한 것만 만들거나 바꿔요.",
      body: `
<h3>코드 한 덩어리 읽기</h3>
<pre><span class="k">resource</span> <span class="s">"aws_elasticache_replication_group"</span> <span class="s">"this"</span> {
  engine                     = <span class="s">"valkey"</span>
  node_type                  = var.node_type   <span class="c"># 환경마다 다른 값</span>
  num_cache_clusters         = 2               <span class="c"># 주 + 복제본</span>
  automatic_failover_enabled = true
  multi_az_enabled           = true
}</pre>
<div class="cards">
  <div class="card"><b>resource</b>만들 부품 하나예요. "종류" "이름" { 설정 } 모양이에요.</div>
  <div class="card"><b>module</b>resource 여러 개를 묶은 폴더예요. 함수처럼 값을 넣어 불러요.</div>
  <div class="card"><b>variable / output</b>모듈에 넣는 값과 모듈이 돌려주는 값이에요.</div>
  <div class="card"><b>data</b>이미 있는 것을 <b>읽기만</b> 해요. 예: 회사 VPC</div>
  <div class="card"><b>state (상태 파일)</b>Terraform이 "지금 실제로 무엇을 만들어 뒀는지" 적어 둔 장부예요. S3에 보관해요.</div>
</div>
<h3>plan과 apply</h3>
<ol class="steps">
  <li><code>terraform plan</code>: 코드와 state를 비교해 <b>무엇을 만들고(+) 바꾸고(~) 지울지(-)</b> 보여 줘요. 실제로는 아무것도 안 바꿔요.</li>
  <li>사람이 plan을 읽어요. <b>destroy나 replace가 보이면 멈추고 이유를 확인</b>해요.<small>Valkey가 replace되면 대기열 데이터가 사라져요.</small></li>
  <li><code>terraform apply</code>: plan대로 실제로 바꿔요.</li>
</ol>
<h3>우리 팀 규칙</h3>
<p>AI는 코드 작성과 <code>fmt</code>, <code>validate</code>까지만 해요. <b>plan · apply는 사람이 직접</b> 해요.<br>비밀값은 코드에도 tfvars에도 넣지 않아요. Terraform은 Secrets Manager에 "빈 자리"만 만들어요.</p>`,
      files: "<code>dev_guide/infra/README.md</code> \"Terraform 규칙\" → <code>infra/modules/valkey/main.tf</code> (가장 짧은 모듈부터)",
      lab: "<b>인테리어 도면</b>이에요. 도면(코드)에 \"여기 책상 두 개\"라고 적으면, 시공 전에 \"책상 1개 추가, 의자 1개 철거\" 견적서(plan)가 나와요. 견적서를 사람이 확인하고 도장을 찍어야 시공(apply)을 시작해요. 공사 기록부(state)에는 지금 무엇이 설치돼 있는지 적혀 있어요.",
      quiz: {
        q: "plan 결과에 Valkey의 replace(지우고 다시 만들기)가 보이면 어떻게 해야 할까요?",
        options: ["그대로 apply해요", "멈추고 왜 replace되는지 확인해요", "state 파일을 지워요"],
        answer: 1,
        explain: "Valkey가 다시 만들어지면 대기열 데이터가 사라져요. destroy나 replace가 보이면 멈추고 이유부터 확인하는 게 규칙이에요.",
      },
      scene(api) {
        const s = api.svg();
        const code = api.box(s, 15, 95, 95, 110, "", { fill: "#1f2430", stroke: "#1f2430" });
        ["resource {", "  valkey", "  ecs × 2", "}"].forEach((l, i) => api.t(l, { x: 25, y: 125 + i * 20, "font-size": 12, "font-family": "ui-monospace, Menlo, monospace", fill: "#e6e1d6" }, s));
        const plan = api.n("g", { transform: "translate(140,70)" }, s);
        api.n("rect", { width: 120, height: 160, rx: 10, fill: "#fff", stroke: "#cfcabe", "stroke-width": 1.5 }, plan);
        api.t("plan", { x: 60, y: 22, "text-anchor": "middle", "font-size": 13, "font-weight": 800, fill: "#23272f" }, plan);
        const rows = [["+ ecs 태스크", "#2f9e5b"], ["~ 대수 2→3", "#d9a21b"], ["- 옛 규칙", "#e2483d"]].map(([t, c], i) => api.t(t, { x: 12, y: 55 + i * 30, "font-size": 12.5, "font-weight": 700, fill: c }, plan));
        const who = api.t("사람 확인 ✓", { x: 200, y: 260, "text-anchor": "middle", "font-size": 13, "font-weight": 800, fill: "#2f9e5b" }, s);
        const cloud = api.box(s, 290, 110, 95, 80, "AWS", { sub: "실제 부품", fill: "#fdf0e3", stroke: api.accent });
        const a1 = api.n("line", { x1: 110, y1: 150, x2: 140, y2: 150, stroke: api.accent, "stroke-width": 2.5 }, s);
        const a2 = api.n("line", { x1: 260, y1: 150, x2: 290, y2: 150, stroke: api.accent, "stroke-width": 2.5 }, s);
        api.loop(t => {
          t = t % 10;
          a1.setAttribute("opacity", seg(t, .5, 1));
          rows.forEach((r, i) => r.setAttribute("opacity", seg(t, 1.2 + i * .5, 1.6 + i * .5)));
          who.setAttribute("opacity", seg(t, 3.5, 4.2));
          a2.setAttribute("opacity", seg(t, 5, 5.5));
          cloud.rect.setAttribute("fill", t > 5.5 && t < 9.4 ? "#fbd9b4" : "#fdf0e3");
          s.setAttribute("opacity", 1 - seg(t, 9.4, 10));
        }, 6);
      },
    },
    {
      title: "infra/ 폴더 읽는 순서",
      tag: "환경 파일 → stack → 부품 모듈 순서로 내려가요",
      lead: "infra/는 envs(환경별 값)와 modules(부품)로 나뉘어요. 위에서 아래로, 환경 파일 → stack 모듈 → 부품 모듈 순서로 읽으면 길을 잃지 않아요.",
      body: `
<h3>구조</h3>
<pre>infra/
  envs/staging/main.tf   <span class="c"># ① 환경 차이만 (크기, 대수)</span>
  envs/live/main.tf
  modules/stack/         <span class="c"># ② 한 환경 전체를 묶음. envs는 이것만 부름</span>
  modules/network/       <span class="c"># ③ VPC, 서브넷, NAT (회사 VPC면 건너뜀)</span>
  modules/alb/           <span class="c"># ④ 로드밸런서, 건강 검사, 비밀 헤더 규칙</span>
  modules/ecs_service/   <span class="c"># ⑤ 태스크 정의, 서비스, 권한, 대수 조절</span>
  modules/valkey/        <span class="c"># ⑥ Redis</span>
  modules/cloudfront_edge/ <span class="c"># ⑦ 경로 함수, gate 함수, KVS</span>
  modules/ecr/ secrets/ backup_bucket/ github_deploy_role/</pre>
<h3>읽을 때 볼 것</h3>
<ol class="steps">
  <li><code>envs/staging/main.tf</code>와 <code>envs/live/main.tf</code>를 나란히<small>다른 줄이 곧 환경 차이예요. 예: staging 평소 1~2대, live 평소 2~6대</small></li>
  <li><code>modules/stack/main.tf</code> 맨 위 주석 그림<small>module 블록이 어떤 부품을 부르는지, 서로 어떤 값을 넘기는지 봐요.</small></li>
  <li>부품 모듈은 <code>main.tf</code> → <code>variables.tf</code> → <code>outputs.tf</code><small>resource 이름만 훑어도 무엇을 만드는지 보여요.</small></li>
</ol>
<h3>서버와 맞물리는 곳</h3>
<table class="map">
  <tr><th>서버 설정</th><th>인프라</th></tr>
  <tr><td>포트 8080</td><td>컨테이너 포트, 대상 그룹</td></tr>
  <tr><td><code>/actuator/health/readiness</code></td><td>ALB 건강 검사</td></tr>
  <tr><td><code>REDIS_ENDPOINT</code>, TLS</td><td>Valkey 주소 환경변수, 전송 암호화</td></tr>
  <tr><td><code>WR_SECRET_K1</code>, <code>WR_ADMIN_TOKENS</code></td><td>Secrets Manager → 환경변수</td></tr>
</table>`,
      files: "<code>infra/envs/staging/main.tf</code> → <code>infra/modules/stack/main.tf</code> → <code>modules/ecs_service/main.tf</code>의 <code>aws_ecs_task_definition</code>",
      lab: "<b>요리책</b>이에요. 환경 파일은 \"오늘은 4인분, 덜 맵게\" 같은 주문서이고, stack은 코스 요리 전체 순서, 부품 모듈은 개별 레시피예요. 주문서 → 코스 순서 → 레시피 순으로 보면 무엇이 왜 들어가는지 보여요.",
      quiz: {
        q: "staging과 live의 서버 대수가 왜 다른지 알고 싶어요. 어디부터 볼까요?",
        options: ["modules/network/main.tf", "envs/staging/main.tf와 envs/live/main.tf", "edge/gate.js"],
        answer: 1,
        explain: "환경 차이는 envs/*의 값으로만 둬요. 두 파일을 나란히 보면 min_tasks, max_tasks, Valkey 크기 차이가 바로 보여요.",
      },
      scene(api) {
        const s = api.svg();
        const items = [["envs/staging", 0], ["modules/stack", 1], ["network", 2], ["alb", 2], ["ecs_service", 2], ["valkey", 2], ["cloudfront_edge", 2]];
        const B = items.map(([n, d], i) => api.box(s, 30 + d * 50, 22 + i * 38, 170, 30, n, { size: 12.5, rx: 8 }));
        const nums = items.map((_, i) => api.t(String(i + 1), { x: 22 + items[i][1] * 50, y: 42 + i * 38, "text-anchor": "end", "font-size": 13, "font-weight": 800, fill: api.accent }, s));
        api.loop(t => {
          t = t % 10;
          const k = Math.floor(seg(t, .3, 7.5) * 7.99);
          B.forEach((b, i) => {
            b.rect.setAttribute("fill", i === k ? "#fdf0e3" : i < k ? "#fff" : "#fff");
            b.rect.setAttribute("stroke", i <= k ? api.accent : "#cfcabe");
            b.setAttribute("opacity", i <= k ? 1 : .35);
            nums[i].setAttribute("opacity", i <= k ? 1 : 0);
          });
          s.setAttribute("opacity", 1 - seg(t, 9.3, 10));
        }, 8);
      },
    },
    {
      title: "배포와 서버 대수",
      tag: "평소엔 적게, 이벤트 땐 미리 늘리고, CPU가 높으면 더 늘려요",
      lead: "코드를 main에 올리면 GitHub Actions가 서버 이미지를 만들어 staging에 자동 배포해요. live는 사람이 버튼을 눌러 배포해요. 서버 대수는 예약 증설과 CPU 기준 조절이 함께 정해요.",
      body: `
<h3>서버 배포 (.github/workflows/deploy.yml)</h3>
<ol class="steps">
  <li>main에 <code>server/</code> 변경이 push되면 staging 배포가 시작돼요. live는 Actions에서 직접 실행해요.</li>
  <li>GitHub이 <b>OIDC</b>로 AWS 역할을 잠깐 빌려요.<small>고정 비밀 키를 GitHub에 저장하지 않아도 돼요.</small></li>
  <li><code>./gradlew jib</code>로 컨테이너 이미지를 만들어 ECR에 올려요.</li>
  <li><code>aws ecs update-service</code>로 새 이미지를 배포하고, 새 배포가 끝까지 성공했는지 확인해요.</li>
</ol>
<p>표준 대기 페이지는 <code>deploy-waitpage.yml</code>이 따로 S3에 올려요. PR 검사는 <code>ci.yml</code>이에요.</p>
<h3>서버 대수 정하기</h3>
<div class="cards">
  <div class="card"><b>모드 B (기본)</b>평소에도 몇 대 켜 둬요(live 2대). 예고 없는 손님에도 바로 대응해요.</div>
  <div class="card"><b>예약 증설</b>tfvars의 <code>events</code>에 이벤트 시간을 적으면 시작 때 최소 · 최대 대수를 올리고, 끝나면 되돌려요.</div>
  <div class="card"><b>CPU 기준 조절</b>평균 CPU가 60%를 넘으면 늘리고, 한참 낮으면 줄여요. 항상 지금의 최소~최대 안에서만요.</div>
</div>
<h3>꼭 기억할 것</h3>
<p><b>이벤트 중에는 apply 금지.</b> 이벤트 중에 apply하면 Terraform이 최소 · 최대 대수를 평소 값으로 되돌려서 서버가 모자랄 수 있어요.</p>`,
      files: "<code>.github/workflows/deploy.yml</code> → <code>infra/README.md</code> \"운영 방식 (모드 A / B)\" → <code>modules/ecs_service/main.tf</code>의 <code>aws_appautoscaling_*</code>",
      lab: "<b>마트 계산대 운영</b>이에요. 평소엔 계산대 2개만 열어 두고(모드 B), 명절 세일 날엔 미리 8개를 열기로 예약해 둬요(예약 증설). 그래도 줄이 길어지면 직원을 더 불러요(CPU 기준). 세일 중에 근무표를 평소 것으로 다시 붙이면(이벤트 중 apply) 계산대가 닫혀 버려요.",
      quiz: {
        q: "이벤트 진행 중에 Terraform apply를 하면 왜 위험할까요?",
        options: ["코드가 날아가서", "예약 증설로 올려 둔 최소 · 최대 대수가 평소 값으로 돌아가서", "Valkey가 항상 다시 만들어져서"],
        answer: 1,
        explain: "예약 증설은 이벤트 시작에 min/max를 바꿔 두는 방식이에요. apply하면 Terraform이 코드에 적힌 평소 값으로 되돌려요.",
      },
      scene(api) {
        const s = api.svg();
        api.n("line", { x1: 40, y1: 240, x2: 380, y2: 240, stroke: "#cfcabe" }, s);
        api.n("line", { x1: 40, y1: 40, x2: 40, y2: 240, stroke: "#cfcabe" }, s);
        api.t("서버 대수", { x: 46, y: 36, "font-size": 12, fill: "#6b7280" }, s);
        api.t("시간 →", { x: 340, y: 258, "font-size": 12, fill: "#6b7280" }, s);
        const ev = api.n("rect", { x: 150, y: 40, width: 150, height: 200, fill: "#fdf0e3" }, s);
        api.t("이벤트", { x: 225, y: 56, "text-anchor": "middle", "font-size": 12.5, "font-weight": 800, fill: "#9a4d0b" }, s);
        const bars = Array.from({ length: 14 }, (_, i) => api.n("rect", { x: 48 + i * 24, width: 16, rx: 3, fill: api.accent }, s));
        const plan = [2, 2, 2, 2, 4, 4, 5, 7, 8, 6, 4, 2, 2, 2];
        const tags = { 4: "예약 증설", 7: "CPU 높음" };
        const tg = Object.entries(tags).map(([i, t]) => api.t(t, { x: 56 + i * 24, y: 0, "text-anchor": "middle", "font-size": 11.5, "font-weight": 700, fill: "#23272f" }, s));
        api.loop(t => {
          t = t % 10;
          const shown = Math.floor(seg(t, .3, 7) * 14.99);
          bars.forEach((b, i) => {
            const h = plan[i] * 20;
            b.setAttribute("y", 240 - h); b.setAttribute("height", h);
            b.setAttribute("opacity", i < shown ? 1 : 0);
          });
          Object.keys(tags).forEach((i, k) => { tg[k].setAttribute("y", 230 - plan[i] * 20); tg[k].setAttribute("opacity", +i < shown ? 1 : 0); });
          s.setAttribute("opacity", 1 - seg(t, 9.3, 10));
        }, 8);
      },
    },
  ],

  recap: {
    title: "4권에서 배운 것",
    points: [
      "요청은 <b>CloudFront → ALB → ECS Fargate → Valkey</b>를 지나요. 서버 코드는 ALB를 몰라요.",
      "<b>VPC · 공개/비공개 서브넷 · NAT · 보안 그룹</b>으로 무엇이 어디에 닿을 수 있는지 정해요.",
      "Terraform은 코드 → <b>plan</b> → 사람 확인 → <b>apply</b>. destroy · replace가 보이면 멈춰요. plan · apply는 사람이 해요.",
      "infra/는 <b>envs → modules/stack → 부품 모듈</b> 순서로 읽어요.",
      "main push → staging 자동 배포, live는 수동. 대수는 <b>예약 증설 + CPU 기준</b>. 이벤트 중 apply 금지.",
    ],
    nextLabel: "5권 예고 · 돌려 보고 버티게 하기",
    next: "마지막 권이에요. 내 컴퓨터에서 직접 돌려 보고, 테스트를 실행하고, 부하테스트로 무엇을 배웠는지, 장애 때 무슨 일이 일어나는지, 그리고 처음 2주 동안 무엇을 읽을지 정리해요.",
  },

  recapScene(api) {
    const s = api.svg();
    const names = ["CloudFront", "ALB", "ECS", "Valkey", "Terraform", "배포"];
    const B = names.map((n, i) => api.box(s, 0, 0, 104, 34, n, { size: 13, rx: 17, stroke: api.accent }));
    api.loop(t => {
      t = t % 8;
      B.forEach((b, i) => {
        const col = i % 3, row = Math.floor(i / 3);
        const p = seg(t, .2 + i * .4, .8 + i * .4);
        b.setAttribute("transform", `translate(${30 + col * 120},${90 + row * 80 - (1 - p) * 20})`);
        b.setAttribute("opacity", p * (1 - seg(t, 7.3, 8)));
      });
    }, 6);
  },
});
