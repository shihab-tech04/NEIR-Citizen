create table if not exists public.neir_demo_users (
 mobile text primary key check (mobile ~ '^01[0-9]{9}$'),
 display_name text not null,
 password_hash text not null,
 is_active boolean not null default true,
 created_at timestamptz not null default now()
);
alter table public.neir_demo_users enable row level security;
revoke all on table public.neir_demo_users from public, anon, authenticated;
grant select on table public.neir_demo_users to service_role;
create or replace function public.verify_neir_demo_login(p_mobile text, p_password text)
returns table (mobile text, display_name text)
language sql stable security invoker
set search_path = ''
as $func$
 select u.mobile,u.display_name
 from public.neir_demo_users as u
 where u.mobile=p_mobile and u.is_active
 and u.password_hash=extensions.crypt(p_password,u.password_hash)
 limit 1
$func$;
revoke all on function public.verify_neir_demo_login(text,text) from public, anon, authenticated;
grant execute on function public.verify_neir_demo_login(text,text) to service_role;
