import { useEffect, useState, useCallback } from 'react';
import { api } from './api';
import Navbar from './components/Navbar';
import SeatGrid from './components/SeatGrid';
import BookingPanel from './components/BookingPanel';
import WeekView from './components/WeekView';
import { ToastContainer, showToast } from './components/Toast';

// ─── Helpers (mirrors backend logic exactly) ────────────────────────────────

const ANCHOR = new Date('2025-01-06T00:00:00'); // Known Week-1 Monday

function getWeekInCycle(dateStr) {
  const d       = new Date(dateStr + 'T00:00:00');
  const diffDays = Math.floor((d - ANCHOR) / 86_400_000);
  const cycleDay = ((diffDays % 14) + 14) % 14;
  return cycleDay < 7 ? 1 : 2;
}

function isWeekend(dateStr) {
  const d = new Date(dateStr + 'T00:00:00').getDay();
  return d === 0 || d === 6;
}

function isDesignatedDay(employee, dateStr) {
  if (!employee || isWeekend(dateStr)) return false;
  const week   = getWeekInCycle(dateStr);
  const d      = new Date(dateStr + 'T00:00:00');
  const isoDay = d.getDay() === 0 ? 7 : d.getDay(); // 1=Mon…7=Sun
  if (employee.batch === 1) {
    return week === 1 ? isoDay <= 3 : isoDay >= 4 && isoDay <= 5;
  } else {
    return week === 1 ? isoDay >= 4 && isoDay <= 5 : isoDay <= 3;
  }
}

// ─── App ────────────────────────────────────────────────────────────────────

export default function App() {
  const today = new Date().toISOString().split('T')[0];

  const [employees,        setEmployees]        = useState([]);
  const [seats,            setSeats]            = useState([]);
  const [bookings,         setBookings]         = useState([]);
  const [myBookings,       setMyBookings]       = useState([]);
  const [availability,     setAvailability]     = useState([]);
  const [weekInfo,         setWeekInfo]         = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedSeat,     setSelectedSeat]     = useState(null);
  const [selectedDate,     setSelectedDate]     = useState(today);
  const [activeTab,        setActiveTab]        = useState('grid');
  const [loadingInit,      setLoadingInit]      = useState(true);

  // ── Bootstrap ──────────────────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      api.getEmployees(),
      api.getSeats(),
    ])
      .then(([emps, s]) => { setEmployees(emps); setSeats(s); })
      .catch(err => showToast('Failed to connect to server: ' + err.message, 'error'))
      .finally(() => setLoadingInit(false));
  }, []);

  // ── Refresh bookings/seats/weekInfo on date change ─────────────────────────
  const refresh = useCallback(() => {
    if (!selectedDate) return;
    api.getBookings(selectedDate).then(setBookings).catch(console.error);
    api.getWeekInfo(selectedDate).then(setWeekInfo).catch(console.error);
    api.getSeats().then(setSeats).catch(console.error);
  }, [selectedDate]);

  useEffect(() => { refresh(); }, [refresh]);

  // ── Next 3 working days availability ──────────────────────────────────────
  useEffect(() => {
    api.getWeekInfo(today)
      .then(info => api.getAvailability(info.next_working_days))
      .then(setAvailability)
      .catch(console.error);
  }, [today]);

  // ── My bookings when employee changes ────────────────────────────────────
  const refreshMyBookings = useCallback(() => {
    if (selectedEmployee) {
      api.getMyBookings(selectedEmployee.id).then(setMyBookings).catch(console.error);
    }
  }, [selectedEmployee]);

  useEffect(() => {
    if (selectedEmployee) refreshMyBookings();
    else setMyBookings([]);
  }, [selectedEmployee, refreshMyBookings]);

  // ── Derived state ──────────────────────────────────────────────────────────
  const designated = isDesignatedDay(selectedEmployee, selectedDate);
  const canBook    = !!selectedEmployee && !isWeekend(selectedDate);

  function handleSeatClick(seat) {
    if (!selectedEmployee) {
      showToast('Please select an employee first.', 'warning');
      return;
    }
    setSelectedSeat(prev => prev?.id === seat.id ? null : seat);
  }

  function handleBooked() {
    refresh();
    refreshMyBookings();
    api.getWeekInfo(today)
      .then(info => api.getAvailability(info.next_working_days))
      .then(setAvailability)
      .catch(console.error);
  }

  const tabs = [
    { id: 'grid', label: '🗺️  Seat Map'   },
    { id: 'week', label: '📅  Week View' },
  ];

  if (loadingInit) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 56, height: 56, borderRadius: 16, margin: '0 auto 20px',
              background: 'linear-gradient(135deg, #6366f1, #4f46e5, #7c3aed)',
              boxShadow: '0 0 40px rgba(99,102,241,0.5), 0 0 80px rgba(99,102,241,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'float 2s ease-in-out infinite',
            }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="7" height="7" rx="1.5" fill="white" fillOpacity="0.9"/>
              <rect x="14" y="3" width="7" height="7" rx="1.5" fill="white" fillOpacity="0.6"/>
              <rect x="3" y="14" width="7" height="7" rx="1.5" fill="white" fillOpacity="0.6"/>
              <rect x="14" y="14" width="7" height="7" rx="1.5" fill="white" fillOpacity="0.4"/>
            </svg>
          </div>
          <div style={{ color: 'var(--text-primary)', fontSize: 18, fontWeight: 700, marginBottom: 6 }}>SeatBook</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Loading your workspace…</div>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 20 }}>
            {[0,1,2].map(i => (
              <div key={i} style={{
                width: 6, height: 6, borderRadius: '50%',
                background: '#6366f1',
                animation: `glow-pulse 1.2s ease ${i * 0.2}s infinite`,
              }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <ToastContainer />

      <Navbar
        employees={employees}
        selectedEmployee={selectedEmployee}
        onSelectEmployee={emp => { setSelectedEmployee(emp); setSelectedSeat(null); }}
        weekInfo={weekInfo}
        selectedDate={selectedDate}
        onDateChange={date => { setSelectedDate(date); setSelectedSeat(null); }}
        isDesignatedDay={designated}
      />

      <main className="max-w-7xl mx-auto px-4 py-5">
        {/* Tab switcher */}
        <div
          className="flex gap-1 mb-5 p-1 rounded-2xl w-fit"
          style={{
            background: 'rgba(14,20,34,0.9)',
            border: '1px solid var(--border)',
            backdropFilter: 'blur(12px)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
          }}
        >
          {tabs.map(t => (
            <button
              key={t.id}
              id={`tab-${t.id}`}
              onClick={() => setActiveTab(t.id)}
              className="px-5 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                background:  activeTab === t.id
                  ? 'linear-gradient(135deg, #6366f1, #4f46e5)'
                  : 'transparent',
                color:       activeTab === t.id ? 'white' : 'var(--text-muted)',
                boxShadow:   activeTab === t.id
                  ? '0 4px 16px rgba(99,102,241,0.4), inset 0 1px 0 rgba(255,255,255,0.1)'
                  : 'none',
                transform:   activeTab === t.id ? 'translateY(-1px)' : 'none',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Grid tab */}
        {activeTab === 'grid' && (
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 min-w-0">
              <SeatGrid
                seats={seats}
                bookings={bookings}
                selectedEmployee={selectedEmployee}
                selectedSeat={selectedSeat}
                onSeatClick={handleSeatClick}
                canBook={canBook}
                isDesignatedDay={designated}
                selectedDate={selectedDate}
                weekInfo={weekInfo}
              />
            </div>
            <div className="w-full lg:w-80 shrink-0">
              <BookingPanel
                selectedEmployee={selectedEmployee}
                selectedSeat={selectedSeat}
                selectedDate={selectedDate}
                bookings={bookings}
                myBookings={myBookings}
                availability={availability}
                weekInfo={weekInfo}
                canBook={canBook}
                isDesignatedDay={designated}
                onBooked={handleBooked}
                onCancelled={() => { handleBooked(); setSelectedSeat(null); }}
                onSeatClear={() => setSelectedSeat(null)}
              />
            </div>
          </div>
        )}

        {/* Week tab */}
        {activeTab === 'week' && (
          <WeekView
            selectedEmployee={selectedEmployee}
            currentDate={selectedDate}
          />
        )}
      </main>
    </div>
  );
}
