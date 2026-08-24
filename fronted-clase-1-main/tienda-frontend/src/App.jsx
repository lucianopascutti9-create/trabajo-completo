import { useState, useEffect } from 'react'
import ProductCard from './components/ProductCard'
import { getProductos } from './services/api'

function App() {
  const [productos, setProductos] = useState([])

  useEffect(() => {
    getProductos()
      .then(data => setProductos(data))
      .catch(error => console.error("Error cargando productos:", error))
  }, [])

  return (
    <div className="min-h-screen bg-[#f5f0e8] flex flex-col items-center py-10 px-4">
      {/* Header estilo "Culto al Flan" */}
      <h1 className="font-serif text-2xl font-bold text-amber-900 mb-2">Culto al Flan</h1>
      <p className="text-gray-500 text-sm mb-8">Nuestra Selección</p>

      {/* Lista de cards en columna, ancho móvil */}
      <div className="flex flex-col gap-6 w-full max-w-sm">
        {productos.map(producto => (
          <ProductCard key={producto.id || producto.nombre} producto={producto} />
        ))}
      </div>
    </div>
  )
}

export default App