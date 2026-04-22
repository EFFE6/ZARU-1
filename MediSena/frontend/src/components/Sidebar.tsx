import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  DashboardIcon,
  MaestrasIcon,
  DatosBasicosIcon,
  MovimientosIcon,
  ExcedentesIcon,
  ConsultasIcon,
  ReportesIcon,
  ReportesNacionalesIcon
} from './SidebarIcons';
import '../styles/Sidebar/Sidebar.css';

/* ── Assets logos ── */
import logoExpanded from '../assets/img/Sidebar/Sidebar.svg';
import logoCollapsed from '../assets/img/Sidebar/Sidebar-colapsado.svg';

/* ── Assets perfil ── */
import iconoFace from '../assets/img/perfil/icono-face.svg';
import botonSalir from '../assets/img/perfil/boton-salir.svg';

/* ── Tipos ── */
interface SubItem {
  id: string;
  label: string;
  path: string;
}

interface NavItem {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path?: string;
  children?: SubItem[];
}

const Sidebar = () => {
  const [activeItem, setActiveItem] = useState('Dashboard');
  const [activeSubItem, setActiveSubItem] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();
  const location = useLocation();

  const navItems: NavItem[] = [
    { id: 'Dashboard', icon: DashboardIcon, label: 'Dashboard', path: '/' },
    { id: 'Gestion', icon: MaestrasIcon, label: 'Gestión', path: '/gestion' },
    { id: 'DatosBasicos', icon: DatosBasicosIcon, label: 'Datos Básicos', path: '/datos-basicos' },
    { id: 'Movimientos', icon: MovimientosIcon, label: 'Movimientos', path: '/movimientos' },
    { id: 'Excedentes', icon: ExcedentesIcon, label: 'Excedentes', path: '/excedentes' },
    { id: 'Consultas', icon: ConsultasIcon, label: 'Consultas', path: '/consultas' },
    { id: 'Reportes', icon: ReportesIcon, label: 'Reportes', path: '/reportes' },
    { id: 'ReportesNacionales', icon: ReportesNacionalesIcon, label: 'Reportes nacionales', path: '/reportes-nacionales' },
  ];

  /* Detectar ruta activa */
  useEffect(() => {
    const path = location.pathname;

    // 1. Intentar match exacto
    for (const item of navItems) {
      if (item.children) {
        const sub = item.children.find(c => c.path === path);
        if (sub) {
          setActiveItem(item.id);
          setActiveSubItem(sub.id);
          setOpenMenus(prev => prev[item.id] ? prev : { ...prev, [item.id]: true });
          return;
        }
      }
      if (item.path === path) {
        setActiveItem(item.id);
        setActiveSubItem('');
        return;
      }
    }

    // 2. Intentar match parcial (si la ruta contiene subrutas no definidas en el menú)
    for (const item of navItems) {
      if (item.children) {
        const sub = item.children.find(c => path.startsWith(c.path));
        if (sub) {
          setActiveItem(item.id);
          setActiveSubItem(sub.id);
          setOpenMenus(prev => prev[item.id] ? prev : { ...prev, [item.id]: true });
          return;
        }
      }
      if (item.path && item.path !== '/' && path.startsWith(item.path)) {
        setActiveItem(item.id);
        setActiveSubItem('');
        return;
      }
    }

    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const toggleMenu = (id: string) => {
    setOpenMenus(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleNavClick = (item: NavItem) => {
    if (item.children && item.children.length > 0) {
      toggleMenu(item.id);
      setActiveItem(item.id);
    } else if (item.path) {
      setActiveItem(item.id);
      setActiveSubItem('');
      navigate(item.path);
    }
  };

  const handleSubClick = (parentId: string, sub: SubItem) => {
    setActiveItem(parentId);
    setActiveSubItem(sub.id);
    navigate(sub.path);
  };

  return (
    <>
      <button className="mobile-menu-toggle" onClick={() => setIsMobileMenuOpen(true)}>
        <Menu size={22} />
      </button>

      <div className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
        <button className="mobile-menu-close" onClick={() => setIsMobileMenuOpen(false)}>
          <X size={22} />
        </button>

        {/* Botón colapso */}
        <button
          className="desktop-collapse-toggle"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        {/* Logo */}
        <div className="sidebar-logo">
          {isCollapsed
            ? <img src={logoCollapsed} alt="MediSENA" className="sidebar-logo-collapsed" />
            : <img src={logoExpanded} alt="MediSENA" className="sidebar-logo-expanded" />
          }
        </div>

        {/* Navegación */}
        <nav className="nav-container">
          <ul className="nav-list">
            {navItems.map((item) => {
              const hasChildren = item.children && item.children.length > 0;
              const isOpen = openMenus[item.id];
              const isActive = activeItem === item.id;

              return (
                <li key={item.id} className="nav-item-group">
                  <div
                    className={`nav-item ${isActive && !activeSubItem ? 'active' : ''} ${isActive && hasChildren ? 'parent-active' : ''}`}
                    onClick={() => handleNavClick(item)}
                  >
                    <item.icon className="nav-item-icon" />
                    {!isCollapsed && (
                      <>
                        <span className="nav-item-text">{item.label}</span>
                        {hasChildren && (
                          <span className="nav-chevron">
                            {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  {/* Subitems */}
                  {hasChildren && isOpen && !isCollapsed && (
                    <ul className="nav-sub-list">
                      {item.children!.map(sub => (
                        <li
                          key={sub.id}
                          className={`nav-sub-item ${activeSubItem === sub.id ? 'active' : ''}`}
                          onClick={() => handleSubClick(item.id, sub)}
                        >
                          <span className="nav-sub-dot" />
                          <span className="nav-sub-text">{sub.label}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sección perfil */}
        <div className="user-profile-section">
          <div className={`profile-card ${isCollapsed ? 'profile-card--collapsed' : ''}`}>
            {isCollapsed ? (
              /* Modo colapsado: solo avatar centrado */
              <div className="profile-avatar">
                <img src={iconoFace} alt="Usuario" />
              </div>
            ) : (
              /* Modo expandido: avatar + nombre + botón */
              <div className="profile-inner">
                <div className="profile-info">
                  <div className="profile-avatar">
                    <img src={iconoFace} alt="Usuario" />
                  </div>
                  <div className="profile-text">
                    <span className="profile-name">Alfonzo<br />Murillo</span>
                  </div>
                </div>
                <button className="logout-icon-btn" onClick={handleLogout} title="Cerrar sesión">
                  <img src={botonSalir} alt="Salir" className="logout-icon-img" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
