const mongoose = require('mongoose');

// El contador verifica que el total depositado al banco en un periodo
// cuadre con el total de venta en efectivo reportada por los cajeros en ese mismo periodo.
const conciliacionContableSchema = new mongoose.Schema(
  {
    sede: { type: mongoose.Schema.Types.ObjectId, ref: 'Sede', required: true },
    contador: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    fechaDesde: { type: String, required: true },
    fechaHasta: { type: String, required: true },

    totalVentaEfectivoSoles: { type: Number, required: true },
    totalVentaEfectivoDolares: { type: Number, required: true },
    totalDepositadoSoles: { type: Number, required: true },
    totalDepositadoDolares: { type: Number, required: true },
    diferenciaSoles: { type: Number, required: true },
    diferenciaDolares: { type: Number, required: true },

    comentario: { type: String, trim: true },
    fechaHora: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ConciliacionContable', conciliacionContableSchema);
