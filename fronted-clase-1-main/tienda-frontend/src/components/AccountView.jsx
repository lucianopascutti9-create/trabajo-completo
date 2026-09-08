import React, { useState } from 'react';
import { loginUsuario, getUsuarioActual } from '../services/api';

export default function AccountView({ 
  user, 
  onLogin, 
  onLogout, 
  onRegister,
  onExploreCatalog,
  onViewOrders
}) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('');
  const [regNewsletter, setRegNewsletter] = useState(true);
  const [regError, setRegError] = useState('');

  // Forgot password modal
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail || !loginPassword) {
      setLoginError('Por favor ingresa tu email y contraseña.');
      return;
    }

    setIsSubmitting(true);
    try {
      await loginUsuario(loginEmail, loginPassword);
      const me = await getUsuarioActual();
      onLogin({
        id: me.id,
        nombre: me.nombre,
        email: me.email,
        rol: me.rol,
        es_admin: me.rol === 'admin',
        memberSince: '2025'
      });
    } catch (err) {
      setLoginError(err.message || 'Error al iniciar sesión con el backend.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setIsSubmitting(true);
    setLoginError('');
    try {
      await loginUsuario('luciano@test.com', 'Password123!');
      const me = await getUsuarioActual();
      onLogin({
        id: me.id,
        nombre: me.nombre,
        email: me.email,
        rol: me.rol,
        es_admin: me.rol === 'admin',
        memberSince: '2025'
      });
    } catch (err) {
      // Fallback
      onLogin({
        id: 3,
        nombre: 'Luciano Pascutti',
        email: 'luciano@test.com',
        es_admin: false,
        memberSince: '2025'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setRegError('');

    if (!regName || !regEmail || !regPassword) {
      setRegError('Por favor completa todos los campos requeridos.');
      return;
    }

    if (regPassword !== regPasswordConfirm) {
      setRegError('Las contraseñas no coinciden.');
      return;
    }

    onRegister({
      nombre: regName,
      email: regEmail,
      telefono: regPhone,
      newsletter: regNewsletter,
      es_admin: false,
      memberSince: '2025'
    });
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (forgotEmail) {
      setForgotSent(true);
      setTimeout(() => {
        setForgotSent(false);
        setForgotModalOpen(false);
        setForgotEmail('');
      }, 2500);
    }
  };

  // === VISTA DE USUARIO AUTENTICADO ===
  if (user) {
    return (
      <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto animate-fadeIn space-y-8">
        
        {/* Header Perfil */}
        <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 rounded-3xl p-6 sm:p-10 text-amber-50 shadow-xl border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-600/30 border border-amber-400/40 flex items-center justify-center text-3xl sm:text-4xl shadow-inner">
              🍮
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] bg-amber-500/20 text-amber-300 font-bold px-2.5 py-0.5 rounded-full border border-amber-400/30">
                  Miembro Devoto Oficial ⭐
                </span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-white">
                ¡Hola, {user.nombre}!
              </h1>
              <p className="text-xs sm:text-sm text-amber-200/80">
                {user.email} • Amante del flan desde {user.memberSince || '2025'}
              </p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="px-4 py-2.5 rounded-xl bg-black/30 hover:bg-black/50 text-amber-200 text-xs font-bold transition-all border border-amber-500/20 cursor-pointer"
          >
            Cerrar Sesión
          </button>
        </div>

        {/* Paneles del Perfil */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Historial de Pedidos Recientes (7 cols) */}
          <div className="md:col-span-7 bg-white rounded-3xl p-6 border border-amber-900/10 shadow-sm space-y-4">
            <h2 className="font-serif text-xl font-bold text-stone-900 pb-2 border-b border-amber-900/10">
              Historial de Pedidos Recientes
            </h2>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-amber-900">#CULTO-849201</span>
                  <h4 className="font-serif font-bold text-sm text-stone-800">1x Flan Mixto Tradicional</h4>
                  <span className="text-[11px] text-stone-400">Entregado el 18 de Febrero, 2025</span>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                  Entregado ✓
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-amber-900">#CULTO-912044</span>
                  <h4 className="font-serif font-bold text-sm text-stone-800">1x Flan de Dulce de Leche Volcánico</h4>
                  <span className="text-[11px] text-stone-500">En preparación con cadena de frío</span>
                </div>
                <span className="text-xs font-bold text-amber-800 bg-amber-200/80 px-2.5 py-1 rounded-full animate-pulse">
                  En Obrador ⏳
                </span>
              </div>
            </div>

            {onViewOrders && (
              <button
                onClick={onViewOrders}
                className="w-full mt-3 py-3 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 text-xs font-bold transition-all cursor-pointer text-center flex items-center justify-center gap-2"
              >
                <span>📦 Ver Mi Historial de Pedidos Real</span>
              </button>
            )}

            <button
              onClick={onExploreCatalog}
              className="w-full mt-2 py-3 rounded-xl bg-amber-900 hover:bg-amber-950 text-white text-xs font-bold transition-all cursor-pointer text-center"
            >
              Hacer un nuevo pedido de flanes →
            </button>
          </div>

          {/* Datos y Direcciones Guardadas (5 cols) */}
          <div className="md:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-amber-900/10 shadow-sm space-y-3">
              <h3 className="font-serif font-bold text-base text-stone-900">
                📍 Dirección de Entrega Habitual
              </h3>
              <div className="bg-stone-50 p-3.5 rounded-2xl text-xs text-stone-700 space-y-1 border border-stone-200">
                <p className="font-bold text-amber-950">Domicilio Principal</p>
                <p>Av. Coronel Díaz 2100, Piso 4 B</p>
                <p>Palermo, Ciudad Autónoma de Buenos Aires</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-amber-900/10 shadow-sm space-y-3">
              <h3 className="font-serif font-bold text-base text-stone-900">
                🎁 Beneficio Club del Flan
              </h3>
              <p className="text-xs text-stone-600">
                Tenés <strong>15% OFF</strong> acumulado en tu próximo flan usando el código <strong>FLANLOVE</strong> en el carrito.
              </p>
            </div>
          </div>

        </div>

      </div>
    );
  }

  // === VISTA DE LOGIN / REGISTRO ===
  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-lg mx-auto animate-fadeIn">
      
      {/* Tarjeta Principal */}
      <div className="bg-white rounded-3xl border border-amber-900/15 shadow-xl overflow-hidden">
        
        {/* Cabecera con Marca */}
        <div className="bg-gradient-to-b from-[#381c0d] to-[#4d2511] text-amber-50 p-8 text-center relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-amber-600/30 border border-amber-400/40 flex items-center justify-center text-3xl mx-auto shadow-inner mb-3">
            🍮
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-white">
            Culto al Flan
          </h1>
          <p className="text-xs text-amber-200/80 mt-1">
            Ingresá a tu cuenta para gestionar tus pedidos y acceder a beneficios exclusivos.
          </p>

          {/* Botón Demo Rápido */}
          <button
            onClick={handleQuickDemoLogin}
            className="mt-4 inline-flex items-center gap-1.5 text-[11px] bg-amber-500/20 hover:bg-amber-500/40 text-amber-200 font-bold px-3 py-1.5 rounded-full border border-amber-400/30 transition-colors cursor-pointer"
          >
            <span>⚡ Ingreso Rápido con 1 Clic (Demo)</span>
          </button>
        </div>

        {/* Selector de Tabs: Iniciar Sesión / Crear Cuenta */}
        <div className="grid grid-cols-2 p-1.5 bg-stone-100 border-b border-stone-200">
          <button
            onClick={() => { setActiveTab('login'); setLoginError(''); setRegError(''); }}
            className={`py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'bg-white text-amber-950 shadow-sm'
                : 'text-stone-500 hover:text-amber-900'
            }`}
          >
            Iniciar Sesión
          </button>

          <button
            onClick={() => { setActiveTab('register'); setLoginError(''); setRegError(''); }}
            className={`py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'bg-white text-amber-950 shadow-sm'
                : 'text-stone-500 hover:text-amber-900'
            }`}
          >
            Crear Cuenta
          </button>
        </div>

        <div className="p-6 sm:p-8">
          
          {/* ================= FORMULARIO LOGIN ================= */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              
              {loginError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                  {loginError}
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  placeholder="ejemplo@cultoalflan.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 focus:border-amber-700 focus:ring-1 focus:ring-amber-200 outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-stone-700">
                    Contraseña
                  </label>
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(true)}
                    className="text-[11px] text-amber-800 hover:underline font-semibold cursor-pointer"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 focus:border-amber-700 focus:ring-1 focus:ring-amber-200 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-stone-400 hover:text-stone-600 text-xs cursor-pointer"
                  >
                    {showPassword ? "Ocultar" : "Ver"}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs text-stone-600 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-amber-900 focus:ring-amber-800" />
                  <span>Recordar mi sesión</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl bg-amber-900 hover:bg-amber-950 text-white font-bold text-xs sm:text-sm transition-all shadow-md hover:shadow-lg cursor-pointer"
              >
                Iniciar Sesión
              </button>

              {/* Divisor */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-stone-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-2 text-stone-400">o continuar con</span>
                </div>
              </div>

              {/* Botones Sociales Mock */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onLogin({ nombre: 'Usuario Google', email: 'usuario@gmail.com', es_admin: false })}
                  className="py-2.5 px-3 rounded-xl border border-stone-200 hover:bg-stone-50 text-xs font-semibold text-stone-700 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <span>🌐 Google</span>
                </button>
                <button
                  type="button"
                  onClick={() => onLogin({ nombre: 'Usuario Apple', email: 'usuario@apple.com', es_admin: false })}
                  className="py-2.5 px-3 rounded-xl border border-stone-200 hover:bg-stone-50 text-xs font-semibold text-stone-700 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <span>🍎 Apple</span>
                </button>
              </div>

            </form>
          )}

          {/* ================= FORMULARIO REGISTRO ================= */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              
              {regError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                  {regError}
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  placeholder="Ej: Clara Benítez"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 focus:border-amber-700 focus:ring-1 focus:ring-amber-200 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  placeholder="tu@email.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 focus:border-amber-700 focus:ring-1 focus:ring-amber-200 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Teléfono / WhatsApp (para coordinación de entrega)
                </label>
                <input
                  type="tel"
                  placeholder="+54 9 11 5555-1234"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 focus:border-amber-700 focus:ring-1 focus:ring-amber-200 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 focus:border-amber-700 focus:ring-1 focus:ring-amber-200 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Confirmar
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={regPasswordConfirm}
                    onChange={(e) => setRegPasswordConfirm(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-800 focus:border-amber-700 focus:ring-1 focus:ring-amber-200 outline-none"
                  />
                </div>
              </div>

              <label className="flex items-start gap-2 text-xs text-stone-600 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={regNewsletter}
                  onChange={(e) => setRegNewsletter(e.target.checked)}
                  className="mt-0.5 rounded text-amber-900 focus:ring-amber-800"
                />
                <span>Quiero recibir invitaciones a catas exclusivas de flanes y promociones de temporada.</span>
              </label>

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl bg-amber-900 hover:bg-amber-950 text-white font-bold text-xs sm:text-sm transition-all shadow-md hover:shadow-lg cursor-pointer"
              >
                Crear Mi Cuenta
              </button>

            </form>
          )}

        </div>

      </div>

      {/* MODAL OLVIDÉ MI CONTRASEÑA */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-amber-900/20 text-center space-y-4">
            <h3 className="font-serif text-xl font-bold text-amber-950">
              Recuperar Contraseña
            </h3>
            <p className="text-xs text-stone-500">
              Ingresá tu email registrado y te enviaremos un enlace de recuperación.
            </p>

            {forgotSent ? (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium">
                ✓ Te hemos enviado las instrucciones a tu correo.
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3">
                <input
                  type="email"
                  required
                  placeholder="tu@email.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-700"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-amber-900 text-white text-xs font-bold hover:bg-amber-950"
                  >
                    Enviar Enlace
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
