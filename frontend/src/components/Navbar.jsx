/**
 * Navbar — premium glassmorphism top bar
 */
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

  // Group employees by squad
  const squads = {};
  employees.forEach(emp => {
    const key = emp.squad_name;
    if (!squads[key]) squads[key] = [];
    squads[key].push(emp);
  });

  const weekBadge = weekInfo?.is_weekend
    ? { label: 'Weekend', bg: 'rgba(245,158,11,0.12)', color: '#fcd34d', border: 'rgba(245,158,11,0.3)', icon: '🚫' }
    : weekInfo
      ? { label: `Week ${weekInfo.week_in_cycle}`, bg: 'rgba(99,102,241,0.12)', color: '#a5b4fc', border: 'rgba(99,102,241,0.3)', icon: '↻' }
      : null;

  const designatedBadge = selectedEmployee && weekInfo && !weekInfo.is_weekend
    ? isDesignatedDay
      ? { label: 'In Office', bg: 'rgba(34,197,94,0.12)', color: '#86efac', border: 'rgba(34,197,94,0.3)', icon: '✓' }
      : { label: 'WFH Day', bg: 'rgba(245,158,11,0.12)', color: '#fcd34d', border: 'rgba(245,158,11,0.3)', icon: '⚡' }
    : null;

  return (
    <header
      className="sticky top-0 z-40 px-5 py-3"
      style={{
        background: 'rgba(6,8,15,0.85)',
        borderBottom: '1px solid rgba(30,38,64,0.8)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        boxShadow: '0 4px 32px rgba(0,0,0,0.4), inset 0 -1px 0 rgba(99,102,241,0.08)',
      }}
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-3">

        {/* Brand */}
        <div className="flex items-center gap-3 mr-auto">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #7c3aed 100%)',
              boxShadow: '0 0 20px rgba(99,102,241,0.5), inset 0 1px 0 rgba(255,255,255,0.2)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="7" height="7" rx="1.5" fill="white" fillOpacity="0.9"/>
              <rect x="14" y="3" width="7" height="7" rx="1.5" fill="white" fillOpacity="0.6"/>
              <rect x="3" y="14" width="7" height="7" rx="1.5" fill="white" fillOpacity="0.6"/>
              <rect x="14" y="14" width="7" height="7" rx="1.5" fill="white" fillOpacity="0.4"/>
            </svg>
          </div>
          <div>
            <div
              className="font-bold text-sm leading-none mb-0.5"
              style={{
                background: 'linear-gradient(135deg, #e8edfb, #a5b4fc)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              SeatBook
            </div>
            <div className="text-xs leading-none" style={{ color: 'var(--text-muted)' }}>
              Office Seat Manager
            </div>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {weekBadge && (
            <span
              className="badge"
              style={{ background: weekBadge.bg, color: weekBadge.color, border: `1px solid ${weekBadge.border}`, boxShadow: `0 0 12px ${weekBadge.border}` }}
            >
              {weekBadge.icon} {weekBadge.label}
            </span>
          )}
          {designatedBadge && (
            <span
              className="badge"
              style={{ background: designatedBadge.bg, color: designatedBadge.color, border: `1px solid ${designatedBadge.border}`, boxShadow: `0 0 12px ${designatedBadge.border}` }}
            >
              {designatedBadge.icon} {designatedBadge.label}
            </span>
          )}
        </div>

        {/* Date picker */}
        <div className="flex flex-col min-w-0">
          <label className="text-xs mb-1 font-medium" style={{ color: 'var(--text-muted)' }}>
            Date
          </label>
          <input
            id="date-picker"
            type="date"
            value={selectedDate}
            min={today}
            onChange={e => onDateChange(e.target.value)}
            className="input"
            style={{ width: 155 }}
          />
        </div>

        {/* Employee selector */}
        <div className="flex flex-col" style={{ minWidth: 210 }}>
          <label htmlFor="employee-select" className="text-xs mb-1 font-medium" style={{ color: 'var(--text-muted)' }}>
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
          >
            <option value="">— Select employee —</option>
            {Object.entries(squads).map(([squadName, members]) => (
              <optgroup key={squadName} label={`Squad ${squadName}`}>
                {members.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} · Batch {emp.batch}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Employee info chip */}
        {selectedEmployee && (
          <div
            className="px-3 py-2 rounded-xl text-xs flex items-center gap-2.5 fade-in"
            style={{
              background: 'rgba(99,102,241,0.08)',
              border: '1px solid rgba(99,102,241,0.25)',
              boxShadow: '0 0 20px rgba(99,102,241,0.06)',
            }}
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0"
              style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', color: 'white' }}
            >
              {selectedEmployee.name.charAt(0)}
            </div>
            <div>
              <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                {selectedEmployee.name}
              </div>
              <div style={{ color: 'var(--text-muted)' }}>
                Squad {selectedEmployee.squad_name} · Batch {selectedEmployee.batch}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
