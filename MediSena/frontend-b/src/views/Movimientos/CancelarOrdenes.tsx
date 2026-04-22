import React, { useState } from 'react';
import MovimientosLayout from './MovimientosLayout';
import { X, Search, AlertTriangle, FileX } from 'lucide-react';
import './CancelarOrdenes.css';

const CancelarOrdenes: React.FC = () => {
  const [numeroOrden, setNumeroOrden] = useState('');
  const [buscado, setBuscado] = useState(false);
  const [resultado, setResultado] = useState<null | { numero: string; paciente: string; fecha: string; servicio: string }>(null);

  const handleBuscar = async () => {
    if (!numeroOrden.trim()) return;
    setBuscado(true);
    // Simulación de búsqueda
    setResultado(null);
  };

  return (
    <MovimientosLayout breadcrumb={['Movimientos', 'Cancelar Órdenes']}>
      <div className="cancel-card">

        {/* Header */}
        <div className="cancel-header">
          <div className="cancel-header-left">
            <div className="cancel-title-row">
              <div className="cancel-title-icon">
                <X size={20} color="white" />
              </div>
              <h1 className="cancel-title">Cancelar Órdenes</h1>
            </div>
            <p className="cancel-subtitle">Busque y cancele órdenes de atención médica</p>
          </div>
        </div>

        {/* Buscador */}
        <div className="cancel-search-row">
          <input
            type="text"
            className="cancel-search-input"
            placeholder="Número de Orden"
            value={numeroOrden}
            onChange={e => setNumeroOrden(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleBuscar()}
          />
          <button className="cancel-search-btn" onClick={handleBuscar}>
            <Search size={15} style={{ marginRight: 6 }} />
            Buscar
          </button>
        </div>

        {/* Banner de advertencia */}
        <div className="cancel-warning-banner">
          <AlertTriangle size={16} color="#d97706" style={{ flexShrink: 0 }} />
          <span>
            <strong>Atención:</strong> Esta acción es irreversible. Una vez cancelada, la orden no podrá ser reactivada.
          </span>
        </div>

        {/* Resultado */}
        {buscado && !resultado && (
          <div className="cancel-empty">
            <FileX size={48} color="#cbd5e1" />
            <p>No se encontró ninguna orden con el número <strong>{numeroOrden}</strong>.</p>
          </div>
        )}

        {resultado && (
          <div className="cancel-result-card">
            <div className="cancel-result-grid">
              <div className="cancel-result-item">
                <span className="cancel-result-label">N° Orden</span>
                <span className="cancel-result-value">{resultado.numero}</span>
              </div>
              <div className="cancel-result-item">
                <span className="cancel-result-label">Paciente</span>
                <span className="cancel-result-value">{resultado.paciente}</span>
              </div>
              <div className="cancel-result-item">
                <span className="cancel-result-label">Fecha</span>
                <span className="cancel-result-value">{resultado.fecha}</span>
              </div>
              <div className="cancel-result-item">
                <span className="cancel-result-label">Servicio</span>
                <span className="cancel-result-value">{resultado.servicio}</span>
              </div>
            </div>
            <div className="cancel-result-actions">
              <button className="cancel-btn-cancel-order">
                <X size={16} /> Cancelar Orden
              </button>
            </div>
          </div>
        )}

      </div>
    </MovimientosLayout>
  );
};

export default CancelarOrdenes;
