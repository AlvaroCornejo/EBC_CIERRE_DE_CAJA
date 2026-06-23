const mongoose = require('mongoose');

const ROLES = ['mozo', 'cajero', 'manager', 'supervisor', 'tesorero', 'contador', 'gerente', 'administrador'];

const usuarioSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    rol: { type: String, enum: ROLES, required: true },
    // mozo, cajero y manager: una sola sede. supervisor/tesorero/contador/gerente: una o varias. administrador: ninguna (acceso total).
    sedes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sede' }],
    // solo aplica si rol === 'mozo': vincula este usuario con su registro en la tabla Mozo.
    mozo: { type: mongoose.Schema.Types.ObjectId, ref: 'Mozo' },
    activo: { type: Boolean, default: true }
  },
  { timestamps: true }
);

usuarioSchema.pre('validate', function (next) {
  if (['mozo', 'cajero', 'manager'].includes(this.rol) && this.sedes.length > 1) {
    return next(new Error(`El rol ${this.rol} solo puede tener una sede asignada`));
  }
  if (this.rol === 'mozo' && !this.mozo) {
    return next(new Error('El rol mozo debe estar vinculado a un registro de Mozo'));
  }
  next();
});

usuarioSchema.statics.ROLES = ROLES;

module.exports = mongoose.model('Usuario', usuarioSchema);
