import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import CatalogView from './components/CatalogView';
import ProductDetailView from './components/ProductDetailView';
import CartView from './components/CartView';
import AccountView from './components/AccountView';
import Footer from './components/Footer';
import Toast from './components/Toast';
import { FLANES_DATA } from './data/flanes';
import { getProductos } from './services/api';

function App() {
  // Estado de navegación: 'catalogo' | 'detalle' | 'carrito' | 'cuenta'
  const [currentView, setCurrentView] = useState('catalogo');
  
  // Estado de catálogo de productos
  const [productos, setProductos] = useState(FLANES_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);
  
  // Pagination & Search States
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [limit] = useState(6); // Asumiendo un límite, ej 6

  // Sincronizar estado con la URL para el historial del navegador (Botones Atrás/Adelante)
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setCurrentView(params.get('view') || 'catalogo');
      setPage(parseInt(params.get('page') || '0', 10));
      setSearchQuery(params.get('q') || '');
    };

    window.addEventListener('popstate', handlePopState);
    // Leer estado inicial de la URL al cargar
    handlePopState();

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Actualizar URL cuando el estado cambie
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const currentViewParam = params.get('view') || 'catalogo';
    const currentPageParam = parseInt(params.get('page') || '0', 10);
    const currentQParam = params.get('q') || '';

    // Solo agregar al historial si realmente hubo un cambio respecto a la URL actual
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

  // Carrito de compras: array de { producto, cantidad, dedicatoria }
  const [cart, setCart] = useState([
    {
      producto: FLANES_DATA[0],
      cantidad: 1,
      dedicatoria: 'Con dulce de leche extra por favor'
    }
  ]);

  // Usuario autenticado (null si no está logueado)
  const [user, setUser] = useState({
    nombre: 'Luciano Pascutti',
    email: 'luciano@cultoalflan.com',
    es_admin: false,
    memberSince: '2024'
  });

  // Notificación Toast
  const [toast, setToast] = useState(null);

  // Intentar cargar productos desde la API de backend, con fallback a FLANES_DATA
  useEffect(() => {
    setIsLoading(true);
    getProductos(page, limit, searchQuery)
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          // Unir datos de API con las fotos e información enriquecida si es necesario
          const merged = data.map((item, index) => {
            const fallback = FLANES_DATA[index % FLANES_DATA.length];
            return {
              ...fallback,
              ...item,
              precio_final: item.precio || fallback.precio_final,
              imagen: fallback.imagen,
              imagenes_galeria: fallback.imagenes_galeria
            };
          });
          setProductos(merged);
          // Only set selected product on first load if none selected
          if (page === 0 && !searchQuery) {
            setSelectedProduct(merged[0]);
          }
        } else {
          setProductos(page === 0 ? FLANES_DATA : []);
        }
        setIsLoading(false);
      })
      .catch(err => {
        // En caso de que el backend no tenga productos cargados o no esté disponible,
        // usamos de manera transparente nuestro catálogo de alta calidad.
        console.info("Usando catálogo local enriquecido de Culto al Flan:", err.message);
        setProductos(FLANES_DATA);
        setIsLoading(false);
      });
  }, [page, limit, searchQuery]);

  // Total de unidades en el carrito
  const totalCartCount = cart.reduce((total, item) => total + item.cantidad, 0);

  // === HANDLERS DE NAVEGACIÓN Y ACCIONES ===

  const showToast = (title, message, type = 'success') => {
    setToast({ title, message, type });
  };

  // Seleccionar producto y navegar a su ficha
  const handleSelectProduct = (flan) => {
    setSelectedProduct(flan);
    setCurrentView('detalle');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Agregar al carrito con feedback visual
  const handleAddToCart = (flan, cantidad = 1, dedicatoria = '') => {
    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(item => (item.producto.id === flan.id || item.producto.nombre === flan.nombre));
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex] = {
          ...updated[existingIndex],
          cantidad: updated[existingIndex].cantidad + cantidad,
          dedicatoria: dedicatoria || updated[existingIndex].dedicatoria
        };
        return updated;
      } else {
        return [...prevCart, { producto: flan, cantidad, dedicatoria }];
      }
    });

    showToast(
      '¡Agregado al Carrito! 🍮',
      `Se ${cantidad === 1 ? 'sumó 1 unidad' : `sumaron ${cantidad} unidades`} de "${flan.nombre}" a tu pedido.`
    );
  };

  // Actualizar cantidad en carrito
  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCart(prev => prev.map(item => {
      if (item.producto.id === productId || item.producto.nombre === productId) {
        return { ...item, cantidad: newQuantity };
      }
      return item;
    }));
  };

  // Eliminar un item del carrito
  const handleRemoveItem = (productId) => {
    setCart(prev => prev.filter(item => item.producto.id !== productId && item.producto.nombre !== productId));
    showToast('Producto eliminado', 'Se quitó el flan de tu carrito de compras.', 'info');
  };

  // Vaciar carrito
  const handleClearCart = () => {
    setCart([]);
  };

  // Login
  const handleLogin = (userData) => {
    setUser(userData);
    showToast('¡Sesión Iniciada!', `Bienvenido nuevamente, ${userData.nombre}.`);
  };

  // Logout
  const handleLogout = () => {
    setUser(null);
    showToast('Sesión cerrada', 'Has cerrado tu sesión correctamente.', 'info');
  };

  // Registro
  const handleRegister = (userData) => {
    setUser(userData);
    showToast('¡Cuenta Creada con Éxito!', `¡Bienvenido al Culto al Flan, ${userData.nombre}! Disfrutá de beneficios exclusivos.`);
  };

  // Navegación con scroll al inicio
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
        cartCount={totalCartCount}
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
            cartItems={cart}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onContinueShopping={() => navigateTo('catalogo')}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {/* PANTALLA 4: CUENTA */}
        {currentView === 'cuenta' && (
          <AccountView
            user={user}
            onLogin={handleLogin}
            onLogout={handleLogout}
            onRegister={handleRegister}
            onExploreCatalog={() => navigateTo('catalogo')}
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

export default App;