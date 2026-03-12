-- Extensions for UUID generation and text-search indexes
create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

-- Common trigger function for updated_at maintenance
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.expense_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  travel_date date not null,
  visit_to text not null,
  route_text text not null,
  is_round_trip boolean not null default false,
  amount numeric(12, 2) not null check (amount >= 0),
  category_code text not null,
  tax_code text not null,
  pre_approval_no text,
  memo text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger set_expense_records_updated_at
before update on public.expense_records
for each row
execute function public.set_updated_at();

-- Search and listing indexes
create index if not exists idx_expense_records_user_travel_date
  on public.expense_records (user_id, travel_date desc);
create index if not exists idx_expense_records_visit_to
  on public.expense_records using gin (visit_to gin_trgm_ops);
create index if not exists idx_expense_records_route_text
  on public.expense_records using gin (route_text gin_trgm_ops);
create index if not exists idx_expense_records_memo
  on public.expense_records using gin (memo gin_trgm_ops);

alter table public.expense_records enable row level security;

create policy "expense_records_select_own"
  on public.expense_records
  for select
  using (auth.uid() = user_id);

create policy "expense_records_insert_own"
  on public.expense_records
  for insert
  with check (auth.uid() = user_id);

create policy "expense_records_update_own"
  on public.expense_records
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "expense_records_delete_own"
  on public.expense_records
  for delete
  using (auth.uid() = user_id);

create table if not exists public.expense_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  template_name text not null,
  visit_to text not null,
  route_text text not null,
  is_round_trip boolean not null default false,
  default_amount numeric(12, 2) not null check (default_amount >= 0),
  category_code text not null,
  tax_code text not null,
  memo text,
  use_count integer not null default 0 check (use_count >= 0),
  last_used_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger set_expense_templates_updated_at
before update on public.expense_templates
for each row
execute function public.set_updated_at();

create index if not exists idx_expense_templates_user
  on public.expense_templates (user_id, last_used_at desc nulls last);

alter table public.expense_templates enable row level security;

create policy "expense_templates_select_own"
  on public.expense_templates
  for select
  using (auth.uid() = user_id);

create policy "expense_templates_insert_own"
  on public.expense_templates
  for insert
  with check (auth.uid() = user_id);

create policy "expense_templates_update_own"
  on public.expense_templates
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "expense_templates_delete_own"
  on public.expense_templates
  for delete
  using (auth.uid() = user_id);
