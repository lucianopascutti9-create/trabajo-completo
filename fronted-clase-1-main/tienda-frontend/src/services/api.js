const API_URL = '/api'

export async function getProductos() {
  const response = await fetch(`${API_URL}/productos`)
  if (!response.ok) throw new Error('Error al obtener productos')
  return response.json()
}
