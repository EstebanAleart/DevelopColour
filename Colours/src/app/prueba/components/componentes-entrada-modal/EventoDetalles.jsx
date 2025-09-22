export default function EventoDetalles({ evento }) {
  return (
    <div className="mb-3 p-2 bg-transparent border border-[#BF8D6B] rounded text-xs">
      <h3 className="text-[#BF8D6B] font-medium">Detalles del Evento</h3>
      <p className="text-white mt-1">{evento.nombre}</p>
      <div className="grid grid-cols-2 gap-2 mt-2 text-gray-300">
        <div>
          Capacidad:{" "}
          <span className="text-[#BF8D6B]">
            {evento.capacidad || "Sin límite"}
          </span>
        </div>
        <div>
          Salón:{" "}
          <span className="text-[#BF8D6B]">
            {evento.salon || "Sin asignar"}
          </span>
        </div>
      </div>
    </div>
  );
}
