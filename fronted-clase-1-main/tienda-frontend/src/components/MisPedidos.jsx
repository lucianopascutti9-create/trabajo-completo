import React, { useState, useEffect } from 'react';
import { getMisPedidos } from '../services/api';

export default function MisPedidos({ onExploreCatalog, onGoToLogin }) {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargarPedidos = async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await getMisPedidos();
      setPedidos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar historial de pedidos:', err);
      setError(err.message || 'No se pudo cargar el historial de compras.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarPedidos();
  }, []);

  // 1. ESTADO: CARGANDO
  if (cargando) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
        <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-800 rounded-full animate-spin mb-4"></div>
        <h3 className="font-serif text-2xl font-bold text-amber-950 mb-2">
          Consultando tu historial de compras...
        </h3>
        <p className="text-stone-500 text-sm">
          Estamos recuperando tus órdenes desde nuestros registros seguros.
        </p>
      </div>
    );
  }

  // 2. ESTADO: ERROR
  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto animate-fadeIn">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center text-4xl mb-4 text-red-600 shadow-inner">
          ⚠️
        </div>
        <h3 className="font-serif text-2xl font-bold text-red-900 mb-2">
          No pudimos cargar tus pedidos
        </h3>
        <p className="text-red-700 text-sm mb-6 bg-red-50 border border-red-200 rounded-xl p-4 w-full">
          {error}
        </p>
        <div className="flex gap-4">
          <button
            onClick={cargarPedidos}
            className="px-6 py-3 bg-amber-800 hover:bg-amber-900 text-white font-bold text-sm rounded-xl transition-all shadow cursor-pointer"
          >
            Reintentar
          </button>
          {error.includes('sesión') && (
            <button
              onClick={onGoToLogin}
              className="px-6 py-3 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-sm rounded-xl transition-all cursor-pointer"
            >
              Iniciar Sesión
            </button>
          )}
        </div>
      </div>
    );
  }

  // 3. ESTADO: LISTA VACÍA
  if (pedidos.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto animate-fadeIn">
        <div className="w-24 h-24 rounded-full bg-amber-100 flex items-center justify-center text-5xl mb-6 shadow-inner">
          📦
        </div>
        <h2 className="font-serif text-3xl font-bold text-amber-950 mb-3">
          Aún no tienes pedidos registrados
        </h2>
        <p className="text-stone-600 text-sm mb-8 leading-relaxed">
          Cuando realices una compra en Culto al Flan, podrás ver el detalle de cada pedido, fecha, estado y resumen aquí mismo.
        </p>
        <button
          onClick={onExploreCatalog}
          className="bg-amber-900 hover:bg-amber-950 text-white font-bold text-sm px-8 py-4 rounded-2xl transition-all shadow-lg hover:shadow-xl cursor-pointer flex items-center gap-2"
        >
          <span>Ir al Catálogo</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    );
  }

  // ESTADO: LISTA CON PEDIDOS (ENTREGABLE 1)
  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto animate-fadeIn">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-amber-200/80 pb-6 mb-8 gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest font-bold text-amber-700 bg-amber-100/70 px-3 py-1 rounded-full">
            Historial de Compras
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-amber-950 mt-2">
            Mis Pedidos Confirmados
          </h1>
          <p className="text-stone-600 text-sm mt-1">
            Revisá el estado y detalle de tus órdenes registradas en nuestra base de datos.
          </p>
        </div>
        <button
          onClick={cargarPedidos}
          className="self-start sm:self-center px-4 py-2 text-xs font-bold text-amber-900 bg-amber-100/80 hover:bg-amber-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Actualizar
        </button>
      </div>

      {/* Lista de Pedidos */}
      <div className="space-y-6">
        {pedidos.map((pedido) => (
          <div
            key={pedido.id}
            className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-amber-100 hover:shadow-lg transition-shadow"
          >
            <div className="flex flex-wrap items-center justify-between border-b border-stone-100 pb-4 mb-4 gap-3">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-amber-800 text-white font-bold flex items-center justify-center text-sm shadow">
                  #{pedido.id}
                </span>
                <div>
                  <h3 className="font-bold text-stone-900 text-base">
                    Pedido #{pedido.id}
                  </h3>
                  <span className="text-xs text-stone-400">
                    ID de Usuario: {pedido.usuario_id}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                  {pedido.estado.toUpperCase()}
                </span>
                <span className="font-serif font-bold text-xl text-amber-900">
                  ${pedido.total.toLocaleString('es-AR')}
                </span>
              </div>
            </div>

            {/* Ítems del pedido */}
            <div className="divide-y divide-stone-100">
              {pedido.items && pedido.items.length > 0 ? (
                pedido.items.map((item) => (
                  <div key={item.id} className="py-3 flex justify-between items-center text-sm">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🍮</span>
                      <div>
                        <span className="font-medium text-stone-800">
                          {item.nombre || `Producto #${item.producto_id}`}
                        </span>
                        <span className="text-xs text-stone-500 block">
                          Cantidad: {item.cantidad} × ${item.precio_unit.toLocaleString('es-AR')}
                        </span>
                      </div>
                    </div>
                    <span className="font-bold text-stone-900">
                      ${(item.cantidad * item.precio_unit).toLocaleString('es-AR')}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-stone-400 py-2">Sin ítems detallados</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
