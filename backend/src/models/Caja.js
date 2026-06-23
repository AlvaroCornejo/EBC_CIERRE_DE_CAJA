const mongoose = require('mongoose');

const cajaSchema = new mongoose.Schema(
  {
    sede: { type: mongoose.Schema.Types.ObjectId, ref: 'Sede', required: true },
    nombre: { type: String, required: true, trim: true }, // ej. "Caja 1", "Caja Oficina"
    esOficina: { type: Boolean, default: false },
    activo: { type: Boolean, default: true }
  },
  { timestamps: true }
);

cajaSchema.index({ sede: 1, nombre: 1 }, { unique: true });

module.exports = mongoose.model('Caja', cajaSchema);
