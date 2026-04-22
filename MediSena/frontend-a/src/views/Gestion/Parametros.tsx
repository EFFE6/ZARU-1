import React from 'react';
import {
  ArrowUpDown, Edit2, HelpCircle, RefreshCw, Building2, X,
} from 'lucide-react';
import { Parametro } from './types';

/* ══════════════════════════════════════════════════════
   TOOLBAR
   ══════════════════════════════════════════════════════ */
export const ParametrosToolbar: React.FC = () => (
  <div className="content-toolbar">
    <p className="tab-description">
      <span style={{ color: '#5c7a90', fontSize: '13px', fontWeight: 600 }}>
        Este dato se promediará con el valor del SMLV de la vigencia 2025:{' '}
        <strong style={{ color: '#002c4d' }}>$ 1.423.500</strong>
      </span>
    </p>
    <div className="usuarios-toolbar-right" style={{ gap: '12px' }}>
      <select className="stat-select" style={{ minWidth: '150px' }}>
        <option>Vigencia 2025</option>
      </select>
      <button className="btn-new-resolution" style={{ background: '#004B85' }}>
        <RefreshCw size={14} />
        Actualizar
      </button>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════
   THEAD
   ══════════════════════════════════════════════════════ */
export const ParametrosHead: React.FC = () => (
  <tr>
    <th>VIGENCIA</th>
    <th>REGIONAL</th>
    <th>RESOLUCIÓN</th>
    <th>RAZÓN SOCIAL</th>
    <th>% NORMAL</th>
    <th>VoBos</th>
    <th></th>
  </tr>
);

/* ══════════════════════════════════════════════════════
   TABLA PARÁMETROS
   ══════════════════════════════════════════════════════ */
interface ParametrosTablaProps {
  items: Parametro[];
  loading: boolean;
  tooltip: { id: number; text: string } | null;
  onTooltip: (v: { id: number; text: string } | null) => void;
  onEdit: (p: Parametro) => void;
}

export const ParametrosTabla: React.FC<ParametrosTablaProps> = ({
  items, loading, tooltip, onTooltip, onEdit
}) => {
  if (loading) return <tr><td colSpan={7} className="table-empty">Cargando datos...</td></tr>;
  if (items.length === 0) return <tr><td colSpan={7} className="table-empty">No se encontraron resultados.</td></tr>;

  return (
    <>
      {items.map(p => (
        <tr key={p.id}>
          <td>
            <div className="desc-with-icon" style={{ gap: '6px' }}>
              <div
                className="regional-tag has-remove"
                style={{ padding: 0, background: 'none', border: 'none', color: '#94a3b8' }}
                onMouseEnter={() => onTooltip({ id: p.id, text: `Este dato corresponde al SMLV del año ${p.vigencia}` })}
                onMouseLeave={() => onTooltip(null)}
              >
                <HelpCircle size={14} />
                {tooltip?.id === p.id && (
                  <div className="regional-tooltip" style={{ bottom: '100%', left: '0', whiteSpace: 'nowrap' }}>{tooltip.text}</div>
                )}
              </div>
              {p.vigencia}
            </div>
          </td>
          <td>
            <div className="regional-tag">
              <Building2 size={13} className="regional-icon" />
              <span className="regional-text">{p.regional}</span>
              <button className="regional-remove"><X size={11} /></button>
            </div>
          </td>
          <td>{p.resolucion}</td>
          <td>{p.razonSocial}</td>
          <td>{p.porcentajeNormal}</td>
          <td>{p.vobos}</td>
          <td>
            <div className="row-actions">
              <button className="icon-btn edit" onClick={() => onEdit(p)}><Edit2 size={15} /></button>
            </div>
          </td>
        </tr>
      ))}
    </>
  );
};

/* ══════════════════════════════════════════════════════
   MODAL EDITAR PARÁMETRO
   ══════════════════════════════════════════════════════ */
import { Save } from 'lucide-react';
interface EditParametroModalProps {
  form: { vigencia: string; regional: string; resolucion: string; razonSocial: string; porcentajeNormal: string; vobos: string };
  onFormChange: (field: string, value: string) => void;
  onClose: () => void;
  onSave: () => void;
}

export const EditParametroModal: React.FC<EditParametroModalProps> = ({ form, onFormChange, onClose, onSave }) => (
  <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
    <div className="resolucion-modal user-edit-modal">
      <div className="resolucion-modal-header">
        <h2 className="resolucion-modal-title">Editar Parámetro</h2>
        <button className="resolucion-modal-close" onClick={onClose}><X size={18} /></button>
      </div>
      <div className="resolucion-modal-body user-edit-body">
        <div className="ue-row">
          <div className="ue-field">
            <label className="ue-label">Vigencia <HelpCircle size={13} className="rm-help" /></label>
            <input className="ue-input" value={form.vigencia} onChange={e => onFormChange('vigencia', e.target.value)} />
          </div>
          <div className="ue-field">
            <label className="ue-label">Regional <HelpCircle size={13} className="rm-help" /></label>
            <input className="ue-input" value={form.regional} onChange={e => onFormChange('regional', e.target.value)} />
          </div>
        </div>
        <div className="ue-row">
          <div className="ue-field">
            <label className="ue-label">Resolución <HelpCircle size={13} className="rm-help" /></label>
            <input className="ue-input" value={form.resolucion} onChange={e => onFormChange('resolucion', e.target.value)} />
          </div>
          <div className="ue-field">
            <label className="ue-label">Razón Social <HelpCircle size={13} className="rm-help" /></label>
            <input className="ue-input" value={form.razonSocial} onChange={e => onFormChange('razonSocial', e.target.value)} />
          </div>
        </div>
        <div className="ue-row">
          <div className="ue-field">
            <label className="ue-label">% SMLV <HelpCircle size={13} className="rm-help" /></label>
            <input className="ue-input" value={form.porcentajeNormal} onChange={e => onFormChange('porcentajeNormal', e.target.value)} />
          </div>
          <div className="ue-field">
            <label className="ue-label">VoBos <HelpCircle size={13} className="rm-help" /></label>
            <input className="ue-input" type="number" value={form.vobos} onChange={e => onFormChange('vobos', e.target.value)} />
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
