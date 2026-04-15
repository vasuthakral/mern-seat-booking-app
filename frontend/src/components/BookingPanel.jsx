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
  seats,
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
  const isHoliday           = weekInfo?.is_holiday;
  const holidayName         = weekInfo?.holiday_name;

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

  // Helper to check if employee is designated for a specific date
  function isDesignatedForDate(employee, dateStr) {
    if (!employee) return false;
    const d = new Date(dateStr + 'T00:00:00');
    const day = d.getDay();
    if (day === 0 || day === 6) return false; // weekend
    
    const ANCHOR = new Date('2025-01-06T00:00:00');
    const diffDays = Math.floor((d - ANCHOR) / 86_400_000);
    const cycleDay = ((diffDays % 14) + 14) % 14;
    const week = cycleDay < 7 ? 1 : 2;
    const isoDay = day === 0 ? 7 : day;
    
    if (employee.batch === 1) {
      return week === 1 ? isoDay <= 3 : isoDay >= 4 && isoDay <= 5;
    } else {
      return week === 1 ? isoDay >= 4 && isoDay <= 5 : isoDay <= 3;
    }
  }

  const seatIsBookableByThisUser =
    selectedSeat &&
    !selectedSeat.is_blocked &&
    !selectedSeatBooking &&
    !myTodayBooking &&
    !weekInfo?.is_weekend &&
    selectedEmployee &&
    (isDesignatedDay || selectedSeat.is_floater);

  const cardSection = {
    background: '#ffffff',
    border: '1px solid var(--border)',
    borderRadius: 'var(--r-xl)',
    padding: '18px 16px',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-md)',
  };

  const rowCard = (highlighted = false) => ({
    background: highlighted ? 'rgba(244,132,95,0.06)' : 'rgba(0,0,0,0.02)',
    border: `1px solid ${highlighted ? 'rgba(244,132,95,0.22)' : 'var(--border)'}`,
    borderRadius: 'var(--r-md)',
    padding: '10px 12px',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    transition: 'background 0.2s',
  });

  function PanelCard({ icon, title, children }) {
    return (
      <div style={cardSection} className="card no-hover">
        <div style={{
          position: 'absolute', top: 0, left: '15%', right: '15%', height: '2px',
          background: 'linear-gradient(90deg, transparent, rgba(46,196,182,0.3), transparent)',
          pointerEvents: 'none',
        }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
          <div className="section-icon">{icon}</div>
          <h3 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h3>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* ══ 1. Book / Seat Actions ═══════════════════════════ */}
      <PanelCard icon="⊕" title="Book a Seat">

        {!selectedEmployee && (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div style={{
              width: 52, height: 52, margin: '0 auto 12px',
              borderRadius: 16,
              background: 'rgba(46,196,182,0.08)',
              border: '1px solid var(--accent-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24,
            }}>
              👤
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Select an employee from the top bar <br/>to start booking.
            </p>
          </div>
        )}

        {selectedEmployee && weekInfo?.is_weekend && (
          <div className="alert alert-warning">
            <span>🚫</span>
            <span>Bookings not allowed on weekends.</span>
          </div>
        )}

        {selectedEmployee && isHoliday && (
          <div className="alert" style={{
            background: 'linear-gradient(135deg, rgba(244,132,95,0.08) 0%, rgba(244,132,95,0.04) 100%)',
            border: '1.5px solid rgba(244,132,95,0.3)',
            color: '#c45a35',
          }}>
            <span style={{ fontSize: '18px' }}>🎉</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: 3 }}>{holidayName}</div>
              <div style={{ fontSize: '11px', lineHeight: 1.5, opacity: 0.9 }}>
                It's a public holiday! Office is closed today. Relax and enjoy your day! ✨
              </div>
            </div>
          </div>
        )}

        {selectedEmployee && !weekInfo?.is_weekend && !isHoliday && myTodayBooking && !selectedSeat && (
          <div className="fade-up">
            <div style={{ ...rowCard(true), marginBottom: 10 }}>
              <div style={{
                width: 42, height: 42,
                borderRadius: 12,
                background: 'linear-gradient(135deg, rgba(244,132,95,0.18), rgba(244,132,95,0.08))',
                border: '1px solid rgba(244,132,95,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span className="mono" style={{ fontWeight: 800, fontSize: '14px', color: '#f4845f' }}>
                  #{myTodayBooking.seat_id}
                </span>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: 2 }}>Your booking for</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{fmt(selectedDate)}</div>
              </div>
              <span className="badge" style={{
                marginLeft: 'auto',
                background: 'var(--green-bg)', color: 'var(--green)', border: '1px solid var(--green-border)',
              }}>
                ✓ Active
              </span>
            </div>
            <button
              className="btn btn-danger"
              style={{ width: '100%' }}
              onClick={() => handleCancel(myTodayBooking.id)}
              disabled={cancelLoading === myTodayBooking.id}
            >
              {cancelLoading === myTodayBooking.id
                ? <><span className="spinner" /> Cancelling…</>
                : '✕ Release My Seat'
              }
            </button>
          </div>
        )}

        {selectedEmployee && !weekInfo?.is_weekend && !isHoliday && !myTodayBooking && !selectedSeat && (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div style={{
              width: 52, height: 52, margin: '0 auto 12px',
              borderRadius: 16,
              background: isDesignatedDay ? 'rgba(42,157,92,0.07)' : 'rgba(217,119,6,0.07)',
              border: `1px solid ${isDesignatedDay ? 'rgba(42,157,92,0.22)' : 'rgba(217,119,6,0.22)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24,
            }}>
              🗺️
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
              {isDesignatedDay
                ? 'Click any green seat on the map to select it.'
                : 'Non-designated day. Only floater seats (41–50) available.'
              }
            </p>
          </div>
        )}

        {selectedEmployee && selectedSeat && (
          <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

            <div style={{
              background: '#fafaf9',
              border: '1px solid var(--border-medium)',
              borderRadius: 14,
              padding: '14px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Selected Seat
                </span>
                <button
                  onClick={onSeatClear}
                  style={{
                    fontSize: '11px', color: 'var(--text-muted)',
                    background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px',
                    fontFamily: 'Inter, sans-serif',
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
                  onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
                >
                  ✕ clear
                </button>
              </div>

              <div className="mono" style={{
                fontSize: '44px', fontWeight: 900, lineHeight: 1,
                color: '#f4845f',
                marginBottom: 10,
              }}>
                #{selectedSeat.id}
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {selectedSeat.is_floater && (
                  <span className="badge" style={{ background: 'var(--blue-bg)', color: 'var(--accent-dark)', border: '1px solid var(--blue-border)' }}>
                    ◈ Floater
                  </span>
                )}
                {selectedSeat.is_blocked && (
                  <span className="badge" style={{ background: 'var(--slate-bg)', color: '#6b7280', border: '1px solid var(--slate-border)' }}>
                    ⛔ Blocked
                  </span>
                )}
                {isMySelectedSeat && (
                  <span className="badge" style={{ background: 'var(--peach-bg)', color: '#c45a35', border: '1px solid var(--peach-border)' }}>
                    ★ Your Booking
                  </span>
                )}
                {selectedSeatBooking && !isMySelectedSeat && (
                  <span className="badge" style={{ background: 'var(--red-bg)', color: 'var(--red)', border: '1px solid var(--red-border)' }}>
                    ✕ Taken — {selectedSeatBooking.employee_name}
                  </span>
                )}
                {!selectedSeatBooking && !selectedSeat.is_blocked && (
                  <span className="badge" style={{ background: 'var(--green-bg)', color: 'var(--green)', border: '1px solid var(--green-border)' }}>
                    ✓ Available
                  </span>
                )}
              </div>
            </div>

            {isMySelectedSeat && (
              <button
                className="btn btn-danger"
                style={{ width: '100%' }}
                onClick={() => handleCancel(myTodayBooking.id)}
                disabled={cancelLoading === myTodayBooking.id}
              >
                {cancelLoading === myTodayBooking.id ? <><span className="spinner" /> Cancelling…</> : '✕ Release My Seat'}
              </button>
            )}

            {seatIsBookableByThisUser && (
              <button
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px 18px', fontSize: '14px' }}
                onClick={handleBook}
                disabled={bookLoading}
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

            <div style={{ paddingTop: 2 }}>
              <button
                className="btn btn-warning"
                style={{ width: '100%' }}
                onClick={() => handleBlock(selectedSeat.id, selectedSeat.is_blocked)}
                disabled={blockLoading}
              >
                {blockLoading
                  ? <><span className="spinner" /> Processing…</>
                  : selectedSeat.is_blocked ? '🔓 Unblock Seat' : '🔒 Block Seat'
                }
              </button>
              <p style={{ fontSize: '10.5px', textAlign: 'center', marginTop: 5, color: 'var(--text-dim)' }}>
                Blocking only allowed after 3:00 PM
              </p>
            </div>

          </div>
        )}
      </PanelCard>

      {/* ══ 2. My Bookings ══════════════════════════════════ */}
      {selectedEmployee && (
        <PanelCard icon="📅" title="My Bookings">
          {myBookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.25 }}>📭</div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No upcoming bookings</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {myBookings.map(b => (
                <div key={b.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'rgba(0,0,0,0.02)',
                  border: '1px solid var(--border)',
                  borderRadius: 11,
                  padding: '8px 10px',
                  gap: 8,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                      background: 'rgba(244,132,95,0.1)',
                      border: '1px solid rgba(244,132,95,0.22)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span className="mono" style={{ fontSize: '11px', fontWeight: 800, color: '#f4845f' }}>
                        #{b.seat_id}
                      </span>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                        Seat {b.seat_id}
                        {b.is_floater && (
                          <span className="badge" style={{
                            marginLeft: 5,
                            background: 'var(--blue-bg)', color: 'var(--accent-dark)', border: '1px solid var(--blue-border)',
                            fontSize: '9px',
                          }}>
                            F
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{fmt(b.date)}</div>
                    </div>
                  </div>
                  <button
                    className="btn btn-danger"
                    style={{ padding: '5px 10px', fontSize: '11px' }}
                    onClick={() => handleCancel(b.id)}
                    disabled={cancelLoading === b.id}
                  >
                    {cancelLoading === b.id ? <span className="spinner" style={{ width: 10, height: 10 }} /> : 'Cancel'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </PanelCard>
      )}

      {/* ══ 3. Upcoming Availability ════════════════════════ */}
      {availability.length > 0 && seats.length > 0 && (
        <PanelCard icon="📊" title="Upcoming Availability">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {availability.map(a => {
              let totalSeats, available, booked, pct, clr, grad, label;
              
              if (selectedEmployee) {
                const designated = isDesignatedForDate(selectedEmployee, a.date);
                
                if (designated) {
                  // Show regular seats availability (1-40)
                  booked = a.regular_booked || 0;
                  available = a.regular_available || 0;
                  totalSeats = booked + available;
                  label = 'regular';
                } else {
                  // Show floater seats availability (41-50)
                  booked = a.floater_booked || 0;
                  available = a.floater_available || 0;
                  totalSeats = booked + available;
                  label = 'floater';
                }
                
                pct = totalSeats > 0 ? Math.round((booked / totalSeats) * 100) : 0;
              } else {
                // No employee selected - show all seats
                totalSeats = 50;
                booked = a.booked || 0;
                available = a.available;
                pct = Math.round((booked / 50) * 100);
                label = 'total';
              }
              
              clr = pct > 80 ? '#e05252' : pct > 50 ? '#d97706' : '#2a9d5c';
              grad = pct > 80
                ? 'linear-gradient(90deg,#e05252,#c43c3c)'
                : pct > 50
                  ? 'linear-gradient(90deg,#d97706,#b45309)'
                  : 'linear-gradient(90deg,#2a9d5c,#1e7a48)';

              return (
                <div key={a.date} style={{
                  background: 'rgba(0,0,0,0.02)',
                  border: '1px solid var(--border)',
                  borderRadius: 11,
                  padding: '10px 12px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {fmt(a.date)}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span className="mono" style={{ fontSize: '12px', fontWeight: 800, color: clr }}>
                        {available}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>/ {totalSeats} free</span>
                    </div>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct}%`, background: grad }} />
                  </div>
                  {selectedEmployee && label !== 'total' && (
                    <div style={{ fontSize: '9px', color: 'var(--text-dim)', marginTop: 4 }}>
                      {label} seats only
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </PanelCard>
      )}

    </div>
  );
}
