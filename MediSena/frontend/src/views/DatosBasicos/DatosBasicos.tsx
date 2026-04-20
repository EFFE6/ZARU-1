import React, { useState } from 'react';
import Sidebar from '../../components/Sidebar';
import api from '../../api/api';
import {
  ChevronRight,
  Home,
  User,
  Briefcase,
  Stethoscope,
  FileText,
  Users,
  X,
  Plus,
  Info,
  Check,
  Pencil,
  Trash2
} from 'lucide-react';
import '../../styles/DatosBasicos.css';

// Importación de componentes de cada pestaña
import Funcionarios, { Funcionario, Beneficiario } from './tabs/Funcionarios';
import Contratistas from './tabs/Contratistas';
import Medicos from './tabs/Medicos';
import Contratos from './tabs/Contratos';

/* ─── Tab icon map ─────────────────────────────────────────── */
const TAB_ICONS: Record<string, React.ReactNode> = {
  Funcionarios: <User size={13} color="white" />,
  Contratistas: <Briefcase size={13} color="white" />,
  Médicos: <Stethoscope size={13} color="white" />,
  Contratos: <FileText size={13} color="white" />,
};

const DatosBasicos: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Funcionarios' | 'Contratistas' | 'Médicos' | 'Contratos'>('Funcionarios');

  /* ── Beneficiarios Modal (Capa Superior) ── */
  const [isBeneficiariosOpen, setIsBeneficiariosOpen] = useState(false);
  const [selectedOfficial, setSelectedOfficial] = useState<Funcionario | null>(null);
  const [beneficiarios, setBeneficiarios] = useState<Beneficiario[]>([]);
  const [loadingBene, setLoadingBene] = useState(false);

  const openBeneficiarios = async (f: Funcionario) => {
    setSelectedOfficial(f);
    setIsBeneficiariosOpen(true);
    setLoadingBene(true);
    try {
      const response = await api.get(`/funcionarios/${f.id}/beneficiarios`);
      setBeneficiarios(response.data);
    } catch (error) {
      console.error('Error fetching beneficiarios:', error);
    } finally {
      setLoadingBene(false);
    }
  };

  const tabs: Array<'Funcionarios' | 'Contratistas' | 'Médicos' | 'Contratos'> = [
    'Funcionarios', 'Contratistas', 'Médicos', 'Contratos',
  ];

  /* ─── Renderizado dinámico de la pestaña activa ───────────── */
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'Funcionarios': 
        return <Funcionarios onOpenBeneficiarios={openBeneficiarios} />;
      case 'Contratistas': return <Contratistas />;
      case 'Médicos': return <Medicos />;
      case 'Contratos': return <Contratos />;
      default: return <Funcionarios onOpenBeneficiarios={openBeneficiarios} />;
    }
  };

  return (
    <div className="main-layout">
      <Sidebar />
      <main className="main-content">
        <div className="db-container">

          {/* ── Header ── */}
          <header className="db-header">
            <div className="db-header-top">
              <nav className="db-breadcrumb">
                <div className="db-breadcrumb-item"><Home size={14} /></div>
                <div className="db-breadcrumb-sep"><ChevronRight size={13} /></div>
                <div className="db-breadcrumb-item">Datos Básicos</div>
                <div className="db-breadcrumb-sep"><ChevronRight size={13} /></div>
                <div className="db-breadcrumb-item active">{activeTab}</div>
              </nav>
            </div>
            <div className="db-header-bottom">
              <div className="db-header-bottom-left">
                <h1 className="db-title">Gestión de {activeTab}</h1>
                <p className="db-subtitle">Administre los {activeTab.toLowerCase()} del SENA</p>
              </div>
            </div>
          </header>

          {/* ── Tabs + Card ── */}
          <div className="db-tabs-card-group">
            <div className="db-tabs-scroll-area">
              {tabs.map(tab => (
                <div
                  key={tab}
                  className={`db-tab-pill ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {activeTab === tab && (
                    <div className="db-active-tab-icon">
                      {TAB_ICONS[tab]}
                    </div>
                  )}
                  {tab}
                </div>
              ))}
            </div>

            {/* Renderizado del componente hijo de la pestaña */}
            {renderActiveTab()}
          </div>

          {/* Modal Beneficiarios (Renderizado fuera del card para evitar trapping de z-index) */}
          {isBeneficiariosOpen && selectedOfficial && (
            <div className="db-modal-overlay" onClick={e => e.target === e.currentTarget && setIsBeneficiariosOpen(false)}>
              <div className="db-modal-beneficiarios">
                <div className="db-bene-header">
                  <div className="db-bene-title-wrap">
                    <Users size={20} className="db-bene-icon" />
                    <h2 className="db-bene-title">Beneficiarios</h2>
                    <div className="db-official-tag">
                      Funcionario: {selectedOfficial.identificacion} - {selectedOfficial.nombre}
                    </div>
                  </div>
                  <button className="db-modal-close" onClick={() => setIsBeneficiariosOpen(false)}><X size={20} /></button>
                </div>

                <div className="db-bene-body">
                  <div className="db-info-banner">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Info size={16} className="db-info-icon" />
                      <span>{beneficiarios.length} beneficiario(s) encontrado(s)</span>
                    </div>
                  </div>

                  <div className="db-bene-table-wrapper">
                    <table className="db-bene-table">
                      <thead>
                        <tr>
                          <th>Letra</th>
                          <th>Nombre Completo</th>
                          <th>Documento</th>
                          <th>Clasificación</th>
                          <th>Parentesco</th>
                          <th>Edad</th>
                          <th>Género</th>
                          <th>Teléfono</th>
                          <th>Estado</th>
                          <th>Suspendido</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loadingBene ? (
                          <tr><td colSpan={11} className="db-table-empty">Cargando...</td></tr>
                        ) : beneficiarios.length === 0 ? (
                          <tr><td colSpan={11} className="db-table-empty">No hay beneficiarios.</td></tr>
                        ) : (
                          beneficiarios.map(b => (
                            <tr key={b.id}>
                              <td>
                                <div className="db-letra-circle">
                                  {b.nombre.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </div>
                              </td>
                              <td className="db-bene-name">{b.nombre}</td>
                              <td>{b.documento}</td>
                              <td>
                                <div className="db-clasif-pill"></div>
                              </td>
                              <td>{b.parentesco}</td>
                              <td>{b.edad}</td>
                              <td>{b.genero}</td>
                              <td>{b.telefono}</td>
                              <td>
                                <div className="db-estado-circle">0</div>
                              </td>
                              <td>
                                <div className={`db-toggle-switch ${b.suspendido ? 'active' : ''}`}>
                                  <div className="db-toggle-thumb">
                                    {b.suspendido && <Check size={10} />}
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div className="db-row-actions">
                                  <button className="db-icon-btn small"><Pencil size={14} /></button>
                                  <button className="db-icon-btn small delete"><Trash2 size={14} /></button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="db-bene-footer">
                  <button className="db-btn-new-bene">
                    <Plus size={16} />
                    Nuevo Beneficiario
                  </button>
                  <button className="db-btn-close-bene" onClick={() => setIsBeneficiariosOpen(false)}>Cerrar</button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default DatosBasicos;
