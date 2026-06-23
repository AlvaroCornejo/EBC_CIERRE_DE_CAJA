import { useEffect, useState } from 'react';
import { registrarPropina, misPropinas } from './api';

export default function MozoView({ token }) {
  const [form, setForm] = useState({ soles: '', dolares: '', medio: '', referencia: '' });
  const [propinas, setPropinas] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  async function cargar() {
    setPropinas(await misPropinas(token));
  }

  useEffect(() => { cargar(); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setMensaje('');
    try {
      await registrarPropina(token, {
        soles: form.soles ? Number(form.soles) : 0,
        dolares: form.dolares ? Number(form.dolares) : 0,
        medio: form.medio || undefined,
        referencia: form.referencia || undefined
      });
      setMensaje('Propina registrada');
      setForm({ soles: '', dolares: '', medio: '', referencia: '' });
      cargar();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h2>Registrar propina</h2>
      <form onSubmit={handleSubmit} className="card">
        <label>Soles
          <input type="number" min="0" step="0.01" value={form.soles} onChange={(e) => setForm({ ...form, soles: e.target.value })} />
        </label>
        <label>Dólares
          <input type="number" min="0" step="0.01" value={form.dolares} onChange={(e) => setForm({ ...form, dolares: e.target.value })} />
        </label>
        <label>Medio
          <select value={form.medio} onChange={(e) => setForm({ ...form, medio: e.target.value })}>
            <option value="">(sin especificar)</option>
            <option value="efectivo">Efectivo</option>
            <option value="tarjeta">Tarjeta</option>
          </select>
        </label>
        <label>Referencia
          <input value={form.referencia} onChange={(e) => setForm({ ...form, referencia: e.target.value })} />
        </label>
        <button type="submit">Registrar</button>
      </form>

      {mensaje && <p className="ok">{mensaje}</p>}
      {error && <p className="error">{error}</p>}

      <h2>Mis propinas de hoy</h2>
      {propinas.length === 0 && <p>Sin registros aún.</p>}
      {propinas.map((p) => (
        <div key={p._id} className="card">
          <p>{p.fecha} · S/ {p.soles} · US$ {p.dolares} {p.medio ? `· ${p.medio}` : ''} {p.referencia ? `· Ref: ${p.referencia}` : ''}</p>
        </div>
      ))}
    </div>
  );
}
