import { ChevronUp, ChevronDown } from "lucide-react";

export default function MobileView({
  currentItems,
  selectedPuntos,
  togglePuntoSelection,
  expandedPunto,
  setExpandedPunto,
  handleDeletePunto,
  setSelectedPunto,
  setShowEdicionCompleta,
  handleShowDetail,
}) {
  return (
    <div className="md:hidden space-y-4">
      {currentItems.map((punto) => (
        <div
          key={punto.id}
          className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1 flex items-start gap-2">
              <input
                type="checkbox"
                checked={selectedPuntos.includes(punto.id)}
                onChange={() => togglePuntoSelection(punto.id)}
                className="mt-1 w-4 h-4 bg-gray-700 border-gray-600 rounded"
                style={{ accentColor: "#BF8D6B" }}
              />
              <div className="flex-1">
                <div className="font-medium text-gray-200">{punto.nombre}</div>
                <div className="text-sm text-gray-400 truncate">
                  {punto.razon}
                </div>
              </div>
            </div>
            <button
              onClick={() =>
                setExpandedPunto(expandedPunto === punto.id ? null : punto.id)
              }
              className="text-gray-400 flex items-center gap-1 ml-2"
            >
              {expandedPunto === punto.id ? (
                <>
                  <span className="text-xs">Cerrar</span>
                  <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  <span className="text-xs">Ver</span>
                  <ChevronDown className="h-4 w-4" />
                </>
              )}
            </button>
          </div>

          {expandedPunto === punto.id && (
            <div className="mt-4 space-y-3 overflow-x-hidden">
              <div className="grid grid-cols-1 gap-2">
                <div className="flex flex-col">
                  <span className="text-gray-400 text-sm">Razón Social:</span>
                  <span className="break-words text-gray-200">
                    {punto.razon}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-400 text-sm">Dirección:</span>
                  <span className="break-words text-gray-200">
                    {punto.direccion}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-400 text-sm">CUIT:</span>
                  <span className="text-gray-200">{punto.cuit}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-400 text-sm">Email:</span>
                  <a
                    href={`mailto:${punto.email}`}
                    className="break-words text-[#BF8D6B] hover:underline"
                  >
                    {punto.email}
                  </a>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-400 text-sm">Teléfono:</span>
                  {punto.telefono ? (
                    <a
                      href={`tel:${punto.telefono}`}
                      className="text-[#BF8D6B] hover:underline"
                    >
                      {punto.telefono}
                    </a>
                  ) : (
                    <span className="text-gray-200">-</span>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-400 text-sm">Tipo:</span>
                  <span className="text-gray-200">
                    {punto.es_online ? "Online" : "Físico"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-400 text-sm">Estado:</span>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full w-fit mt-1 ${
                      punto.isActive ? "text-white" : "bg-red-900 text-red-200"
                    }`}
                    style={punto.isActive ? { backgroundColor: "#BF8D6B" } : {}}
                  >
                    {punto.isActive ? "Activo" : "Inactivo"}
                  </span>
                </div>
              </div>

              <div className="flex justify-between pt-3 mt-2 border-t border-gray-700">
                <div className="grid grid-cols-2 gap-2 w-full">
                  <button
                    className="p-2 rounded transition-colors flex items-center justify-center border-2 bg-black hover:text-black text-xs"
                    style={{ borderColor: "#BF8D6B", color: "#BF8D6B" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#BF8D6B";
                      e.currentTarget.style.color = "black";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "black";
                      e.currentTarget.style.color = "#BF8D6B";
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPunto(punto);
                      setShowEdicionCompleta(true);
                    }}
                  >
                    Editar
                  </button>
                  <button
                    className="p-2 rounded transition-colors flex items-center justify-center border-2 text-xs"
                    style={{ color: "#BF8D6B", borderColor: "#BF8D6B" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePunto(punto.id);
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#BF8D6B";
                      e.currentTarget.style.color = "white";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "black";
                      e.currentTarget.style.color = "#BF8D6B";
                    }}
                  >
                    Borrar
                  </button>
                </div>
              </div>
              <button
                className="px-3 py-1 text-sm rounded flex items-center justify-center gap-2 transition-colors border-2 bg-black hover:text-black w-full mt-2"
                style={{ borderColor: "#BF8D6B", color: "#ffffffff" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#BF8D6B";
                  e.currentTarget.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "black";
                  e.currentTarget.style.color = "#ffffffff";
                }}
                onClick={() => handleShowDetail(punto.id)}
              >
                Ver detalles completos
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
