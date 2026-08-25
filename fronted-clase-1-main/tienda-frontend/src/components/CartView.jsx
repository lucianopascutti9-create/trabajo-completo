import React, { useState } from 'react';

export default function CartView({
  cartItems = [],
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onContinueShopping,
  onSelectProduct
}) {
  const [shippingMethod, setShippingMethod] = useState('delivery'); // 'delivery' | 'pickup'
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  // Cálculos de montos
  const subtotal = cartItems.reduce((acc, item) => {
    const p = item.producto.precio_final ?? item.producto.precio ?? 0;
    return acc + (p * item.cantidad);
  }, 0);

  const freeShippingThreshold = 25000;
  const deliveryCost = shippingMethod === 'delivery' ? (subtotal >= freeShippingThreshold ? 0 : 2500) : 0;
  
  // Descuento por cupón
  let discountAmount = 0;
  if (appliedCoupon) {
    discountAmount = Math.round(subtotal * appliedCoupon.percentage);
  }

  const total = Math.max(0, subtotal - discountAmount + deliveryCost);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError('');
    const code = couponCode.trim().toUpperCase();

    if (code === 'CULTO10') {
      setAppliedCoupon({ code: 'CULTO10', percentage: 0.10, label: '10% OFF Especial de Bienvenida' });
      setCouponCode('');
    } else if (code === 'FLANLOVE' || code === 'FLAN15') {
      setAppliedCoupon({ code: code, percentage: 0.15, label: '15% OFF Fanáticos del Flan' });
      setCouponCode('');
    } else {
      setCouponError('Cupón inválido o expirado. Prueba con CULTO10');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  const handleCheckout = () => {
    const orderData = {
      orderId: `CULTO-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toLocaleDateString('es-AR', { dateStyle: 'long' }),
      items: cartItems,
      subtotal,
      discountAmount,
      deliveryCost,
      total,
      shippingMethod
    };
    setConfirmedOrder(orderData);
    setOrderModalOpen(true);
  };

  const handleFinishOrder = () => {
    setOrderModalOpen(false);
    onClearCart && onClearCart();
    onContinueShopping && onContinueShopping();
  };

  // Carrito Vacío
  if (cartItems.length === 0 && !confirmedOrder) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto animate-fadeIn">
        <div className="w-24 h-24 rounded-full bg-amber-100/80 flex items-center justify-center text-5xl mb-6 shadow-inner">
          🍮
        </div>
        <h2 className="font-serif text-3xl font-bold text-amber-950 mb-3">
          Tu carrito está esperando por un flan
        </h2>
        <p className="text-stone-600 text-sm mb-8 leading-relaxed">
          Aún no has agregado ningún manjar tradicional. Explora nuestra carta de flanes horneados con dulce de leche colonial, vainilla Bourbon y recetas premiadas.
        </p>
        <button
          onClick={onContinueShopping}
          className="bg-amber-900 hover:bg-amber-950 text-white font-bold text-sm px-8 py-4 rounded-2xl transition-all shadow-lg hover:shadow-xl cursor-pointer flex items-center gap-2"
        >
          <span>Explorar Catálogo de Flanes</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto animate-fadeIn">
      
      {/* Encabezado del Carrito */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-amber-900/10">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-amber-950">
            Resumen de tu Pedido
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Revisá los flanes seleccionados antes de proceder a la entrega refrigerada.
          </p>
        </div>

        <button
          onClick={onContinueShopping}
          className="inline-flex items-center gap-2 text-xs font-bold text-amber-900 hover:text-amber-700 bg-amber-100/70 hover:bg-amber-100 px-4 py-2.5 rounded-xl transition-all cursor-pointer w-fit"
        >
          <span>← Continuar Comprando</span>
        </button>
      </div>

      {/* Grid Carrito: Lista de Items + Columna de Totales */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* === LISTA DE PRODUCTOS AGREGADOS (7 COLUMNAS) === */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="bg-white rounded-3xl p-4 sm:p-6 border border-amber-900/10 shadow-sm divide-y divide-amber-900/5">
            {cartItems.map((item) => {
              const { producto, cantidad, dedicatoria } = item;
              const unitPrice = producto.precio_final ?? producto.precio ?? 0;
              const itemTotal = unitPrice * cantidad;

              return (
                <div key={producto.id || producto.nombre} className="py-5 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  
                  {/* Foto e Info */}
                  <div className="flex items-center gap-4 flex-1">
                    <div 
                      onClick={() => onSelectProduct && onSelectProduct(producto)}
                      className="w-20 h-20 rounded-2xl overflow-hidden bg-amber-50 shrink-0 border border-amber-900/10 cursor-pointer group"
                    >
                      <img 
                        src={producto.imagen || "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=400&q=80"} 
                        alt={producto.nombre}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-amber-800 tracking-wider">
                        {producto.categoria || 'Flan'}
                      </span>
                      <h3 
                        onClick={() => onSelectProduct && onSelectProduct(producto)}
                        className="font-serif font-bold text-base text-stone-900 hover:text-amber-900 cursor-pointer transition-colors"
                      >
                        {producto.nombre}
                      </h3>
                      <p className="text-xs text-stone-500">
                        ${unitPrice.toLocaleString('es-AR')} c/u
                      </p>
                      {dedicatoria && (
                        <p className="text-[11px] text-amber-900/80 italic bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/50">
                          💌 &ldquo;{dedicatoria}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Controles de Cantidad y Total de Línea */}
                  <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                    
                    {/* Selector de Cantidad */}
                    <div className="flex items-center bg-stone-100 rounded-xl p-1 border border-stone-200">
                      <button
                        onClick={() => onUpdateQuantity(producto.id, cantidad - 1)}
                        className="w-7 h-7 rounded-lg bg-white text-stone-700 font-black text-xs flex items-center justify-center hover:bg-amber-100 transition-colors cursor-pointer"
                        title="Disminuir"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-serif font-black text-stone-900 text-sm">
                        {cantidad}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(producto.id, cantidad + 1)}
                        className="w-7 h-7 rounded-lg bg-white text-stone-700 font-black text-xs flex items-center justify-center hover:bg-amber-100 transition-colors cursor-pointer"
                        title="Aumentar"
                      >
                        +
                      </button>
                    </div>

                    {/* Precio Total Item */}
                    <div className="text-right min-w-[80px]">
                      <span className="font-serif font-black text-base text-amber-950 block">
                        ${itemTotal.toLocaleString('es-AR')}
                      </span>
                    </div>

                    {/* Botón Eliminar */}
                    <button
                      onClick={() => onRemoveItem(producto.id)}
                      className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                      title="Quitar producto"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>

                  </div>

                </div>
              );
            })}
          </div>

          {/* Opciones de Entrega y Envío */}
          <div className="bg-white rounded-3xl p-5 border border-amber-900/10 shadow-sm space-y-3">
            <h3 className="font-serif font-bold text-base text-stone-900">
              Método de Entrega
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Delivery Refrigerado */}
              <div
                onClick={() => setShippingMethod('delivery')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  shippingMethod === 'delivery'
                    ? 'bg-amber-50/70 border-amber-800 ring-2 ring-amber-600/30'
                    : 'bg-stone-50 border-stone-200 hover:border-amber-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-950">🚚 Envío Refrigerado Express</span>
                  <span className="text-xs font-bold text-amber-900">
                    {subtotal >= freeShippingThreshold ? '¡GRATIS!' : '$2.500'}
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 mt-2">
                  Despacho en caja isotérmica a CABA y GBA en el día.
                </p>
                {subtotal < freeShippingThreshold && (
                  <span className="text-[10px] text-amber-700 font-semibold mt-1">
                    Sumá ${(freeShippingThreshold - subtotal).toLocaleString('es-AR')} más para envío gratis.
                  </span>
                )}
              </div>

              {/* Retiro en Obrador */}
              <div
                onClick={() => setShippingMethod('pickup')}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  shippingMethod === 'pickup'
                    ? 'bg-amber-50/70 border-amber-800 ring-2 ring-amber-600/30'
                    : 'bg-stone-50 border-stone-200 hover:border-amber-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-900">🏪 Retiro en Obrador</span>
                  <span className="text-xs font-bold text-emerald-700">GRATIS</span>
                </div>
                <p className="text-[11px] text-stone-500 mt-2">
                  Palermo Soho, Gurruchaga 1750 (Lun a Sáb de 10 a 20hs).
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* === RESUMEN DEL PEDIDO Y TOTALES (5 COLUMNAS) === */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-white rounded-3xl p-6 border border-amber-900/15 shadow-lg space-y-5">
            <h2 className="font-serif text-xl font-bold text-stone-900 pb-3 border-b border-amber-900/10">
              Resumen de Compra
            </h2>

            {/* Cupón de descuento */}
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                ¿Tenés un cupón de descuento?
              </label>
              {!appliedCoupon ? (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ej: CULTO10"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 px-3.5 py-2 rounded-xl text-xs uppercase bg-stone-50 border border-stone-200 focus:border-amber-700 focus:ring-1 focus:ring-amber-200 outline-none font-bold"
                  />
                  <button
                    type="submit"
                    className="bg-amber-900 hover:bg-amber-950 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                  >
                    Aplicar
                  </button>
                </form>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex items-center justify-between">
                  <div className="text-xs text-emerald-800">
                    <strong>✓ {appliedCoupon.code}</strong>: {appliedCoupon.label}
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-xs text-red-600 hover:underline font-semibold ml-2 cursor-pointer"
                  >
                    Quitar
                  </button>
                </div>
              )}
              {couponError && (
                <p className="text-xs text-red-600 mt-1">{couponError}</p>
              )}
            </div>

            {/* Desglose de Precios */}
            <div className="space-y-3 pt-2 text-sm text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal ({cartItems.reduce((a, b) => a + b.cantidad, 0)} productos):</span>
                <span className="font-semibold text-stone-900">${subtotal.toLocaleString('es-AR')}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Descuento aplicado ({appliedCoupon.code}):</span>
                  <span>-${discountAmount.toLocaleString('es-AR')}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Costo de envío:</span>
                <span className="font-semibold text-stone-900">
                  {deliveryCost === 0 ? (
                    <span className="text-emerald-700 font-bold">¡GRATIS!</span>
                  ) : (
                    `$${deliveryCost.toLocaleString('es-AR')}`
                  )}
                </span>
              </div>

              <div className="pt-4 border-t border-amber-900/10 flex justify-between items-baseline">
                <div>
                  <span className="font-serif text-lg font-bold text-stone-900 block">Total Final:</span>
                  <span className="text-[11px] text-stone-400">Impuestos y empaque incluidos</span>
                </div>
                <div className="text-right">
                  <span className="font-serif text-3xl font-black text-amber-950 block">
                    ${total.toLocaleString('es-AR')}
                  </span>
                  <span className="text-[11px] text-amber-800 font-bold">
                    O hasta 3 cuotas de ${(total / 3).toFixed(0).toLocaleString('es-AR')}
                  </span>
                </div>
              </div>
            </div>

            {/* Botón de Checkout Principal */}
            <button
              onClick={handleCheckout}
              className="w-full py-4 px-6 rounded-2xl bg-amber-900 hover:bg-amber-950 text-white font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-98 cursor-pointer"
            >
              <span>Proceder al Pago Seguro</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>

            {/* Badges de Seguridad */}
            <div className="pt-2 flex items-center justify-center gap-4 text-stone-400 text-xs">
              <span className="flex items-center gap-1">🔒 Pago 100% Encriptado</span>
              <span>•</span>
              <span className="flex items-center gap-1">🍮 Garantía de Sabor</span>
            </div>

          </div>

        </div>

      </div>

      {/* === MODAL DE PEDIDO CONFIRMADO (SIMULACIÓN DE CHECKOUT) === */}
      {orderModalOpen && confirmedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-amber-900/20 text-center space-y-5 animate-caramel-pulse">
            
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-3xl mx-auto shadow-inner">
              ✓
            </div>

            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-amber-800">
                ¡Pedido Recibido con Éxito!
              </span>
              <h3 className="font-serif text-2xl font-black text-amber-950 mt-1">
                Gracias por unirte al Culto
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Código de seguimiento: <strong className="text-amber-900">{confirmedOrder.orderId}</strong>
              </p>
            </div>

            <div className="bg-amber-50/80 rounded-2xl p-4 text-xs text-stone-700 text-left space-y-2 border border-amber-200">
              <div className="flex justify-between font-semibold text-amber-950 pb-1 border-b border-amber-200">
                <span>Detalle del Pedido:</span>
                <span>${confirmedOrder.total.toLocaleString('es-AR')}</span>
              </div>
              <ul className="space-y-1 text-stone-600">
                {confirmedOrder.items.map((it, i) => (
                  <li key={i} className="flex justify-between">
                    <span>{it.cantidad}x {it.producto.nombre}</span>
                    <span>${((it.producto.precio_final || it.producto.precio) * it.cantidad).toLocaleString('es-AR')}</span>
                  </li>
                ))}
              </ul>
              <p className="text-[11px] text-amber-900 pt-1">
                🚚 Entrega: {confirmedOrder.shippingMethod === 'delivery' ? 'Despacho refrigerado express' : 'Retiro en Obrador Palermo'}
              </p>
            </div>

            <button
              onClick={handleFinishOrder}
              className="w-full bg-amber-900 hover:bg-amber-950 text-white font-bold text-sm py-3.5 rounded-xl transition-all cursor-pointer shadow-md"
            >
              Volver a la Tienda
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
