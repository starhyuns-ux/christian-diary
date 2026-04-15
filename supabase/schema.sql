-- ============================================================
-- 크리스천다이어리 — DB 스키마
-- Supabase SQL Editor에서 이 파일을 실행하세요
-- ============================================================

-- Extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- ENUM 타입 정의
-- ============================================================
do $$ begin
  create type event_category as enum (
    'lecture', 'small_group', 'prayer', 'worship', 'volunteer', 'other'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type event_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type location_type as enum ('online', 'offline', 'hybrid');
exception when duplicate_object then null; end $$;

do $$ begin
  create type participant_status as enum ('pending', 'confirmed', 'cancelled');
exception when duplicate_object then null; end $$;

-- ============================================================
-- users 테이블 (Supabase Auth와 연동)
-- ============================================================
create table if not exists public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null,
  avatar_url  text,
  church_name text,
  region      text,
  is_admin    boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table public.users enable row level security;

-- 누구나 프로필 조회 가능
create policy "Anyone can view profiles"
  on public.users for select using (true);

-- 본인만 수정 가능
create policy "Users can update own profile"
  on public.users for update using (auth.uid() = id);

-- 회원가입 시 자동 삽입 트리거
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', '익명'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- events 테이블
-- ============================================================
create table if not exists public.events (
  id                 uuid primary key default uuid_generate_v4(),
  host_id            uuid not null references public.users(id) on delete cascade,
  title              text not null,
  description        text not null default '',
  category           event_category not null default 'other',
  -- 관리자 승인 상태: 승인된 이벤트만 공개 노출
  status             event_status not null default 'pending',
  start_at           timestamptz not null,
  end_at             timestamptz not null,
  location_type      location_type not null default 'offline',
  location_name      text,
  location_address   text,
  location_url       text,
  max_participants   integer check (max_participants > 0),
  -- 모임비 (원, 0 = 무료)
  fee                integer not null default 0 check (fee >= 0),
  fee_description    text,
  -- 플랫폼 수수료율 (강의=0.10, 나머지=0)
  platform_fee_rate  numeric(4,2) not null default 0 check (platform_fee_rate >= 0 and platform_fee_rate <= 1),
  is_recurring       boolean not null default false,
  recurrence_rule    text,
  region             text not null default '전국',
  -- 교단명 (이단 제외 모든 교단 허용, 관리자가 검토)
  denomination       text,
  church_name        text,
  image_url          text,
  -- 관리자 검토 메모 및 타임스탬프
  admin_note         text,
  reviewed_at        timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

alter table public.events enable row level security;

-- 승인된 이벤트만 공개 조회
create policy "Anyone can view approved events"
  on public.events for select
  using (status = 'approved');

-- 관리자는 모든 이벤트 조회 가능
create policy "Admins can view all events"
  on public.events for select
  using (
    exists (select 1 from public.users where id = auth.uid() and is_admin = true)
  );

-- 로그인한 사용자는 이벤트 등록 가능 (pending으로 제출)
create policy "Authenticated users can create events"
  on public.events for insert
  with check (auth.uid() = host_id and status = 'pending');

-- 주최자는 본인 이벤트 수정 가능 (승인 전)
create policy "Host can update own pending event"
  on public.events for update
  using (auth.uid() = host_id and status = 'pending');

-- 관리자는 모든 이벤트 수정/승인 가능
create policy "Admins can update any event"
  on public.events for update
  using (
    exists (select 1 from public.users where id = auth.uid() and is_admin = true)
  );

-- updated_at 자동 갱신 트리거
create or replace function public.update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger events_updated_at
  before update on public.events
  for each row execute procedure public.update_updated_at();

-- 카테고리에 따라 platform_fee_rate 자동 설정
create or replace function public.set_platform_fee_rate()
returns trigger language plpgsql as $$
begin
  if new.category = 'lecture' then
    new.platform_fee_rate = 0.10;
  else
    new.platform_fee_rate = 0;
  end if;
  return new;
end;
$$;

create trigger events_set_platform_fee
  before insert or update of category on public.events
  for each row execute procedure public.set_platform_fee_rate();

-- ============================================================
-- event_participants 테이블
-- ============================================================
create table if not exists public.event_participants (
  id            uuid primary key default uuid_generate_v4(),
  event_id      uuid not null references public.events(id) on delete cascade,
  user_id       uuid not null references public.users(id) on delete cascade,
  status        participant_status not null default 'confirmed',
  registered_at timestamptz not null default now(),
  unique (event_id, user_id)
);

alter table public.event_participants enable row level security;

-- 누구나 참가자 수 조회 가능
create policy "Anyone can view participants"
  on public.event_participants for select using (true);

-- 본인만 신청/취소 가능
create policy "Users can manage own participation"
  on public.event_participants for insert
  with check (auth.uid() = user_id);

create policy "Users can cancel own participation"
  on public.event_participants for update
  using (auth.uid() = user_id);

-- ============================================================
-- 참가자 수를 이벤트에 조인하는 뷰
-- ============================================================
create or replace view public.events_with_count as
select
  e.*,
  coalesce(p.cnt, 0) as participant_count
from public.events e
left join (
  select event_id, count(*) as cnt
  from public.event_participants
  where status = 'confirmed'
  group by event_id
) p on p.event_id = e.id;

-- ============================================================
-- 샘플 데이터 (테스트용)
-- 실제 서비스에서는 삭제하거나 관리자 계정으로 등록
-- ============================================================
-- 샘플 이벤트는 관리자 계정 생성 후 등록 권장
-- ============================================================
