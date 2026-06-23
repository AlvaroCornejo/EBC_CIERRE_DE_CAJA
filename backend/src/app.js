const express = require('express');
const cors = require('cors');
require('./models');
const authRoutes = require('./routes/authRoutes');
const cierreCajaRoutes = require('./routes/cierreCajaRoutes');
const propinaRoutes = require('./routes/propinaRoutes');
const catalogoRoutes = require('./routes/catalogoRoutes');
const managerRoutes = require('./routes/managerRoutes');
const tesoreroRoutes = require('./routes/tesoreroRoutes');
const contadorRoutes = require('./routes/contadorRoutes');
const gerenteRoutes = require('./routes/gerenteRoutes');
const adminRoutes = require('./routes/adminRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/cierres-caja', cierreCajaRoutes);
app.use('/api/propinas', propinaRoutes);
app.use('/api', catalogoRoutes);
app.use('/api/manager', managerRoutes);
app.use('/api/tesorero', tesoreroRoutes);
app.use('/api/contador', contadorRoutes);
app.use('/api/gerente', gerenteRoutes);
app.use('/api/admin', adminRoutes);

app.use(errorHandler);

module.exports = app;
