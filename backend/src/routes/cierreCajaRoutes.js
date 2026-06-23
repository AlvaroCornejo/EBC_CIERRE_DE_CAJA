const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const {
  abrirCaja,
  cerrarCaja,
  misAbiertos,
  pendientesAprobacion,
  aprobarCierre,
  rechazarCierre
} = require('../controllers/cierreCajaController');

const router = express.Router();

router.use(requireAuth);

router.get('/abiertos', requireRole('cajero'), asyncHandler(misAbiertos));
router.post('/', requireRole('cajero'), asyncHandler(abrirCaja));
router.patch('/:id/cerrar', requireRole('cajero'), asyncHandler(cerrarCaja));

router.get('/pendientes-aprobacion', requireRole('supervisor', 'administrador'), asyncHandler(pendientesAprobacion));
router.patch('/:id/aprobar', requireRole('supervisor', 'administrador'), asyncHandler(aprobarCierre));
router.patch('/:id/rechazar', requireRole('supervisor', 'administrador'), asyncHandler(rechazarCierre));

module.exports = router;
