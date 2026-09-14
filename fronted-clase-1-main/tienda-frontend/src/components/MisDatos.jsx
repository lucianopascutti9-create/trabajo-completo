import React, { useState, useEffect } from 'react';
import { getMisDatos, descargarMisDatosBlob, eliminarMiCuenta, BASE_URL } from '../services/api';

export default function MisDatos({ user, onLogout, onClearCart, onNavigate, showToast, onGoToLogin }) {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Estados para descarga y eliminación
  const [descargandoBlob, setDescargandoBlob] = useState(false);
  const [textoEliminar, setTextoEliminar] = useState('');
  const [eliminandoCuenta, setEliminandoCuenta] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState(null);

  const cargarDatos = async () => {
    setCargando(true);
    setError(null);
    try {
      const resp = await getMisDatos();
      setDatos(resp);
    } catch (err) {
      console.error('Error al cargar datos del usuario:', err);
      setError(err.message || 'No se pudieron recuperar tus datos personales.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (user) {
      cargarDatos();
    } else {
      setCargando(false);
    }
  }, [user]);

  const handleDescargarBlob = async () => {
    setDescargandoBlob(true);
    try {
      await descargarMisDatosBlob();
      if (showToast) {
        showToast('Descarga completada', 'Se descargó el archivo JSON con tus datos reales.');
      }
    } catch (err) {
      console.error('Error al descargar JSON:', err);
      if (showToast) {
        showToast('Error en la descarga', err.message, 'error');
      }
    } finally {
      setDescargandoBlob(false);
    }
  };

  const handleEliminarCuenta = async (e) => {
    e.preventDefault();
    if (textoEliminar !== 'ELIMINAR' || eliminandoCuenta) return;

    setEliminandoCuenta(true);
    setErrorEliminar(null);

    try {
      await eliminarMiCuenta();

      // Las tres cosas exigidas por la consigna:
      // 1. Vaciar el carrito
      if (onClearCart) onClearCart();

      // 2. Cerrar la sesión
      if (onLogout) onLogout();

      // 3. Navegar a la portada con un mensaje
      if (onNavigate) onNavigate('catalogo');

      if (showToast) {
        showToast(
          'Cuenta eliminada',
          'Tu cuenta fue dada de baja y tus datos personales han sido suprimidos conforme a la Ley 25.326.',
          'info'
        );
      }
    } catch (err) {
      console.error('Error al eliminar cuenta:', err);
      setErrorEliminar(err.message || 'No se pudo procesar la baja de la cuenta.');
      setEliminandoCuenta(false);
    }
  };

  // Si no está autenticado
  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto animate-fadeIn">
        <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center text-4xl mb-4 text-amber-800 shadow-inner">
          🔒
        </div>
        <h3 className="font-serif text-2xl font-bold text-amber-950 mb-2">
          Acceso Restringido
        </h3>
        <p className="text-stone-600 text-sm mb-6">
          Para ver los datos que el sistema almacena sobre vos o solicitar la baja de tu cuenta, por favor iniciá sesión.
        </p>
        <button
          onClick={onGoToLogin}
          className="px-8 py-3.5 bg-amber-900 hover:bg-amber-950 text-white font-bold text-sm rounded-xl transition-all shadow cursor-pointer"
        >
          Iniciar Sesión
        </button>
      </div>
    );
  }

  // 1. ESTADO: CARGANDO
  if (cargando) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
        <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-800 rounded-full animate-spin mb-4"></div>
        <h3 className="font-serif text-2xl font-bold text-amber-950 mb-2">
          Consultando tus datos personales...
        </h3>
        <p className="text-stone-500 text-sm">
          Recuperando tus registros y consentimientos según la Ley 25.326.
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
          No pudimos consultar tus datos
        </h3>
        <p className="text-red-700 text-sm mb-6 bg-red-50 border border-red-200 rounded-xl p-4 w-full">
          {error}
        </p>
        <button
          onClick={cargarDatos}
          className="px-6 py-3 bg-amber-800 hover:bg-amber-900 text-white font-bold text-sm rounded-xl transition-all shadow cursor-pointer"
        >
          Reintentar
        </button>
      </div>
    );
  }

  // 3. ESTADO: DATOS (ENTREGABLE 2)
  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto animate-fadeIn space-y-10">
      
      {/* Encabezado */}
      <div className="border-b border-amber-200 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest font-bold text-amber-700 bg-amber-100/70 px-3 py-1 rounded-full">
            Derecho de Acceso y Portabilidad • Ley 25.326
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-amber-950 mt-2">
            Panel de Mis Datos Personales
          </h1>
          <p className="text-stone-600 text-sm mt-1">
            Aquí podés ver todos los datos que almacenamos sobre vos en cumplimiento del artículo 14 de la Ley de Protección de Datos Personales.
          </p>
        </div>
        <button
          onClick={cargarDatos}
          className="self-start sm:self-center px-4 py-2 text-xs font-bold text-amber-900 bg-amber-100/80 hover:bg-amber-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          🔄 Actualizar
        </button>
      </div>

      {/* 2. Mostrá TODO lo que el backend devuelve (ENTREGABLE 2 - FECHA DEL CONSENTIMIENTO) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Tarjeta 1: Perfil y Consentimiento (ENTREGABLE 2) */}
        <div id="panel-consentimiento-usuario" className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border-2 border-amber-300 space-y-6">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <h2 className="font-serif text-xl font-bold text-amber-950 flex items-center gap-2">
              <span>👤</span>
              <span>Datos de tu Cuenta</span>
            </h2>
            <span className="text-xs font-mono font-bold bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full">
              ID #{datos?.id}
            </span>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-1 border-b border-stone-100">
              <span className="text-stone-500 font-medium">Nombre completo:</span>
              <span className="font-bold text-stone-900">{datos?.nombre}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-stone-100">
              <span className="text-stone-500 font-medium">Correo electrónico:</span>
              <span className="font-mono text-stone-900">{datos?.email}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-stone-100">
              <span className="text-stone-500 font-medium">Rol en la plataforma:</span>
              <span className="font-semibold text-amber-800 uppercase text-xs tracking-wider">{datos?.rol}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-stone-100">
              <span className="text-stone-500 font-medium">Estado de la cuenta:</span>
              <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                {datos?.activo ? 'Activa' : 'Inactiva'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-stone-100">
              <span className="text-stone-500 font-medium">Tratamiento de datos aceptado:</span>
              <span className="font-semibold text-stone-800">
                {datos?.acepto_tratamiento ? 'Sí (Ley 25.326, Art. 5)' : 'No'}
              </span>
            </div>
          </div>

          {/* DESTACADO PARA ENTREGABLE 2: FECHA DEL CONSENTIMIENTO */}
          <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-400 text-amber-950 space-y-1 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-lg">📜</span>
              <span className="text-xs font-black uppercase tracking-wider text-amber-900">
                Fecha del Consentimiento Informado (Entregable 2):
              </span>
            </div>
            <p id="fecha-consentimiento-display" className="text-base sm:text-lg font-bold text-amber-950 font-mono">
              {datos?.fecha_consentimiento
                ? new Date(datos.fecha_consentimiento).toLocaleString('es-AR', {
                    dateStyle: 'full',
                    timeStyle: 'medium',
                  })
                : 'Consentimiento registrado durante el alta de usuario'}
            </p>
            <p className="text-[11px] text-amber-800/80">
              Registro del otorgamiento libre y expreso del tratamiento de datos personales conforme al Art. 5 de la Ley 25.326.
            </p>
          </div>
        </div>

        {/* Tarjeta 2: Exportación de Datos (3 y 4 de la Consigna) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-amber-100 flex flex-col justify-between space-y-6">
          <div>
            <div className="border-b border-stone-100 pb-4 mb-4">
              <h2 className="font-serif text-xl font-bold text-amber-950 flex items-center gap-2">
                <span>💾</span>
                <span>Exportar y Descargar Datos</span>
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                Portabilidad de datos: obtené una copia legible por máquina de toda la información guardada.
              </p>
            </div>

            {/* Paso 3: Enlace común sin autenticación */}
            <div className="mb-6 p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2 text-xs text-stone-700">
              <span className="font-bold text-stone-900 block">
                Paso 3 — Prueba con enlace común directo &lt;a href&gt;:
              </span>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                Al hacer clic, el navegador hace un GET directo sin cabeceras de autorización Bearer, devolviendo error 401:
              </p>
              <a
                href={`${BASE_URL}/usuarios/me/exportar`}
                target="_blank"
                rel="noreferrer"
                id="link-exportar-directo"
                className="inline-flex items-center gap-2 px-3 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl font-mono text-[11px] font-bold transition-colors"
              >
                <span>🔗 &lt;a href="{BASE_URL}/usuarios/me/exportar"&gt;</span>
              </a>
              <p className="text-[11px] text-red-700 font-medium">
                ⚠️ Resultado esperado: Descarga o muestra el error 401 ("No autenticado").
              </p>
            </div>

            {/* Paso 4: Descarga auténtica con fetch + blob + enlace temporal */}
            <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-3">
              <span className="font-bold text-emerald-950 text-xs block">
                Paso 4 — Versión corregida (Fetch + Blob + Enlace temporal):
              </span>
              <p className="text-[11px] text-emerald-900/80 leading-relaxed">
                Envía el Bearer token almacenado, crea un Blob en memoria con <code>URL.createObjectURL</code> y dispara la descarga con tus datos reales de verdad.
              </p>
              <button
                type="button"
                onClick={handleDescargarBlob}
                disabled={descargandoBlob}
                id="btn-descargar-json-blob"
                className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {descargandoBlob ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Generando JSON de datos...</span>
                  </>
                ) : (
                  <>
                    <span>📥</span>
                    <span>Descargar JSON de Mis Datos (Con Token)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="text-[11px] text-stone-400 text-center pt-2">
            El archivo generado incluye tus compras, solicitudes y consentimientos en formato JSON estructurado.
          </div>
        </div>

      </div>

      {/* Historial Completo de Pedidos (sin filtrar) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-amber-100 space-y-4">
        <h2 className="font-serif text-xl font-bold text-amber-950 flex items-center gap-2">
          <span>📦</span>
          <span>Tus Pedidos en el Sistema ({datos?.pedidos?.length || 0})</span>
        </h2>
        <p className="text-xs text-stone-500">
          Mostrando el registro íntegro de compras tal como lo devuelve el backend.
        </p>

        {datos?.pedidos && datos.pedidos.length > 0 ? (
          <div className="divide-y divide-stone-100">
            {datos.pedidos.map((ped) => (
              <div key={ped.id} className="py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-stone-800">Pedido #{ped.id}</span>
                  <span className="text-stone-400 mx-2">•</span>
                  <span className="text-stone-500">
                    {ped.creado_en ? new Date(ped.creado_en).toLocaleString('es-AR') : 'Fecha no especificada'}
                  </span>
                  {ped.items && ped.items.length > 0 && (
                    <span className="block text-stone-500 text-[11px] mt-0.5">
                      {ped.items.map((it) => `${it.cantidad}x ${it.nombre}`).join(', ')}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-0.5 rounded-full font-bold ${
                    ped.estado === 'cancelado' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {ped.estado.toUpperCase()}
                  </span>
                  <span className="font-bold text-stone-900">${ped.total?.toLocaleString('es-AR')}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-stone-400 italic py-2">No se registran pedidos asociados a esta cuenta.</p>
        )}
      </div>

      {/* Solicitudes de Revocación Registradas (sin filtrar) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-amber-100 space-y-4">
        <h2 className="font-serif text-xl font-bold text-amber-950 flex items-center gap-2">
          <span>↩️</span>
          <span>Tus Solicitudes de Revocación ({datos?.solicitudes_revocacion?.length || 0})</span>
        </h2>
        <p className="text-xs text-stone-500">
          Registros oficiales de arrepentimiento conforme a la Disposición 954/2025.
        </p>

        {datos?.solicitudes_revocacion && datos.solicitudes_revocacion.length > 0 ? (
          <div className="divide-y divide-stone-100">
            {datos.solicitudes_revocacion.map((sol) => (
              <div key={sol.id} className="py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-stone-800">Código:</span>{' '}
                  <strong className="font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    {sol.codigo}
                  </strong>
                  <span className="text-stone-400 mx-2">•</span>
                  <span className="text-stone-500">Pedido #{sol.pedido_id}</span>
                  <span className="block text-stone-400 text-[11px] mt-0.5">
                    Motivo: {sol.motivo || 'Arrepentimiento de compra'}
                  </span>
                </div>
                <span className="text-stone-500">
                  {sol.fecha ? new Date(sol.fecha).toLocaleString('es-AR') : 'Fecha registrada'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-stone-400 italic py-2">No hay solicitudes de revocación emitidas.</p>
        )}
      </div>

      {/* PARTE 4 — SECCIÓN: ELIMINAR MI CUENTA (DARSE DE BAJA) */}
      <div id="seccion-eliminar-cuenta" className="bg-red-50/40 rounded-3xl p-6 sm:p-10 border-2 border-red-300 shadow-lg space-y-6">
        <div className="border-b border-red-200 pb-4">
          <div className="flex items-center gap-3 text-red-900 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center text-xl text-red-700 font-bold">
              🗑️
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-red-950">
              Eliminar mi cuenta
            </h2>
          </div>
          <p className="text-xs text-red-800">
            Ejercicio del Derecho de Supresión y Cancelación de Datos Personales (Art. 16, Ley 25.326).
          </p>
        </div>

        {/* 3. Explicá qué pasa ANTES de que pase */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-white rounded-2xl border border-red-200 space-y-2">
            <span className="font-bold text-red-900 flex items-center gap-1.5 text-sm">
              <span>❌</span>
              <span>¿Qué se borra definitivamente?</span>
            </span>
            <ul className="space-y-1.5 text-stone-600 list-disc list-inside">
              <li>Tu <strong>nombre y apellido</strong>.</li>
              <li>Tu <strong>dirección de correo electrónico</strong>.</li>
              <li>La <strong>contraseña</strong> y credenciales de acceso.</li>
              <li>Cualquier otro dato que permita identificarte directa o indirectamente.</li>
            </ul>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-stone-200 space-y-2">
            <span className="font-bold text-stone-800 flex items-center gap-1.5 text-sm">
              <span>📦</span>
              <span>¿Qué queda en nuestros registros?</span>
            </span>
            <p className="text-stone-600 leading-relaxed">
              Los <strong>pedidos y operaciones comerciales</strong> ya realizados se conservan únicamente por exigencia de las leyes fiscales y comerciales argentinas (Código Civil y Comercial y AFIP/ARCA), pero <strong>totalmente anonimizados y disociados</strong>, sin ningún dato que te identifique.
            </p>
          </div>
        </div>

        {/* Formulario con confirmación tipeada */}
        <form onSubmit={handleEliminarCuenta} className="space-y-4 pt-2">
          {errorEliminar && (
            <div className="p-3 bg-red-100 text-red-900 text-xs rounded-xl border border-red-300">
              {errorEliminar}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="input-confirmar-eliminar" className="block text-xs font-bold text-stone-800">
              4. Para habilitar la baja, escribí exactamente la palabra <span className="font-mono text-red-700 bg-red-100 px-2 py-0.5 rounded font-bold">ELIMINAR</span>:
            </label>
            <input
              type="text"
              id="input-confirmar-eliminar"
              value={textoEliminar}
              onChange={(e) => setTextoEliminar(e.target.value)}
              placeholder="Escribí ELIMINAR para confirmar"
              disabled={eliminandoCuenta}
              className="w-full sm:max-w-md px-4 py-3 rounded-xl border-2 border-stone-300 focus:border-red-600 focus:outline-hidden text-sm font-mono tracking-wider"
            />
            <p className="text-[11px] text-stone-500">
              (Un simple click o confirm() no alcanza: escribir la palabra garantiza que leíste las consecuencias de la supresión de datos).
            </p>
          </div>

          <button
            type="submit"
            id="btn-confirmar-eliminar-cuenta"
            disabled={textoEliminar !== 'ELIMINAR' || eliminandoCuenta}
            className="px-6 py-3.5 bg-red-700 hover:bg-red-800 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {eliminandoCuenta ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Eliminando cuenta y disociando datos...</span>
              </>
            ) : (
              <span>Confirmar y Eliminar mi cuenta permanentemente</span>
            )}
          </button>
        </form>
      </div>

    </div>
  );
}
