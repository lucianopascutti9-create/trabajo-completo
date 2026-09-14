import React from 'react';

export default function Arrepentimiento({ user, onGoToLogin, onGoToHistory, onGoToCatalog }) {
  return (
    <div className="min-h-[75vh] py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto animate-fadeIn">
      {/* Encabezado Principal */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-900 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase mb-4 border border-amber-300">
          <span>⚖️ Marco Legal Vigente</span>
          <span>•</span>
          <span>Disposición 954/2025 y Ley 24.240 (Art. 34)</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-amber-950 tracking-tight">
          Botón de Arrepentimiento
        </h1>
        <p className="mt-3 text-stone-600 text-base sm:text-lg max-w-2xl mx-auto">
          En <strong>Culto al Flan</strong> garantizamos el ejercicio irrestricto de tu derecho a revocar la aceptación de tu compra conforme a las leyes argentinas de Defensa del Consumidor.
        </p>
      </div>

      {/* Tarjeta Informativa en Castellano Llano */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-lg border border-amber-100 space-y-8">
        <div>
          <h2 className="font-serif text-2xl font-bold text-amber-900 border-b border-amber-100 pb-3 flex items-center gap-2">
            <span>📋</span>
            <span>¿Qué es y cómo funciona el derecho de arrepentimiento?</span>
          </h2>
          <p className="mt-4 text-stone-700 leading-relaxed text-sm sm:text-base">
            Si compraste un postre, flan artesanal o cualquier producto a través de nuestra tienda online, tenés derecho a arrepentirte y devolver la compra.
          </p>
        </div>

        {/* 4 Puntos Clave Exigidos por la Norma */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-amber-50/80 rounded-2xl p-5 border border-amber-200 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-800 text-white flex items-center justify-center font-bold text-lg shrink-0">
              📅
            </div>
            <div>
              <h3 className="font-bold text-amber-950 text-base">10 días corridos de plazo</h3>
              <p className="text-stone-600 text-xs sm:text-sm mt-1">
                Tenés un plazo legal de <strong>10 días corridos</strong> contados a partir de la fecha en que recibiste el producto o desde la confirmación de la compra.
              </p>
            </div>
          </div>

          <div className="bg-emerald-50/80 rounded-2xl p-5 border border-emerald-200 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold text-lg shrink-0">
              💵
            </div>
            <div>
              <h3 className="font-bold text-emerald-950 text-base">Sin costo alguno</h3>
              <p className="text-stone-600 text-xs sm:text-sm mt-1">
                La revocación no tiene <strong>ningún costo, cargo ni penalidad</strong> para vos. Se te reembolsará el 100% de lo abonado.
              </p>
            </div>
          </div>

          <div className="bg-blue-50/80 rounded-2xl p-5 border border-blue-200 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-800 text-white flex items-center justify-center font-bold text-lg shrink-0">
              ✍️
            </div>
            <div>
              <h3 className="font-bold text-blue-950 text-base">Sin tener que justificar nada</h3>
              <p className="text-stone-600 text-xs sm:text-sm mt-1">
                No tenés que explicar motivos, excusarte ni justificar tu decisión. Basta con tu manifestación expresa de arrepentirte.
              </p>
            </div>
          </div>

          <div className="bg-purple-50/80 rounded-2xl p-5 border border-purple-200 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-800 text-white flex items-center justify-center font-bold text-lg shrink-0">
              🚚
            </div>
            <div>
              <h3 className="font-bold text-purple-950 text-base">Gastos de devolución a nuestro cargo</h3>
              <p className="text-stone-600 text-xs sm:text-sm mt-1">
                Los gastos de logística, retiro o transporte de devolución <strong>los paga íntegramente el vendedor</strong> (Culto al Flan).
              </p>
            </div>
          </div>
        </div>

        {/* Mención Normativa */}
        <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 text-xs text-stone-600">
          <p>
            <strong>Reglamentación oficial:</strong> La <em>Resolución 424/2020</em> fue derogada y reemplazada por la <strong>Disposición 954/2025</strong> (exigible desde el 4 de noviembre de 2025) y complementada por la <strong>Disposición 3/2026</strong> de la Subsecretaría de Defensa del Consumidor de la Nación, en concordancia con el artículo 34 de la <strong>Ley 24.240</strong>. Al revocar, el sistema te entregará de manera inmediata un código identificador único de tu solicitud.
          </p>
        </div>

        {/* Sección de Acción Condicional según Sesión */}
        <div className="pt-4 border-t border-amber-100 flex flex-col items-center justify-center text-center">
          {user ? (
            <div className="space-y-4 max-w-md w-full">
              <div className="p-4 bg-emerald-50 text-emerald-900 rounded-2xl border border-emerald-200 text-sm">
                Has iniciado sesión como <strong>{user.nombre}</strong> ({user.email}). Podés revocar cualquiera de tus compras realizadas en los últimos 10 días desde tu historial.
              </div>
              <button
                onClick={onGoToHistory}
                id="btn-ir-historial-revocacion"
                className="w-full py-4 px-6 bg-amber-900 hover:bg-amber-950 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-base"
              >
                <span>📦 Ir a Mis Pedidos para revocar una compra</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="space-y-4 max-w-md w-full">
              <p className="text-stone-700 text-sm">
                Para identificar la compra que deseas revocar y generar tu código reglamentario de solicitud, necesitamos validar tu orden.
              </p>
              <button
                onClick={onGoToLogin}
                id="btn-iniciar-sesion-arrepentimiento"
                className="w-full py-4 px-6 bg-amber-800 hover:bg-amber-900 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-base"
              >
                <span>🔑 Iniciar sesión para ejercer el derecho</span>
              </button>
              <p className="text-xs text-stone-500">
                La norma prohíbe exigir registro previo para acceder a esta información, por lo que esta pantalla es 100% de libre acceso público.
              </p>
            </div>
          )}

          <div className="mt-6">
            <button
              onClick={onGoToCatalog}
              className="text-stone-500 hover:text-amber-900 text-xs font-semibold cursor-pointer underline"
            >
              ← Volver al catálogo de flanes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
