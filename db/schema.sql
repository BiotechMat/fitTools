-- FitTools account schema (ACCOUNTS.md §5.2) — run once at A0 provisioning
-- against the Neon database (UK/EU region — record the region in the §7.4
-- posture). Two parts:
--
-- 1. AUTH TABLES (user/session/account/verification/rateLimit) are generated
--    by Better Auth's own CLI so they always match the installed version and
--    the config in src/lib/auth/server.ts (incl. the ageBand column and
--    database-backed rate limiting):
--
--      DATABASE_URL=... npx @better-auth/cli@latest generate
--      DATABASE_URL=... npx @better-auth/cli@latest migrate
--
--    The CLI output is the source of truth for those tables — do not
--    hand-maintain them here.
--
-- 2. FITTOOLS TABLES below — the per-namespace store documents and consent
--    records. Run AFTER the Better Auth migration (they reference "user").

create table if not exists store_documents (
  user_id    text        not null references "user" (id) on delete cascade,
  -- One of the namespace registry keys (src/lib/account/namespaces.ts).
  -- "bloodwork" rows only exist once A4 goes live.
  namespace  text        not null,
  version    integer     not null default 1,
  doc        jsonb       not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, namespace)
);

create table if not exists consents (
  user_id        text        not null references "user" (id) on delete cascade,
  -- "health-storage" now; "bloodwork-storage" joins at A4 go-live.
  kind           text        not null,
  granted_at     timestamptz not null default now(),
  revoked_at     timestamptz,
  policy_version text        not null,
  primary key (user_id, kind)
);

-- Erasure note (ACCOUNTS §7.3): DELETE /api/account removes rows from every
-- table explicitly (documents, consents, sessions, accounts, user); the FK
-- cascades above are defence in depth, not the mechanism.
