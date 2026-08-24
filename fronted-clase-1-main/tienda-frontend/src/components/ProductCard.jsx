export default function ProductCard() {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 w-full">

      {/* === IMAGEN CON BADGE === */}
      <div className="relative w-full h-52">
        <img
          src="https://placehold.co/400x200/c9a96e/fff?text=Flan"
          alt="Flan de Chocolate"
          className="w-full h-full object-cover"
        />
        {/* Badge semitransparente arriba a la izquierda */}
        <span className="absolute top-3 left-3 bg-black/50 text-white text-xs font-semibold px-2.5 py-1 rounded-full tracking-wide">
          Tradicional
        </span>
      </div>

      {/* === CONTENIDO === */}
      <div className="p-4 flex flex-col gap-2">

        {/* Nombre y Precio en la misma fila */}
        <div className="flex justify-between items-baseline gap-2">
          <h2 className="font-serif text-gray-900 text-lg font-bold leading-snug">
            Flan de Chocolate
          </h2>
          <span className="text-amber-900 font-bold text-base whitespace-nowrap">
            $5000
          </span>
        </div>

        {/* Descripción */}
        <p className="text-gray-400 text-xs leading-relaxed">
          Intenso chocolate semiamargo con base de caramelo artesanal.
        </p>

        {/* Botón ancho completo */}
        <button className="mt-1 w-full bg-[#6b3112] hover:bg-[#7c3a16] active:scale-[0.98] text-white text-sm font-semibold rounded-lg py-2.5 flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer">
          {/* Ícono de carrito SVG */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          Agregar al carrito
        </button>
      </div>

    </div>
  );
}