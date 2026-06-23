const Propina = require('../models/Propina');
const diaDeTrabajo = require('../utils/diaDeTrabajo');

// POST /propinas  (el mozo registra su propia propina, identidad tomada del token)
async function registrarPropina(req, res) {
  const { soles, dolares, medio, referencia } = req.body;
  const mozo = req.user.mozo;
  const sede = req.user.sedes?.[0];

  if (!mozo || !sede) {
    return res.status(400).json({ error: 'El usuario no tiene mozo/sede asignada' });
  }

  const propina = await Propina.create({
    sede,
    mozo,
    fecha: diaDeTrabajo(new Date()),
    soles: soles ?? 0,
    dolares: dolares ?? 0,
    medio,
    referencia
  });

  res.status(201).json(propina);
}

// GET /propinas/mias?fecha=YYYY-MM-DD
async function misPropinas(req, res) {
  const filtro = { mozo: req.user.mozo };
  if (req.query.fecha) filtro.fecha = req.query.fecha;
  const propinas = await Propina.find(filtro).sort({ registradoEn: -1 });
  res.json(propinas);
}

module.exports = { registrarPropina, misPropinas };
