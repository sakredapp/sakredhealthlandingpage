-- Rate-limit counters for the public Health Network submission endpoints.
--
-- Previously created at runtime by api/_lib/abuse.ts on first use. That is no
-- longer done: production schema must not change as a side effect of an
-- anonymous HTTP request, and a public endpoint's connection should not need
-- DDL rights. Apply this once, per environment.
--
-- Contains no personal data. key_hash is an HMAC-SHA256 of a normalised
-- identifier (IP, email, submission id) keyed with SUBMISSION_TOKEN_SECRET.
-- Rows carry an expiry and are swept opportunistically.

-- ---------------------------------------------------------------------------
-- 1 · Retire the runtime-created table, if this environment ever ran the old
--     code. Its shape was (bucket text primary key, hits int, window_start).
--     Counters are ephemeral by definition, so the rows are dropped rather
--     than translated: the worst case is one unthrottled window.
--     This runs BEFORE the CREATE so the new shape actually gets created.
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'submission_throttle'
      AND column_name = 'bucket'
  ) THEN
    DROP TABLE public.submission_throttle;
    RAISE NOTICE 'dropped legacy submission_throttle (bucket-keyed)';
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 2 · The table.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS submission_throttle (
  key_hash     text PRIMARY KEY,
  kind         text        NOT NULL,
  hits         integer     NOT NULL DEFAULT 0,
  window_start timestamptz NOT NULL DEFAULT now(),
  expires_at   timestamptz NOT NULL
);

-- Supports the opportunistic sweep in checkRateLimits().
CREATE INDEX IF NOT EXISTS submission_throttle_expires_at_idx
  ON submission_throttle (expires_at);
