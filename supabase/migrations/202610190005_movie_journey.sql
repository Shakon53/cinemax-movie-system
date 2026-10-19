-- Private viewing diary. Public reviews and favorites keep their own semantics.
begin;
create table public.movie_journey (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  movie_id bigint not null references public.movies("movieID") on delete cascade,
  status text not null check (status in ('want','watched')),
  rating integer check (rating between 1 and 10),
  note text not null default '' check (char_length(note) <= 2000),
  watched_on date,
  updated_at timestamptz not null default now(),
  primary key(user_id,movie_id),
  check ((status='want' and watched_on is null and rating is null and note='') or
         (status='watched' and watched_on is not null))
);
alter table public.movie_journey enable row level security;
revoke all on public.movie_journey from public,anon,authenticated;
grant select,insert,update,delete on public.movie_journey to authenticated;
create policy journey_read on public.movie_journey for select to authenticated using(user_id=(select auth.uid()));
create policy journey_insert on public.movie_journey for insert to authenticated with check(user_id=(select auth.uid()));
create policy journey_update on public.movie_journey for update to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create policy journey_delete on public.movie_journey for delete to authenticated using(user_id=(select auth.uid()));
create index journey_watched on public.movie_journey(user_id,watched_on) where status='watched';
comment on table public.movie_journey is 'Private diary: want/watch status, personal score and note; not a public review.';
alter table public.movies add column "watchSourceUrl" text not null default '' check("watchSourceUrl"='' or "watchSourceUrl" ~ '^https://');
-- Curated catalog covers are repository assets, not invented third-party posters.
alter table public.movies drop constraint "movies_posterUrl_check";
alter table public.movies add constraint "movies_posterUrl_check" check("posterUrl"='' or "posterUrl" ~ '^https://' or "posterUrl" ~ '^/assets/posters/[a-z0-9-]+\.svg$');
commit;
