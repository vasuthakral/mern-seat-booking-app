export default function Legend() {
  const items = [
    { color: '#2a9d5c', bg: 'rgba(42,157,92,0.1)',   border: 'rgba(42,157,92,0.3)',   label: 'Available' },
    { color: '#e05252', bg: 'rgba(224,82,82,0.09)',  border: 'rgba(224,82,82,0.28)',  label: 'Booked'    },
    { color: '#1a9e92', bg: 'rgba(46,196,182,0.1)',  border: 'rgba(46,196,182,0.3)',  label: 'Floater'   },
    { color: '#9ca3af', bg: 'rgba(156,163,175,0.12)',border: 'rgba(156,163,175,0.28)',label: 'Blocked'   },
    { color: '#f4845f', bg: 'rgba(244,132,95,0.12)', border: 'rgba(244,132,95,0.32)', label: 'Your Seat' },
  ];

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', alignItems: 'center' }}>
      {items.map(({ color, bg, border, label }) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{
            width: 13, height: 13, borderRadius: 4, flexShrink: 0,
            background: bg,
            border: `1.5px solid ${border}`,
          }} />
          <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', fontWeight: 500 }}>
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
