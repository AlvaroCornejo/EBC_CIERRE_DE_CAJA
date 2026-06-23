const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario');

async function listar(req, res) {
  const usuarios = await Usuario.find({}).populate('sedes mozo').sort({ createdAt: -1 });
  res.json(usuarios);
}

async function crear(req, res) {
  const { nombre, username, password, rol, sedes, mozo } = req.body;
  if (!nombre || !username || !password || !rol) {
    return res.status(400).json({ error: 'Faltan nombre, username, password y/o rol' });
  }
  if (!Usuario.ROLES.includes(rol)) {
    return res.status(400).json({ error: `Rol inválido. Debe ser uno de: ${Usuario.ROLES.join(', ')}` });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const usuario = await Usuario.create({
    nombre, username, passwordHash, rol,
    sedes: sedes || [],
    mozo: mozo || undefined
  });

  res.status(201).json(await Usuario.findById(usuario._id).populate('sedes mozo'));
}

async function actualizar(req, res) {
  const usuario = await Usuario.findById(req.params.id);
  if (!usuario) return res.status(404).json({ error: 'No encontrado' });

  const { nombre, username, password, rol, sedes, mozo, activo } = req.body;
  if (nombre != null) usuario.nombre = nombre;
  if (username != null) usuario.username = username;
  if (rol != null) usuario.rol = rol;
  if (sedes != null) usuario.sedes = sedes;
  if (mozo != null) usuario.mozo = mozo;
  if (activo != null) usuario.activo = activo;
  if (password) usuario.passwordHash = await bcrypt.hash(password, 10);

  await usuario.save();
  res.json(await Usuario.findById(usuario._id).populate('sedes mozo'));
}

async function desactivar(req, res) {
  const usuario = await Usuario.findByIdAndUpdate(req.params.id, { activo: false }, { new: true });
  if (!usuario) return res.status(404).json({ error: 'No encontrado' });
  res.json(usuario);
}

module.exports = { listar, crear, actualizar, desactivar };
