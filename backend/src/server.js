require('dotenv').config();

// Algunos resolvers DNS locales no soportan registros SRV (usados por mongodb+srv://).
// 8.8.8.8 si funciona; se agrega antes de los servidores del sistema.
const dns = require('dns');
dns.setServers(['8.8.8.8', ...dns.getServers()]);

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 4000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Servidor escuchando en puerto ${PORT}`));
  })
  .catch((err) => {
    console.error('Error conectando a MongoDB:', err.message);
    process.exit(1);
  });
