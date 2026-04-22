import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './views/Login';
import Dashboard from './views/Dashboard';
import Gestion from './views/Gestion/Gestion';
import DatosBasicos from './views/DatosBasicos/DatosBasicos';
import OrdenAtencion from './views/Movimientos/OrdenAtencion';
import CuentaCobro from './views/Movimientos/CuentaCobro';
import RelacionPagos from './views/Movimientos/RelacionPagos';
import Agendas from './views/Movimientos/Agendas';
import ProgramarAgendaView from './views/Movimientos/ProgramarAgenda';
import GestionAgendasView from './views/Movimientos/GestionAgendas';
import CancelarOrdenes from './views/Movimientos/CancelarOrdenes';
import ConsultarOrdenes from './views/Movimientos/ConsultarOrdenes';
import './App.css';

import MainLayout from './components/MainLayout';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Protected Routes inside MainLayout */}
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/gestion" element={<Gestion />} />
          <Route path="/datos-basicos" element={<DatosBasicos />} />
          <Route path="/movimientos/orden-atencion" element={<OrdenAtencion />} />
          <Route path="/movimientos/cuenta-cobro" element={<CuentaCobro />} />
          <Route path="/movimientos/relacion-pagos" element={<RelacionPagos />} />
          <Route path="/movimientos/programar-agenda" element={<ProgramarAgendaView />} />
          <Route path="/movimientos/agendas" element={<GestionAgendasView />} />
          <Route path="/movimientos/cancelar-ordenes" element={<CancelarOrdenes />} />
          <Route path="/movimientos/consultar-ordenes" element={<ConsultarOrdenes />} />
          <Route path="/excedentes" element={<Dashboard />} />
          <Route path="/consultas" element={<Dashboard />} />
          <Route path="/reportes" element={<Dashboard />} />
          <Route path="/reportes-nacionales" element={<Dashboard />} />
        </Route>

        <Route path="/dashboard" element={<Navigate to="/" replace />} />
        <Route path="/movimientos" element={<Navigate to="/movimientos/orden-atencion" replace />} />

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
