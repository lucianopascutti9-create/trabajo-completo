import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import CatalogView from './components/CatalogView';
import ProductDetailView from './components/ProductDetailView';
import CartView from './components/CartView';
import AccountView from './components/AccountView';
import MisPedidos from './components/MisPedidos';
import RutaProtegida from './components/RutaProtegida';
import Footer from './components/Footer';
import Toast from './components/Toast';
import { FLANES_DATA } from './data/flanes';
import { getProductos, getUsuarioActual } from './services/api';
import { CarritoProvider, useCarrito } from './context/CarritoContext';

function AppContent() {
  // Estado de navegación: 'catalogo' | 'detalle' | 'carrito' | 'cuenta' | 'mis-pedidos'
  const [currentView, setCurrentView] = useState('catalogo');
  
  // Hook useCarrito (Parte 1 - Pasos 1 a 5)
  const { items, agregar, quitar, actualizarCantidad, vaciar, totalCount } = useCarrito();

  // Estado de catálogo de productos
  const [productos, setProductos] = useState(FLANES_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  
  // Pagination & Search States
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [limit] = useState(6);

  // Sincronizar estado con la URL para el historial del navegador
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setCurrentView(params.get('view') || 'catalogo');
      setPage(parseInt(params.get('page') || '0', 10));
      setSearchQuery(params.get('q') || '');
    };

    window.addEventListener('popstate', handlePopState);
    handlePopState();

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Actualizar URL cuando el estado cambie
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const currentViewParam = params.get('view') || 'catalogo';
    const currentPageParam = parseInt(params.get('page') || '0', 10);
    const currentQParam = params.get('q') || '';

    if (currentView !== currentViewParam || page !== currentPageParam || searchQuery !== currentQParam) {
      const newParams = new URLSearchParams();
      if (currentView !== 'catalogo') newParams.set('view', currentView);
      if (page > 0) newParams.set('page', page);
      if (searchQuery) newParams.set('q', searchQuery);
      
      const qs = newParams.toString();
      const newUrl = window.location.pathname + (qs ? '?' + qs : '');
      window.history.pushState({}, '', newUrl);
    }
  }, [currentView, page, searchQuery]);

  // Producto actualmente seleccionado en la Ficha de Detalle
  const [selectedProduct, setSelectedProduct] = useState(FLANES_DATA[0]);

  // Usuario autenticado (null si no está logueado)
  const [user, setUser] = useState(null);

  // Sincronizar sesión al cargar la app
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      getUsuarioActual()
        .then((me) => {
          setUser({
            id: me.id,
            nombre: me.nombre,
            email: me.email,
            rol: me.rol,
            es_admin: me.rol === 'admin',
            memberSince: '2025',
          });
        })
        .catch(() => {
          // Token vencido o inválido
          localStorage.removeItem('access_token');
          setUser(null);
        });
    }
  }, []);

  // Notificación Toast
  const [toast, setToast] = useState(null);

  // Cargar productos desde la API de backend, con fallback a FLANES_DATA
  useEffect(() => {
    setIsLoading(true);
    getProductos(page, limit, searchQuery)
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const merged = data.map((item, index) => {
            const fallback = FLANES_DATA[index % FLANES_DATA.length];
            return {
              ...fallback,
              ...item,
              precio_final: item.precio_final || item.precio || fallback.precio_final,
              imagen: fallback.imagen,
              imagenes_galeria: fallback.imagenes_galeria,
            };
          });
          setProductos(merged);
          if (page === 0 && !searchQuery) {
            setSelectedProduct(merged[0]);
          }
        } else {
          setProductos(page === 0 ? FLANES_DATA : []);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.info('Usando catálogo local enriquecido de Culto al Flan:', err.message);
        setProductos(FLANES_DATA);
        setIsLoading(false);
      });
  }, [page, limit, searchQuery]);

  // Handlers
  const showToast = (title, message, type = 'success') => {
    setToast({ title, message, type });
  };

  const handleSelectProduct = (flan) => {
    setSelectedProduct(flan);
    setCurrentView('detalle');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 6. Conectar botón "Agregar al carrito"
  const handleAddToCart = (flan, cantidad = 1, dedicatoria = '') => {
    agregar(flan, cantidad, dedicatoria);
    showToast(
      '¡Agregado al Carrito! 🍮',
      `Se ${cantidad === 1 ? 'sumó 1 unidad' : `sumaron ${cantidad} unidades`} de "${flan.nombre}" a tu pedido.`
    );
  };

  const handleLogin = (userData) => {
    setUser(userData);
    showToast('¡Sesión Iniciada!', `Bienvenido nuevamente, ${userData.nombre}.`);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
    showToast('Sesión cerrada', 'Has cerrado tu sesión correctamente.', 'info');
  };

  const handleRegister = (userData) => {
    setUser(userData);
    showToast('¡Cuenta Creada con Éxito!', `¡Bienvenido al Culto al Flan, ${userData.nombre}!`);
  };

  const navigateTo = (view) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf6f0] text-stone-800 selection:bg-amber-800 selection:text-white">
      {/* 1. Header / Navbar Navegable */}
      <Navbar
        currentView={currentView}
        setCurrentView={navigateTo}
        cartCount={totalCount}
        user={user}
        selectedProduct={selectedProduct}
      />

      {/* 2. Contenedor Dinámico según Pantalla Seleccionada */}
      <main className="flex-1">
        {/* PANTALLA 1: CATÁLOGO */}
        {currentView === 'catalogo' && (
          <CatalogView
            productos={productos}
            onSelectProduct={handleSelectProduct}
            onAddToCart={handleAddToCart}
            isLoading={isLoading}
            error={apiError}
            page={page}
            setPage={setPage}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}

        {/* PANTALLA 2: FICHA DE PRODUCTO */}
        {currentView === 'detalle' && (
          <ProductDetailView
            producto={selectedProduct}
            allProducts={productos}
            onBackToCatalog={() => navigateTo('catalogo')}
            onAddToCart={handleAddToCart}
            onBuyNow={() => navigateTo('carrito')}
            onSelectOtherProduct={handleSelectProduct}
          />
        )}

        {/* PANTALLA 3: CARRITO */}
        {currentView === 'carrito' && (
          <CartView
            cartItems={items}
            onUpdateQuantity={actualizarCantidad}
            onRemoveItem={quitar}
            onClearCart={vaciar}
            onContinueShopping={() => navigateTo('catalogo')}
            onSelectProduct={handleSelectProduct}
            onNavigateToHistory={() => navigateTo('mis-pedidos')}
          />
        )}

        {/* PANTALLA 4: HISTORIAL DE PEDIDOS (Ruta Protegida) */}
        {currentView === 'mis-pedidos' && (
          <RutaProtegida user={user} onGoToLogin={() => navigateTo('cuenta')}>
            <MisPedidos
              onExploreCatalog={() => navigateTo('catalogo')}
              onGoToLogin={() => navigateTo('cuenta')}
            />
          </RutaProtegida>
        )}

        {/* PANTALLA 5: CUENTA */}
        {currentView === 'cuenta' && (
          <AccountView
            user={user}
            onLogin={handleLogin}
            onLogout={handleLogout}
            onRegister={handleRegister}
            onExploreCatalog={() => navigateTo('catalogo')}
            onViewOrders={() => navigateTo('mis-pedidos')}
          />
        )}
      </main>

      {/* 3. Footer Artesanal */}
      <Footer onNavigate={navigateTo} />

      {/* 4. Toast Flotante de Notificaciones */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

// 6. Envolver la app con CarritoProvider en App.jsx, por fuera de las rutas
export default function App() {
  return (
    <CarritoProvider>
      <AppContent />
    </CarritoProvider>
  );
}