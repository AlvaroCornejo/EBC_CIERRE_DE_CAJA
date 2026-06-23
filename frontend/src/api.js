const API_URL = import.meta.env.VITE_API_URL;

async function request(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
  return data;
}

export const login = (username, password) => request('/auth/login', { method: 'POST', body: { username, password } });

export const abrirCaja = (token, body) => request('/cierres-caja', { method: 'POST', body, token });
export const cerrarCaja = (token, id, body) => request(`/cierres-caja/${id}/cerrar`, { method: 'PATCH', body, token });
export const misAbiertos = (token) => request('/cierres-caja/abiertos', { token });

export const registrarPropina = (token, body) => request('/propinas', { method: 'POST', body, token });
export const misPropinas = (token) => request('/propinas/mias', { token });

export const listarCajas = (token) => request('/cajas', { token });
export const listarTurnos = (token) => request('/turnos', { token });

export const pendientesAprobacion = (token) => request('/cierres-caja/pendientes-aprobacion', { token });
export const aprobarCierre = (token, id, comentario) =>
  request(`/cierres-caja/${id}/aprobar`, { method: 'PATCH', body: { comentario }, token });
export const rechazarCierre = (token, id, motivo) =>
  request(`/cierres-caja/${id}/rechazar`, { method: 'PATCH', body: { motivo }, token });

// Manager
export const pendientesRecepcion = (token) => request('/manager/pendientes-recepcion', { token });
export const confirmarRecepcion = (token, id, body) =>
  request(`/manager/cierres-caja/${id}/confirmar-recepcion`, { method: 'PATCH', body, token });
export const registrarDeposito = (token, body) => request('/manager/depositos', { method: 'POST', body, token });
export const misDepositosManager = (token) => request('/manager/depositos', { token });
export const registrarConteoOficina = (token, body) => request('/manager/conteos-caja-oficina', { method: 'POST', body, token });
export const saldoCajaOficina = (token, sede) => request(`/manager/saldo-caja-oficina?sede=${sede}`, { token });

// Tesorero
export const listarDepositosTesorero = (token, estado) =>
  request(`/tesorero/depositos${estado ? `?estado=${estado}` : ''}`, { token });
export const confirmarDepositoTesorero = (token, id, body) =>
  request(`/tesorero/depositos/${id}/confirmar`, { method: 'PATCH', body, token });

// Contador
export const resumenContador = (token, sede, fechaDesde, fechaHasta) =>
  request(`/contador/resumen?sede=${sede}&fechaDesde=${fechaDesde}&fechaHasta=${fechaHasta}`, { token });
export const crearConciliacion = (token, body) => request('/contador/conciliaciones', { method: 'POST', body, token });
export const listarConciliaciones = (token) => request('/contador/conciliaciones', { token });

// Gerente
export const dashboardGerente = (token, sede) => request(`/gerente/dashboard?sede=${sede}`, { token });

// Administrador
const adminRecurso = (recurso) => ({
  listar: (token) => request(`/admin/${recurso}`, { token }),
  crear: (token, body) => request(`/admin/${recurso}`, { method: 'POST', body, token }),
  actualizar: (token, id, body) => request(`/admin/${recurso}/${id}`, { method: 'PATCH', body, token }),
  desactivar: (token, id) => request(`/admin/${recurso}/${id}`, { method: 'DELETE', token })
});

export const adminSociedades = adminRecurso('sociedades');
export const adminSedes = adminRecurso('sedes');
export const adminMozos = adminRecurso('mozos');
export const adminTurnos = adminRecurso('turnos');
export const adminCajas = adminRecurso('cajas');
export const adminUsuarios = adminRecurso('usuarios');
