import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import headerImg from '../assets/img/login/header-login.svg';

const MainLayout: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%', overflow: 'hidden' }}>
      {/* Barra superior de gov.co */}
      <div className="gov-bar">
        <img src={headerImg} alt="Gov.co" className="govco-header-img" style={{ height: '12px', display: 'block', opacity: 0.95 }} />
      </div>

      {/* Contenedor principal con la barra lateral y el contenido */}
      <div className="main-layout" style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <Sidebar />
        <main className="main-content" style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, overflowY: 'auto', background: 'transparent' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
