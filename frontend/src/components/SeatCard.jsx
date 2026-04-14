export default function SeatCard({ seat, booking, isMyBooking, isSelected, onClick, canBook, isDesignatedDay }) {
  const isBooked  = !!booking && !isMyBooking;
  const isFloater = seat.is_floater;
  const isBlocked = seat.is_blocked;

  const isAvailableForClick = !isBlocked && !isBooked;
  const canClickSeat = isMyBooking || (
    isAvailableForClick && (isDesignatedDay || isFloater)
  );
  const isTrulyClickable = !!canBook && canClickSeat;

  // Color schemes — light mode, elegant
  let scheme;

  if (isMyBooking) {
    scheme = {
      bg:     'linear-gradient(135deg, rgba(244,132,95,0.18) 0%, rgba(244,132,95,0.08) 100%)',
      border: '#f4845f',
      text:   '#c45a35',
      icon:   '★',
      iconColor: '#f4845f',
    };
  } else if (isBlocked) {
    scheme = {
      bg:     '#f4f2ef',
      border: 'rgba(0,0,0,0.1)',
      text:   '#c0bec8',
      icon:   '✕',
      iconColor: '#d0cdd8',
    };
  } else if (isBooked) {
    scheme = {
      bg:     'linear-gradient(135deg, rgba(224,82,82,0.1) 0%, rgba(224,82,82,0.05) 100%)',
      border: 'rgba(224,82,82,0.35)',
      text:   '#c04040',
      icon:   null,
      iconColor: null,
    };
  } else if (isFloater) {
    scheme = {
      bg:     'linear-gradient(135deg, rgba(46,196,182,0.12) 0%, rgba(46,196,182,0.05) 100%)',
      border: 'rgba(46,196,182,0.38)',
      text:   '#1a9e92',
      icon:   'F',
      iconColor: '#2ec4b6',
    };
  } else {
    scheme = {
      bg:     'linear-gradient(135deg, rgba(42,157,92,0.1) 0%, rgba(42,157,92,0.04) 100%)',
      border: 'rgba(42,157,92,0.32)',
      text:   '#1e7a48',
      icon:   null,
      iconColor: null,
    };
  }

  if (isSelected) {
    scheme = {
      ...scheme,
      bg:     'linear-gradient(135deg, rgba(244,132,95,0.22) 0%, rgba(244,132,95,0.12) 100%)',
      border: '#f4845f',
    };
  }

  const tooltip =
    isMyBooking ? `Your booking — ${booking?.employee_name}` :
    isBlocked   ? 'Blocked — not available' :
    isBooked    ? `Taken by ${booking?.employee_name}` :
    isFloater   ? 'Floater seat — available any day' :
                  'Available — click to select';

  return (
    <button
      title={tooltip}
      aria-label={`Seat ${seat.id}: ${tooltip}`}
      onClick={() => isTrulyClickable && onClick(seat)}
      disabled={!isTrulyClickable && !isBlocked && !isBooked}
      className={`seat-btn ${isTrulyClickable ? 'clickable' : ''}`}
      style={{
        background:   scheme.bg,
        border:       `1.5px solid ${scheme.border}`,
        borderRadius: 12,
        boxShadow:    isSelected
          ? `0 0 0 2px rgba(244,132,95,0.25), 0 4px 16px rgba(244,132,95,0.2)`
          : `0 1px 4px rgba(0,0,0,0.07)`,
        aspectRatio:  '1',
        minHeight:    44,
        cursor:       isTrulyClickable ? 'pointer' : isBlocked || isBooked ? 'not-allowed' : 'default',
        outline:      'none',
        padding:      0,
        display:      'flex',
        flexDirection: 'column',
        alignItems:   'center',
        justifyContent: 'center',
        position:     'relative',
        overflow:     'hidden',
        userSelect:   'none',
        transform:    isSelected ? 'scale(1.12)' : undefined,
        zIndex:       isSelected ? 10 : undefined,
        transition:   'transform 0.18s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.18s ease, border-color 0.18s ease',
      }}
      onMouseEnter={e => {
        if (isTrulyClickable && !isSelected) {
          e.currentTarget.style.transform = 'scale(1.08)';
          e.currentTarget.style.zIndex = '5';
          e.currentTarget.style.boxShadow = `0 4px 14px rgba(0,0,0,0.1), 0 0 0 1.5px ${scheme.border}`;
        }
      }}
      onMouseLeave={e => {
        if (isTrulyClickable && !isSelected) {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.zIndex = '';
          e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.07)';
        }
      }}
    >
      <span
        className="mono"
        style={{ fontSize: '10.5px', fontWeight: 700, color: scheme.text, lineHeight: 1, letterSpacing: '-0.02em' }}
      >
        {seat.id}
      </span>
      {scheme.icon && (
        <span style={{
          fontSize: '7px',
          color: scheme.iconColor || scheme.text,
          marginTop: '2px',
          opacity: isBlocked ? 0.4 : 0.85,
          fontWeight: 700,
        }}>
          {scheme.icon}
        </span>
      )}
    </button>
  );
}
