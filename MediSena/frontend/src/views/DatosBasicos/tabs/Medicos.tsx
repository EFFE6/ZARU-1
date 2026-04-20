import React, { useState, useEffect } from 'react';
import api from '../../../api/api';
import {
  Search,
  Plus,
  RefreshCw,
  ArrowUpDown,
  Edit2,
  Trash2,
  X,
  Save,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

interface Medico {
  id: number;
  nombre: string;
  especialidad: string;
  registro: string;
  regional: string;
  estado: string;
}

const Medicos: React.FC = () => {
  const [data, setData] = useState<Medico[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Medico | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    especialidad: '',
    registro: '',
    regional: ''
  });
  const [editId, setEditId] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/medicos');
      setData(response.data);
    } catch (error) {
      console.error('Error fetching medicos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await api.delete(`/medicos/${itemToDelete.id}`);
      setData(p => p.filter(d => d.id !== itemToDelete.id));
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error('Error deleting medico:', error);
    }
  };

  const handleSave = async () => {
    try {
      if (isEdit && editId) {
        await api.put(`/medicos/${editId}`, formData);
        setData(p => p.map(d => d.id === editId ? { ...d, ...formData } : d));
      } else {
        const response = await api.post('/medicos', { ...formData, estado: 'Activo' });
        setData(p => [response.data, ...p]);
      }
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error saving medico:', error);
    }
  };

  const openEdit = (item: Medico) => {
    setFormData({
      nombre: item.nombre,
      especialidad: item.especialidad,
      registro: item.registro,
      regional: item.regional
    });
    setEditId(item.id);
    setIsEdit(true);
    setIsFormOpen(true);
  };

  const filteredData = data.filter(d => {
    const q = searchQuery.toLowerCase();
    return d.nombre.toLowerCase().includes(q) || d.especialidad.toLowerCase().includes(q);
  });

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="db-content-card">
      <div className="db-toolbar">
        <p className="db-tab-description">Administra el personal médico del sistema.</p>
        <div className="db-toolbar-right">
          <div className="db-search-wrapper" style={{ marginRight: '10px' }}>
            <div className="db-search-container">
              <Search size={16} color="#3f607d" />
              <input
                type="text"
                placeholder="Buscar médico..."
                className="db-search-input"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <button className="db-btn-refresh" onClick={fetchData}><RefreshCw size={14} /> Actualizar</button>
          <button className="db-btn-new" onClick={() => { setIsEdit(false); setFormData({ nombre: '', especialidad: '', registro: '', regional: '' }); setIsFormOpen(true); }}>
            <Plus size={16} /> Nuevo Médico
          </button>
        </div>
      </div>

      <div className="db-table-wrapper">
        <table className="db-table">
          <thead>
            <tr>
              <th>NOMBRE <ArrowUpDown size={13} className="db-sort-icon" /></th>
              <th>ESPECIALIDAD</th>
              <th>REGISTRO</th>
              <th>REGIONAL</th>
              <th>ESTADO</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="db-table-empty">Cargando...</td></tr>
            ) : paginatedData.length === 0 ? (
              <tr><td colSpan={6} className="db-table-empty">No se encontraron resultados.</td></tr>
            ) : (
              paginatedData.map(m => (
                <tr key={m.id}>
                  <td className="db-col-main">{m.nombre}</td>
                  <td>{m.especialidad}</td>
                  <td className="db-col-registro">{m.registro}</td>
                  <td><span className="db-regional-tag">{m.regional}</span></td>
                  <td>
                    <span className={`db-status-badge ${m.estado === 'Activo' ? 'activo' : 'inactivo'}`}>
                      <span className={`db-status-dot ${m.estado === 'Activo' ? 'activo' : 'inactivo'}`}></span>
                      {m.estado}
                    </span>
                  </td>
                  <td>
                    <div className="db-row-actions">
                      <button className="db-icon-btn edit" onClick={() => openEdit(m)}><Edit2 size={15} /></button>
                      <button className="db-icon-btn delete" onClick={() => { setItemToDelete(m); setIsDeleteModalOpen(true); }}><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
          {totalItems === 0 ? '0' : (currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalItems)} de {totalItems} Registros
        </div>
      </div>

      {isFormOpen && (
        <div className="db-modal-overlay" onClick={e => e.target === e.currentTarget && setIsFormOpen(false)}>
          <div className="db-modal-form">
            <div className="db-modal-header">
              <h2 className="db-modal-form-title">{isEdit ? 'Editar' : 'Nuevo'} Médico</h2>
              <button className="db-modal-close" onClick={() => setIsFormOpen(false)}><X size={18} /></button>
            </div>
            <div className="db-modal-body">
              <div className="db-form-grid">
                <div className="db-form-field db-field-full">
                  <label className="db-form-label">Nombre completo <HelpCircle size={13} className="db-help-icon" /></label>
                  <input className="db-form-input" placeholder="Ej: Dr. Juan Carlos Herrera" value={formData.nombre} onChange={e => setFormData(p => ({ ...p, nombre: e.target.value }))} />
                </div>
                <div className="db-form-field">
                  <label className="db-form-label">Especialidad <HelpCircle size={13} className="db-help-icon" /></label>
                  <input className="db-form-input" placeholder="Ej: Medicina Interna" value={formData.especialidad} onChange={e => setFormData(p => ({ ...p, especialidad: e.target.value }))} />
                </div>
                <div className="db-form-field">
                  <label className="db-form-label">N° Registro Médico <HelpCircle size={13} className="db-help-icon" /></label>
                  <input className="db-form-input" placeholder="Ej: RM-12345" value={formData.registro} onChange={e => setFormData(p => ({ ...p, registro: e.target.value }))} />
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

      {isDeleteModalOpen && (
        <div className="db-modal-overlay" onClick={e => e.target === e.currentTarget && setIsDeleteModalOpen(false)}>
          <div className="db-modal-delete">
            <div className="db-delete-icon-wrap"><Trash2 size={24} color="white" /></div>
            <h3 className="db-modal-title">¿Eliminar registro?</h3>
            <p className="db-modal-description">Esta acción no se puede deshacer.</p>
            <div className="db-modal-actions">
              <button className="db-btn-modal db-btn-cancel-modal" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</button>
              <button className="db-btn-modal db-btn-delete-modal" onClick={handleDelete}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Medicos;
