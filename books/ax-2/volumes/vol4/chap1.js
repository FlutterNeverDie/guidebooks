export default {
  "title": "증분 색인에는 삭제도 포함돼요",
  "tag": "버전 반영",
  "lead": "바뀐 파일만 다시 넣는다고 증분 색인이 완성되지는 않아요. 사라진 문서와 줄어든 조각도 제거해야 옛 규정이 답에 남지 않아요.",
  "body": "<h3>내용과 파이프라인 버전을 함께 비교해요</h3><p>문서 ID별 내용 해시를 저장하면 새 문서·바뀐 문서·사라진 문서를 구분할 수 있어요. 실제 manifest에는 파서·청크 규칙·임베딩 모델 버전도 넣어요. 본문이 같아도 처리 규칙이 달라졌다면 재색인이 필요해요.</p><h3>문서 교체는 조각 집합의 교체예요</h3><p>문서가 짧아져 조각 5개가 3개가 되면 남은 2개를 지워야 해요. 새 집합이 준비되기 전에 이전 집합을 지우면 일시적으로 검색이 비어요. 문서 버전 단위로 준비하고 활성 포인터를 바꾸거나 DB 트랜잭션으로 교체해요. 실패한 작업을 재실행해도 결과가 같아야 해요.</p><h3>문서가 짧아질 때 옛 조각을 지워요</h3><p>문서 leave가 세 조각에서 두 조각으로 줄었다고 해 볼게요. 새 조각 두 개만 upsert하면 leave-3의 폐지 조항이 남아요. store.replace_document는 같은 tenant·version·parent의 기존 조각을 지우고 새 조각 집합을 한 트랜잭션에서 넣어요.</p><p>이번 실행에서는 alpha v1의 leave-1·leave-2만 남았고 beta의 같은 이름과 alpha v2는 유지됐어요. 실제 임베딩 저장소에서도 삭제 표식만 만들고 검색에서 계속 읽으면 삭제가 완료된 게 아니에요. 새 색인을 만들거나 문서 단위 원자적 교체가 가능한 경계를 정해요.</p><h3>핵심 코드 · 실행 파일에서 발췌·축약</h3><pre style=\"white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.7;font-size:12px;padding:12px;border:1px solid var(--line);border-radius:8px;background:var(--soft)\"><code style=\"background:none;border:0;padding:0;white-space:inherit\">with db:\n    db.execute(&quot;DELETE FROM chunks WHERE tenant=? AND version=? AND parent=?&quot;,\n               (tenant, version, parent))\n    db.executemany(&quot;INSERT INTO chunks VALUES (?, ?, ?, ?, ?, ?)&quot;, new_rows)\n# 삭제와 삽입이 함께 commit되거나 함께 rollback돼요.</code></pre><h3>작은 입력으로 실행한 계약 결과</h3><table class=\"vs\"><tr><th>확인 항목</th><th>결과</th></tr><tr><td>upsert</td><td>[&quot;device&quot;, &quot;leave&quot;]</td></tr><tr><td>delete</td><td>[&quot;retired&quot;]</td></tr><tr><td>재실행 변경</td><td>0</td></tr></table><div class=\"try\"><span class=\"lbl\">직접 해 보기 · A</span><p><code>rag-study/course/m4_operations.py</code>에서 작은 입력의 원리를 확인해요. 실행 위치는 <code>labs/rag-study</code>예요.</p><p>store.py의 새 paragraphs를 한 개로 줄여요. 남은 ID와 다른 버전의 부모 본문을 출력해 삭제 범위를 확인해요.</p></div>",
  "lab": "ETL의 upsert만 보지 말고 tombstone과 이전 자식 레코드 정리까지 설계해요.",
  "quiz": {
    "q": "v1 문서가 세 조각에서 한 조각으로 줄었어요. 새 조각 upsert만 하면?",
    "options": [
      "같은 parent이면 자동 삭제돼요",
      "임베딩 차원이 같으면 문제없어요",
      "폐지된 나머지 조각이 검색될 수 있어요"
    ],
    "answer": 2,
    "explain": "문서 집합의 차이를 저장 계층에 반영해야 삭제가 검색 결과에도 전파돼요."
  },
  scene(api) { COURSE.scene(api, {
  "label": "4.1 · AX 중급편",
  "nodes": [
    "이전 manifest",
    "새 manifest",
    "upsert + delete",
    "버전 반영"
  ],
  "mode": "compare"
}); }
};
