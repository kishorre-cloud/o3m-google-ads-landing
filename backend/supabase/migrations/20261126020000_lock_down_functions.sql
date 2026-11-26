-- Follow-up to crm_core, from the Supabase security advisor.
--
-- 1. Trigger and seeding functions are internal. Nobody should be able to call them through
--    the REST API (/rest/v1/rpc/...), so revoke EXECUTE from every API role.
--    (A trigger fires with the table owner's rights; the invoking user needs no EXECUTE.)
-- 2. The RLS helper functions are called from policies as the signed-in user, so
--    `authenticated` keeps EXECUTE. `anon` has no table access, so it loses it.
-- 3. platform_admins: say explicitly that nobody reads it directly.

revoke execute on function public.handle_new_user()                    from public, anon, authenticated;
revoke execute on function public.workspaces_seed_roles()              from public, anon, authenticated;
revoke execute on function public.seed_default_roles(uuid)             from public, anon, authenticated;
revoke execute on function public.leads_guard()                        from public, anon, authenticated;
revoke execute on function public.leads_audit()                        from public, anon, authenticated;
revoke execute on function public.lead_activities_before_insert()      from public, anon, authenticated;
revoke execute on function public.lead_activities_after_insert()       from public, anon, authenticated;
revoke execute on function public.memberships_guard()                  from public, anon, authenticated;

revoke execute on function public.is_platform_admin()                  from public, anon;
revoke execute on function public.is_member(uuid)                      from public, anon;
revoke execute on function public.has_perm(uuid, text)                 from public, anon;
revoke execute on function public.role_scope(uuid)                     from public, anon;
revoke execute on function public.shares_workspace(uuid)               from public, anon;
grant  execute on function public.is_platform_admin()                  to authenticated;
grant  execute on function public.is_member(uuid)                      to authenticated;
grant  execute on function public.has_perm(uuid, text)                 to authenticated;
grant  execute on function public.role_scope(uuid)                     to authenticated;
grant  execute on function public.shares_workspace(uuid)               to authenticated;

drop policy if exists "no direct access" on public.platform_admins;
create policy "no direct access" on public.platform_admins for all to authenticated
  using (false) with check (false);
