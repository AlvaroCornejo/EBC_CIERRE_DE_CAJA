import { useEffect, useState } from 'react';
import { pendientesAprobacion, aprobarCierre, rechazarCierre } from './api';

export default function SupervisorView({ token }) {
  const [pendientes, setPendientes] = useState([]);
  const [comentarios, setComentarios] = useState({});
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  async function cargar() {
    setPendientes(await pendientesAprobacion(token));
  }

  useEffect(() => { cargar(); }, []);

  async function handleAprobar(id) {
    setError(''); setMensaje('');
    try {
      await aprobarCierre(token, id, comentarios[id]);
      setMensaje('Cierre aprobado');
      cargar();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRechazar(id) {
    setError(''); setMensaje('');
    if (!comentarios[id]) {
      setError('Para rechazar debes indicar el motivo en el campo de comentario');
      return;
    }
    try {
      await rechazarCierre(token, id, comentarios[id]);
      setMensaje('Cierre rechazado, vuelve a manos del cajero');
      cargar();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h2>Cierres pendientes de aprobación</h2>
      {mensaje && <p className="ok">{mensaje}</p>}
      {error && <p className="error">{error}</p>}

      {pendientes.length === 0 && <p>No hay cierres pendientes.</p>}
      {pendientes.map((reg) => (
        <div key={reg._id} className="card">
          <p>
            <strong>{reg.sede?.nombre}</strong> · {reg.caja?.nombre} · {reg.turno?.nombre} · {reg.fecha}
          </p>
          <p>Cajero: {reg.cajero?.nombre}</p>
          <p>Apertura: S/ {reg.apertura.soles} · US$ {reg.apertura.dolares}</p>
          <div className="grid">
            <p>Venta efectivo: S/ {reg.cierre.ventaEfectivoSoles} · US$ {reg.cierre.ventaEfectivoDolares}</p>
            <p>TIP: S/ {reg.cierre.tipSoles} · US$ {reg.cierre.tipDolares}</p>
            <p>Vuelto S/ (pagos US$): {reg.cierre.vueltoSolesPorPagosDolares}</p>
            <p>Enviado a oficina: S/ {reg.cierre.enviadoOficinaSoles} · US$ {reg.cierre.enviadoOficinaDolares}</p>
            <p>Efectivo cierre: S/ {reg.cierre.efectivoCierreSoles} · US$ {reg.cierre.efectivoCierreDolares}</p>
          </div>
          {reg.rechazos?.length > 0 && (
            <p className="error">Rechazado antes {reg.rechazos.length} vez(es). Último motivo: {reg.rechazos[reg.rechazos.length - 1].motivo}</p>
          )}
          <label>
            Comentario / motivo de rechazo
            <input
              value={comentarios[reg._id] || ''}
              onChange={(e) => setComentarios((prev) => ({ ...prev, [reg._id]: e.target.value }))}
            />
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => handleAprobar(reg._id)}>Dar OK</button>
            <button onClick={() => handleRechazar(reg._id)}>Rechazar</button>
          </div>
        </div>
      ))}
    </div>
  );
}
