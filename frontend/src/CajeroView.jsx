import { useEffect, useState } from 'react';
import { abrirCaja, cerrarCaja, misAbiertos, listarCajas, listarTurnos } from './api';

const hoy = () => new Date().toISOString().slice(0, 10);

export default function CajeroView({ token, usuario }) {
  const [cajas, setCajas] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [abiertos, setAbiertos] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const [form, setForm] = useState({ caja: '', turno: '', fecha: hoy(), soles: '', dolares: '' });
  const [cierreForm, setCierreForm] = useState({});

  async function cargar() {
    const [c, t, a] = await Promise.all([listarCajas(token), listarTurnos(token), misAbiertos(token)]);
    setCajas(c);
    setTurnos(t);
    setAbiertos(a);
  }

  useEffect(() => { cargar(); }, []);

  async function handleAbrir(e) {
    e.preventDefault();
    setError(''); setMensaje('');
    try {
      await abrirCaja(token, {
        sede: usuario.sedes[0],
        caja: form.caja,
        turno: form.turno,
        fecha: form.fecha,
        soles: Number(form.soles),
        dolares: Number(form.dolares)
      });
      setMensaje('Caja abierta correctamente');
      setForm({ caja: '', turno: '', fecha: hoy(), soles: '', dolares: '' });
      cargar();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCerrar(id) {
    setError(''); setMensaje('');
    const f = cierreForm[id] || {};
    const campos = [
      'ventaEfectivoSoles', 'ventaEfectivoDolares', 'tipSoles', 'tipDolares',
      'vueltoSolesPorPagosDolares', 'enviadoOficinaSoles', 'enviadoOficinaDolares',
      'efectivoCierreSoles', 'efectivoCierreDolares'
    ];
    const body = {};
    for (const c of campos) body[c] = Number(f[c] || 0);

    try {
      await cerrarCaja(token, id, body);
      setMensaje('Cierre confirmado');
      cargar();
    } catch (err) {
      setError(err.message);
    }
  }

  function setCierreCampo(id, campo, valor) {
    setCierreForm((prev) => ({ ...prev, [id]: { ...prev[id], [campo]: valor } }));
  }

  const campoLabel = {
    ventaEfectivoSoles: 'Venta efectivo S/', ventaEfectivoDolares: 'Venta efectivo US$',
    tipSoles: 'TIP S/', tipDolares: 'TIP US$',
    vueltoSolesPorPagosDolares: 'Vuelto S/ (pagos US$)',
    enviadoOficinaSoles: 'Enviado a oficina S/', enviadoOficinaDolares: 'Enviado a oficina US$',
    efectivoCierreSoles: 'Efectivo cierre S/', efectivoCierreDolares: 'Efectivo cierre US$'
  };

  return (
    <div>
      <h2>Apertura de caja</h2>
      <form onSubmit={handleAbrir} className="card">
        <label>Caja
          <select value={form.caja} onChange={(e) => setForm({ ...form, caja: e.target.value })} required>
            <option value="">Selecciona...</option>
            {cajas.map((c) => <option key={c._id} value={c._id}>{c.nombre}</option>)}
          </select>
        </label>
        <label>Turno
          <select value={form.turno} onChange={(e) => setForm({ ...form, turno: e.target.value })} required>
            <option value="">Selecciona...</option>
            {turnos.map((t) => <option key={t._id} value={t._id}>{t.nombre}</option>)}
          </select>
        </label>
        <label>Fecha
          <input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} required />
        </label>
        <label>Soles iniciales
          <input type="number" min="0" step="0.01" value={form.soles} onChange={(e) => setForm({ ...form, soles: e.target.value })} required />
        </label>
        <label>Dólares iniciales
          <input type="number" min="0" step="0.01" value={form.dolares} onChange={(e) => setForm({ ...form, dolares: e.target.value })} required />
        </label>
        <button type="submit">Abrir caja</button>
      </form>

      {mensaje && <p className="ok">{mensaje}</p>}
      {error && <p className="error">{error}</p>}

      <h2>Turnos abiertos</h2>
      {abiertos.length === 0 && <p>No tienes turnos abiertos.</p>}
      {abiertos.map((reg) => (
        <div key={reg._id} className="card">
          <p><strong>{reg.caja?.nombre}</strong> · {reg.turno?.nombre} · {reg.fecha}</p>
          <p>Apertura: S/ {reg.apertura.soles} · US$ {reg.apertura.dolares}</p>
          {reg.rechazos?.length > 0 && (
            <p className="error">
              El supervisor rechazó tu cierre anterior: "{reg.rechazos[reg.rechazos.length - 1].motivo}". Corrige y vuelve a confirmar.
            </p>
          )}
          <div className="grid">
            {Object.keys(campoLabel).map((campo) => (
              <label key={campo}>
                {campoLabel[campo]}
                <input
                  type="number" min="0" step="0.01"
                  value={cierreForm[reg._id]?.[campo] || ''}
                  onChange={(e) => setCierreCampo(reg._id, campo, e.target.value)}
                />
              </label>
            ))}
          </div>
          <button onClick={() => handleCerrar(reg._id)}>Confirmar cierre</button>
        </div>
      ))}
    </div>
  );
}
