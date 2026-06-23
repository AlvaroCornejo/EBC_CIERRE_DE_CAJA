// Genera un set de controladores CRUD basico (listar/crear/actualizar/desactivar) para un modelo simple.
function crudFactory(Model, { populate } = {}) {
  async function listar(req, res) {
    let query = Model.find({});
    if (populate) query = query.populate(populate);
    res.json(await query.sort({ createdAt: -1 }));
  }

  async function crear(req, res) {
    const doc = await Model.create(req.body);
    res.status(201).json(doc);
  }

  async function actualizar(req, res) {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ error: 'No encontrado' });
    res.json(doc);
  }

  // No se borra nada fisicamente: se desactiva para no romper referencias historicas (cierres, propinas, etc).
  async function desactivar(req, res) {
    const doc = await Model.findByIdAndUpdate(req.params.id, { activo: false }, { new: true });
    if (!doc) return res.status(404).json({ error: 'No encontrado' });
    res.json(doc);
  }

  return { listar, crear, actualizar, desactivar };
}

module.exports = crudFactory;
