const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Headers con el token Bearer para peticiones protegidas
export function authHeaders() {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// 3. Manejar respuesta según consigna:
// - 401 traducido (sesión vencida)
// - 409 mostrando el detail tal como viene del backend (falta de stock)
// - mensaje genérico para el resto
export async function manejarRespuesta(res) {
  if (res.ok) {
    return res.json();
  }

  let errorData = null;
  try {
    errorData = await res.json();
  } catch (e) {
    // Si no es json válido, queda en null
  }

  if (res.status === 401) {
    throw new Error('Tu sesión ha vencido o no has iniciado sesión. Por favor inicia sesión nuevamente.');
  }

  if (res.status === 409) {
    throw new Error(errorData?.detail || 'Conflicto: No hay stock suficiente para completar el pedido.');
  }

  throw new Error(errorData?.detail || `Ocurrió un error inesperado al procesar la solicitud (Código ${res.status}).`);
}

// Listar productos
export async function getProductos(page = 0, limit = 10, nombre = '') {
  const queryParams = new URLSearchParams();
  queryParams.append('page', page);
  queryParams.append('limit', limit);
  if (nombre) {
    queryParams.append('nombre', nombre);
  }

  const response = await fetch(`${BASE_URL}/productos?${queryParams.toString()}`);
  if (!response.ok) throw new Error('Error al obtener productos');
  return response.json();
}

// Parte 2 — Confirmar la compra:
// La regla que no se negocia: solo viajan producto_id y cantidad
export async function crearPedido(items) {
  const payload = {
    items: items.map((it) => ({
      producto_id: it.producto?.id ?? it.producto_id,
      cantidad: it.cantidad,
    })),
  };

  const response = await fetch(`${BASE_URL}/pedidos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });

  return manejarRespuesta(response);
}

// Parte 4 — El historial
export async function getMisPedidos() {
  const response = await fetch(`${BASE_URL}/pedidos/mis-pedidos`, {
    method: 'GET',
    headers: {
      ...authHeaders(),
    },
  });

  return manejarRespuesta(response);
}

// Funciones de autenticación contra FastAPI
export async function loginUsuario(username, password) {
  const formData = new URLSearchParams();
  formData.append('username', username);
  formData.append('password', password);

  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  });

  if (!response.ok) {
    let errorMsg = 'Credenciales inválidas';
    try {
      const err = await response.json();
      errorMsg = err.detail || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }

  const data = await response.json();
  if (data.access_token) {
    localStorage.setItem('access_token', data.access_token);
  }
  return data;
}

export async function getUsuarioActual() {
  const response = await fetch(`${BASE_URL}/auth/me`, {
    method: 'GET',
    headers: {
      ...authHeaders(),
    },
  });
  if (!response.ok) throw new Error('No autenticado');
  return response.json();
}
