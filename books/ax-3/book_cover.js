
// 이 책 안에서만 쓰는 장면 도구예요. 원고는 volumes/의 JS를 직접 수정해요.
const COURSE = {
  scene(api, c) {
    const { s, say } = fx.stage(api);
    const A = api.accent;
    api.t(c.label, { x: 180, y: 30, "text-anchor": "middle", "font-size": 12, "font-weight": 800, fill: MUTED }, s);
    let positions, edges;
    if (c.mode === "fork" || c.mode === "branch") {
      positions = c.mode === "fork"
        ? [[30, 52, 300], [20, 175, 150], [190, 175, 150], [30, 314, 300]]
        : [[30, 52, 300], [30, 155, 300], [20, 310, 150], [190, 310, 150]];
      edges = c.mode === "fork" ? [[0,1],[0,2],[1,3],[2,3]] : [[0,1],[1,2],[1,3]];
    } else if (c.mode === "compare") {
      positions = [[20, 78, 150], [190, 78, 150], [30, 218, 300], [30, 320, 300]];
      edges = [[0,2],[1,2],[2,3]];
    } else {
      positions = [[30, 56, 300], [30, 145, 300], [30, 234, 300], [30, 323, 300]];
      edges = [[0,1],[1,2],[2,3]];
    }
    const streams = edges.map(([a,b]) => {
      const [x,y,w] = positions[a], [xx,yy,ww] = positions[b];
      const from = [x+w/2,y+58], to = [xx+ww/2,yy-3];
      arrow(api, s, ...from, ...to, LINE, 2);
      return fx.stream(api, s, [from,to], { n: 2, c: A, r: 3, speed: .45, dash: false });
    });
    if (c.mode === "loop") {
      api.n("path", { d: "M330 352 H348 V85 H332", fill: "none", stroke: A, "stroke-width": 1.8, "stroke-dasharray": "4 4" }, s);
      arrow(api,s,348,85,332,85,A);
    }
    const cards = c.nodes.map((word, i) => {
      const [x,y,w] = positions[i];
      const g = fx.card(api,s,x,y,w,58,{title:word,sub:`0${i+1}`,c:A,fs:w<200?11.5:13});
      const frame = api.n("rect", {x:0,y:0,width:w,height:58,rx:10,fill:"none",stroke:A,"stroke-width":2,opacity:0}, g);
      return {g,frame,x,y};
    });
    api.loop(t => {
      t %= 10;
      const active = Math.min(3,Math.floor(t/2));
      cards.forEach(({g,frame,x,y},i)=>{
        fx.rise(g,x,y,.35 + .65*seg(t,.12+i*.23,.42+i*.23),4);
        frame.setAttribute("opacity", i===active ? .65+.25*Math.sin(t*4) : 0);
      });
      streams.forEach(f=>f(t));
      say(t,[[.3,2,c.nodes[0]],[2,4,c.nodes[1]],[4,6,c.nodes[2]],[6,9.8,c.nodes[3]]]);
    },7);
  },
  detail(api, c) {
    const {s, say} = fx.stage(api), A = api.accent;
    const label=(text,x,y,size=12,color=INK,parent=s)=>api.t(text,{x,y,"font-size":size,fill:color,"text-anchor":"middle"},parent);
    const box=(text,x,y,w=140,h=44,color=A)=>{
      const g=api.n("g",{},s);
      api.n("rect",{x,y,width:w,height:h,rx:9,fill:PAPER,stroke:color,"stroke-width":1.5},g);
      label(text,x+w/2,y+h/2+4,12,color,g); return g;
    };
    const line=(x,y,xx,yy,color=LINE)=>arrow(api,s,x,y,xx,yy,color,1.8);
    label(c.title,180,30,14);
    let marker;
    if(c.kind==="ranking") {
      label("올해 남은 휴가 이월?",180,62,12,MUTED);
      label("RRF 후보",91,100); label("재정렬 점수",267,100);
      const area=api.n("g",{},s);
      let removed=false;
      const before=[['h2-1','-6.2728'],['h2-3','-0.4948'],['h2-4','-7.7660'],['h2-2','-6.8772']];
      const draw=()=>{
        area.replaceChildren();
        const rows=before.filter(r=>!removed||r[0]!=="h2-3");
        const after=[...rows].sort((a,b)=>Number(b[1])-Number(a[1]));
        rows.forEach((r,i)=>{
          const j=after.findIndex(a=>a[0]===r[0]);
          api.n("line",{x1:145,y1:132+i*46,x2:205,y2:132+j*46,stroke:r[0]==="h2-3"?A:LINE,"stroke-width":r[0]==="h2-3"?2.5:1.2},area);
          label(r[0],90,136+i*46,13,r[0]==="h2-3"?A:INK,area);
          label(after[i][0]+"  "+after[i][1],269,136+i*46,11,after[i][0]==="h2-3"?A:INK,area);
        });
        label(removed?"정답이 후보 밖이면 복구할 수 없어요":"정답 h2-3: 2위 → 1위",180,340,12,A,area);
      };
      draw();
      const button=box("정답 후보 제외 / 복원",75,365,210,40);
      button.setAttribute("role","button");button.setAttribute("tabindex","0");button.setAttribute("aria-label","정답 후보 제외 또는 복원");
      button.style.cursor="pointer";
      const toggle=()=>{removed=!removed;button.setAttribute("aria-pressed",String(removed));draw();};
      button.addEventListener("click",toggle);
      button.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();toggle();}});
    } else if(c.kind==="quantization") {
      label("질문 q = [1, 0]",180,65,12,MUTED);
      label("a",100,104,14); label("b",260,104,14,A);
      box("0.5001",30,120);box("0.5002",190,120);
      line(100,166,100,210);line(260,166,260,210);
      label("×127 → 반올림 → ÷127",180,192,11,MUTED);
      box("0.503937",30,215);box("0.503937",190,215);
      label("동점: ID 순으로 a 먼저",180,289,12);
      box("후보 1개: a",30,315);box("후보 2개: b 복구",190,315);
      label("원본 재점수도 후보 안에서만",180,389,12,A);
    } else if(c.kind==="graph") {
      box("asset-031",100,65,160);box("team-a",100,195,160);box("division-x",100,325,160);
      line(180,110,180,190,A);line(180,240,180,320,A);
      label("OWNED_BY",85,145,10,A);label("asset-register",270,165,10,MUTED);
      label("PART_OF",85,275,10,A);label("org-register",270,295,10,MUTED);
      label("관계 2개 · 원문 2개",180,404,12,A);
      marker=api.n("circle",{cx:180,cy:150,r:4,fill:A},s);
    } else if(c.kind==="concurrency") {
      label("작업자 A",90,72);label("공유 잔액 10",180,108,12,A);label("작업자 B",270,72);
      line(90,90,90,395);line(270,90,270,395);
      box("10 읽음",30,130,120);box("10 읽음",210,130,120);
      label("확인 뒤 따로 차감",180,209,11,MUTED);
      box("6 사용",30,230,120);box("6 사용",210,230,120);
      label("잘못된 결과: 잔액 -2",180,301,13,"#b34a38");
      box("조건부 UPDATE: 1명 승인 · 잔액 4",32,333,296,52);
    } else if(c.kind==="timeline") {
      label("시간 ↓",47,65,11,MUTED);label("요청 A",133,65);label("요청 B",275,65);
      line(133,80,133,365);line(275,80,275,365);
      box("v1 시작",78,100,110);label("active = v1",272,128,11,MUTED);
      api.n("line",{x1:35,y1:195,x2:325,y2:195,stroke:A,"stroke-dasharray":"5 4"},s);
      label("active → v2",180,184,12,A);
      box("v1 부모 조회",78,240,110);box("v2 시작",220,240,110);
      box("v1로 완료",78,325,110);box("v2로 완료",220,325,110);
      label("요청마다 같은 버전을 끝까지",180,408,12,A);
    } else if(c.kind==="claims") {
      box("원문: 3일 전",30,85,300,62);
      box("답변: 30일 전",30,195,300,62,"#b34a38");
      line(180,148,180,192);
      label("동일한 leave-v2 인용",180,175,11,MUTED);
      box("ID 검사 통과",30,310,140);box("주장 일치 실패",190,310,140,44,"#b34a38");
      label("인용이 존재해도 숫자는 틀릴 수 있어요",180,403,11,A);
    } else if(c.kind==="loss") {
      label("실제 학습 배치 loss",180,67,12,MUTED);
      line(45,280,330,280);line(45,280,45,95);
      label("0",30,284,10,MUTED);label("0.5",27,104,10,MUTED);
      const values=[.168077,.468612,.001393,.481358,.011774,.085543,.009777,.006968,.033246,.002410,.027057,.008804];
      const pts=values.map((v,i)=>[55+i*24,280-v*340]);
      api.n("polyline",{points:pts.map(p=>p.join(',')).join(' '),fill:"none",stroke:A,"stroke-width":2},s);
      pts.forEach(([cx,cy])=>api.n("circle",{cx,cy,r:3,fill:A},s));
      label("step 1",65,303,10,MUTED);label("step 12",307,303,10,MUTED);
      box("검증 hit@1: 3/5 → 3/5",30,331,300);
      label("배치 손실 ≠ 미사용 문서 품질",180,410,12,A);
    } else if(c.kind==="shards") {
      label("샤드 A",90,76);label("샤드 B",270,76);
      ['a  .99','b  .98','c  .97'].forEach((t,i)=>box(t,28,100+i*63,124,46));
      ['d  .50','e  .49','f  .48'].forEach((t,i)=>box(t,208,100+i*63,124,46,MUTED));
      line(90,277,165,327,A);line(270,277,195,327);
      box("전역 top3: a, b, c",30,335,300,48);
      label("샤드당 1개만 받으면 b, c 누락",180,411,12,A);
    } else if(c.kind==="recovery") {
      box("검색 실행",30,65,300);line(180,110,180,155);
      label("저장 전 종료 → 검색 총 2회",180,140,12,"#b34a38");
      box("checkpoint 저장",30,167,300);line(180,212,180,270);
      label("저장 후 종료 → 검색 총 1회",180,246,12,A);
      box("새 프로세스에서 생성·검증",30,283,300);
      box("두 경우 모두 answer",30,367,300,44);
    }
    api.loop(t=>{
      if(marker) marker.setAttribute("cy",String(120+(t%5)/5*200));
      say(t%9,[[.2,4,c.caption||"입력과 결과를 함께 비교해요"],[4,8.8,"조건을 바꾸고 실패 경계를 확인해요"]]);
    },6);
  },
  overview(api, title, items) {
    const {s,say} = fx.stage(api);
    api.t(title,{x:180,y:34,"text-anchor":"middle","font-size":14,"font-weight":900,fill:INK},s);
    const cards = items.map((word,i)=>{
      const g=fx.card(api,s,22,60+i*67,316,53,{title:word,c:api.accent,fs:12.5});
      const badge=api.n("circle",{cx:288,cy:26,r:11,fill:api.accent},g);
      api.t(String(i+1),{x:288,y:30,"text-anchor":"middle","font-size":11,"font-weight":800,fill:"#fff"},g);
      return g;
    });
    api.loop(t=>{
      t%=9;
      cards.forEach((g,i)=>fx.rise(g,22,60+i*67,.3+.7*seg(t,.1+i*.32,.5+i*.32),7));
      say(t,[[.2,4,"작은 실습으로 구조를 확인해요"],[4,8.8,"조건을 바꾸고 결과를 비교해요"]]);
    },6);
  }
};

export const BOOK_COVER = {
  "title": "AX 심화편: 품질·규모·신뢰의 설계",
  "subtitle": "임베딩 개선부터 큰 색인, 그래프 근거, 권한 경계, 여러 작업자의 복구까지 다뤄요. 작은 수치 실험과 제어 모형을 실행하고 실제 시스템으로 옮길 조건을 정해요.",
  "tag": "성능과 보장 범위를 함께",
  "kicker": "QUALITY, SCALE AND TRUST",
  "color": {
    "accent": "#b36336",
    "ink": "#754025",
    "soft": "#f8ecdf"
  },
  "storageKey": "ax-3",
  "layout": {
    "stage": "1fr",
    "text": "1.875fr"
  },
  "text": {
    "coverLeft": "AX 심화편 · 백엔드 개발자를 위한 다음 단계",
    "coverRight": "5권 · 25장 · 실행 실습",
    "coverBadge": "5권 종합본",
    "runhead": "AX 심화편",
    "labLabel": "설계에 남길 한 줄",
    "outroLeft": "끝까지 읽었어요",
    "outroTag": "실행하고 조건을 바꾸기",
    "outroTitle": "설명의 다음은 작은 검증이에요",
    "outroBody": "<p>읽기 순서: <a href=\"../ax/index.html\">입문편</a> → <a href=\"../ax-practice/index.html\">실무편</a> → <a href=\"../ax-2/index.html\">중급편</a> → <a href=\"../ax-3/index.html\">심화편</a>.</p><p>모든 표는 저장소의 작은 실습을 실행해 얻은 결과예요. 합성 입력·가정·단순화한 모형은 해당 절에 표시했어요. 실제 모델, DB, 서비스의 성능 보장으로 읽지 않아요.</p><div class=\"card\"><b>다음 실험</b>한 가지 조건만 바꾸고 예상 결과를 먼저 적어 보세요. 실행한 뒤 차이의 원인을 설명하고, 계약과 실패 경로를 검사해요.</div><p><code>labs/rag-study/course/README.md</code>에 실행 순서와 범위를 정리했어요.</p>"
  },
  scene(api) { COURSE.overview(api, "AX 심화편", [
  "임베딩을 평가하고 개선하기",
  "큰 색인을 위한 설계 감각",
  "그래프에서 근거를 조립하기",
  "권한과 실행의 경계 만들기",
  "여러 작업자를 복구 가능한 시스템으로"
]); }
};
