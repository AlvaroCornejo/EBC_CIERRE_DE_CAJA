import { useState } from 'react';
import Login from './Login';
import CajeroView from './CajeroView';
import MozoView from './MozoView';
import SupervisorView from './SupervisorView';
import ManagerView from './ManagerView';
import TesoreroView from './TesoreroView';
import ContadorView from './ContadorView';
import GerenteView from './GerenteView';
import AdminView from './AdminView';
import './App.css';

const PANTALLAS = {
  cajero: CajeroView,
  mozo: MozoView,
  supervisor: SupervisorView,
  manager: ManagerView,
  tesorero: TesoreroView,
  contador: ContadorView,
  gerente: GerenteView,
  administrador: AdminView
};

export default function App() {
  const [session, setSession] = useState(null);

  if (!session) {
    return (
      <div className="container">
        <h1>Cierre de Caja</h1>
        <Login onLogin={setSession} />
      </div>
    );
  }

  const rol = session.usuario.rol;
  const Pantalla = PANTALLAS[rol];

  return (
    <div className="container">
      <header className="topbar">
        <h1>Cierre de Caja</h1>
        <div>
          <span>{session.usuario.nombre} ({rol})</span>
          <button onClick={() => setSession(null)}>Salir</button>
        </div>
      </header>

      {Pantalla ? <Pantalla token={session.token} usuario={session.usuario} /> : <p>Este rol todavía no tiene pantalla.</p>}
    </div>
  );
}
