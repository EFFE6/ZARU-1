import React, { useState, useEffect } from 'react';
import api from '../../../api/api';
import {
  Plus,
  RefreshCw,
  ArrowUpDown,
  X,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Check
} from 'lucide-react';

// Iconos SVG personalizados
import iconBotonVer from '../../../assets/img/datosbasicos/icons/contratista/botonver.svg';
import iconBotonEdit from '../../../assets/img/datosbasicos/icons/contratista/botonedit.svg';
import iconCedula from '../../../assets/img/datosbasicos/icons/contratista/cedula.svg';
import iconPrestador from '../../../assets/img/datosbasicos/icons/contratista/prestadorservicios.svg';


interface Contratista {
  id: number;
  razonSocial: string;
  nit: string;
  regional: string;
  especialidad: string;
  estado: string;
}

const Contratistas: React.FC = () => {
  const [data, setData] = useState<Contratista[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [estadoFilter, setEstadoFilter] = useState('Todos');
  const [docFilter, setDocFilter] = useState('Todas');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({
    razonSocial: '',
    nit: '',
    regional: '',
    especialidad: ''
  });
  const [editId, setEditId] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/contratistas');
      setData(response.data);
    } catch (error) {
      console.error('Error fetching contratistas:', error);
      // Dummy data si falla el backend para ver el diseño
      if (data.length === 0) {
        setData([
          { id: 9526609, razonSocial: 'ATENCIÓN MEDICA INTEGRAL FAMI', nit: '123', regional: '63', especialidad: 'Prestador de servicios', estado: 'ACTIVO' },
          { id: 9526610, razonSocial: 'CENTRO DE SERVICIOS DE SALUD REGIONAL DE ANTIOQUIA', nit: '124', regional: '63', especialidad: 'Instructor 16', estado: 'INACTIVO' },
          { id: 9526611, razonSocial: 'CLINICA BLAS DE LEZO', nit: '125', regional: '15', especialidad: 'Instructor 16', estado: 'ACTIVO' },
          { id: 9526612, razonSocial: 'CLINICA FARALLONES S.A', nit: '126', regional: '15', especialidad: 'Instructor 16', estado: 'INACTIVO' }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (isEdit && editId) {
        await api.put(`/contratistas/${editId}`, formData);
        setData(p => p.map(d => d.id === editId ? { ...d, ...formData } : d));
      } else {
        const response = await api.post('/contratistas', { ...formData, estado: 'ACTIVO' });
        setData(p => [response.data, ...p]);
      }
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error saving contratista:', error);
    }
  };

  const openEdit = (item: Contratista) => {
    setFormData({
      razonSocial: item.razonSocial,
      nit: item.nit,
      regional: item.regional,
      especialidad: item.especialidad
    });
    setEditId(item.id);
    setIsEdit(true);
    setIsFormOpen(true);
  };

  const filteredData = data.filter(d => {
    if (estadoFilter !== 'Todos' && d.estado !== estadoFilter) return false;
    return true;
  });

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="db-content-card">
      {/* Toolbar */}
      <div className="db-toolbar">
        <div className="db-toolbar-filters">
          <div className="db-filter-group">
            <select className="db-filter-select" value={estadoFilter} onChange={e => { setEstadoFilter(e.target.value); setCurrentPage(1); }}>
              <option value="Todos">Estado</option>
              <option value="ACTIVO">ACTIVO</option>
              <option value="INACTIVO">INACTIVO</option>
            </select>
          </div>
          {estadoFilter !== 'Todos' && (
            <div className="db-active-filter-tag">
              Todos <X size={13} className="db-filter-tag-x" onClick={() => setEstadoFilter('Todos')} />
            </div>
          )}

          <div className="db-filter-group" style={{ marginLeft: '8px' }}>
            <select className="db-filter-select" value={docFilter} onChange={e => { setDocFilter(e.target.value); setCurrentPage(1); }}>
              <option value="Todas">Tipo de documento</option>
              <option value="CC">CC</option>
              <option value="NIT">NIT</option>
            </select>
          </div>
          {docFilter === 'Todas' && (
            <div className="db-active-filter-tag">
              Todas <X size={13} className="db-filter-tag-x" onClick={() => setDocFilter('')} />
            </div>
          )}
        </div>
        
        <div className="db-toolbar-right" style={{ marginLeft: '16px' }}>
          <button className="db-btn-refresh" onClick={fetchData}>
            <RefreshCw size={14} /> Actualizar
          </button>
          <button className="db-btn-new" onClick={() => { setIsEdit(false); setFormData({ razonSocial: '', nit: '', regional: '', especialidad: '' }); setIsFormOpen(true); }}>
            <Plus size={16} /> Nuevo Funcionario
          </button>
        </div>
      </div>

      <div className="db-table-wrapper">
        <table className="db-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>NOMBRE COMPLETO <ArrowUpDown size={13} className="db-sort-icon" /></th>
              <th>TIPO DE DOC.</th>
              <th>ESTADO</th>
              <th>TIPO VINCULACIÓN</th>
              <th>CARGO</th>
              <th>BENEFICIARIOS</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="db-table-empty">Cargando...</td></tr>
            ) : paginatedData.length === 0 ? (
              <tr><td colSpan={8} className="db-table-empty">No se encontraron resultados.</td></tr>
            ) : (
              paginatedData.map(c => (
                <tr key={c.id}>
                  <td className="db-col-id">{c.id}</td>
                  <td>
                    <div className="db-user-cell">
                      <div className="db-user-avatar">
                        {c.razonSocial.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="db-user-info">
                        <span className="db-user-name" style={{ textTransform: 'uppercase' }}>{c.razonSocial}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="db-regional-pill">
                      <img src={iconCedula} alt="CC" className="db-cargo-icon" />
                      CC
                    </span>
                  </td>
                  <td>
                    <div className={`db-toggle-switch ${c.estado === 'ACTIVO' ? 'active' : ''}`}>
                      <div className="db-toggle-thumb">
                        {c.estado === 'ACTIVO' ? <Check size={10} color="#059669" /> : <X size={10} color="#9ca3af" />}
                      </div>
                    </div>
                  </td>
                  <td>9101</td>
                  <td>
                    <span className="db-cargo-pill amarillo">
                      <img src={iconPrestador} alt="cargo" className="db-cargo-icon" />
                      {c.especialidad || 'Prestador de servicios'}
                    </span>
                  </td>
                  <td>20/04/2026</td>
                  <td>
                    <div className="db-row-actions">
                      <button className="db-icon-btn-svg" title="Ver" onClick={() => openEdit(c)}>
                        <img src={iconBotonVer} alt="ver" className="db-action-icon" />
                      </button>
                      <button className="db-icon-btn-svg" title="Editar" onClick={() => openEdit(c)}>
                        <img src={iconBotonEdit} alt="editar" className="db-action-icon" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="db-pagination">
        <div className="db-pagination-left">
          <span>Elementos por página</span>
          <select className="db-page-select" value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
        <div className="db-pagination-center">
          <button className="db-page-btn" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}><ChevronLeft size={14} /></button>
          {pageNumbers.slice(0, 7).map(n => (
            <button key={n} className={`db-page-btn ${currentPage === n ? 'active' : ''}`} onClick={() => setCurrentPage(n)}>{n}</button>
          ))}
          {totalPages > 7 && <span className="db-page-dots">...</span>}
          {totalPages > 7 && (
            <button className={`db-page-btn ${currentPage === 20 ? 'active' : ''}`} onClick={() => setCurrentPage(20)}>20</button>
          )}
          <button className="db-page-btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}><ChevronRight size={14} /></button>
        </div>
        <div className="db-pagination-right">
          1 - de 15 páginas
        </div>
      </div>

      {/* Modal Básico para editar (Mantenemos por funcionalidad) */}
      {isFormOpen && (
        <div className="db-modal-overlay" onClick={e => e.target === e.currentTarget && setIsFormOpen(false)}>
          <div className="db-modal-form">
            <div className="db-modal-header">
              <h2 className="db-modal-form-title">{isEdit ? 'Editar' : 'Nuevo'} Contratista</h2>
              <button className="db-modal-close" onClick={() => setIsFormOpen(false)}><X size={18} /></button>
            </div>
            <div className="db-modal-body">
              <div className="db-form-grid">
                <div className="db-form-field db-field-full">
                  <label className="db-form-label">Razón Social <HelpCircle size={13} className="db-help-icon" /></label>
                  <input className="db-form-input" placeholder="Ej: Clínica del Norte S.A.S." value={formData.razonSocial} onChange={e => setFormData(p => ({ ...p, razonSocial: e.target.value }))} />
                </div>
                <div className="db-form-field">
                  <label className="db-form-label">NIT <HelpCircle size={13} className="db-help-icon" /></label>
                  <input className="db-form-input" placeholder="Ej: 900.123.456-7" value={formData.nit} onChange={e => setFormData(p => ({ ...p, nit: e.target.value }))} />
                </div>
                <div className="db-form-field">
                  <label className="db-form-label">Especialidad <HelpCircle size={13} className="db-help-icon" /></label>
                  <input className="db-form-input" placeholder="Ej: Medicina General" value={formData.especialidad} onChange={e => setFormData(p => ({ ...p, especialidad: e.target.value }))} />
                </div>
                <div className="db-form-field db-field-full">
                  <label className="db-form-label">Regional <HelpCircle size={13} className="db-help-icon" /></label>
                  <input className="db-form-input" placeholder="Ej: Regional 63" value={formData.regional} onChange={e => setFormData(p => ({ ...p, regional: e.target.value }))} />
                </div>
              </div>
            </div>
            <div className="db-modal-footer">
              <button className="db-btn-cancel" onClick={() => setIsFormOpen(false)}>Cancelar</button>
              <button className="db-btn-primary" onClick={handleSave}>Guardar cambios</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contratistas;
