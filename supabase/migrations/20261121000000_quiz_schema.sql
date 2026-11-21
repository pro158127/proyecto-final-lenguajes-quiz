create table if not exists public.game_sessions (
  id uuid primary key,
  alias text not null check (char_length(alias) between 2 and 20),
  current_position integer not null default 0 check (current_position between 0 and 10),
  answers jsonb not null default '[]'::jsonb check (jsonb_typeof(answers) = 'array'),
  status text not null default 'IN_PROGRESS' check (status in ('IN_PROGRESS', 'COMPLETED')),
  last_question_id text,
  last_option_id text,
  last_response jsonb,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create table if not exists public.game_results (
  id uuid primary key default gen_random_uuid(),
  sequence bigint generated always as identity unique,
  game_id uuid not null unique references public.game_sessions(id),
  alias text not null check (char_length(alias) between 2 and 20),
  correct_count integer not null check (correct_count between 0 and 10),
  score integer not null check (score between 0 and 100 and score = correct_count * 10),
  created_at timestamptz not null default now()
);

create index if not exists game_results_leaderboard_idx
  on public.game_results (score desc, sequence asc);

alter table public.game_sessions enable row level security;
alter table public.game_results enable row level security;

create or replace function public.apply_game_answer(
  p_game_id uuid,
  p_expected_position integer,
  p_question_id text,
  p_option_id text,
  p_current_position integer,
  p_answers jsonb,
  p_status text,
  p_last_response jsonb,
  p_result jsonb
) returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_game public.game_sessions%rowtype;
begin
  select * into current_game
  from public.game_sessions
  where id = p_game_id
  for update;

  if not found then
    raise exception using errcode = 'P0002', message = 'GAME_NOT_FOUND';
  end if;
  if current_game.status = 'IN_PROGRESS' and current_game.expires_at <= now() then
    raise exception using errcode = 'P0001', message = 'GAME_EXPIRED';
  end if;
  if current_game.last_question_id = p_question_id then
    if current_game.last_option_id = p_option_id then
      return current_game.last_response;
    end if;
    raise exception using errcode = 'P0001', message = 'QUESTION_ALREADY_ANSWERED';
  end if;
  if current_game.status <> 'IN_PROGRESS' then
    raise exception using errcode = 'P0001', message = 'GAME_ALREADY_COMPLETED';
  end if;
  if current_game.current_position <> p_expected_position then
    raise exception using errcode = 'P0001', message = 'QUESTION_OUT_OF_ORDER';
  end if;
  if p_current_position <> p_expected_position + 1
     or p_status not in ('IN_PROGRESS', 'COMPLETED')
     or (p_current_position = 10) <> (p_status = 'COMPLETED') then
    raise exception using errcode = '22023', message = 'INVALID_GAME_TRANSITION';
  end if;

  update public.game_sessions
  set current_position = p_current_position,
      answers = p_answers,
      status = p_status,
      last_question_id = p_question_id,
      last_option_id = p_option_id,
      last_response = p_last_response
  where id = p_game_id;

  if p_result is not null then
    insert into public.game_results (id, game_id, alias, correct_count, score, created_at)
    values (
      (p_result->>'id')::uuid,
      p_game_id,
      p_result->>'alias',
      (p_result->>'correctCount')::integer,
      (p_result->>'score')::integer,
      (p_result->>'finishedAt')::timestamptz
    )
    on conflict (game_id) do nothing;
  end if;

  return p_last_response;
end;
$$;

revoke all on function public.apply_game_answer(uuid, integer, text, text, integer, jsonb, text, jsonb, jsonb)
  from public, anon, authenticated;
grant execute on function public.apply_game_answer(uuid, integer, text, text, integer, jsonb, text, jsonb, jsonb)
  to service_role;
