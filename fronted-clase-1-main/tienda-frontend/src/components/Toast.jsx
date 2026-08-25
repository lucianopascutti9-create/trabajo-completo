import React, { useEffect } from 'react';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success' || !toast.type;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md animate-bounce-soft transition-all duration-300">
      <div className={`p-4 rounded-2xl shadow-2xl border flex items-center gap-3.5 backdrop-blur-md ${
        isSuccess 
          ? 'bg-amber-950/95 text-amber-50 border-amber-500/40 shadow-amber-950/40' 
          : 'bg-red-950/95 text-red-50 border-red-500/40 shadow-red-950/40'
      }`}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
          isSuccess ? 'bg-amber-500/20 text-amber-300' : 'bg-red-500/20 text-red-300'
        }`}>
          {isSuccess ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
        </div>

        <div className="flex-1 pr-2">
          <p className="font-serif font-bold text-sm text-amber-200">
            {toast.title || (isSuccess ? "¡Agregado al Carrito!" : "Atención")}
          </p>
          <p className="text-xs text-amber-100/90 leading-tight mt-0.5">
            {toast.message}
          </p>
        </div>

        <button 
          onClick={onClose}
          className="text-amber-300/60 hover:text-amber-200 p-1 rounded-lg transition-colors cursor-pointer"
          title="Cerrar"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
