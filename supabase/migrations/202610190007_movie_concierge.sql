begin;
create table cinemax_private.assistant_usage (
  user_id uuid primary key references auth.users(id) on delete cascade,
  usage_date date not null, requests integer not null, last_request timestamptz not null
);
alter table cinemax_private.assistant_usage enable row level security;
revoke all on cinemax_private.assistant_usage from public,anon,authenticated;
create function public.reserve_movie_concierge() returns boolean
language plpgsql security definer set search_path='' as $$
declare uid uuid=auth.uid(); n integer;
begin
 if uid is null then raise exception 'Sign in required'; end if;
 insert into cinemax_private.assistant_usage values(uid,current_date,1,now())
 on conflict(user_id) do update set usage_date=current_date,
 requests=case when assistant_usage.usage_date=current_date then assistant_usage.requests+1 else 1 end,
 last_request=now()
 where assistant_usage.last_request<now()-interval '15 seconds'
 and (assistant_usage.usage_date<>current_date or assistant_usage.requests<20)
 returning requests into n;
 return n is not null;
end; $$;
revoke all on function public.reserve_movie_concierge() from public,anon;
grant execute on function public.reserve_movie_concierge() to authenticated;
commit;
