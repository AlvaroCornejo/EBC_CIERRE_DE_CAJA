const CierreCaja = require('../models/CierreCaja');

// POST /cierres-caja  (apertura)
async function abrirCaja(req, res) {
  const { sede, caja, turno, fecha, soles, dolares } = req.body;

  if ([sede, caja, turno, fecha].some((v) => !v) || soles == null || dolares == null) {
    return res.status(400).json({ error: 'Faltan datos de apertura' });
  }

  const existente = await CierreCaja.findOne({ caja, turno, fecha });
  if (existente) {
    return res.status(409).json({ error: 'Ya existe una apertura para esta caja, turno y fecha' });
  }

  const registro = await CierreCaja.create({
    sede,
    caja,
    turno,
    fecha,
    cajero: req.user.id,
    estado: 'abierto',
    apertura: { soles, dolares, fechaHora: new Date() }
  });

  res.status(201).json(registro);
}

// PATCH /cierres-caja/:id/cerrar
async function cerrarCaja(req, res) {
  const registro = await CierreCaja.findById(req.params.id);
  if (!registro) return res.status(404).json({ error: 'No encontrado' });

  if (String(registro.cajero) !== String(req.user.id)) {
    return res.status(403).json({ error: 'Solo el cajero que abrió la caja puede cerrarla' });
  }
  if (registro.estado !== 'abierto') {
    return res.status(409).json({ error: 'Este cierre ya fue confirmado y no se puede modificar' });
  }

  const {
    ventaEfectivoSoles,
    ventaEfectivoDolares,
    tipSoles,
    tipDolares,
    vueltoSolesPorPagosDolares,
    enviadoOficinaSoles,
    enviadoOficinaDolares,
    efectivoCierreSoles,
    efectivoCierreDolares
  } = req.body;

  const requeridos = {
    ventaEfectivoSoles,
    ventaEfectivoDolares,
    tipSoles,
    tipDolares,
    vueltoSolesPorPagosDolares,
    enviadoOficinaSoles,
    enviadoOficinaDolares,
    efectivoCierreSoles,
    efectivoCierreDolares
  };
  for (const [campo, valor] of Object.entries(requeridos)) {
    if (valor == null) return res.status(400).json({ error: `Falta el campo ${campo}` });
  }

  registro.cierre = { ...requeridos, fechaHora: new Date() };
  registro.estado = 'cerrado';
  await registro.save();

  res.json(registro);
}

// GET /cierres-caja/abiertos  (turnos abiertos del cajero actual, nunca cierres pasados)
async function misAbiertos(req, res) {
  const registros = await CierreCaja.find({ cajero: req.user.id, estado: 'abierto' })
    .populate('sede caja turno');
  res.json(registros);
}

// GET /cierres-caja/pendientes-aprobacion  (cierres confirmados por el cajero, a la espera del OK del supervisor)
async function pendientesAprobacion(req, res) {
  const sedes = req.user.rol === 'administrador' ? undefined : req.user.sedes;
  const filtro = { estado: 'cerrado' };
  if (sedes) filtro.sede = { $in: sedes };

  const registros = await CierreCaja.find(filtro)
    .populate('sede caja turno cajero')
    .sort({ 'cierre.fechaHora': -1 });
  res.json(registros);
}

// PATCH /cierres-caja/:id/aprobar
async function aprobarCierre(req, res) {
  const registro = await CierreCaja.findById(req.params.id);
  if (!registro) return res.status(404).json({ error: 'No encontrado' });

  if (registro.estado === 'abierto') {
    return res.status(409).json({ error: 'El cajero todavía no confirma este cierre' });
  }
  if (registro.estado === 'aprobado') {
    return res.status(409).json({ error: 'Este cierre ya fue aprobado' });
  }

  const tieneAcceso = req.user.rol === 'administrador'
    || (req.user.sedes || []).map(String).includes(String(registro.sede));
  if (!tieneAcceso) return res.status(403).json({ error: 'Sin acceso a esta sede' });

  registro.estado = 'aprobado';
  registro.aprobacion = {
    supervisor: req.user.id,
    comentario: req.body.comentario,
    fechaHora: new Date()
  };
  await registro.save();

  res.json(registro);
}

// PATCH /cierres-caja/:id/rechazar
async function rechazarCierre(req, res) {
  const registro = await CierreCaja.findById(req.params.id);
  if (!registro) return res.status(404).json({ error: 'No encontrado' });

  if (registro.estado !== 'cerrado') {
    return res.status(409).json({ error: 'Solo se puede rechazar un cierre pendiente de aprobación' });
  }
  if (!req.body.motivo) {
    return res.status(400).json({ error: 'Falta el motivo del rechazo' });
  }

  const tieneAcceso = req.user.rol === 'administrador'
    || (req.user.sedes || []).map(String).includes(String(registro.sede));
  if (!tieneAcceso) return res.status(403).json({ error: 'Sin acceso a esta sede' });

  registro.rechazos.push({ supervisor: req.user.id, motivo: req.body.motivo, fechaHora: new Date() });
  registro.estado = 'abierto'; // el cajero vuelve a ver este turno y puede corregir el cierre
  await registro.save();

  res.json(registro);
}

module.exports = { abrirCaja, cerrarCaja, misAbiertos, pendientesAprobacion, aprobarCierre, rechazarCierre };
