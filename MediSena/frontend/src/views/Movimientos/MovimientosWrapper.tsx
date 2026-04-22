import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import MovTabs, { TABS } from './MovTabs';
import { Home, ChevronRight, RefreshCw } from 'lucide-react';

const MovimientosWrapper: React.FC = () => {
  const { pathname } = useLocation();
  const [firstActive, setFirstActive] = useState(pathname === '/movimientos/orden-atencion');

  const currentTab = TABS.find(t => t.path === pathname) || TABS[0];

  return (
    <div className="gestion-container">
      {/* ── Header ── */}
      <header className="gestion-header">
        <div className="gestion-header-top">
          <nav className="breadcrumb">
            <div className="breadcrumb-item"><Home size={14} /></div>
            <div className="breadcrumb-sep"><ChevronRight size={13} /></div>
            <div className="breadcrumb-item">Movimientos</div>
            <div className="breadcrumb-sep"><ChevronRight size={13} /></div>
            <div className="breadcrumb-item active">{currentTab.label}</div>
          </nav>
        </div>
        <div className="gestion-header-bottom">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <h1 className="gestion-title" style={{ margin: 0 }}>{currentTab.label}</h1>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {/* Botones genéricos o dejar que el hijo los defina? 
                Para mantener la flexibilidad, podemos usar un Portal o simplemente dejar que el hijo maneje sus botones internos.
                Sin embargo, el "Actualizar" es común. */}
            <button className="oa-btn-refresh" onClick={() => window.location.reload()}>
              <RefreshCw size={14} /> Actualizar
            </button>
          </div>
        </div>
      </header>

      {/* ── Tabs + Card ── */}
      <div className="tabs-card-group">
        <MovTabs onFirstActive={setFirstActive} />
        <div className={`gestion-content-card${firstActive ? ' first-tab-active' : ''}`} style={{ marginTop: 0 }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MovimientosWrapper;
