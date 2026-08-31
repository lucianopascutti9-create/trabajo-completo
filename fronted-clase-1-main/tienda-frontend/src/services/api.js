const API_URL = '/api'

export async function getProductos(page = 0, limit = 10, nombre = '') {
  const queryParams = new URLSearchParams();
  queryParams.append('page', page);
  queryParams.append('limit', limit);
  if (nombre) {
    queryParams.append('nombre', nombre);
  }
  
  const response = await fetch(`${API_URL}/productos?${queryParams.toString()}`);
  if (!response.ok) throw new Error('Error al obtener productos')
  return response.json()
}
