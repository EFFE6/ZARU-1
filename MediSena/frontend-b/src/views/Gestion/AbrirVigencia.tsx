import React from 'react';
import { AlertTriangle, Plus } from 'lucide-react';

/* ══════════════════════════════════════════════════════
   VISTA ABRIR VIGENCIA (no tiene tabla, es contenido estático)
   ══════════════════════════════════════════════════════ */
const AbrirVigencia: React.FC = () => (
  <div className="abr-vigencia-container">
    <div className="vigencia-card-content">
      {/* Alerta de atención */}
      <div className="um-alert warning" style={{ marginBottom: 0 }}>
        <AlertTriangle size={16} className="um-alert-icon" color="#d97706" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <strong style={{ color: '#002c4d', fontSize: '13px' }}>Atención</strong>
          <span style={{ fontSize: '12px', color: '#5c7a90' }}>
            Este proceso solo puede ser ejecutado en la nueva vigencia 2027.
          </span>
        </div>
      </div>

      <div className="vigencia-sections">
        {/* Sección: ¿Qué pasará? */}
        <div className="vigencia-section">
          <h2 style={{ color: '#1e3a52', fontSize: '20px', marginBottom: '16px', fontWeight: 900, letterSpacing: '-0.02em' }}>
            ¿Qué pasará al abrir la nueva vigencia?
          </h2>
          <p style={{ color: '#5c7a90', fontSize: '14px', marginBottom: '12px', fontWeight: 500 }}>
            Se copiarán automáticamente los siguientes datos de la vigencia anterior:
          </p>
          <ul className="vigencia-list">
            <li>Parámetros</li>
            <li>Resoluciones</li>
            <li>Topes</li>
            <li>Cargos</li>
            <li>Cargos por funcionario</li>
            <li>Categorías por regional</li>
            <li>Beneficiarios (se actualizarán los suspendidos)</li>
          </ul>
        </div>

        {/* Sección: Procesos que se activarán */}
        <div className="vigencia-section">
          <h2 style={{ color: '#1e3a52', fontSize: '20px', marginBottom: '16px', fontWeight: 900, letterSpacing: '-0.02em' }}>
            Procesos que se activarán
          </h2>
          <p style={{ color: '#5c7a90', fontSize: '14px', marginBottom: '12px', fontWeight: 500 }}>
            Después de crear la vigencia, podrás usar:
          </p>
          <ul className="vigencia-list">
            <li>Órdenes de atención</li>
            <li>Cuentas de cobro</li>
            <li>Recibos de pago</li>
          </ul>
        </div>
      </div>

      {/* Acciones finales */}
      <div className="vigencia-actions">
        <button className="btn-new-resolution" style={{ background: '#002c4d', padding: '12px 24px', borderRadius: '10px' }}>
          <Plus size={18} />
          Abrir vigencia 2027
        </button>
        <p className="vigencia-footer-info">
          Este proceso puede tardar unos minutos.
        </p>
      </div>
    </div>
  </div>
);

export default AbrirVigencia;
