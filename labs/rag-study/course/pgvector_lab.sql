-- 중급 4권 4장: 로컬 실습 DB 전용 예제예요.
-- 실행 예: psql -X -v ON_ERROR_STOP=1 -d ax_course -f course/pgvector_lab.sql
-- PostgreSQL 서버와 pgvector 확장이 미리 설치돼 있어야 해요.
-- 작은 데이터의 정확 검색과 SQL 형태 확인용이며 성능 벤치마크가 아니에요.
-- 모든 데이터·색인 변경은 마지막 ROLLBACK으로 되돌려요.
BEGIN;
CREATE EXTENSION IF NOT EXISTS vector;
CREATE TEMP TABLE ax_course_chunks (
    id text PRIMARY KEY,
    tenant text NOT NULL,
    version integer NOT NULL,
    body text NOT NULL,
    embedding vector(3) NOT NULL
);
INSERT INTO ax_course_chunks VALUES
    ('leave-v2', 'alpha', 2, '가짜 연차 규정', '[1,0,0]'),
    ('travel-v2', 'alpha', 2, '가짜 출장 규정', '[0,1,0]'),
    ('leave-v1', 'alpha', 1, '가짜 이전 연차 규정', '[0.99,0.01,0]'),
    ('beta-leave', 'beta', 2, '가짜 다른 테넌트 규정', '[1,0,0]');

-- 정확 검색 기준선. 아래 alpha는 데모 상수예요.
-- 앱에서는 인증된 서버 주체에서 얻은 값으로 바인딩해야 해요.
SELECT id, embedding <=> '[1,0,0]'::vector AS distance
FROM ax_course_chunks
WHERE tenant = 'alpha' AND version = 2
ORDER BY embedding <=> '[1,0,0]'::vector
LIMIT 2;

CREATE INDEX ax_course_hnsw ON ax_course_chunks USING hnsw (embedding vector_cosine_ops);
ANALYZE ax_course_chunks;
-- 이 작은 테이블에서는 플래너가 순차 스캔을 선택할 수 있어요.
-- HNSW가 사용됐다고 가정하지 말고 실제 계획을 읽어요.
EXPLAIN (ANALYZE, BUFFERS)
SELECT id FROM ax_course_chunks
WHERE tenant = 'alpha' AND version = 2
ORDER BY embedding <=> '[1,0,0]'::vector
LIMIT 2;
ROLLBACK;
