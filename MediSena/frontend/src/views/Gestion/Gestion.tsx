import React, { useState, useEffect, useMemo } from 'react';

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
  Resolucion, UsuarioExtended, Nivel, Tope, Parentesco, Parametro, SubEspecialidad,
} from './types';

/* ─── Módulos de cada Tab ────────────────────────────── */
import {
  EMPTY_RES_FORM, ResolucionesToolbar, ResolucionesHead, ResolucionesTabla, ResolucionModal,
} from './Resoluciones';
import {
  EMPTY_USER_FORM, UsuariosToolbar, UsuariosHead, UsuariosTabla, EditUserModal,
} from './Usuarios';
import {
  EMPTY_NIVEL_FORM, NivelesToolbar, NivelesHead, NivelesTabla, EditNivelModal,
} from './Niveles';
import {
  TopesToolbar, TopesHead, TopesTabla, ViewTopeModal,
} from './Topes';
import {
  EMPTY_PARENTESCO_FORM, ParentescosToolbar, ParentescosLista, EditParentescoModal,
} from './Parentescos';
import { ParametrosToolbar, ParametrosHead, ParametrosTabla, EditParametroModal } from './Parametros';
import { SubEspecialidadesToolbar, SubEspecialidadesHead, SubEspecialidadesTabla, EditSubModal } from './SubEspecialidades';
import AbrirVigencia from './AbrirVigencia';
import Footer from '../../components/Footer';

/* ════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL – Gestión
   ════════════════════════════════════════════════════════════ */
const Gestion: React.FC = () => {

  /* ── Data ── */
  const [resoluciones, setResoluciones] = useState<Resolucion[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioExtended[]>([]);
  const [niveles, setNiveles] = useState<Nivel[]>([]);
  const [topes, setTopes] = useState<Tope[]>([]);
  const [parentescos, setParentescos] = useState<Parentesco[]>([]);
  const [parametros, setParametros] = useState<Parametro[]>([]);
  const [subespecialidades, setSubespecialidades] = useState<SubEspecialidad[]>([]);
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

  /* ── Modales usuario ── */
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [isViewUserOpen, setIsViewUserOpen] = useState(false);
  const [isResetPwdOpen, setIsResetPwdOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UsuarioExtended | null>(null);
  const [userForm, setUserForm] = useState({ ...EMPTY_USER_FORM });
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdError, setPwdError] = useState('');

  /* ── Modales nivel ── */
  const [isEditNivelOpen, setIsEditNivelOpen] = useState(false);
  const [editNivelTarget, setEditNivelTarget] = useState<Nivel | null>(null);
  const [nivelForm, setNivelForm] = useState({ ...EMPTY_NIVEL_FORM });

  /* ── Modal Ver Tope ── */
  const [isViewTopeOpen, setIsViewTopeOpen] = useState(false);
  const [selectedTope, setSelectedTope] = useState<Tope | null>(null);

  /* ── Modal Parentesco ── */
  const [isEditParentescoOpen, setIsEditParentescoOpen] = useState(false);
  const [editParentescoTarget, setEditParentescoTarget] = useState<Parentesco | null>(null);
  const [parentescoForm, setParentescoForm] = useState({ ...EMPTY_PARENTESCO_FORM });

  /* ── Modal SubEspecialidad ── */
  const [isEditSubOpen, setIsEditSubOpen] = useState(false);
  const [selectedSubTarget, setSelectedSubTarget] = useState<SubEspecialidad | null>(null);
  const [subForm, setSubForm] = useState({ consecutivo: '', nombre: '', contratista: '', nit: '', regional: '', medicamentos: '' });

  /* ── Modal Parametro ── */
  const [isEditParametroOpen, setIsEditParametroOpen] = useState(false);
  const [editParametroTarget, setEditParametroTarget] = useState<Parametro | null>(null);
  const [parametroForm, setParametroForm] = useState({ vigencia: '', regional: '', resolucion: '', razonSocial: '', porcentajeNormal: '', vobos: '' });

  /* ── Tooltip regional ── */
  const [tooltip, setTooltip] = useState<{ id: number; text: string } | null>(null);

  const tabs = [
    'Resoluciones', 'Usuarios', 'Niveles', 'Topes',
    'Parentescos', 'Abrir vigencia', 'Parámetros', 'Sub-especialidades',
  ];

  /* ── Fetch ── */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setErrorStatus(null);
      setResoluciones([]); setUsuarios([]); setNiveles([]);
      setTopes([]); setParentescos([]); setParametros([]); setSubespecialidades([]);
      try {
        if (activeTab === 'Resoluciones') {
          const res = await api.get('/resoluciones'); setResoluciones(res.data);
        } else if (activeTab === 'Usuarios') {
          const res = await api.get('/usuarios'); setUsuarios(res.data);
        } else if (activeTab === 'Niveles') {
          const res = await api.get('/niveles'); setNiveles(res.data);
        } else if (activeTab === 'Topes') {
          const res = await api.get('/topes'); setTopes(res.data);
        } else if (activeTab === 'Parentescos') {
          const res = await api.get('/parentescos'); setParentescos(res.data);
        } else if (activeTab === 'Parámetros') {
          const res = await api.get('/parametros'); setParametros(res.data);
        } else if (activeTab === 'Sub-especialidades') {
          const res = await api.get('/subespecialidades'); setSubespecialidades(res.data);
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
    if (activeTab === 'Usuarios') {
      return usuarios.filter(u => {
        const ms = u.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email?.toLowerCase().includes(searchQuery.toLowerCase());
        const mst = !statusFilter || statusFilter === 'Seleccionar estado' ? true : (statusFilter === 'Activo' ? u.activo : !u.activo);
        const mft = activeFilterTag === '' ? true : (activeFilterTag === 'Activo' ? u.activo : !u.activo);
        return ms && mst && mft;
      });
    }
    if (activeTab === 'Niveles') {
      return niveles.filter(n =>
        n.tipoBeneficiario.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.nivel.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.descripcion.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (activeTab === 'Topes') {
      return topes.filter(t =>
        t.grupo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.nivel.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (activeTab === 'Parentescos') {
      return parentescos.filter(p => p.nombre.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (activeTab === 'Parámetros') {
      return parametros.filter(p => p.razonSocial.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (activeTab === 'Sub-especialidades') {
      return subespecialidades.filter(s =>
        s.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.contratista.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return [];
  }, [activeTab, resoluciones, usuarios, niveles, topes, parentescos, parametros, subespecialidades, searchQuery, statusFilter, activeFilterTag]);

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


  /* ─── Handlers eliminar ──────────────────────────── */
  const handleDeleteClick = (item: any) => { setItemToDelete(item); setIsDeleteModalOpen(true); };
  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      let endpoint = '';
      if (activeTab === 'Resoluciones') endpoint = 'resoluciones';
      else if (activeTab === 'Usuarios') endpoint = 'usuarios';
      else if (activeTab === 'Niveles') endpoint = 'niveles';
      else if (activeTab === 'Topes') endpoint = 'topes';
      else if (activeTab === 'Parentescos') endpoint = 'parentescos';
      else if (activeTab === 'Sub-especialidades') endpoint = 'subespecialidades';
      else if (activeTab === 'Parámetros') endpoint = 'parametros';
      
      if (endpoint) {
        await api.delete(`/${endpoint}/${itemToDelete.id}`);
        if (activeTab === 'Resoluciones') setResoluciones(r => r.filter(x => x.id !== itemToDelete.id));
        else if (activeTab === 'Usuarios') setUsuarios(u => u.filter(x => x.id !== itemToDelete.id));
        else if (activeTab === 'Niveles') setNiveles(n => n.filter(x => x.id !== itemToDelete.id));
        else if (activeTab === 'Topes') setTopes(t => t.filter(x => x.id !== itemToDelete.id));
        else if (activeTab === 'Parentescos') setParentescos(p => p.filter(x => x.id !== itemToDelete.id));
        else if (activeTab === 'Sub-especialidades') setSubespecialidades(s => s.filter(x => x.id !== itemToDelete.id));
        else if (activeTab === 'Parámetros') setParametros(p => p.filter(x => x.id !== itemToDelete.id));
      }
      setIsDeleteModalOpen(false); setItemToDelete(null);
    } catch (e) {
      console.error(e);
    }
  };
  const deleteModalLabel = () => {
    if (activeTab === 'Niveles') return 'Nivel';
    if (activeTab === 'Topes') return 'Tope';
    if (activeTab === 'Parentescos') return 'Parentesco';
    if (activeTab === 'Usuarios') return 'usuario';
    if (activeTab === 'Sub-especialidades') return 'Sub-especialidad';
    return 'elemento';
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

  /* ─── Handlers nivel ─────────────────────────────── */
  const openEditNivel = (n: Nivel) => {
    setEditNivelTarget(n);
    setNivelForm({ tipoBeneficiario: n.tipoBeneficiario, nivel: n.nivel, topeMaximo: n.topeMaximo, periodo: n.periodo, descripcion: n.descripcion });
    setIsEditNivelOpen(true);
  };
  const closeNivelModal = () => { setIsEditNivelOpen(false); setEditNivelTarget(null); };
  const handleSaveNivel = async () => {
    if (!editNivelTarget) return;
    try {
      const payload = { ...editNivelTarget, ...nivelForm };
      await api.put(`/niveles/${editNivelTarget.id}`, payload);
      setNiveles(p => p.map(n => n.id === editNivelTarget.id ? payload : n));
      closeNivelModal();
    } catch (e) { console.error(e); }
  };

  /* ─── Handlers usuario ───────────────────────────── */
  const openEditUser = (u: UsuarioExtended) => {
    setSelectedUser(u);
    setUserForm({ nombre: u.nombre, username: u.username, rol: u.rol, regional: u.regional, email: u.email, telefono: u.telefono });
    setIsEditUserOpen(true);
  };
  const openViewUser = (u: UsuarioExtended) => { setSelectedUser(u); setIsViewUserOpen(true); };
  const openResetPwd = (u: UsuarioExtended) => { setSelectedUser(u); setNewPwd(''); setConfirmPwd(''); setPwdError(''); setIsResetPwdOpen(true); };
  const closeUserModals = () => { setIsEditUserOpen(false); setIsViewUserOpen(false); setIsResetPwdOpen(false); setSelectedUser(null); };
  const handleSaveUser = async () => {
    if (!selectedUser) return;
    try {
      const payload = { ...selectedUser, ...userForm };
      await api.put(`/usuarios/${selectedUser.id}`, payload);
      setUsuarios(p => p.map(u => u.id === selectedUser.id ? payload : u));
      closeUserModals();
    } catch (e) { console.error(e); }
  };
  const handleSavePwd = () => {
    if (!newPwd) { setPwdError('Ingresa la nueva contraseña'); return; }
    if (newPwd !== confirmPwd) { setPwdError('Las contraseñas no coinciden'); return; }
    closeUserModals();
  };
  const toggleUserActive = (id: number) => {
    setUsuarios(p => p.map(u => u.id === id ? { ...u, activo: !u.activo } : u));
  };

  /* ─── Handlers parentesco ────────────────────────── */
  const openEditParentesco = (p: Parentesco) => {
    setEditParentescoTarget(p);
    setParentescoForm({ nombre: p.nombre, descripcion: p.nombre, ambito: p.tipo });
    setIsEditParentescoOpen(true);
  };
  const closeParentescoModal = () => { setIsEditParentescoOpen(false); setEditParentescoTarget(null); };
  const handleSaveParentesco = async () => {
    if (!editParentescoTarget) return;
    try {
      const payload = { ...editParentescoTarget, nombre: parentescoForm.nombre, tipo: parentescoForm.ambito };
      await api.put(`/parentescos/${editParentescoTarget.id}`, payload);
      setParentescos(p => p.map(x => x.id === editParentescoTarget.id ? payload : x));
      closeParentescoModal();
    } catch (e) { console.error(e); }
  };

  /* ─── Render toolbar ─────────────────────────────── */
  const renderToolbar = () => {
    if (activeTab === 'Usuarios') return (
      <UsuariosToolbar
        statusFilter={statusFilter}
        activeFilterTag={activeFilterTag}
        onStatusChange={setStatusFilter}
        onTagChange={setActiveFilterTag}
      />
    );
    if (activeTab === 'Niveles') return <NivelesToolbar onNew={() => { }} />;
    if (activeTab === 'Topes') return <TopesToolbar onNew={() => { }} />;
    if (activeTab === 'Parentescos') return <ParentescosToolbar onNew={() => { }} />;
    if (activeTab === 'Parámetros') return <ParametrosToolbar />;
    if (activeTab === 'Sub-especialidades') return <SubEspecialidadesToolbar onNew={() => { }} />;
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
    if (activeTab === 'Usuarios') return <UsuariosHead />;
    if (activeTab === 'Niveles') return <NivelesHead />;
    if (activeTab === 'Topes') return <TopesHead />;
    if (activeTab === 'Parámetros') return <ParametrosHead />;
    if (activeTab === 'Sub-especialidades') return <SubEspecialidadesHead />;
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
    if (activeTab === 'Usuarios') return (
      <UsuariosTabla
        items={currentItems as UsuarioExtended[]}
        loading={loading}
        tooltip={tooltip}
        onTooltip={setTooltip}
        onToggleActive={toggleUserActive}
        onEdit={openEditUser}
        onResetPwd={openResetPwd}
        onView={openViewUser}
      />
    );
    if (activeTab === 'Niveles') return (
      <NivelesTabla
        items={currentItems as Nivel[]}
        loading={loading}
        onEdit={openEditNivel}
        onDelete={handleDeleteClick}
      />
    );
    if (activeTab === 'Topes') return (
      <TopesTabla
        items={currentItems as Tope[]}
        loading={loading}
        onView={t => { setSelectedTope(t); setIsViewTopeOpen(true); }}
        onDelete={handleDeleteClick}
      />
    );
    if (activeTab === 'Parámetros') return (
      <ParametrosTabla
        items={currentItems as Parametro[]}
        loading={loading}
        tooltip={tooltip}
        onTooltip={setTooltip}
        onEdit={openEditParametro}
      />
    );
    if (activeTab === 'Sub-especialidades') return (
      <SubEspecialidadesTabla
        items={currentItems as SubEspecialidad[]}
        loading={loading}
        onView={openEditSub}
        onDelete={handleDeleteClick}
      />
    );
    return <tr><td colSpan={8} className="table-empty">Sin datos.</td></tr>;
  };

  /* ════════════════════════════════════════════════ RENDER ═══ */
  return (
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

            <div className={`gestion-content-card ${activeTab === 'Resoluciones' ? 'first-tab-active' : activeTab === 'Usuarios' ? 'second-tab-active' : ''}`}>

              {/* Toolbar */}
              {renderToolbar()}

              {/* Contenido */}
              {activeTab === 'Abrir vigencia' ? (
                <AbrirVigencia />
              ) : activeTab === 'Parentescos' ? (
                <div className="parentescos-wrapper">
                  <ParentescosLista
                    items={currentItems as Parentesco[]}
                    loading={loading}
                    onEdit={openEditParentesco}
                    onDelete={handleDeleteClick}
                  />
                </div>
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
              
              {/* Footer para Niveles */}
              {activeTab === 'Niveles' && <Footer />}
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

          {/* ══ MODAL: Editar Nivel ══ */}
          {isEditNivelOpen && editNivelTarget && (
            <EditNivelModal
              form={nivelForm}
              onFormChange={(field, value) => setNivelForm(p => ({ ...p, [field]: value }))}
              onClose={closeNivelModal}
              onSave={handleSaveNivel}
            />
          )}

          {/* ══ MODAL: Ver Tope ══ */}
          {isViewTopeOpen && selectedTope && (
            <ViewTopeModal tope={selectedTope} onClose={() => setIsViewTopeOpen(false)} />
          )}

          {/* ══ MODAL: Crear / Editar Resolución ══ */}
          {(isCreateResOpen || isEditResOpen) && (
            <ResolucionModal
              isEdit={isEditResOpen}
              form={resForm}
              formErrors={resFormErrors}
              regSearch={resRegSearch}
              onRegSearch={setResRegSearch}
              onToggleRegional={toggleResRegional}
              onFormChange={(field, value) => setResForm(p => ({ ...p, [field]: value }))}
              onClose={closeResModals}
              onCreate={handleCreateRes}
              onUpdate={handleUpdateRes}
            />
          )}

          {/* ══ MODAL: Editar Usuario ══ */}
          {isEditUserOpen && selectedUser && (
            <EditUserModal
              user={selectedUser}
              form={userForm}
              onFormChange={(field, value) => setUserForm(p => ({ ...p, [field]: value }))}
              onClose={closeUserModals}
              onSave={handleSaveUser}
              onGoResetPwd={() => { closeUserModals(); openResetPwd(selectedUser); }}
            />
          )}

          {/* ══ MODAL: Resetear Contraseña ══ */}
          {isResetPwdOpen && selectedUser && (
            <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeUserModals()}>
              <div className="resolucion-modal user-modal pwd-modal">
                <div className="resolucion-modal-header">
                  <h2 className="resolucion-modal-title">Resetear contraseña</h2>
                  <button className="resolucion-modal-close" onClick={closeUserModals}><X size={18} /></button>
                </div>
                <div className="resolucion-modal-body">
                  <div className="um-alert warning">
                    <AlertTriangle size={15} className="um-alert-icon" />
                    <div>
                      <strong>Alerta</strong>
                      <span> Vas a cambiar la contraseña del usuario <strong className="um-link-text">{selectedUser.username}</strong></span>
                    </div>
                  </div>
                  <div className="rm-field rm-field-full">
                    <div className="rm-select-wrapper" style={{ marginTop: 8 }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                      <input className="rm-input-plain" type={showNewPwd ? 'text' : 'password'} placeholder="Nueva contraseña" value={newPwd} onChange={e => { setNewPwd(e.target.value); setPwdError(''); }} style={{ marginLeft: 8 }} />
                      <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center' }} onClick={() => setShowNewPwd(p => !p)}>
                        {showNewPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                  <div className="rm-field rm-field-full">
                    <div className="rm-select-wrapper">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                      <input className="rm-input-plain" type={showConfirmPwd ? 'text' : 'password'} placeholder="Confirma la contraseña" value={confirmPwd} onChange={e => { setConfirmPwd(e.target.value); setPwdError(''); }} style={{ marginLeft: 8 }} />
                      <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center' }} onClick={() => setShowConfirmPwd(p => !p)}>
                        {showConfirmPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                  {pwdError && <p className="um-error-msg">{pwdError}</p>}
                </div>
                <div className="resolucion-modal-footer" style={{ justifyContent: 'flex-end' }}>
                  <div className="rm-footer-actions">
                    <button className="rm-btn-cancel" onClick={closeUserModals}>Cancelar</button>
                    <button className="rm-btn-primary" onClick={handleSavePwd}>
                      <Save size={15} style={{ marginRight: 6 }} />
                      Guardar contraseña
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══ MODAL: Ver Usuario ══ */}
          {isViewUserOpen && selectedUser && (
            <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeUserModals()}>
              <div className="resolucion-modal user-view-modal">
                <div className="resolucion-modal-header">
                  <h2 className="resolucion-modal-title">{selectedUser.nombre}</h2>
                  <button className="resolucion-modal-close" onClick={closeUserModals}><X size={18} /></button>
                </div>
                <div className="resolucion-modal-body vm-body">
                  <div className="vm-user-header">
                    <div className="vm-avatar" style={{ background: '#4f86c6' }}>
                      {(selectedUser.nombre.trim().split(' ')[0][0] + (selectedUser.nombre.trim().split(' ')[1]?.[0] ?? '')).toUpperCase()}
                    </div>
                    <div className="vm-user-basic">
                      <span className="vm-username">{selectedUser.username}</span>
                      <div className="vm-email-row">
                        <span className="vm-email">{selectedUser.email}</span>
                      </div>
                    </div>
                  </div>
                  <div className="vm-section">
                    <div className="vm-field">
                      <span className="vm-label">Rol</span>
                      <span className={`rol-badge ${selectedUser.rol === 'Administrador' ? 'admin' : 'usuario'}`}>{selectedUser.rol}</span>
                    </div>
                    <div className="vm-field">
                      <span className="vm-label">Estado</span>
                      <span className={`status-badge ${selectedUser.activo ? 'vigente' : 'vencido'}`} style={{ width: 'fit-content' }}>
                        <div className={`status-dot ${selectedUser.activo ? 'vigente' : 'vencido'}`}></div>
                        {selectedUser.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                    <div className="vm-field">
                      <span className="vm-label">Tipo de usuario</span>
                      <span className="vm-tipo-badge">{selectedUser.tipoUsuario}</span>
                    </div>
                  </div>
                  <div className="vm-divider" />
                  <div className="vm-section">
                    <div className="vm-field">
                      <span className="vm-label">Fecha de creación</span>
                      <span className="vm-value">{selectedUser.fechaCreacion}</span>
                    </div>
                    <div className="vm-field">
                      <span className="vm-label">Fecha de modificación</span>
                      <span className="vm-value">{selectedUser.fechaModificacion}</span>
                    </div>
                    <div className="vm-field">
                      <span className="vm-label">Último acceso</span>
                      <span className="vm-value">{selectedUser.ultimoAcceso}</span>
                    </div>
                  </div>
                  <div className="vm-divider" />
                  <div className="vm-section">
                    <div className="vm-field">
                      <span className="vm-label">Regional</span>
                      <span className="ue-regional-tag" style={{ marginTop: 6 }}>
                        <span className="ue-regional-text" style={{ maxWidth: 160 }}>{selectedUser.regional}</span>
                      </span>
                    </div>
                    <div className="vm-field">
                      <span className="vm-label">Código dependencia</span>
                      <span className="vm-value">{selectedUser.codigoDependencia}</span>
                    </div>
                    <div className="vm-field">
                      <span className="vm-label">Teléfono/Extensión</span>
                      <span className="vm-value">{selectedUser.telefono}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══ MODAL: Editar Parentesco ══ */}
          {isEditParentescoOpen && editParentescoTarget && (
            <EditParentescoModal
              form={parentescoForm}
              onFormChange={(field, value) => setParentescoForm(p => ({ ...p, [field]: value }))}
              onClose={closeParentescoModal}
              onSave={handleSaveParentesco}
            />
          )}

          {/* ══ MODAL: Editar Sub-especialidad ══ */}
          {isEditSubOpen && selectedSubTarget && (
            <EditSubModal
              form={subForm}
              onFormChange={(f, v) => setSubForm(p => ({ ...p, [f]: v }))}
              onClose={closeSubModal}
              onSave={handleSaveSub}
            />
          )}

          {/* ══ MODAL: Editar Parametro ══ */}
          {isEditParametroOpen && editParametroTarget && (
            <EditParametroModal
              form={parametroForm}
              onFormChange={(f, v) => setParametroForm(p => ({ ...p, [f]: v }))}
              onClose={closeParametroModal}
              onSave={handleSaveParametro}
            />
          )}

    </div>
  );
};

export default Gestion;
