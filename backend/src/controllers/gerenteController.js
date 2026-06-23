const CierreCaja = require('../models/CierreCaja');
const DepositoBanco = require('../models/DepositoBanco');
const Sede = require('../models/Sede');
const { calcularSaldoCajaOficina } = require('../utils/saldoCajaOficina');

// GET /gerente/dashboard?sede=
async function dashboard(req, res) {
  const sedeId = req.query.sede || req.user.sedes?.[0];
  if (!sedeId) return res.status(400).json({ error: 'Falta sede' });

  const tieneAcceso = req.user.rol === 'administrador'
    || (req.user.sedes || []).map(String).includes(String(sedeId));
  if (!tieneAcceso) return res.status(403).json({ error: 'Sin acceso a esta sede' });

  const sede = await Sede.findById(sedeId);

  const cierresRecientes = await CierreCaja.find({ sede: sedeId })
    .populate('caja turno cajero')
    .sort({ createdAt: -1 })
    .limit(20);

  // Saldo declarado por cada caja: el efectivo de cierre del ultimo turno cerrado/aprobado de cada caja.
  const saldosPorCaja = {};
  for (const c of cierresRecientes) {
    const key = c.caja?._id?.toString();
    if (key && !saldosPorCaja[key] && c.cierre?.fechaHora) {
      saldosPorCaja[key] = {
        caja: c.caja.nombre,
        efectivoCierreSoles: c.cierre.efectivoCierreSoles,
        efectivoCierreDolares: c.cierre.efectivoCierreDolares,
        fecha: c.fecha,
        estado: c.estado
      };
    }
  }

  const saldoCajaOficina = await calcularSaldoCajaOficina(sedeId);
  const depositosRecientes = await DepositoBanco.find({ sede: sedeId })
    .populate('manager')
    .sort({ createdAt: -1 })
    .limit(10);

  res.json({
    sede: { id: sede._id, nombre: sede.nombre, limiteEfectivoSoles: sede.limiteEfectivoSoles, limiteEfectivoDolares: sede.limiteEfectivoDolares },
    cierresRecientes,
    saldosPorCaja: Object.values(saldosPorCaja),
    saldoCajaOficina,
    depositosRecientes
  });
}

module.exports = { dashboard };
