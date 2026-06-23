const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

async function login(req, res) {
  const { username, password } = req.body;
  const usuario = await Usuario.findOne({ username: username?.toLowerCase(), activo: true }).select('+passwordHash');
  if (!usuario) return res.status(401).json({ error: 'Credenciales inválidas' });

  const ok = await bcrypt.compare(password || '', usuario.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' });

  const token = jwt.sign(
    { id: usuario._id, rol: usuario.rol, sedes: usuario.sedes, mozo: usuario.mozo },
    process.env.JWT_SECRET,
    { expiresIn: '12h' }
  );

  res.json({
    token,
    usuario: { id: usuario._id, nombre: usuario.nombre, rol: usuario.rol, sedes: usuario.sedes, mozo: usuario.mozo }
  });
}

module.exports = { login };
