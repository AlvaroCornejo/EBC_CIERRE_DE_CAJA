const mongoose = require('mongoose');

const turnoSchema = new mongoose.Schema(
  {
    sede: { type: mongoose.Schema.Types.ObjectId, ref: 'Sede', required: true },
    nombre: { type: String, required: true, trim: true }, // ej. "Mañana", "Tarde", "Noche"
    horaInicio: { type: String }, // "HH:mm"
    horaFin: { type: String },
    activo: { type: Boolean, default: true }
  },
  { timestamps: true }
);

turnoSchema.index({ sede: 1, nombre: 1 }, { unique: true });

module.exports = mongoose.model('Turno', turnoSchema);
