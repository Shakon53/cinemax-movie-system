-- Retain original .NET tables and copy their catalog into the Supabase frontend schema.
begin;
alter table public.reviews alter column "userID" drop not null;
alter table public.reviews add column "legacyReviewID" integer unique;
alter table public.reviews add column "legacyUsername" text;
drop policy reviews_insert on public.reviews;
create policy reviews_insert on public.reviews for insert to authenticated
with check ("userID" = (select auth.uid()) and "legacyReviewID" is null and "legacyUsername" is null);

do $$
declare source_name text; target_name text; columns_sql text; values_sql text;
begin
  for source_name, target_name in select * from (values
    ('Countries','countries'),('Genres','genres'),('Directors','directors'),('Actors','actors'),
    ('Movies','movies'),('MovieActors','movieactors'),('Ratings','ratings'),
    ('Discounts','discounts'),('BoxOfficeRecords','boxoffice')) as names(old_name,new_name)
  loop
    select string_agg(format('%I', mapped), ',' order by ordinal_position),
      string_agg(case when mapped in ('posterUrl','photoUrl')
        then format('case when %I ~ ''^https://'' then %I else '''' end',column_name,column_name)
        else format('%I',column_name) end, ',' order by ordinal_position)
    into columns_sql, values_sql
    from (select column_name, ordinal_position,
      case when column_name='IMDbRating' then 'imDbRating'
      else lower(left(column_name,1)) || substring(column_name from 2) end as mapped
      from information_schema.columns where table_schema='public' and table_name=source_name) fields;
    execute format('insert into public.%I (%s) select %s from public.%I',target_name,columns_sql,values_sql,source_name);
  end loop;
end; $$;

insert into public.reviews ("reviewID","movieID","commentText","userRating","reviewDate","legacyReviewID","legacyUsername")
select r."ReviewID",r."MovieID",r."CommentText",r."UserRating",r."ReviewDate",r."ReviewID",u."Username"
from public."Reviews" r join public."Users" u on u."UserID"=r."UserID";

-- Advance every copied identity; additional films receive new database-generated IDs.
do $$ declare table_name text; id_column text; highest bigint; sequence_name text; begin
  for table_name,id_column in select * from (values
    ('countries','countryID'),('genres','genreID'),('directors','directorID'),('actors','actorID'),
    ('movies','movieID'),('movieactors','movieActorID'),('ratings','ratingID'),('discounts','discountID'),
    ('boxoffice','boxOfficeID'),('reviews','reviewID')) as ids(t,c)
  loop
    execute format('select max(%I) from public.%I',id_column,table_name) into highest;
    sequence_name := pg_get_serial_sequence('public.'||table_name,id_column);
    perform setval(sequence_name,coalesce(highest,1),highest is not null);
  end loop;
end; $$;

-- The .NET API connects using its database role. Browser roles must not access
-- legacy email/password records or bypass the new policies through old tables.
do $$ declare name text; begin
  foreach name in array array['Countries','Genres','Directors','Actors','Movies','MovieActors','Ratings','Discounts','BoxOfficeRecords','Users','Reviews','__EFMigrationsHistory'] loop
    execute format('alter table public.%I enable row level security',name);
    execute format('revoke all on public.%I from anon, authenticated',name);
  end loop;
end; $$;

do $$ declare country_id bigint; genre_id bigint; director_id bigint; begin
  select "countryID" into country_id from public.countries where "countryName"='Netherlands' limit 1;
  if country_id is null then insert into public.countries("countryName",capital,"languageName") values ('Netherlands','Amsterdam','Dutch') returning "countryID" into country_id; end if;
  select "genreID" into genre_id from public.genres where "genreName"='Animation' limit 1;
  if genre_id is null then insert into public.genres("genreName",description) values ('Animation','Open animated films') returning "genreID" into genre_id; end if;
  if not exists (select 1 from public.movies where title='Big Buck Bunny') then
    insert into public.directors("fullName","countryID") values ('Sacha Goedegebure',country_id) returning "directorID" into director_id;
    insert into public.movies(title,description,"releaseYear","durationMinutes","countryID","directorID","genreID","productionCompany","watchUrl","licenseUrl",attribution,"isFree")
    values ('Big Buck Bunny','Большой добрый кролик против трёх лесных хулиганов.',2008,10,country_id,director_id,genre_id,'Blender Foundation','https://peach.blender.org/','https://peach.blender.org/about/','© 2008 Blender Foundation / www.bigbuckbunny.org — CC BY 3.0',true);
  end if;
  if not exists (select 1 from public.movies where title='Sintel') then
    insert into public.directors("fullName","countryID") values ('Colin Levy',country_id) returning "directorID" into director_id;
    insert into public.movies(title,description,"releaseYear","durationMinutes","countryID","directorID","genreID","productionCompany","watchUrl","licenseUrl",attribution,"isFree")
    values ('Sintel','Девушка отправляется на поиски маленького дракона.',2010,15,country_id,director_id,genre_id,'Blender Foundation','https://durian.blender.org/','https://durian.blender.org/about/','© Blender Foundation | durian.blender.org — CC BY 3.0',true);
  end if;
end; $$;
commit;
