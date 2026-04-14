import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../api/api';
import {
  ChevronRight,
  Plus,
  RefreshCw,
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

/* ─── Type & Mock Parámetros ────────────────────────────── */
export interface Parametro {
  id: number;
  vigencia: string;
  regional: string;
  resolucion: string;
  razonSocial: string;
  porcentajeNormal: string;
  vobos: number;
}



const EMPTY_PARENTESCO_FORM = {
  nombre: '',
  descripcion: '',
  ambito: ''
};

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
  const [isViewSubOpen, setIsViewSubOpen] = useState(false);
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
    'Parentescos', 'Abrir vigencia', 'Parámetros', 'Sub-especialidades'
  ];

  /* ── Fetch ── */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setErrorStatus(null);
      
      // Limpiar datos previos para evitar confusión al cambiar de tab
      setResoluciones([]);
      setUsuarios([]);
      setNiveles([]);
      setTopes([]);
      setParentescos([]);
      setParametros([]);
      setSubespecialidades([]);

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
        } else if (activeTab === 'Parámetros') {
          const res = await api.get('/parametros');
          setParametros(res.data);
        } else if (activeTab === 'Sub-especialidades') {
          const res = await api.get('/subespecialidades');
          setSubespecialidades(res.data);
        }
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setErrorStatus(err.response?.data?.message || err.message || 'Error al cargar los datos');
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
    if (activeTab === 'Parámetros') {
      return parametros.filter(p =>
        p.razonSocial.toLowerCase().includes(searchQuery.toLowerCase())
      );
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

  /* ─── Handlers eliminar ──────────────────────────────── */
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

  const filteredResRegionales = REGIONALES.filter(r => r.toLowerCase().includes(resRegSearch.toLowerCase()));

  /* ─── Handlers Nivel ─────────────────────────────────── */
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

  /* ─── Handlers usuario ───────────────────────────────── */
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

  /* ─── Handlers Sub-especialidades ─────────────────────── */
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
              <RefreshCw size={14} />
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
    if (activeTab === 'Parentescos') {
      return (
        <div className="content-toolbar">
          <p className="tab-description">Gestione los parentescos permitidos en el sistema</p>
          <button className="btn-new-resolution" onClick={() => { }}>
            <Plus size={16} />
            Nuevo Parentesco
          </button>
        </div>
      );
    }
    if (activeTab === 'Parámetros') {
      return (
        <div className="content-toolbar">
          <p className="tab-description"><span style={{ color: '#5c7a90', fontSize: '13px', fontWeight: 600 }}>Este dato se promediará con el valor del SMLV de la vigencia 2025: <strong style={{ color: '#002c4d' }}>$ 1.423.500</strong></span></p>
          <div className="usuarios-toolbar-right" style={{ gap: '12px' }}>
            <select className="stat-select" style={{ minWidth: '150px' }}>
              <option>Vigencia 2025</option>
            </select>
            <button className="btn-new-resolution" onClick={() => { }} style={{ background: '#004B85' }}>
              <RefreshCw size={14} />
              Actualizar
            </button>
          </div>
        </div>
      );
    }
    if (activeTab === 'Sub-especialidades') {
      return (
        <div className="content-toolbar">
          <p className="tab-description"><span style={{ color: '#5c7a90', fontSize: '13px', fontWeight: 500 }}>Sub-especialidades asociadas a contratistas del sistema MediSENA.</span></p>
          <div className="usuarios-toolbar-right" style={{ gap: '12px' }}>
            <select className="stat-select" style={{ minWidth: '160px' }}>
              <option>Seleccionar estado</option>
            </select>
            <button className="btn-new-resolution" style={{ background: '#004B85' }}>
              <RefreshCw size={14} />
              Actualizar
            </button>
            <button className="btn-new-resolution" onClick={() => { }} style={{ background: '#004B85' }}>
              <Plus size={16} />
              Nueva Sub-especialidad
            </button>
          </div>
        </div>
      );
    }
    if (activeTab === 'Abrir vigencia') return null;
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
    if (activeTab === 'Parámetros') return (
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
    if (activeTab === 'Sub-especialidades') return (
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
    return <tr><th colSpan={8}>Mantenimiento de {activeTab}</th></tr>;
  };

  const renderTableBody = () => {
    if (loading) return <tr><td colSpan={8} className="table-empty">Cargando datos...</td></tr>;
    
    if (errorStatus) return (
      <tr>
        <td colSpan={8} className="table-empty">
          <div className="error-message">
            <p style={{ color: '#e11d48', fontWeight: 700 }}>⚠️ {errorStatus}</p>
            <button 
              onClick={() => setActiveTab(activeTab)} 
              style={{ marginTop: '10px', background: '#1e3a52', color: 'white', border: 'none', padding: '6px 16px', borderRadius: '8px', cursor: 'pointer' }}
            >
              Reintentar
            </button>
          </div>
        </td>
      </tr>
    );

    if (currentItems.length === 0) return <tr><td colSpan={8} className="table-empty">No se encontraron resultados.</td></tr>;

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
                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.nombre)}&background=0D8ABC&color=fff&rounded=true`} alt={user.nombre} className="user-avatar" style={{ border: 'none' }} />
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

    if (activeTab === 'Parámetros') {
      return (currentItems as Parametro[]).map(p => (
        <tr key={p.id}>
          <td>
            <div className="desc-with-icon" style={{ gap: '6px' }}>
              <div 
                className="regional-tag has-remove" 
                style={{ padding: 0, background: 'none', border: 'none', color: '#94a3b8' }}
                onMouseEnter={() => setTooltip({ id: p.id, text: `Este dato corresponde al SMLV del año ${p.vigencia}` })}
                onMouseLeave={() => setTooltip(null)}
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
              <button className="icon-btn edit" onClick={() => openEditParametro(p)}><Edit2 size={15} /></button>
            </div>
          </td>
        </tr>
      ));
    }

    if (activeTab === 'Sub-especialidades') {
      return (currentItems as SubEspecialidad[]).map(s => (
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
              <button className="icon-btn edit" onClick={() => openEditSub(s)}><Edit2 size={15} /></button>
              <button className="icon-btn delete" onClick={() => handleDeleteClick(s)}><Trash2 size={15} /></button>
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
              <button className="icon-btn edit" onClick={() => openEditParentesco(p)}><Edit2 size={15} /></button>
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
              {activeTab === 'Abrir vigencia' ? (
                <div className="abr-vigencia-container">
                  <div className="vigencia-card-content">
                    {/* Alerta de atención */}
                    <div className="um-alert warning" style={{ marginBottom: 0 }}>
                      <AlertTriangle size={16} className="um-alert-icon" color="#d97706" />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <strong style={{ color: '#002c4d', fontSize: '13px' }}>Atención</strong>
                        <span style={{ fontSize: '12px', color: '#5c7a90' }}>
                          Este proceso solo puede ser ejecutado en la nueva vigencia 2027.
                        </span>
                      </div>
                    </div>

                    <div className="vigencia-sections">
                      {/* Sección: ¿Qué pasará? */}
                      <div className="vigencia-section">
                        <h2 style={{ color: '#1e3a52', fontSize: '20px', marginBottom: '16px', fontWeight: 900, letterSpacing: '-0.02em' }}>
                          ¿Qué pasará al abrir la nueva vigencia?
                        </h2>
                        <p style={{ color: '#5c7a90', fontSize: '14px', marginBottom: '12px', fontWeight: 500 }}>
                          Se copiarán automáticamente los siguientes datos de la vigencia anterior:
                        </p>
                        <ul className="vigencia-list">
                          <li>Parámetros</li>
                          <li>Resoluciones</li>
                          <li>Topes</li>
                          <li>Cargos</li>
                          <li>Cargos por funcionario</li>
                          <li>Categorías por regional</li>
                          <li>Beneficiarios (se actualizarán los suspendidos)</li>
                        </ul>
                      </div>

                      {/* Sección: Procesos que se activarán */}
                      <div className="vigencia-section">
                        <h2 style={{ color: '#1e3a52', fontSize: '20px', marginBottom: '16px', fontWeight: 900, letterSpacing: '-0.02em' }}>
                          Procesos que se activarán
                        </h2>
                        <p style={{ color: '#5c7a90', fontSize: '14px', marginBottom: '12px', fontWeight: 500 }}>
                          Después de crear la vigencia, podrás usar:
                        </p>
                        <ul className="vigencia-list">
                          <li>Órdenes de atención</li>
                          <li>Cuentas de cobro</li>
                          <li>Recibos de pago</li>
                        </ul>
                      </div>
                    </div>

                    {/* Acciones finales */}
                    <div className="vigencia-actions">
                      <button className="btn-new-resolution" style={{ background: '#002c4d', padding: '12px 24px', borderRadius: '10px' }}>
                        <Plus size={18} />
                        Abrir vigencia 2027
                      </button>
                      <p className="vigencia-footer-info">
                        Este proceso puede tardar unos minutos.
                      </p>
                    </div>
                  </div>
                </div>
              ) : activeTab === 'Parentescos' ? (
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
              <div className="modal-content-delete">
                <div 
                  className="modal-icon-container-delete"
                  style={activeTab === 'Sub-especialidades' ? { background: '#dc2626', color: '#ffffff' } : {}}
                >
                  <Trash2 size={26} color={activeTab === 'Sub-especialidades' ? '#ffffff' : undefined} />
                </div>
                <h2 className="modal-title">¿Quieres eliminar est{activeTab === 'Sub-especialidades' ? 'a' : 'e'} {deleteModalLabel()}?</h2>
                <p className="modal-description">
                  Esta acción eliminará l{activeTab === 'Sub-especialidades' ? 'a' : 'e'} {deleteModalLabel()} de <strong>forma permanente</strong> y no podrás recuperarl{activeTab === 'Sub-especialidades' ? 'a' : 'o'} después.
                </p>
                <div className="modal-actions">
                  <button className="btn-modal btn-cancel" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</button>
                  <button 
                    className="btn-modal btn-delete" 
                    onClick={confirmDelete}
                    style={activeTab === 'Sub-especialidades' ? { background: '#dc2626', color: 'white' } : {}}
                  >
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
                <div className="resolucion-modal-header">
                  <h2 className="resolucion-modal-title">{selectedTope.grupo}</h2>
                  <button className="resolucion-modal-close" onClick={() => setIsViewTopeOpen(false)}><X size={18} /></button>
                </div>
                <div className="resolucion-modal-body tope-view-body" style={{ padding: '24px 32px' }}>
                  
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
                      <div className="ti-val ti-n4">{selectedTope.nivel}</div>
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
                      <div className="ti-val">
                        <span className={`ti-badge-history ${selectedTope.estado === 'Vigente' ? 'vigente' : 'historico'}`}>
                          {selectedTope.estado}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Categorías Normales */}
                  <div className="tope-section">
                    <div className="ts-header ts-blue">Topes Máximos - Categorías Normales</div>
                    <div className="ts-row"><span>Tope máximo del grupo en categoría A Normal</span><strong>{selectedTope.valorPromedio}</strong></div>
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
                <div className="resolucion-modal-footer" style={{ borderTop: 'none', padding: '16px 32px 32px 32px', justifyContent: 'flex-end' }}>
                  <button className="rm-btn-primary" onClick={() => setIsViewTopeOpen(false)} style={{ minWidth: '140px' }}>
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

          {/* ══ MODAL: Editar Parentesco ══ */}
          {isEditParentescoOpen && editParentescoTarget && (
            <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeParentescoModal()}>
              <div className="resolucion-modal user-edit-modal">
                <div className="resolucion-modal-header">
                  <h2 className="resolucion-modal-title">Editar Parentesco</h2>
                  <button className="resolucion-modal-close" onClick={closeParentescoModal}><X size={18} /></button>
                </div>
                <div className="resolucion-modal-body user-edit-body">
                  <div className="ue-field">
                    <label className="ue-label">Nombre <HelpCircle size={13} className="rm-help" /></label>
                    <input className="ue-input" placeholder="Madre-Padre" value={parentescoForm.nombre} onChange={e => setParentescoForm(p => ({ ...p, nombre: e.target.value }))} />
                  </div>
                  <div className="ue-field">
                    <label className="ue-label">Descripción <HelpCircle size={13} className="rm-help" /></label>
                    <input className="ue-input" placeholder="Madre-Padre" value={parentescoForm.descripcion} onChange={e => setParentescoForm(p => ({ ...p, descripcion: e.target.value }))} />
                  </div>
                  <div className="ue-field">
                    <label className="ue-label">Ámbito <HelpCircle size={13} className="rm-help" /></label>
                    <input className="ue-input" placeholder="Nacional" value={parentescoForm.ambito} onChange={e => setParentescoForm(p => ({ ...p, ambito: e.target.value }))} />
                  </div>
                </div>
                <div className="resolucion-modal-footer" style={{ justifyContent: 'flex-end', borderTop: 'none' }}>
                  <div className="rm-footer-actions">
                    <button className="rm-btn-cancel" onClick={closeParentescoModal} style={{ minWidth: '100px' }}>Cancelar</button>
                    <button className="rm-btn-primary" onClick={handleSaveParentesco} style={{ minWidth: '160px' }}>
                      <Save size={15} />
                      Guardar cambios
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══ MODAL: Editar SubEspecialidad ══ */}
          {isEditSubOpen && selectedSubTarget && (
            <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeSubModal()}>
              <div className="resolucion-modal user-edit-modal">
                <div className="resolucion-modal-header">
                  <h2 className="resolucion-modal-title">Editar Sub-Especialidad</h2>
                  <button className="resolucion-modal-close" onClick={closeSubModal}><X size={18} /></button>
                </div>
                <div className="resolucion-modal-body user-edit-body">
                  <div className="ue-row">
                    <div className="ue-field">
                      <label className="ue-label">Nombre <HelpCircle size={13} className="rm-help" /></label>
                      <input className="ue-input" value={subForm.nombre} onChange={e => setSubForm(p => ({ ...p, nombre: e.target.value }))} />
                    </div>
                    <div className="ue-field">
                      <label className="ue-label">Contratista <HelpCircle size={13} className="rm-help" /></label>
                      <input className="ue-input" value={subForm.contratista} onChange={e => setSubForm(p => ({ ...p, contratista: e.target.value }))} />
                    </div>
                  </div>
                  <div className="ue-row">
                    <div className="ue-field">
                      <label className="ue-label">NIT <HelpCircle size={13} className="rm-help" /></label>
                      <input className="ue-input" value={subForm.nit} onChange={e => setSubForm(p => ({ ...p, nit: e.target.value }))} />
                    </div>
                    <div className="ue-field">
                      <label className="ue-label">Regional <HelpCircle size={13} className="rm-help" /></label>
                      <input className="ue-input" value={subForm.regional} onChange={e => setSubForm(p => ({ ...p, regional: e.target.value }))} />
                    </div>
                  </div>
                  <div className="ue-row">
                    <div className="ue-field" style={{ flex: 1 }}>
                      <label className="ue-label">Consecutivo <HelpCircle size={13} className="rm-help" /></label>
                      <input className="ue-input" type="number" value={subForm.consecutivo} onChange={e => setSubForm(p => ({ ...p, consecutivo: e.target.value }))} />
                    </div>
                    <div className="ue-field" style={{ flex: 1 }}>
                      <label className="ue-label">Medicamentos <HelpCircle size={13} className="rm-help" /></label>
                      <input className="ue-input" type="number" value={subForm.medicamentos} onChange={e => setSubForm(p => ({ ...p, medicamentos: e.target.value }))} />
                    </div>
                  </div>
                </div>
                <div className="resolucion-modal-footer" style={{ justifyContent: 'flex-end', borderTop: 'none' }}>
                  <div className="rm-footer-actions">
                    <button className="rm-btn-cancel" onClick={closeSubModal} style={{ minWidth: '100px' }}>Cancelar</button>
                    <button className="rm-btn-primary" onClick={handleSaveSub} style={{ minWidth: '160px' }}>
                      <Save size={15} />
                      Guardar cambios
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══ MODAL: Editar Parametro ══ */}
          {isEditParametroOpen && editParametroTarget && (
            <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeParametroModal()}>
              <div className="resolucion-modal user-edit-modal">
                <div className="resolucion-modal-header">
                  <h2 className="resolucion-modal-title">Editar Parámetro</h2>
                  <button className="resolucion-modal-close" onClick={closeParametroModal}><X size={18} /></button>
                </div>
                <div className="resolucion-modal-body user-edit-body">
                  <div className="ue-row">
                    <div className="ue-field">
                      <label className="ue-label">Vigencia <HelpCircle size={13} className="rm-help" /></label>
                      <input className="ue-input" value={parametroForm.vigencia} onChange={e => setParametroForm(p => ({ ...p, vigencia: e.target.value }))} />
                    </div>
                    <div className="ue-field">
                      <label className="ue-label">Regional <HelpCircle size={13} className="rm-help" /></label>
                      <input className="ue-input" value={parametroForm.regional} onChange={e => setParametroForm(p => ({ ...p, regional: e.target.value }))} />
                    </div>
                  </div>
                  <div className="ue-row">
                    <div className="ue-field">
                      <label className="ue-label">Resolución <HelpCircle size={13} className="rm-help" /></label>
                      <input className="ue-input" value={parametroForm.resolucion} onChange={e => setParametroForm(p => ({ ...p, resolucion: e.target.value }))} />
                    </div>
                    <div className="ue-field">
                      <label className="ue-label">Razón Social <HelpCircle size={13} className="rm-help" /></label>
                      <input className="ue-input" value={parametroForm.razonSocial} onChange={e => setParametroForm(p => ({ ...p, razonSocial: e.target.value }))} />
                    </div>
                  </div>
                  <div className="ue-row">
                    <div className="ue-field">
                      <label className="ue-label">% SMLV <HelpCircle size={13} className="rm-help" /></label>
                      <input className="ue-input" value={parametroForm.porcentajeNormal} onChange={e => setParametroForm(p => ({ ...p, porcentajeNormal: e.target.value }))} />
                    </div>
                    <div className="ue-field">
                      <label className="ue-label">VoBos <HelpCircle size={13} className="rm-help" /></label>
                      <input className="ue-input" type="number" value={parametroForm.vobos} onChange={e => setParametroForm(p => ({ ...p, vobos: e.target.value }))} />
                    </div>
                  </div>
                </div>
                <div className="resolucion-modal-footer" style={{ justifyContent: 'flex-end', borderTop: 'none' }}>
                  <div className="rm-footer-actions">
                    <button className="rm-btn-cancel" onClick={closeParametroModal} style={{ minWidth: '100px' }}>Cancelar</button>
                    <button className="rm-btn-primary" onClick={handleSaveParametro} style={{ minWidth: '160px' }}>
                      <Save size={15} />
                      Guardar cambios
                    </button>
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