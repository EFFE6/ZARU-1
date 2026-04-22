import React, { useState } from 'react';
import Sidebar from '../../../components/Sidebar';
import { Home, ChevronRight, Search } from 'lucide-react';
import './Agendas.css';
import ProgramarAgenda from './tabs/ProgramarAgenda';
import GestionAgendas from './tabs/GestionAgendas';

const Agendas: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Programar Agenda');

  const tabs = ['Programar Agenda', 'Gestión de Agendas'];

  return (
    <div className="main-layout">
      <Sidebar />
      <main className="main-content" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <div className="agendas-container" style={{ overflowY: 'auto' }}>
          
          <header className="agendas-header">
            <div className="db-header-top">
              <nav className="db-breadcrumb">
                <div className="db-breadcrumb-item"><Home size={13} /></div>
                <div className="db-breadcrumb-sep"><ChevronRight size={12} /></div>
                <div className="db-breadcrumb-item">Movimientos</div>
                <div className="db-breadcrumb-sep"><ChevronRight size={12} /></div>
                <div className="db-breadcrumb-item active">{activeTab}</div>
              </nav>
            </div>
            
            <div className="agendas-header-bottom">
              <div className="agendas-header-bottom-left">
                <h1 className="agendas-title">{activeTab}</h1>
                {activeTab === 'Gestión de Agendas' && (
                  <p className="agendas-tab-description">Visualice y administre las agendas médicas</p>
                )}
              </div>
              <div className="agendas-header-bottom-right">
                <div className="agendas-search-container-header">
                  <input type="text" placeholder="Busca el nombre de usuario o radicado" className="agendas-search-input-header" />
                  <button className="agendas-search-btn-header">
                    <Search size={16} color="#002c4d" />
                  </button>
                </div>
              </div>
            </div>
          </header>

          <div className="db-tabs-card-group" style={{ marginTop: '20px' }}>
            <div className="agendas-tabs-scroll-area">
              {tabs.map(tab => (
                <div
                  key={tab}
                  className={`agendas-tab-pill ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </div>
              ))}
            </div>

            {activeTab === 'Programar Agenda' && <ProgramarAgenda />}
            {activeTab === 'Gestión de Agendas' && <GestionAgendas />}
          </div>

        </div>
      </main>
    </div>
  );
};

export default Agendas;
