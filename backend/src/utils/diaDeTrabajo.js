// Si la hora local esta entre 00:00 y 03:00 (exclusivo), el dia de trabajo es el dia anterior.
function diaDeTrabajo(fecha = new Date()) {
  const d = new Date(fecha);
  if (d.getHours() < 3) {
    d.setDate(d.getDate() - 1);
  }
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

module.exports = diaDeTrabajo;
