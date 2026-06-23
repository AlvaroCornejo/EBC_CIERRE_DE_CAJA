const mongoose = require('mongoose');

const propinaSchema = new mongoose.Schema(
  {
    sede: { type: mongoose.Schema.Types.ObjectId, ref: 'Sede', required: true },
    mozo: { type: mongoose.Schema.Types.ObjectId, ref: 'Mozo', required: true },
    fecha: { type: String, required: true }, // "YYYY-MM-DD", dia de trabajo (ver regla de corte 00-03h)
    soles: { type: Number, min: 0, default: 0 },
    dolares: { type: Number, min: 0, default: 0 },
    medio: { type: String, enum: ['efectivo', 'tarjeta'] }, // opcional
    referencia: { type: String, trim: true }, // opcional
    registradoEn: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

propinaSchema.index({ mozo: 1, fecha: 1 });

module.exports = mongoose.model('Propina', propinaSchema);
