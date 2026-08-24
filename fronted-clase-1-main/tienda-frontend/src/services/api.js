// URL base de la API (se lee desde el archivo .env)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// Ejemplo: obtener todos los productos
export async function getProducts() {
  const response = await fetch(`${API_URL}/products`)
  if (!response.ok) throw new Error('Error al obtener productos')
  return response.json()
}

// Ejemplo: obtener un producto por ID
export async function getProductById(id) {
  const response = await fetch(`${API_URL}/products/${id}`)
  if (!response.ok) throw new Error('Producto no encontrado')
  return response.json()
}
