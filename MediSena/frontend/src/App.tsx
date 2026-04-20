import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './views/Login';
import Dashboard from './views/Dashboard';
import Gestion from './views/Gestion/Gestion';
import OrdenAtencion from './views/Movimientos/OrdenAtencion';
import CuentaCobro from './views/Movimientos/CuentaCobro';
import RelacionPagos from './views/Movimientos/RelacionPagos';
import './App.css';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route path="/dashboard" element={<Navigate to="/" replace />} />
      <Route path="/gestion" element={<ProtectedRoute><Gestion /></ProtectedRoute>} />
      <Route path="/datos-basicos" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/movimientos" element={<Navigate to="/movimientos/orden-atencion" replace />} />
      <Route path="/movimientos/orden-atencion" element={<ProtectedRoute><OrdenAtencion /></ProtectedRoute>} />
      <Route path="/movimientos/cuenta-cobro" element={<ProtectedRoute><CuentaCobro /></ProtectedRoute>} />
      <Route path="/movimientos/relacion-pagos" element={<ProtectedRoute><RelacionPagos /></ProtectedRoute>} />
      <Route path="/movimientos/programar-agenda" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/movimientos/agendas" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/movimientos/cancelar-ordenes" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/movimientos/consultar-ordenes" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/excedentes" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/consultas" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/reportes" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/reportes-nacionales" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      {/* Redirección por defecto */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
