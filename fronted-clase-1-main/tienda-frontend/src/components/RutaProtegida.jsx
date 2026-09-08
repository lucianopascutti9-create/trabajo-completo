import React from 'react';

export default function RutaProtegida({ user, onGoToLogin, children }) {
  const token = localStorage.getItem('access_token');
  const estaAutenticado = Boolean(user && token);

  if (!estaAutenticado) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto animate-fadeIn">
        <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center text-4xl mb-4 text-amber-800 shadow-inner">
          🔒
        </div>
        <h2 className="font-serif text-2xl font-bold text-amber-950 mb-2">
          Acceso Restringido
        </h2>
        <p className="text-stone-600 text-sm mb-6 leading-relaxed">
          Debes iniciar sesión con tu cuenta para ver tu historial de pedidos y compras realizadas.
        </p>
        <button
          onClick={onGoToLogin}
          className="bg-amber-900 hover:bg-amber-950 text-white font-bold text-sm px-8 py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer"
        >
          Iniciar Sesión
        </button>
      </div>
    );
  }

  return children;
}
