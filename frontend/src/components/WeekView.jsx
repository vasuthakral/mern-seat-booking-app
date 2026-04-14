import { useEffect, useState } from 'react';
import { api } from '../api';

function getWeekDates(anchorDate, weekOffset = 0) {
  const d = new Date(anchorDate + 'T00:00:00');
  const day  = d.getDay();
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

function isDesignatedForEmployee(employee, date, weekInCycle) {
  if (!employee || !weekInCycle) return false;
  const d   = new Date(date + 'T00:00:00');
  const iso = d.getDay() === 0 ? 7 : d.getDay();
  if (employee.batch === 1) {
    return weekInCycle === 1 ? iso <= 3 : iso >= 4 && iso <= 5;
  } else {
    return weekInCycle === 1 ? iso >= 4 && iso <= 5 : iso <= 3;
  }
}

const today = new Date().toISOString().split('T')[0];

export default function WeekView({ selectedEmployee, currentDate }) {
  const [weekOffset,   setWeekOffset]   = useState(0);
  const [weekDates,    setWeekDates]    = useState([]);
  const [availability, setAvailability] = useState([]);
  const [bookingsMap,  setBookingsMap]  = useState({});
  const [loading,      setLoading]      = useState(false);

  useEffect(() => {
    setWeekDates(getWeekDates(currentDate, weekOffset));
  }, [currentDate, weekOffset]);

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

  const weekLabel = weekOffset === 0 ? 'This Week' : weekOffset > 0 ? `+${weekOffset} wk` : `${weekOffset} wk`;

  return (
    <div className="card no-hover fade-in" style={{ padding: '22px 20px' }}>

      {/* ── Header ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 3 }}>
            <div className="section-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2ec4b6" strokeWidth="2.2" strokeLinecap="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                Week Allocation View
              </h2>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 2 }}>
                Seat availability and schedule for the week
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button className="btn btn-ghost" style={{ padding: '7px 14px', fontSize: '12px' }} onClick={() => setWeekOffset(o => o - 1)}>
            ← Prev
          </button>
          <div style={{
            padding: '6px 16px',
            borderRadius: 'var(--r-md)',
            background: 'var(--accent-subtle)',
            border: '1px solid var(--accent-border)',
            color: 'var(--accent-dark)',
            fontSize: '12px',
            fontWeight: 700,
            minWidth: 96,
            textAlign: 'center',
          }}>
            {weekLabel}
          </div>
          <button className="btn btn-ghost" style={{ padding: '7px 14px', fontSize: '12px' }} onClick={() => setWeekOffset(o => o + 1)}>
            Next →
          </button>
          {weekOffset !== 0 && (
            <button
              className="btn"
              style={{
                padding: '7px 14px', fontSize: '12px',
                background: 'var(--accent-subtle)',
                color: 'var(--accent-dark)',
                border: '1px solid var(--accent-border)',
              }}
              onClick={() => setWeekOffset(0)}
            >
              Today
            </button>
          )}
        </div>
      </div>

      {/* ── Day cards ──────────────────────────────────────── */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
          {[1,2,3,4,5].map(i => (
            <div key={i} className="skeleton" style={{ height: 160, borderRadius: 'var(--r-md)' }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
          {weekDates.map(date => {
            const avail       = availability.find(a => a.date === date);
            const dayBookings = bookingsMap[date] || [];
            const myBooking   = selectedEmployee
              ? dayBookings.find(b => b.employee_id === selectedEmployee.id)
              : null;

            const booked      = avail?.booked    ?? 0;
            const free        = avail?.available ?? (50 - booked);
            const pct         = Math.round((booked / 50) * 100);
            const fillClr     = pct > 80 ? '#e05252' : pct > 50 ? '#d97706' : '#2a9d5c';
            const fillGrad    = pct > 80
              ? 'linear-gradient(90deg,#e05252,#c43c3c)'
              : pct > 50
                ? 'linear-gradient(90deg,#d97706,#b45309)'
                : 'linear-gradient(90deg,#2a9d5c,#1e7a48)';

            const weekInCycle = avail?.week_in_cycle ?? null;
            const designated  = isDesignatedForEmployee(selectedEmployee, date, weekInCycle);
            const isToday     = date === today;

            let borderClr = 'var(--border)';
            if (myBooking)       borderClr = 'rgba(244,132,95,0.45)';
            else if (designated) borderClr = 'rgba(42,157,92,0.35)';
            else if (isToday)    borderClr = 'rgba(46,196,182,0.4)';

            const dayName = new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' });
            const dayNum  = new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            return (
              <div
                key={date}
                style={{
                  background: myBooking
                    ? 'rgba(244,132,95,0.05)'
                    : designated
                      ? 'rgba(42,157,92,0.04)'
                      : '#ffffff',
                  border: `1.5px solid ${borderClr}`,
                  borderRadius: 'var(--r-md)',
                  padding: '12px 10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'border-color 0.2s, transform 0.2s',
                  boxShadow: 'var(--shadow-xs)',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                {isToday && (
                  <div style={{
                    position: 'absolute', top: 8, right: 8,
                    width: 6, height: 6, borderRadius: '50%',
                    background: '#2ec4b6',
                  }} />
                )}

                <div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: isToday ? '#1a9e92' : 'var(--text-primary)', lineHeight: 1.1 }}>
                    {dayName}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 1 }}>{dayNum}</div>
                </div>

                {weekInCycle && (
                  <span className="badge" style={{
                    width: 'fit-content',
                    background: 'var(--accent-subtle)',
                    color: 'var(--accent-dark)',
                    border: '1px solid var(--accent-border)',
                    fontSize: '9px',
                  }}>
                    W{weekInCycle}
                  </span>
                )}

                {avail ? (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                      <span className="mono" style={{ fontSize: '11px', fontWeight: 700, color: fillClr }}>{free} free</span>
                      <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>{pct}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${pct}%`, background: fillGrad }} />
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>—</div>
                )}

                {selectedEmployee && (
                  <div style={{ marginTop: 'auto' }}>
                    {myBooking ? (
                      <span className="badge" style={{
                        background: 'var(--peach-bg)', color: '#c45a35', border: '1px solid var(--peach-border)',
                        fontSize: '10px',
                      }}>
                        ★ #{myBooking.seat_id}
                      </span>
                    ) : designated ? (
                      <span className="badge" style={{
                        background: 'var(--green-bg)', color: 'var(--green)', border: '1px solid var(--green-border)',
                        fontSize: '10px',
                      }}>
                        ✓ In Office
                      </span>
                    ) : (
                      <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>— WFH</span>
                    )}
                  </div>
                )}

                {dayBookings.length > 0 && (
                  <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
                    {dayBookings.length} booking{dayBookings.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Daily Booking Details ──────────────────────────── */}
      {!loading && weekDates.some(d => (bookingsMap[d] || []).length > 0) && (
        <div style={{ marginTop: 22 }}>
          <div className="divider" />
          <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
            Daily Booking Details
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
            {weekDates.map(date => {
              const dayBookings = bookingsMap[date] || [];
              if (dayBookings.length === 0) return (
                <div key={date} style={{ fontSize: '11px', textAlign: 'center', padding: '8px 0', color: 'var(--text-dim)' }}>
                  No bookings
                </div>
              );
              return (
                <div key={date} style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 180, overflowY: 'auto' }}>
                  {dayBookings.map(b => (
                    <div
                      key={b.id}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4,
                        background: selectedEmployee && b.employee_id === selectedEmployee.id
                          ? 'rgba(244,132,95,0.07)'
                          : 'rgba(0,0,0,0.02)',
                        border: `1px solid ${
                          selectedEmployee && b.employee_id === selectedEmployee.id
                            ? 'rgba(244,132,95,0.22)' : 'var(--border)'
                        }`,
                        borderRadius: 7,
                        padding: '5px 8px',
                        fontSize: '11px',
                      }}
                    >
                      <span className="mono" style={{ fontWeight: 700, color: '#f4845f', fontSize: '10px' }}>
                        #{b.seat_id}
                      </span>
                      <span style={{
                        color: 'var(--text-secondary)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 60,
                        fontSize: '10px',
                      }}>
                        {b.employee_name?.split(' ')[0]}
                      </span>
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
