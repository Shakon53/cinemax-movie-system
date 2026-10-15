begin;
revoke all on function public.is_admin() from anon;
alter table public.movies add column moods text[] not null default '{}';
alter table public.movies add column "vibeTags" text[] not null default '{}';
alter table public.movies add column intensity smallint not null default 3 check (intensity between 1 and 5);
alter table public.movies add column published boolean not null default true;
alter table public.reviews add column "containsSpoilers" boolean not null default false;
update public.movies set published=false where title in ('Test','Test Movie');
update public.movies set moods=array['thoughtful','epic'],"vibeTags"=array['Сложный сюжет','Другие миры'],intensity=4 where title in ('Inception','Interstellar','Dune');
update public.movies set moods=array['emotional'],"vibeTags"=array['Сильные эмоции','История о людях'],intensity=4 where title in ('Titanic','The Shawshank Redemption');
update public.movies set moods=array['thoughtful'],"vibeTags"=array['Историческая драма','На подумать'],intensity=5 where title='Oppenheimer';
update public.movies set moods=array['adrenaline','epic'],"vibeTags"=array['Большой экран','Динамичное кино'],intensity=4 where title in ('Avatar','The Dark Knight','Mad Max: Fury Road');
update public.movies set moods=array['adrenaline'],"vibeTags"=array['Сатира','Взрослая история'],intensity=4 where title='The Wolf of Wall Street';
update public.movies set moods=array['cozy'],"vibeTags"=array['Короткий метр','Открытая лицензия'],intensity=1 where title='Big Buck Bunny';
update public.movies set moods=array['emotional','epic'],"vibeTags"=array['Короткий метр','Открытая лицензия'],intensity=3 where title='Sintel';
drop policy catalog_read on public.movies;
create policy movies_public_read on public.movies for select to anon,authenticated using(published);
create policy movies_admin_read on public.movies for select to authenticated using((select public.is_admin()));

create schema cinemax_private;
revoke all on schema cinemax_private from public,anon,authenticated;
create table cinemax_private.rooms (
  id uuid primary key default gen_random_uuid(), code text not null unique,
  created_at timestamptz not null default now(), expires_at timestamptz not null default now()+interval '2 hours',
  started boolean not null default false, candidates bigint[] not null default '{}'
);
create table cinemax_private.members (
  token uuid primary key default gen_random_uuid(), room_id uuid not null references cinemax_private.rooms on delete cascade,
  name text not null check(length(trim(name)) between 1 and 30), host boolean not null default false
);
create table cinemax_private.votes (
  member_token uuid not null references cinemax_private.members on delete cascade,
  movie_id bigint not null references public.movies on delete cascade, liked boolean not null,
  primary key(member_token,movie_id)
);
create index match_members_room on cinemax_private.members(room_id);
alter table cinemax_private.rooms enable row level security;
alter table cinemax_private.members enable row level security;
alter table cinemax_private.votes enable row level security;

create function public.movie_match_state(member_token uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare r cinemax_private.rooms; member cinemax_private.members; matches jsonb; members jsonb; seen jsonb;
begin
  select * into member from cinemax_private.members where token=member_token;
  if not found then raise exception 'Комната не найдена. Создайте или откройте комнату заново.'; end if;
  select * into r from cinemax_private.rooms where id=member.room_id and expires_at>now();
  if not found then raise exception 'Срок комнаты истёк. Создайте новую.'; end if;
  select coalesce(jsonb_agg(jsonb_build_object('name',m.name,'host',m.host,'votes',(select count(*) from cinemax_private.votes v where v.member_token=m.token)) order by m.host desc,m.name),'[]') into members from cinemax_private.members m where m.room_id=r.id;
  select coalesce(jsonb_agg(v.movie_id),'[]') into seen from cinemax_private.votes v where v.member_token=member.token;
  select coalesce(jsonb_agg(m."movieID"),'[]') into matches from public.movies m where m."movieID" in (
    select v.movie_id from cinemax_private.votes v join cinemax_private.members p on p.token=v.member_token
    where p.room_id=r.id group by v.movie_id having bool_and(v.liked) and count(*)=(select count(*) from cinemax_private.members where room_id=r.id)
  );
  return jsonb_build_object('code',r.code,'started',r.started,'expiresAt',r.expires_at,'host',member.host,'members',members,'candidates',r.candidates,'seen',seen,'matches',matches);
end; $$;

create function public.create_movie_match(display_name text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare r cinemax_private.rooms; token uuid;
begin
  if length(trim(display_name)) not between 1 and 30 then raise exception 'Введите имя до 30 символов.'; end if;
  perform pg_advisory_xact_lock(24791301);
  delete from cinemax_private.rooms where expires_at<now()-interval '1 day';
  if (select count(*) from cinemax_private.rooms where expires_at>now())>=1000 then raise exception 'Сейчас слишком много комнат. Попробуйте позже.'; end if;
  insert into cinemax_private.rooms(code) values(upper(substr(replace(gen_random_uuid()::text,'-',''),1,8))) returning * into r;
  insert into cinemax_private.members(room_id,name,host) values(r.id,trim(display_name),true) returning members.token into token;
  return jsonb_build_object('token',token,'state',public.movie_match_state(token));
end; $$;
create function public.join_movie_match(room_code text,display_name text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare r cinemax_private.rooms; token uuid;
begin
  if length(trim(display_name)) not between 1 and 30 then raise exception 'Введите имя до 30 символов.'; end if;
  select * into r from cinemax_private.rooms where code=upper(trim(room_code)) and expires_at>now() for update;
  if not found then raise exception 'Комната не найдена или срок её действия истёк.'; end if;
  if r.started then raise exception 'Выбор уже начался. Попросите друга создать новую комнату.'; end if;
  if (select count(*) from cinemax_private.members where room_id=r.id)>=8 then raise exception 'В комнате уже 8 участников.'; end if;
  insert into cinemax_private.members(room_id,name) values(r.id,trim(display_name)) returning members.token into token;
  return jsonb_build_object('token',token,'state',public.movie_match_state(token));
end; $$;
create function public.start_movie_match(member_token uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare member cinemax_private.members; r cinemax_private.rooms; ids bigint[];
begin
  select * into member from cinemax_private.members where token=member_token and host;
  if not found then raise exception 'Начать выбор может создатель комнаты.'; end if;
  select * into r from cinemax_private.rooms where id=member.room_id and expires_at>now() for update;
  if not found then raise exception 'Срок комнаты истёк.'; end if;
  if r.started then return public.movie_match_state(member_token); end if;
  if (select count(*) from cinemax_private.members where room_id=r.id)<2 then raise exception 'Дождитесь хотя бы одного друга.'; end if;
  select array_agg(m."movieID") into ids from (select "movieID" from public.movies where published order by rating desc,"movieID" limit 40) m;
  if coalesce(cardinality(ids),0)=0 then raise exception 'В каталоге пока нет фильмов.'; end if;
  update cinemax_private.rooms set started=true,candidates=ids where id=r.id;
  return public.movie_match_state(member_token);
end; $$;
create function public.vote_movie_match(member_token uuid, movie_id bigint, liked boolean) returns jsonb
language plpgsql security definer set search_path='' as $$
declare r cinemax_private.rooms;
begin
  select rooms.* into r from cinemax_private.rooms rooms join cinemax_private.members m on rooms.id=m.room_id where m.token=member_token and rooms.expires_at>now();
  if not found or not r.started then raise exception 'Комната не готова к голосованию.'; end if;
  if not movie_id=any(r.candidates) or liked is null then raise exception 'Некорректный голос.'; end if;
  insert into cinemax_private.votes values(member_token,movie_id,liked)
  on conflict on constraint votes_pkey do update set liked=excluded.liked;
  return public.movie_match_state(member_token);
end; $$;
revoke all on function public.movie_match_state(uuid),public.create_movie_match(text),public.join_movie_match(text,text),public.start_movie_match(uuid),public.vote_movie_match(uuid,bigint,boolean) from public,anon,authenticated;
grant execute on function public.movie_match_state(uuid),public.create_movie_match(text),public.join_movie_match(text,text),public.start_movie_match(uuid),public.vote_movie_match(uuid,bigint,boolean) to anon,authenticated;
commit;
