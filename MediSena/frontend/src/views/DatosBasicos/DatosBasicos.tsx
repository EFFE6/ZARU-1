import React, { useState } from 'react';

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
  Trash2,
  Save,
  Eye,
  Ban
} from 'lucide-react';
import '../../styles/DatosBasicos/DatosBasicos.css';

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

  /* ── Official (Funcionario) Modal ── */
  const [isOfficialModalOpen, setIsOfficialModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('view');
  const [officialForm, setOfficialForm] = useState<Partial<Funcionario>>({});

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

  const handleOpenOfficial = (f: Funcionario, mode: 'view' | 'edit') => {
    setOfficialForm({ ...f });
    setModalMode(mode);
    setIsOfficialModalOpen(true);
  };

  const handleNewOfficial = () => {
    setOfficialForm({
      identificacion: '',
      nombre: '',
      apellido: '',
      cargo: '',
      dependencia: '',
      regional: '',
      estado: 'ACTIVO',
      tipoDocumento: 'Cédula de Ciudadanía',
      tipoVinculacion: 'Planta - Carrera Administrativa',
      beneficiarios: { activos: 0, inactivos: 0 }
    });
    setModalMode('create');
    setIsOfficialModalOpen(true);
  };

  const handleSaveOfficial = async () => {
    try {
      if (modalMode === 'edit' || modalMode === 'view') {
        await api.put(`/funcionarios/${officialForm.id}`, officialForm);
      } else {
        await api.post('/funcionarios', officialForm);
      }
      setIsOfficialModalOpen(false);
      // Recargar la tabla (esto se maneja en el hijo, pero idealmente el hijo escucharía un trigger o se pasaría una función de refresh)
      // Por simplicidad en este MVP, asumiremos que el usuario recarga o que el hijo se actualiza.
      window.location.reload(); 
    } catch (error) {
      console.error('Error saving official:', error);
    }
  };

  const tabs: Array<'Funcionarios' | 'Contratistas' | 'Médicos' | 'Contratos'> = [
    'Funcionarios', 'Contratistas', 'Médicos', 'Contratos',
  ];

  /* ─── Renderizado dinámico de la pestaña activa ───────────── */
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'Funcionarios': 
        return (
          <Funcionarios 
            onOpenBeneficiarios={openBeneficiarios} 
            onEditOfficial={(f) => handleOpenOfficial(f, 'edit')}
            onViewOfficial={(f) => handleOpenOfficial(f, 'view')}
            onNewOfficial={handleNewOfficial}
          />
        );
      case 'Contratistas': return <Contratistas />;
      case 'Médicos': return <Medicos />;
      case 'Contratos': return <Contratos />;
      default: return (
        <Funcionarios 
          onOpenBeneficiarios={openBeneficiarios} 
          onEditOfficial={(f) => handleOpenOfficial(f, 'edit')}
          onViewOfficial={(f) => handleOpenOfficial(f, 'view')}
          onNewOfficial={handleNewOfficial}
        />
      );
    }
  };

  return (
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
                <h1 className="db-title">
                  {activeTab === 'Funcionarios' ? 'Datos básicos' : `Gestión de ${activeTab.toLowerCase()}`}
                </h1>
              </div>
              <div className="db-header-bottom-right">
                <div className="db-search-container-header">
                  <input type="text" placeholder="Busca el nombre de usuario o radicado" className="db-search-input-header" />
                  <button className="db-search-btn-header">
                    <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="7" cy="7" r="4.2" stroke="#002c4d" strokeWidth="2" />
                      <line x1="10.2" y1="10.5" x2="15.5" y2="15.8" stroke="#002c4d" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
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

          {/* Modal Beneficiarios (Capa Superior) */}
          {isBeneficiariosOpen && selectedOfficial && (
            <div className="db-modal-overlay" onClick={e => e.target === e.currentTarget && setIsBeneficiariosOpen(false)}>
              <div className="db-modal-beneficiarios">
                <div className="db-bene-header">
                  <div className="db-bene-title-wrap">
                    <Users size={20} className="db-official-icon" />
                    <h2 className="db-official-title">Beneficiarios</h2>
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
                                <div className="db-letra-circle" style={{ background: '#ecfdf5', color: '#059669', border: 'none' }}>0</div>
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

          {/* Modal Official View/Edit (Capa Superior) */}
          {isOfficialModalOpen && (
            <div className="db-modal-overlay" onClick={e => e.target === e.currentTarget && setIsOfficialModalOpen(false)}>
              <div className="db-modal-official-full">
                
                {modalMode === 'view' ? (
                  /* ─── DISEÑO DE DETALLES (VIEW MODE) ─── */
                  <>
                    <div className="db-official-header" style={{ border: 'none', paddingBottom: 0 }}>
                      <div className="db-official-title-wrap">
                        <Eye size={20} className="db-official-icon" />
                        <h2 className="db-official-title" style={{ fontSize: '16px', fontWeight: 700 }}>Detalles del Funcionario</h2>
                      </div>
                      <button className="db-modal-close" onClick={() => setIsOfficialModalOpen(false)}><X size={20} /></button>
                    </div>

                    <div className="db-view-header">
                      <div className="db-view-avatar-large">
                        {officialForm.nombre?.split(' ').map(n => n[0]).join('').slice(0, 2) || '??'}
                      </div>
                      <div className="db-view-id-info">
                        <h3 className="db-view-name">{officialForm.nombre} {officialForm.apellido}</h3>
                        <span className="db-view-id-tag">CC - {officialForm.identificacion}</span>
                        <div className={`db-view-status-badge ${officialForm.estado === 'INACTIVO' ? 'inactivo' : ''}`} 
                             style={officialForm.estado === 'INACTIVO' ? { background: '#ef4444' } : {}}>
                          {officialForm.estado}
                        </div>
                      </div>
                    </div>

                    <div className="db-view-grid">
                      <div className="db-view-field">
                        <span className="db-view-label">Cargo</span>
                        <span className="db-view-value">{officialForm.cargo}</span>
                      </div>
                      <div className="db-view-field">
                        <span className="db-view-label">Dependencia</span>
                        <span className="db-view-value">{officialForm.dependencia}</span>
                      </div>
                      <div className="db-view-field">
                        <span className="db-view-label">Regional</span>
                        <span className="db-view-value">{officialForm.regional}</span>
                      </div>
                      <div className="db-view-field">
                        <span className="db-view-label">Tipo de Vinculación</span>
                        <span className="db-view-value">{officialForm.tipoVinculacion || 'No especificado'}</span>
                      </div>
                      
                      <div className="db-view-bene-row">
                        <span className="db-view-label">Beneficiarios a Cargo</span>
                        <div className="db-view-bene-stats">
                          <div className="db-view-stat-item">
                            <Users size={16} />
                            {(officialForm.beneficiarios?.activos || 0) + (officialForm.beneficiarios?.inactivos || 0)} Total
                          </div>
                          <div className="db-view-stat-item activos">
                            <Check size={16} />
                            {officialForm.beneficiarios?.activos || 0} Activos
                          </div>
                          <div className="db-view-stat-item inactivos">
                            <Ban size={16} />
                            {officialForm.beneficiarios?.inactivos || 0} Inactivos
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="db-view-divider"></div>

                    <h4 className="db-view-section-title">Información de Contacto</h4>
                    <div className="db-view-contact-grid">
                      <div className="db-view-field">
                        <span className="db-view-label">Teléfono</span>
                        <span className="db-view-value">{officialForm.telefono || 'Sin registrar'}</span>
                      </div>
                      <div className="db-view-field">
                        <span className="db-view-label">Dirección</span>
                        <span className="db-view-value">{officialForm.direccion || 'Sin registrar'}</span>
                      </div>
                    </div>

                    <div className="db-official-footer" style={{ background: 'transparent', border: 'none' }}>
                      <button className="db-btn-close-view" onClick={() => setIsOfficialModalOpen(false)}>Cerrar</button>
                    </div>
                  </>
                ) : (
                  /* ─── DISEÑO DE FORMULARIO (EDIT/CREATE MODE) ─── */
                  <>
                    <div className="db-official-header">
                      <div className="db-official-title-wrap">
                        <Briefcase size={22} className="db-official-icon" />
                        <h2 className="db-official-title">
                          {modalMode === 'edit' ? 'Editar' : 'Nuevo'} Funcionario
                        </h2>
                      </div>
                      <button className="db-modal-close" onClick={() => setIsOfficialModalOpen(false)}><X size={20} /></button>
                    </div>

                    <div className="db-official-body">
                      {/* Sección 1: Información Personal */}
                      <div className="db-form-section">
                        <h3 className="db-section-title">Información Personal</h3>
                        <div className="db-form-grid-3">
                          <div className="db-field">
                            <label className="db-field-label">Tipo de Documento <span>*</span></label>
                            <select 
                              className="db-field-select" 
                              value={officialForm.tipoDocumento}
                              onChange={e => setOfficialForm(p => ({ ...p, tipoDocumento: e.target.value }))}
                            >
                              <option>Cédula de Ciudadanía</option>
                              <option>Tarjeta de Identidad</option>
                              <option>Cédula de Extranjería</option>
                            </select>
                          </div>
                          <div className="db-field">
                            <label className="db-field-label">Número de Identificación <span>*</span></label>
                            <input 
                              type="text" className="db-field-input" 
                              value={officialForm.identificacion}
                              onChange={e => setOfficialForm(p => ({ ...p, identificacion: e.target.value }))}
                            />
                          </div>
                          <div className="db-field-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', gridColumn: 'span 1' }}>
                            <div className="db-field">
                              <label className="db-field-label">Nombre <span>*</span></label>
                              <input 
                                type="text" className="db-field-input" 
                                value={officialForm.nombre}
                                onChange={e => setOfficialForm(p => ({ ...p, nombre: e.target.value }))}
                              />
                            </div>
                            <div className="db-field">
                              <label className="db-field-label">Apellido <span>*</span></label>
                              <input 
                                type="text" className="db-field-input" 
                                value={officialForm.apellido || ''}
                                onChange={e => setOfficialForm(p => ({ ...p, apellido: e.target.value }))}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="db-form-grid-3">
                          <div className="db-field">
                            <label className="db-field-label">Fecha de Nacimiento <span>*</span></label>
                            <input 
                              type="date" className="db-field-input" 
                              value={officialForm.fechaNacimiento || ''}
                              onChange={e => setOfficialForm(p => ({ ...p, fechaNacimiento: e.target.value }))}
                            />
                          </div>
                          <div className="db-field">
                            <label className="db-field-label">Teléfono <span>*</span></label>
                            <input 
                              type="text" className="db-field-input" 
                              value={officialForm.telefono || ''}
                              onChange={e => setOfficialForm(p => ({ ...p, telefono: e.target.value }))}
                            />
                          </div>
                          <div className="db-field">
                            <label className="db-field-label">Email Institucional</label>
                            <input 
                              type="email" className="db-field-input" 
                              value={officialForm.emailInstitucional || ''}
                              onChange={e => setOfficialForm(p => ({ ...p, emailInstitucional: e.target.value }))}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Sección 2: Información Laboral */}
                      <div className="db-form-section">
                        <h3 className="db-section-title">Información Laboral</h3>
                        <div className="db-form-grid-2">
                          <div className="db-field">
                            <label className="db-field-label">Cargo <span>*</span></label>
                            <input 
                              type="text" className="db-field-input" 
                              value={officialForm.cargo}
                              onChange={e => setOfficialForm(p => ({ ...p, cargo: e.target.value }))}
                            />
                          </div>
                          <div className="db-field">
                            <label className="db-field-label">Dependencia <span>*</span></label>
                            <input 
                              type="text" className="db-field-input" 
                              value={officialForm.dependencia}
                              onChange={e => setOfficialForm(p => ({ ...p, dependencia: e.target.value }))}
                            />
                          </div>
                        </div>
                        <div className="db-form-grid-3">
                          <div className="db-field">
                            <label className="db-field-label">Regional <span>*</span></label>
                            <input 
                              type="text" className="db-field-input" 
                              value={officialForm.regional}
                              onChange={e => setOfficialForm(p => ({ ...p, regional: e.target.value }))}
                            />
                          </div>
                          <div className="db-field">
                            <label className="db-field-label">Tipo de Vinculación</label>
                            <select 
                              className="db-field-select" 
                              value={officialForm.tipoVinculacion}
                              onChange={e => setOfficialForm(p => ({ ...p, tipoVinculacion: e.target.value }))}
                            >
                              <option>Planta - Carrera Administrativa</option>
                              <option>Planta - Libre Nombramiento</option>
                              <option>Provisionalidad</option>
                              <option>Establecimiento</option>
                            </select>
                          </div>
                          <div className="db-field">
                            <label className="db-field-label">Fecha de Ingreso</label>
                            <input 
                              type="date" className="db-field-input" 
                              value={officialForm.fechaIngreso || ''}
                              onChange={e => setOfficialForm(p => ({ ...p, fechaIngreso: e.target.value }))}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Sección 3: Información de Contacto */}
                      <div className="db-form-section">
                        <h3 className="db-section-title">Información de Contacto</h3>
                        <div className="db-form-grid-2">
                          <div className="db-field">
                            <label className="db-field-label">Teléfono de Contacto</label>
                            <input 
                              type="text" className="db-field-input" 
                              value={officialForm.telefonoContacto || ''}
                              onChange={e => setOfficialForm(p => ({ ...p, telefonoContacto: e.target.value }))}
                            />
                          </div>
                          <div className="db-field">
                            <label className="db-field-label">Ciudad</label>
                            <input 
                              type="text" className="db-field-input" 
                              value={officialForm.ciudad || ''}
                              onChange={e => setOfficialForm(p => ({ ...p, ciudad: e.target.value }))}
                            />
                          </div>
                        </div>
                        <div className="db-form-grid-2">
                          <div className="db-field">
                            <label className="db-field-label">Dirección</label>
                            <input 
                              type="text" className="db-field-input" 
                              value={officialForm.direccion || ''}
                              onChange={e => setOfficialForm(p => ({ ...p, direccion: e.target.value }))}
                            />
                          </div>
                          <div className="db-field">
                            <label className="db-field-label">Departamento</label>
                            <input 
                              type="text" className="db-field-input" 
                              value={officialForm.departamento || ''}
                              onChange={e => setOfficialForm(p => ({ ...p, departamento: e.target.value }))}
                            />
                          </div>
                        </div>
                        <div className="db-field">
                          <label className="db-field-label">Observaciones</label>
                          <textarea 
                            className="db-field-textarea" 
                            value={officialForm.observaciones || ''}
                            onChange={e => setOfficialForm(p => ({ ...p, observaciones: e.target.value }))}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="db-official-footer">
                      <button className="db-btn-cancel-form" onClick={() => setIsOfficialModalOpen(false)}>
                        <X size={15} />
                        Cancelar
                      </button>
                      <button className="db-btn-save-form" onClick={handleSaveOfficial}>
                        <Save size={15} />
                        {modalMode === 'edit' ? 'Actualizar' : 'Guardar'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
    </div>
  );
};

export default DatosBasicos;
