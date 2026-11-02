import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

export default function ActualizacionDisponible() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registrado:', r);
    },
    onRegisterError(error) {
      console.error('Error al registrar SW:', error);
    },
  });

  if (!needRefresh) return null;

  return (
    <aside 
      role="alert" 
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 bg-amber-950 text-amber-50 p-4 rounded-2xl shadow-2xl border border-amber-600/40 backdrop-blur-md flex items-center justify-between gap-4 animate-bounce"
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">✨</span>
        <div className="text-xs">
          <p className="font-bold text-amber-200">¡Hay una versión nueva de la tienda!</p>
          <p className="text-amber-100/80">Actualizá para ver los últimos cambios.</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => updateServiceWorker(true)}
          className="bg-amber-500 hover:bg-amber-400 text-amber-950 text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer transition-colors shadow-sm"
        >
          Actualizar
        </button>
        <button
          onClick={() => setNeedRefresh(false)}
          className="text-stone-400 hover:text-white text-xs px-2 py-1.5 cursor-pointer"
        >
          Cerrar
        </button>
      </div>
    </aside>
  );
}
