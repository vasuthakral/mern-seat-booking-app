import { useEffect, useState } from 'react';

let toastId = 0;
let addToastFn = null;

export function showToast(message, type = 'info') {
  if (addToastFn) addToastFn({ id: ++toastId, message, type });
}

const CONFIG = {
  success: { icon: '✓', style: 'border-l-4 border-green-500 bg-green-950/80 text-green-200' },
  error:   { icon: '✕', style: 'border-l-4 border-red-500   bg-red-950/80   text-red-200'   },
  info:    { icon: 'ℹ', style: 'border-l-4 border-indigo-500 bg-indigo-950/80 text-indigo-200' },
  warning: { icon: '⚠', style: 'border-l-4 border-yellow-500 bg-yellow-950/80 text-yellow-200' },
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
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none" style={{ maxWidth: 360 }}>
      {toasts.map(t => {
        const c = CONFIG[t.type] || CONFIG.info;
        return (
          <div
            key={t.id}
            className={`
              ${t.exiting ? 'toast-exit' : 'toast-enter'}
              ${c.style}
              rounded-lg px-4 py-3 flex items-start gap-3
              shadow-2xl backdrop-blur-md pointer-events-auto
            `}
          >
            <span className="text-base font-bold shrink-0 mt-0.5">{c.icon}</span>
            <span className="text-sm font-medium leading-snug">{t.message}</span>
          </div>
        );
      })}
    </div>
  );
}
