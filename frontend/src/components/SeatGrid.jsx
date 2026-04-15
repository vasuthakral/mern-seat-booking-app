import SeatCard from './SeatCard';
import Legend from './Legend';

export default function SeatGrid({
  seats,
  bookings,
  selectedEmployee,
  selectedSeat,
  onSeatClick,
  canBook,
  isDesignatedDay,
  selectedDate,
  weekInfo,
}) {
  const bookingBySeat = {};
  bookings.forEach(b => { bookingBySeat[b.seat_id] = b; });

  const myBooking    = bookings.find(b => selectedEmployee && b.employee_id === selectedEmployee.id);
  const isWeekend    = weekInfo?.is_weekend;
  const isHoliday    = weekInfo?.is_holiday;
  const holidayName  = weekInfo?.holiday_name;
  const totalBooked  = bookings.length;
  const totalBlocked = seats.filter(s => s.is_blocked).length;
  const totalFree    = 50 - totalBooked - totalBlocked;
  const occupancyPct = Math.round((totalBooked / 50) * 100);

  const rows = [0, 1, 2, 3, 4];

  const dateLabel = selectedDate
    ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
      })
    : '';

  const occupancyColor =
    occupancyPct > 80 ? '#e05252' :
    occupancyPct > 50 ? '#d97706' :
    '#2a9d5c';

  const occupancyGrad =
    occupancyPct > 80 ? 'linear-gradient(90deg,#e05252,#c43c3c)' :
    occupancyPct > 50 ? 'linear-gradient(90deg,#d97706,#b45309)' :
    'linear-gradient(90deg,#2a9d5c,#1e7a48)';

  return (
    <div className="card no-hover fade-in" style={{ padding: '22px 20px' }}>

      {/* ── Header ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div className="section-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2ec4b6" strokeWidth="2.2" strokeLinecap="round">
                <rect x="3" y="3" width="7" height="7" rx="1.5"/>
                <rect x="14" y="3" width="7" height="7" rx="1.5"/>
                <rect x="3" y="14" width="7" height="7" rx="1.5"/>
                <rect x="14" y="14" width="7" height="7" rx="1.5"/>
              </svg>
            </div>
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                Seat Map
              </h2>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 2 }}>{dateLabel}</p>
            </div>
            {weekInfo && (
              <span className="badge" style={{
                background: 'var(--accent-subtle)',
                color: 'var(--accent-dark)',
                border: '1px solid var(--accent-border)',
                marginLeft: 4,
              }}>
                W{weekInfo.week_in_cycle}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
          <StatPill value={totalFree}    label="Free"    color="var(--green)" bg="var(--green-bg)" border="var(--green-border)" />
          <StatPill value={totalBooked}  label="Booked"  color="var(--red)"   bg="var(--red-bg)"   border="var(--red-border)" />
          {totalBlocked > 0 && (
            <StatPill value={totalBlocked} label="Blocked" color="#6b7280" bg="var(--slate-bg)" border="var(--slate-border)" />
          )}
        </div>
      </div>

      {/* ── Occupancy bar ──────────────────────────────────── */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Office Occupancy
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="mono" style={{ fontSize: '12px', fontWeight: 700, color: occupancyColor }}>
              {occupancyPct}%
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
              {totalBooked}/50 seats
            </span>
          </div>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${occupancyPct}%`, background: occupancyGrad }} />
        </div>
      </div>

      {/* ── Legend ─────────────────────────────────────────── */}
      <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
        <Legend />
      </div>

      {/* ── Status banners ─────────────────────────────────── */}
      {isHoliday && (
        <div className="alert" style={{
          marginBottom: 14,
          background: 'linear-gradient(135deg, rgba(244,132,95,0.08) 0%, rgba(244,132,95,0.04) 100%)',
          border: '1.5px solid rgba(244,132,95,0.3)',
          color: '#c45a35',
        }}>
          <span style={{ fontSize: '20px' }}>🎉</span>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 2 }}>{holidayName}</div>
            <div style={{ fontSize: '12px', opacity: 0.85 }}>It's a public holiday! Office is closed. Enjoy your day off! 🌟</div>
          </div>
        </div>
      )}
      {isWeekend && !isHoliday && (
        <div className="alert alert-warning" style={{ marginBottom: 14 }}>
          <span>🚫</span>
          <span>Weekend — bookings are not allowed on Saturday or Sunday.</span>
        </div>
      )}
      {!isWeekend && !isHoliday && !selectedEmployee && (
        <div className="alert alert-info" style={{ marginBottom: 14 }}>
          <span>👤</span>
          <span>Select an employee from the top bar to start booking seats.</span>
        </div>
      )}
      {!isWeekend && !isHoliday && selectedEmployee && !myBooking && (
        <div className={`alert ${isDesignatedDay ? 'alert-success' : 'alert-warning'}`} style={{ marginBottom: 14 }}>
          <span>{isDesignatedDay ? '✓' : '⚡'}</span>
          <span>
            {isDesignatedDay
              ? `${selectedEmployee.name} is scheduled for office today — click any green seat to book.`
              : `Non-designated day for ${selectedEmployee.name}. Only floater seats (41–50) are available.`
            }
          </span>
        </div>
      )}
      {!isWeekend && !isHoliday && selectedEmployee && myBooking && (
        <div className="alert alert-info" style={{ marginBottom: 14 }}>
          <span>★</span>
          <span>
            You have{' '}
            <strong className="mono" style={{ color: 'var(--accent-dark)' }}>Seat #{myBooking.seat_id}</strong>
            {' '}booked for this date.
          </span>
        </div>
      )}

      {/* ── Grid ───────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {rows.map(row => (
          <div key={row}>
            {row === 4 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '10px 0 10px' }}>
                <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, var(--border-medium))' }} />
                <span style={{
                  fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em',
                  color: 'var(--accent-dark)',
                  background: 'rgba(46,196,182,0.08)',
                  border: '1px solid rgba(46,196,182,0.25)',
                  borderRadius: 'var(--r-full)',
                  padding: '3px 12px',
                }}>
                  ✦ FLOATER SEATS 41–50
                </span>
                <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, var(--border-medium), transparent)' }} />
              </div>
            )}
            <div className="seat-grid-wrapper">
              {seats.slice(row * 10, row * 10 + 10).map(seat => (
                <SeatCard
                  key={seat.id}
                  seat={seat}
                  booking={bookingBySeat[seat.id] || null}
                  isMyBooking={!!(myBooking && myBooking.seat_id === seat.id)}
                  isSelected={selectedSeat?.id === seat.id}
                  onClick={onSeatClick}
                  canBook={!!selectedEmployee && !isWeekend}
                  isDesignatedDay={isDesignatedDay}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── Footer ─────────────────────────────────────────── */}
      <div style={{
        marginTop: 16,
        paddingTop: 12,
        borderTop: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '11px',
        color: 'var(--text-dim)',
      }}>
        <span>Rows 1–4 · Regular seats (1–40)</span>
        <span>Row 5 · Floater seats (41–50)</span>
      </div>
    </div>
  );
}

function StatPill({ value, label, color, bg, border }) {
  return (
    <div className="stat-pill" style={{ background: bg, borderColor: border, color }}>
      <span className="mono" style={{ fontWeight: 800, fontSize: '14px' }}>{value}</span>
      <span style={{ opacity: 0.72, fontSize: '11px', fontWeight: 500 }}>{label}</span>
    </div>
  );
}
