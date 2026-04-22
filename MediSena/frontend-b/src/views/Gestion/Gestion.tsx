import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../../components/Sidebar';
import api from '../../api/api';
import {
  ChevronRight, Plus, ChevronLeft, Home, X, Trash2, EyeOff, Eye, Save,
  AlertTriangle,
} from 'lucide-react';
import '../../styles/GestionResoluciones/GestionResoluciones.css';
import ResolucionesIcon from '../../assets/img/icons/resoluciones-tags.png';
import CampanaSvg from '../../assets/img/icons/campana.svg';

/* ─── Tipos ──────────────────────────────────────────── */
import {
  Resolucion
} from './types';

/* ─── Módulos de cada Tab ────────────────────────────── */
import {
  EMPTY_RES_FORM, ResolucionesToolbar, ResolucionesHead, ResolucionesTabla, ResolucionModal,
} from './Resoluciones';

import AbrirVigencia from './AbrirVigencia';
import Footer from '../../components/Footer';

/* ════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL – Gestión
   ════════════════════════════════════════════════════════════ */
const Gestion: React.FC = () => {

  /* ── Data ── */
  const [resoluciones, setResoluciones] = useState<Resolucion[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('Resoluciones');

  /* ── Filtros & búsqueda ── */
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [activeFilterTag, setActiveFilterTag] = useState('');

  /* ── Paginación ── */
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  /* ── Modales resolución ── */
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [isCreateResOpen, setIsCreateResOpen] = useState(false);
  const [isEditResOpen, setIsEditResOpen] = useState(false);
  const [editResTarget, setEditResTarget] = useState<Resolucion | null>(null);
  const [resForm, setResForm] = useState({ ...EMPTY_RES_FORM });
  const [resRegSearch, setResRegSearch] = useState('');
  const [resFormErrors, setResFormErrors] = useState<Record<string, string>>({});

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);


  const tabs = [
    'Resoluciones', 'Abrir vigencia',
  ];

  /* ── Fetch ── */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setErrorStatus(null);
      setResoluciones([]);
      try {
        if (activeTab === 'Resoluciones') {
          const res = await api.get('/resoluciones'); setResoluciones(res.data);
        }
      } catch (err: any) {
        setErrorStatus(err.response?.data?.message || err.message || 'Error al cargar los datos');
      } finally {
        setLoading(false); setCurrentPage(1);
      }
    };
    fetchData();
  }, [activeTab]);

  /* ── Filtrado ── */
  const filteredData = useMemo(() => {
    if (activeTab === 'Resoluciones') {
      return resoluciones.filter(item => {
        const ms = item.numero?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.descripcion?.toLowerCase().includes(searchQuery.toLowerCase());
        const mst = !statusFilter || statusFilter === 'Seleccionar estado' ? true : item.estado === statusFilter;
        return ms && mst;
      });
    }
    return [];
  }, [activeTab, resoluciones, searchQuery, statusFilter]);

  /* ─── Handlers eliminar ──────────────────────────── */
  const handleDeleteClick = (item: any) => { setItemToDelete(item); setIsDeleteModalOpen(true); };
  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      if (activeTab === 'Resoluciones') {
        await api.delete(`/resoluciones/${itemToDelete.id}`);
        setResoluciones(r => r.filter(x => x.id !== itemToDelete.id));
      }
      setIsDeleteModalOpen(false); setItemToDelete(null);
    } catch (e) {
      console.error(e);
    }
  };
  const deleteModalLabel = () => {
    return 'resolución';
  };

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const visiblePages = useMemo(() => {
    const delta = 2;
    const start = Math.max(1, currentPage - delta);
    const end = Math.min(totalPages, currentPage + delta);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [currentPage, totalPages]);

  /* ─── Handlers Parametros ────────────────────────────── */
  const openEditParametro = (p: Parametro) => {
    setEditParametroTarget(p);
    setParametroForm({ vigencia: p.vigencia, regional: p.regional, resolucion: p.resolucion, razonSocial: p.razonSocial, porcentajeNormal: p.porcentajeNormal, vobos: p.vobos.toString() });
    setIsEditParametroOpen(true);
  };
  const closeParametroModal = () => { setIsEditParametroOpen(false); setEditParametroTarget(null); };
  const handleSaveParametro = async () => {
    if (!editParametroTarget) return;
    try {
      const payload = { ...editParametroTarget, vigencia: parametroForm.vigencia, regional: parametroForm.regional, resolucion: parametroForm.resolucion, razonSocial: parametroForm.razonSocial, porcentajeNormal: parametroForm.porcentajeNormal, vobos: parseInt(parametroForm.vobos) || 0 };
      await api.put(`/parametros/${editParametroTarget.id}`, payload);
      setParametros(p => p.map(x => x.id === editParametroTarget.id ? payload : x));
      closeParametroModal();
    } catch (e) {
      console.error(e);
    }
  };

  /* ─── Handlers SubEspecialidad ───────────────────────── */
  const openEditSub = (s: SubEspecialidad) => {
    setSelectedSubTarget(s);
    setSubForm({ consecutivo: s.consecutivo.toString(), nombre: s.nombre, contratista: s.contratista, nit: s.nit, regional: s.regional, medicamentos: s.medicamentos.toString() });
    setIsEditSubOpen(true);
  };
  const closeSubModal = () => { setIsEditSubOpen(false); setSelectedSubTarget(null); };
  const handleSaveSub = async () => {
    if (!selectedSubTarget) return;
    try {
      const payload = { ...selectedSubTarget, consecutivo: parseInt(subForm.consecutivo) || 0, nombre: subForm.nombre, contratista: subForm.contratista, nit: subForm.nit, regional: subForm.regional, medicamentos: subForm.medicamentos };
      await api.put(`/subespecialidades/${selectedSubTarget.id}`, payload);
      setSubespecialidades(p => p.map(x => x.id === selectedSubTarget.id ? payload : x));
      closeSubModal();
    } catch (e) {
      console.error(e);
    }
  };



  /* ─── Handlers resolución ────────────────────────── */
  const openCreateRes = () => { setResForm({ ...EMPTY_RES_FORM }); setResRegSearch(''); setResFormErrors({}); setIsCreateResOpen(true); };
  const openEditRes = (res: Resolucion) => {
    setEditResTarget(res);
    const parts = res.vigencia?.split(' - ') ?? [];
    setResForm({ tipo: res.estado?.toUpperCase() === 'VIGENTE' ? 'VIGENTE' : 'VENCIDO', numero: res.numero, fechaResolucion: res.fecha, inicioVigencia: parts[0] ?? '', finVigencia: parts[1] ?? '', regionales: ['Regional 001', 'Regional 002', 'Regional 005'], descripcion: res.descripcion });
    setResRegSearch(''); setResFormErrors({}); setIsEditResOpen(true);
  };
  const closeResModals = () => { setIsCreateResOpen(false); setIsEditResOpen(false); setEditResTarget(null); };
  const toggleResRegional = (name: string) => {
    setResForm(p => ({ ...p, regionales: p.regionales.includes(name) ? p.regionales.filter(r => r !== name) : [...p.regionales, name] }));
  };
  const validateResForm = () => {
    const e: Record<string, string> = {};
    if (!resForm.numero.trim()) e.numero = 'Requerido';
    if (!resForm.fechaResolucion.trim()) e.fechaResolucion = 'Requerido';
    if (!resForm.inicioVigencia.trim()) e.inicioVigencia = 'Requerido';
    if (!resForm.finVigencia.trim()) e.finVigencia = 'Requerido';
    setResFormErrors(e);
    return Object.keys(e).length === 0;
  };
  const handleCreateRes = async () => {
    if (!validateResForm()) return;
    try {
      const payload = { numero: resForm.numero, fecha: resForm.fechaResolucion, descripcion: resForm.descripcion, estado: resForm.tipo === 'VIGENTE' ? 'Vigente' : 'Vencido', vigencia: `${resForm.inicioVigencia} - ${resForm.finVigencia}` };
      const created = await api.post('/resoluciones', payload);
      setResoluciones(p => [created.data, ...p]);
      closeResModals();
    } catch (e) { console.error(e); }
  };
  const handleUpdateRes = async () => {
    if (!validateResForm() || !editResTarget) return;
    try {
      const payload = { ...editResTarget, numero: resForm.numero, fecha: resForm.fechaResolucion, descripcion: resForm.descripcion, estado: resForm.tipo === 'VIGENTE' ? 'Vigente' : 'Vencido', vigencia: `${resForm.inicioVigencia} - ${resForm.finVigencia}` };
      await api.put(`/resoluciones/${editResTarget.id}`, payload);
      setResoluciones(p => p.map(r => r.id === editResTarget.id ? payload : r));
      closeResModals();
    } catch (e) { console.error(e); }
  };


  /* ─── Render toolbar ─────────────────────────────── */
  const renderToolbar = () => {
    if (activeTab === 'Abrir vigencia') return null;
    return (
      <ResolucionesToolbar
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onNew={openCreateRes}
      />
    );
  };

  /* ─── Render thead ───────────────────────────────── */
  const renderTableHead = () => {
    if (activeTab === 'Resoluciones') return <ResolucionesHead />;
    return <tr><th colSpan={8}>Mantenimiento de {activeTab}</th></tr>;
  };

  /* ─── Render tbody ───────────────────────────────── */
  const renderTableBody = () => {
    if (loading) return <tr><td colSpan={8} className="table-empty">Cargando datos...</td></tr>;
    if (errorStatus) return (
      <tr><td colSpan={8} className="table-empty">
        <p style={{ color: '#e11d48', fontWeight: 700 }}>⚠️ {errorStatus}</p>
      </td></tr>
    );
    if (currentItems.length === 0) return <tr><td colSpan={8} className="table-empty">No se encontraron resultados.</td></tr>;

    if (activeTab === 'Resoluciones') return (
      <ResolucionesTabla
        items={currentItems as Resolucion[]}
        loading={loading}
        errorStatus={errorStatus}
        onEdit={openEditRes}
        onDelete={handleDeleteClick}
      />
    );
    return <tr><td colSpan={8} className="table-empty">Sin datos.</td></tr>;
  };

  /* ════════════════════════════════════════════════ RENDER ═══ */
  return (
    <div className="main-layout">
      <Sidebar />
      <main className="main-content">
        <div className="gestion-container">

          {/* ── Header ── */}
          <header className="gestion-header">
            <div className="gestion-header-top">
              <nav className="breadcrumb">
                <div className="breadcrumb-item"><Home size={14} /></div>
                <div className="breadcrumb-sep"><ChevronRight size={13} /></div>
                <div className="breadcrumb-item">Maestras</div>
                <div className="breadcrumb-sep"><ChevronRight size={13} /></div>
                <div className="breadcrumb-item active">{activeTab}</div>
              </nav>
              <img src={CampanaSvg} alt="Notificaciones" style={{ width: 28, height: 28, cursor: 'pointer', flexShrink: 0 }} className="notification-bell" />
            </div>
            <div className="gestion-header-bottom">
              <h1 className="gestion-title">Gestión de {activeTab}</h1>
              <div className="search-wrapper">
                <div className="search-container">
                  <input type="text" placeholder="Busca el nombre de usuario o radicado" className="search-input" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
                <button className="search-btn" type="button">
                  <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="7" cy="7" r="4.2" stroke="#002c4d" strokeWidth="2" />
                    <line x1="10.2" y1="10.5" x2="15.5" y2="15.8" stroke="#002c4d" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>
          </header>

          {/* ── Tabs + Card ── */}
          <div className="tabs-card-group">
            <div className="tabs-scroll-area">
              {tabs.map(tab => (
                <div
                  key={tab}
                  className={`tab-pill ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => { setActiveTab(tab); setSearchQuery(''); setStatusFilter(''); setCurrentPage(1); }}
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

            <div className={`gestion-content-card ${activeTab === 'Resoluciones' ? 'first-tab-active' : ''}`}>

              {/* Toolbar */}
              {renderToolbar()}

              {/* Contenido */}
              {activeTab === 'Abrir vigencia' ? (
                <AbrirVigencia />
              ) : (
                <div className="table-wrapper">
                  <table className="resoluciones-table">
                    <thead>{renderTableHead()}</thead>
                    <tbody>{renderTableBody()}</tbody>
                  </table>
                </div>
              )}

              {/* Paginación */}
              {activeTab !== 'Abrir vigencia' && (
                <div className="pagination-footer">
                  <div className="items-per-page">
                    <span>Elementos por página</span>
                    <div className="items-select-wrapper">
                      <select className="items-select" value={itemsPerPage} onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                      </select>
                    </div>
                  </div>
                  <div className="page-controls">
                    <button className="page-nav-btn" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                      <ChevronLeft size={18} />
                    </button>
                    {visiblePages.map(n => (
                      <button key={n} className={`page-num-btn ${currentPage === n ? 'active' : ''}`} onClick={() => setCurrentPage(n)}>{n}</button>
                    ))}
                    <button className="page-nav-btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                      <ChevronRight size={18} />
                    </button>
                  </div>
                  <div className="page-info-total">{currentPage} - de {totalPages} páginas</div>
                </div>
              )}
              

            </div>
          </div>

          {/* ══ MODAL: Eliminar ══ */}
          {isDeleteModalOpen && (
            <div className="modal-overlay">
              <div className="modal-content-delete">
                <div className="modal-icon-container-delete" style={activeTab === 'Sub-especialidades' ? { background: '#dc2626', color: '#ffffff' } : {}}>
                  <Trash2 size={26} color={activeTab === 'Sub-especialidades' ? '#ffffff' : undefined} />
                </div>
                <h2 className="modal-title">¿Quieres eliminar est{activeTab === 'Sub-especialidades' ? 'a' : 'e'} {deleteModalLabel()}?</h2>
                <p className="modal-description">
                  Esta acción eliminará l{activeTab === 'Sub-especialidades' ? 'a' : 'e'} {deleteModalLabel()} de <strong>forma permanente</strong> y no podrás recuperarl{activeTab === 'Sub-especialidades' ? 'a' : 'o'} después.
                </p>
                <div className="modal-actions">
                  <button className="btn-modal btn-cancel" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</button>
                  <button className="btn-modal btn-delete" onClick={confirmDelete} style={activeTab === 'Sub-especialidades' ? { background: '#dc2626', color: 'white' } : {}}>
                    <Trash2 size={16} />
                    Eliminar {deleteModalLabel()}
                  </button>
                </div>
              </div>
            </div>
          )}



        </div>
      </main>
    </div>
  );
};

export default Gestion;
