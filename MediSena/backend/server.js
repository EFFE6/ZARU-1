import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();
const app = express();

// 🔹 CORS: Permitir cualquier origen para depuración
app.use(cors({
  origin: '*',
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
  console.log('Login attempt:', user);

  if ((user === 'admin' && password === '1234') || (user === 'admin@g.com')) {
    const token = jwt.sign({ user }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    return res.json({ token });
  }
  res.status(401).json({ message: 'Credenciales inválidas' });
});

// ──────────────────────────────────────────────
// 🏥 Test de conexión
// ──────────────────────────────────────────────
app.get('/api/test', (req, res) => {
  console.log('Hit: /api/test');
  res.json({ message: 'API funcionando 🚀' });
});

// ──────────────────────────────────────────────
// 📊 Dashboard Data
// ──────────────────────────────────────────────
app.get('/api/dashboard/stats', authenticateToken, (req, res) => {
  console.log('Hit: /api/dashboard/stats');
  res.json({ beneficiarios: 120, citas: 35, ordenes: 18, profesionales: 12 });
});

app.get('/api/dashboard/citas', authenticateToken, (req, res) => {
  console.log('Hit: /api/dashboard/citas');
  const citas = [
    { id: 1, medico: "Dr. Juan Pérez", beneficiario: "Carlos Valencia", hora: "11:20 a.m", estado: "Activo" },
    { id: 2, medico: "Dra. Maria López", beneficiario: "Ana Garcia", hora: "02:00 p.m", estado: "Activo" },
    { id: 3, medico: "Dr. Roberto Diaz", beneficiario: "Lucas Gomez", hora: "08:30 a.m", estado: "Completado" },
  ];
  res.json(citas);
});

// ──────────────────────────────────────────────
// 👥 Usuarios Data
// ──────────────────────────────────────────────
app.get('/api/usuarios', (req, res) => {
  console.log('Hit: /api/usuarios');
  const usuarios = [
    { id: 1, nombre: 'Paulette Goya', username: 'PGoya', rol: 'Administrador', email: 'Pgoya@example.com', regional: '63 - Dirección Regional Centro de Comercio y Servicios', ultimoAcceso: '31 dic 2025', activo: true, tipoUsuario: 'T', fechaCreacion: '01 ene 2026', fechaModificacion: '31 dic 2026', codigoDependencia: '1000', telefono: '000', avatarInitials: 'PG' },
    { id: 2, nombre: 'Carlos Valencia', username: 'CValencia', rol: 'Usuario', email: 'Cavalencia@example.com', regional: '63', ultimoAcceso: '31 dic 2025', activo: false, tipoUsuario: 'U', fechaCreacion: '01 ene 2026', fechaModificacion: '31 dic 2026', codigoDependencia: '1001', telefono: '000', avatarInitials: 'PG' },
  ];
  res.json(usuarios);
});

// ──────────────────────────────────────────────
// 📄 Resoluciones Data
// ──────────────────────────────────────────────
app.get('/api/resoluciones', (req, res) => {
  console.log('Hit: /api/resoluciones');
  const resoluciones = [
    { id: 1, numero: "824", fecha: "01 ene 2024", descripcion: "Resolución 824 - Vigencia 2024", estado: "Vigente", vigencia: "01 ene 2024 - 31 dic 2024" },
    { id: 2, numero: "824", fecha: "01 ene 2023", descripcion: "Resolución 824 - Vigencia 2023", estado: "Vencido", vigencia: "01 ene 2023 - 31 dic 2023" },
  ];
  res.json(resoluciones);
});

// ──────────────────────────────────────────────
// 📐 Niveles Data
// ──────────────────────────────────────────────
let nivelesData = [
  { id: 1, tipoBeneficiario: 'Todos los beneficiarios', nivel: 'Nivel 1', topeMaximo: '$ 1.000.000', descripcion: 'Nivel 1 de Atención Médica', periodo: '31 dic 2026', estado: 'Vigente' },
  { id: 2, tipoBeneficiario: 'Todos los beneficiarios', nivel: 'Nivel 2', topeMaximo: '$ 1.000.000', descripcion: 'Nivel 2 de Atención Médica', periodo: '31 dic 2026', estado: 'Vigente' },
];

app.get('/api/niveles', (req, res) => {
  console.log('Hit: /api/niveles');
  res.json(nivelesData);
});

app.post('/api/niveles', authenticateToken, (req, res) => {
  const nuevo = { id: Date.now(), ...req.body };
  nivelesData.push(nuevo);
  res.status(201).json(nuevo);
});

// ──────────────────────────────────────────────
// 🏦 Topes Data
// ──────────────────────────────────────────────
let topesData = [
  { id: 1, codigo: 6, grupo: 'Ortopedia Maxilar', nivel: 'Nivel 1', vigencia: '2026', valorPromedio: 'Sin tope', resolucion: 'Res. 824', estado: 'Vigente' },
];

app.get('/api/topes', (req, res) => {
  console.log('Hit: /api/topes');
  res.json(topesData);
});

app.post('/api/topes', authenticateToken, (req, res) => {
  const nuevo = { id: Date.now(), ...req.body };
  topesData.push(nuevo);
  res.status(201).json(nuevo);
});

// ──────────────────────────────────────────────
// 👨‍👩‍👧 Parentescos Data
// ──────────────────────────────────────────────
let parentescosData = [
  { id: 1, orden: 1, nombre: 'Madre-Padre', tipo: 'Nacional', activo: true },
];

app.get('/api/parentescos', (req, res) => {
  console.log('Hit: /api/parentescos');
  res.json(parentescosData);
});

// ──────────────────────────────────────────────
// 🚀 Servidor
// ──────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend corriendo en puerto ${PORT}`));
