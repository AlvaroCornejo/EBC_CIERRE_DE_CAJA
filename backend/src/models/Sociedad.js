const mongoose = require('mongoose');

const sociedadSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    ruc: { type: String, trim: true },
    activo: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Sociedad', sociedadSchema);
