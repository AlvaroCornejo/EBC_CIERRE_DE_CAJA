const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const { registrarPropina, misPropinas } = require('../controllers/propinaController');

const router = express.Router();

router.use(requireAuth, requireRole('mozo'));

router.post('/', asyncHandler(registrarPropina));
router.get('/mias', asyncHandler(misPropinas));

module.exports = router;
