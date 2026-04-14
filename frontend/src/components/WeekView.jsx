import { useEffect, useState } from 'react';
import { api } from '../api';

/**
 * Get Mon–Fri dates for the week containing `anchorDate`,
 * offset by `weekOffset` weeks.
 */
function getWeekDates(anchorDate, weekOffset = 0) {
  const d = new Date(anchorDate + 'T00:00:00');
  // Push to Monday
  const day  = d.getDay(); // 0=Sun, 1=Mon …
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff + weekOffset * 7);

  const dates = [];
  for (let i = 0; i < 5; i++) {
    const cur = new Date(d);
    cur.setDate(d.getDate() + i);
    dates.push(cur.toISOString().split('T')[0]);
  }
  return dates;
}

/**
 * Returns true when the given date is a designated office day for `employee`.
 * Mirrors the backend logic exactly.
 */
function isDesignatedForEmployee(employee, date, weekInCycle) {
  if (!employee || !weekInCycle) return false;
  const d   = new Date(date + 'T00:00:00');
  const iso = d.getDay() === 0 ? 7 : d.getDay(); // 1=Mon…7=Sun
  if (employee.batch === 1) {
    return weekInCycle === 1 ? iso <= 3 : iso >= 4 && iso <= 5;
  } else {
    return weekInCycle === 1 ? iso >= 4 && iso <= 5 : iso <= 3;
  }
}

export default function WeekView({ selectedEmployee, currentDate }) {
  const [weekOffset,   setWeekOffset]   = useState(0);
  const [weekDates,    setWeekDates]    = useState([]);
  const [availability, setAvailability] = useState([]);
  const [bookingsMap,  setBookingsMap]  = useState({});
  const [loading,      setLoading]      = useState(false);

  // Recompute dates when anchor or offset changes
  useEffect(() => {
    setWeekDates(getWeekDates(currentDate, weekOffset));
  }, [currentDate, weekOffset]);

  // Fetch data whenever dates change
  useEffect(() => {
    if (weekDates.length === 0) return;
    setLoading(true);

    Promise.all([
      api.getAvailability(weekDates),
      ...weekDates.map(d => api.getBookings(d).then(b => ({ date: d, bookings: b }))),
    ])
      .then(([avail, ...dayBookings]) => {
        setAvailability(avail);
        const map = {};
        dayBookings.forEach(({ date, bookings }) => { map[date] = bookings; });
        setBookingsMap(map);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [weekDates]);

  const fmt = (dateStr) =>
    new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
    });

  return (
    <div className="card p-5 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>
            Week Allocation View
          </h2>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Seat availability and your schedule for the week
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="btn btn-ghost"
            style={{ padding: '6px 12px' }}
            onClick={() => setWeekOffset(o => o - 1)}
          >
            ← Prev
          </button>
          <span
            className="text-xs font-semibold px-3 py-1.5 rounded-lg"
            style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)', minWidth: 90, textAlign: 'center' }}
          >
            {weekOffset === 0 ? 'This Week' : weekOffset > 0 ? `+${weekOffset} wk` : `${weekOffset} wk`}
          </span>
          <button
            className="btn btn-ghost"
            style={{ padding: '6px 12px' }}
            onClick={() => setWeekOffset(o => o + 1)}
          >
            Next →
          </button>
          {weekOffset !== 0 && (
            <button
              className="btn"
              style={{ padding: '6px 12px', background: 'var(--purple-bg)', color: 'var(--accent-light)', border: '1px solid var(--purple-border)', fontSize: 12 }}
              onClick={() => setWeekOffset(0)}
            >
              Today
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="skeleton" style={{ height: 160, borderRadius: 'var(--radius-md)' }} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-5 gap-3">
          {weekDates.map(date => {
            const avail      = availability.find(a => a.date === date);
            const dayBookings = bookingsMap[date] || [];
            const myBooking  = selectedEmployee
              ? dayBookings.find(b => b.employee_id === selectedEmployee.id)
              : null;

            const booked  = avail?.booked    ?? 0;
            const free    = avail?.available ?? (50 - booked);
            const pct     = Math.round((booked / 50) * 100);
            const fillClr = pct > 80 ? '#ef4444' : pct > 50 ? '#f59e0b' : '#22c55e';

            const weekInCycle = avail?.week_in_cycle ?? null;
            const designated  = isDesignatedForEmployee(selectedEmployee, date, weekInCycle);

            // Border highlight
            let borderClr = 'var(--border)';
            if (myBooking)  borderClr = '#6366f1';
            else if (designated) borderClr = 'rgba(34,197,94,0.4)';

            const dayName = new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' });
            const dayNum  = new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            return (
              <div
                key={date}
                className="rounded-xl p-3 flex flex-col gap-2 transition-all"
                style={{ background: 'var(--bg-secondary)', border: `1.5px solid ${borderClr}` }}
              >
                {/* Day header */}
                <div>
                  <div className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>
                    {dayName}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{dayNum}</div>
                </div>

                {/* Cycle badge */}
                {weekInCycle && (
                  <span className="badge w-fit" style={{ background: 'var(--purple-bg)', color: 'var(--accent-light)', border: '1px solid var(--purple-border)' }}>
                    W{weekInCycle}
                  </span>
                )}

                {/* Availability */}
                {avail ? (
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs mono font-bold" style={{ color: fillClr }}>{free} free</span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{pct}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${pct}%`, background: fillClr }} />
                    </div>
                  </div>
                ) : (
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>—</div>
                )}

                {/* Employee status for this day */}
                {selectedEmployee && (
                  <div className="mt-auto">
                    {myBooking ? (
                      <div className="badge w-fit" style={{ background: 'var(--purple-bg)', color: '#a5b4fc', border: '1px solid var(--purple-border)' }}>
                        ★ Seat #{myBooking.seat_id}
                      </div>
                    ) : designated ? (
                      <div className="badge w-fit" style={{ background: 'var(--green-bg)', color: '#86efac', border: '1px solid var(--green-border)' }}>
                        ✓ Scheduled
                      </div>
                    ) : (
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        — Off day
                      </div>
                    )}
                  </div>
                )}

                {/* Booked by list (compact) */}
                {dayBookings.length > 0 && (
                  <div className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                    {dayBookings.length} booking{dayBookings.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Bookings breakdown per day */}
      {!loading && weekDates.some(d => (bookingsMap[d] || []).length > 0) && (
        <div className="mt-5">
          <div className="divider" />
          <h3 className="font-bold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>
            Daily Booking Details
          </h3>
          <div className="grid grid-cols-5 gap-3">
            {weekDates.map(date => {
              const dayBookings = bookingsMap[date] || [];
              if (dayBookings.length === 0) return (
                <div key={date} className="text-xs text-center py-2" style={{ color: 'var(--text-muted)' }}>
                  No bookings
                </div>
              );
              return (
                <div key={date} className="space-y-1 max-h-48 overflow-y-auto">
                  {dayBookings.map(b => (
                    <div
                      key={b.id}
                      className="rounded px-2 py-1 text-xs flex items-center justify-between gap-1"
                      style={{
                        background: selectedEmployee && b.employee_id === selectedEmployee.id
                          ? 'var(--purple-bg)'
                          : 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      <span className="mono font-bold" style={{ color: 'var(--accent-light)' }}>
                        #{b.seat_id}
                      </span>
                      <span className="truncate" style={{ maxWidth: 70 }}>{b.employee_name?.split(' ')[0]}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
