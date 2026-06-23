const mongoose = require('mongoose');

// Conteo fisico que el manager hace del efectivo presente en Caja Oficina en un momento dado.
const conteoCajaOficinaSchema = new mongoose.Schema(
  {
    sede: { type: mongoose.Schema.Types.ObjectId, ref: 'Sede', required: true },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    soles: { type: Number, required: true, min: 0 },
    dolares: { type: Number, required: true, min: 0 },
    fechaHora: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ConteoCajaOficina', conteoCajaOficinaSchema);
