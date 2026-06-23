const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const {
  pendientesRecepcion,
  confirmarRecepcion,
  registrarDeposito,
  misDepositos,
  registrarConteo,
  saldoCajaOficina
} = require('../controllers/managerController');

const router = express.Router();
router.use(requireAuth, requireRole('manager', 'administrador'));

router.get('/pendientes-recepcion', asyncHandler(pendientesRecepcion));
router.patch('/cierres-caja/:id/confirmar-recepcion', asyncHandler(confirmarRecepcion));

router.post('/depositos', asyncHandler(registrarDeposito));
router.get('/depositos', asyncHandler(misDepositos));

router.post('/conteos-caja-oficina', asyncHandler(registrarConteo));
router.get('/saldo-caja-oficina', asyncHandler(saldoCajaOficina));

module.exports = router;
