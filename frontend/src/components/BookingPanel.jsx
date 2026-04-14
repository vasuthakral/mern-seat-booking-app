import { useState } from 'react';
import { api } from '../api';
import { showToast } from './Toast';

export default function BookingPanel({
  selectedEmployee,
  selectedSeat,
  selectedDate,
  bookings,
  myBookings,
  availability,
  weekInfo,
  onBooked,
  onCancelled,
  onSeatClear,
  canBook,
  isDesignatedDay,
}) {
  const [bookLoading,   setBookLoading]   = useState(false);
  const [blockLoading,  setBlockLoading]  = useState(false);
  const [cancelLoading, setCancelLoading] = useState(null);

  const myTodayBooking      = bookings.find(b => selectedEmployee && b.employee_id === selectedEmployee.id);
  const selectedSeatBooking = selectedSeat ? bookings.find(b => b.seat_id === selectedSeat.id) : null;
  const isMySelectedSeat    = !!(myTodayBooking && selectedSeat && myTodayBooking.seat_id === selectedSeat.id);

  async function handleBook() {
    if (!selectedEmployee || !selectedSeat || !selectedDate) return;
    if (!isDesignatedDay && !selectedSeat.is_floater) {
      showToast('Only floater seats (41–50) on non-designated days.', 'warning');
      return;
    }
    if (selectedSeat.is_blocked) {
      showToast('This seat is blocked and cannot be booked.', 'error');
      return;
    }
    setBookLoading(true);
    try {
      await api.book({ employee_id: selectedEmployee.id, seat_id: selectedSeat.id, date: selectedDate });
      showToast(`Seat #${selectedSeat.id} booked! 🎉`, 'success');
      onBooked(); onSeatClear();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setBookLoading(false);
    }
  }

  async function handleCancel(bookingId) {
    if (!selectedEmployee) return;
    setCancelLoading(bookingId);
    try {
      await api.cancelBooking(bookingId, selectedEmployee.id);
      showToast('Booking cancelled.', 'info');
      onCancelled();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setCancelLoading(null);
    }
  }

  async function handleBlock(seatId, currentlyBlocked) {
    setBlockLoading(true);
    try {
      await api.toggleBlock(seatId, !currentlyBlocked);
      showToast(currentlyBlocked ? 'Seat unblocked.' : 'Seat blocked for next working day.', 'info');
      onBooked();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setBlockLoading(false);
    }
  }

  const fmt = (dateStr) =>
    new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  const seatIsBookableByThisUser =
    selectedSeat &&
    !selectedSeat.is_blocked &&
    !selectedSeatBooking &&
    !myTodayBooking &&
    !weekInfo?.is_weekend &&
    selectedEmployee &&
    (isDesignatedDay || selectedSeat.is_floater);

  const SectionTitle = ({ icon, children }) => (
    <h3 className="font-bold text-sm mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
      <span
        className="w-6 h-6 rounded-md flex items-center justify-center text-xs"
        style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)' }}
      >
        {icon}
      </span>
      {children}
    </h3>
  );

  return (
    <div className="flex flex-col gap-4">

      {/* ── 1. Book / Seat Info ─────────────────────────────── */}
      <div className="card p-4">
        <SectionTitle icon="⊕">Book a Seat</SectionTitle>

        {!selectedEmployee && (
          <div className="text-center py-4">
            <div className="text-2xl mb-2" style={{ opacity: 0.4 }}>👤</div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Select an employee to get started.
            </p>
          </div>
        )}

        {selectedEmployee && weekInfo?.is_weekend && (
          <div className="alert alert-warning">
            <span>🚫</span>
            <span>Bookings not allowed on weekends.</span>
          </div>
        )}

        {selectedEmployee && !weekInfo?.is_weekend && myTodayBooking && !selectedSeat && (
          <div className="fade-up">
            <div
              className="rounded-xl p-3 mb-3 flex items-center gap-3"
              style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)' }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mono font-bold text-lg shrink-0"
                style={{ background: 'linear-gradient(135deg,rgba(99,102,241,0.3),rgba(79,70,229,0.2))', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.4)' }}
              >
                #{myTodayBooking.seat_id}
              </div>
              <div>
                <div className="text-xs font-medium mb-0.5" style={{ color: 'var(--text-muted)' }}>Your booking for</div>
                <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{fmt(selectedDate)}</div>
              </div>
            </div>
            <button
              className="btn btn-danger w-full"
              onClick={() => handleCancel(myTodayBooking.id)}
              disabled={cancelLoading === myTodayBooking.id}
            >
              {cancelLoading === myTodayBooking.id ? <><span className="spinner" /> Cancelling…</> : '✕ Release My Seat'}
            </button>
          </div>
        )}

        {selectedEmployee && !weekInfo?.is_weekend && !myTodayBooking && !selectedSeat && (
          <div className="text-center py-3">
            <div className="text-xl mb-2" style={{ opacity: 0.35 }}>🗺️</div>
            <p className="text-sm" style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
              {isDesignatedDay
                ? 'Click any green seat on the map to select it.'
                : 'Non-designated day. Only floater seats (41–50) available.'
              }
            </p>
          </div>
        )}

        {selectedEmployee && selectedSeat && (
          <div className="fade-up space-y-3">
            {/* Seat info */}
            <div
              className="rounded-xl p-4"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Selected Seat</div>
                <button
                  onClick={onSeatClear}
                  className="text-xs transition-colors hover:text-white"
                  style={{ color: 'var(--text-muted)' }}
                >
                  ✕ clear
                </button>
              </div>
              <div className="mono font-black" style={{ fontSize: 38, lineHeight: 1, color: '#a5b4fc', textShadow: '0 0 30px rgba(99,102,241,0.4)' }}>
                #{selectedSeat.id}
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {selectedSeat.is_floater && (
                  <span className="badge" style={{ background: 'var(--blue-bg)', color: '#93c5fd', border: '1px solid var(--blue-border)' }}>
                    Floater
                  </span>
                )}
                {selectedSeat.is_blocked && (
                  <span className="badge" style={{ background: 'var(--gray-bg)', color: '#9ca3af', border: '1px solid var(--gray-border)' }}>
                    Blocked
                  </span>
                )}
                {isMySelectedSeat && (
                  <span className="badge" style={{ background: 'var(--purple-bg)', color: 'var(--accent-light)', border: '1px solid var(--purple-border)' }}>
                    ★ Your Booking
                  </span>
                )}
                {selectedSeatBooking && !isMySelectedSeat && (
                  <span className="badge" style={{ background: 'var(--red-bg)', color: '#fca5a5', border: '1px solid var(--red-border)' }}>
                    Taken — {selectedSeatBooking.employee_name}
                  </span>
                )}
                {!selectedSeatBooking && !selectedSeat.is_blocked && (
                  <span className="badge" style={{ background: 'var(--green-bg)', color: '#86efac', border: '1px solid var(--green-border)' }}>
                    ✓ Available
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            {isMySelectedSeat && (
              <button
                className="btn btn-danger w-full"
                onClick={() => handleCancel(myTodayBooking.id)}
                disabled={cancelLoading === myTodayBooking.id}
              >
                {cancelLoading === myTodayBooking.id ? <><span className="spinner" /> Cancelling…</> : '✕ Release My Seat'}
              </button>
            )}

            {seatIsBookableByThisUser && (
              <button
                className="btn btn-primary w-full"
                onClick={handleBook}
                disabled={bookLoading}
                style={{ padding: '11px 18px', fontSize: 14 }}
              >
                {bookLoading ? <><span className="spinner" /> Booking…</> : `Book Seat #${selectedSeat.id}`}
              </button>
            )}

            {selectedSeatBooking && !isMySelectedSeat && (
              <div className="alert alert-error">
                <span>✕</span>
                <span>Taken by {selectedSeatBooking.employee_name}.</span>
              </div>
            )}

            {!isDesignatedDay && !selectedSeat.is_floater && !selectedSeatBooking && !selectedSeat.is_blocked && (
              <div className="alert alert-warning">
                <span>⚡</span>
                <span>Regular seats unavailable on non-designated days. Use floater seats 41–50.</span>
              </div>
            )}

            {/* Block / Unblock */}
            <div className="pt-1">
              <button
                className="btn btn-warning w-full"
                onClick={() => handleBlock(selectedSeat.id, selectedSeat.is_blocked)}
                disabled={blockLoading}
              >
                {blockLoading
                  ? <><span className="spinner" /> Processing…</>
                  : selectedSeat.is_blocked
                    ? '🔓 Unblock Seat'
                    : '🔒 Block Seat'
                }
              </button>
              <p className="text-xs mt-1.5 text-center" style={{ color: 'var(--text-muted)' }}>
                Blocking only allowed after 3:00 PM
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── 2. My Upcoming Bookings ─────────────────────────── */}
      {selectedEmployee && (
        <div className="card p-4">
          <SectionTitle icon="📅">My Bookings</SectionTitle>
          {myBookings.length === 0 ? (
            <div className="text-center py-3">
              <div className="text-xl mb-1.5" style={{ opacity: 0.3 }}>📭</div>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No upcoming bookings</p>
            </div>
          ) : (
            <div className="space-y-2">
              {myBookings.map(b => (
                <div
                  key={b.id}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center mono font-bold text-xs shrink-0"
                      style={{ background: 'rgba(99,102,241,0.12)', color: 'var(--accent-light)', border: '1px solid rgba(99,102,241,0.2)' }}
                    >
                      #{b.seat_id}
                    </div>
                    <div>
                      <div className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                        Seat {b.seat_id}
                        {b.is_floater && (
                          <span className="ml-1.5 badge" style={{ background: 'var(--blue-bg)', color: '#93c5fd', border: '1px solid var(--blue-border)' }}>F</span>
                        )}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{fmt(b.date)}</div>
                    </div>
                  </div>
                  <button
                    className="btn btn-danger"
                    style={{ padding: '4px 10px', fontSize: 11 }}
                    onClick={() => handleCancel(b.id)}
                    disabled={cancelLoading === b.id}
                  >
                    {cancelLoading === b.id ? <span className="spinner" style={{ width: 11, height: 11 }} /> : 'Cancel'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── 3. Upcoming Availability ────────────────────────── */}
      {availability.length > 0 && (
        <div className="card p-4">
          <SectionTitle icon="🔮">Upcoming Availability</SectionTitle>
          <div className="space-y-3">
            {availability.map(a => {
              const pct     = Math.round((a.booked / 50) * 100);
              const fillClr = pct > 80 ? '#ef4444' : pct > 50 ? '#f59e0b' : '#22c55e';
              const fillBg  = pct > 80
                ? 'linear-gradient(90deg,#ef4444,#dc2626)'
                : pct > 50
                  ? 'linear-gradient(90deg,#f59e0b,#d97706)'
                  : 'linear-gradient(90deg,#22c55e,#16a34a)';
              return (
                <div
                  key={a.date}
                  className="rounded-xl p-3"
                  style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {fmt(a.date)}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="mono text-xs font-bold" style={{ color: fillClr }}>{a.available}</span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>/ 50 free</span>
                    </div>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct}%`, background: fillBg }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
