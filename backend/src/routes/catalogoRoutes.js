const express = require('express');
const { requireAuth } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const Caja = require('../models/Caja');
const Turno = require('../models/Turno');

const router = express.Router();
router.use(requireAuth);

router.get('/cajas', asyncHandler(async (req, res) => {
  const sede = req.query.sede || req.user.sedes?.[0];
  const cajas = await Caja.find({ sede, activo: true });
  res.json(cajas);
}));

router.get('/turnos', asyncHandler(async (req, res) => {
  const sede = req.query.sede || req.user.sedes?.[0];
  const turnos = await Turno.find({ sede, activo: true });
  res.json(turnos);
}));

module.exports = router;
