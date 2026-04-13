import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

// Icons
import { User, Lock, Eye, EyeOff } from 'lucide-react';

// Images
import logoMedisena from '../assets/img/login/logo-medisena-login.png';
import senaLogo from '../assets/img/login/sena-logo.png';
import azulBg from '../assets/img/login/azul.png';
import marcaAgua from '../assets/img/login/medicina-marca-agua.png';
import hombreDr from '../assets/img/login/hombre.png';
import estetoscopio from '../assets/img/login/estetocopio.png';
import termometro from '../assets/img/login/termometro.png';
import adn from '../assets/img/login/adn.png';
import linea1 from '../assets/img/login/linea1.png';
import linea2 from '../assets/img/login/linea2.png';
import linea3 from '../assets/img/login/linea3.png';

import '../styles/Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/');
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', {
        user: username,
        password: password,
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        navigate('/');
      }
    } catch (err) {
      setError('Credenciales inválidas. Intenta de nuevo.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      {/* ── Barra gov.co ── */}
      <div className="login-govco-bar">
        <div className="login-govco-inner">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="govco-flag-icon">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M2 8h20" />
            <path d="M2 12h20" />
          </svg>
          <span className="govco-text">gov.co</span>
          <span className="govco-sep">|</span>
          <span className="govco-sub">Portal oficial del Estado colombiano</span>
        </div>
      </div>


      <div className="login-main-content">

        {/* Background Lines - PNG images from Figma */}
        <img src={linea1} alt="" className="login-bg-line login-line1" />
        <img src={linea2} alt="" className="login-bg-line login-line2" />
        <img src={linea3} alt="" className="login-bg-line login-line3" />

        {/* Left Side: Form */}
        <div className="login-left">
          <div className="login-form-container">
            <img src={logoMedisena} alt="MediSena" className="login-logo-img" />

            <h1 className="login-title-text">Iniciar sesión</h1>

            <form onSubmit={handleLogin} className="login-form">

              <div className={`login-input-wrapper ${error ? 'has-error' : ''}`}>
                <label>Número de documento</label>
                <div className="login-input-group">
                  <User size={20} className="login-icon" />
                  <input
                    type="text"
                    placeholder="admin@g.com"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="login-input"
                    required
                  />
                </div>
              </div>

              <div className={`login-input-wrapper ${error ? 'has-error' : ''}`}>
                <label>Contraseña</label>
                <div className="login-input-group">
                  <Lock size={20} className="login-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="*****"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="login-input"
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} className="login-icon-toggle" /> : <Eye size={20} className="login-icon-toggle" />}
                  </button>
                </div>
              </div>

              {error && <p className="login-error">{error}</p>}

              <div className="login-links">
                <span>¿Olvidaste tu contraseña o tu cuenta esta inactiva? </span>
                <br />
                <a href="#" className="login-link-reset">Restablecer</a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="login-button-green"
              >
                {loading ? 'Cargando...' : 'Ingresar'}
              </button>
            </form>

            <div className="login-sena-logo-container">
              <img src={senaLogo} alt="Sena Logo" className="sena-logo-img" />
            </div>
          </div>
        </div>

        {/* Right Side: Images */}
        <div className="login-right">
          <img src={azulBg} alt="Background Shape" className="login-bg-shape" />
          <img src={marcaAgua} alt="Watermark" className="login-watermark" />

          <img src={hombreDr} alt="Doctor" className="login-doctor" />

          <img src={estetoscopio} alt="Estetoscopio" className="login-floating login-estetoscopio" />
          <img src={termometro} alt="Termometro" className="login-floating login-termometro" />
          <img src={adn} alt="ADN" className="login-floating login-adn" />
        </div>

      </div>
    </div>
  );
};

export default Login;
