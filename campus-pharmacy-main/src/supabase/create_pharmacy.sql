create table pharmacies (
  id bigint primary key generated always as identity,
  name text not null,
  address text,
  phone text,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


create table medicines (
  id bigint primary key generated always as identity,
  name text not null,
  description text,
  price decimal(10,2),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table pharmacy_medicines (
  id bigint primary key generated always as identity,
  pharmacy_id bigint references pharmacies(id),
  medicine_id bigint references medicines(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);