const mongoose = require('mongoose');

// Deposito que el manager hace desde Caja Oficina al banco.
const depositoBancoSchema = new mongoose.Schema(
  {
    sede: { type: mongoose.Schema.Types.ObjectId, ref: 'Sede', required: true },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    fecha: { type: String, required: true }, // "YYYY-MM-DD"
    soles: { type: Number, min: 0, default: 0 },
    dolares: { type: Number, min: 0, default: 0 },
    bancoDeclarado: { type: String, trim: true }, // banco al que el manager dice haber depositado

    estado: { type: String, enum: ['pendiente', 'confirmado'], default: 'pendiente' },

    // El tesorero compara contra el movimiento bancario real y confirma con estos datos.
    confirmacionTesorero: {
      tesorero: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
      banco: { type: String, trim: true },
      numeroSede: { type: String, trim: true },
      fechaHora: { type: Date }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('DepositoBanco', depositoBancoSchema);
