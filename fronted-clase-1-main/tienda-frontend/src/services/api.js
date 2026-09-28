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
  } catch {
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

// Parte 2 — Arrepentimiento / Revocar compra (Disposición 954/2025 y Ley 24.240)
export async function revocarPedido(pedidoId) {
  const response = await fetch(`${BASE_URL}/pedidos/${pedidoId}/revocar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
  });

  if (response.status === 201) {
    return response.json();
  }

  let errorData = null;
  try {
    errorData = await response.json();
  } catch {
    // Si no es JSON válido
  }

  if (response.status === 404) {
    throw new Error(errorData?.detail || `Pedido #${pedidoId} no encontrado.`);
  }

  if (response.status === 409) {
    // Mostrá el detail tal como viene del backend
    throw new Error(errorData?.detail || 'Conflicto al intentar revocar el pedido.');
  }

  if (response.status === 401) {
    throw new Error('Tu sesión ha vencido o no has iniciado sesión.');
  }

  throw new Error(errorData?.detail || `Error al procesar la solicitud de revocación (Código ${response.status}).`);
}

// Parte 3 — Mis datos personales (Ley 25.326)
export async function getMisDatos() {
  const response = await fetch(`${BASE_URL}/usuarios/me`, {
    method: 'GET',
    headers: {
      ...authHeaders(),
    },
  });

  return manejarRespuesta(response);
}

// Descarga segura con fetch, blob y URL efímera
export async function descargarMisDatosBlob() {
  const response = await fetch(`${BASE_URL}/usuarios/me/exportar`, {
    method: 'GET',
    headers: {
      ...authHeaders(),
    },
  });

  if (!response.ok) {
    let errorDetail = '';
    try {
      const err = await response.json();
      errorDetail = err.detail;
    } catch {}
    throw new Error(errorDetail || `Error al exportar datos personales (${response.status})`);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'mis-datos-culto-al-flan.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

// Parte 4 — Darse de baja / Supresión de datos personales
export async function eliminarMiCuenta() {
  const response = await fetch(`${BASE_URL}/usuarios/me`, {
    method: 'DELETE',
    headers: {
      ...authHeaders(),
    },
  });

  return manejarRespuesta(response);
}

// Actividad Subida de Imágenes — Contrato DSI2
export async function subirImagen(productoId, archivo) {
  const fd = new FormData();
  fd.append('archivo', archivo);

  // NOTA: NO incluir Content-Type en los headers. El navegador lo genera
  // automáticamente junto con el multipart boundary correspondiente.
  const response = await fetch(`${BASE_URL}/productos/${productoId}/imagen`, {
    method: 'POST',
    headers: {
      ...authHeaders(), // SOLO el token de autorización, NADA más
    },
    body: fd,
  });

  if (response.ok) {
    return response.json();
  }

  let errorData = null;
  try {
    errorData = await response.json();
  } catch {}

  // Traducción estricta de códigos según la consigna:
  if (response.status === 403) {
    throw new Error('No tienes permisos de administrador para realizar esta acción (403).');
  }
  if (response.status === 404) {
    throw new Error('El producto especificado no existe (404).');
  }
  if (response.status === 413) {
    throw new Error('La imagen seleccionada supera el límite máximo de 2 MB (413).');
  }
  if (response.status === 415) {
    throw new Error('El archivo no es una imagen válida (415). Formatos permitidos: JPG, PNG, WEBP.');
  }

  throw new Error(errorData?.detail || `Error al subir la imagen (Código ${response.status}).`);
}

export { BASE_URL };

