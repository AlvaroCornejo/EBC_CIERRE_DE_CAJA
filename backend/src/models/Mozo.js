const mongoose = require('mongoose');

const mozoSchema = new mongoose.Schema(
  {
    sede: { type: mongoose.Schema.Types.ObjectId, ref: 'Sede', required: true },
    nombre: { type: String, required: true, trim: true },
    documento: { type: String, trim: true },
    activo: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Mozo', mozoSchema);
