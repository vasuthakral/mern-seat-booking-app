const express = require('express');
const cors    = require('cors');
const { Pool } = require('pg');
const { isHoliday, getHolidaysInRange } = require('./holidays');

const app = express();

// ─── CORS + JSON ────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'DELETE', 'PATCH', 'OPTIONS'],
}));
app.use(express.json());

// ─── DB CONNECTION ───────────────────────────────────────────────────────────
// Copy .env.example → .env and fill in your credentials.
const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME     || 'seat_booking',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

pool.connect()
  .then(c => { console.log('✅  Database connected.'); c.release(); })
  .catch(err => console.error('❌  Database connection failed:', err.message));

// ─── HELPERS ─────────────────────────────────────────────────────────────────

/** Returns true if date string is Saturday or Sunday. */
function isWeekend(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDay();
  return day === 0 || day === 6;
}

/** Returns true if date is a weekend or public holiday. */
function isNonWorkingDay(dateStr) {
  return isWeekend(dateStr) || !!isHoliday(dateStr);
}

/**
 * Returns 1 or 2 — the week within the current 2-week cycle.
 * Anchored to 2025-01-06 (a known Monday of Week 1 in cycle).
 */
function getWeekInCycle(dateStr) {
  const anchor   = new Date('2025-01-06T00:00:00');
  const d        = new Date(dateStr + 'T00:00:00');
  const diffDays = Math.floor((d - anchor) / 86_400_000);
  const cycleDay = ((diffDays % 14) + 14) % 14;
  return cycleDay < 7 ? 1 : 2;
}

/** ISO day: 1 = Mon … 7 = Sun */
function getISODay(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.getDay() === 0 ? 7 : d.getDay();
}

/**
 * Returns true if `batch` is scheduled for the office on `dateStr`.
 *
 * Schedule (2-week cycle):
 *   Batch 1 — Week 1: Mon–Wed  | Week 2: Thu–Fri
 *   Batch 2 — Week 1: Thu–Fri  | Week 2: Mon–Wed
 */
function isDesignatedDay(batch, dateStr) {
  if (isNonWorkingDay(dateStr)) return false;
  const week   = getWeekInCycle(dateStr);
  const isoDay = getISODay(dateStr);
  if (batch === 1) {
    return week === 1
      ? isoDay >= 1 && isoDay <= 3   // Mon–Wed
      : isoDay >= 4 && isoDay <= 5;  // Thu–Fri
  } else {
    return week === 1
      ? isoDay >= 4 && isoDay <= 5   // Thu–Fri
      : isoDay >= 1 && isoDay <= 3;  // Mon–Wed
  }
}

/** Get next N working days (Mon–Fri, excluding holidays) starting from tomorrow. */
function getNextWorkingDays(n = 14) {
  const days = [];
  const d    = new Date();
  d.setDate(d.getDate() + 1); // start from tomorrow
  while (days.length < n) {
    const iso = d.toISOString().split('T')[0];
    if (!isNonWorkingDay(iso)) days.push(iso);
    d.setDate(d.getDate() + 1);
  }
  return days;
}

// ─── ROUTES ──────────────────────────────────────────────────────────────────

// GET /employees
app.get('/employees', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT e.id, e.name, e.batch, s.id AS squad_id, s.name AS squad_name
      FROM employees e
      JOIN squads s ON s.id = e.squad_id
      ORDER BY s.id, e.batch, e.name
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /seats
app.get('/seats', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM seats ORDER BY id');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /bookings?date=YYYY-MM-DD
app.get('/bookings', async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'date query param is required' });
  try {
    const { rows } = await pool.query(`
      SELECT b.id, b.employee_id, b.seat_id, b.date::text,
             e.name AS employee_name, s.name AS squad_name, e.batch
      FROM bookings b
      JOIN employees e ON e.id = b.employee_id
      JOIN squads    s ON s.id = e.squad_id
      WHERE b.date = $1
      ORDER BY b.seat_id
    `, [date]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /my-bookings?employee_id=X
app.get('/my-bookings', async (req, res) => {
  const { employee_id } = req.query;
  if (!employee_id) return res.status(400).json({ error: 'employee_id query param is required' });
  try {
    const { rows } = await pool.query(`
      SELECT b.id, b.seat_id, b.date::text, s.is_floater
      FROM bookings b
      JOIN seats s ON s.id = b.seat_id
      WHERE b.employee_id = $1
        AND b.date >= CURRENT_DATE
      ORDER BY b.date
    `, [employee_id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /week-info?date=YYYY-MM-DD
app.get('/week-info', async (req, res) => {
  const date = req.query.date || new Date().toISOString().split('T')[0];
  const count = parseInt(req.query.count) || 14;
  const holiday = isHoliday(date);
  res.json({
    date,
    week_in_cycle:     getWeekInCycle(date),
    is_weekend:        isWeekend(date),
    is_holiday:        !!holiday,
    holiday_name:      holiday ? holiday.name : null,
    next_working_days: getNextWorkingDays(count),
    next_working_day:  getNextWorkingDays(1)[0],
  });
});

// GET /availability?dates=YYYY-MM-DD,YYYY-MM-DD,...
app.get('/availability', async (req, res) => {
  const dates = (req.query.dates || '').split(',').filter(Boolean);
  if (dates.length === 0) return res.status(400).json({ error: 'dates query param is required' });
  try {
    // Get total bookings per date
    const { rows: totalRows } = await pool.query(`
      SELECT date::text AS date, COUNT(*) AS booked_count
      FROM bookings
      WHERE date = ANY($1::date[])
      GROUP BY date
    `, [dates]);

    // Get regular seat bookings (non-floater)
    const { rows: regularRows } = await pool.query(`
      SELECT b.date::text AS date, COUNT(*) AS booked_count
      FROM bookings b
      JOIN seats s ON s.id = b.seat_id
      WHERE b.date = ANY($1::date[]) AND s.is_floater = false
      GROUP BY b.date
    `, [dates]);

    // Get floater seat bookings
    const { rows: floaterRows } = await pool.query(`
      SELECT b.date::text AS date, COUNT(*) AS booked_count
      FROM bookings b
      JOIN seats s ON s.id = b.seat_id
      WHERE b.date = ANY($1::date[]) AND s.is_floater = true
      GROUP BY b.date
    `, [dates]);

    // Get seat counts
    const { rows: seatCounts } = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE is_floater = false AND is_blocked = false) AS regular_seats,
        COUNT(*) FILTER (WHERE is_floater = true AND is_blocked = false) AS floater_seats
      FROM seats
    `);

    const regularSeats = parseInt(seatCounts[0].regular_seats);
    const floaterSeats = parseInt(seatCounts[0].floater_seats);

    const totalMap = {};
    const regularMap = {};
    const floaterMap = {};
    
    totalRows.forEach(r => { totalMap[r.date] = parseInt(r.booked_count); });
    regularRows.forEach(r => { regularMap[r.date] = parseInt(r.booked_count); });
    floaterRows.forEach(r => { floaterMap[r.date] = parseInt(r.booked_count); });

    const availability = dates.map(d => ({
      date:              d,
      booked:            totalMap[d] || 0,
      available:         50 - (totalMap[d] || 0),
      regular_booked:    regularMap[d] || 0,
      regular_available: regularSeats - (regularMap[d] || 0),
      floater_booked:    floaterMap[d] || 0,
      floater_available: floaterSeats - (floaterMap[d] || 0),
      week_in_cycle:     getWeekInCycle(d),
    }));
    res.json(availability);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /book
// Body: { employee_id, seat_id, date }
app.post('/book', async (req, res) => {
  const { employee_id, seat_id, date } = req.body;
  if (!employee_id || !seat_id || !date) {
    return res.status(400).json({ error: 'employee_id, seat_id, and date are required.' });
  }

  try {
    // Weekend/Holiday check
    if (isWeekend(date)) {
      return res.status(400).json({ error: 'Booking is not allowed on weekends.' });
    }
    const holiday = isHoliday(date);
    if (holiday) {
      return res.status(400).json({ error: `Booking is not allowed on public holidays. ${date} is ${holiday.name}.` });
    }

    // Fetch employee
    const empRes = await pool.query(
      'SELECT e.*, s.name AS squad_name FROM employees e JOIN squads s ON s.id = e.squad_id WHERE e.id = $1',
      [employee_id]
    );
    if (empRes.rows.length === 0) return res.status(404).json({ error: 'Employee not found.' });
    const emp = empRes.rows[0];

    // Fetch seat
    const seatRes = await pool.query('SELECT * FROM seats WHERE id = $1', [seat_id]);
    if (seatRes.rows.length === 0) return res.status(404).json({ error: 'Seat not found.' });
    const seat = seatRes.rows[0];

    // Blocked seat check
    if (seat.is_blocked) {
      return res.status(400).json({ error: 'Seat is blocked and cannot be booked.' });
    }

    const designated = isDesignatedDay(emp.batch, date);

    // Non-designated day: only floater seats allowed
    if (!designated && !seat.is_floater) {
      return res.status(400).json({
        error: `${emp.name} (Batch ${emp.batch}) is not scheduled for office on this day. Only floater seats (41–50) are available on non-designated days.`,
      });
    }

    // Insert — DB UNIQUE constraints handle double booking
    const { rows } = await pool.query(
      'INSERT INTO bookings (employee_id, seat_id, date) VALUES ($1, $2, $3) RETURNING *',
      [employee_id, seat_id, date]
    );
    res.status(201).json({ booking: rows[0], message: `Seat #${seat_id} booked successfully!` });

  } catch (err) {
    if (err.code === '23505') {
      if (err.constraint === 'unique_seat_date') {
        return res.status(409).json({ error: 'This seat is already booked for that date.' });
      }
      if (err.constraint === 'unique_employee_date') {
        return res.status(409).json({ error: 'You already have a booking on this date. Cancel it first.' });
      }
    }
    res.status(500).json({ error: err.message });
  }
});

// DELETE /booking/:id
// Body: { employee_id } — ensures users can only cancel their own bookings
app.delete('/booking/:id', async (req, res) => {
  const { id }         = req.params;
  const { employee_id } = req.body;
  if (!employee_id) return res.status(400).json({ error: 'employee_id is required in body.' });

  try {
    const { rows } = await pool.query('SELECT * FROM bookings WHERE id = $1', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Booking not found.' });
    if (rows[0].employee_id !== parseInt(employee_id)) {
      return res.status(403).json({ error: 'You can only cancel your own bookings.' });
    }
    await pool.query('DELETE FROM bookings WHERE id = $1', [id]);
    res.json({ message: 'Booking cancelled successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /seat/:id/block
// Body: { block: boolean }
// Rule: blocking is only allowed after 3:00 PM (for next working day).
// Unblocking can be done any time.
app.patch('/seat/:id/block', async (req, res) => {
  const { id }  = req.params;
  const { block } = req.body;

  if (typeof block !== 'boolean') {
    return res.status(400).json({ error: '"block" must be a boolean.' });
  }

  try {
    // Enforce 3 PM rule for BLOCKING only (unblocking is always allowed)
    if (block) {
      const nowIST  = new Date(); // server time — adjust TZ if needed via env
      const hour    = nowIST.getHours();
      if (hour < 15) {
        return res.status(400).json({
          error: 'Seats can only be blocked after 3:00 PM for the next working day.',
        });
      }
    }

    const { rows } = await pool.query(
      'UPDATE seats SET is_blocked = $1 WHERE id = $2 RETURNING *',
      [block, id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Seat not found.' });

    res.json({
      seat:    rows[0],
      message: block ? 'Seat blocked for next working day.' : 'Seat unblocked.',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /holidays?year=2025
app.get('/holidays', async (req, res) => {
  const year = req.query.year;
  if (year) {
    const { getHolidaysByYear } = require('./holidays');
    const yearHolidays = getHolidaysByYear(parseInt(year));
    return res.json(yearHolidays);
  }
  
  // Return holidays in next 365 days
  const today = new Date().toISOString().split('T')[0];
  const oneYearLater = new Date();
  oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
  const endDate = oneYearLater.toISOString().split('T')[0];
  
  const upcomingHolidays = getHolidaysInRange(today, endDate);
  res.json(upcomingHolidays);
});

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// ─── START ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅  Seat Booking API running → http://localhost:${PORT}`);
  console.log(`    DB: ${process.env.DB_USER || 'postgres'}@${process.env.DB_HOST || 'localhost'}/${process.env.DB_NAME || 'seat_booking'}`);
});
