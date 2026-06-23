const DepositoBanco = require('../models/DepositoBanco');

function tieneAcceso(req, sedeId) {
  return req.user.rol === 'administrador'
    || (req.user.sedes || []).map(String).includes(String(sedeId));
}

// GET /tesorero/depositos?estado=pendiente
async function listarDepositos(req, res) {
  const sedes = req.user.rol === 'administrador' ? undefined : req.user.sedes;
  const filtro = {};
  if (sedes) filtro.sede = { $in: sedes };
  if (req.query.estado) filtro.estado = req.query.estado;

  const depositos = await DepositoBanco.find(filtro).populate('sede manager').sort({ fecha: -1 });
  res.json(depositos);
}

// PATCH /tesorero/depositos/:id/confirmar
async function confirmarDeposito(req, res) {
  const deposito = await DepositoBanco.findById(req.params.id);
  if (!deposito) return res.status(404).json({ error: 'No encontrado' });
  if (!tieneAcceso(req, deposito.sede)) return res.status(403).json({ error: 'Sin acceso a esta sede' });
  if (deposito.estado === 'confirmado') {
    return res.status(409).json({ error: 'Este depósito ya fue confirmado' });
  }

  const { banco, numeroSede } = req.body;
  if (!banco || !numeroSede) {
    return res.status(400).json({ error: 'Indica el banco y el número de operación' });
  }

  deposito.estado = 'confirmado';
  deposito.confirmacionTesorero = { tesorero: req.user.id, banco, numeroSede, fechaHora: new Date() };
  await deposito.save();

  res.json(deposito);
}

module.exports = { listarDepositos, confirmarDeposito };
