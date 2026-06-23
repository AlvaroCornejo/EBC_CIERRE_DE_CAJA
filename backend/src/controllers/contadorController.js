const mongoose = require('mongoose');
const CierreCaja = require('../models/CierreCaja');
const DepositoBanco = require('../models/DepositoBanco');
const ConciliacionContable = require('../models/ConciliacionContable');

function tieneAcceso(req, sedeId) {
  return req.user.rol === 'administrador'
    || (req.user.sedes || []).map(String).includes(String(sedeId));
}

// GET /contador/resumen?sede=&fechaDesde=&fechaHasta=
// Calcula los totales sin guardar nada, para que el contador revise antes de dar el OK.
async function resumen(req, res) {
  const { sede, fechaDesde, fechaHasta } = req.query;
  if (!sede || !fechaDesde || !fechaHasta) {
    return res.status(400).json({ error: 'Faltan sede, fechaDesde y fechaHasta' });
  }
  if (!tieneAcceso(req, sede)) return res.status(403).json({ error: 'Sin acceso a esta sede' });

  const totales = await calcularTotales(sede, fechaDesde, fechaHasta);
  res.json(totales);
}

// POST /contador/conciliaciones  { sede, fechaDesde, fechaHasta, comentario }
async function crearConciliacion(req, res) {
  const { sede, fechaDesde, fechaHasta, comentario } = req.body;
  if (!sede || !fechaDesde || !fechaHasta) {
    return res.status(400).json({ error: 'Faltan sede, fechaDesde y fechaHasta' });
  }
  if (!tieneAcceso(req, sede)) return res.status(403).json({ error: 'Sin acceso a esta sede' });

  const totales = await calcularTotales(sede, fechaDesde, fechaHasta);

  const conciliacion = await ConciliacionContable.create({
    sede,
    contador: req.user.id,
    fechaDesde,
    fechaHasta,
    totalVentaEfectivoSoles: totales.totalVentaEfectivoSoles,
    totalVentaEfectivoDolares: totales.totalVentaEfectivoDolares,
    totalDepositadoSoles: totales.totalDepositadoSoles,
    totalDepositadoDolares: totales.totalDepositadoDolares,
    diferenciaSoles: totales.diferenciaSoles,
    diferenciaDolares: totales.diferenciaDolares,
    comentario
  });

  res.status(201).json(conciliacion);
}

// GET /contador/conciliaciones?sede=
async function listarConciliaciones(req, res) {
  const sedes = req.user.rol === 'administrador' ? undefined : req.user.sedes;
  const filtro = {};
  if (sedes) filtro.sede = { $in: sedes };
  const conciliaciones = await ConciliacionContable.find(filtro).populate('sede contador').sort({ fechaHora: -1 });
  res.json(conciliaciones);
}

async function calcularTotales(sedeId, fechaDesde, fechaHasta) {
  const sede = new mongoose.Types.ObjectId(sedeId);

  const [venta] = await CierreCaja.aggregate([
    { $match: { sede, estado: 'aprobado', fecha: { $gte: fechaDesde, $lte: fechaHasta } } },
    { $group: { _id: null, soles: { $sum: '$cierre.ventaEfectivoSoles' }, dolares: { $sum: '$cierre.ventaEfectivoDolares' } } }
  ]);

  const [depositos] = await DepositoBanco.aggregate([
    { $match: { sede, estado: 'confirmado', fecha: { $gte: fechaDesde, $lte: fechaHasta } } },
    { $group: { _id: null, soles: { $sum: '$soles' }, dolares: { $sum: '$dolares' } } }
  ]);

  const totalVentaEfectivoSoles = venta?.soles || 0;
  const totalVentaEfectivoDolares = venta?.dolares || 0;
  const totalDepositadoSoles = depositos?.soles || 0;
  const totalDepositadoDolares = depositos?.dolares || 0;

  return {
    totalVentaEfectivoSoles,
    totalVentaEfectivoDolares,
    totalDepositadoSoles,
    totalDepositadoDolares,
    diferenciaSoles: totalVentaEfectivoSoles - totalDepositadoSoles,
    diferenciaDolares: totalVentaEfectivoDolares - totalDepositadoDolares
  };
}

module.exports = { resumen, crearConciliacion, listarConciliaciones };
