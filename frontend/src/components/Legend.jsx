/**
 * Legend — compact color key for the seat map
 */
export default function Legend() {
  const items = [
    { color: '#22c55e', bg: 'rgba(34,197,94,0.13)',   label: 'Available'  },
    { color: '#ef4444', bg: 'rgba(239,68,68,0.13)',   label: 'Booked'     },
    { color: '#3b82f6', bg: 'rgba(59,130,246,0.13)',  label: 'Floater'    },
    { color: '#6b7280', bg: 'rgba(75,85,99,0.2)',     label: 'Blocked'    },
    { color: '#6366f1', bg: 'rgba(99,102,241,0.22)',  label: 'Your Seat'  },
  ];

  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1.5 items-center">
      {items.map(({ color, bg, label }) => (
        <div key={label} className="flex items-center gap-1.5">
          <div
            className="w-3.5 h-3.5 rounded-sm shrink-0"
            style={{
              background: bg,
              border: `1.5px solid ${color}`,
              boxShadow: `0 0 6px ${color}40`,
            }}
          />
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
        </div>
      ))}
    </div>
  );
}
