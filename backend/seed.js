require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', ...dns.getServers()]);

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Sociedad = require('./src/models/Sociedad');
const Sede = require('./src/models/Sede');
const Mozo = require('./src/models/Mozo');
const Turno = require('./src/models/Turno');
const Caja = require('./src/models/Caja');
const Usuario = require('./src/models/Usuario');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);

  const sociedad = await Sociedad.create({ nombre: 'Sociedad Demo', ruc: '20123456789' });
  const sede = await Sede.create({ sociedad: sociedad._id, nombre: 'Sede Centro', limiteEfectivoSoles: 500, limiteEfectivoDolares: 200 });
  const turno = await Turno.create({ sede: sede._id, nombre: 'Mañana', horaInicio: '08:00', horaFin: '16:00' });
  const caja1 = await Caja.create({ sede: sede._id, nombre: 'Caja 1' });
  const cajaOficina = await Caja.create({ sede: sede._id, nombre: 'Caja Oficina', esOficina: true });
  const mozo = await Mozo.create({ sede: sede._id, nombre: 'Juan Mozo', documento: '12345678' });

  const passHash = await bcrypt.hash('Demo123', 10);

  const usuariosPorRol = {
    cajero: { mozo: undefined },
    mozo: { mozo: mozo._id },
    supervisor: {},
    manager: {},
    tesorero: {},
    contador: {},
    gerente: {},
    administrador: { sinSede: true }
  };

  const usuariosCreados = {};
  for (const [rol, opts] of Object.entries(usuariosPorRol)) {
    await Usuario.deleteOne({ username: `${rol}@demo` });
    usuariosCreados[rol] = await Usuario.create({
      nombre: `${rol[0].toUpperCase()}${rol.slice(1)} Demo`,
      username: `${rol}@demo`,
      passwordHash: passHash,
      rol,
      sedes: opts.sinSede ? [] : [sede._id],
      mozo: opts.mozo
    });
  }

  console.log(JSON.stringify({
    sociedadId: sociedad._id,
    sedeId: sede._id,
    turnoId: turno._id,
    caja1Id: caja1._id,
    cajaOficinaId: cajaOficina._id,
    mozoId: mozo._id,
    usuarios: Object.keys(usuariosPorRol).map((r) => `${r}@demo`),
    password: 'Demo123'
  }, null, 2));

  await mongoose.disconnect();
}

run().catch((e) => { console.error(e); process.exit(1); });
