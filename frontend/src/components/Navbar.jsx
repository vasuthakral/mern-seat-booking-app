export default function Navbar({
  employees,
  selectedEmployee,
  onSelectEmployee,
  weekInfo,
  selectedDate,
  onDateChange,
  isDesignatedDay,
}) {
  const today = new Date().toISOString().split('T')[0];
  const oneYearFromNow = new Date();
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
  const maxDate = oneYearFromNow.toISOString().split('T')[0];

  const squads = {};
  employees.forEach(emp => {
    const key = emp.squad_name;
    if (!squads[key]) squads[key] = [];
    squads[key].push(emp);
  });

  const isWeekend = weekInfo?.is_weekend;
  const isHoliday = weekInfo?.is_holiday;
  const holidayName = weekInfo?.holiday_name;

  const weekBadge = isHoliday
    ? { label: holidayName || 'Holiday', bg: 'rgba(244,132,95,0.12)', color: '#f4845f', border: 'rgba(244,132,95,0.3)', dot: '#f4845f' }
    : isWeekend
      ? { label: 'Weekend', bg: 'rgba(217,119,6,0.12)', color: '#d97706', border: 'rgba(217,119,6,0.28)', dot: '#d97706' }
      : weekInfo
        ? { label: `Week ${weekInfo.week_in_cycle}`, bg: 'rgba(46,196,182,0.12)', color: '#1a9e92', border: 'rgba(46,196,182,0.3)', dot: '#2ec4b6' }
        : null;

  const designatedBadge = selectedEmployee && weekInfo && !isWeekend && !isHoliday
    ? isDesignatedDay
      ? { label: 'Office Day', bg: 'rgba(42,157,92,0.1)', color: '#2a9d5c', border: 'rgba(42,157,92,0.28)', dot: '#2a9d5c' }
      : { label: 'WFH Day',   bg: 'rgba(217,119,6,0.1)', color: '#d97706', border: 'rgba(217,119,6,0.28)', dot: '#d97706' }
    : null;

  const initials = selectedEmployee
    ? selectedEmployee.name.split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase()
    : '';

  return (
    /* Outer wrapper — provides the top gap so the pill floats */
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        padding: '14px 24px 10px',          /* top gap above pill, bottom gap below */
        background: 'transparent',
        pointerEvents: 'none',              /* let clicks pass through the gap area */
      }}
    >
      {/* ── The Dynamic Island pill ─────────────────────────── */}
      <div
        style={{
          pointerEvents: 'auto',
          maxWidth: 1280,
          margin: '0 auto',
          height: 72,                        /* taller than before */
          borderRadius: 9999,               /* full pill */
          padding: '0 28px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,

          /* Glassmorphism */
          background: 'rgba(255,255,255,0.72)',
          backdropFilter: 'blur(28px) saturate(180%)',
          WebkitBackdropFilter: 'blur(28px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.85)',
          boxShadow:
            '0 4px 32px rgba(0,0,0,0.10), 0 1px 0 rgba(255,255,255,0.9) inset, 0 -1px 0 rgba(0,0,0,0.04) inset',
        }}
      >

        {/* ── Brand ─────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 'auto', flexShrink: 0 }}>
          <div style={{
            width: 42, height: 42,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #2ec4b6 0%, #1a9e92 100%)',
            boxShadow: '0 2px 14px rgba(46,196,182,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'float 4s ease-in-out infinite',
            flexShrink: 0,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="7" height="7" rx="2" fill="white" fillOpacity="0.95"/>
              <rect x="14" y="3" width="7" height="7" rx="2" fill="white" fillOpacity="0.7"/>
              <rect x="3" y="14" width="7" height="7" rx="2" fill="white" fillOpacity="0.7"/>
              <rect x="14" y="14" width="7" height="7" rx="2" fill="white" fillOpacity="0.45"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)', lineHeight: 1.1 }}>
              SeatBook
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 1 }}>
              Office Manager
            </div>
          </div>
        </div>

        {/* ── Status Badges ─────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {weekBadge && (
            <span className="badge" style={{
              background: weekBadge.bg,
              color: weekBadge.color,
              border: `1px solid ${weekBadge.border}`,
              padding: '5px 11px',
              fontSize: '11px',
            }}>
              <span className="glow-dot" style={{ background: weekBadge.dot }} />
              {weekBadge.label}
            </span>
          )}
          {designatedBadge && (
            <span className="badge" style={{
              background: designatedBadge.bg,
              color: designatedBadge.color,
              border: `1px solid ${designatedBadge.border}`,
              padding: '5px 11px',
              fontSize: '11px',
            }}>
              <span className="glow-dot" style={{ background: designatedBadge.dot }} />
              {designatedBadge.label}
            </span>
          )}
        </div>

        {/* ── Separator ─────────────────────────────────────── */}
        <div style={{ width: 1, height: 36, background: 'rgba(0,0,0,0.1)', flexShrink: 0 }} />

        {/* ── Date picker ───────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <label style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Date
          </label>
          <input
            id="date-picker"
            type="date"
            value={selectedDate}
            min={today}
            max={maxDate}
            onChange={e => onDateChange(e.target.value)}
            className="input"
            style={{
              width: 152, height: 36, padding: '0 10px', fontSize: '13px',
              background: 'rgba(255,255,255,0.6)',
              border: '1px solid rgba(0,0,0,0.12)',
              borderRadius: 10,
            }}
          />
        </div>

        {/* ── Employee selector ─────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <label htmlFor="employee-select" style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Employee
          </label>
          <select
            id="employee-select"
            value={selectedEmployee?.id || ''}
            onChange={e => {
              const emp = employees.find(x => x.id === parseInt(e.target.value));
              onSelectEmployee(emp || null);
            }}
            className="input"
            style={{
              width: 224, height: 36, padding: '0 30px 0 10px', fontSize: '13px',
              background: 'rgba(255,255,255,0.6)',
              border: '1px solid rgba(0,0,0,0.12)',
              borderRadius: 10,
            }}
          >
            <option value="">— Select employee —</option>
            {Object.entries(squads).map(([squadName, members]) => (
              <optgroup key={squadName} label={`Squad ${squadName}`}>
                {members.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} · B{emp.batch}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* ── Employee chip ─────────────────────────────────── */}
        {selectedEmployee && (
          <div
            className="flex items-center gap-2.5 fade-in"
            style={{
              background: 'rgba(46,196,182,0.09)',
              border: '1px solid rgba(46,196,182,0.25)',
              borderRadius: 9999,
              padding: '6px 14px 6px 6px',
              flexShrink: 0,
            }}
          >
            <div style={{
              width: 32, height: 32,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #2ec4b6, #1a9e92)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 11, color: 'white',
              flexShrink: 0,
            }}>
              {initials}
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                {selectedEmployee.name}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: 1.2 }}>
                Squad {selectedEmployee.squad_name} · Batch {selectedEmployee.batch}
              </div>
            </div>
          </div>
        )}

      </div>
    </header>
  );
}
