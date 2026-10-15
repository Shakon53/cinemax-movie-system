import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

test('PostgreSQL schema, catalog seed and Supabase row-level permissions', async () => {
  const db = new PGlite();
  const alice = '11111111-1111-4111-8111-111111111111';
  const bob = '22222222-2222-4222-8222-222222222222';
  const admin = '33333333-3333-4333-8333-333333333333';
  try {
    // Only the Supabase-owned auth/storage surfaces are stubbed. Policies and queries
    // execute on an actual embedded PostgreSQL engine, not a mocked SQL evaluator.
    await db.exec(`
      create role anon nologin; create role authenticated nologin;
      create schema auth;
      create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb not null default '{}');
      create function auth.uid() returns uuid language sql stable as
        $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
      grant usage on schema auth to anon, authenticated;
      grant execute on function auth.uid() to anon, authenticated;
      create schema storage;
      create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
      create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text);
      alter table storage.objects enable row level security;
      grant usage on schema storage to authenticated;
      grant select,insert,update,delete on storage.objects to authenticated;
    `);
    await db.exec(await readFile(new URL('../supabase/migrations/202610150001_cinemax.sql', import.meta.url), 'utf8'));
    const seed = await readFile(new URL('../supabase/seed.sql', import.meta.url), 'utf8');
    await db.exec(seed);
    await db.exec(seed);
    assert.equal((await db.query('select count(*)::int n from public.movies')).rows[0].n, 12);
    assert.equal((await db.query('select count(*)::int n from public.movies where "isFree"')).rows[0].n, 2);
    for (const [id, username, extra] of [[alice,'alice',{}],[bob,'bob', {role:'admin'}],[admin,'site_admin',{}]]) {
      await db.query('insert into auth.users (id,email,raw_user_meta_data) values ($1,$2,$3)', [id, username + '@example.test', JSON.stringify({username, ...extra})]);
    }
    await db.query("insert into public.user_roles values ($1,'admin')", [admin]);
    async function as(role, id, sql, params = []) {
      await db.exec('set role ' + role);
      try {
        await db.query("select set_config('request.jwt.claim.sub',$1,false)", [id || '']);
        return await db.query(sql, params);
      } finally { await db.exec('reset role'); }
    }
    assert.equal((await as('anon', null, 'select count(*)::int n from movies')).rows[0].n, 12);
    await assert.rejects(as('anon', null, 'delete from movies where "movieID"=1'), /permission denied/);
    await assert.rejects(as('authenticated', alice, "insert into movies(title,\"releaseYear\") values ('Forbidden',2026)"), /row-level security/);
    assert.equal((await as('authenticated', bob, 'select public.is_admin() result')).rows[0].result, false, 'metadata cannot grant admin');
    await assert.rejects(as('authenticated', bob, "insert into user_roles values ($1,'admin')", [bob]), /permission denied/);
    await assert.rejects(as('authenticated', bob, 'update profiles set username=$1 where "userID"=$2', ['stolen',alice]), /permission denied/);
    await assert.rejects(as('authenticated', bob, 'select public.admin_users()'), /Administrator access required/);
    await assert.rejects(as('anon', null, 'select public.admin_users()'), /permission denied/);
    await as('authenticated', alice, 'insert into favorites(movie_id) values (1)');
    assert.equal((await as('authenticated', alice, 'select * from favorites')).rows.length, 1);
    assert.equal((await as('authenticated', bob, 'select * from favorites')).rows.length, 0);
    assert.equal((await as('authenticated', bob, 'delete from favorites where movie_id=1 returning *')).rows.length, 0);
    await assert.rejects(as('authenticated', bob, 'insert into favorites(user_id,movie_id) values ($1,2)', [alice]), /row-level security/);
    const review = (await as('authenticated', alice, 'insert into reviews("movieID","commentText","userRating") values (1,$1,8) returning "reviewID"', ['<script>alert(1)</script>'])).rows[0].reviewID;
    await assert.rejects(as('authenticated', bob, 'insert into reviews("userID","movieID","commentText","userRating") values ($1,1,$2,7)', [alice,'Impersonation']), /row-level security/);
    assert.equal((await as('authenticated', bob, 'delete from reviews where "reviewID"=$1 returning *', [review])).rows.length, 0);
    await assert.rejects(as('authenticated', alice, 'insert into reviews("movieID","commentText","userRating") values (1,$1,11)', ['Invalid score']), /check constraint/);
    await as('authenticated', alice, 'delete from reviews where "reviewID"=$1', [review]);
    await assert.rejects(as('authenticated', bob, "insert into storage.objects(bucket_id,name) values ('posters','bad.png')"), /row-level security/);
    await as('authenticated', admin, "insert into storage.objects(bucket_id,name) values ('posters','good.png')");
    await as('authenticated', admin, 'update movies set title=$1 where "movieID"=1', ['Updated by admin']);
    const users = (await as('authenticated', admin, 'select public.admin_users() users')).rows[0].users;
    assert.equal(users.length, 3);
    assert.equal(users.find(u => u.userID === alice).email, 'alice@example.test');
    await assert.rejects(as('authenticated', admin, 'select public.admin_delete_user($1)', [admin]), /Cannot delete your own/);
    await as('authenticated', admin, 'select public.admin_delete_user($1)', [alice]);
    assert.equal((await db.query('select * from favorites')).rows.length, 0, 'deleted account cascades favorites');
    assert.equal((await as('authenticated', admin, 'select public.admin_summary() summary')).rows[0].summary.users, 2);
  } finally { await db.close(); }
});
