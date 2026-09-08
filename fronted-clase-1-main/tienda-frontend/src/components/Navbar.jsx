import React, { useState } from 'react';

export default function Navbar({ 
  currentView, 
  setCurrentView, 
  cartCount = 0, 
  user = null,
  selectedProduct = null 
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#faf6f0]/90 border-b border-amber-900/10 shadow-xs">
      {/* Top Banner Informativo */}
      <div className="bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 text-amber-200 text-xs py-1.5 px-4 text-center font-medium tracking-wide">
        <span>✨ <strong>Culto al Flan</strong> • Despacho refrigerado en el día | 3 y 6 cuotas sin interés | Envío gratis desde $25.000 ✨</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Marca */}
          <button 
            onClick={() => setCurrentView('catalogo')}
            className="flex items-center gap-3 text-left group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 flex items-center justify-center shadow-md shadow-amber-900/20 group-hover:scale-105 transition-transform">
              <span className="text-2xl" role="img" aria-label="Flan">🍮</span>
            </div>
            <div>
              <span className="font-serif text-2xl font-bold text-amber-950 tracking-tight block group-hover:text-amber-800 transition-colors">
                Culto al Flan
              </span>
              <span className="text-[11px] uppercase tracking-widest text-amber-700 font-semibold block">
                Postres Tradicionales de Autor
              </span>
            </div>
          </button>

          {/* Navegación Desktop */}
          <nav className="hidden md:flex items-center gap-1 bg-amber-900/5 p-1.5 rounded-full border border-amber-900/10">
            <button
              onClick={() => setCurrentView('catalogo')}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer ${
                currentView === 'catalogo'
                  ? 'bg-amber-900 text-white shadow-sm'
                  : 'text-amber-950/80 hover:text-amber-900 hover:bg-amber-900/10'
              }`}
            >
              Catálogo de Flanes
            </button>

            <button
              onClick={() => setCurrentView('detalle')}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentView === 'detalle'
                  ? 'bg-amber-900 text-white shadow-sm'
                  : 'text-amber-950/80 hover:text-amber-900 hover:bg-amber-900/10'
              }`}
            >
              <span>Ficha de Producto</span>
              {selectedProduct && (
                <span className="text-[10px] bg-amber-700 text-amber-100 px-1.5 py-0.5 rounded-full">
                  {selectedProduct.nombre.split(' ')[1] || 'Activo'}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentView('carrito')}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                currentView === 'carrito'
                  ? 'bg-amber-900 text-white shadow-sm'
                  : 'text-amber-950/80 hover:text-amber-900 hover:bg-amber-900/10'
              }`}
            >
              <span>Carrito</span>
              {cartCount > 0 && (
                <span className="bg-amber-600 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-caramel-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            {user && (
              <button
                onClick={() => setCurrentView('mis-pedidos')}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  currentView === 'mis-pedidos'
                    ? 'bg-amber-900 text-white shadow-sm'
                    : 'text-amber-950/80 hover:text-amber-900 hover:bg-amber-900/10'
                }`}
              >
                <span>📦 Mis Pedidos</span>
              </button>
            )}

            <button
              onClick={() => setCurrentView('cuenta')}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentView === 'cuenta'
                  ? 'bg-amber-900 text-white shadow-sm'
                  : 'text-amber-950/80 hover:text-amber-900 hover:bg-amber-900/10'
              }`}
            >
              <span>{user ? `Hola, ${user.nombre.split(' ')[0]}` : 'Mi Cuenta'}</span>
            </button>
          </nav>

          {/* Acciones Rápidas a la derecha */}
          <div className="flex items-center gap-3">
            {/* Botón Carrito con Icono */}
            <button
              onClick={() => setCurrentView('carrito')}
              className="relative p-2.5 rounded-xl bg-amber-100/80 hover:bg-amber-200/80 text-amber-950 transition-all border border-amber-200 cursor-pointer flex items-center gap-2"
              title="Ver Carrito"
            >
              <svg className="w-5 h-5 text-amber-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="hidden sm:inline text-xs font-bold text-amber-950">
                {cartCount > 0 ? `${cartCount} items` : 'Carrito'}
              </span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-800 text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-md">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Botón Cuenta Icono */}
            <button
              onClick={() => setCurrentView('cuenta')}
              className={`p-2.5 rounded-xl transition-all border cursor-pointer ${
                user 
                  ? 'bg-amber-900 text-amber-100 border-amber-800' 
                  : 'bg-white/80 hover:bg-amber-50 text-amber-950 border-amber-200'
              }`}
              title={user ? `Cuenta de ${user.nombre}` : "Iniciar Sesión / Registrarse"}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl bg-amber-100/60 text-amber-950 hover:bg-amber-100 cursor-pointer"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu desplegable */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#faf6f0] border-t border-amber-900/10 px-4 py-3 space-y-2 shadow-lg animate-fadeIn">
          <button
            onClick={() => { setCurrentView('catalogo'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between ${
              currentView === 'catalogo' ? 'bg-amber-900 text-white' : 'text-amber-950 hover:bg-amber-100'
            }`}
          >
            <span>🍮 Catálogo de Flanes</span>
            <span className="text-xs opacity-75">Explorar todo</span>
          </button>

          <button
            onClick={() => { setCurrentView('detalle'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between ${
              currentView === 'detalle' ? 'bg-amber-900 text-white' : 'text-amber-950 hover:bg-amber-100'
            }`}
          >
            <span>🔍 Ficha de Producto</span>
            {selectedProduct && (
              <span className="text-xs bg-amber-700 text-white px-2 py-0.5 rounded-full">
                {selectedProduct.nombre}
              </span>
            )}
          </button>

          <button
            onClick={() => { setCurrentView('carrito'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between ${
              currentView === 'carrito' ? 'bg-amber-900 text-white' : 'text-amber-950 hover:bg-amber-100'
            }`}
          >
            <span>🛒 Carrito de Compras</span>
            <span className="bg-amber-700 text-white text-xs px-2 py-0.5 rounded-full font-bold">
              {cartCount}
            </span>
          </button>

          {user && (
            <button
              onClick={() => { setCurrentView('mis-pedidos'); setMobileMenuOpen(false); }}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between ${
                currentView === 'mis-pedidos' ? 'bg-amber-900 text-white' : 'text-amber-950 hover:bg-amber-100'
              }`}
            >
              <span>📦 Mis Pedidos (Historial)</span>
              <span className="text-xs opacity-75">Ver compras</span>
            </button>
          )}

          <button
            onClick={() => { setCurrentView('cuenta'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between ${
              currentView === 'cuenta' ? 'bg-amber-900 text-white' : 'text-amber-950 hover:bg-amber-100'
            }`}
          >
            <span>👤 {user ? `Mi Cuenta (${user.nombre})` : 'Mi Cuenta / Login'}</span>
          </button>
        </div>
      )}
    </header>
  );
}
