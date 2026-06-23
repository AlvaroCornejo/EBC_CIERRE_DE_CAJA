const mongoose = require('mongoose');

const sedeSchema = new mongoose.Schema(
  {
    sociedad: { type: mongoose.Schema.Types.ObjectId, ref: 'Sociedad', required: true },
    nombre: { type: String, required: true, trim: true },
    // Tope de efectivo permitido en Caja Oficina; al superarlo se debe avisar al administrador para depositar al banco.
    limiteEfectivoSoles: { type: Number, min: 0 },
    limiteEfectivoDolares: { type: Number, min: 0 },
    activo: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Sede', sedeSchema);
