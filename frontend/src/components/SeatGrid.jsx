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

  return (
    <div className="card p-5 fade-in" style={{ height: 'fit-content' }}>

      {/* ── Header ───────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a5b4fc" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="3" width="7" height="7" rx="1"/>
                <rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/>
                <rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
            </div>
            <h2 className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>
              Seat Map
            </h2>
            {weekInfo && (
              <span className="badge" style={{ background: 'var(--purple-bg)', color: 'var(--accent-light)', border: '1px solid var(--purple-border)' }}>
                Cycle W{weekInfo.week_in_cycle}
              </span>
            )}
          </div>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{dateLabel}</p>
        </div>

        {/* Stats */}
        <div className="flex gap-2 flex-wrap">
          <StatPill value={totalFree}    label="Free"    color="#22c55e" bg="rgba(34,197,94,0.1)"  border="rgba(34,197,94,0.3)" />
          <StatPill value={totalBooked}  label="Booked"  color="#ef4444" bg="rgba(239,68,68,0.1)"  border="rgba(239,68,68,0.3)" />
          {totalBlocked > 0 && (
            <StatPill value={totalBlocked} label="Blocked" color="#6b7280" bg="rgba(75,85,99,0.15)" border="rgba(75,85,99,0.35)" />
          )}
        </div>
      </div>

      {/* ── Occupancy bar ─────────────────────────────────────── */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Office Occupancy</span>
          <span className="mono text-xs font-bold" style={{ color: occupancyPct > 80 ? '#ef4444' : occupancyPct > 50 ? '#f59e0b' : '#22c55e' }}>
            {occupancyPct}%
          </span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${occupancyPct}%`,
              background: occupancyPct > 80
                ? 'linear-gradient(90deg,#ef4444,#dc2626)'
                : occupancyPct > 50
                  ? 'linear-gradient(90deg,#f59e0b,#d97706)'
                  : 'linear-gradient(90deg,#22c55e,#16a34a)',
            }}
          />
        </div>
      </div>

      {/* ── Legend ───────────────────────────────────────────── */}
      <div className="mb-4 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <Legend />
      </div>

      {/* ── Status banners ───────────────────────────────────── */}
      {isWeekend && (
        <div className="alert alert-warning mb-4">
          <span>🚫</span>
          <span>Weekend — bookings are not allowed on Saturday or Sunday.</span>
        </div>
      )}
      {!isWeekend && !selectedEmployee && (
        <div className="alert alert-info mb-4">
          <span style={{ fontSize: 15 }}>👤</span>
          <span>Select an employee from the dropdown above to start booking.</span>
        </div>
      )}
      {!isWeekend && selectedEmployee && !myBooking && (
        <div className={`alert mb-4 ${isDesignatedDay ? 'alert-success' : 'alert-warning'}`}>
          <span>{isDesignatedDay ? '✓' : '⚡'}</span>
          <span>
            {isDesignatedDay
              ? `${selectedEmployee.name} is scheduled for office today. Click any green seat.`
              : `Non-designated day for ${selectedEmployee.name}. Only floater seats (41–50) are available.`
            }
          </span>
        </div>
      )}
      {!isWeekend && selectedEmployee && myBooking && (
        <div className="alert alert-info mb-4">
          <span>★</span>
          <span>You have <strong className="mono" style={{ color: 'var(--accent-light)' }}>Seat #{myBooking.seat_id}</strong> booked for this date.</span>
        </div>
      )}

      {/* ── Grid ─────────────────────────────────────────────── */}
      <div className="space-y-2">
        {rows.map(row => (
          <div key={row}>
            {row === 4 && (
              <div className="flex items-center gap-3 my-3.5">
                <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--border))' }} />
                <span
                  className="text-xs font-semibold px-3 py-1 rounded-full"
                  style={{ color: '#93c5fd', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', boxShadow: '0 0 12px rgba(59,130,246,0.1)' }}
                >
                  ✦ Floater Seats 41–50
                </span>
                <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, var(--border), transparent)' }} />
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

      {/* ── Footer note ───────────────────────────────────────── */}
      <div className="mt-4 flex justify-between text-xs pt-3" style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--border)' }}>
        <span>Rows 1–4 · Regular seats (1–40)</span>
        <span>Row 5 · Floater seats (41–50)</span>
      </div>
    </div>
  );
}

function StatPill({ value, label, color, bg, border }) {
  return (
    <div
      className="stat-pill"
      style={{ background: bg, borderColor: border, color }}
    >
      <span className="mono font-bold text-sm">{value}</span>
      <span style={{ opacity: 0.75, fontSize: 11 }}>{label}</span>
    </div>
  );
}
