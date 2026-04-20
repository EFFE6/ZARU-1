import React, { useState, useEffect } from 'react';
import api from '../../../api/api';
import {
  Search,
  Plus,
  RefreshCw,
  ArrowUpDown,
  Eye,
  Pencil,
  Ban,
  Users,
  Check,
  X,
  Trash2,
  Save,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Info
} from 'lucide-react';

export interface Funcionario {
  id: number;
  identificacion: string;
  nombre: string;
  cargo: string;
  dependencia: string;
  regional: string;
  beneficiarios: {
    activos: number;
    inactivos: number;
  };
  estado: string;
}

export interface Beneficiario {
  id: number;
  letra: string;
  nombre: string;
  documento: string;
  clasificacion: string;
  parentesco: string;
  edad: string;
  genero: string;
  telefono: string;
  estado: string;
  suspendido: boolean;
}

interface FuncionariosProps {
  onOpenBeneficiarios: (f: Funcionario) => void;
}

const Funcionarios: React.FC<FuncionariosProps> = ({ onOpenBeneficiarios }) => {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('Todos');
  const [regionalFilter, setRegionalFilter] = useState('Todas');

  /* ── Paginación ── */
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Funcionario | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({
    identificacion: '',
    nombre: '',
    cargo: '',
    dependencia: '',
    regional: ''
  });
  const [editId, setEditId] = useState<number | null>(null);

  useEffect(() => {
    fetchFuncionarios();
  }, []);

  const fetchFuncionarios = async () => {
    setLoading(true);
    try {
      const response = await api.get('/funcionarios');
      setFuncionarios(response.data);
    } catch (error) {
      console.error('Error fetching funcionarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await api.delete(`/funcionarios/${itemToDelete.id}`);
      setFuncionarios(p => p.filter(f => f.id !== itemToDelete.id));
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error('Error deleting funcionario:', error);
    }
  };

  const handleSave = async () => {
    try {
      if (isEdit && editId) {
        await api.put(`/funcionarios/${editId}`, formData);
        setFuncionarios(p => p.map(f => f.id === editId ? { ...f, ...formData } : f));
      } else {
        const response = await api.post('/funcionarios', {
          ...formData,
          estado: 'ACTIVO',
          beneficiarios: { activos: 0, inactivos: 0 }
        });
        setFuncionarios(p => [response.data, ...p]);
      }
      setIsFormOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving funcionario:', error);
    }
  };

  const resetForm = () => {
    setFormData({ identificacion: '', nombre: '', cargo: '', dependencia: '', regional: '' });
    setEditId(null);
    setIsEdit(false);
  };

  const openEdit = (f: Funcionario) => {
    setFormData({
      identificacion: f.identificacion,
      nombre: f.nombre,
      cargo: f.cargo,
      dependencia: f.dependencia,
      regional: f.regional
    });
    setEditId(f.id);
    setIsEdit(true);
    setIsFormOpen(true);
  };

  const filteredData = funcionarios.filter(f => {
    const q = searchQuery.toLowerCase();
    const matchesQuery = f.nombre.toLowerCase().includes(q) || 
                        f.cargo.toLowerCase().includes(q) || 
                        f.identificacion.includes(q);
    const matchesEstado = estadoFilter === 'Todos' || f.estado === estadoFilter;
    const matchesRegional = regionalFilter === 'Todas' || f.regional === regionalFilter;
    return matchesQuery && matchesEstado && matchesRegional;
  });

  /* ── Lógica Paginación ── */
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="db-content-card first-tab-active">
      {/* Toolbar */}
      <div className="db-toolbar">
        <div className="db-toolbar-filters">
          <div className="db-search-wrapper" style={{ flex: 2 }}>
            <div className="db-search-container">
              <Search size={16} color="#3f607d" />
              <input
                type="text"
                placeholder="Buscar por identificación, nombre o cargo..."
                className="db-search-input"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>
          <div className="db-filter-group">
            <label className="db-filter-label">Estado</label>
            <select className="db-filter-select" value={estadoFilter} onChange={e => { setEstadoFilter(e.target.value); setCurrentPage(1); }}>
              <option>Todos</option>
              <option>ACTIVO</option>
              <option>INACTIVO</option>
            </select>
          </div>
          <div className="db-filter-group">
            <label className="db-filter-label">Regional</label>
            <select className="db-filter-select" value={regionalFilter} onChange={e => { setRegionalFilter(e.target.value); setCurrentPage(1); }}>
              <option>Todas</option>
              <option>15</option>
              <option>63</option>
            </select>
          </div>
        </div>
        <div className="db-toolbar-right" style={{ marginLeft: '16px' }}>
          <button className="db-btn-refresh" onClick={fetchFuncionarios}>
            <RefreshCw size={14} />
            Actualizar
          </button>
          <button className="db-btn-new" onClick={() => { resetForm(); setIsFormOpen(true); }}>
            <Plus size={16} />
            Nuevo Funcionario
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="db-table-wrapper">
        <table className="db-table">
          <thead>
            <tr>
              <th>IDENTIFICACIÓN <ArrowUpDown size={13} className="db-sort-icon" /></th>
              <th>NOMBRE COMPLETOS <ArrowUpDown size={13} className="db-sort-icon" /></th>
              <th>CARGO</th>
              <th>DEPENDENCIA</th>
              <th>REGIONAL</th>
              <th>BENEFICIARIOS</th>
              <th>ESTADO</th>
              <th>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="db-table-empty">Cargando funcionarios...</td></tr>
            ) : paginatedData.length === 0 ? (
              <tr><td colSpan={8} className="db-table-empty">No se encontraron funcionarios.</td></tr>
            ) : (
              paginatedData.map(f => (
                <tr key={f.id}>
                  <td>{f.identificacion}</td>
                  <td>
                    <div className="db-avatar-container">
                      <div className="db-avatar-circle">
                        {f.nombre.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <span className="db-name-text">{f.nombre}</span>
                    </div>
                  </td>
                  <td><span className="db-cargo-text">{f.cargo}</span></td>
                  <td>{f.dependencia}</td>
                  <td>{f.regional}</td>
                  <td>
                    <div className="db-beneficiarios-td">
                      <Users size={18} className="db-beneficiarios-icon" style={{ cursor: 'pointer' }} onClick={() => onOpenBeneficiarios(f)} />
                      <div className="db-beneficiarios-grid">
                        <div className="db-beneficiario-stat">
                          {f.beneficiarios.activos} <Check size={11} className="db-stat-check" />
                        </div>
                        <div className="db-beneficiario-stat">
                          {f.beneficiarios.inactivos} <X size={11} className="db-stat-x" />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`db-status-badge ${f.estado === 'ACTIVO' ? 'activo' : 'inactivo'}`}>
                      <Check size={14} style={{ marginRight: '4px' }} />
                      {f.estado}
                    </span>
                  </td>
                  <td>
                    <div className="db-row-actions">
                      <button className="db-icon-btn db-icon-eye" title="Ver"><Eye size={16} /></button>
                      <button className="db-icon-btn db-icon-pencil" title="Editar" onClick={() => openEdit(f)}><Pencil size={16} /></button>
                      <button className="db-icon-btn db-icon-ban" title="Restringir" onClick={() => { setItemToDelete(f); setIsDeleteModalOpen(true); }}><Ban size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación (Dashboard style) */}
      <div className="db-pagination">
        <div className="db-pagination-left">
          <span>Elementos por página</span>
          <select className="db-page-select" value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>
        <div className="db-pagination-center">
          <button className="db-page-btn" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}><ChevronsLeft size={14} /></button>
          <button className="db-page-btn" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronLeft size={14} /></button>
          {pageNumbers.map(n => (
            <button key={n} className={`db-page-btn ${currentPage === n ? 'active' : ''}`} onClick={() => setCurrentPage(n)}>{n}</button>
          ))}
          <button className="db-page-btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}><ChevronRight size={14} /></button>
          <button className="db-page-btn" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}><ChevronsRight size={14} /></button>
        </div>
        <div className="db-pagination-right">
          {totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalItems)} de {totalItems} Registros
        </div>
      </div>


      {/* Modal Crear/Editar Funcionario */}
      {isFormOpen && (
        <div className="db-modal-overlay" onClick={e => e.target === e.currentTarget && setIsFormOpen(false)}>
          <div className="db-modal-form">
            <div className="db-modal-header">
              <h2 className="db-modal-form-title">{isEdit ? 'Editar' : 'Nuevo'} Funcionario</h2>
              <button className="db-modal-close" onClick={() => setIsFormOpen(false)}><X size={18} /></button>
            </div>
            <div className="db-modal-body">
              <div className="db-form-grid">
                <div className="db-form-field">
                  <label className="db-form-label">Identificación <HelpCircle size={13} className="db-help-icon" /></label>
                  <input className="db-form-input" placeholder="Ej: 9526609" value={formData.identificacion} onChange={e => setFormData(p => ({ ...p, identificacion: e.target.value }))} />
                </div>
                <div className="db-form-field">
                  <label className="db-form-label">Nombre completo <HelpCircle size={13} className="db-help-icon" /></label>
                  <input className="db-form-input" placeholder="Ej: AGUIRRE CAMACHO LUIS ALEJANDRO" value={formData.nombre} onChange={e => setFormData(p => ({ ...p, nombre: e.target.value }))} />
                </div>
                <div className="db-form-field">
                  <label className="db-form-label">Cargo <HelpCircle size={13} className="db-help-icon" /></label>
                  <input className="db-form-input" placeholder="Ej: INSTRUCTOR 16" value={formData.cargo} onChange={e => setFormData(p => ({ ...p, cargo: e.target.value }))} />
                </div>
                <div className="db-form-field">
                  <label className="db-form-label">Dependencia <HelpCircle size={13} className="db-help-icon" /></label>
                  <input className="db-form-input" placeholder="Ej: 9101" value={formData.dependencia} onChange={e => setFormData(p => ({ ...p, dependencia: e.target.value }))} />
                </div>
                <div className="db-form-field">
                  <label className="db-form-label">Regional <HelpCircle size={13} className="db-help-icon" /></label>
                  <input className="db-form-input" placeholder="Ej: 15" value={formData.regional} onChange={e => setFormData(p => ({ ...p, regional: e.target.value }))} />
                </div>
              </div>
            </div>
            <div className="db-modal-footer">
              <button className="db-btn-cancel" onClick={() => setIsFormOpen(false)}>Cancelar</button>
              <button className="db-btn-primary" onClick={handleSave}>
                <Save size={15} />
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Eliminar Funcionario */}
      {isDeleteModalOpen && (
        <div className="db-modal-overlay" onClick={e => e.target === e.currentTarget && setIsDeleteModalOpen(false)}>
          <div className="db-modal-delete">
            <div className="db-delete-icon-wrap"><Trash2 size={24} color="white" /></div>
            <h3 className="db-modal-title">¿Eliminar registro?</h3>
            <p className="db-modal-description">Esta acción no se puede deshacer. Se eliminará al funcionario del sistema.</p>
            <div className="db-modal-actions">
              <button className="db-btn-modal db-btn-cancel-modal" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</button>
              <button className="db-btn-modal db-btn-delete-modal" onClick={handleDelete}><Trash2 size={15} /> Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Funcionarios;
