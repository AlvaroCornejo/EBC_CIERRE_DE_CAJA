import { useEffect, useState } from 'react';
import {
  adminSociedades, adminSedes, adminMozos, adminTurnos, adminCajas, adminUsuarios
} from './api';

const ROLES = ['mozo', 'cajero', 'manager', 'supervisor', 'tesorero', 'contador', 'gerente', 'administrador'];

export default function AdminView({ token }) {
  const [tab, setTab] = useState('sociedades');
  const [sociedades, setSociedades] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [mozos, setMozos] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [cajas, setCajas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  async function cargarTodo() {
    setSociedades(await adminSociedades.listar(token));
    setSedes(await adminSedes.listar(token));
    setMozos(await adminMozos.listar(token));
    setTurnos(await adminTurnos.listar(token));
    setCajas(await adminCajas.listar(token));
    setUsuarios(await adminUsuarios.listar(token));
  }

  useEffect(() => { cargarTodo(); }, []);

  async function manejar(accion) {
    setError(''); setMensaje('');
    try {
      await accion();
      setMensaje('Hecho');
      cargarTodo();
    } catch (err) {
      setError(err.message);
    }
  }

  const tabs = ['sociedades', 'sedes', 'mozos', 'turnos', 'cajas', 'usuarios'];

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{ opacity: tab === t ? 1 : 0.5 }}>{t}</button>
        ))}
      </div>

      {mensaje && <p className="ok">{mensaje}</p>}
      {error && <p className="error">{error}</p>}

      {tab === 'sociedades' && (
        <SociedadesTab token={token} sociedades={sociedades} manejar={manejar} />
      )}
      {tab === 'sedes' && (
        <SedesTab token={token} sedes={sedes} sociedades={sociedades} manejar={manejar} />
      )}
      {tab === 'mozos' && (
        <MozosTab token={token} mozos={mozos} sedes={sedes} manejar={manejar} />
      )}
      {tab === 'turnos' && (
        <TurnosTab token={token} turnos={turnos} sedes={sedes} manejar={manejar} />
      )}
      {tab === 'cajas' && (
        <CajasTab token={token} cajas={cajas} sedes={sedes} manejar={manejar} />
      )}
      {tab === 'usuarios' && (
        <UsuariosTab token={token} usuarios={usuarios} sedes={sedes} mozos={mozos} manejar={manejar} />
      )}
    </div>
  );
}

function SociedadesTab({ token, sociedades, manejar }) {
  const [form, setForm] = useState({ nombre: '', ruc: '' });
  return (
    <div>
      <h2>Sociedades</h2>
      <form className="card" onSubmit={(e) => { e.preventDefault(); manejar(() => adminSociedades.crear(token, form)); setForm({ nombre: '', ruc: '' }); }}>
        <label>Nombre<input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required /></label>
        <label>RUC<input value={form.ruc} onChange={(e) => setForm({ ...form, ruc: e.target.value })} /></label>
        <button type="submit">Crear sociedad</button>
      </form>
      {sociedades.map((s) => (
        <div key={s._id} className="card">
          <p>{s.nombre} · {s.ruc} · {s.activo ? 'activo' : 'inactivo'}</p>
          {s.activo && <button onClick={() => manejar(() => adminSociedades.desactivar(token, s._id))}>Desactivar</button>}
        </div>
      ))}
    </div>
  );
}

function SedesTab({ token, sedes, sociedades, manejar }) {
  const [form, setForm] = useState({ nombre: '', sociedad: '', limiteEfectivoSoles: '', limiteEfectivoDolares: '' });
  return (
    <div>
      <h2>Sedes</h2>
      <form className="card" onSubmit={(e) => {
        e.preventDefault();
        manejar(() => adminSedes.crear(token, {
          nombre: form.nombre,
          sociedad: form.sociedad,
          limiteEfectivoSoles: form.limiteEfectivoSoles ? Number(form.limiteEfectivoSoles) : undefined,
          limiteEfectivoDolares: form.limiteEfectivoDolares ? Number(form.limiteEfectivoDolares) : undefined
        }));
        setForm({ nombre: '', sociedad: '', limiteEfectivoSoles: '', limiteEfectivoDolares: '' });
      }}>
        <label>Nombre<input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required /></label>
        <label>Sociedad
          <select value={form.sociedad} onChange={(e) => setForm({ ...form, sociedad: e.target.value })} required>
            <option value="">Selecciona...</option>
            {sociedades.map((s) => <option key={s._id} value={s._id}>{s.nombre}</option>)}
          </select>
        </label>
        <label>Límite efectivo S/<input type="number" value={form.limiteEfectivoSoles} onChange={(e) => setForm({ ...form, limiteEfectivoSoles: e.target.value })} /></label>
        <label>Límite efectivo US$<input type="number" value={form.limiteEfectivoDolares} onChange={(e) => setForm({ ...form, limiteEfectivoDolares: e.target.value })} /></label>
        <button type="submit">Crear sede</button>
      </form>
      {sedes.map((o) => (
        <div key={o._id} className="card">
          <p>{o.nombre} · {o.sociedad?.nombre} · límite S/ {o.limiteEfectivoSoles ?? '—'} US$ {o.limiteEfectivoDolares ?? '—'} · {o.activo ? 'activo' : 'inactivo'}</p>
          {o.activo && <button onClick={() => manejar(() => adminSedes.desactivar(token, o._id))}>Desactivar</button>}
        </div>
      ))}
    </div>
  );
}

function MozosTab({ token, mozos, sedes, manejar }) {
  const [form, setForm] = useState({ nombre: '', documento: '', sede: '' });
  return (
    <div>
      <h2>Mozos</h2>
      <form className="card" onSubmit={(e) => { e.preventDefault(); manejar(() => adminMozos.crear(token, form)); setForm({ nombre: '', documento: '', sede: '' }); }}>
        <label>Nombre<input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required /></label>
        <label>Documento<input value={form.documento} onChange={(e) => setForm({ ...form, documento: e.target.value })} /></label>
        <label>Sede
          <select value={form.sede} onChange={(e) => setForm({ ...form, sede: e.target.value })} required>
            <option value="">Selecciona...</option>
            {sedes.map((o) => <option key={o._id} value={o._id}>{o.nombre}</option>)}
          </select>
        </label>
        <button type="submit">Crear mozo</button>
      </form>
      {mozos.map((m) => (
        <div key={m._id} className="card">
          <p>{m.nombre} · {m.documento} · {m.sede?.nombre} · {m.activo ? 'activo' : 'inactivo'}</p>
          {m.activo && <button onClick={() => manejar(() => adminMozos.desactivar(token, m._id))}>Desactivar</button>}
        </div>
      ))}
    </div>
  );
}

function TurnosTab({ token, turnos, sedes, manejar }) {
  const [form, setForm] = useState({ nombre: '', horaInicio: '', horaFin: '', sede: '' });
  return (
    <div>
      <h2>Turnos</h2>
      <form className="card" onSubmit={(e) => { e.preventDefault(); manejar(() => adminTurnos.crear(token, form)); setForm({ nombre: '', horaInicio: '', horaFin: '', sede: '' }); }}>
        <label>Nombre<input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required /></label>
        <label>Hora inicio<input type="time" value={form.horaInicio} onChange={(e) => setForm({ ...form, horaInicio: e.target.value })} /></label>
        <label>Hora fin<input type="time" value={form.horaFin} onChange={(e) => setForm({ ...form, horaFin: e.target.value })} /></label>
        <label>Sede
          <select value={form.sede} onChange={(e) => setForm({ ...form, sede: e.target.value })} required>
            <option value="">Selecciona...</option>
            {sedes.map((o) => <option key={o._id} value={o._id}>{o.nombre}</option>)}
          </select>
        </label>
        <button type="submit">Crear turno</button>
      </form>
      {turnos.map((t) => (
        <div key={t._id} className="card">
          <p>{t.nombre} · {t.horaInicio}-{t.horaFin} · {t.sede?.nombre} · {t.activo ? 'activo' : 'inactivo'}</p>
          {t.activo && <button onClick={() => manejar(() => adminTurnos.desactivar(token, t._id))}>Desactivar</button>}
        </div>
      ))}
    </div>
  );
}

function CajasTab({ token, cajas, sedes, manejar }) {
  const [form, setForm] = useState({ nombre: '', esOficina: false, sede: '' });
  return (
    <div>
      <h2>Cajas</h2>
      <form className="card" onSubmit={(e) => { e.preventDefault(); manejar(() => adminCajas.crear(token, form)); setForm({ nombre: '', esOficina: false, sede: '' }); }}>
        <label>Nombre<input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required /></label>
        <label>
          <input type="checkbox" checked={form.esOficina} onChange={(e) => setForm({ ...form, esOficina: e.target.checked })} /> Es Caja Oficina
        </label>
        <label>Sede
          <select value={form.sede} onChange={(e) => setForm({ ...form, sede: e.target.value })} required>
            <option value="">Selecciona...</option>
            {sedes.map((o) => <option key={o._id} value={o._id}>{o.nombre}</option>)}
          </select>
        </label>
        <button type="submit">Crear caja</button>
      </form>
      {cajas.map((c) => (
        <div key={c._id} className="card">
          <p>{c.nombre} · {c.esOficina ? 'Caja Oficina' : 'caja normal'} · {c.sede?.nombre} · {c.activo ? 'activo' : 'inactivo'}</p>
          {c.activo && <button onClick={() => manejar(() => adminCajas.desactivar(token, c._id))}>Desactivar</button>}
        </div>
      ))}
    </div>
  );
}

function UsuariosTab({ token, usuarios, sedes, mozos, manejar }) {
  const [form, setForm] = useState({ nombre: '', username: '', password: '', rol: '', sedes: [], mozo: '' });

  function toggleSede(id) {
    setForm((f) => ({
      ...f,
      sedes: f.sedes.includes(id) ? f.sedes.filter((x) => x !== id) : [...f.sedes, id]
    }));
  }

  return (
    <div>
      <h2>Usuarios</h2>
      <form className="card" onSubmit={(e) => {
        e.preventDefault();
        manejar(() => adminUsuarios.crear(token, { ...form, mozo: form.mozo || undefined }));
        setForm({ nombre: '', username: '', password: '', rol: '', sedes: [], mozo: '' });
      }}>
        <label>Nombre<input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required /></label>
        <label>Usuario<input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required /></label>
        <label>Contraseña<input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></label>
        <label>Rol
          <select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })} required>
            <option value="">Selecciona...</option>
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </label>
        <fieldset>
          <legend>Sedes</legend>
          {sedes.map((o) => (
            <label key={o._id} style={{ flexDirection: 'row', alignItems: 'center', gap: '6px' }}>
              <input type="checkbox" checked={form.sedes.includes(o._id)} onChange={() => toggleSede(o._id)} /> {o.nombre}
            </label>
          ))}
        </fieldset>
        {form.rol === 'mozo' && (
          <label>Vincular a Mozo
            <select value={form.mozo} onChange={(e) => setForm({ ...form, mozo: e.target.value })} required>
              <option value="">Selecciona...</option>
              {mozos.map((m) => <option key={m._id} value={m._id}>{m.nombre}</option>)}
            </select>
          </label>
        )}
        <button type="submit">Crear usuario</button>
      </form>
      {usuarios.map((u) => (
        <div key={u._id} className="card">
          <p>{u.nombre} · {u.username} · rol: {u.rol} · sedes: {u.sedes?.map((o) => o.nombre).join(', ') || '—'} · {u.activo ? 'activo' : 'inactivo'}</p>
          {u.activo && <button onClick={() => manejar(() => adminUsuarios.desactivar(token, u._id))}>Desactivar</button>}
        </div>
      ))}
    </div>
  );
}
