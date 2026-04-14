-- ============================================================
-- SEAT BOOKING SYSTEM — PostgreSQL Schema + Seed Data
--
-- Run once with:
--   psql -U postgres -d seat_booking -f schema.sql
-- Or paste into pgAdmin Query Tool.
--
-- Prerequisites: create the DB first:
--   CREATE DATABASE seat_booking;
-- ============================================================

-- Drop in reverse FK order
DROP TABLE IF EXISTS bookings  CASCADE;
DROP TABLE IF EXISTS seats     CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS squads    CASCADE;

-- ────────────────────────────────────────────────────────────
-- TABLES
-- ────────────────────────────────────────────────────────────

CREATE TABLE squads (
  id   SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE employees (
  id       SERIAL PRIMARY KEY,
  name     VARCHAR(100) NOT NULL,
  squad_id INTEGER      NOT NULL REFERENCES squads(id) ON DELETE CASCADE,
  batch    SMALLINT     NOT NULL CHECK (batch IN (1, 2))
);

CREATE TABLE seats (
  id          SERIAL  PRIMARY KEY,
  is_floater  BOOLEAN NOT NULL DEFAULT FALSE,   -- TRUE for seats 41-50
  is_blocked  BOOLEAN NOT NULL DEFAULT FALSE    -- TRUE when blocked for next working day
);

CREATE TABLE bookings (
  id          SERIAL  PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  seat_id     INTEGER NOT NULL REFERENCES seats(id)     ON DELETE CASCADE,
  date        DATE    NOT NULL,

  -- Prevent same seat being double-booked on same day
  CONSTRAINT unique_seat_date     UNIQUE (seat_id,     date),
  -- Prevent same employee from booking multiple seats per day
  CONSTRAINT unique_employee_date UNIQUE (employee_id, date)
);

-- Indexes for common query patterns
CREATE INDEX idx_bookings_date         ON bookings(date);
CREATE INDEX idx_bookings_employee_id  ON bookings(employee_id);
CREATE INDEX idx_employees_squad_batch ON employees(squad_id, batch);

-- ────────────────────────────────────────────────────────────
-- SEED: 10 Squads
-- ────────────────────────────────────────────────────────────

INSERT INTO squads (name) VALUES
  ('Alpha'),('Bravo'),('Charlie'),('Delta'),('Echo'),
  ('Foxtrot'),('Golf'),('Hotel'),('India'),('Juliet');

-- ────────────────────────────────────────────────────────────
-- SEED: 80 Employees (8 per squad — 4 Batch 1, 4 Batch 2)
-- ────────────────────────────────────────────────────────────

INSERT INTO employees (name, squad_id, batch) VALUES
-- Squad 1: Alpha
  ('Alice Martin',        1, 1), ('Bob Chen',          1, 1),
  ('Carol Singh',         1, 1), ('David Park',         1, 1),
  ('Eva Torres',          1, 2), ('Frank Liu',          1, 2),
  ('Grace Kim',           1, 2), ('Hank Patel',         1, 2),
-- Squad 2: Bravo
  ('Isla Brown',          2, 1), ('Jack Wilson',        2, 1),
  ('Karen Davis',         2, 1), ('Liam Johnson',       2, 1),
  ('Mia Garcia',          2, 2), ('Noah Martinez',      2, 2),
  ('Olivia Taylor',       2, 2), ('Pete Anderson',      2, 2),
-- Squad 3: Charlie
  ('Quinn Thomas',        3, 1), ('Rachel White',       3, 1),
  ('Sam Harris',          3, 1), ('Tina Lewis',         3, 1),
  ('Uma Clark',           3, 2), ('Victor Robinson',    3, 2),
  ('Wendy Walker',        3, 2), ('Xander Hall',        3, 2),
-- Squad 4: Delta
  ('Yara Allen',          4, 1), ('Zoe Young',          4, 1),
  ('Aaron King',          4, 1), ('Beth Wright',        4, 1),
  ('Carl Scott',          4, 2), ('Diana Green',        4, 2),
  ('Ethan Adams',         4, 2), ('Fiona Baker',        4, 2),
-- Squad 5: Echo
  ('Gavin Nelson',        5, 1), ('Hannah Carter',      5, 1),
  ('Ivan Mitchell',       5, 1), ('Julia Perez',        5, 1),
  ('Kevin Roberts',       5, 2), ('Laura Turner',       5, 2),
  ('Marco Phillips',      5, 2), ('Nina Campbell',      5, 2),
-- Squad 6: Foxtrot
  ('Oscar Parker',        6, 1), ('Paula Evans',        6, 1),
  ('Quincy Edwards',      6, 1), ('Rosa Collins',       6, 1),
  ('Steve Stewart',       6, 2), ('Tara Sanchez',       6, 2),
  ('Umar Morris',         6, 2), ('Vera Rogers',        6, 2),
-- Squad 7: Golf
  ('Will Reed',           7, 1), ('Xena Cook',          7, 1),
  ('Yusuf Morgan',        7, 1), ('Zara Bell',          7, 1),
  ('Adam Murphy',         7, 2), ('Bella Bailey',       7, 2),
  ('Chris Rivera',        7, 2), ('Dana Cooper',        7, 2),
-- Squad 8: Hotel
  ('Eli Richardson',      8, 1), ('Faye Cox',           8, 1),
  ('Glen Howard',         8, 1), ('Holly Ward',         8, 1),
  ('Ian Torres',          8, 2), ('Jade Peterson',      8, 2),
  ('Kyle Gray',           8, 2), ('Luna Ramirez',       8, 2),
-- Squad 9: India
  ('Max James',           9, 1), ('Nora Watson',        9, 1),
  ('Owen Brooks',         9, 1), ('Paige Kelly',        9, 1),
  ('Rex Sanders',         9, 2), ('Sara Price',         9, 2),
  ('Tom Bennett',         9, 2), ('Uma Wood',           9, 2),
-- Squad 10: Juliet
  ('Vera Barnes',        10, 1), ('Wade Ross',          10, 1),
  ('Xyla Henderson',     10, 1), ('Yolanda Coleman',    10, 1),
  ('Zach Jenkins',       10, 2), ('Amy Perry',          10, 2),
  ('Ben Powell',         10, 2), ('Cara Long',          10, 2);

-- ────────────────────────────────────────────────────────────
-- SEED: 50 Seats
--   Seats  1–40 → regular seats (is_floater = FALSE)
--   Seats 41–50 → floater seats (is_floater = TRUE)
-- ────────────────────────────────────────────────────────────

INSERT INTO seats (is_floater, is_blocked)
SELECT
  gs > 40,  -- TRUE for seats 41-50
  FALSE
FROM generate_series(1, 50) AS gs;

-- ────────────────────────────────────────────────────────────
-- VERIFY
-- ────────────────────────────────────────────────────────────

SELECT 'squads'    AS entity, COUNT(*) AS count FROM squads
UNION ALL
SELECT 'employees',            COUNT(*)          FROM employees
UNION ALL
SELECT 'seats',                COUNT(*)          FROM seats
UNION ALL
SELECT 'floater_seats',        COUNT(*)          FROM seats WHERE is_floater = TRUE;
