create extension if not exists pgcrypto;

create table if not exists public.user_preferences (
  user_id uuid primary key,
  notification_slots jsonb not null default '{"08:30": true, "10:30": true, "13:00": true, "15:30": true, "19:00": true, "22:00": true}',
  theme text not null default 'system' check (theme in ('system', 'light', 'dark')),
  onboarding_completed boolean not null default false,
  timezone text not null default 'Asia/Seoul',
  updated_at timestamptz not null default now()
);

create table if not exists public.rest_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  slot text not null check (slot in ('08:30', '10:30', '13:00', '15:30', '19:00', '22:00', 'adhoc')),
  duration_preset integer not null default 5 check (duration_preset in (3, 5, 10)),
  duration_actual_sec integer,
  started_at timestamptz not null,
  ended_at timestamptz,
  completed boolean not null default false,
  clarity integer check (clarity between 1 and 5),
  note text check (char_length(note) <= 280),
  created_at timestamptz not null default now()
);

create index if not exists idx_rest_sessions_user_started
  on public.rest_sessions(user_id, started_at desc);

create index if not exists idx_rest_sessions_started
  on public.rest_sessions(started_at desc);

create table if not exists public.notification_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  endpoint text not null,
  keys jsonb not null,
  platform text not null check (platform in ('android_chrome', 'ios_safari', 'desktop')),
  created_at timestamptz not null default now(),
  snooze_log jsonb not null default '{}'::jsonb,
  unique (user_id, endpoint)
);

create table if not exists public.weekly_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  week_start date not null,
  completed_days integer not null default 0,
  day_dots jsonb not null default '{}'::jsonb,
  avg_clarity double precision,
  best_session_id uuid,
  ai_comment text not null default '',
  generated_at timestamptz not null default now()
);

create table if not exists public.monthly_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  month date not null,
  daily_clarity jsonb not null default '[]'::jsonb,
  total_sessions integer not null default 0,
  max_clarity_session_id uuid,
  min_clarity_session_id uuid,
  generated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  tier text not null default 'free' check (tier in ('free', 'premium')),
  status text not null default 'trial' check (status in ('trial', 'active', 'cancelled', 'expired')),
  plan text check (plan in ('monthly', 'annual')),
  trial_ends_at timestamptz,
  current_period_end timestamptz,
  provider text check (provider in ('stripe', 'iap')),
  updated_at timestamptz not null default now()
);

create or replace view public.today_progress as
with user_scope as (
  select distinct rs.user_id
  from public.rest_sessions rs
  where rs.user_id is not null

  union

  select up.user_id
  from public.user_preferences up
),
context as (
  select
    us.user_id,
    coalesce(up.timezone, 'Asia/Seoul') as timezone,
    coalesce(up.notification_slots, '{"08:30": true, "10:30": true, "13:00": true, "15:30": true, "19:00": true, "22:00": true}'::jsonb) as notification_slots,
    now() as current_ts
  from user_scope us
  left join public.user_preferences up on up.user_id = us.user_id
),
today_context as (
  select
    c.user_id,
    c.timezone,
    c.notification_slots,
    c.current_ts,
    (c.current_ts at time zone c.timezone)::date as today_date,
    extract(hour from (c.current_ts at time zone c.timezone))::integer * 60
      + extract(minute from (c.current_ts at time zone c.timezone))::integer as now_minutes
  from context c
),
completed_by_day as (
  select
    tc.user_id,
    (rs.started_at at time zone tc.timezone)::date as session_date,
    count(*)::integer as completed_count
  from today_context tc
  join public.rest_sessions rs
    on rs.user_id = tc.user_id
   and rs.completed = true
  group by tc.user_id, tc.timezone, (rs.started_at at time zone tc.timezone)::date
),
last_completed as (
  select distinct on (tc.user_id)
    tc.user_id,
    jsonb_build_object(
      'id', rs.id,
      'slot', rs.slot,
      'started_at', rs.started_at,
      'completed', rs.completed
    ) as last_session
  from today_context tc
  join public.rest_sessions rs
    on rs.user_id = tc.user_id
   and rs.completed = true
  order by tc.user_id, rs.started_at desc
),
next_slots as (
  select distinct on (tc.user_id)
    tc.user_id,
    slot.slot_time as next_slot_time,
    slot.slot_minutes - tc.now_minutes as next_slot_in_minutes
  from today_context tc
  join lateral (
    values
      ('08:30'::text, 510),
      ('10:30'::text, 630),
      ('13:00'::text, 780),
      ('15:30'::text, 930),
      ('19:00'::text, 1140),
      ('22:00'::text, 1320)
  ) as slot(slot_time, slot_minutes)
    on coalesce((tc.notification_slots ->> slot.slot_time)::boolean, false) = true
   and slot.slot_minutes >= tc.now_minutes
  order by tc.user_id, slot.slot_minutes asc
),
soft_streak as (
  select
    tc.user_id,
    count(*)::integer as soft_streak_days
  from today_context tc
  join lateral generate_series(0, 365) as gs(day_offset) on true
  left join completed_by_day cbd
    on cbd.user_id = tc.user_id
   and cbd.session_date = (tc.today_date - gs.day_offset)
  where not exists (
    select 1
    from lateral generate_series(0, gs.day_offset - 1) as prev(day_offset)
    left join completed_by_day prev_cbd
      on prev_cbd.user_id = tc.user_id
     and prev_cbd.session_date = (tc.today_date - prev.day_offset)
    where coalesce(prev_cbd.completed_count, 0) < 3
  )
    and coalesce(cbd.completed_count, 0) >= 3
  group by tc.user_id
)
select
  tc.user_id,
  tc.today_date as date,
  coalesce(today_counts.completed_count, 0)::integer as completed_count,
  6::integer as target_count,
  ns.next_slot_time,
  ns.next_slot_in_minutes,
  lc.last_session,
  coalesce(ss.soft_streak_days, 0)::integer as soft_streak_days
from today_context tc
left join completed_by_day today_counts
  on today_counts.user_id = tc.user_id
 and today_counts.session_date = tc.today_date
left join next_slots ns on ns.user_id = tc.user_id
left join last_completed lc on lc.user_id = tc.user_id
left join soft_streak ss on ss.user_id = tc.user_id;
