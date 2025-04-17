-- Create pharmacy_users table
create table public.pharmacy_users (
    id uuid primary key default uuid_generate_v4(),
    username text not null unique,
    password text not null,
    pharmacy_id uuid references public.pharmacies on delete cascade not null,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up RLS policies
alter table public.pharmacy_users enable row level security;

create policy "Pharmacy users are viewable by admin users and themselves."
    on public.pharmacy_users for select
    using (
        auth.uid() in (select id from public.admin_users)
        or auth.uid()::text = id::text
    );

create policy "Pharmacy users can be created by admin users."
    on public.pharmacy_users for insert
    with check (auth.uid() in (select id from public.admin_users));

create policy "Pharmacy users can be updated by admin users and themselves."
    on public.pharmacy_users for update
    using (
        auth.uid() in (select id from public.admin_users)
        or auth.uid()::text = id::text
    );

create policy "Pharmacy users can be deleted by admin users."
    on public.pharmacy_users for delete
    using (auth.uid() in (select id from public.admin_users));

-- Create function to handle user updates
create or replace function public.handle_pharmacy_user_update()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$;

-- Create trigger for handling updated_at
create trigger on_pharmacy_user_update
    before update on public.pharmacy_users
    for each row
    execute procedure public.handle_pharmacy_user_update();

-- Helper function to check pharmacy users (for debugging)
create or replace function public.check_pharmacy_users()
returns table (
    id uuid,
    username text,
    pharmacy_id uuid,
    pharmacy_name text
)
language plpgsql
security definer
as $$
begin
    return query
    select 
        pu.id,
        pu.username,
        pu.pharmacy_id,
        p.name as pharmacy_name
    from pharmacy_users pu
    join pharmacies p on p.id = pu.pharmacy_id;
end;
$$;

-- Create custom authentication function
create or replace function public.pharmacy_user_auth(
    username text,
    password text
) returns json
language plpgsql
security definer
as $$
declare
    pharmacy_user record;
    result json;
begin
    -- Check if the pharmacy user exists and password matches
    select * into pharmacy_user
    from pharmacy_users
    where pharmacy_users.username = pharmacy_user_auth.username
    and pharmacy_users.password = pharmacy_user_auth.password;
    
    if pharmacy_user is null then
        return json_build_object(
            'success', false,
            'message', 'Invalid username or password'
        );
    end if;
    
    -- Update last sign in
    update pharmacy_users
    set last_sign_in_at = now()
    where id = pharmacy_user.id;
    
    -- Return success with user data
    return json_build_object(
        'success', true,
        'user', json_build_object(
            'id', pharmacy_user.id,
            'username', pharmacy_user.username,
            'pharmacy_id', pharmacy_user.pharmacy_id
        )
    );
end;
$$;
