// Centraliza el registro de todos los modelos para que mongoose pueda
// resolver referencias (ref: 'Sede', etc.) sin importar el orden de carga.
require('./Sociedad');
require('./Sede');
require('./Mozo');
require('./Turno');
require('./Caja');
require('./Usuario');
require('./CierreCaja');
require('./Propina');
require('./DepositoBanco');
require('./ConteoCajaOficina');
require('./ConciliacionContable');
