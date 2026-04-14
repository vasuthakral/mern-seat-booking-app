import { useEffect, useState } from 'react';

let toastId = 0;
let addToastFn = null;

export function showToast(message, type = 'info') {
  if (addToastFn) addToastFn({ id: ++toastId, message, type });
}

const CONFIG = {
  success: {
    icon:   '✓',
    bg:     '#ffffff',
    border: 'rgba(42,157,92,0.35)',
    bar:    '#2a9d5c',
    color:  '#1e7a48',
  },
  error: {
    icon:   '✕',
    bg:     '#ffffff',
    border: 'rgba(224,82,82,0.35)',
    bar:    '#e05252',
    color:  '#b83c3c',
  },
  info: {
    icon:   'ℹ',
    bg:     '#ffffff',
    border: 'rgba(46,196,182,0.35)',
    bar:    '#2ec4b6',
    color:  '#1a9e92',
  },
  warning: {
    icon:   '⚠',
    bg:     '#ffffff',
    border: 'rgba(217,119,6,0.35)',
    bar:    '#d97706',
    color:  '#b45309',
  },
};

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    addToastFn = (toast) => {
      setToasts(prev => [...prev, { ...toast, exiting: false }]);
      setTimeout(() => {
        setToasts(prev => prev.map(t => t.id === toast.id ? { ...t, exiting: true } : t));
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== toast.id)), 300);
      }, 3800);
    };
    return () => { addToastFn = null; };
  }, []);

  return (
    <div style={{
      position: 'fixed', top: 20, right: 20,
      zIndex: 1000,
      display: 'flex', flexDirection: 'column', gap: 8,
      pointerEvents: 'none',
      maxWidth: 360,
    }}>
      {toasts.map(t => {
        const c = CONFIG[t.type] || CONFIG.info;
        return (
          <div
            key={t.id}
            className={t.exiting ? 'toast-exit' : 'toast-enter'}
            style={{
              background: c.bg,
              border: `1px solid ${c.border}`,
              borderRadius: 14,
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 11,
              boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
              pointerEvents: 'auto',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{
              position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
              background: c.bar,
              borderRadius: '14px 0 0 14px',
            }} />
            <span style={{
              width: 22, height: 22, borderRadius: 7,
              background: `${c.bar}18`,
              border: `1px solid ${c.bar}33`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: 800, color: c.bar,
              flexShrink: 0,
            }}>
              {c.icon}
            </span>
            <span style={{ fontSize: '13px', fontWeight: 500, color: c.color, lineHeight: 1.55, paddingLeft: 3 }}>
              {t.message}
            </span>
          </div>
        );
      })}
    </div>
  );
}
