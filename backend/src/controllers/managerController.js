const CierreCaja = require('../models/CierreCaja');
const DepositoBanco = require('../models/DepositoBanco');
const ConteoCajaOficina = require('../models/ConteoCajaOficina');
const Sede = require('../models/Sede');
const { calcularSaldoCajaOficina } = require('../utils/saldoCajaOficina');

function tieneAcceso(req, sedeId) {
  return req.user.rol === 'administrador'
    || (req.user.sedes || []).map(String).includes(String(sedeId));
}

// GET /manager/pendientes-recepcion  (cierres ya cerrados/aprobados con envio a oficina sin confirmar recepcion)
async function pendientesRecepcion(req, res) {
  const sedes = req.user.rol === 'administrador' ? undefined : req.user.sedes;
  const filtro = {
    estado: { $in: ['cerrado', 'aprobado'] },
    'recepcionOficina.manager': { $exists: false },
    $or: [{ 'cierre.enviadoOficinaSoles': { $gt: 0 } }, { 'cierre.enviadoOficinaDolares': { $gt: 0 } }]
  };
  if (sedes) filtro.sede = { $in: sedes };

  const registros = await CierreCaja.find(filtro).populate('sede caja turno cajero').sort({ 'cierre.fechaHora': -1 });
  res.json(registros);
}

// PATCH /manager/cierres-caja/:id/confirmar-recepcion
async function confirmarRecepcion(req, res) {
  const registro = await CierreCaja.findById(req.params.id);
  if (!registro) return res.status(404).json({ error: 'No encontrado' });
  if (!tieneAcceso(req, registro.sede)) return res.status(403).json({ error: 'Sin acceso a esta sede' });
  if (registro.recepcionOficina?.manager) {
    return res.status(409).json({ error: 'Ya se confirmó la recepción de este envío' });
  }

  const { soles, dolares } = req.body;
  if (soles == null || dolares == null) {
    return res.status(400).json({ error: 'Indica cuánto se recibió en soles y dólares' });
  }

  registro.recepcionOficina = { manager: req.user.id, soles, dolares, fechaHora: new Date() };
  await registro.save();
  res.json(registro);
}

// POST /manager/depositos
async function registrarDeposito(req, res) {
  const { sede, fecha, soles, dolares, bancoDeclarado } = req.body;
  if (!sede || !fecha) return res.status(400).json({ error: 'Faltan sede y/o fecha' });
  if (!tieneAcceso(req, sede)) return res.status(403).json({ error: 'Sin acceso a esta sede' });

  const deposito = await DepositoBanco.create({
    sede,
    manager: req.user.id,
    fecha,
    soles: soles ?? 0,
    dolares: dolares ?? 0,
    bancoDeclarado
  });
  res.status(201).json(deposito);
}

// GET /manager/depositos?sede=
async function misDepositos(req, res) {
  const sedes = req.user.rol === 'administrador' ? undefined : req.user.sedes;
  const filtro = {};
  if (sedes) filtro.sede = { $in: sedes };
  const depositos = await DepositoBanco.find(filtro).populate('sede manager').sort({ createdAt: -1 });
  res.json(depositos);
}

// POST /manager/conteos-caja-oficina
async function registrarConteo(req, res) {
  const { sede, soles, dolares } = req.body;
  if (!sede || soles == null || dolares == null) {
    return res.status(400).json({ error: 'Faltan datos del conteo' });
  }
  if (!tieneAcceso(req, sede)) return res.status(403).json({ error: 'Sin acceso a esta sede' });

  const conteo = await ConteoCajaOficina.create({ sede, manager: req.user.id, soles, dolares });

  const sedeDoc = await Sede.findById(sede);
  const saldoCalculado = await calcularSaldoCajaOficina(sede);
  const excedeSoles = sedeDoc.limiteEfectivoSoles != null && conteo.soles > sedeDoc.limiteEfectivoSoles;
  const excedeDolares = sedeDoc.limiteEfectivoDolares != null && conteo.dolares > sedeDoc.limiteEfectivoDolares;

  res.status(201).json({
    conteo,
    saldoCalculado,
    alerta: excedeSoles || excedeDolares
      ? 'El efectivo contado supera el límite definido para la sede. Se requiere depósito al banco.'
      : null
  });
}

// GET /manager/saldo-caja-oficina?sede=
async function saldoCajaOficina(req, res) {
  const { sede } = req.query;
  if (!sede) return res.status(400).json({ error: 'Falta sede' });
  if (!tieneAcceso(req, sede)) return res.status(403).json({ error: 'Sin acceso a esta sede' });

  const sedeDoc = await Sede.findById(sede);
  const saldo = await calcularSaldoCajaOficina(sede);
  const excedeSoles = sedeDoc.limiteEfectivoSoles != null && saldo.soles > sedeDoc.limiteEfectivoSoles;
  const excedeDolares = sedeDoc.limiteEfectivoDolares != null && saldo.dolares > sedeDoc.limiteEfectivoDolares;

  res.json({
    saldo,
    limiteEfectivoSoles: sedeDoc.limiteEfectivoSoles,
    limiteEfectivoDolares: sedeDoc.limiteEfectivoDolares,
    excedido: excedeSoles || excedeDolares
  });
}

module.exports = {
  pendientesRecepcion,
  confirmarRecepcion,
  registrarDeposito,
  misDepositos,
  registrarConteo,
  saldoCajaOficina
};
