const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const crudFactory = require('../controllers/crudFactory');

const Sociedad = require('../models/Sociedad');
const Sede = require('../models/Sede');
const Mozo = require('../models/Mozo');
const Turno = require('../models/Turno');
const Caja = require('../models/Caja');
const adminUsuarioController = require('../controllers/adminUsuarioController');

const router = express.Router();
router.use(requireAuth, requireRole('administrador'));

function montarCrud(path, Model, opts) {
  const { listar, crear, actualizar, desactivar } = crudFactory(Model, opts);
  router.get(path, asyncHandler(listar));
  router.post(path, asyncHandler(crear));
  router.patch(`${path}/:id`, asyncHandler(actualizar));
  router.delete(`${path}/:id`, asyncHandler(desactivar));
}

montarCrud('/sociedades', Sociedad);
montarCrud('/sedes', Sede, { populate: 'sociedad' });
montarCrud('/mozos', Mozo, { populate: 'sede' });
montarCrud('/turnos', Turno, { populate: 'sede' });
montarCrud('/cajas', Caja, { populate: 'sede' });

router.get('/usuarios', asyncHandler(adminUsuarioController.listar));
router.post('/usuarios', asyncHandler(adminUsuarioController.crear));
router.patch('/usuarios/:id', asyncHandler(adminUsuarioController.actualizar));
router.delete('/usuarios/:id', asyncHandler(adminUsuarioController.desactivar));

module.exports = router;
