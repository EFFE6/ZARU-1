import React, { useState, useEffect } from 'react';
import api from '../../../api/api';
import {
  Plus,
  RefreshCw,
  ArrowUpDown,
  Users,
  Check,
  X,
  Trash2,
  Save,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Info
} from 'lucide-react';

// Iconos SVG personalizados
import iconBotonVer from '../../../assets/img/datosbasicos/icons/funcionarios/botonver.svg';
import iconBotonEdit from '../../../assets/img/datosbasicos/icons/funcionarios/botonedit.svg';
import iconCargoAmarillo from '../../../assets/img/datosbasicos/icons/funcionarios/cargoamarillo.svg';
import iconCargoAzul from '../../../assets/img/datosbasicos/icons/funcionarios/cargoazul.svg';
import iconRegional from '../../../assets/img/datosbasicos/icons/funcionarios/regional.svg';

export interface Funcionario {
  id: number;
  tipoDocumento?: string;
  identificacion: string;
  nombre: string;
  apellido?: string;
  fechaNacimiento?: string;
  telefono?: string;
  emailInstitucional?: string;
  cargo: string;
  dependencia: string;
  regional: string;
  tipoVinculacion?: string;
  fechaIngreso?: string;
  telefonoContacto?: string;
  ciudad?: string;
  departamento?: string;
  direccion?: string;
  observaciones?: string;
  beneficiarios: {
    activos: number;
    inactivos: number;
  };
  estado: string;
}

export interface Beneficiario {
  id: number;
  letra: string;
  nombre: string;
  documento: string;
  clasificacion: string;
  parentesco: string;
  edad: string;
  genero: string;
  telefono: string;
  estado: string;
  suspendido: boolean;
}

interface FuncionariosProps {
  onOpenBeneficiarios: (f: Funcionario) => void;
  onEditOfficial: (f: Funcionario) => void;
  onViewOfficial: (f: Funcionario) => void;
  onNewOfficial: () => void;
}

const Funcionarios: React.FC<FuncionariosProps> = ({ onOpenBeneficiarios, onEditOfficial, onViewOfficial, onNewOfficial }) => {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('Todos');
  const [regionalFilter, setRegionalFilter] = useState('Todas');

  /* ── Paginación ── */
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Funcionario | null>(null);

  useEffect(() => {
    fetchFuncionarios();
  }, []);

  const fetchFuncionarios = async () => {
    setLoading(true);
    try {
      const response = await api.get('/funcionarios');
      setFuncionarios(response.data);
    } catch (error) {
      console.error('Error fetching funcionarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await api.delete(`/funcionarios/${itemToDelete.id}`);
      setFuncionarios(p => p.filter(f => f.id !== itemToDelete.id));
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error('Error deleting funcionario:', error);
    }
  };

  const handleSave = async () => {
    try {
      if (isEdit && editId) {
        await api.put(`/funcionarios/${editId}`, formData);
        setFuncionarios(p => p.map(f => f.id === editId ? { ...f, ...formData } : f));
      } else {
        const response = await api.post('/funcionarios', {
          ...formData,
          estado: 'ACTIVO',
          beneficiarios: { activos: 0, inactivos: 0 }
        });
        setFuncionarios(p => [response.data, ...p]);
      }
      setIsFormOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving funcionario:', error);
    }
  };


  const filteredData = funcionarios.filter(f => {
    const q = searchQuery.toLowerCase();
    const matchesQuery = f.nombre.toLowerCase().includes(q) || 
                        f.cargo.toLowerCase().includes(q) || 
                        f.identificacion.includes(q);
    const matchesEstado = estadoFilter === 'Todos' || f.estado === estadoFilter;
    const matchesRegional = regionalFilter === 'Todas' || f.regional === regionalFilter;
    return matchesQuery && matchesEstado && matchesRegional;
  });

  /* ── Lógica Paginación ── */
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="db-content-card first-tab-active">
      {/* Toolbar */}
      <div className="db-toolbar">
        <div className="db-toolbar-filters">
          <div className="db-filter-group">
            <select className="db-filter-select" value={estadoFilter} onChange={e => { setEstadoFilter(e.target.value); setCurrentPage(1); }}>
              <option value="Todos">Estado</option>
              <option value="ACTIVO">ACTIVO</option>
              <option value="INACTIVO">INACTIVO</option>
            </select>
          </div>
          <div className="db-filter-group">
            <select className="db-filter-select" value={regionalFilter} onChange={e => { setRegionalFilter(e.target.value); setCurrentPage(1); }}>
              <option value="Todas">Regional</option>
              <option value="15">15</option>
              <option value="63">63</option>
            </select>
          </div>
          {regionalFilter === 'Todas' && (
            <div className="db-active-filter-tag">
              Todas <X size={13} className="db-filter-tag-x" onClick={() => setRegionalFilter('')} />
            </div>
          )}
        </div>
        <div className="db-toolbar-right" style={{ marginLeft: '16px' }}>
          <button className="db-btn-refresh" onClick={fetchFuncionarios}>
            <RefreshCw size={14} />
            Actualizar
          </button>
          <button className="db-btn-new" onClick={onNewOfficial}>
            <Plus size={16} />
            Nuevo Funcionario
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="db-table-wrapper">
        <table className="db-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>NOMBRE COMPLETO <ArrowUpDown size={13} className="db-sort-icon" /></th>
              <th>CARGO</th>
              <th>DEPENDENCIA</th>
              <th>REGIONAL</th>
              <th>BENEFICIARIOS</th>
              <th>ESTADO</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="db-table-empty">Cargando funcionarios...</td></tr>
            ) : paginatedData.length === 0 ? (
              <tr><td colSpan={8} className="db-table-empty">No se encontraron funcionarios.</td></tr>
            ) : (
              paginatedData.map(f => (
                <tr key={f.id}>
                  <td className="db-col-id">{f.identificacion}</td>
                  <td>
                    <div className="db-user-cell">
                      <div className="db-user-avatar">
                        {f.nombre.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <span className="db-user-name">{f.nombre}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`db-cargo-pill ${f.cargo?.toLowerCase().includes('instructor') ? 'amarillo' : 'azul'}`}>
                      <img
                        src={f.cargo?.toLowerCase().includes('instructor') ? iconCargoAmarillo : iconCargoAzul}
                        alt="cargo"
                        className="db-cargo-icon"
                      />
                      {f.cargo}
                    </span>
                  </td>
                  <td>{f.dependencia}</td>
                  <td>
                    <span className="db-regional-pill">
                      <img src={iconRegional} alt="regional" className="db-cargo-icon" />
                      {f.regional}
                    </span>
                  </td>
                  <td>
                    <div className="db-beneficiarios-td">
                      <div className="db-beneficiarios-grid">
                        <div className="db-beneficiario-stat bene-check">
                          <Check size={11} /> {f.beneficiarios.activos}
                        </div>
                        <div className="db-beneficiario-stat bene-x">
                          <X size={11} /> {f.beneficiarios.inactivos}
                        </div>
                      </div>
                      <span className="db-bene-count" onClick={() => onOpenBeneficiarios(f)}>
                        {f.beneficiarios.activos + f.beneficiarios.inactivos}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className={`db-toggle-switch ${f.estado === 'ACTIVO' ? 'active' : ''}`}>
                      <div className="db-toggle-thumb">
                        {f.estado === 'ACTIVO' ? <Check size={10} color="#059669" /> : <X size={10} color="#9ca3af" />}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="db-row-actions">
                      <button className="db-icon-btn-svg" title="Ver" onClick={() => onViewOfficial(f)}>
                        <img src={iconBotonVer} alt="ver" className="db-action-icon" />
                      </button>
                      <button className="db-icon-btn-svg" title="Editar" onClick={() => onEditOfficial(f)}>
                        <img src={iconBotonEdit} alt="editar" className="db-action-icon" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación (Dashboard style) */}
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
          {totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalItems)} de {totalItems} Registros
        </div>
      </div>



      {/* Modal Eliminar Funcionario */}
      {isDeleteModalOpen && (
        <div className="db-modal-overlay" onClick={e => e.target === e.currentTarget && setIsDeleteModalOpen(false)}>
          <div className="db-modal-delete">
            <div className="db-delete-icon-wrap"><Trash2 size={24} color="white" /></div>
            <h3 className="db-modal-title">¿Eliminar registro?</h3>
            <p className="db-modal-description">Esta acción no se puede deshacer. Se eliminará al funcionario del sistema.</p>
            <div className="db-modal-actions">
              <button className="db-btn-modal db-btn-cancel-modal" onClick={() => setIsDeleteModalOpen(false)}>Cancelar</button>
              <button className="db-btn-modal db-btn-delete-modal" onClick={handleDelete}><Trash2 size={15} /> Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Funcionarios;
