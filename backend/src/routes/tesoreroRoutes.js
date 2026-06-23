const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const { listarDepositos, confirmarDeposito } = require('../controllers/tesoreroController');

const router = express.Router();
router.use(requireAuth, requireRole('tesorero', 'administrador'));

router.get('/depositos', asyncHandler(listarDepositos));
router.patch('/depositos/:id/confirmar', asyncHandler(confirmarDeposito));

module.exports = router;
