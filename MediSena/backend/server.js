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
let usuariosData = [
  { id: 1, nombre: 'Paulette Goya', username: 'PGoya', rol: 'Administrador', email: 'Pgoya@example.com', regional: '63 - Dirección Regional Centro de Comercio y Servicios', ultimoAcceso: '31 dic 2025', activo: true, tipoUsuario: 'T', fechaCreacion: '01 ene 2026', fechaModificacion: '31 dic 2026', codigoDependencia: '1000', telefono: '000', avatarInitials: 'PG' },
  { id: 2, nombre: 'Carlos Valencia', username: 'CValencia', rol: 'Usuario', email: 'Cavalencia@example.com', regional: '63', ultimoAcceso: '31 dic 2025', activo: false, tipoUsuario: 'U', fechaCreacion: '01 ene 2026', fechaModificacion: '31 dic 2026', codigoDependencia: '1001', telefono: '000', avatarInitials: 'PG' },
];

app.get('/api/usuarios', (req, res) => {
  console.log('Hit: /api/usuarios');
  res.json(usuariosData);
});

app.put('/api/usuarios/:id', authenticateToken, (req, res) => {
  usuariosData = usuariosData.map(u => String(u.id) === req.params.id ? { ...u, ...req.body } : u);
  res.json({ success: true });
});

app.delete('/api/usuarios/:id', authenticateToken, (req, res) => {
  usuariosData = usuariosData.filter(u => String(u.id) !== req.params.id);
  res.json({ success: true });
});

// ──────────────────────────────────────────────
// 📄 Resoluciones Data
// ──────────────────────────────────────────────
let resolucionesData = [
  { id: 1, numero: "824", fecha: "01 ene 2024", descripcion: "Resolución 824 - Vigencia 2024", estado: "Vigente", vigencia: "01 ene 2024 - 31 dic 2024" },
  { id: 2, numero: "824", fecha: "01 ene 2023", descripcion: "Resolución 824 - Vigencia 2023", estado: "Vencido", vigencia: "01 ene 2023 - 31 dic 2023" },
];

app.get('/api/resoluciones', (req, res) => {
  console.log('Hit: /api/resoluciones');
  res.json(resolucionesData);
});

app.post('/api/resoluciones', authenticateToken, (req, res) => {
  const nuevo = { id: Date.now(), ...req.body };
  resolucionesData.push(nuevo);
  res.status(201).json(nuevo);
});

app.put('/api/resoluciones/:id', authenticateToken, (req, res) => {
  resolucionesData = resolucionesData.map(r => String(r.id) === req.params.id ? { ...r, ...req.body } : r);
  res.json({ success: true });
});

app.delete('/api/resoluciones/:id', authenticateToken, (req, res) => {
  resolucionesData = resolucionesData.filter(r => String(r.id) !== req.params.id);
  res.json({ success: true });
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

app.put('/api/niveles/:id', authenticateToken, (req, res) => {
  nivelesData = nivelesData.map(n => String(n.id) === req.params.id ? { ...n, ...req.body } : n);
  res.json({ success: true });
});

app.delete('/api/niveles/:id', authenticateToken, (req, res) => {
  nivelesData = nivelesData.filter(n => String(n.id) !== req.params.id);
  res.json({ success: true });
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

app.put('/api/topes/:id', authenticateToken, (req, res) => {
  topesData = topesData.map(t => String(t.id) === req.params.id ? { ...t, ...req.body } : t);
  res.json({ success: true });
});

app.delete('/api/topes/:id', authenticateToken, (req, res) => {
  topesData = topesData.filter(t => String(t.id) !== req.params.id);
  res.json({ success: true });
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

app.put('/api/parentescos/:id', authenticateToken, (req, res) => {
  parentescosData = parentescosData.map(p => String(p.id) === req.params.id ? { ...p, ...req.body } : p);
  res.json({ success: true });
});

app.delete('/api/parentescos/:id', authenticateToken, (req, res) => {
  parentescosData = parentescosData.filter(p => String(p.id) !== req.params.id);
  res.json({ success: true });
});

// ──────────────────────────────────────────────
// ⚙️ Parámetros Data
// ──────────────────────────────────────────────
let parametrosData = [
  { id: 1, vigencia: '2025', regional: 'Regional Centro de Comercio y', resolucion: '824', razonSocial: 'Servicio Médico Asistencial - SENA', porcentajeNormal: '8%', vobos: 1 },
  { id: 2, vigencia: '2025', regional: 'Regional Centro de Comercio y', resolucion: '824', razonSocial: 'Servicio Médico Asistencial - SENA', porcentajeNormal: '8%', vobos: 8 },
  { id: 3, vigencia: '2025', regional: 'Regional Centro de Comercio y', resolucion: '824', razonSocial: 'Servicio Médico Asistencial - SENA', porcentajeNormal: '8%', vobos: 1 },
  { id: 4, vigencia: '2025', regional: 'Regional Centro de Comercio y', resolucion: '824', razonSocial: 'Servicio Médico Asistencial - SENA', porcentajeNormal: '8%', vobos: 8 },
  { id: 5, vigencia: '2025', regional: 'Regional Centro de Comercio y', resolucion: '824', razonSocial: 'Servicio Médico Asistencial - SENA', porcentajeNormal: '8%', vobos: 1 },
];

app.get('/api/parametros', (req, res) => {
  console.log('Hit: /api/parametros');
  res.json(parametrosData);
});

app.put('/api/parametros/:id', authenticateToken, (req, res) => {
  parametrosData = parametrosData.map(p => String(p.id) === req.params.id ? { ...p, ...req.body } : p);
  res.json({ success: true });
});

app.delete('/api/parametros/:id', authenticateToken, (req, res) => {
  parametrosData = parametrosData.filter(p => String(p.id) !== req.params.id);
  res.json({ success: true });
});

// ──────────────────────────────────────────────
// 🏥 Sub-especialidades Data
// ──────────────────────────────────────────────
let subespecialidadesData = [
  { id: 1, consecutivo: 1, nombre: 'Alergias', contratista: 'Nombre contratista', nit: '100021', regional: '63', medicamentos: '× No' },
  { id: 2, consecutivo: 1, nombre: 'Alergias', contratista: 'Nombre contratista', nit: '100021', regional: '63', medicamentos: '× No' },
  { id: 3, consecutivo: 1, nombre: 'Aparatos ortopedicos', contratista: 'Nombre contratista', nit: '100021', regional: '63', medicamentos: '× No' },
  { id: 4, consecutivo: 1, nombre: 'Cardiologia', contratista: 'Nombre contratista', nit: '100021', regional: '63', medicamentos: '× No' },
  { id: 5, consecutivo: 1, nombre: 'Cardiologia', contratista: 'Nombre contratista', nit: '100021', regional: '63', medicamentos: '× No' },
];

app.get('/api/subespecialidades', (req, res) => {
  console.log('Hit: /api/subespecialidades');
  res.json(subespecialidadesData);
});

app.put('/api/subespecialidades/:id', authenticateToken, (req, res) => {
  subespecialidadesData = subespecialidadesData.map(s => String(s.id) === req.params.id ? { ...s, ...req.body } : s);
  res.json({ success: true });
});

app.delete('/api/subespecialidades/:id', authenticateToken, (req, res) => {
  subespecialidadesData = subespecialidadesData.filter(s => String(s.id) !== req.params.id);
  res.json({ success: true });
});

// ──────────────────────────────────────────────
// 🏥 Órdenes de Atención
// ──────────────────────────────────────────────
let ordenesAtencionData = [
  { id: 1, numero: 668, vigencia: 2026, beneficiario: 'ROSALINA PALMA SANDOVAL', contratista: 'CLAUDIA BASSIL AMIN', especialidad: 0, fecha: '21/2/2026', estado: 'A', tipoAtencion: 'Consulta General', observaciones: 'SE AUTORIZA CONSULTA ESPECIALIZADA POR DERMATOLOGIA. TARIFA PACTADA', funcionarioSolicitante: '', medicoTratante: '', diagnostico: '', valorEstimado: '' },
  { id: 2, numero: 668, vigencia: 2026, beneficiario: 'ROSALINA PALMA SANDOVAL', contratista: 'ABRIL GALEANO GIOVANNI', especialidad: 0, fecha: '21/2/2026', estado: 'A', tipoAtencion: 'Control', observaciones: '', funcionarioSolicitante: '', medicoTratante: '', diagnostico: '', valorEstimado: '' },
  { id: 3, numero: 668, vigencia: 2026, beneficiario: 'ROSALINA PALMA SANDOVAL', contratista: 'ABRIL GALEANO GIOVANNI', especialidad: 0, fecha: '21/2/2026', estado: 'A', tipoAtencion: 'Urgencia', observaciones: '', funcionarioSolicitante: '', medicoTratante: '', diagnostico: '', valorEstimado: '' },
  { id: 4, numero: 667, vigencia: 2026, beneficiario: 'ROSALINA PALMA SANDOVAL', contratista: 'Piedad Viana Marzola', especialidad: 0, fecha: '21/2/2026', estado: 'A', tipoAtencion: 'Especializada', observaciones: 'SE AUTORIZA CONSULTA ESPECIALIZADA POR ORTOPEDIA. TARIFA PACTADA', funcionarioSolicitante: '', medicoTratante: '', diagnostico: '', valorEstimado: '' },
  { id: 5, numero: 667, vigencia: 2026, beneficiario: 'ROSALINA PALMA SANDOVAL', contratista: 'DURANGO LARIOS MARIA BERNARDA', especialidad: 0, fecha: '21/2/2026', estado: 'A', tipoAtencion: 'Consulta General', observaciones: '', funcionarioSolicitante: '', medicoTratante: '', diagnostico: '', valorEstimado: '' },
  { id: 6, numero: 667, vigencia: 2026, beneficiario: 'ROSALINA PALMA SANDOVAL', contratista: 'CLAUDIA BASSIL AMIN', especialidad: 0, fecha: '21/2/2026', estado: 'A', tipoAtencion: 'Control', observaciones: '', funcionarioSolicitante: '', medicoTratante: '', diagnostico: '', valorEstimado: '' },
  { id: 7, numero: 666, vigencia: 2026, beneficiario: 'CARLOS MENDEZ RUIZ', contratista: 'ABRIL GALEANO GIOVANNI', especialidad: 1, fecha: '20/2/2026', estado: 'I', tipoAtencion: 'Urgencia', observaciones: '', funcionarioSolicitante: '', medicoTratante: '', diagnostico: '', valorEstimado: '' },
  { id: 8, numero: 665, vigencia: 2026, beneficiario: 'MARIA GARCIA LOPEZ', contratista: 'Piedad Viana Marzola', especialidad: 2, fecha: '19/2/2026', estado: 'P', tipoAtencion: 'Especializada', observaciones: '', funcionarioSolicitante: '', medicoTratante: '', diagnostico: '', valorEstimado: '' },
  { id: 9, numero: 664, vigencia: 2025, beneficiario: 'PEDRO RAMIREZ TORRES', contratista: 'DURANGO LARIOS MARIA BERNARDA', especialidad: 0, fecha: '18/2/2026', estado: 'A', tipoAtencion: 'Consulta General', observaciones: '', funcionarioSolicitante: '', medicoTratante: '', diagnostico: '', valorEstimado: '' },
  { id: 10, numero: 663, vigencia: 2025, beneficiario: 'ANA MARTINEZ SILVA', contratista: 'CLAUDIA BASSIL AMIN', especialidad: 3, fecha: '17/2/2026', estado: 'A', tipoAtencion: 'Control', observaciones: '', funcionarioSolicitante: '', medicoTratante: '', diagnostico: '', valorEstimado: '' },
];

app.get('/api/ordenes-atencion', (req, res) => {
  console.log('Hit: /api/ordenes-atencion');
  res.json(ordenesAtencionData);
});

app.put('/api/ordenes-atencion/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const idx = ordenesAtencionData.findIndex(o => o.id === id);
  if (idx === -1) return res.status(404).json({ message: 'Orden no encontrada' });
  ordenesAtencionData[idx] = { ...ordenesAtencionData[idx], ...req.body };
  res.json(ordenesAtencionData[idx]);
});

// ──────────────────────────────────────────────
// 💰 Cuentas de Cobro
// ──────────────────────────────────────────────
let cuentasCobroData = [
  { id: 1, numero: 4623, contratista: '176041', periodo: '2015-10-01T00:00:00.000Z', fecha: '14/9/2015', valor: '$70000', estado: 'PENDIENTE' },
  { id: 2, numero: 4626, contratista: '176041', periodo: '2015-10-01T00:00:00.000Z', fecha: '2/9/2015', valor: '$120737', estado: 'PENDIENTE' },
  { id: 3, numero: 4627, contratista: '176041', periodo: '2015-10-01T00:00:00.000Z', fecha: '2/9/2015', valor: '$70000', estado: 'PENDIENTE' },
  { id: 4, numero: 4630, contratista: '176041', periodo: '2015-10-01T00:00:00.000Z', fecha: '9/9/2015', valor: '$70000', estado: 'PENDIENTE' },
  { id: 5, numero: 4631, contratista: '176041', periodo: '2015-10-01T00:00:00.000Z', fecha: '9/9/2015', valor: '$80000', estado: 'PENDIENTE' },
];

app.get('/api/cuentas-cobro', (req, res) => {
  console.log('Hit: /api/cuentas-cobro');
  res.json(cuentasCobroData);
});

app.post('/api/cuentas-cobro', (req, res) => {
  const nueva = { id: Date.now(), ...req.body };
  cuentasCobroData.push(nueva);
  res.status(201).json(nueva);
});

// ──────────────────────────────────────────────
// ✅ Aprobar / rechazar Cuenta de Cobro
// ──────────────────────────────────────────────
app.patch('/api/cuentas-cobro/:id/estado', (req, res) => {
  const id = parseInt(req.params.id);
  const { estado } = req.body; // 'APROBADA' | 'RECHAZADA' | 'PENDIENTE'
  const idx = cuentasCobroData.findIndex(c => c.id === id);
  if (idx === -1) return res.status(404).json({ message: 'Cuenta no encontrada' });
  cuentasCobroData[idx].estado = estado;
  res.json(cuentasCobroData[idx]);
});

// ──────────────────────────────────────────────
// 📋 Relación de Pagos
// ──────────────────────────────────────────────
let relacionPagosData = [
  { id: 1,  numero: 1001, contratista: 'CLAUDIA BASSIL AMIN',           cuentaCobro: 'CC-4623', fechaPago: '30/09/2015', valor: '$70.000',   formaPago: 'Transferencia', estado: 'PAGADO' },
  { id: 2,  numero: 1002, contratista: 'CLAUDIA BASSIL AMIN',           cuentaCobro: 'CC-4626', fechaPago: '30/09/2015', valor: '$120.737',  formaPago: 'Transferencia', estado: 'PAGADO' },
  { id: 3,  numero: 1003, contratista: 'ABRIL GALEANO GIOVANNI',        cuentaCobro: 'CC-4627', fechaPago: '01/10/2015', valor: '$70.000',   formaPago: 'Cheque',        estado: 'PAGADO' },
  { id: 4,  numero: 1004, contratista: 'Piedad Viana Marzola',          cuentaCobro: 'CC-4630', fechaPago: '05/10/2015', valor: '$70.000',   formaPago: 'Transferencia', estado: 'PAGADO' },
  { id: 5,  numero: 1005, contratista: 'DURANGO LARIOS MARIA BERNARDA', cuentaCobro: 'CC-4631', fechaPago: '05/10/2015', valor: '$80.000',   formaPago: 'Transferencia', estado: 'PAGADO' },
  { id: 6,  numero: 1006, contratista: 'CLAUDIA BASSIL AMIN',           cuentaCobro: 'CC-4632', fechaPago: '12/10/2015', valor: '$95.000',   formaPago: 'Transferencia', estado: 'PENDIENTE' },
  { id: 7,  numero: 1007, contratista: 'ABRIL GALEANO GIOVANNI',        cuentaCobro: 'CC-4635', fechaPago: '15/10/2015', valor: '$142.500',  formaPago: 'Transferencia', estado: 'PAGADO' },
  { id: 8,  numero: 1008, contratista: 'Piedad Viana Marzola',          cuentaCobro: 'CC-4638', fechaPago: '20/10/2015', valor: '$60.000',   formaPago: 'Cheque',        estado: 'PAGADO' },
  { id: 9,  numero: 1009, contratista: 'DURANGO LARIOS MARIA BERNARDA', cuentaCobro: 'CC-4641', fechaPago: '25/10/2015', valor: '$110.000',  formaPago: 'Transferencia', estado: 'RECHAZADO' },
  { id: 10, numero: 1010, contratista: 'CLAUDIA BASSIL AMIN',           cuentaCobro: 'CC-4645', fechaPago: '28/10/2015', valor: '$88.000',   formaPago: 'Transferencia', estado: 'PAGADO' },
  { id: 11, numero: 1011, contratista: 'ABRIL GALEANO GIOVANNI',        cuentaCobro: 'CC-4648', fechaPago: '31/10/2015', valor: '$53.200',   formaPago: 'Transferencia', estado: 'PENDIENTE' },
  { id: 12, numero: 1012, contratista: 'Piedad Viana Marzola',          cuentaCobro: 'CC-4651', fechaPago: '05/11/2015', valor: '$200.000',  formaPago: 'Transferencia', estado: 'PAGADO' },
];

app.get('/api/relacion-pagos', (req, res) => {
  console.log('Hit: /api/relacion-pagos');
  res.json(relacionPagosData);
});

// ──────────────────────────────────────────────
// 🚀 Servidor
// ──────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend corriendo en puerto ${PORT}`));
