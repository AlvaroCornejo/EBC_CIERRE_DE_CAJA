import { useEffect, useState } from 'react';
import {
  pendientesRecepcion, confirmarRecepcion,
  registrarDeposito, misDepositosManager,
  registrarConteoOficina, saldoCajaOficina
} from './api';

export default function ManagerView({ token, usuario }) {
  const sede = usuario.sedes[0];

  const [pendientes, setPendientes] = useState([]);
  const [recepcionForm, setRecepcionForm] = useState({});
  const [depositos, setDepositos] = useState([]);
  const [depositoForm, setDepositoForm] = useState({ fecha: new Date().toISOString().slice(0, 10), soles: '', dolares: '', bancoDeclarado: '' });
  const [conteoForm, setConteoForm] = useState({ soles: '', dolares: '' });
  const [saldo, setSaldo] = useState(null);
  const [alerta, setAlerta] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  async function cargar() {
    const [p, d, s] = await Promise.all([
      pendientesRecepcion(token),
      misDepositosManager(token),
      saldoCajaOficina(token, sede)
    ]);
    setPendientes(p);
    setDepositos(d);
    setSaldo(s);
  }

  useEffect(() => { cargar(); }, []);

  async function handleConfirmarRecepcion(id) {
    setError(''); setMensaje('');
    const f = recepcionForm[id] || {};
    try {
      await confirmarRecepcion(token, id, { soles: Number(f.soles || 0), dolares: Number(f.dolares || 0) });
      setMensaje('Recepción confirmada');
      cargar();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeposito(e) {
    e.preventDefault();
    setError(''); setMensaje('');
    try {
      await registrarDeposito(token, {
        sede,
        fecha: depositoForm.fecha,
        soles: Number(depositoForm.soles || 0),
        dolares: Number(depositoForm.dolares || 0),
        bancoDeclarado: depositoForm.bancoDeclarado
      });
      setMensaje('Depósito registrado');
      setDepositoForm({ fecha: new Date().toISOString().slice(0, 10), soles: '', dolares: '', bancoDeclarado: '' });
      cargar();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleConteo(e) {
    e.preventDefault();
    setError(''); setMensaje('');
    try {
      const resp = await registrarConteoOficina(token, {
        sede,
        soles: Number(conteoForm.soles || 0),
        dolares: Number(conteoForm.dolares || 0)
      });
      setMensaje('Conteo registrado');
      setAlerta(resp.alerta || '');
      setConteoForm({ soles: '', dolares: '' });
      cargar();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      {mensaje && <p className="ok">{mensaje}</p>}
      {error && <p className="error">{error}</p>}
      {alerta && <p className="error">{alerta}</p>}

      {saldo && (
        <div className="card">
          <h2>Saldo Caja Oficina</h2>
          <p>S/ {saldo.saldo.soles} · US$ {saldo.saldo.dolares}</p>
          <p>Límite: S/ {saldo.limiteEfectivoSoles ?? '—'} · US$ {saldo.limiteEfectivoDolares ?? '—'}</p>
          {saldo.excedido && <p className="error">El saldo supera el límite definido. Se requiere depósito al banco.</p>}
        </div>
      )}

      <h2>Recepciones pendientes de confirmar</h2>
      {pendientes.length === 0 && <p>No hay envíos pendientes.</p>}
      {pendientes.map((reg) => (
        <div key={reg._id} className="card">
          <p><strong>{reg.caja?.nombre}</strong> · {reg.turno?.nombre} · {reg.fecha} · Cajero: {reg.cajero?.nombre}</p>
          <p>Declarado por el cajero: S/ {reg.cierre.enviadoOficinaSoles} · US$ {reg.cierre.enviadoOficinaDolares}</p>
          <label>Recibido S/
            <input type="number" min="0" step="0.01" value={recepcionForm[reg._id]?.soles || ''}
              onChange={(e) => setRecepcionForm((p) => ({ ...p, [reg._id]: { ...p[reg._id], soles: e.target.value } }))} />
          </label>
          <label>Recibido US$
            <input type="number" min="0" step="0.01" value={recepcionForm[reg._id]?.dolares || ''}
              onChange={(e) => setRecepcionForm((p) => ({ ...p, [reg._id]: { ...p[reg._id], dolares: e.target.value } }))} />
          </label>
          <button onClick={() => handleConfirmarRecepcion(reg._id)}>Confirmar recepción</button>
        </div>
      ))}

      <h2>Registrar depósito al banco</h2>
      <form onSubmit={handleDeposito} className="card">
        <label>Fecha
          <input type="date" value={depositoForm.fecha} onChange={(e) => setDepositoForm({ ...depositoForm, fecha: e.target.value })} required />
        </label>
        <label>Soles
          <input type="number" min="0" step="0.01" value={depositoForm.soles} onChange={(e) => setDepositoForm({ ...depositoForm, soles: e.target.value })} />
        </label>
        <label>Dólares
          <input type="number" min="0" step="0.01" value={depositoForm.dolares} onChange={(e) => setDepositoForm({ ...depositoForm, dolares: e.target.value })} />
        </label>
        <label>Banco
          <input value={depositoForm.bancoDeclarado} onChange={(e) => setDepositoForm({ ...depositoForm, bancoDeclarado: e.target.value })} />
        </label>
        <button type="submit">Registrar depósito</button>
      </form>

      <h2>Conteo de Caja Oficina</h2>
      <form onSubmit={handleConteo} className="card">
        <label>Soles contados
          <input type="number" min="0" step="0.01" value={conteoForm.soles} onChange={(e) => setConteoForm({ ...conteoForm, soles: e.target.value })} required />
        </label>
        <label>Dólares contados
          <input type="number" min="0" step="0.01" value={conteoForm.dolares} onChange={(e) => setConteoForm({ ...conteoForm, dolares: e.target.value })} required />
        </label>
        <button type="submit">Registrar conteo</button>
      </form>

      <h2>Mis depósitos</h2>
      {depositos.map((d) => (
        <div key={d._id} className="card">
          <p>{d.fecha} · S/ {d.soles} · US$ {d.dolares} · {d.bancoDeclarado} · estado: {d.estado}</p>
          {d.confirmacionTesorero?.numeroSede && (
            <p>Confirmado: {d.confirmacionTesorero.banco} · Op. {d.confirmacionTesorero.numeroSede}</p>
          )}
        </div>
      ))}
    </div>
  );
}
