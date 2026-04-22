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
import MovimientosWrapper from './views/Movimientos/MovimientosWrapper';
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
        {/* Rutas Protegidas dentro del MainLayout */}
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/gestion" element={<Gestion />} />
          <Route path="/datos-basicos" element={<DatosBasicos />} />
          <Route path="/movimientos" element={<MovimientosWrapper />}>
            <Route index element={<Navigate to="orden-atencion" replace />} />
            <Route path="orden-atencion" element={<OrdenAtencion />} />
            <Route path="cuenta-cobro" element={<CuentaCobro />} />
            <Route path="relacion-pagos" element={<RelacionPagos />} />
            <Route path="programar-agenda" element={<ProgramarAgendaView />} />
            <Route path="agendas" element={<GestionAgendasView />} />
            <Route path="cancelar-ordenes" element={<CancelarOrdenes />} />
            <Route path="consultar-ordenes" element={<ConsultarOrdenes />} />
          </Route>
          <Route path="/excedentes" element={<Dashboard />} />
          <Route path="/consultas" element={<Dashboard />} />
          <Route path="/reportes" element={<Dashboard />} />
          <Route path="/reportes-nacionales" element={<Dashboard />} />
        </Route>

        <Route path="/dashboard" element={<Navigate to="/" replace />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
