import React, { useState, useEffect } from 'react';
import { getMisPedidos, revocarPedido } from '../services/api';

const DIAS_PARA_REVOCAR = 10;

function puedeRevocar(pedido) {
  if (pedido.estado === "cancelado") return false;
  const fecha = pedido.creado_en ? new Date(pedido.creado_en) : new Date();
  const ms = Date.now() - fecha;
  return ms / 86400000 <= DIAS_PARA_REVOCAR;
}

export default function MisPedidos({ onExploreCatalog, onGoToLogin }) {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Estados para revocación
  const [pedidoAConfirmar, setPedidoAConfirmar] = useState(null);
  const [procesandoRevocacion, setProcesandoRevocacion] = useState(false);
  const [mensajeRevocacion, setMensajeRevocacion] = useState(null);
  const [errorRevocacion, setErrorRevocacion] = useState(null);

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

  const handleIniciarRevocacion = (pedido) => {
    setErrorRevocacion(null);
    setPedidoAConfirmar(pedido);
  };

  const handleConfirmarRevocacion = async () => {
    if (!pedidoAConfirmar || procesandoRevocacion) return;

    setProcesandoRevocacion(true);
    setErrorRevocacion(null);

    try {
      const resultado = await revocarPedido(pedidoAConfirmar.id);
      
      // Guardar el código recibido tras el HTTP 201 Created para mostrar en role="status"
      const codigoObtenido = resultado.codigo || resultado.codigo_solicitud || 'REV-CONFIRMADO';
      setMensajeRevocacion({
        pedidoId: pedidoAConfirmar.id,
        codigo: codigoObtenido,
        fecha: resultado.fecha || new Date().toISOString(),
        mensaje: resultado.mensaje || 'Tu solicitud de revocación fue registrada exitosamente conforme a la Disposición 954/2025.'
      });

      setPedidoAConfirmar(null);
      // Refrescar el historial para actualizar estados y ocultar el botón
      await cargarPedidos();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Error al revocar pedido:', err);
      setErrorRevocacion(err.message || 'No se pudo procesar la revocación.');
    } finally {
      setProcesandoRevocacion(false);
    }
  };

  // 1. ESTADO: CARGANDO
  if (cargando && pedidos.length === 0) {
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
  if (error && pedidos.length === 0) {
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

  // ESTADO: LISTA CON PEDIDOS
  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto animate-fadeIn">
      {/* 5. CÓDIGO DE SOLICITUD TRAS EL 201 CON role="status" (ENTREGABLE 1 - OBLIGATORIO) */}
      {mensajeRevocacion && (
        <div
          role="status"
          id="banner-codigo-revocacion"
          className="mb-8 p-6 bg-emerald-50 border-2 border-emerald-500 rounded-3xl text-emerald-950 shadow-xl animate-fadeIn space-y-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-2xl font-bold shadow">
              ✓
            </div>
            <div>
              <span className="text-xs uppercase tracking-widest font-black text-emerald-800 bg-emerald-200/80 px-3 py-0.5 rounded-full">
                Constancia Legal de Revocación • Disposición 954/2025
              </span>
              <h2 className="font-serif text-2xl font-bold text-emerald-950 mt-1">
                Solicitud de Arrepentimiento Registrada
              </h2>
            </div>
          </div>

          <div className="p-4 bg-white/90 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-stone-500 block uppercase tracking-wider font-semibold">
                Código Identificador de Solicitud (Guardá este comprobante):
              </span>
              <span className="font-mono text-2xl sm:text-3xl font-black text-emerald-800 tracking-wider">
                {mensajeRevocacion.codigo}
              </span>
            </div>
            <div className="text-left sm:text-right text-xs text-stone-600">
              <p><strong>Pedido revocable:</strong> #{mensajeRevocacion.pedidoId}</p>
              <p><strong>Fecha y hora:</strong> {new Date(mensajeRevocacion.fecha).toLocaleString('es-AR')}</p>
              <p className="text-emerald-700 font-semibold mt-0.5">Artículo 34 de la Ley 24.240</p>
            </div>
          </div>

          <p className="text-xs text-emerald-900/90 leading-relaxed">
            {mensajeRevocacion.mensaje} Hemos cancelado el pedido y no se generará ningún costo de devolución.
          </p>
        </div>
      )}

      {/* Error de revocación si ocurre */}
      {errorRevocacion && (
        <div className="mb-6 p-4 bg-red-50 border border-red-300 rounded-2xl text-red-900 text-sm flex items-center gap-3">
          <span className="text-xl">⚠️</span>
          <span>{errorRevocacion}</span>
        </div>
      )}

      {/* Modal / Diálogo de Confirmación con Protección de Doble Clic */}
      {pedidoAConfirmar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-amber-200 space-y-6">
            <div className="flex items-center gap-3 text-amber-900">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-2xl">
                ↩️
              </div>
              <div>
                <h3 className="font-serif text-2xl font-bold text-amber-950">
                  ¿Confirmás el arrepentimiento?
                </h3>
                <span className="text-xs text-stone-500">
                  Pedido #{pedidoAConfirmar.id} • Total: ${pedidoAConfirmar.total.toLocaleString('es-AR')}
                </span>
              </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-xs text-stone-700 space-y-2 leading-relaxed">
              <p>
                <strong>Estás ejerciendo tu derecho legal:</strong> El pedido pasará a estado <em>cancelado</em>, se restituirá el stock y se te generará inmediatamente el <strong>código identificador de solicitud</strong> exigido por la Disposición 954/2025.
              </p>
              <p>
                Este trámite es 100% gratuito y los costos de devolución corren por cuenta del vendedor.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPedidoAConfirmar(null)}
                disabled={procesandoRevocacion}
                className="px-5 py-3 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 font-bold text-sm transition-all cursor-pointer disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                id="btn-confirmar-revocacion-pedido"
                onClick={handleConfirmarRevocacion}
                disabled={procesandoRevocacion}
                className="px-6 py-3 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {procesandoRevocacion ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Procesando solicitud...</span>
                  </>
                ) : (
                  <span>Sí, revocar compra</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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
        {pedidos.map((pedido) => {
          const revocable = puedeRevocar(pedido);
          const fechaPedido = pedido.creado_en ? new Date(pedido.creado_en) : null;

          return (
            <div
              key={pedido.id}
              className={`bg-white rounded-3xl p-6 sm:p-8 shadow-md border transition-shadow ${
                pedido.estado === 'cancelado' ? 'border-red-200 bg-stone-50/50' : 'border-amber-100 hover:shadow-lg'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between border-b border-stone-100 pb-4 mb-4 gap-3">
                <div className="flex items-center gap-3">
                  <span className={`w-10 h-10 rounded-full font-bold flex items-center justify-center text-sm shadow ${
                    pedido.estado === 'cancelado' ? 'bg-stone-500 text-white' : 'bg-amber-800 text-white'
                  }`}>
                    #{pedido.id}
                  </span>
                  <div>
                    <h3 className="font-bold text-stone-900 text-base">
                      Pedido #{pedido.id}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-stone-400">
                      <span>ID Usuario: {pedido.usuario_id}</span>
                      {fechaPedido && (
                        <>
                          <span>•</span>
                          <span>{fechaPedido.toLocaleDateString('es-AR')} {fechaPedido.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                    pedido.estado === 'cancelado'
                      ? 'bg-red-100 text-red-800 border-red-200'
                      : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${pedido.estado === 'cancelado' ? 'bg-red-600' : 'bg-emerald-600 animate-pulse'}`}></span>
                    {pedido.estado.toUpperCase()}
                  </span>
                  <span className="font-serif font-bold text-xl text-amber-900">
                    ${pedido.total.toLocaleString('es-AR')}
                  </span>
                </div>
              </div>

              {/* Si el pedido fue cancelado y tiene código */}
              {pedido.codigo_revocacion && (
                <div className="mb-4 p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-xs text-amber-900 flex flex-wrap items-center justify-between gap-2">
                  <span>Código de revocación: <strong className="font-mono">{pedido.codigo_revocacion}</strong></span>
                  <span className="text-[11px] text-stone-500">Revocado bajo Disposición 954/2025</span>
                </div>
              )}

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

              {/* 3. Botón «Arrepentirme de esta compra» solo si puedeRevocar() da true */}
              {revocable && (
                <div className="mt-4 pt-4 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
                  <div className="text-xs text-stone-600">
                    <span className="font-semibold text-amber-950">⚖️ Derecho de Arrepentimiento:</span> Podés revocar esta compra dentro del plazo legal de 10 días corridos sin costo.
                  </div>
                  <button
                    onClick={() => handleIniciarRevocacion(pedido)}
                    id={`btn-revocar-${pedido.id}`}
                    className="self-start sm:self-auto px-4 py-2.5 bg-red-700 hover:bg-red-800 text-white text-xs font-bold rounded-xl shadow hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <span>↩️</span>
                    <span>Arrepentirme de esta compra</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
