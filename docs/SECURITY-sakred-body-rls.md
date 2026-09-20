# SECURITY TICKET — RLS disabled on four Sakred Body tables

**Severity: high. Owner: Sakred Body app team. Not actionable from this repo.**

Filed here because it was discovered during the Sakred Health website rebuild
and needs to survive that work rather than disappear into a report.

## Finding

Supabase project `zcvanbozvtojmnyuzsjh` (the **Sakred Body** app database)
reports four tables with Row Level Security **disabled**:

```
public.health_connections
public.health_days
public.health_workouts
public.coach_relationships
```

Discovered 2026-08-13 via the Supabase advisor (`rls_disabled`, priority 1,
level: critical) while auditing which database held the Health Network tables.

## Why it matters

With RLS off, those tables are reachable by the `anon` and `authenticated`
roles that Supabase client libraries use. The anon key is, by design, shipped in
the app binary and is trivially extractable. So in the worst case anyone with
the key can read or modify **every row** in those tables.

The contents make this worse than a generic RLS finding:

- `health_days` (359 rows) and `health_workouts` (70 rows) are per-member
  health and activity records
- `health_connections` is wearable/health-integration linkage
- `coach_relationships` maps members to coaches

This is personal health data with no row-level authorisation in front of it.

## What NOT to do

**Do not simply run `ALTER TABLE … ENABLE ROW LEVEL SECURITY`.** Enabling RLS
without policies denies all access, which would break whatever in the Body app
currently reads and writes these tables — and, given they're currently open,
those reads may well be happening from the client with the anon key.

The remediation SQL the advisor emits is:

```sql
ALTER TABLE public.health_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_relationships ENABLE ROW LEVEL SECURITY;
```

That is the last step, not the first.

## Suggested sequence

1. **Establish access paths.** For each table, find every reader and writer in
   the Body app. Note which run client-side with the anon key and which run
   server-side with the service role.
2. **Move client-side writes server-side** where a policy can't express the rule.
3. **Write policies first**, on a branch or a copy — typically
   `user_id = auth.uid()` for the three member-data tables, and a two-sided
   check for `coach_relationships` (the coach *and* the member should see it).
4. **Enable RLS** and verify the app still works against the branch.
5. **Rotate the anon key** afterwards if there is any reason to think it leaked,
   and check logs for anomalous reads in the meantime.

## Relationship to the Sakred Health website

None, and that is deliberate. This website repo:

- does not read or write any of these tables
- does not hold credentials for this project beyond the public anon key, which
  was used read-only to verify the website's own degrade path
- points at the Health Network via `HEALTH_NETWORK_SUPABASE_URL` / `_KEY`, which
  should be the **app's** project, not Body's

No change to this repo can fix or worsen the finding. It needs its own ticket
against the Body backend.
