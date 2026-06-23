const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'No autenticado' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, rol, sedes }
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.rol)) {
      return res.status(403).json({ error: 'No autorizado para esta acción' });
    }
    next();
  };
}

// Verifica que el usuario tenga acceso a la sede del recurso (administrador siempre pasa).
function requireSedeAccess(getSedeId) {
  return (req, res, next) => {
    if (req.user.rol === 'administrador') return next();
    const sedeId = getSedeId(req);
    const tieneAcceso = (req.user.sedes || []).map(String).includes(String(sedeId));
    if (!tieneAcceso) return res.status(403).json({ error: 'Sin acceso a esta sede' });
    next();
  };
}

module.exports = { requireAuth, requireRole, requireSedeAccess };
