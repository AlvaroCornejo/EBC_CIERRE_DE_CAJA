const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const { dashboard } = require('../controllers/gerenteController');

const router = express.Router();
router.use(requireAuth, requireRole('gerente', 'administrador'));

router.get('/dashboard', asyncHandler(dashboard));

module.exports = router;
