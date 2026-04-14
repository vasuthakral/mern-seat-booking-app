import { useState } from 'react';
import heroBg from '../assets/login-page-hero.png';

const VALID_USER = 'user012';
const VALID_PASS = 'user123';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass]  = useState(false);
  const [error,    setError]     = useState('');
  const [loading,  setLoading]   = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      if (username === VALID_USER && password === VALID_PASS) {
        onLogin();
      } else {
        setError('Invalid username or password.');
      }
      setLoading(false);
    }, 600);
  }

  return (
    <div style={{
      display: 'flex',
      width: '100vw',
      height: '100vh',
      fontFamily: 'Inter, sans-serif',
      overflow: 'hidden',
    }}>

      {/* ══════════════════════════════════════════════════════
          LEFT — Form panel
      ══════════════════════════════════════════════════════ */}
      <div style={{
        flex: '0 0 42%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px 64px',
        background: 'linear-gradient(170deg, #ffffff 55%, #fdf6f0 100%)',
        position: 'relative',
        zIndex: 1,
      }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 52 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 11,
            background: 'linear-gradient(135deg, #2ec4b6, #1a9e92)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 12px rgba(46,196,182,0.28)',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="7" height="7" rx="2" fill="white" fillOpacity="0.95"/>
              <rect x="14" y="3" width="7" height="7" rx="2" fill="white" fillOpacity="0.7"/>
              <rect x="3" y="14" width="7" height="7" rx="2" fill="white" fillOpacity="0.7"/>
              <rect x="14" y="14" width="7" height="7" rx="2" fill="white" fillOpacity="0.45"/>
            </svg>
          </div>
          <span style={{ fontSize: '16px', fontWeight: 800, color: '#1a1a2e', letterSpacing: '-0.01em' }}>
            SeatBook
          </span>
        </div>

        {/* Heading */}
        <div style={{ marginBottom: 36 }}>
          <h1 style={{
            fontSize: '32px', fontWeight: 800, color: '#1a1a2e',
            letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 10,
          }}>
            Welcome back
          </h1>
          <p style={{ fontSize: '14px', color: '#8888a8', lineHeight: 1.6 }}>
            Sign in to manage your office seat bookings.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Username */}
          <div>
            <label style={{
              fontSize: '11px', fontWeight: 600, color: '#8888a8',
              letterSpacing: '0.07em', textTransform: 'uppercase',
              display: 'block', marginBottom: 7,
            }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="user012"
              autoComplete="username"
              required
              style={{
                width: '100%', height: 48,
                borderRadius: 13,
                border: '1.5px solid rgba(0,0,0,0.09)',
                background: '#fafaf9',
                padding: '0 16px',
                fontSize: '14px', color: '#1a1a2e',
                outline: 'none',
                fontFamily: 'Inter, sans-serif',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                boxSizing: 'border-box',
              }}
              onFocus={e => { e.target.style.borderColor = '#2ec4b6'; e.target.style.boxShadow = '0 0 0 3px rgba(46,196,182,0.12)'; }}
              onBlur={e =>  { e.target.style.borderColor = 'rgba(0,0,0,0.09)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Password */}
          <div>
            <label style={{
              fontSize: '11px', fontWeight: 600, color: '#8888a8',
              letterSpacing: '0.07em', textTransform: 'uppercase',
              display: 'block', marginBottom: 7,
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                style={{
                  width: '100%', height: 48,
                  borderRadius: 13,
                  border: '1.5px solid rgba(0,0,0,0.09)',
                  background: '#fafaf9',
                  padding: '0 48px 0 16px',
                  fontSize: '14px', color: '#1a1a2e',
                  outline: 'none',
                  fontFamily: 'Inter, sans-serif',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={e => { e.target.style.borderColor = '#2ec4b6'; e.target.style.boxShadow = '0 0 0 3px rgba(46,196,182,0.12)'; }}
                onBlur={e =>  { e.target.style.borderColor = 'rgba(0,0,0,0.09)'; e.target.style.boxShadow = 'none'; }}
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#b0b0c8', fontSize: '12px', fontWeight: 600,
                  fontFamily: 'Inter, sans-serif', padding: 4,
                }}
              >
                {showPass ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: 'rgba(224,82,82,0.07)',
              border: '1px solid rgba(224,82,82,0.2)',
              borderRadius: 11, padding: '10px 14px',
              fontSize: '13px', color: '#c04040',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ fontWeight: 700 }}>✕</span> {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', height: 50,
              borderRadius: 13, border: 'none',
              background: loading
                ? 'rgba(244,132,95,0.45)'
                : 'linear-gradient(135deg, #f4a96a 0%, #f4845f 100%)',
              color: '#ffffff',
              fontSize: '15px', fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'Inter, sans-serif',
              letterSpacing: '0.01em',
              boxShadow: loading ? 'none' : '0 4px 20px rgba(244,132,95,0.38)',
              transition: 'transform 0.15s, box-shadow 0.15s',
              marginTop: 4,
            }}
            onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(244,132,95,0.45)'; }}}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = loading ? 'none' : '0 4px 20px rgba(244,132,95,0.38)'; }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        {/* Footer */}
        <p style={{ marginTop: 'auto', paddingTop: 48, fontSize: '12px', color: '#c8c8d8', textAlign: 'center' }}>
          Office Seat Booking System · Internal Use Only
        </p>
      </div>

      {/* ══════════════════════════════════════════════════════
          RIGHT — Hero image + floating cards
      ══════════════════════════════════════════════════════ */}
      <div style={{
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
      }}>

        {/* Full-cover hero photo */}
        <img
          src={heroBg}
          alt=""
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
          }}
        />

        {/* Subtle warm tint overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(160deg, rgba(253,243,231,0.30) 0%, rgba(253,224,200,0.22) 100%)',
          pointerEvents: 'none',
        }} />

        {/* Bottom fade so lower cards read cleanly */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%',
          background: 'linear-gradient(to top, rgba(30,20,10,0.45) 0%, transparent 100%)',
          pointerEvents: 'none',
        }} />

        {/* ── TOP floating pill — Seat Review ── */}
        <div style={{
          position: 'absolute', top: 32, left: '50%', transform: 'translateX(-50%)',
          width: 230,
          background: 'rgba(255,255,255,0.80)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: 16,
          padding: '12px 18px',
          boxShadow: '0 4px 28px rgba(0,0,0,0.14)',
          border: '1px solid rgba(255,255,255,0.95)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#1a1a2e' }}>Seat Review</span>
            <span style={{
              width: 9, height: 9, borderRadius: '50%',
              background: '#f4845f', display: 'inline-block',
            }} />
          </div>
          <div style={{ fontSize: '11.5px', color: '#8888a8' }}>09:30am – 10:00am</div>
        </div>

        {/* ── BOTTOM-LEFT floating card — Daily Booking ── */}
        <div style={{
          position: 'absolute', bottom: 44, left: 32,
          width: 220,
          background: 'rgba(255,255,255,0.82)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: 18,
          padding: '16px 18px',
          boxShadow: '0 6px 32px rgba(0,0,0,0.16)',
          border: '1px solid rgba(255,255,255,0.95)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#1a1a2e' }}>Daily Booking</span>
            <span style={{ fontSize: '13px', color: '#f4845f', fontWeight: 700 }}>★</span>
          </div>
          <div style={{ fontSize: '11.5px', color: '#8888a8', marginBottom: 12 }}>12:00pm – 01:00pm</div>
          {/* Avatar stack */}
          <div style={{ display: 'flex' }}>
            {['#2ec4b6','#f4845f','#2a9d5c','#d97706'].map((c, i) => (
              <div key={i} style={{
                width: 28, height: 28, borderRadius: '50%',
                background: c,
                border: '2.5px solid white',
                marginLeft: i === 0 ? 0 : -9,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '10px', fontWeight: 800, color: 'white',
                boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
              }}>
                {['A','B','C','D'][i]}
              </div>
            ))}
          </div>
        </div>

        {/* ── BOTTOM-RIGHT floating card — Week strip ── */}
        <div style={{
          position: 'absolute', bottom: 44, right: 32,
          width: 210,
          background: 'rgba(255,255,255,0.82)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: 18,
          padding: '16px 18px',
          boxShadow: '0 6px 32px rgba(0,0,0,0.16)',
          border: '1px solid rgba(255,255,255,0.95)',
        }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#b0a090', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 11 }}>
            This Week
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 5 }}>
            {['M','T','W','T','F'].map((d, i) => (
              <div key={i} style={{
                textAlign: 'center',
                background: i === 1
                  ? 'linear-gradient(135deg,#f4a96a,#f4845f)'
                  : 'rgba(255,255,255,0.5)',
                borderRadius: 9, padding: '7px 3px',
                border: i === 1
                  ? '1px solid rgba(244,132,95,0.4)'
                  : '1px solid rgba(0,0,0,0.07)',
              }}>
                <div style={{ fontSize: '9px', color: i === 1 ? 'rgba(255,255,255,0.85)' : '#b0a090', fontWeight: 600, marginBottom: 3 }}>{d}</div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: i === 1 ? '#fff' : '#1a1a2e' }}>{22 + i}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
