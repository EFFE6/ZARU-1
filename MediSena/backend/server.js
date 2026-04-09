import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();
const app = express();

// 🔹 CORS: permitir el frontend de Vite (dev) y producción
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`CORS bloqueado para: ${origin}`);
      callback(new Error(`CORS bloqueado para: ${origin}`));
    }
  },
  credentials: true,
}));

app.use(express.json());

// ──────────────────────────────────────────────
// 🛡️ Middleware de autenticación
// ──────────────────────────────────────────────
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Token no proporcionado' });

  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, user) => {
    if (err) return res.status(403).json({ message: 'Token inválido o expirado' });
    req.user = user;
    next();
  });
};

// ──────────────────────────────────────────────
// 🔐 Login
// ──────────────────────────────────────────────
app.post('/api/auth/login', (req, res) => {
  const { user, password } = req.body;
  if (user === 'admin' && password === '1234') {
    const token = jwt.sign({ user }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    return res.json({ token });
  }
  res.status(401).json({ message: 'Credenciales inválidas' });
});

// ──────────────────────────────────────────────
// 🏥 Test de conexión
// ──────────────────────────────────────────────
app.get('/api/test', (req, res) => {
  res.json({ message: 'API funcionando 🚀' });
});

// ──────────────────────────────────────────────
// 📊 Dashboard Data
// ──────────────────────────────────────────────

app.get('/api/dashboard/stats', authenticateToken, (req, res) => {
  res.json({
    beneficiarios: 120,
    citas: 35,
    ordenes: 18,
    profesionales: 12
  });
});

app.get('/api/dashboard/citas', authenticateToken, (req, res) => {
  const citas = [
    { id: 1, medico: "Dr. Juan Pérez", beneficiario: "Carlos Valencia", hora: "11:20 a.m", estado: "Activo" },
    { id: 2, medico: "Dra. Maria López", beneficiario: "Ana Garcia", hora: "02:00 p.m", estado: "Activo" },
    { id: 3, medico: "Dr. Roberto Diaz", beneficiario: "Lucas Gomez", hora: "08:30 a.m", estado: "Completado" },
    { id: 4, medico: "Dra. Elena Ruiz", beneficiario: "Sofia Martinez", hora: "10:15 a.m", estado: "Cancelado" },
    { id: 5, medico: "Dr. Juan Pérez", beneficiario: "Samuel Rodriguez", hora: "03:45 p.m", estado: "Pendiente" }
  ];
  res.json(citas);
});

// ──────────────────────────────────────────────
// 👥 Usuarios Data
// ──────────────────────────────────────────────

app.get('/api/usuarios', (req, res) => {
  const usuarios = [
    { id: 1, nombre: 'Paulette Goya', username: 'PGoya', rol: 'Administrador', email: 'Pgoya@example.com', regional: '63 - Dirección Regional Centro de Comercio y Servicios', ultimoAcceso: '31 dic 2025', activo: true, tipoUsuario: 'T', fechaCreacion: '01 ene 2026', fechaModificacion: '31 dic 2026', codigoDependencia: '1000', telefono: '000', avatarInitials: 'PG' },
    { id: 2, nombre: 'Paulette Goya', username: 'PGoya2', rol: 'Usuario', email: 'Pgoya@example.com', regional: '63', ultimoAcceso: '31 dic 2025', activo: false, tipoUsuario: 'U', fechaCreacion: '01 ene 2026', fechaModificacion: '31 dic 2026', codigoDependencia: '1001', telefono: '000', avatarInitials: 'PG' },
    { id: 3, nombre: 'Paulette Goya', username: 'PGoya3', rol: 'Administrador', email: 'Pgoya@example.com', regional: '63 - Dirección Regional Centro de Comercio y Servicios', ultimoAcceso: '31 dic 2025', activo: true, tipoUsuario: 'T', fechaCreacion: '01 ene 2026', fechaModificacion: '31 dic 2026', codigoDependencia: '1002', telefono: '000', avatarInitials: 'PG' },
    { id: 4, nombre: 'Paulette Goya', username: 'PGoya4', rol: 'Usuario', email: 'Pgoya@example.com', regional: '63', ultimoAcceso: '31 dic 2025', activo: false, tipoUsuario: 'U', fechaCreacion: '01 ene 2026', fechaModificacion: '31 dic 2026', codigoDependencia: '1003', telefono: '000', avatarInitials: 'PG' },
  ];
  res.json(usuarios);
});

// ──────────────────────────────────────────────
// 📄 Resoluciones Data
// ──────────────────────────────────────────────

app.get('/api/resoluciones', (req, res) => {
  const resoluciones = [
    { 
      id: 1, 
      numero: "824", 
      fecha: "01 ene 2024", 
      descripcion: "Resolución 824 - Vigencia 2024", 
      estado: "Vigente", 
      vigencia: "01 ene 2024 - 31 dic 2024" 
    },
    { 
      id: 2, 
      numero: "824", 
      fecha: "01 ene 2023", 
      descripcion: "Resolución 824 - Vigencia 2023", 
      estado: "Vencido", 
      vigencia: "01 ene 2023 - 31 dic 2023" 
    },
    { 
      id: 3, 
      numero: "824", 
      fecha: "01 ene 2022", 
      descripcion: "Resolución 824 - Vigencia 2022", 
      estado: "Vigente", 
      vigencia: "01 ene 2022 - 31 dic 2022" 
    },
    { 
      id: 4, 
      numero: "824", 
      fecha: "01 ene 2021", 
      descripcion: "Resolución 824 - Vigencia 2021", 
      estado: "Vencido", 
      vigencia: "01 ene 2021 - 31 dic 2021" 
    },
    { 
      id: 5, 
      numero: "824", 
      fecha: "01 ene 2020", 
      descripcion: "Resolución 824 - Vigencia 2020", 
      estado: "Vencido", 
      vigencia: "01 ene 2020 - 31 dic 2020" 
    },
    { 
      id: 6, 
      numero: "824", 
      fecha: "01 ene 2019", 
      descripcion: "Resolución 824 - Vigencia 2019", 
      estado: "Vencido", 
      vigencia: "01 ene 2019 - 31 dic 2019" 
    }
  ];
  res.json(resoluciones);
});

// ──────────────────────────────────────────────
// 📐 Niveles Data
// ──────────────────────────────────────────────
let nivelesData = [
  { id: 1, tipoBeneficiario: 'Todos los beneficiarios', nivel: 'Nivel 1', topeMaximo: '$ 1.000.000', descripcion: 'Nivel 1 de Atención Médica', periodo: '31 dic 2026', estado: 'Vigente' },
  { id: 2, tipoBeneficiario: 'Todos los beneficiarios', nivel: 'Nivel 2', topeMaximo: '$ 1.000.000', descripcion: 'Nivel 2 de Atención Médica', periodo: '31 dic 2026', estado: 'Vigente' },
  { id: 3, tipoBeneficiario: 'Todos los beneficiarios', nivel: 'Nivel 3', topeMaximo: '$ 1.000.000', descripcion: 'Nivel 3 de Atención Médica', periodo: '31 dic 2026', estado: 'Vigente' },
  { id: 4, tipoBeneficiario: 'Todos los beneficiarios', nivel: 'Nivel 4', topeMaximo: '$ 1.000.000', descripcion: 'Nivel 4 de Atención Médica', periodo: '31 dic 2026', estado: 'Vigente' },
  { id: 5, tipoBeneficiario: 'Todos los beneficiarios', nivel: 'Libre',   topeMaximo: '$ 1.000.000', descripcion: 'Sin límite de Tope - Casos especiales', periodo: '31 dic 2026', estado: 'Vigente' },
  { id: 6, tipoBeneficiario: 'Todos los beneficiarios', nivel: 'Libre',   topeMaximo: '$ 1.000.000', descripcion: 'Sin límite de Tope - Casos especiales', periodo: '31 dic 2026', estado: 'Vigente' },
];

app.get('/api/niveles', (req, res) => res.json(nivelesData));
app.post('/api/niveles', authenticateToken, (req, res) => {
  const nuevo = { id: Date.now(), ...req.body };
  nivelesData.push(nuevo);
  res.status(201).json(nuevo);
});
app.put('/api/niveles/:id', authenticateToken, (req, res) => {
  const id = Number(req.params.id);
  nivelesData = nivelesData.map(n => n.id === id ? { ...n, ...req.body } : n);
  res.json(nivelesData.find(n => n.id === id));
});
app.delete('/api/niveles/:id', authenticateToken, (req, res) => {
  const id = Number(req.params.id);
  nivelesData = nivelesData.filter(n => n.id !== id);
  res.json({ message: 'Nivel eliminado' });
});

// ──────────────────────────────────────────────
// 🏦 Topes Data
// ──────────────────────────────────────────────
let topesData = [
  { id: 1, codigo: 6, grupo: 'Ortopedia Maxilar',      nivel: 'Nivel 1', vigencia: '2026', valorPromedio: 'Sin tope',     resolucion: 'Res. 824', estado: 'Vigente' },
  { id: 2, codigo: 7, grupo: 'Honorarios',             nivel: 'Nivel 1', vigencia: '2026', valorPromedio: 'Sin tope',     resolucion: 'Res. 824', estado: 'Vigente' },
  { id: 3, codigo: 6, grupo: 'Otros reconocimientos',  nivel: 'Nivel 1', vigencia: '2026', valorPromedio: 'Sin tope',     resolucion: 'Res. 824', estado: 'Vigente' },
  { id: 4, codigo: 7, grupo: 'Tratamiento ambulatorio',nivel: 'Nivel 4', vigencia: '2026', valorPromedio: '$ 5.748.720',  resolucion: 'Res. 824', estado: 'Vigente' },
  { id: 5, codigo: 6, grupo: 'Hospitalización',        nivel: 'Nivel 1', vigencia: '2026', valorPromedio: 'Sin tope',     resolucion: 'Res. 824', estado: 'Vigente' },
];

app.get('/api/topes', (req, res) => res.json(topesData));
app.post('/api/topes', authenticateToken, (req, res) => {
  const nuevo = { id: Date.now(), ...req.body };
  topesData.push(nuevo);
  res.status(201).json(nuevo);
});
app.put('/api/topes/:id', authenticateToken, (req, res) => {
  const id = Number(req.params.id);
  topesData = topesData.map(t => t.id === id ? { ...t, ...req.body } : t);
  res.json(topesData.find(t => t.id === id));
});
app.delete('/api/topes/:id', authenticateToken, (req, res) => {
  const id = Number(req.params.id);
  topesData = topesData.filter(t => t.id !== id);
  res.json({ message: 'Tope eliminado' });
});

// ──────────────────────────────────────────────
// 👨‍👩‍👧 Parentescos Data
// ──────────────────────────────────────────────
let parentescosData = [
  { id: 1, orden: 1, nombre: 'Madre-Padre',     tipo: 'Nacional', activo: true },
  { id: 2, orden: 2, nombre: 'Cónyuge',         tipo: 'Nacional', activo: true },
  { id: 3, orden: 3, nombre: 'Hijo',            tipo: 'Nacional', activo: true },
  { id: 4, orden: 4, nombre: 'Hermano',         tipo: 'Nacional', activo: true },
  { id: 5, orden: 5, nombre: 'Hijos entenados', tipo: 'Nacional', activo: true },
  { id: 6, orden: 6, nombre: 'Otros',           tipo: 'Nacional', activo: true },
];

app.get('/api/parentescos', (req, res) => res.json(parentescosData));
app.post('/api/parentescos', authenticateToken, (req, res) => {
  const nuevo = { id: Date.now(), orden: parentescosData.length + 1, ...req.body };
  parentescosData.push(nuevo);
  res.status(201).json(nuevo);
});
app.put('/api/parentescos/:id', authenticateToken, (req, res) => {
  const id = Number(req.params.id);
  parentescosData = parentescosData.map(p => p.id === id ? { ...p, ...req.body } : p);
  res.json(parentescosData.find(p => p.id === id));
});
app.delete('/api/parentescos/:id', authenticateToken, (req, res) => {
  const id = Number(req.params.id);
  parentescosData = parentescosData.filter(p => p.id !== id);
  res.json({ message: 'Parentesco eliminado' });
});

// ──────────────────────────────────────────────
// 🚀 Servidor
// ──────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend corriendo en puerto ${PORT}`));

