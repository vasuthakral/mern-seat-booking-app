import { useEffect, useState, useCallback } from 'react';
import { api } from './api';
import Navbar from './components/Navbar';
import SeatGrid from './components/SeatGrid';
import BookingPanel from './components/BookingPanel';
import WeekView from './components/WeekView';
import { ToastContainer, showToast } from './components/Toast';
import Login from './components/Login';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ANCHOR = new Date('2025-01-06T00:00:00');

function getWeekInCycle(dateStr) {
  const d        = new Date(dateStr + 'T00:00:00');
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
  const isoDay = d.getDay() === 0 ? 7 : d.getDay();
  if (employee.batch === 1) {
    return week === 1 ? isoDay <= 3 : isoDay >= 4 && isoDay <= 5;
  } else {
    return week === 1 ? isoDay >= 4 && isoDay <= 5 : isoDay <= 3;
  }
}

// ─── Main dashboard (only mounted after login) ───────────────────────────────

function Dashboard() {
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

  useEffect(() => {
    Promise.all([api.getEmployees(), api.getSeats()])
      .then(([emps, s]) => { setEmployees(emps); setSeats(s); })
      .catch(err => showToast('Failed to connect to server: ' + err.message, 'error'))
      .finally(() => setLoadingInit(false));
  }, []);

  const refresh = useCallback(() => {
    if (!selectedDate) return;
    api.getBookings(selectedDate).then(setBookings).catch(console.error);
    api.getWeekInfo(selectedDate).then(setWeekInfo).catch(console.error);
    api.getSeats().then(setSeats).catch(console.error);
  }, [selectedDate]);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    api.getWeekInfo(today)
      .then(info => api.getAvailability(info.next_working_days))
      .then(setAvailability)
      .catch(console.error);
  }, [today]);

  const refreshMyBookings = useCallback(() => {
    if (selectedEmployee)
      api.getMyBookings(selectedEmployee.id).then(setMyBookings).catch(console.error);
  }, [selectedEmployee]);

  useEffect(() => {
    if (selectedEmployee) refreshMyBookings();
    else setMyBookings([]);
  }, [selectedEmployee, refreshMyBookings]);

  const designated = isDesignatedDay(selectedEmployee, selectedDate);
  const canBook    = !!selectedEmployee && !isWeekend(selectedDate);

  function handleSeatClick(seat) {
    if (!selectedEmployee) { showToast('Please select an employee first.', 'warning'); return; }
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
    { id: 'grid', label: 'Seat Map',  emoji: '🗺️' },
    { id: 'week', label: 'Week View', emoji: '📅' },
  ];

  if (loadingInit) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 20,
            background: 'linear-gradient(135deg, #2ec4b6 0%, #1a9e92 100%)',
            boxShadow: '0 4px 24px rgba(46,196,182,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
            animation: 'float 3s ease-in-out infinite',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="7" height="7" rx="2" fill="white" fillOpacity="0.95"/>
              <rect x="14" y="3" width="7" height="7" rx="2" fill="white" fillOpacity="0.7"/>
              <rect x="3" y="14" width="7" height="7" rx="2" fill="white" fillOpacity="0.7"/>
              <rect x="14" y="14" width="7" height="7" rx="2" fill="white" fillOpacity="0.45"/>
            </svg>
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 6, color: 'var(--text-primary)' }}>
            SeatBook
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: 28 }}>
            Loading your workspace…
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 8, height: 8, borderRadius: '50%',
                background: '#2ec4b6',
                animation: `glowPulse 1.4s ease ${i * 0.18}s infinite`,
              }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
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

      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 20px' }}>

        <div className="tab-bar" style={{ marginBottom: 20 }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`tab-btn ${activeTab === t.id ? 'active' : 'inactive'}`}
            >
              {t.emoji}{'  '}{t.label}
            </button>
          ))}
        </div>

        {activeTab === 'grid' && (
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 0', minWidth: 0 }}>
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
            <div style={{ width: 300, flexShrink: 0 }}>
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

// ─── Root — controls login gate ───────────────────────────────────────────────

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  if (!loggedIn) return <Login onLogin={() => setLoggedIn(true)} />;
  return <Dashboard />;
}
