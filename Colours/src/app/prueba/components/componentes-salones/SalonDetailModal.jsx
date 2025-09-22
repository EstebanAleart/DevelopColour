import { Info, X } from "lucide-react";

const SalonDetailModal = ({
  showDetailModal,
  setShowDetailModal,
  loadingDetail,
  salonDetalle,
}) => {
  if (!showDetailModal) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] rounded-lg p-5 w-full max-w-xl shadow-lg max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Info className="h-5 w-5 text-[#BF8D6B]" /> Detalle del Salón
          </h2>
          <button
            onClick={() => {
              setShowDetailModal(false);
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
          ) : salonDetalle?.error ? (
            <div className="p-2 bg-red-900/50 text-red-300 text-xs rounded border border-red-700 mb-3">
              {salonDetalle.error}
            </div>
          ) : salonDetalle ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white text-sm">
              <div className="space-y-3">
                {(salonDetalle.image || salonDetalle.imagen) && (
                  <div>
                    <span className="block text-xs text-[#BF8D6B] mb-1">
                      Imagen
                    </span>
                    <div className="p-2 bg-transparent rounded border border-[#BF8D6B] flex justify-center">
                      <img
                        src={salonDetalle.image || salonDetalle.imagen}
                        alt="Imagen del salón"
                        className="max-h-32 rounded"
                        style={{ maxWidth: "100%", objectFit: "contain" }}
                      />
                    </div>
                  </div>
                )}
                <div>
                  <span className="block text-xs text-[#BF8D6B] mb-1">
                    Salón
                  </span>
                  <div className="p-2 bg-transparent rounded border border-[#BF8D6B]">
                    {salonDetalle.salon || salonDetalle.nombre}
                  </div>
                </div>
                <div>
                  <span className="block text-xs text-[#BF8D6B] mb-1">
                    CUIT
                  </span>
                  <div className="p-2 bg-transparent rounded border border-[#BF8D6B]">
                    {salonDetalle.cuit}
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="block text-xs text-[#BF8D6B] mb-1">
                    Contacto
                  </span>
                  <div className="p-2 bg-transparent rounded border border-[#BF8D6B]">
                    {salonDetalle.contacto || salonDetalle.nombre}
                  </div>
                </div>
                <div>
                  <span className="block text-xs text-[#BF8D6B] mb-1">
                    Email
                  </span>
                  <div className="p-2 bg-transparent rounded border border-[#BF8D6B]">
                    {salonDetalle.email}
                  </div>
                </div>
                <div>
                  <span className="block text-xs text-[#BF8D6B] mb-1">
                    WhatsApp
                  </span>
                  <div className="p-2 bg-transparent rounded border border-[#BF8D6B]">
                    {salonDetalle.whatsapp}
                  </div>
                </div>
                <div>
                  <span className="block text-xs text-[#BF8D6B] mb-1">
                    Capacidad
                  </span>
                  <div className="p-2 bg-transparent rounded border border-[#BF8D6B]">
                    {salonDetalle.capacidad}
                  </div>
                </div>
                <div>
                  <span className="block text-xs text-[#BF8D6B] mb-1">
                    Estado
                  </span>
                  <div className="p-2 bg-transparent rounded border border-[#BF8D6B]">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        salonDetalle.isActive ||
                        salonDetalle.estatus ||
                        salonDetalle.activo
                          ? "text-white"
                          : "bg-red-900 text-red-200"
                      }`}
                      style={
                        salonDetalle.isActive ??
                        salonDetalle.estatus ??
                        salonDetalle.activo
                          ? { backgroundColor: "#BF8D6B" }
                          : {}
                      }
                    >
                      {salonDetalle.isActive ??
                      salonDetalle.estatus ??
                      salonDetalle.activo
                        ? "Activo"
                        : "Inactivo"}
                    </span>
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
            onClick={() => {
              setShowDetailModal(false);
            }}
            className="font-bold py-1.5 px-4 rounded bg-transparent text-white border border-[#BF8D6B] text-sm"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalonDetailModal;
