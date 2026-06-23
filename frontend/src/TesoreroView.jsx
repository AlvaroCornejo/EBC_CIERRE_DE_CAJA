import { useEffect, useState } from 'react';
import { listarDepositosTesorero, confirmarDepositoTesorero } from './api';

export default function TesoreroView({ token }) {
  const [depositos, setDepositos] = useState([]);
  const [form, setForm] = useState({});
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  async function cargar() {
    setDepositos(await listarDepositosTesorero(token, 'pendiente'));
  }

  useEffect(() => { cargar(); }, []);

  async function handleConfirmar(id) {
    setError(''); setMensaje('');
    const f = form[id] || {};
    if (!f.banco || !f.numeroSede) {
      setError('Indica el banco y el número de operación');
      return;
    }
    try {
      await confirmarDepositoTesorero(token, id, { banco: f.banco, numeroSede: f.numeroSede });
      setMensaje('Depósito confirmado contra el movimiento bancario');
      cargar();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h2>Depósitos pendientes de confirmar con el banco</h2>
      {mensaje && <p className="ok">{mensaje}</p>}
      {error && <p className="error">{error}</p>}

      {depositos.length === 0 && <p>No hay depósitos pendientes.</p>}
      {depositos.map((d) => (
        <div key={d._id} className="card">
          <p><strong>{d.sede?.nombre}</strong> · {d.fecha} · Registrado por: {d.manager?.nombre}</p>
          <p>Declarado por manager: S/ {d.soles} · US$ {d.dolares} · Banco indicado: {d.bancoDeclarado || '—'}</p>
          <label>Banco (según movimiento bancario)
            <input value={form[d._id]?.banco || ''} onChange={(e) => setForm((p) => ({ ...p, [d._id]: { ...p[d._id], banco: e.target.value } }))} />
          </label>
          <label>Número de operación
            <input value={form[d._id]?.numeroSede || ''} onChange={(e) => setForm((p) => ({ ...p, [d._id]: { ...p[d._id], numeroSede: e.target.value } }))} />
          </label>
          <button onClick={() => handleConfirmar(d._id)}>Confirmar contra banco</button>
        </div>
      ))}
    </div>
  );
}
