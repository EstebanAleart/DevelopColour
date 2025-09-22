export default function ResumenDisponibilidad({
  cantidadTotal,
  subtipos,
  calculateAvailableForGeneral,
}) {
  const totalSubtipos = subtipos.reduce(
    (total, subtipo) => total + parseInt(subtipo.cantidad_disponible),
    0
  );

  return (
    <div className="mt-3 p-2 bg-[#BF8D6B]/20 border border-[#BF8D6B] rounded text-[#BF8D6B] text-xs">
      <p>
        <strong>Resumen de disponibilidad:</strong>
      </p>
      <p>Cantidad total: {cantidadTotal}</p>
      <p>Asignado a subtipos: {totalSubtipos}</p>
      <p>Disponible para venta general: {calculateAvailableForGeneral()}</p>
    </div>
  );
}
