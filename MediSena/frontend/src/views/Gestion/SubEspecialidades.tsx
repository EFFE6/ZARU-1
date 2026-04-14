import React from 'react';
import {
  ArrowUpDown, Edit2, Trash2, Plus, RefreshCw, X, Building2, HelpCircle,
} from 'lucide-react';
import { SubEspecialidad } from './types';

/* ══════════════════════════════════════════════════════
   TOOLBAR
   ══════════════════════════════════════════════════════ */
export const SubEspecialidadesToolbar: React.FC<{ onNew: () => void }> = ({ onNew }) => (
  <div className="content-toolbar">
    <p className="tab-description">
      <span style={{ color: '#5c7a90', fontSize: '13px', fontWeight: 500 }}>
        Sub-especialidades asociadas a contratistas del sistema MediSENA.
      </span>
    </p>
    <div className="usuarios-toolbar-right" style={{ gap: '12px' }}>
      <select className="stat-select" style={{ minWidth: '160px' }}>
        <option>Seleccionar estado</option>
      </select>
      <button className="btn-new-resolution" style={{ background: '#004B85' }}>
        <RefreshCw size={14} />
        Actualizar
      </button>
      <button className="btn-new-resolution" onClick={onNew} style={{ background: '#004B85' }}>
        <Plus size={16} />
        Nueva Sub-especialidad
      </button>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════
   THEAD
   ══════════════════════════════════════════════════════ */
export const SubEspecialidadesHead: React.FC = () => (
  <tr>
    <th>CONSECUTIVO</th>
    <th>NOMBRE <ArrowUpDown size={13} className="sort-icon" /></th>
    <th>CONTRATISTA <ArrowUpDown size={13} className="sort-icon" /></th>
    <th>NIT <ArrowUpDown size={13} className="sort-icon" /></th>
    <th>REGIONAL <ArrowUpDown size={13} className="sort-icon" /></th>
    <th>MEDICAMENTOS</th>
    <th></th>
  </tr>
);

/* ══════════════════════════════════════════════════════
   TABLA
   ══════════════════════════════════════════════════════ */
interface SubEspecialidadesTablaProps {
  items: SubEspecialidad[];
  loading: boolean;
  onView: (s: SubEspecialidad) => void;
  onDelete: (s: SubEspecialidad) => void;
}

export const SubEspecialidadesTabla: React.FC<SubEspecialidadesTablaProps> = ({
  items, loading, onView, onDelete,
}) => {
  if (loading) return <tr><td colSpan={7} className="table-empty">Cargando datos...</td></tr>;
  if (items.length === 0) return <tr><td colSpan={7} className="table-empty">No se encontraron resultados.</td></tr>;

  return (
    <>
      {items.map(s => (
        <tr key={s.id}>
          <td>{s.consecutivo}</td>
          <td>{s.nombre}</td>
          <td>{s.contratista}</td>
          <td>{s.nit}</td>
          <td>
            <div className="regional-tag">
              <Building2 size={13} className="regional-icon" />
              <span className="regional-text">{s.regional}</span>
            </div>
          </td>
          <td><span style={{ color: '#e11d48', fontWeight: 600 }}>{s.medicamentos}</span></td>
          <td>
            <div className="row-actions">
              <button className="icon-btn edit" onClick={() => onView(s)}><Edit2 size={15} /></button>
              <button className="icon-btn delete" onClick={() => onDelete(s)}><Trash2 size={15} /></button>
            </div>
          </td>
        </tr>
      ))}
    </>
  );
};

/* ══════════════════════════════════════════════════════
   MODAL EDITAR SUB-ESPECIALIDAD
   ══════════════════════════════════════════════════════ */
interface EditSubModalProps {
  form: { consecutivo: string; nombre: string; contratista: string; nit: string; regional: string; medicamentos: string };
  onFormChange: (field: string, value: string) => void;
  onClose: () => void;
  onSave: () => void;
}

export const EditSubModal: React.FC<EditSubModalProps> = ({ form, onFormChange, onClose, onSave }) => (
  <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
    <div className="resolucion-modal user-edit-modal">
      <div className="resolucion-modal-header">
        <h2 className="resolucion-modal-title">Detalles de la Sub-Especialidad</h2>
        <button className="resolucion-modal-close" onClick={onClose}><X size={18} /></button>
      </div>
      <div className="resolucion-modal-body user-edit-body">
        <div className="ue-row">
          <div className="ue-field">
            <label className="ue-label">Nombre <HelpCircle size={13} className="rm-help" /></label>
            <input className="ue-input" value={form.nombre} onChange={e => onFormChange('nombre', e.target.value)} />
          </div>
          <div className="ue-field">
            <label className="ue-label">Contratista <HelpCircle size={13} className="rm-help" /></label>
            <input className="ue-input" value={form.contratista} onChange={e => onFormChange('contratista', e.target.value)} />
          </div>
        </div>
        <div className="ue-row">
          <div className="ue-field">
            <label className="ue-label">NIT <HelpCircle size={13} className="rm-help" /></label>
            <input className="ue-input" value={form.nit} onChange={e => onFormChange('nit', e.target.value)} />
          </div>
          <div className="ue-field">
            <label className="ue-label">Regional <HelpCircle size={13} className="rm-help" /></label>
            <input className="ue-input" value={form.regional} onChange={e => onFormChange('regional', e.target.value)} />
          </div>
        </div>
        <div className="ue-row">
          <div className="ue-field" style={{ flex: 1 }}>
            <label className="ue-label">Consecutivo <HelpCircle size={13} className="rm-help" /></label>
            <input className="ue-input" type="number" value={form.consecutivo} onChange={e => onFormChange('consecutivo', e.target.value)} />
          </div>
          <div className="ue-field" style={{ flex: 1 }}>
            <label className="ue-label">Medicamentos <HelpCircle size={13} className="rm-help" /></label>
            <input className="ue-input" type="number" value={form.medicamentos} onChange={e => onFormChange('medicamentos', e.target.value)} />
          </div>
        </div>
      </div>
      <div className="resolucion-modal-footer" style={{ justifyContent: 'flex-end', borderTop: 'none' }}>
        <div className="rm-footer-actions">
          <button className="rm-btn-cancel" onClick={onClose} style={{ minWidth: '100px' }}>Cancelar</button>
          <button className="rm-btn-primary" onClick={onSave} style={{ minWidth: '160px' }}>
            <Save size={15} />
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  </div>
);
