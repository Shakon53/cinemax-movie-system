begin;
create table cinemax_private.initial_admin (
  email text primary key,
  claimed_by uuid references auth.users(id) on delete set null,
  claimed_at timestamptz
);
alter table cinemax_private.initial_admin enable row level security;
revoke all on cinemax_private.initial_admin from public,anon,authenticated;
create function cinemax_private.grant_initial_admin() returns trigger
language plpgsql security definer set search_path='' as $$
declare configured_email text;
begin
  -- Require a confirmation email to have been sent as well as confirmed.
  -- Auto-confirmed signups cannot claim the administrator role by entering an email.
  if new.email_confirmed_at is null or new.confirmation_sent_at is null then return new; end if;
  select email into configured_email from cinemax_private.initial_admin
    where lower(email)=lower(new.email) and claimed_at is null for update;
  if configured_email is null then return new; end if;
  insert into public.user_roles(user_id,role) values(new.id,'admin') on conflict(user_id) do nothing;
  update cinemax_private.initial_admin set claimed_by=new.id,claimed_at=now() where email=configured_email;
  return new;
end; $$;
revoke all on function cinemax_private.grant_initial_admin() from public,anon,authenticated;
create trigger cinemax_initial_admin after update of email_confirmed_at on auth.users
for each row execute function cinemax_private.grant_initial_admin();
commit;
