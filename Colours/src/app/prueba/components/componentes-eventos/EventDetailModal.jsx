import { X, Info } from "lucide-react";
import { formatDateTime } from "../../eventos/utils/utils";

export default function EventDetailModal({
  eventoDetalle,
  entradasDetalle,
  loadingDetail,
  loadingEntradas,
  onClose,
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] rounded-lg p-4 w-full max-w-3xl shadow-lg max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Info className="h-5 w-5 text-[#BF8D6B]" /> Detalle del Evento
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto" style={{ maxHeight: "65vh" }}>
          {loadingDetail ? (
            <div className="text-center py-6 text-gray-300 text-sm">
              Cargando detalle...
            </div>
          ) : eventoDetalle?.error ? (
            <div className="p-2 bg-red-900/50 text-red-300 text-xs rounded border border-red-700 mb-3">
              {eventoDetalle.error}
            </div>
          ) : eventoDetalle ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-white">
              <div className="space-y-3">
                {(eventoDetalle.image || eventoDetalle.imagen) && (
                  <div>
                    <span className="block text-sm text-[#BF8D6B] mb-1">
                      Imagen
                    </span>
                    <div className="p-2 bg-transparent rounded border border-[#BF8D6B] flex justify-center">
                      <img
                        src={eventoDetalle.image || eventoDetalle.imagen}
                        alt="Imagen del evento"
                        className="max-h-40 rounded"
                        style={{ maxWidth: "100%", objectFit: "contain" }}
                      />
                    </div>
                  </div>
                )}
                <div>
                  <span className="block text-sm text-[#BF8D6B] mb-1">
                    Nombre
                  </span>
                  <div className="p-2 bg-transparent rounded border border-[#BF8D6B] text-sm">
                    {eventoDetalle.nombre}
                  </div>
                </div>
                <div>
                  <span className="block text-sm text-[#BF8D6B] mb-1">
                    Descripción
                  </span>
                  <div className="p-2 bg-transparent rounded border border-[#BF8D6B] text-sm">
                    {eventoDetalle.descripcion}
                  </div>
                </div>
                <div>
                  <span className="block text-sm text-[#BF8D6B] mb-1">
                    Salón
                  </span>
                  <div className="p-2 bg-transparent rounded border border-[#BF8D6B] text-sm">
                    {eventoDetalle.salonNombre || eventoDetalle.salon}
                  </div>
                </div>
                <div>
                  <span className="block text-sm text-[#BF8D6B] mb-1">
                    Fecha
                  </span>
                  <div className="p-2 bg-transparent rounded border border-[#BF8D6B] text-sm">
                    {formatDateTime(eventoDetalle.fecha)}
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="block text-sm text-[#BF8D6B] mb-1">
                    Duración
                  </span>
                  <div className="p-2 bg-transparent rounded border border-[#BF8D6B] text-sm">
                    {eventoDetalle.duracion} minutos
                  </div>
                </div>
                <div>
                  <span className="block text-sm text-[#BF8D6B] mb-1">
                    Capacidad
                  </span>
                  <div className="p-2 bg-transparent rounded border border-[#BF8D6B] text-sm">
                    {eventoDetalle.capacidad}
                  </div>
                </div>
                <div>
                  <span className="block text-sm text-[#BF8D6B] mb-1">
                    Estado
                  </span>
                  <div className="p-2 bg-transparent rounded border border-[#BF8D6B] text-sm">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        eventoDetalle.activo
                          ? "text-white"
                          : "bg-red-900 text-red-200"
                      }`}
                      style={
                        eventoDetalle.activo
                          ? { backgroundColor: "#BF8D6B" }
                          : {}
                      }
                    >
                      {eventoDetalle.activo ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="block text-sm text-[#BF8D6B] mb-1">
                    Entradas
                  </span>
                  <div className="p-2 bg-transparent rounded border border-[#BF8D6B] max-h-32 overflow-y-auto">
                    {loadingEntradas ? (
                      <span className="text-gray-300 text-xs">
                        Cargando entradas...
                      </span>
                    ) : entradasDetalle.length === 0 ? (
                      <span className="text-gray-400 text-xs">
                        No hay entradas para este evento.
                      </span>
                    ) : (
                      <ul className="space-y-2">
                        {entradasDetalle.map((entrada, idx) => (
                          <li
                            key={entrada.id || idx}
                            className="text-gray-200 text-xs border-b border-gray-700 pb-2 last:border-b-0"
                          >
                            <div>
                              <span className="font-semibold text-[#BF8D6B]">
                                Tipo:
                              </span>{" "}
                              {entrada.tipo_entrada}
                            </div>
                            <div>
                              <span className="font-semibold text-[#BF8D6B]">
                                Precio:
                              </span>{" "}
                              ${entrada.precio}
                            </div>
                            <div>
                              <span className="font-semibold text-[#BF8D6B]">
                                Cantidad:
                              </span>{" "}
                              {entrada.cantidad}
                            </div>
                            <div>
                              <span className="font-semibold text-[#BF8D6B]">
                                Estatus:
                              </span>{" "}
                              {entrada.estatus}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-300 text-sm">
              No hay información para mostrar.
            </div>
          )}
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="font-bold py-2 px-2 rounded bg-transparent text-white border border-[#BF8D6B] text-sm"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
