const mongoose = require('mongoose');

// Un registro por sede + caja + turno + fecha (dia de trabajo, no de calendario).
const cierreCajaSchema = new mongoose.Schema(
  {
    sede: { type: mongoose.Schema.Types.ObjectId, ref: 'Sede', required: true },
    caja: { type: mongoose.Schema.Types.ObjectId, ref: 'Caja', required: true },
    turno: { type: mongoose.Schema.Types.ObjectId, ref: 'Turno', required: true },
    fecha: { type: String, required: true }, // "YYYY-MM-DD"
    cajero: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },

    estado: { type: String, enum: ['abierto', 'cerrado', 'aprobado'], default: 'abierto' },

    apertura: {
      soles: { type: Number, required: true, min: 0 },
      dolares: { type: Number, required: true, min: 0 },
      fechaHora: { type: Date, default: Date.now }
    },

    cierre: {
      ventaEfectivoSoles: { type: Number, min: 0 },
      ventaEfectivoDolares: { type: Number, min: 0 },
      tipSoles: { type: Number, min: 0 },
      tipDolares: { type: Number, min: 0 },
      vueltoSolesPorPagosDolares: { type: Number, min: 0 },
      enviadoOficinaSoles: { type: Number, min: 0 },
      enviadoOficinaDolares: { type: Number, min: 0 },
      efectivoCierreSoles: { type: Number, min: 0 },
      efectivoCierreDolares: { type: Number, min: 0 },
      fechaHora: { type: Date }
    },

    aprobacion: {
      supervisor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
      comentario: { type: String, trim: true },
      fechaHora: { type: Date }
    },

    // Cada vez que un supervisor rechaza, queda aqui el motivo; el cierre vuelve a 'abierto' para que el cajero lo corrija.
    rechazos: [{
      supervisor: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
      motivo: { type: String, trim: true },
      fechaHora: { type: Date, default: Date.now }
    }],

    // El manager confirma cuanto recibio realmente en Caja Oficina del efectivo que el cajero declaro haber enviado.
    recepcionOficina: {
      manager: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
      soles: { type: Number, min: 0 },
      dolares: { type: Number, min: 0 },
      fechaHora: { type: Date }
    }
  },
  { timestamps: true }
);

// No se puede abrir un mismo dia/turno/caja dos veces.
cierreCajaSchema.index({ caja: 1, turno: 1, fecha: 1 }, { unique: true });

module.exports = mongoose.model('CierreCaja', cierreCajaSchema);
