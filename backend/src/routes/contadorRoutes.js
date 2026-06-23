const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const { resumen, crearConciliacion, listarConciliaciones } = require('../controllers/contadorController');

const router = express.Router();
router.use(requireAuth, requireRole('contador', 'administrador'));

router.get('/resumen', asyncHandler(resumen));
router.post('/conciliaciones', asyncHandler(crearConciliacion));
router.get('/conciliaciones', asyncHandler(listarConciliaciones));

module.exports = router;
