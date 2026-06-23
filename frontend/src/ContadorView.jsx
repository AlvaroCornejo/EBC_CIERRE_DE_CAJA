import { useEffect, useState } from 'react';
import { resumenContador, crearConciliacion, listarConciliaciones } from './api';

const hoy = () => new Date().toISOString().slice(0, 10);

export default function ContadorView({ token, usuario }) {
  const sede = usuario.sedes[0];
  const [rango, setRango] = useState({ fechaDesde: hoy(), fechaHasta: hoy() });
  const [resumen, setResumen] = useState(null);
  const [comentario, setComentario] = useState('');
  const [conciliaciones, setConciliaciones] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  async function cargarConciliaciones() {
    setConciliaciones(await listarConciliaciones(token));
  }

  useEffect(() => { cargarConciliaciones(); }, []);

  async function handleCalcular(e) {
    e.preventDefault();
    setError(''); setMensaje(''); setResumen(null);
    try {
      const r = await resumenContador(token, sede, rango.fechaDesde, rango.fechaHasta);
      setResumen(r);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleConciliar() {
    setError(''); setMensaje('');
    try {
      await crearConciliacion(token, { sede, fechaDesde: rango.fechaDesde, fechaHasta: rango.fechaHasta, comentario });
      setMensaje('Conciliación registrada');
      setComentario('');
      setResumen(null);
      cargarConciliaciones();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <h2>Conciliar venta vs depósitos</h2>
      {mensaje && <p className="ok">{mensaje}</p>}
      {error && <p className="error">{error}</p>}

      <form onSubmit={handleCalcular} className="card">
        <label>Desde
          <input type="date" value={rango.fechaDesde} onChange={(e) => setRango({ ...rango, fechaDesde: e.target.value })} required />
        </label>
        <label>Hasta
          <input type="date" value={rango.fechaHasta} onChange={(e) => setRango({ ...rango, fechaHasta: e.target.value })} required />
        </label>
        <button type="submit">Calcular</button>
      </form>

      {resumen && (
        <div className="card">
          <p>Venta efectivo reportada: S/ {resumen.totalVentaEfectivoSoles} · US$ {resumen.totalVentaEfectivoDolares}</p>
          <p>Depositado y confirmado: S/ {resumen.totalDepositadoSoles} · US$ {resumen.totalDepositadoDolares}</p>
          <p>Diferencia: S/ {resumen.diferenciaSoles} · US$ {resumen.diferenciaDolares}</p>
          <label>Comentario
            <input value={comentario} onChange={(e) => setComentario(e.target.value)} />
          </label>
          <button onClick={handleConciliar}>Dar OK / Registrar conciliación</button>
        </div>
      )}

      <h2>Conciliaciones registradas</h2>
      {conciliaciones.map((c) => (
        <div key={c._id} className="card">
          <p>{c.fechaDesde} a {c.fechaHasta} · Venta S/ {c.totalVentaEfectivoSoles} · Depositado S/ {c.totalDepositadoSoles} · Diferencia S/ {c.diferenciaSoles}</p>
          {c.comentario && <p>Comentario: {c.comentario}</p>}
        </div>
      ))}
    </div>
  );
}
