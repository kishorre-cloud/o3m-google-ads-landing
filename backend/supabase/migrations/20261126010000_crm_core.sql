-- O3M CRM core schema (multi-tenant) + landing-page lead intake.
--
-- MODEL
--   workspace   one business (a "tenant"). The first one is O3M itself ('o3m'); the landing
--               page leads go there. Client businesses (ABC Foods, ...) are added later.
--   profiles    one row per signed-in person (mirrors auth.users).
--   roles       per workspace; permissions are a JSON object of booleans, same keys the CRM
--               prototype uses (viewLeads, createLeads, ...). Four starter roles are seeded.
--   memberships who belongs to which workspace, with which role.
--   leads       every lead belongs to exactly one workspace.
--   lead_activities  the timeline (notes, calls, status/assignment changes, capture).
--
-- SECURITY
--   * Row-level security is ON for every table; `anon` has no access at all.
--   * Every tenant-owned row carries workspace_id and policies check membership + permission.
--   * Permissions are enforced HERE, in the database, not by hiding buttons in the CRM.
--   * The public landing page never touches these tables. It calls the `submit-lead` Edge
--     Function, which calls ingest_website_lead() with the service role.

-- ======================================================================== profiles
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text,
  full_name  text,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Anyone already in auth.users before this migration.
insert into public.profiles (id, email, full_name)
select u.id, u.email, coalesce(nullif(u.raw_user_meta_data ->> 'full_name', ''), split_part(u.email, '@', 1))
from auth.users u
on conflict (id) do nothing;

-- ===================================================================== workspaces
create table if not exists public.workspaces (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  industry    text,
  city        text,
  description text,
  status      text not null default 'active',
  plan        text,
  created_at  timestamptz not null default now(),
  constraint workspaces_status_chk check (status in ('active', 'suspended')),
  constraint workspaces_slug_chk   check (slug ~ '^[a-z0-9][a-z0-9_-]{1,40}$')
);

create table if not exists public.platform_admins (
  user_id    uuid primary key references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ========================================================================== roles
create table if not exists public.roles (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  role_key     text,                       -- owner | manager | sales_agent | receptionist (starter roles only)
  name         text not null,
  description  text,
  scope        text not null default 'all',  -- which leads the role can see: all | assigned
  permissions  jsonb not null default '{}'::jsonb,
  is_system    boolean not null default false,
  created_at   timestamptz not null default now(),
  constraint roles_scope_chk check (scope in ('all', 'assigned')),
  constraint roles_perm_obj_chk check (jsonb_typeof(permissions) = 'object'),
  constraint roles_name_len_chk check (char_length(name) between 2 and 60),
  unique (workspace_id, name),
  unique (id, workspace_id)
);

create or replace function public.seed_default_roles(p_ws uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.roles (workspace_id, role_key, name, description, scope, permissions, is_system) values
  (p_ws, 'owner', 'Owner',
   'Full control over workspace settings, members, custom roles, integrations, reports and leads.', 'all',
   '{"viewLeads":true,"createLeads":true,"editAllLeads":true,"deleteLeads":true,"assignLeads":true,"addNotes":true,"manageFollowUps":true,"viewReports":true,"manageTeam":true,"manageRoles":true,"manageIntegrations":true,"manageSettings":true}', true),
  (p_ws, 'manager', 'Manager',
   'Lead oversight, assignment, follow-ups, team visibility and reports.', 'all',
   '{"viewLeads":true,"createLeads":true,"editAllLeads":true,"deleteLeads":false,"assignLeads":true,"addNotes":true,"manageFollowUps":true,"viewReports":true,"manageTeam":false,"manageRoles":false,"manageIntegrations":false,"manageSettings":false}', true),
  (p_ws, 'sales_agent', 'Sales Agent',
   'Works the leads assigned to them: notes, status updates and follow-ups.', 'assigned',
   '{"viewLeads":true,"createLeads":true,"editAllLeads":false,"deleteLeads":false,"assignLeads":false,"addNotes":true,"manageFollowUps":true,"viewReports":false,"manageTeam":false,"manageRoles":false,"manageIntegrations":false,"manageSettings":false}', true),
  (p_ws, 'receptionist', 'Receptionist',
   'Enquiry capture and callback handling.', 'all',
   '{"viewLeads":true,"createLeads":true,"editAllLeads":false,"deleteLeads":false,"assignLeads":false,"addNotes":true,"manageFollowUps":true,"viewReports":false,"manageTeam":false,"manageRoles":false,"manageIntegrations":false,"manageSettings":false}', true)
  on conflict (workspace_id, name) do nothing;
end;
$$;

create or replace function public.workspaces_seed_roles()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.seed_default_roles(new.id);
  return new;
end;
$$;

drop trigger if exists workspaces_seed_roles_trg on public.workspaces;
create trigger workspaces_seed_roles_trg
  after insert on public.workspaces
  for each row execute function public.workspaces_seed_roles();

-- =================================================================== memberships
create table if not exists public.memberships (
  workspace_id uuid not null,
  user_id      uuid not null references public.profiles (id) on delete cascade,
  role_id      uuid not null,
  team         text,
  status       text not null default 'active',
  created_at   timestamptz not null default now(),
  primary key (workspace_id, user_id),
  -- the role must belong to the same workspace (no cross-tenant role borrowing)
  foreign key (role_id, workspace_id) references public.roles (id, workspace_id),
  foreign key (workspace_id) references public.workspaces (id) on delete cascade,
  constraint memberships_status_chk check (status in ('active', 'invited', 'disabled'))
);
create index if not exists memberships_user_idx on public.memberships (user_id);

-- ================================================================ access helpers
-- security definer + empty search_path: they read memberships/roles without RLS recursion.
create or replace function public.is_platform_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.platform_admins where user_id = (select auth.uid()));
$$;

create or replace function public.is_member(p_ws uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.memberships
    where workspace_id = p_ws and user_id = (select auth.uid()) and status = 'active'
  );
$$;

create or replace function public.has_perm(p_ws uuid, p_perm text)
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce((
    select (r.permissions ->> p_perm)::boolean
    from public.memberships m
    join public.roles r on r.id = m.role_id and r.workspace_id = m.workspace_id
    where m.workspace_id = p_ws and m.user_id = (select auth.uid()) and m.status = 'active'
  ), false);
$$;

create or replace function public.role_scope(p_ws uuid)
returns text language sql stable security definer set search_path = '' as $$
  select r.scope
  from public.memberships m
  join public.roles r on r.id = m.role_id and r.workspace_id = m.workspace_id
  where m.workspace_id = p_ws and m.user_id = (select auth.uid()) and m.status = 'active';
$$;

create or replace function public.shares_workspace(p_user uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1
    from public.memberships a
    join public.memberships b on b.workspace_id = a.workspace_id
    where a.user_id = (select auth.uid()) and a.status = 'active' and b.user_id = p_user
  );
$$;

-- ======================================================================== leads
create table if not exists public.leads (
  id               uuid primary key default gen_random_uuid(),
  lead_no          bigint generated always as identity,      -- shown as e.g. O3M-1042
  workspace_id     uuid not null references public.workspaces (id) on delete cascade,
  client_lead_id   text,                                     -- id made in the visitor's browser; makes retries safe

  name             text not null,
  company          text,
  email            text,
  phone            text,

  source           text not null default 'Manual',           -- Website | Google Ads | Meta Lead Ads | WhatsApp | Referral | CSV Import | Manual
  campaign         text,
  enquiry_type     text,
  status           text not null default 'New',
  assigned_to      uuid references public.profiles (id) on delete set null,

  next_follow_up_at timestamptz,
  follow_up_note    text,
  follow_up_done    boolean not null default false,

  attribution      jsonb not null default '{}'::jsonb,       -- gclid, gbraid, wbraid, utm_*, landing_page
  details          jsonb not null default '{}'::jsonb,       -- website, monthly_spend, industry, message, goal
  ip_hash          text,                                     -- salted hash for abuse control; never the raw IP

  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  last_activity_at timestamptz not null default now(),

  constraint leads_status_chk  check (status in ('New', 'Contacted', 'Qualified', 'Converted', 'Lost')),
  constraint leads_contact_chk check (email is not null or phone is not null),
  constraint leads_json_chk    check (jsonb_typeof(attribution) = 'object' and jsonb_typeof(details) = 'object'),
  constraint leads_len_chk     check (
    char_length(name) between 2 and 200
    and char_length(coalesce(company, '')) <= 200
    and char_length(coalesce(email, '')) <= 254
    and char_length(coalesce(phone, '')) <= 40
    and char_length(coalesce(campaign, '')) <= 300
    and char_length(coalesce(enquiry_type, '')) <= 200
    and char_length(coalesce(follow_up_note, '')) <= 500
  ),
  unique (id, workspace_id),
  unique (workspace_id, client_lead_id)
);

create index if not exists leads_ws_created_idx   on public.leads (workspace_id, created_at desc);
create index if not exists leads_ws_status_idx    on public.leads (workspace_id, status);
create index if not exists leads_ws_assignee_idx  on public.leads (workspace_id, assigned_to);
create index if not exists leads_ws_followup_idx  on public.leads (workspace_id, next_follow_up_at) where not follow_up_done;
create index if not exists leads_ws_ip_idx        on public.leads (workspace_id, ip_hash, created_at desc);

-- ============================================================== lead_activities
create table if not exists public.lead_activities (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  lead_id      uuid not null,
  type         text not null,
  body         text not null,
  author_id    uuid references public.profiles (id) on delete set null,
  author_name  text,
  created_at   timestamptz not null default now(),
  foreign key (lead_id, workspace_id) references public.leads (id, workspace_id) on delete cascade,
  constraint lead_activities_type_chk check (type in ('Capture', 'Note', 'Call', 'Email', 'Meeting', 'Status', 'Assignment', 'Follow-up')),
  constraint lead_activities_len_chk  check (char_length(body) between 1 and 4000)
);
create index if not exists lead_activities_lead_idx on public.lead_activities (lead_id, created_at desc);

-- ================================================================ triggers: leads
-- BEFORE INSERT/UPDATE: tidy fields and enforce rules a plain RLS policy cannot express.
create or replace function public.leads_guard()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());   -- null for the service role / SQL editor
begin
  if new.assigned_to is not null and not exists (
    select 1 from public.memberships
    where workspace_id = new.workspace_id and user_id = new.assigned_to and status = 'active'
  ) then
    raise exception 'assignee is not an active member of this workspace' using errcode = '23514';
  end if;

  if tg_op = 'INSERT' then
    -- A lead created by someone who only sees assigned leads is assigned to them,
    -- otherwise they could not see what they just created.
    if v_uid is not null and new.assigned_to is null and public.role_scope(new.workspace_id) = 'assigned' then
      new.assigned_to := v_uid;
    end if;
    return new;
  end if;

  -- UPDATE
  new.updated_at := now();
  if v_uid is not null then
    if new.assigned_to is distinct from old.assigned_to and not public.has_perm(new.workspace_id, 'assignLeads') then
      raise exception 'you are not allowed to assign leads' using errcode = '42501';
    end if;
    if (new.next_follow_up_at is distinct from old.next_follow_up_at
        or new.follow_up_note is distinct from old.follow_up_note
        or new.follow_up_done is distinct from old.follow_up_done)
       and not public.has_perm(new.workspace_id, 'manageFollowUps') then
      raise exception 'you are not allowed to manage follow-ups' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists leads_guard_trg on public.leads;
create trigger leads_guard_trg
  before insert or update on public.leads
  for each row execute function public.leads_guard();

-- AFTER UPDATE: write the audit trail for status / assignment / follow-up changes.
create or replace function public.leads_audit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text;
begin
  if new.status is distinct from old.status then
    insert into public.lead_activities (workspace_id, lead_id, type, body)
    values (new.workspace_id, new.id, 'Status', 'Status changed from ' || old.status || ' to ' || new.status || '.');
  end if;

  if new.assigned_to is distinct from old.assigned_to then
    select coalesce(full_name, email) into v_name from public.profiles where id = new.assigned_to;
    insert into public.lead_activities (workspace_id, lead_id, type, body)
    values (new.workspace_id, new.id, 'Assignment',
            case when new.assigned_to is null then 'Lead unassigned.' else 'Assigned to ' || coalesce(v_name, 'a team member') || '.' end);
  end if;

  if new.follow_up_done is distinct from old.follow_up_done and new.follow_up_done then
    insert into public.lead_activities (workspace_id, lead_id, type, body)
    values (new.workspace_id, new.id, 'Follow-up', 'Follow-up marked complete.');
  elsif new.next_follow_up_at is distinct from old.next_follow_up_at then
    insert into public.lead_activities (workspace_id, lead_id, type, body)
    values (new.workspace_id, new.id, 'Follow-up',
            case when new.next_follow_up_at is null then 'Follow-up cleared.'
                 else 'Follow-up set for ' || to_char(new.next_follow_up_at at time zone 'Asia/Kolkata', 'DD Mon YYYY HH24:MI') || ' IST.' end);
  end if;
  return null;
end;
$$;

drop trigger if exists leads_audit_trg on public.leads;
create trigger leads_audit_trg
  after update on public.leads
  for each row execute function public.leads_audit();

-- ========================================================= triggers: activities
create or replace function public.lead_activities_before_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
begin
  if v_uid is not null then
    -- never trust the client for who wrote the entry
    new.author_id := v_uid;
    new.author_name := coalesce(
      (select coalesce(nullif(full_name, ''), email) from public.profiles where id = v_uid),
      'Team member');
  else
    new.author_name := coalesce(new.author_name, 'System');
  end if;
  return new;
end;
$$;

drop trigger if exists lead_activities_before_insert_trg on public.lead_activities;
create trigger lead_activities_before_insert_trg
  before insert on public.lead_activities
  for each row execute function public.lead_activities_before_insert();

create or replace function public.lead_activities_after_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.leads set last_activity_at = new.created_at where id = new.lead_id;
  return null;
end;
$$;

drop trigger if exists lead_activities_after_insert_trg on public.lead_activities;
create trigger lead_activities_after_insert_trg
  after insert on public.lead_activities
  for each row execute function public.lead_activities_after_insert();

-- ====================================================== triggers: memberships
-- * Only an Owner can hand out the Owner role (prevents a "manage team" user promoting themselves).
-- * You cannot change your own membership.
-- * The last active Owner of a workspace cannot be removed, demoted or disabled (no lock-out).
create or replace function public.memberships_guard()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_new_key text;
  v_old_key text;
  v_other_owners int;
  v_removing boolean;
begin
  if v_uid is null then            -- service role / SQL editor: trusted
    if tg_op = 'DELETE' then return old; end if;
    return new;
  end if;

  if tg_op in ('INSERT', 'UPDATE') then
    select role_key into v_new_key from public.roles where id = new.role_id;
    if v_new_key = 'owner' and not public.is_platform_admin() and not exists (
      select 1 from public.memberships m
      join public.roles r on r.id = m.role_id
      where m.workspace_id = new.workspace_id and m.user_id = v_uid and m.status = 'active' and r.role_key = 'owner'
    ) then
      raise exception 'only an owner can grant the owner role' using errcode = '42501';
    end if;
  end if;

  if tg_op in ('UPDATE', 'DELETE') then
    if old.user_id = v_uid and not public.is_platform_admin() then
      raise exception 'you cannot change or remove your own membership' using errcode = '42501';
    end if;

    select role_key into v_old_key from public.roles where id = old.role_id;
    if v_old_key = 'owner' and old.status = 'active' then
      -- Is this change taking the owner away? (NEW does not exist on DELETE, so test it separately.)
      v_removing := (tg_op = 'DELETE');
      if tg_op = 'UPDATE' then
        v_removing := (new.role_id <> old.role_id or new.status <> 'active');
      end if;
      if v_removing then
        select count(*) into v_other_owners
        from public.memberships m
        join public.roles r on r.id = m.role_id
        where m.workspace_id = old.workspace_id and m.user_id <> old.user_id
          and m.status = 'active' and r.role_key = 'owner';
        if v_other_owners = 0 then
          raise exception 'a workspace must keep at least one active owner' using errcode = '23514';
        end if;
      end if;
    end if;
  end if;

  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

drop trigger if exists memberships_guard_trg on public.memberships;
create trigger memberships_guard_trg
  before insert or update or delete on public.memberships
  for each row execute function public.memberships_guard();

-- ================================================ row-level security + grants
alter table public.profiles        enable row level security;
alter table public.workspaces      enable row level security;
alter table public.platform_admins enable row level security;
alter table public.roles           enable row level security;
alter table public.memberships     enable row level security;
alter table public.leads           enable row level security;
alter table public.lead_activities enable row level security;

revoke all on public.profiles, public.workspaces, public.platform_admins, public.roles,
              public.memberships, public.leads, public.lead_activities
  from anon, authenticated;

-- Column-level grants: even with a matching policy, a user can only touch these columns.
grant select on public.profiles, public.workspaces, public.roles, public.memberships,
                public.leads, public.lead_activities to authenticated;

grant update (full_name) on public.profiles to authenticated;
grant insert (slug, name, industry, city, description) on public.workspaces to authenticated;   -- platform admin only (policy)
grant update (name, industry, city, description) on public.workspaces to authenticated;

grant insert (workspace_id, name, description, scope, permissions) on public.roles to authenticated;
grant update (name, description, scope, permissions) on public.roles to authenticated;
grant delete on public.roles to authenticated;

grant insert (workspace_id, user_id, role_id, team) on public.memberships to authenticated;
grant update (role_id, team, status) on public.memberships to authenticated;
grant delete on public.memberships to authenticated;

grant insert (workspace_id, name, company, email, phone, source, campaign, enquiry_type, status,
              assigned_to, next_follow_up_at, follow_up_note) on public.leads to authenticated;
grant update (name, company, email, phone, source, campaign, enquiry_type, status,
              assigned_to, next_follow_up_at, follow_up_note, follow_up_done) on public.leads to authenticated;
grant delete on public.leads to authenticated;

grant insert (workspace_id, lead_id, type, body) on public.lead_activities to authenticated;
-- lead_activities: no update, no delete. The timeline is append-only.

-- ---- policies
drop policy if exists "see own and teammates profiles" on public.profiles;
create policy "see own and teammates profiles" on public.profiles for select to authenticated
  using (id = (select auth.uid()) or public.shares_workspace(id));

drop policy if exists "edit own profile" on public.profiles;
create policy "edit own profile" on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

drop policy if exists "see my workspaces" on public.workspaces;
create policy "see my workspaces" on public.workspaces for select to authenticated
  using (public.is_member(id) or public.is_platform_admin());

drop policy if exists "platform admin creates workspaces" on public.workspaces;
create policy "platform admin creates workspaces" on public.workspaces for insert to authenticated
  with check (public.is_platform_admin());

drop policy if exists "settings managers edit workspace" on public.workspaces;
create policy "settings managers edit workspace" on public.workspaces for update to authenticated
  using (public.has_perm(id, 'manageSettings') or public.is_platform_admin())
  with check (public.has_perm(id, 'manageSettings') or public.is_platform_admin());

-- platform_admins: no policy for authenticated => no access (is_platform_admin() reads it as definer).

drop policy if exists "members see roles" on public.roles;
create policy "members see roles" on public.roles for select to authenticated
  using (public.is_member(workspace_id));

drop policy if exists "role managers create roles" on public.roles;
create policy "role managers create roles" on public.roles for insert to authenticated
  with check (public.has_perm(workspace_id, 'manageRoles') and not is_system);

drop policy if exists "role managers edit custom roles" on public.roles;
create policy "role managers edit custom roles" on public.roles for update to authenticated
  using (public.has_perm(workspace_id, 'manageRoles') and not is_system)
  with check (public.has_perm(workspace_id, 'manageRoles') and not is_system);

drop policy if exists "role managers delete custom roles" on public.roles;
create policy "role managers delete custom roles" on public.roles for delete to authenticated
  using (public.has_perm(workspace_id, 'manageRoles') and not is_system);

drop policy if exists "members see team" on public.memberships;
create policy "members see team" on public.memberships for select to authenticated
  using (public.is_member(workspace_id));

drop policy if exists "team managers add members" on public.memberships;
create policy "team managers add members" on public.memberships for insert to authenticated
  with check (public.has_perm(workspace_id, 'manageTeam'));

drop policy if exists "team managers edit members" on public.memberships;
create policy "team managers edit members" on public.memberships for update to authenticated
  using (public.has_perm(workspace_id, 'manageTeam'))
  with check (public.has_perm(workspace_id, 'manageTeam'));

drop policy if exists "team managers remove members" on public.memberships;
create policy "team managers remove members" on public.memberships for delete to authenticated
  using (public.has_perm(workspace_id, 'manageTeam'));

-- Leads: see = viewLeads + role scope; edit = editAllLeads, or the lead is assigned to you.
drop policy if exists "see permitted leads" on public.leads;
create policy "see permitted leads" on public.leads for select to authenticated
  using (
    public.has_perm(workspace_id, 'viewLeads')
    and (public.role_scope(workspace_id) = 'all' or assigned_to = (select auth.uid()))
  );

drop policy if exists "create leads" on public.leads;
create policy "create leads" on public.leads for insert to authenticated
  with check (public.has_perm(workspace_id, 'createLeads'));

drop policy if exists "edit permitted leads" on public.leads;
create policy "edit permitted leads" on public.leads for update to authenticated
  using (
    public.has_perm(workspace_id, 'viewLeads')
    and (public.role_scope(workspace_id) = 'all' or assigned_to = (select auth.uid()))
    and (public.has_perm(workspace_id, 'editAllLeads') or assigned_to = (select auth.uid()))
  )
  with check (
    public.has_perm(workspace_id, 'editAllLeads') or assigned_to = (select auth.uid())
  );

drop policy if exists "delete leads" on public.leads;
create policy "delete leads" on public.leads for delete to authenticated
  using (public.has_perm(workspace_id, 'deleteLeads'));

-- Timeline: visible when the lead is visible (the sub-select is itself filtered by the leads policy).
drop policy if exists "see timeline of visible leads" on public.lead_activities;
create policy "see timeline of visible leads" on public.lead_activities for select to authenticated
  using (exists (select 1 from public.leads l where l.id = lead_activities.lead_id));

drop policy if exists "add notes to visible leads" on public.lead_activities;
create policy "add notes to visible leads" on public.lead_activities for insert to authenticated
  with check (
    public.has_perm(workspace_id, 'addNotes')
    and type in ('Note', 'Call', 'Email', 'Meeting')     -- Status/Assignment/Follow-up/Capture are written by triggers only
    and exists (select 1 from public.leads l where l.id = lead_activities.lead_id and l.workspace_id = lead_activities.workspace_id)
  );

-- ================================================ landing-page intake (service role)
-- Called by the `submit-lead` Edge Function. One atomic step: rate-limit check, duplicate check,
-- insert the lead, write the "Capture" entry in its timeline.
create or replace function public.ingest_website_lead(
  p_workspace_slug text,
  p_lead           jsonb,
  p_ip_hash        text default null,
  p_max_per_hour   int  default 5
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_ws       uuid;
  v_id       uuid;
  v_goal     text := coalesce(p_lead ->> 'goal', '');
  v_enquiry  text;
  v_source   text;
  v_campaign text;
  v_body     text;
begin
  select id into v_ws from public.workspaces where slug = p_workspace_slug and status = 'active';
  if v_ws is null then
    raise exception 'workspace_not_found' using errcode = 'P0002';
  end if;

  -- A retry of a submission we already stored is a success, not a second lead.
  if nullif(p_lead ->> 'lead_id', '') is not null and exists (
    select 1 from public.leads where workspace_id = v_ws and client_lead_id = p_lead ->> 'lead_id'
  ) then
    return jsonb_build_object('status', 'duplicate');
  end if;

  if p_ip_hash is not null and (
    select count(*) from public.leads
    where workspace_id = v_ws and ip_hash = p_ip_hash and created_at > now() - interval '1 hour'
  ) >= p_max_per_hour then
    return jsonb_build_object('status', 'rate_limited');
  end if;

  v_enquiry := case v_goal
    when 'leads'  then 'Qualified leads'
    when 'ecom'   then 'Ecommerce sales'
    when 'both'   then 'Qualified leads and ecommerce sales'
    when 'unsure' then 'Not sure yet'
    else null end;

  v_source := case
    when coalesce(p_lead ->> 'gclid', '') <> '' or coalesce(p_lead ->> 'gbraid', '') <> '' or coalesce(p_lead ->> 'wbraid', '') <> ''
      or lower(coalesce(p_lead ->> 'utm_medium', '')) in ('cpc', 'ppc', 'paid')
    then 'Google Ads' else 'Website' end;

  v_campaign := coalesce(nullif(p_lead ->> 'utm_campaign', ''), 'Google Ads Management landing page');

  insert into public.leads (
    workspace_id, client_lead_id, name, company, email, phone,
    source, campaign, enquiry_type, status,
    next_follow_up_at, follow_up_note, attribution, details, ip_hash
  ) values (
    v_ws, nullif(p_lead ->> 'lead_id', ''),
    p_lead ->> 'name', nullif(p_lead ->> 'company', ''), nullif(p_lead ->> 'email', ''), nullif(p_lead ->> 'mobile', ''),
    v_source, v_campaign, v_enquiry, 'New',
    now() + interval '1 day', 'Call back about the Google Ads consultation request',
    jsonb_strip_nulls(jsonb_build_object(
      'gclid', nullif(p_lead ->> 'gclid', ''), 'gbraid', nullif(p_lead ->> 'gbraid', ''), 'wbraid', nullif(p_lead ->> 'wbraid', ''),
      'utm_source', nullif(p_lead ->> 'utm_source', ''), 'utm_medium', nullif(p_lead ->> 'utm_medium', ''),
      'utm_campaign', nullif(p_lead ->> 'utm_campaign', ''), 'utm_term', nullif(p_lead ->> 'utm_term', ''),
      'utm_content', nullif(p_lead ->> 'utm_content', ''), 'landing_page', nullif(p_lead ->> 'landing_page', ''))),
    jsonb_strip_nulls(jsonb_build_object(
      'goal', nullif(v_goal, ''), 'website', nullif(p_lead ->> 'website', ''),
      'monthly_spend', nullif(p_lead ->> 'spend', ''), 'industry', nullif(p_lead ->> 'industry', ''),
      'message', nullif(p_lead ->> 'message', ''))),
    p_ip_hash
  )
  on conflict (workspace_id, client_lead_id) do nothing
  returning id into v_id;

  if v_id is null then
    return jsonb_build_object('status', 'duplicate');
  end if;

  v_body := 'Requested a consultation through the Google Ads Management landing page.'
    || case when v_enquiry is not null then ' Goal: ' || v_enquiry || '.' else '' end
    || case when nullif(p_lead ->> 'message', '') is not null then E'\nMessage: ' || (p_lead ->> 'message') else '' end;

  insert into public.lead_activities (workspace_id, lead_id, type, body, author_name)
  values (v_ws, v_id, 'Capture', v_body, 'Website form');

  return jsonb_build_object('status', 'created', 'id', v_id);
end;
$$;

revoke execute on function public.ingest_website_lead(text, jsonb, text, int) from public, anon, authenticated;
grant  execute on function public.ingest_website_lead(text, jsonb, text, int) to service_role;

-- ================================================== helper for you (SQL editor only)
-- Add an existing login (created in Supabase Auth) to a workspace:
--   select public.add_member_by_email('o3m', 'person@o3mdm.com', 'owner');
-- role_key: owner | manager | sales_agent | receptionist
create or replace function public.add_member_by_email(p_ws_slug text, p_email text, p_role_key text, p_team text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_ws uuid;
  v_user uuid;
  v_role uuid;
begin
  select id into v_ws from public.workspaces where slug = p_ws_slug;
  if v_ws is null then raise exception 'unknown workspace %', p_ws_slug; end if;

  select id into v_user from public.profiles where lower(email) = lower(p_email);
  if v_user is null then raise exception 'no login found for % (create the user in Supabase Auth first)', p_email; end if;

  select id into v_role from public.roles where workspace_id = v_ws and role_key = p_role_key;
  if v_role is null then raise exception 'unknown role key %', p_role_key; end if;

  insert into public.memberships (workspace_id, user_id, role_id, team, status)
  values (v_ws, v_user, v_role, p_team, 'active')
  on conflict (workspace_id, user_id) do update set role_id = excluded.role_id, team = excluded.team, status = 'active';
end;
$$;

revoke execute on function public.add_member_by_email(text, text, text, text) from public, anon, authenticated;
grant  execute on function public.add_member_by_email(text, text, text, text) to service_role;

-- ============================================================ first workspace: O3M
insert into public.workspaces (slug, name, industry, city, description, plan)
values ('o3m', 'O3M Directional Marketing', 'Digital Marketing', 'Chennai & Coimbatore, IN',
        'O3M''s own enquiries, starting with the Google Ads Management landing page.', 'Internal')
on conflict (slug) do nothing;

select public.seed_default_roles(id) from public.workspaces where slug = 'o3m';
