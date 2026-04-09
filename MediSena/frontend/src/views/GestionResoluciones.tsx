import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../api/api';
import {
  ChevronRight,
  Search,
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ArrowUpDown,
  Home,
  Copy,
  FileText,
  Files,
  Bell,
  HelpCircle,
  X,
  Check,
  Paperclip,
  Filter,
  Calendar
} from 'lucide-react';
import '../styles/GestionResoluciones.css';
import ResolucionesIcon from '../assets/img/icons/resoluciones-tags.png';
import LupaBusquedaIcon from '../assets/img/icons/lupa-busqueda.png';
import CampanaSvg from '../assets/img/icons/campana.svg';

export interface Resolucion {
  id: number;
  numero: string;
  fecha: string;
  descripcion: string;
  estado: string;
  vigencia: string;
}

export interface Usuario {
  id: number;
  nombre: string;
  rol: string;
  email: string;
}

const GestionResoluciones: React.FC = () => {
  const [resoluciones, setResoluciones] = useState<Resolucion[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Resoluciones');

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);

  // Estados para el Modal de Formulario (Crear/Editar)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editFormData, setEditFormData] = useState<any>({
    tipo: 'VIGENTE',
    numero: '',
    fecha: '',
    inicioVigencia: '',
    finVigencia: '',
    descripcion: '',
    regionales: []
  });
  const [regionalSearch, setRegionalSearch] = useState('');

  // Mock de regionales
  const allRegionales = [
    { id: '001', nombre: 'Regional 001' },
    { id: '002', nombre: 'Regional 002' },
    { id: '003', nombre: 'Regional 003' },
    { id: '004', nombre: 'Regional 004' },
    { id: '005', nombre: 'Regional 005' },
    { id: '006', nombre: 'Regional 006' },
  ];

  const tabs = [
    'Resoluciones', 'Usuarios', 'Niveles', 'Topes',
    'Parentescos', 'Abrir vigencia', 'Parámetros', 'Sub-especialidades'
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === 'Resoluciones') {
          const res = await api.get('/resoluciones');
          setResoluciones(res.data);
        } else if (activeTab === 'Usuarios') {
          const res = await api.get('/usuarios');
          setUsuarios(res.data);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
        setCurrentPage(1);
      }
    };
    fetchData();
  }, [activeTab]);

  const filteredData = useMemo(() => {
    const data = activeTab === 'Resoluciones' ? resoluciones : activeTab === 'Usuarios' ? usuarios : [];
    return data.filter((item: any) => {
      const matchesSearch = activeTab === 'Resoluciones'
        ? (item.numero?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.descripcion?.toLowerCase().includes(searchQuery.toLowerCase()))
        : (item.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.email?.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === '' || statusFilter === 'Seleccionar estado'
        ? true
        : item.estado === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [activeTab, resoluciones, usuarios, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleDeleteClick = (item: any) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (activeTab === 'Resoluciones') {
      setResoluciones(resoluciones.filter(r => r.id !== itemToDelete.id));
    } else {
      setUsuarios(usuarios.filter(u => u.id !== itemToDelete.id));
    }
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const handleEditClick = (item: any) => {
    if (activeTab === 'Resoluciones') {
      setModalMode('edit');
      setEditFormData({
        ...item,
        inicioVigencia: item.vigencia?.split(' - ')[0] || '',
        finVigencia: item.vigencia?.split(' - ')[1] || '',
        regionales: ['001', '002', '005'] // Mocked selection for demo
      });
      setIsFormModalOpen(true);
    }
  };

  const toggleRegional = (id: string) => {
    setEditFormData((prev: any) => {
      const isSelected = prev.regionales.includes(id);
      return {
        ...prev,
        regionales: isSelected 
          ? prev.regionales.filter((rId: string) => rId !== id)
          : [...prev.regionales, id]
      };
    });
  };

  /* Páginas visibles: máx 5 alrededor de la actual */
  const visiblePages = useMemo(() => {
    const delta = 2;
    const start = Math.max(1, currentPage - delta);
    const end = Math.min(totalPages, currentPage + delta);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [currentPage, totalPages]);

  return (
    <div className="main-layout">
      <Sidebar />
      <main className="main-content">
        <div className="gestion-container">

          {/* ── Header ── */}
          <header className="gestion-header">
            {/* Fila 1: breadcrumb | campana */}
            <div className="gestion-header-top">
              <nav className="breadcrumb">
                <div className="breadcrumb-item"><Home size={14} /></div>
                <div className="breadcrumb-sep"><ChevronRight size={13} /></div>
                <div className="breadcrumb-item">Maestras</div>
                <div className="breadcrumb-sep"><ChevronRight size={13} /></div>
                <div className="breadcrumb-item active">{activeTab}</div>
              </nav>
              <img 
                src={CampanaSvg} 
                alt="Notificaciones" 
                style={{ width: 28, height: 28, cursor: 'pointer', flexShrink: 0 }} 
                className="notification-bell" 
              />
            </div>

            {/* Fila 2: título | búsqueda */}
            <div className="gestion-header-bottom">
              <h1 className="gestion-title">Gestión de {activeTab}</h1>
              <div className="search-wrapper">
                <div className="search-container">
                  <input
                    type="text"
                    placeholder="Busca el nombre de usuario o radicado"
                    className="search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button className="search-btn" type="button">
                  <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="7" cy="7" r="4.2" stroke="#002c4d" strokeWidth="2"/>
                    <line x1="10.2" y1="10.5" x2="15.5" y2="15.8" stroke="#002c4d" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </header>

          {/* ── Tabs + Card agrupados (sin gap entre ellos) ── */}
          <div className="tabs-card-group">
            <div className="tabs-scroll-area">
              {tabs.map(tab => (
                <div
                  key={tab}
                  className={`tab-pill ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {activeTab === tab && (
                    <div className="active-tab-icon">
                      <img src={ResolucionesIcon} alt="Icon" width={14} height={14} />
                    </div>
                  )}
                  {tab}
                </div>
              ))}
            </div>

            {/* ── Card principal ── */}
            <div className={`gestion-content-card ${activeTab === 'Resoluciones' ? 'first-tab-active' : ''}`}>

              {/* Toolbar */}
              <div className="content-toolbar">
                <div className="stat-filter-container">
                  <select
                    className="stat-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option>Seleccionar estado</option>
                    <option value="Vigente">Vigente</option>
                    <option value="Vencido">Vencido</option>
                  </select>
                </div>
                <button className="btn-new-resolution" onClick={() => { setModalMode('create'); setIsFormModalOpen(true); setEditFormData({tipo: 'VIGENTE', numero: '', fecha: '', inicioVigencia: '', finVigencia: '', descripcion: '', regionales: [] }); }}>
                  <Plus size={18} />
                  Nueva {activeTab === 'Resoluciones' ? 'Resolución' : 'Entrada'}
                </button>
              </div>

              {/* Tabla */}
              <div className="table-wrapper">
                <table className="resoluciones-table">
                  <thead>
                    {activeTab === 'Resoluciones' ? (
                      <tr>
                        <th>N° <ArrowUpDown size={13} className="sort-icon" /></th>
                        <th>FECHA <ArrowUpDown size={13} className="sort-icon" /></th>
                        <th>DESCRIPCIÓN</th>
                        <th>ESTADO</th>
                        <th>VIGENCIA</th>
                        <th></th>
                      </tr>
                    ) : activeTab === 'Usuarios' ? (
                      <tr>
                        <th>ID <ArrowUpDown size={13} className="sort-icon" /></th>
                        <th>NOMBRE <ArrowUpDown size={13} className="sort-icon" /></th>
                        <th>ROL</th>
                        <th>EMAIL</th>
                        <th></th>
                      </tr>
                    ) : (
                      <tr><th colSpan={5}>Mantenimiento de {activeTab}</th></tr>
                    )}
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="table-empty">Cargando datos...</td>
                      </tr>
                    ) : currentItems.length > 0 ? (
                      activeTab === 'Resoluciones' ? (
                        (currentItems as Resolucion[]).map(res => (
                          <tr key={res.id}>
                            <td className="col-numero">{res.numero}</td>
                            <td className="col-fecha">{res.fecha}</td>
                            <td>
                              <div className="desc-with-icon">
                                {res.descripcion}
                                <Copy size={15} className="copy-icon" />
                              </div>
                            </td>
                            <td>
                              <span className={`status-badge ${res.estado.toLowerCase()}`}>
                                <div className={`status-dot ${res.estado.toLowerCase()}`}></div>
                                {res.estado}
                              </span>
                            </td>
                            <td className="col-vigencia">{res.vigencia}</td>
                            <td>
                              <div className="row-actions">
                                <button className="icon-btn edit" onClick={() => handleEditClick(res)}><Edit2 size={16} /></button>
                                <button className="icon-btn delete" onClick={() => handleDeleteClick(res)}>
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : activeTab === 'Usuarios' ? (
                        (currentItems as Usuario[]).map(user => (
                          <tr key={user.id}>
                            <td className="col-numero">{user.id}</td>
                            <td className="col-fecha">{user.nombre}</td>
                            <td>{user.rol}</td>
                            <td>{user.email}</td>
                            <td>
                              <div className="row-actions">
                                <button className="icon-btn edit"><Edit2 size={16} /></button>
                                <button className="icon-btn delete" onClick={() => handleDeleteClick(user)}>
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={5} className="table-empty">Sin datos.</td></tr>
                      )
                    ) : (
                      <tr>
                        <td colSpan={6} className="table-empty">No se encontraron resultados.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              <div className="pagination-footer">
                <div className="items-per-page">
                  <span>Elementos por página</span>
                  <div className="items-select-wrapper">
                    <select
                      className="items-select"
                      value={itemsPerPage}
                      onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                    </select>
                  </div>
                </div>

                <div className="page-controls">
                  <button
                    className="page-nav-btn"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft size={18} />
                  </button>

                  {visiblePages.map(n => (
                    <button
                      key={n}
                      className={`page-num-btn ${currentPage === n ? 'active' : ''}`}
                      onClick={() => setCurrentPage(n)}
                    >
                      {n}
                    </button>
                  ))}

                  <button
                    className="page-nav-btn"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>

                <div className="page-info-total">
                  {currentPage} - de {totalPages} páginas
                </div>
              </div>
            </div>
          </div>

          {/* Modal eliminar */}
          {isDeleteModalOpen && (
            <div className="modal-overlay">
              <div className="modal-content-delete">
                <div className="modal-icon-container-delete">
                  <Trash2 size={26} />
                </div>
                <h2 className="modal-title">¿Quieres eliminar esta Resolución?</h2>
                <p className="modal-description">
                  Esta acción eliminará la resolución de <strong>forma permanente</strong> y no podrás recuperarla después.
                </p>
                <div className="modal-actions">
                  <button className="btn-modal btn-cancel" onClick={() => setIsDeleteModalOpen(false)}>
                    Cancelar
                  </button>
                  <button className="btn-modal btn-delete" onClick={confirmDelete}>
                    <Trash2 size={16} />
                    Eliminar Resolución
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal Crear / Editar Resolución */}
          {isFormModalOpen && (
            <div className="modal-overlay">
              <div className="form-modal-container">
                <header className="form-modal-header">
                  <h2 className="form-modal-title">
                    {modalMode === 'create' ? 'Crear resolución' : 'Editar resolución'}
                  </h2>
                  <button className="btn-close-modal" onClick={() => setIsFormModalOpen(false)}>
                    <X size={20} />
                  </button>
                </header>

                <div className="form-modal-body">
                  <div className="form-grid">
                    {/* Tipo de resolución */}
                    <div className="form-group">
                      <label>
                        Tipo de resolución <HelpCircle size={14} className="label-help" />
                      </label>
                      <div className="custom-select-wrapper">
                        <select 
                          value={editFormData.tipo} 
                          onChange={(e) => setEditFormData({...editFormData, tipo: e.target.value})}
                        >
                          <option value="VIGENTE">VIGENTE</option>
                          <option value="VENCIDA">VENCIDA</option>
                        </select>
                      </div>
                    </div>

                    {/* Nº de resolución */}
                    <div className="form-group">
                      <label>
                        Nº de resolución <HelpCircle size={14} className="label-help" />
                      </label>
                      <div className="custom-select-wrapper">
                        <select 
                          value={editFormData.numero} 
                          onChange={(e) => setEditFormData({...editFormData, numero: e.target.value})}
                        >
                          <option value="">Seleccione...</option>
                          <option value="824">824</option>
                        </select>
                      </div>
                    </div>

                    {/* Fecha de resolución */}
                    <div className="form-group">
                      <label>
                        Fecha de resolución <HelpCircle size={14} className="label-help" />
                      </label>
                      <div className="input-with-icon">
                        <input 
                          type="text" 
                          placeholder="01/01/2026"
                          value={editFormData.fecha}
                          onChange={(e) => setEditFormData({...editFormData, fecha: e.target.value})}
                        />
                        <Calendar size={18} className="input-inner-icon" />
                      </div>
                    </div>

                    {/* Inicio de vigencia */}
                    <div className="form-group">
                      <label>
                        Inicio de la vigencia <HelpCircle size={14} className="label-help" />
                      </label>
                      <div className="input-with-icon">
                        <input 
                          type="text" 
                          placeholder="01/01/2026"
                          value={editFormData.inicioVigencia}
                          onChange={(e) => setEditFormData({...editFormData, inicioVigencia: e.target.value})}
                        />
                        <Calendar size={18} className="input-inner-icon" />
                      </div>
                    </div>

                    {/* Fin de vigencia */}
                    <div className="form-group">
                      <label>
                        Fin de la vigencia <HelpCircle size={14} className="label-help" />
                      </label>
                      <div className="input-with-icon">
                        <input 
                          type="text" 
                          placeholder="31/12/2026"
                          value={editFormData.finVigencia}
                          onChange={(e) => setEditFormData({...editFormData, finVigencia: e.target.value})}
                        />
                        <Calendar size={18} className="input-inner-icon" />
                      </div>
                    </div>
                  </div>

                  {/* Regional */}
                  <div className="form-group full-width" style={{ marginTop: '20px' }}>
                    <label>
                      Regional <HelpCircle size={14} className="label-help" />
                    </label>
                    <div className="regional-box">
                      <div className="regional-search-bar">
                        <div className="regional-search-input">
                          <Search size={18} className="search-icon" />
                          <input 
                            type="text" 
                            placeholder="Busca el nombre de la regional"
                            value={regionalSearch}
                            onChange={(e) => setRegionalSearch(e.target.value)}
                          />
                        </div>
                        <button className="btn-filter-regional">
                          <Filter size={18} />
                        </button>
                      </div>

                      <div className="regional-list">
                        {allRegionales
                          .filter(r => r.nombre.toLowerCase().includes(regionalSearch.toLowerCase()))
                          .map(reg => (
                            <div 
                              key={reg.id} 
                              className={`regional-item ${editFormData.regionales.includes(reg.id) ? 'selected' : ''}`}
                              onClick={() => toggleRegional(reg.id)}
                            >
                              <div className={`custom-checkbox ${editFormData.regionales.includes(reg.id) ? 'checked' : ''}`}>
                                {editFormData.regionales.includes(reg.id) && <Check size={12} />}
                              </div>
                              <span>{reg.nombre}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>

                  {/* Descripción */}
                  <div className="form-group full-width" style={{ marginTop: '24px' }}>
                    <label>
                      Descripción de la resolución <HelpCircle size={14} className="label-help" />
                    </label>
                    <textarea 
                      placeholder="Resolución 824 - Vigencia del 2026"
                      rows={4}
                      value={editFormData.descripcion}
                      onChange={(e) => setEditFormData({...editFormData, descripcion: e.target.value})}
                    />
                  </div>
                </div>

                <footer className="form-modal-footer">
                  <button className="btn-attachment">
                    <Paperclip size={20} />
                  </button>
                  <div className="footer-actions">
                    <button className="btn-modal-action cancel" onClick={() => setIsFormModalOpen(false)}>
                      Cancelar
                    </button>
                    <button className="btn-modal-action submit">
                      {modalMode === 'create' ? 'Crear resolución' : 'Actualizar resolución'}
                    </button>
                  </div>
                </footer>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default GestionResoluciones;