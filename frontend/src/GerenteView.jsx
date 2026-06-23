import { useEffect, useState } from 'react';
import { dashboardGerente } from './api';

export default function GerenteView({ token, usuario }) {
  const sede = usuario.sedes[0];
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    dashboardGerente(token, sede).then(setData).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!data) return <p>Cargando...</p>;

  return (
    <div>
      <h2>{data.sede.nombre}</h2>

      <div className="card">
        <h2>Saldo Caja Oficina</h2>
        <p>S/ {data.saldoCajaOficina.soles} · US$ {data.saldoCajaOficina.dolares}</p>
        <p>Límite: S/ {data.sede.limiteEfectivoSoles ?? '—'} · US$ {data.sede.limiteEfectivoDolares ?? '—'}</p>
      </div>

      <h2>Saldos en caja (último cierre por caja)</h2>
      {data.saldosPorCaja.map((s, i) => (
        <div key={i} className="card">
          <p>{s.caja} · {s.fecha} · S/ {s.efectivoCierreSoles} · US$ {s.efectivoCierreDolares} · estado: {s.estado}</p>
        </div>
      ))}

      <h2>Depósitos recientes al banco</h2>
      {data.depositosRecientes.map((d) => (
        <div key={d._id} className="card">
          <p>{d.fecha} · S/ {d.soles} · US$ {d.dolares} · {d.bancoDeclarado} · estado: {d.estado} · por {d.manager?.nombre}</p>
        </div>
      ))}

      <h2>Cierres de caja recientes</h2>
      {data.cierresRecientes.map((c) => (
        <div key={c._id} className="card">
          <p>{c.fecha} · {c.caja?.nombre} · {c.turno?.nombre} · {c.cajero?.nombre} · estado: {c.estado}</p>
        </div>
      ))}
    </div>
  );
}
