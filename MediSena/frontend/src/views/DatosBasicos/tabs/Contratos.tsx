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

interface Contrato {
  id: number;
  numero: string;
  contratista: string;
  objeto: string;
  vigencia: string;
  estado: string;
}

const Contratos: React.FC = () => {
  const [data, setData] = useState<Contrato[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Contrato | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({
    numero: '',
    contratista: '',
    objeto: '',
    vigencia: ''
  });
  const [editId, setEditId] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/contratos');
      setData(response.data);
    } catch (error) {
      console.error('Error fetching contratos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await api.delete(`/contratos/${itemToDelete.id}`);
      setData(p => p.filter(d => d.id !== itemToDelete.id));
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error('Error deleting contrato:', error);
    }
  };

  const handleSave = async () => {
    try {
      if (isEdit && editId) {
        await api.put(`/contratos/${editId}`, formData);
        setData(p => p.map(d => d.id === editId ? { ...d, ...formData } : d));
      } else {
        const response = await api.post('/contratos', { ...formData, estado: 'Vigente' });
        setData(p => [response.data, ...p]);
      }
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error saving contrato:', error);
    }
  };

  const openEdit = (item: Contrato) => {
    setFormData({
      numero: item.numero,
      contratista: item.contratista,
      objeto: item.objeto,
      vigencia: item.vigencia
    });
    setEditId(item.id);
    setIsEdit(true);
    setIsFormOpen(true);
  };

  const filteredData = data.filter(d => {
    const q = searchQuery.toLowerCase();
    return d.numero.toLowerCase().includes(q) || d.contratista.toLowerCase().includes(q);
  });

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="db-content-card">
      <div className="db-toolbar">
        <p className="db-tab-description">Administra los contratos con entidades de salud.</p>
        <div className="db-toolbar-right">
          <div className="db-search-wrapper" style={{ marginRight: '10px' }}>
            <div className="db-search-container">
              <Search size={16} color="#3f607d" />
              <input
                type="text"
                placeholder="Buscar contrato..."
                className="db-search-input"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <button className="db-btn-refresh" onClick={fetchData}><RefreshCw size={14} /> Actualizar</button>
          <button className="db-btn-new" onClick={() => { setIsEdit(false); setFormData({ numero: '', contratista: '', objeto: '', vigencia: '' }); setIsFormOpen(true); }}>
            <Plus size={16} /> Nuevo Contrato
          </button>
        </div>
      </div>

      <div className="db-table-wrapper">
        <table className="db-table">
          <thead>
            <tr>
              <th>N° CONTRATO <ArrowUpDown size={13} className="db-sort-icon" /></th>
              <th>CONTRATISTA</th>
              <th>OBJETO</th>
              <th>VIGENCIA</th>
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
              paginatedData.map(c => (
                <tr key={c.id}>
                  <td className="db-col-main db-col-numero">{c.numero}</td>
                  <td>{c.contratista}</td>
                  <td className="db-col-objeto">{c.objeto}</td>
                  <td>{c.vigencia}</td>
                  <td>
                    <span className={`db-status-badge ${c.estado === 'Vigente' ? 'vigente' : 'vencido'}`}>
                      <span className={`db-status-dot ${c.estado === 'Vigente' ? 'vigente' : 'vencido'}`}></span>
                      {c.estado}
                    </span>
                  </td>
                  <td>
                    <div className="db-row-actions">
                      <button className="db-icon-btn edit" onClick={() => openEdit(c)}><Edit2 size={15} /></button>
                      <button className="db-icon-btn delete" onClick={() => { setItemToDelete(c); setIsDeleteModalOpen(true); }}><Trash2 size={15} /></button>
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
              <h2 className="db-modal-form-title">{isEdit ? 'Editar' : 'Nuevo'} Contrato</h2>
              <button className="db-modal-close" onClick={() => setIsFormOpen(false)}><X size={18} /></button>
            </div>
            <div className="db-modal-body">
              <div className="db-form-grid">
                <div className="db-form-field">
                  <label className="db-form-label">N° Contrato <HelpCircle size={13} className="db-help-icon" /></label>
                  <input className="db-form-input" placeholder="Ej: CONT-2026-001" value={formData.numero} onChange={e => setFormData(p => ({ ...p, numero: e.target.value }))} />
                </div>
                <div className="db-form-field">
                  <label className="db-form-label">Contratista <HelpCircle size={13} className="db-help-icon" /></label>
                  <input className="db-form-input" placeholder="Ej: Clínica del Norte" value={formData.contratista} onChange={e => setFormData(p => ({ ...p, contratista: e.target.value }))} />
                </div>
                <div className="db-form-field db-field-full">
                  <label className="db-form-label">Objeto del Contrato <HelpCircle size={13} className="db-help-icon" /></label>
                  <input className="db-form-input" placeholder="Ej: Prestación de servicios de salud" value={formData.objeto} onChange={e => setFormData(p => ({ ...p, objeto: e.target.value }))} />
                </div>
                <div className="db-form-field db-field-full">
                  <label className="db-form-label">Vigencia <HelpCircle size={13} className="db-help-icon" /></label>
                  <input className="db-form-input" placeholder="Ej: 01 ene 2026 - 31 dic 2026" value={formData.vigencia} onChange={e => setFormData(p => ({ ...p, vigencia: e.target.value }))} />
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

export default Contratos;
