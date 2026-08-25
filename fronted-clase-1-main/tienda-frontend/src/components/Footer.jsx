import React from 'react';

export default function Footer({ onNavigate }) {
  return (
    <footer className="bg-gradient-to-b from-[#220d04] to-[#120601] text-amber-100/80 pt-16 pb-12 border-t border-amber-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-amber-900/30">
          
          {/* Columna Marca & Filosofía (5 cols) */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-600 flex items-center justify-center text-2xl shadow-md">
                🍮
              </div>
              <span className="font-serif text-2xl font-black text-amber-200">
                Culto al Flan
              </span>
            </div>
            
            <p className="text-xs text-amber-200/70 leading-relaxed max-w-sm">
              Rindiendo tributo al postre más venerado de nuestra gastronomía. Horneamos a baño María con paciencia, pasión y los ingredientes más nobles de la tierra.
            </p>

            <div className="pt-2 text-xs text-amber-300/80 font-medium">
              📍 Obrador Central: Gurruchaga 1750, Palermo Soho, Buenos Aires.<br />
              📞 Atención y Pedidos Especiales: +54 (11) 4899-3322
            </div>
          </div>

          {/* Columna Navegación Rápida (3 cols) */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-serif font-bold text-amber-200 text-sm tracking-wider uppercase">
              Navegación
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('catalogo')} className="hover:text-amber-300 transition-colors cursor-pointer">
                  🍮 Catálogo de Flanes
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('detalle')} className="hover:text-amber-300 transition-colors cursor-pointer">
                  🔍 Ficha de Producto Destacado
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('carrito')} className="hover:text-amber-300 transition-colors cursor-pointer">
                  🛒 Carrito de Compras
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('cuenta')} className="hover:text-amber-300 transition-colors cursor-pointer">
                  👤 Mi Cuenta / Registro
                </button>
              </li>
            </ul>
          </div>

          {/* Columna Horarios y Cadena de Frío (4 cols) */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="font-serif font-bold text-amber-200 text-sm tracking-wider uppercase">
              Horarios & Entregas
            </h4>
            <p className="text-xs text-amber-200/70">
              ⏰ Lunes a Sábados: 10:00 a 20:30 hs.<br />
              ⏰ Domingos: 10:00 a 16:00 hs (Especial Sobremesa).
            </p>
            <div className="p-3 bg-amber-950/80 rounded-2xl border border-amber-500/20 text-[11px] text-amber-300">
              ❄️ <strong>Compromiso Térmico:</strong> Todos nuestros envíos viajan en vehículos refrigerados para preservar la cremosidad y temperatura ideal de consumo (4°C a 7°C).
            </div>
          </div>

        </div>

        {/* Footer Bottom */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-amber-300/50">
          <p>© {new Date().getFullYear()} Culto al Flan. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1">
            Hecho con amor por el buen flan casero ❤️🍮
          </p>
        </div>

      </div>
    </footer>
  );
}
