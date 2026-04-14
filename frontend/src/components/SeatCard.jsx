/**
 * SeatCard — Individual seat in the 50-seat grid.
 * Premium look with glow effects and smooth hover states.
 */
export default function SeatCard({ seat, booking, isMyBooking, isSelected, onClick, canBook, isDesignatedDay }) {
  const isBooked  = !!booking && !isMyBooking;
  const isFloater = seat.is_floater;
  const isBlocked = seat.is_blocked;

  // ── Color scheme ──────────────────────────────────────────────
  let bg, border, textColor, glowColor, icon;

  if (isMyBooking) {
    bg        = 'linear-gradient(135deg, rgba(99,102,241,0.28), rgba(79,70,229,0.2))';
    border    = '#6366f1';
    textColor = '#c7d2fe';
    glowColor = 'rgba(99,102,241,0.45)';
    icon      = '★';
  } else if (isBlocked) {
    bg        = 'rgba(30,38,64,0.4)';
    border    = '#1e2640';
    textColor = '#374151';
    glowColor = 'transparent';
    icon      = '✕';
  } else if (isBooked) {
    bg        = 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(220,38,38,0.08))';
    border    = 'rgba(239,68,68,0.5)';
    textColor = '#fca5a5';
    glowColor = 'rgba(239,68,68,0.2)';
    icon      = null;
  } else if (isFloater) {
    bg        = 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(37,99,235,0.08))';
    border    = 'rgba(59,130,246,0.5)';
    textColor = '#93c5fd';
    glowColor = 'rgba(59,130,246,0.2)';
    icon      = 'F';
  } else {
    bg        = 'linear-gradient(135deg, rgba(34,197,94,0.13), rgba(22,163,74,0.07))';
    border    = 'rgba(34,197,94,0.45)';
    textColor = '#86efac';
    glowColor = 'rgba(34,197,94,0.2)';
    icon      = null;
  }

  // Selected overlay
  if (isSelected) {
    bg        = 'linear-gradient(135deg, rgba(99,102,241,0.35), rgba(79,70,229,0.25))';
    border    = '#818cf8';
    glowColor = 'rgba(99,102,241,0.5)';
  }

  // ── Click eligibility ─────────────────────────────────────────
  const isAvailableForClick = !isBlocked && !isBooked;
  const canClickSeat = isMyBooking || (
    isAvailableForClick &&
    (isDesignatedDay || isFloater)
  );
  const isTrulyClickable = !!canBook && canClickSeat;

  // ── Tooltip ───────────────────────────────────────────────────
  let title = '';
  if (isMyBooking)    title = `Your booking — ${booking?.employee_name}`;
  else if (isBlocked) title = 'Blocked for next working day';
  else if (isBooked)  title = `Taken by ${booking?.employee_name}`;
  else if (isFloater) title = 'Floater — available on non-designated days';
  else                title = 'Available — click to book';

  return (
    <button
      title={title}
      aria-label={`Seat ${seat.id}: ${title}`}
      onClick={() => isTrulyClickable && onClick(seat)}
      disabled={!isTrulyClickable && !isBlocked && !isBooked}
      className={`
        relative rounded-xl flex flex-col items-center justify-center
        transition-all duration-200 select-none
        ${isSelected ? 'seat-selected scale-110 z-10' : ''}
        ${isTrulyClickable && !isSelected ? 'hover:scale-110 hover:z-10' : ''}
      `}
      style={{
        background: bg,
        border: `1.5px solid ${border}`,
        boxShadow: isSelected
          ? `0 0 0 2px ${border}40, 0 4px 16px ${glowColor}, inset 0 1px 0 rgba(255,255,255,0.08)`
          : `0 1px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)`,
        aspectRatio: '1',
        minHeight: '44px',
        cursor: isTrulyClickable ? 'pointer' : isBlocked || isBooked ? 'not-allowed' : 'default',
        outline: 'none',
        padding: 0,
      }}
      onMouseEnter={e => {
        if (isTrulyClickable && !isSelected) {
          e.currentTarget.style.boxShadow = `0 4px 16px ${glowColor}, 0 0 0 1px ${border}, inset 0 1px 0 rgba(255,255,255,0.08)`;
        }
      }}
      onMouseLeave={e => {
        if (isTrulyClickable && !isSelected) {
          e.currentTarget.style.boxShadow = `0 1px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)`;
        }
      }}
    >
      {/* Seat number */}
      <span
        className="mono font-bold leading-none"
        style={{ fontSize: '11px', color: textColor }}
      >
        {seat.id}
      </span>

      {/* Status icon */}
      {icon && (
        <span style={{ fontSize: '7px', color: textColor, marginTop: '2px', opacity: isBlocked ? 0.4 : 0.9 }}>
          {icon}
        </span>
      )}
    </button>
  );
}
