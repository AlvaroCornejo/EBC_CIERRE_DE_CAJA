const mongoose = require('mongoose');
const CierreCaja = require('../models/CierreCaja');
const DepositoBanco = require('../models/DepositoBanco');

// Saldo actual en Caja Oficina = todo lo que el manager confirmo haber recibido de los cajeros
// menos todo lo que ya deposito al banco.
async function calcularSaldoCajaOficina(sedeId) {
  const sede = new mongoose.Types.ObjectId(sedeId);

  const [recibido] = await CierreCaja.aggregate([
    { $match: { sede, 'recepcionOficina.manager': { $exists: true } } },
    { $group: { _id: null, soles: { $sum: '$recepcionOficina.soles' }, dolares: { $sum: '$recepcionOficina.dolares' } } }
  ]);

  const [depositado] = await DepositoBanco.aggregate([
    { $match: { sede } },
    { $group: { _id: null, soles: { $sum: '$soles' }, dolares: { $sum: '$dolares' } } }
  ]);

  return {
    soles: (recibido?.soles || 0) - (depositado?.soles || 0),
    dolares: (recibido?.dolares || 0) - (depositado?.dolares || 0)
  };
}

module.exports = { calcularSaldoCajaOficina };
