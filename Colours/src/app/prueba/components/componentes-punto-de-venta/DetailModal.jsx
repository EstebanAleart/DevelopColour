import { X, Info } from "lucide-react";

export default function DetailModal({
  puntoDetalle,
  loadingDetail,
  setShowDetailModal,
  setPuntoDetalle,
}) {
  if (!puntoDetalle) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] rounded-lg p-4 w-full max-w-3xl shadow-lg max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Info className="h-5 w-5 text-[#BF8D6B]" /> Detalle del Punto de
            Venta
          </h2>
          <button
            onClick={() => {
              setShowDetailModal(false);
              setPuntoDetalle(null);
            }}
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
          ) : puntoDetalle?.error ? (
            <div className="p-2 bg-red-900/50 text-red-300 text-xs rounded border border-red-700 mb-3">
              {puntoDetalle.error}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-white">
              <div className="space-y-3">
                {(puntoDetalle.image || puntoDetalle.imagen) && (
                  <div>
                    <span className="block text-sm text-[#BF8D6B] mb-1">
                      Imagen
                    </span>
                    <div className="p-2 bg-transparent rounded border border-[#BF8D6B] flex justify-center">
                      <img
                        src={puntoDetalle.image || puntoDetalle.imagen}
                        alt="Imagen del punto de venta"
                        className="max-h-40 rounded"
                        style={{ maxWidth: "100%", objectFit: "contain" }}
                      />
                    </div>
                  </div>
                )}
                <div>
                  <span className="block text-sm text-[#BF8D6B] mb-1">
                    Razón Social
                  </span>
                  <div className="p-2 bg-transparent rounded border border-[#BF8D6B] text-sm">
                    {puntoDetalle.razon}
                  </div>
                </div>
                <div>
                  <span className="block text-sm text-[#BF8D6B] mb-1">
                    Nombre
                  </span>
                  <div className="p-2 bg-transparent rounded border border-[#BF8D6B] text-sm">
                    {puntoDetalle.nombre}
                  </div>
                </div>
                <div>
                  <span className="block text-sm text-[#BF8D6B] mb-1">
                    Dirección
                  </span>
                  <div className="p-2 bg-transparent rounded border border-[#BF8D6B] text-sm">
                    {puntoDetalle.direccion}
                  </div>
                </div>
                <div>
                  <span className="block text-sm text-[#BF8D6B] mb-1">
                    CUIT
                  </span>
                  <div className="p-2 bg-transparent rounded border border-[#BF8D6B] text-sm">
                    {puntoDetalle.cuit}
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="block text-sm text-[#BF8D6B] mb-1">
                    Email
                  </span>
                  <div className="p-2 bg-transparent rounded border border-[#BF8D6B] text-sm">
                    {puntoDetalle.email}
                  </div>
                </div>
                <div>
                  <span className="block text-sm text-[#BF8D6B] mb-1">
                    Teléfono
                  </span>
                  <div className="p-2 bg-transparent rounded border border-[#BF8D6B] text-sm">
                    {puntoDetalle.telefono}
                  </div>
                </div>
                <div>
                  <span className="block text-sm text-[#BF8D6B] mb-1">
                    Tipo
                  </span>
                  <div className="p-2 bg-transparent rounded border border-[#BF8D6B] text-sm">
                    {puntoDetalle.es_online ? "Online" : "Físico"}
                  </div>
                </div>
                <div>
                  <span className="block text-sm text-[#BF8D6B] mb-1">
                    Estado
                  </span>
                  <div className="p-2 bg-transparent rounded border border-[#BF8D6B] text-sm">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        puntoDetalle.isActive
                          ? "text-white"
                          : "bg-red-900 text-red-200"
                      }`}
                      style={
                        puntoDetalle.isActive
                          ? { backgroundColor: "#BF8D6B" }
                          : {}
                      }
                    >
                      {puntoDetalle.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={() => {
              setShowDetailModal(false);
              setPuntoDetalle(null);
            }}
            className="font-bold py-2 px-2 rounded bg-transparent text-white border border-[#BF8D6B] text-sm"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
