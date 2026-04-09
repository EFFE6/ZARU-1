import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../api/api';
import {
  ChevronRight,
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ArrowUpDown,
  Home,
  Copy,
  X,
  HelpCircle,
  Search,
  SlidersHorizontal,
  Paperclip,
  KeyRound,
  Eye,
  EyeOff,
  Save,
  AlertTriangle,
  Info,
  Building2,
} from 'lucide-react';
import '../styles/GestionResoluciones.css';
import ResolucionesIcon from '../assets/img/icons/resoluciones-tags.png';
import CampanaSvg from '../assets/img/icons/campana.svg';

/* ─── Types ─────────────────────────────────────────────── */
export interface Resolucion {
  id: number;
  numero: string;
  fecha: string;
  descripcion: string;
  estado: string;
  vigencia: string;
}

export interface UsuarioExtended {
  id: number;
  nombre: string;
  username: string;
  rol: string;
  email: string;
  regional: string;
  ultimoAcceso: string;
  activo: boolean;
  tipoUsuario: string;
  fechaCreacion: string;
  fechaModificacion: string;
  codigoDependencia: string;
  telefono: string;
  avatarInitials: string;
}

/* ─── Regionales & Roles mock ───────────────────────────── */
const REGIONALES = [
  '63 - Dirección Regional Centro de Comercio y Servicios',
  'Regional 001',
  'Regional 002',
  'Regional 003',
  'Regional 004',
];

const ROLES = ['Administrador', 'Usuario', 'Supervisor', 'Auditor'];

/* ─── Forma vacía resolución ────────────────────────────── */
const EMPTY_RES_FORM = {
  tipo: 'VIGENTE',
  numero: '',
  fechaResolucion: '',
  inicioVigencia: '',
  finVigencia: '',
  regionales: [] as string[],
  descripcion: '',
};

/* ─── Forma vacía usuario ───────────────────────────────── */
const EMPTY_USER_FORM = {
  nombre: '',
  username: '',
  rol: '',
  regional: '',
  email: '',
  telefono: '',
};

/* ─── Avatar color helpers ──────────────────────────────── */
const AVATAR_COLORS = [
  '#4f86c6', '#6c6ea0', '#5a9e7a', '#c07850', '#9b5c8f',
  '#4a8fa8', '#7a7a9d', '#c06070',
];
function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[h];
}

function initials(name: string) {
  const parts = name.trim().split(' ');
  return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase();
}

/* ─── Mock usuarios ─────────────────────────────────────── */
const MOCK_USUARIOS: UsuarioExtended[] = [
  { id: 1, nombre: 'Paulette Goya', username: 'PGoya', rol: 'Administrador', email: 'Pgoya@example.com', regional: '63 - Dirección Regional Centro de Comercio y Servicios', ultimoAcceso: '31 dic 2025', activo: true, tipoUsuario: 'T', fechaCreacion: '01 ene 2026', fechaModificacion: '31 dic 2026', codigoDependencia: '1000', telefono: '000', avatarInitials: 'PG' },
  { id: 2, nombre: 'Paulette Goya', username: 'PGoya2', rol: 'Usuario', email: 'Pgoya@example.com', regional: '63', ultimoAcceso: '31 dic 2025', activo: false, tipoUsuario: 'U', fechaCreacion: '01 ene 2026', fechaModificacion: '31 dic 2026', codigoDependencia: '1001', telefono: '000', avatarInitials: 'PG' },
  { id: 3, nombre: 'Paulette Goya', username: 'PGoya3', rol: 'Administrador', email: 'Pgoya@example.com', regional: '63 - Dirección Regional Centro de Comercio y Servicios', ultimoAcceso: '31 dic 2025', activo: true, tipoUsuario: 'T', fechaCreacion: '01 ene 2026', fechaModificacion: '31 dic 2026', codigoDependencia: '1002', telefono: '000', avatarInitials: 'PG' },
  { id: 4, nombre: 'Paulette Goya', username: 'PGoya4', rol: 'Usuario', email: 'Pgoya@example.com', regional: '63', ultimoAcceso: '31 dic 2025', activo: false, tipoUsuario: 'U', fechaCreacion: '01 ene 2026', fechaModificacion: '31 dic 2026', codigoDependencia: '1003', telefono: '000', avatarInitials: 'PG' },
  { id: 5, nombre: 'Paulette Goya', username: 'PGoya5', rol: 'Administrador', email: 'Pgoya@example.com', regional: '63 - Dirección Regional Centro de Comercio y Servicios', ultimoAcceso: '31 dic 2025', activo: true, tipoUsuario: 'T', fechaCreacion: '01 ene 2026', fechaModificacion: '31 dic 2026', codigoDependencia: '1004', telefono: '000', avatarInitials: 'PG' },
  { id: 6, nombre: 'Paulette Goya', username: 'PGoya6', rol: 'Usuario', email: 'Pgoya@example.com', regional: '63', ultimoAcceso: '31 dic 2025', activo: false, tipoUsuario: 'U', fechaCreacion: '01 ene 2026', fechaModificacion: '31 dic 2026', codigoDependencia: '1005', telefono: '000', avatarInitials: 'PG' },
];

/* ─── Types Nivel & Tope ──────────────────────────────────── */
export interface Nivel {
  id: number;
  tipoBeneficiario: string;
  nivel: string;
  topeMaximo: string;
  descripcion: string;
  periodo: string;
  estado: string;
}

export interface Tope {
  id: number;
  codigo: number;
  grupo: string;
  nivel: string;
  vigencia: string;
  valorPromedio: string;
  resolucion: string;
  estado: string;
}

/* ─── Helpers nivel color ────────────────────────────────── */
const NIVEL_COLORS: Record<string, string> = {
  'Nivel 1': '#39A900',
  'Nivel 2': '#3b82f6',
  'Nivel 3': '#ec4899',
  'Nivel 4': '#f97316',
  'Libre': '#06b6d4',
};
function nivelColor(n: string) { return NIVEL_COLORS[n] ?? '#94a3b8'; }

/* ─── Mock Niveles ───────────────────────────────────────── */
const MOCK_NIVELES: Nivel[] = [
  { id: 1, tipoBeneficiario: 'Todos los beneficiarios', nivel: 'Nivel 1', topeMaximo: '$ 1.000.000', descripcion: 'Nivel 1 de Atención Médica', periodo: '31 dic 2026', estado: 'Vigente' },
  { id: 2, tipoBeneficiario: 'Todos los beneficiarios', nivel: 'Nivel 2', topeMaximo: '$ 1.000.000', descripcion: 'Nivel 2 de Atención Médica', periodo: '31 dic 2026', estado: 'Vigente' },
  { id: 3, tipoBeneficiario: 'Todos los beneficiarios', nivel: 'Nivel 3', topeMaximo: '$ 1.000.000', descripcion: 'Nivel 3 de Atención Médica', periodo: '31 dic 2026', estado: 'Vigente' },
  { id: 4, tipoBeneficiario: 'Todos los beneficiarios', nivel: 'Nivel 4', topeMaximo: '$ 1.000.000', descripcion: 'Nivel 4 de Atención Médica', periodo: '31 dic 2026', estado: 'Vigente' },
  { id: 5, tipoBeneficiario: 'Todos los beneficiarios', nivel: 'Libre', topeMaximo: '$ 1.000.000', descripcion: 'Sin límite de Tope - Casos espe...', periodo: '31 dic 2026', estado: 'Vigente' },
  { id: 6, tipoBeneficiario: 'Todos los beneficiarios', nivel: 'Libre', topeMaximo: '$ 1.000.000', descripcion: 'Sin límite de Tope - Casos espe...', periodo: '31 dic 2026', estado: 'Vigente' },
];

/* ─── Mock Topes ─────────────────────────────────────────── */
const MOCK_TOPES: Tope[] = [
  { id: 1, codigo: 6, grupo: 'Ortopedia Maxilar', nivel: 'Nivel 1', vigencia: '2026', valorPromedio: 'Sin tope', resolucion: 'Res. 824', estado: 'Vigente' },
  { id: 2, codigo: 7, grupo: 'Honorarios', nivel: 'Nivel 1', vigencia: '2026', valorPromedio: 'Sin tope', resolucion: 'Res. 824', estado: 'Vigente' },
  { id: 3, codigo: 6, grupo: 'Otros reconocimientos', nivel: 'Nivel 1', vigencia: '2026', valorPromedio: 'Sin tope', resolucion: 'Res. 824', estado: 'Vigente' },
  { id: 4, codigo: 7, grupo: 'Tratamiento ambula...', nivel: 'Nivel 4', vigencia: '2026', valorPromedio: '$ 5.748.720', resolucion: 'Res. 824', estado: 'Vigente' },
  { id: 5, codigo: 6, grupo: 'Hospitalización', nivel: 'Nivel 1', vigencia: '2026', valorPromedio: 'Sin tope', resolucion: 'Res. 824', estado: 'Vigente' },
];

/* ─── Forms vacíos nivel ─────────────────────────────────── */
const EMPTY_NIVEL_FORM = {
  tipoBeneficiario: 'Todos los beneficiarios',
  nivel: 'Nivel 1',
  topeMaximo: '',
  periodo: '',
  descripcion: '',
};

const TIPOS_BENEFICIARIO = ['Todos los beneficiarios', 'Beneficiario titular', 'Beneficiario dependiente'];
const NIVELES_OPTS = ['Nivel 1', 'Nivel 2', 'Nivel 3', 'Nivel 4', 'Libre'];

/* ─── Type & Mock Parentesco ────────────────────────────── */
export interface Parentesco {
  id: number;
  orden: number;
  nombre: string;
  tipo: string;
  activo: boolean;
}

const MOCK_PARENTESCOS: Parentesco[] = [
  { id: 1, orden: 1, nombre: 'Madre-Padre',     tipo: 'Nacional', activo: true },
  { id: 2, orden: 2, nombre: 'Cónyuge',         tipo: 'Nacional', activo: true },
  { id: 3, orden: 3, nombre: 'Hijo',            tipo: 'Nacional', activo: true },
  { id: 4, orden: 4, nombre: 'Hermano',         tipo: 'Nacional', activo: true },
  { id: 5, orden: 5, nombre: 'Hijos entenados', tipo: 'Nacional', activo: true },
  { id: 6, orden: 6, nombre: 'Otros',           tipo: 'Nacional', activo: true },
];

/* ═══════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
   ═══════════════════════════════════════════════════════════ */
const GestionResoluciones: React.FC = () => {
  /* ── Data ── */
  const [resoluciones, setResoluciones] = useState<Resolucion[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioExtended[]>([]);
  const [niveles, setNiveles] = useState<Nivel[]>([]);
  const [topes, setTopes] = useState<Tope[]>([]);
  const [parentescos, setParentescos] = useState<Parentesco[]>([]);
  const [loading, setLoading] = useState(true);
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

  /* ── Tooltip regional ── */
  const [tooltip, setTooltip] = useState<{ id: number; text: string } | null>(null);

  const tabs = [
    'Resoluciones', 'Usuarios', 'Niveles', 'Topes',
    'Parentescos', 'Abrir vigencia', 'Parámetros', 'Sub-especialidades'
  ];

  /* ── Fetch ── */
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
        } else if (activeTab === 'Niveles') {
          const res = await api.get('/niveles');
          setNiveles(res.data);
        } else if (activeTab === 'Topes') {
          const res = await api.get('/topes');
          setTopes(res.data);
        } else if (activeTab === 'Parentescos') {
          const res = await api.get('/parentescos');
          setParentescos(res.data);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
        setCurrentPage(1);
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
        const mst = statusFilter === '' || statusFilter === 'Seleccionar estado'
          ? true : item.estado === statusFilter;
        return ms && mst;
      });
    }
    if (activeTab === 'Usuarios') {
      return usuarios.filter(u => {
        const ms = u.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email?.toLowerCase().includes(searchQuery.toLowerCase());
        const mst = statusFilter === '' || statusFilter === 'Seleccionar estado'
          ? true : (statusFilter === 'Activo' ? u.activo : !u.activo);
        const mft = activeFilterTag === '' ? true :
          (activeFilterTag === 'Activo' ? u.activo : !u.activo);
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
      return parentescos.filter(p =>
        p.nombre.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return [];
  }, [activeTab, resoluciones, usuarios, niveles, topes, parentescos, searchQuery, statusFilter, activeFilterTag]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const currentItems = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const visiblePages = useMemo(() => {
    const delta = 2;
    const start = Math.max(1, currentPage - delta);
    const end = Math.min(totalPages, currentPage + delta);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [currentPage, totalPages]);

  /* ─── Handlers eliminar ──────────────────────────────── */
  const handleDeleteClick = (item: any) => { setItemToDelete(item); setIsDeleteModalOpen(true); };
  const confirmDelete = () => {
    if (activeTab === 'Resoluciones') setResoluciones(r => r.filter(x => x.id !== itemToDelete.id));
    else if (activeTab === 'Usuarios') setUsuarios(u => u.filter(x => x.id !== itemToDelete.id));
    else if (activeTab === 'Niveles') setNiveles(n => n.filter(x => x.id !== itemToDelete.id));
    else if (activeTab === 'Topes') setTopes(t => t.filter(x => x.id !== itemToDelete.id));
    else if (activeTab === 'Parentescos') setParentescos(p => p.filter(x => x.id !== itemToDelete.id));
    setIsDeleteModalOpen(false); setItemToDelete(null);
  };

  const deleteModalLabel = () => {
    if (activeTab === 'Niveles') return 'Nivel';
    if (activeTab === 'Topes') return 'Tope';
    if (activeTab === 'Parentescos') return 'Parentesco';
    if (activeTab === 'Usuarios') return 'usuario';
    return 'elemento';
  };

  /* ─── Handlers resolución ────────────────────────────── */
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

  const handleCreateRes = () => {
    if (!validateResForm()) return;
    setResoluciones(p => [{ id: Date.now(), numero: resForm.numero, fecha: resForm.fechaResolucion, descripcion: resForm.descripcion, estado: resForm.tipo === 'VIGENTE' ? 'Vigente' : 'Vencido', vigencia: `${resForm.inicioVigencia} - ${resForm.finVigencia}` }, ...p]);
    closeResModals();
  };

  const handleUpdateRes = () => {
    if (!validateResForm() || !editResTarget) return;
    setResoluciones(p => p.map(r => r.id === editResTarget.id ? { ...r, numero: resForm.numero, fecha: resForm.fechaResolucion, descripcion: resForm.descripcion, estado: resForm.tipo === 'VIGENTE' ? 'Vigente' : 'Vencido', vigencia: `${resForm.inicioVigencia} - ${resForm.finVigencia}` } : r));
    closeResModals();
  };

  const filteredResRegionales = REGIONALES.filter(r => r.toLowerCase().includes(resRegSearch.toLowerCase()));

  /* ─── Handlers Nivel ─────────────────────────────────── */
  const openEditNivel = (n: Nivel) => {
    setEditNivelTarget(n);
    setNivelForm({ tipoBeneficiario: n.tipoBeneficiario, nivel: n.nivel, topeMaximo: n.topeMaximo, periodo: n.periodo, descripcion: n.descripcion });
    setIsEditNivelOpen(true);
  };
  const closeNivelModal = () => { setIsEditNivelOpen(false); setEditNivelTarget(null); };
  const handleSaveNivel = () => {
    if (!editNivelTarget) return;
    setNiveles(p => p.map(n => n.id === editNivelTarget.id ? { ...n, ...nivelForm } : n));
    closeNivelModal();
  };

  /* ─── Handlers usuario ───────────────────────────────── */
  const openEditUser = (u: UsuarioExtended) => {
    setSelectedUser(u);
    setUserForm({ nombre: u.nombre, username: u.username, rol: u.rol, regional: u.regional, email: u.email, telefono: u.telefono });
    setIsEditUserOpen(true);
  };
  const openViewUser = (u: UsuarioExtended) => { setSelectedUser(u); setIsViewUserOpen(true); };
  const openResetPwd = (u: UsuarioExtended) => { setSelectedUser(u); setNewPwd(''); setConfirmPwd(''); setPwdError(''); setIsResetPwdOpen(true); };

  const closeUserModals = () => { setIsEditUserOpen(false); setIsViewUserOpen(false); setIsResetPwdOpen(false); setSelectedUser(null); };

  const handleSaveUser = () => {
    if (!selectedUser) return;
    setUsuarios(p => p.map(u => u.id === selectedUser.id ? { ...u, nombre: userForm.nombre, username: userForm.username, rol: userForm.rol, regional: userForm.regional, email: userForm.email, telefono: userForm.telefono } : u));
    closeUserModals();
  };

  const handleSavePwd = () => {
    if (!newPwd) { setPwdError('Ingresa la nueva contraseña'); return; }
    if (newPwd !== confirmPwd) { setPwdError('Las contraseñas no coinciden'); return; }
    closeUserModals();
  };

  const toggleUserActive = (id: number) => {
    setUsuarios(p => p.map(u => u.id === id ? { ...u, activo: !u.activo } : u));
  };

  /* ─── Render toolbar según tab ──────────────────────── */
  const renderToolbar = () => {
    if (activeTab === 'Usuarios') {
      return (
        <div className="content-toolbar">
          <div className="usuarios-filters">
            <select className="stat-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">Seleccionar estado</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
            <select className="stat-select" value={activeFilterTag} onChange={e => setActiveFilterTag(e.target.value)}>
              <option value="">Estado seleccionado</option>
              <option value="Activo">Estado 1</option>
            </select>
            {activeFilterTag && (
              <div className="filter-tag">
                Estado 1
                <button onClick={() => setActiveFilterTag('')}><X size={12} /></button>
              </div>
            )}
          </div>
          <div className="usuarios-toolbar-right">
            <button className="btn-actualizar">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M3 21v-5h5" /></svg>
              Actualizar
            </button>
            <button className="btn-new-resolution" onClick={() => { }}>
              <Plus size={16} />
              Nuevo Usuario
            </button>
          </div>
        </div>
      );
    }
    if (activeTab === 'Niveles') {
      return (
        <div className="content-toolbar">
          <p className="tab-description">Configure los niveles y topes máximos para beneficiarios</p>
          <button className="btn-new-resolution" onClick={() => { }}>
            <Plus size={16} />
            Nuevo Nivel
          </button>
        </div>
      );
    }
    if (activeTab === 'Topes') {
      return (
        <div className="content-toolbar">
          <p className="tab-description">Consulta topes máximo por grupos, vigencia y categoría.</p>
          <button className="btn-new-resolution" onClick={() => { }}>
            <Plus size={16} />
            Nuevo Tope
          </button>
        </div>
      );
    }
    return (
      <div className="content-toolbar">
        <div className="stat-filter-container">
          <select className="stat-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option>Seleccionar estado</option>
            <option value="Vigente">Vigente</option>
            <option value="Vencido">Vencido</option>
          </select>
        </div>
        <button className="btn-new-resolution" onClick={openCreateRes}>
          <Plus size={18} />
          Nueva Resolución
        </button>
      </div>
    );
  };

  /* ─── Render tabla ───────────────────────────────────── */
  const renderTableHead = () => {
    if (activeTab === 'Resoluciones') return (
      <tr>
        <th>N° <ArrowUpDown size={13} className="sort-icon" /></th>
        <th>FECHA <ArrowUpDown size={13} className="sort-icon" /></th>
        <th>DESCRIPCIÓN</th>
        <th>ESTADO</th>
        <th>VIGENCIA</th>
        <th></th>
      </tr>
    );
    if (activeTab === 'Usuarios') return (
      <tr>
        <th>USUARIO Y EMAIL <ArrowUpDown size={13} className="sort-icon" /></th>
        <th>ROL</th>
        <th>REGIONAL</th>
        <th>ÚLT. ACCESO</th>
        <th>ESTADO</th>
        <th></th>
      </tr>
    );
    if (activeTab === 'Niveles') return (
      <tr>
        <th>TIPO BENEFICIARIO <ArrowUpDown size={13} className="sort-icon" /></th>
        <th>NIVEL</th>
        <th>TOPE MÁXIMO <ArrowUpDown size={13} className="sort-icon" /></th>
        <th>DESCRIPCIÓN</th>
        <th>PERIODO</th>
        <th>ESTADO</th>
        <th></th>
      </tr>
    );
    if (activeTab === 'Topes') return (
      <tr>
        <th>CÓDIGO</th>
        <th>GRUPO</th>
        <th>NIVEL <ArrowUpDown size={13} className="sort-icon" /></th>
        <th>VIGENCIA <ArrowUpDown size={13} className="sort-icon" /></th>
        <th>VALOR PROMEDIO</th>
        <th>RESOLUCIÓN</th>
        <th>ESTADO</th>
        <th></th>
      </tr>
    );
    return <tr><th colSpan={8}>Mantenimiento de {activeTab}</th></tr>;
  };

  const renderTableBody = () => {
    if (loading) return <tr><td colSpan={6} className="table-empty">Cargando datos...</td></tr>;
    if (currentItems.length === 0) return <tr><td colSpan={6} className="table-empty">No se encontraron resultados.</td></tr>;

    if (activeTab === 'Resoluciones') {
      return (currentItems as Resolucion[]).map(res => (
        <tr key={res.id}>
          <td className="col-numero">{res.numero}</td>
          <td className="col-fecha">{res.fecha}</td>
          <td><div className="desc-with-icon">{res.descripcion}<Copy size={15} className="copy-icon" /></div></td>
          <td>
            <span className={`status-badge ${res.estado.toLowerCase()}`}>
              <div className={`status-dot ${res.estado.toLowerCase()}`}></div>
              {res.estado}
            </span>
          </td>
          <td className="col-vigencia">{res.vigencia}</td>
          <td>
            <div className="row-actions">
              <button className="icon-btn edit" onClick={() => openEditRes(res)}><Edit2 size={16} /></button>
              <button className="icon-btn delete" onClick={() => handleDeleteClick(res)}><Trash2 size={16} /></button>
            </div>
          </td>
        </tr>
      ));
    }

    if (activeTab === 'Usuarios') {
      return (currentItems as UsuarioExtended[]).map(user => {
        const isLongRegional = user.regional.length > 10;
        const shortRegional = isLongRegional
          ? user.regional.split(' - ')[0] + ' - ' + user.regional.split(' - ')[1]?.slice(0, 12) + '...'
          : user.regional;

        return (
          <tr key={user.id}>
            {/* Avatar + Nombre/Email */}
            <td>
              <div className="user-cell">
                <div className="user-avatar" style={{ background: avatarColor(user.nombre) }}>
                  {initials(user.nombre)}
                </div>
                <div className="user-info">
                  <span className="user-name">{user.nombre}</span>
                  <span className="user-email">{user.email}</span>
                </div>
              </div>
            </td>
            {/* Rol */}
            <td>
              <span className={`rol-badge ${user.rol === 'Administrador' ? 'admin' : 'usuario'}`}>
                {user.rol === 'Administrador'
                  ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
                  : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                }
                {user.rol}
              </span>
            </td>
            {/* Regional */}
            <td>
              <div
                className={`regional-tag ${isLongRegional ? 'has-remove' : ''}`}
                onMouseEnter={() => isLongRegional && setTooltip({ id: user.id, text: user.regional })}
                onMouseLeave={() => setTooltip(null)}
                style={{ position: 'relative' }}
              >
                <Building2 size={13} className="regional-icon" />
                <span className="regional-text">
                  {isLongRegional ? shortRegional : user.regional}
                </span>
                {isLongRegional && <button className="regional-remove" onClick={() => { }}><X size={11} /></button>}
                {tooltip?.id === user.id && (
                  <div className="regional-tooltip">{tooltip.text}</div>
                )}
              </div>
            </td>
            {/* Último acceso */}
            <td className="col-acceso">{user.ultimoAcceso}</td>
            {/* Toggle estado */}
            <td>
              <button
                className={`toggle-switch ${user.activo ? 'on' : 'off'}`}
                onClick={() => toggleUserActive(user.id)}
                aria-label={user.activo ? 'Desactivar' : 'Activar'}
              >
                <span className="toggle-thumb">
                  {user.activo ? (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#39A900" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  ) : (
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  )}
                </span>
              </button>
            </td>
            {/* Acciones */}
            <td>
              <div className="row-actions">
                <button className="icon-btn edit" title="Editar usuario" onClick={() => openEditUser(user)}><Edit2 size={15} /></button>
                <button className="icon-btn key" title="Resetear contraseña" onClick={() => openResetPwd(user)}><KeyRound size={15} /></button>
                <button className="icon-btn view" title="Ver usuario" onClick={() => openViewUser(user)}><Eye size={15} /></button>
              </div>
            </td>
          </tr>
        );
      });
    }

    if (activeTab === 'Niveles') {
      return (currentItems as Nivel[]).map(n => (
        <tr key={n.id}>
          <td className="col-tipo-benef">{n.tipoBeneficiario}</td>
          <td>
            <span className="nivel-badge" style={{ color: nivelColor(n.nivel) }}>
              <span className="nivel-dot" style={{ background: nivelColor(n.nivel) }}></span>
              {n.nivel}
            </span>
          </td>
          <td className="col-tope">{n.topeMaximo}</td>
          <td className="col-desc-nivel">{n.descripcion}</td>
          <td className="col-periodo">{n.periodo}</td>
          <td>
            <span className="status-badge vigente">
              <div className="status-dot vigente"></div>
              {n.estado}
            </span>
          </td>
          <td>
            <div className="row-actions">
              <button className="icon-btn edit" onClick={() => openEditNivel(n)}><Edit2 size={15} /></button>
              <button className="icon-btn delete" onClick={() => handleDeleteClick(n)}><Trash2 size={15} /></button>
            </div>
          </td>
        </tr>
      ));
    }

    if (activeTab === 'Topes') {
      return (currentItems as Tope[]).map(t => (
        <tr key={t.id}>
          <td className="col-codigo">{t.codigo}</td>
          <td className="col-grupo">{t.grupo}</td>
          <td>
            <span className="nivel-badge" style={{ color: nivelColor(t.nivel) }}>
              <span className="nivel-dot" style={{ background: nivelColor(t.nivel) }}></span>
              {t.nivel}
            </span>
          </td>
          <td><span className="vigencia-orange">{t.vigencia}</span></td>
          <td>{t.valorPromedio}</td>
          <td><span className="resolucion-pill">{t.resolucion}</span></td>
          <td>
            <span className="status-badge vigente">
              <div className="status-dot vigente"></div>
              {t.estado}
            </span>
          </td>
          <td>
            <div className="row-actions">
              <button className="icon-btn view" title="Ver tope" onClick={() => { setSelectedTope(t); setIsViewTopeOpen(true); }}><Eye size={15} /></button>
              <button className="icon-btn delete" onClick={() => handleDeleteClick(t)}><Trash2 size={15} /></button>
            </div>
          </td>
        </tr>
      ));
    }

    return <tr><td colSpan={8} className="table-empty">Sin datos.</td></tr>;
  };

  const renderParentescosBody = () => {
    if (loading) return <div className="table-empty">Cargando datos...</div>;
    if (currentItems.length === 0) return <div className="table-empty">No se encontraron resultados.</div>;

    return (
      <div className="parentescos-list">
        {(currentItems as Parentesco[]).map(p => (
          <div className="parentesco-card" key={p.id}>
            <div className="par-left">
              <div className="par-number">{String(p.orden).padStart(2, '0')}</div>
              <div className="par-name">{p.nombre}</div>
            </div>
            <div className="par-right">
              <div className="par-pill-nacional">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                {p.tipo}
              </div>
              <div className="par-pill-activo">
                <div className="status-dot vigente"></div>
                {p.activo ? 'Activo' : 'Inactivo'}
              </div>
              <button className="icon-btn edit"><Edit2 size={15} /></button>
              <button className="icon-btn delete" onClick={() => handleDeleteClick(p)}><Trash2 size={15} /></button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  /* ═══════════════════════════════════════════════ RENDER ═══ */
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

            <div className={`gestion-content-card ${activeTab === 'Resoluciones' ? 'first-tab-active' : activeTab === 'Usuarios' ? 'second-tab-active' : ''}`}>

              {/* Toolbar */}
              {renderToolbar()}

              {/* Contenido principal */}
              {activeTab === 'Parentescos' ? (
                <div className="parentescos-wrapper">
                  {renderParentescosBody()}
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
            </div>
          </div>

          {/* ══ MODAL: Eliminar (contextual) ══ */}
          {isDeleteModalOpen && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-icon-container"><Trash2 size={26} /></div>
                <h2 className="modal-title">¿Quieres eliminar este {deleteModalLabel()}?</h2>
                <p className="modal-description">
                  Esta acción eliminará el {deleteModalLabel()} de <strong>forma permanente</strong> y no podrás recuperarlo después.
                </p>
                <div className="modal-actions">
                  <button className="btn-modal btn-cancel" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</button>
                  <button className="btn-modal btn-delete" onClick={confirmDelete}>
                    <Trash2 size={16} />
                    Eliminar {deleteModalLabel()}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ══ MODAL: Editar Nivel ══ */}
          {isEditNivelOpen && editNivelTarget && (
            <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeNivelModal()}>
              <div className="resolucion-modal user-edit-modal">
                <div className="resolucion-modal-header">
                  <h2 className="resolucion-modal-title">Editar Nivel</h2>
                  <button className="resolucion-modal-close" onClick={closeNivelModal}><X size={18} /></button>
                </div>
                <div className="resolucion-modal-body user-edit-body">
                  {/* Fila 1: Tipo Beneficiario | Nivel */}
                  <div className="ue-row">
                    <div className="ue-field">
                      <label className="ue-label">Tipo de Beneficiario<span className="rm-req">*</span> <HelpCircle size={13} className="rm-help" /></label>
                      <select
                        className="ue-input ue-select"
                        value={nivelForm.tipoBeneficiario}
                        onChange={e => setNivelForm(p => ({ ...p, tipoBeneficiario: e.target.value }))}
                      >
                        {TIPOS_BENEFICIARIO.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="ue-field">
                      <label className="ue-label">Nivel<span className="rm-req">*</span> <HelpCircle size={13} className="rm-help" /></label>
                      <select
                        className="ue-input ue-select"
                        value={nivelForm.nivel}
                        onChange={e => setNivelForm(p => ({ ...p, nivel: e.target.value }))}
                      >
                        {NIVELES_OPTS.map(n => <option key={n}>{n}</option>)}
                      </select>
                    </div>
                  </div>
                  {/* Fila 2: Tope Máximo | Periodo */}
                  <div className="ue-row">
                    <div className="ue-field">
                      <label className="ue-label">Tope Máximo ($)<span className="rm-req">*</span> <HelpCircle size={13} className="rm-help" /></label>
                      <input
                        className="ue-input"
                        placeholder="$ 1.000.000"
                        value={nivelForm.topeMaximo}
                        onChange={e => setNivelForm(p => ({ ...p, topeMaximo: e.target.value }))}
                      />
                    </div>
                    <div className="ue-field">
                      <label className="ue-label">Periodo de Vigencia<span className="rm-req">*</span> <HelpCircle size={13} className="rm-help" /></label>
                      <input
                        className="ue-input"
                        placeholder="2024 - 2025"
                        value={nivelForm.periodo}
                        onChange={e => setNivelForm(p => ({ ...p, periodo: e.target.value }))}
                      />
                    </div>
                  </div>
                  {/* Descripción */}
                  <div className="ue-field" style={{ gridColumn: '1 / -1' }}>
                    <label className="ue-label">Descripción<span className="rm-req">*</span> <HelpCircle size={13} className="rm-help" /></label>
                    <textarea
                      className="nm-textarea"
                      placeholder="Nivel 1 de atención médica"
                      rows={4}
                      value={nivelForm.descripcion}
                      onChange={e => setNivelForm(p => ({ ...p, descripcion: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="resolucion-modal-footer" style={{ justifyContent: 'flex-end' }}>
                  <div className="rm-footer-actions">
                    <button className="rm-btn-cancel" onClick={closeNivelModal}>Cancelar</button>
                    <button className="rm-btn-primary" onClick={handleSaveNivel}>
                      <Save size={15} style={{ marginRight: 6 }} />
                      Guardar cambios
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══ MODAL: Ver Tope ══ */}
          {isViewTopeOpen && selectedTope && (
            <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setIsViewTopeOpen(false)}>
              <div className="resolucion-modal tope-view-modal">
                <div className="resolucion-modal-header" style={{ paddingBottom: '16px' }}>
                  <h2 className="resolucion-modal-title">{selectedTope.grupo}</h2>
                  <button className="resolucion-modal-close" onClick={() => setIsViewTopeOpen(false)}><X size={18} /></button>
                </div>
                <div className="resolucion-modal-body tope-view-body" style={{ padding: '0 32px 32px 32px' }}>
                  
                  {/* Alerta */}
                  <div className="tope-alert">
                    <div className="alert-icon"><AlertTriangle size={18} color="#d97706" /></div>
                    <div className="alert-content">
                      <h4>Información del Sistema Original</h4>
                      <p>Esta vista muestra los Topes de Grupos. El sistema original incluía subgrupos e ítems con configuraciones adicionales, no disponibles en esta versión.</p>
                    </div>
                  </div>

                  {/* Info general */}
                  <div className="tope-info-box">
                    <div className="ti-col">
                      <div className="ti-label">Código</div>
                      <div className="ti-val">{selectedTope.codigo}</div>
                    </div>
                    <div className="ti-col">
                      <div className="ti-label">Nombre</div>
                      <div className="ti-val">{selectedTope.grupo}</div>
                    </div>
                    <div className="ti-col">
                      <div className="ti-label">Nivel</div>
                      <div className="ti-val ti-n4">N4</div>
                    </div>
                    <div className="ti-col">
                      <div className="ti-label">Vigencia</div>
                      <div className="ti-val">{selectedTope.vigencia}</div>
                    </div>
                    <div className="ti-col">
                      <div className="ti-label">Resolución</div>
                      <div className="ti-val">{selectedTope.resolucion}</div>
                    </div>
                    <div className="ti-col">
                      <div className="ti-label">Estado</div>
                      <div className="ti-val"><span className="ti-badge-history">Histórico</span></div>
                    </div>
                  </div>

                  {/* Categorías Normales */}
                  <div className="tope-section">
                    <div className="ts-header ts-blue">Topes Máximos - Categorías Normales</div>
                    <div className="ts-row"><span>Tope máximo del grupo en categoría A Normal</span><strong>$ 0</strong></div>
                    <div className="ts-row"><span>Tope máximo del grupo en categoría B Normal</span><strong>$ 0</strong></div>
                    <div className="ts-row"><span>Tope máximo del grupo en categoría C Normal</span><strong>$ 0</strong></div>
                    <div className="ts-row"><span>Tope máximo del grupo en categoría D Normal</span><strong>$ 0</strong></div>
                  </div>

                  {/* Categorías Especiales */}
                  <div className="tope-section">
                    <div className="ts-header ts-yellow">Topes Máximos - Categorías Especiales</div>
                    <div className="ts-row"><span>Tope máximo del grupo en categoría A Especial</span><strong>$ 0</strong></div>
                    <div className="ts-row"><span>Tope máximo del grupo en categoría B Especial</span><strong>$ 0</strong></div>
                    <div className="ts-row"><span>Tope máximo del grupo en categoría C Especial</span><strong>$ 0</strong></div>
                    <div className="ts-row"><span>Tope máximo del grupo en categoría D Especial</span><strong>$ 0</strong></div>
                  </div>

                </div>
                <div className="resolucion-modal-footer" style={{ borderTop: 'none', padding: '0 32px 32px 32px', justifyContent: 'flex-end' }}>
                  <button className="rm-btn-primary" onClick={() => setIsViewTopeOpen(false)} style={{ minWidth: '140px', justifyContent: 'center' }}>
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ══ MODAL: Crear / Editar Resolución ══ */}
          {(isCreateResOpen || isEditResOpen) && (
            <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeResModals()}>
              <div className="resolucion-modal">
                <div className="resolucion-modal-header">
                  <h2 className="resolucion-modal-title">{isEditResOpen ? 'Editar resolución' : 'Crear resolución'}</h2>
                  <button className="resolucion-modal-close" onClick={closeResModals}><X size={18} /></button>
                </div>
                <div className="resolucion-modal-body">
                  <div className="rm-row rm-row-3">
                    <div className="rm-field">
                      <label className="rm-label">Tipo de resolución <HelpCircle size={13} className="rm-help" /></label>
                      <select className="rm-select" value={resForm.tipo} onChange={e => setResForm(p => ({ ...p, tipo: e.target.value }))}>
                        <option value="VIGENTE">VIGENTE</option>
                        <option value="VENCIDO">VENCIDO</option>
                      </select>
                    </div>
                    <div className="rm-field">
                      <label className="rm-label">N° de resolución <HelpCircle size={13} className="rm-help" /></label>
                      <div className={`rm-select-wrapper ${resFormErrors.numero ? 'rm-error' : ''}`}>
                        <input className="rm-input-plain" placeholder="Ej: 824" value={resForm.numero} onChange={e => setResForm(p => ({ ...p, numero: e.target.value }))} />
                        <span className="rm-select-arrow">▾</span>
                      </div>
                    </div>
                    <div className="rm-field">
                      <label className="rm-label">Fecha de resolución <HelpCircle size={13} className="rm-help" /></label>
                      <div className={`rm-date-wrapper ${resFormErrors.fechaResolucion ? 'rm-error' : ''}`}>
                        <input type="date" className="rm-date-input" value={resForm.fechaResolucion} onChange={e => setResForm(p => ({ ...p, fechaResolucion: e.target.value }))} />
                      </div>
                    </div>
                  </div>
                  <div className="rm-row rm-row-2">
                    <div className="rm-field">
                      <label className="rm-label">Inicio de la vigencia <HelpCircle size={13} className="rm-help" /></label>
                      <div className={`rm-date-wrapper ${resFormErrors.inicioVigencia ? 'rm-error' : ''}`}>
                        <input type="date" className="rm-date-input" value={resForm.inicioVigencia} onChange={e => setResForm(p => ({ ...p, inicioVigencia: e.target.value }))} />
                      </div>
                    </div>
                    <div className="rm-field">
                      <label className="rm-label">Fin de la vigencia <HelpCircle size={13} className="rm-help" /></label>
                      <div className={`rm-date-wrapper ${resFormErrors.finVigencia ? 'rm-error' : ''}`}>
                        <input type="date" className="rm-date-input" value={resForm.finVigencia} onChange={e => setResForm(p => ({ ...p, finVigencia: e.target.value }))} />
                      </div>
                    </div>
                  </div>
                  <div className="rm-field rm-field-full">
                    <label className="rm-label">Regional <HelpCircle size={13} className="rm-help" /></label>
                    <div className="rm-regional-box">
                      <div className="rm-regional-search">
                        <Search size={14} className="rm-search-icon" />
                        <input className="rm-search-input" value={resRegSearch} onChange={e => setResRegSearch(e.target.value)} />
                        <SlidersHorizontal size={14} className="rm-filter-icon" />
                      </div>
                      <div className="rm-regional-list">
                        {filteredResRegionales.map(r => {
                          const checked = resForm.regionales.includes(r);
                          return (
                            <label key={r} className={`rm-regional-item ${checked ? 'checked' : ''}`}>
                              <input type="checkbox" className="rm-checkbox" checked={checked} onChange={() => toggleResRegional(r)} />
                              <span className="rm-regional-name">{r}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="rm-field rm-field-full">
                    <label className="rm-label">Descripción de la resolución <HelpCircle size={13} className="rm-help" /></label>
                    <textarea className="rm-textarea" placeholder="Resolución 824 – Vigencia del 2026" rows={4} value={resForm.descripcion} onChange={e => setResForm(p => ({ ...p, descripcion: e.target.value }))} />
                  </div>
                </div>
                <div className="resolucion-modal-footer">
                  <button className="rm-btn-attach"><Paperclip size={16} /></button>
                  <div className="rm-footer-actions">
                    <button className="rm-btn-cancel" onClick={closeResModals}>Cancelar</button>
                    {isEditResOpen
                      ? <button className="rm-btn-primary" onClick={handleUpdateRes}>Actualizar resolución</button>
                      : <button className="rm-btn-primary" onClick={handleCreateRes}>Crear resolución</button>
                    }
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══ MODAL: Editar Usuario ══ */}
          {isEditUserOpen && selectedUser && (
            <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeUserModals()}>
              <div className="resolucion-modal user-edit-modal">
                <div className="resolucion-modal-header">
                  <h2 className="resolucion-modal-title">Editar usuario</h2>
                  <button className="resolucion-modal-close" onClick={closeUserModals}><X size={18} /></button>
                </div>
                <div className="resolucion-modal-body user-edit-body">

                  {/* Info alert */}
                  <div className="um-alert info">
                    <Info size={15} className="um-alert-icon" />
                    <div>
                      <strong>Información importante.</strong>
                      <span> La contraseña no se puede cambiar aquí, para eso utilice la opción{' '}
                        <button className="um-link" onClick={() => { closeUserModals(); openResetPwd(selectedUser); }}>Resetear contraseña.</button>
                      </span>
                    </div>
                  </div>

                  {/* Fila 1: Nombre completo | Nombre de usuario */}
                  <div className="ue-row">
                    <div className="ue-field">
                      <label className="ue-label">Nombre completo <HelpCircle size={13} className="rm-help" /></label>
                      <input
                        className="ue-input"
                        placeholder="Harold Ricardo Jimenez Ro..."
                        value={userForm.nombre}
                        onChange={e => setUserForm(p => ({ ...p, nombre: e.target.value }))}
                      />
                    </div>
                    <div className="ue-field">
                      <label className="ue-label">Nombre de usuario <HelpCircle size={13} className="rm-help" /></label>
                      <input
                        className="ue-input"
                        placeholder="Hricardojr"
                        value={userForm.username}
                        onChange={e => setUserForm(p => ({ ...p, username: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Fila 2: Rol | Regional */}
                  <div className="ue-row">
                    <div className="ue-field">
                      <label className="ue-label">Rol <HelpCircle size={13} className="rm-help" /></label>
                      <div className="ue-tag-box">
                        {userForm.rol ? (
                          <span className={`rol-badge ${userForm.rol === 'Administrador' ? 'admin' : 'usuario'}`}>
                            {userForm.rol === 'Administrador'
                              ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
                              : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                            }
                            {userForm.rol}
                            <button className="ue-tag-remove" onClick={() => setUserForm(p => ({ ...p, rol: '' }))}><X size={10} /></button>
                          </span>
                        ) : (
                          <select className="ue-inline-select" onChange={e => setUserForm(p => ({ ...p, rol: e.target.value }))} defaultValue="">
                            <option value="" disabled>Seleccionar rol</option>
                            {ROLES.map(r => <option key={r}>{r}</option>)}
                          </select>
                        )}
                      </div>
                    </div>
                    <div className="ue-field">
                      <label className="ue-label">Regional <HelpCircle size={13} className="rm-help" /></label>
                      <div className="ue-tag-box">
                        {userForm.regional ? (
                          <span className="ue-regional-tag">
                            <Building2 size={12} className="ue-regional-icon" />
                            <span className="ue-regional-text">{userForm.regional}</span>
                            <button className="ue-tag-remove" onClick={() => setUserForm(p => ({ ...p, regional: '' }))}><X size={10} /></button>
                          </span>
                        ) : (
                          <select className="ue-inline-select" onChange={e => setUserForm(p => ({ ...p, regional: e.target.value }))} defaultValue="">
                            <option value="" disabled>Seleccionar regional</option>
                            {REGIONALES.map(r => <option key={r}>{r}</option>)}
                          </select>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Fila 3: ID/Email | Teléfono */}
                  <div className="ue-row">
                    <div className="ue-field">
                      <label className="ue-label">ID/Email <HelpCircle size={13} className="rm-help" /></label>
                      <input
                        className="ue-input"
                        placeholder="jricardojr@example.com"
                        value={userForm.email}
                        onChange={e => setUserForm(p => ({ ...p, email: e.target.value }))}
                      />
                    </div>
                    <div className="ue-field">
                      <label className="ue-label">Teléfono/Extensión <HelpCircle size={13} className="rm-help" /></label>
                      <input
                        className="ue-input"
                        placeholder="0"
                        value={userForm.telefono}
                        onChange={e => setUserForm(p => ({ ...p, telefono: e.target.value }))}
                      />
                    </div>
                  </div>

                </div>
                <div className="resolucion-modal-footer" style={{ justifyContent: 'flex-end' }}>
                  <div className="rm-footer-actions">
                    <button className="rm-btn-cancel" onClick={closeUserModals}>Cancelar</button>
                    <button className="rm-btn-primary" onClick={handleSaveUser}>
                      <Save size={15} style={{ marginRight: 6 }} />
                      Guardar cambios
                    </button>
                  </div>
                </div>
              </div>
            </div>
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
                  {/* Warning alert */}
                  <div className="um-alert warning">
                    <AlertTriangle size={15} className="um-alert-icon" />
                    <div>
                      <strong>Alerta</strong>
                      <span> Vas a cambiar la contraseña del usuario <strong className="um-link-text">{selectedUser.username}</strong></span>
                    </div>
                  </div>
                  {/* Contraseña nueva */}
                  <div className="rm-field rm-field-full">
                    <div className="rm-select-wrapper" style={{ marginTop: 8 }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                      <input
                        className="rm-input-plain"
                        type={showNewPwd ? 'text' : 'password'}
                        placeholder="Nueva contraseña"
                        value={newPwd}
                        onChange={e => { setNewPwd(e.target.value); setPwdError(''); }}
                        style={{ marginLeft: 8 }}
                      />
                      <button
                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center' }}
                        onClick={() => setShowNewPwd(p => !p)}
                      >
                        {showNewPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                  {/* Confirmar contraseña */}
                  <div className="rm-field rm-field-full">
                    <div className="rm-select-wrapper">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                      <input
                        className="rm-input-plain"
                        type={showConfirmPwd ? 'text' : 'password'}
                        placeholder="Confirma la contraseña"
                        value={confirmPwd}
                        onChange={e => { setConfirmPwd(e.target.value); setPwdError(''); }}
                        style={{ marginLeft: 8 }}
                      />
                      <button
                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center' }}
                        onClick={() => setShowConfirmPwd(p => !p)}
                      >
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

                  {/* Avatar + info básica */}
                  <div className="vm-user-header">
                    <div className="vm-avatar" style={{ background: avatarColor(selectedUser.nombre) }}>
                      {initials(selectedUser.nombre)}
                    </div>
                    <div className="vm-user-basic">
                      <span className="vm-username">{selectedUser.username}</span>
                      <div className="vm-email-row">
                        <span className="vm-email">{selectedUser.email}</span>
                        <Copy size={13} className="copy-icon" style={{ cursor: 'pointer' }} />
                      </div>
                    </div>
                  </div>

                  {/* Fila 1: Rol | Estado | Tipo de usuario */}
                  <div className="vm-section">
                    <div className="vm-field">
                      <span className="vm-label">Rol</span>
                      <span className={`rol-badge ${selectedUser.rol === 'Administrador' ? 'admin' : 'usuario'}`}>
                        {selectedUser.rol === 'Administrador'
                          ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
                          : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                        }
                        {selectedUser.rol}
                      </span>
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

                  {/* Fila 2: Fechas */}
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

                  {/* Fila 3: Regional | Código dependencia | Teléfono */}
                  <div className="vm-section">
                    <div className="vm-field">
                      <span className="vm-label">Regional</span>
                      <span className="ue-regional-tag" style={{ marginTop: 6 }}>
                        <Building2 size={12} className="ue-regional-icon" />
                        <span className="ue-regional-text" style={{ maxWidth: 160 }}>{selectedUser.regional}</span>
                        <button className="ue-tag-remove"><X size={10} /></button>
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

        </div>
      </main>
    </div>
  );
};

export default GestionResoluciones;