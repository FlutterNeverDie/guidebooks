export default {
      title: "임베딩 = 뜻의 좌표",
      tag: "실제 임베딩을 3차원으로 줄인 배치 · 끌어서 돌려 보세요",
      lead: "임베딩은 글을 숫자 몇백 개짜리 벡터로 바꾸는 일이에요. 학습할 때 뜻이 비슷한 글은 가까운 좌표에 오도록 배웠기 때문에, 단어가 하나도 겹치지 않아도 뜻이 가까우면 찾을 수 있어요.",
      body: `
<h3>벡터 하나 = 숫자 384개</h3>
<p>실습 모델은 어떤 글이든 숫자 384개로 바꿔요. 숫자 하나하나에 사람이 읽을 이름은 없어요. 대신 뜻이 비슷한 글끼리 384차원 공간에서 가까이 모여요. 왼쪽 그림은 그 384차원을 3차원으로 줄인 거예요(PCA). 줄이면서 정보의 63%가 사라지기 때문에 그림은 대략적이고, 실제 가까움은 원래 384차원에서 재요.</p>

<h3>가까움은 코사인으로 재요</h3>
<pre class="code"><code>q = embed(["할머니 돌아가시면 며칠 쉬어?"])[0]
scores = doc_vecs @ q      # 둘 다 길이를 1로 맞춰 두면 내적 = 코사인
top3 = np.argsort(-scores)[:3]</code></pre>
<p>코사인은 두 벡터의 방향이 얼마나 같은지예요. 1이면 같은 방향, 0이면 무관해요. 이 질문은 '경조 휴가' 문단(0.47)을 1위로 찾았어요. 질문에는 '경조', '조부모', '사망'이라는 단어가 하나도 없어요.</p>

<h3>임베딩이 못 가리는 것</h3>
<table class="vs">
  <tr><th>"연차는 다음 해로 이월된다"와</th><th>코사인</th></tr>
  <tr><td>같은 뜻, 다른 단어: "남은 휴가를 내년에 쓸 수 있다"</td><td>0.40</td></tr>
  <tr><td>반대 뜻: "연차는 다음 해로 이월되지 않는다"</td><td><span class="poor">0.75</span></td></tr>
  <tr><td>관계없음: "노트북을 잃어버리면 IT팀에 알린다"</td><td>0.15</td></tr>
</table>
<p>반대 뜻이 같은 뜻보다 더 가까워요. "최대 5일"과 "최대 15일"도 0.62예요. 임베딩은 <b>무슨 이야기인지</b>는 잘 잡지만 <b>맞다, 아니다</b>와 <b>숫자</b>는 잘 못 가려요. 그래서 검색은 후보를 찾는 일까지만 맡기고, 맞는지는 LLM이 원문을 읽고 판단해요. 키워드 검색을 섞는 이유도 여기 있어요(3권).</p>

<div class="try"><span class="lbl">직접 해 보기</span>
<p><code>rag-study/step3_chunking.py</code>: E 부분이 이 그림의 좌표, F 부분이 위 표예요.</p>
<p><code>rag-study/step2_vector_search.py</code>: '휴가'라는 단어 없이 연차 문서를 찾는 예예요.</p></div>`,
      lab: "<b>해시의 반대</b>라고 생각하면 쉬워요. 해시는 한 글자만 달라도 완전히 다른 값이 나오게 만들고, 임베딩은 뜻이 비슷하면 비슷한 값이 나오게 만들어요. 그리고 검색은 <b>위치 기반 \"내 주변 가게\" 조회</b>와 같아요. 위도, 경도 2차원 대신 384차원 좌표에서 가장 가까운 점 k개를 찾는 거예요.",
      quiz: {
        q: "\"환불이 된다\"는 문서와 \"환불이 안 된다\"는 문서가 둘 다 있어요. 벡터 검색만 믿으면 어떤 일이 생길까요?",
        options: ["항상 맞는 쪽만 1위로 나온다", "둘 다 비슷한 점수로 나와서 어느 쪽인지 검색만으로는 못 가린다", "부정문은 아예 검색되지 않는다"], answer: 1,
        explain: "실습에서 '이월된다'와 '이월되지 않는다'의 코사인은 0.75였어요. 검색은 둘 다 후보로 가져오고, 어느 쪽이 맞는지는 LLM이 원문과 날짜, 출처를 읽고 판단하게 해요.",
      },
      scene(api) {
        const k = makeThree(api, { distance: 12.5, tilt: 0.32 });
        if (!k) return;
        const { THREE, world, label } = k;
        // rag-study/step3_chunking.py E 부분 출력(PCA 3차원)
        const P = [[-0.32, 0.09, 0.29], [-0.37, 0.43, 0.13], [-0.29, 0.45, 0.01], [-0.46, -0.55, -0.22], [-0.38, 0.31, 0.10], [-0.43, -0.34, -0.02], [-0.29, -0.28, 0.03],
          [-0.16, 0.36, -0.07], [0.00, 0.20, 0.33], [0.48, -0.06, 0.46], [0.23, -0.24, 0.50], [-0.15, -0.06, -0.18], [0.26, -0.40, 0.17], [-0.14, -0.44, -0.02],
          [0.22, 0.03, -0.55], [0.26, -0.01, -0.23], [0.18, 0.30, -0.59], [0.65, -0.01, -0.34], [0.18, 0.24, 0.12], [0.33, 0.38, 0.32], [0.06, -0.24, 0.10], [0.23, -0.25, -0.05], [-0.13, 0.09, -0.29]];
        const N = ["근무 시간", "핵심 시간", "재택", "연차 생김", "연차 신청", "연차 이월", "경조 휴가", "출장 승인", "교통편", "숙박비", "일비", "영수증", "식대",
          "개인 카드", "노트북 지급", "VPN", "분실", "USB", "회의실", "주차", "택배", "강의 지원", "콘퍼런스"];
        const SEC = [0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 6, 6];
        const COL = ["#6b7280", "#2f5fd0", "#d9622b", "#8a5cc2", "#1f8a5b", "#0f9b8e", "#c28a1b"];
        const SC = 5.6;
        const v3 = p => new THREE.Vector3(p[0] * SC, p[1] * SC, p[2] * SC);
        if (THREE.GridHelper) { const g = new THREE.GridHelper(8, 8, 0xd8dbe2, 0xe8eaef); g.position.y = -3.4; world.add(g); }
        const nodes = P.map((p, i) => {
          const c = COL[SEC[i]];
          const m = new THREE.Mesh(new THREE.SphereGeometry(0.17, 18, 14), new THREE.MeshStandardMaterial({ color: c, roughness: 0.45 }));
          m.position.copy(v3(p)); world.add(m);
          const lb = label(N[i], { size: 0.3, color: c });
          lb.position.copy(v3(p)).add(new THREE.Vector3(0, 0.36, 0)); world.add(lb);
          const hl = label(N[i], { size: 0.42, color: "#fff", bg: c });
          hl.position.copy(lb.position); hl.visible = false; world.add(hl);
          return { m, lb, hl };
        });
        const Q = [
          { q: "할머니 돌아가시면 며칠 쉬어?", p: [-0.24, -0.08, -0.04], top: [[6, 0.47], [5, 0.35], [1, 0.32]] },
          { q: "해외 가면 밥값은 따로 줘?", p: [0.28, -0.20, 0.32], top: [[10, 0.57], [12, 0.44], [9, 0.42]] },
          { q: "노트북 잃어버렸는데 새 거 받으려면?", p: [0.21, 0.04, -0.28], top: [[16, 0.50], [14, 0.50], [17, 0.25]] },
        ];
        const qm = new THREE.Mesh(new THREE.SphereGeometry(0.24, 24, 18), new THREE.MeshStandardMaterial({ color: 0x23272f, emissive: 0x111111, roughness: 0.3 }));
        world.add(qm);
        const lines = [0, 1, 2].map(() => {
          const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
          const ln = new THREE.Line(geo, new THREE.LineDashedMaterial({ color: 0x23272f, dashSize: 0.18, gapSize: 0.12 }));
          world.add(ln); return { geo, ln };
        });
        // 위쪽 자막 (DOM)
        const cap = document.createElement("div");
        cap.style.cssText = "position:absolute;left:10px;right:10px;top:10px;z-index:2;background:rgba(31,36,48,.92);color:#fff;border-radius:12px;padding:9px 12px;font-size:12.5px;line-height:1.5;pointer-events:none;transition:opacity .3s";
        api.el.appendChild(cap);
        const D = 6.5;
        let cur = -1, last = performance.now();
        api.loop(t => {
          const now = performance.now(), dt = (now - last) / 1000; last = now;
          const qi = Math.floor(t / D) % Q.length, u = t % D, q = Q[qi];
          const fly = seg(u, 0.4, 1.8);
          const start = new THREE.Vector3(0, 4.2, 3.5), end = v3(q.p);
          qm.position.lerpVectors(start, end, fly);
          qm.visible = u < D - 0.2;
          const on = u > 2.0 && u < D - 0.2;
          lines.forEach(({ geo, ln }, j) => {
            geo.setFromPoints([qm.position, nodes[q.top[j][0]].m.position]);
            ln.computeLineDistances();
            ln.visible = on && u > 2.0 + j * 0.35;
          });
          nodes.forEach((n, i) => {
            const j = q.top.findIndex(([x]) => x === i);
            const hit = on && j >= 0 && u > 2.0 + j * 0.35;
            n.hl.visible = hit; n.lb.visible = !hit;
            n.lb.material.opacity = on ? 0.3 : 1;
            n.m.scale.setScalar(hit ? 1.5 : 1);
          });
          if (cur !== qi * 10 + (u > 2.0 ? 1 : 0)) {
            cur = qi * 10 + (u > 2.0 ? 1 : 0);
            cap.innerHTML = `<b>질문</b> ${q.q}` + (u > 2.0 ? `<br><span style="opacity:.85">가까운 조각: ${q.top.map(([i, sc]) => `${N[i]} ${sc.toFixed(2)}`).join(" · ")}</span>` : "");
          }
          cap.style.opacity = u < D - 0.3 ? 1 : 0;
          k.draw(dt);
        }, 3);
      },
    }
