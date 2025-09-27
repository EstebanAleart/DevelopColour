"use client"

import { ChevronUp, ChevronDown, Clock, Users, Calendar } from "lucide-react"

export default function MobileEventCard({
  currentItems,
  selectedEventos,
  toggleEventoSelection,
  expandedEvento,
  setExpandedEvento,
  handleEditEvento,
  handleAddEntradas,
  handlePhysicalDelete,
  handleCompareContract,
  loadingCompare,
}) {
  return (
    <>
      {currentItems.length > 0 ? (
        currentItems.map((evento) => (
          <div key={evento.id} className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedEventos.includes(evento.id)}
                  onChange={() => toggleEventoSelection(evento.id)}
                  className="w-4 h-4 bg-gray-700 border-gray-600 rounded mr-1"
                  style={{ accentColor: "#BF8D6B" }}
                />
                <div>
                  <div className="font-medium text-sm text-gray-200">{evento.nombre}</div>
                  <div className="text-sm text-gray-400">{evento.salon}</div>
                </div>
              </div>
              <button
                onClick={() => setExpandedEvento(expandedEvento === evento.id ? null : evento.id)}
                className="text-gray-400 hover:text-gray-300 flex items-center gap-1 text-sm transition-colors"
              >
                {expandedEvento === evento.id ? (
                  <>
                    <span>Cerrar</span>
                    <ChevronUp className="h-3 w-3" />
                  </>
                ) : (
                  <>
                    <span>Detalles</span>
                    <ChevronDown className="h-3 w-3" />
                  </>
                )}
              </button>
            </div>
            {expandedEvento === evento.id && (
              <div className="mt-3 space-y-2 pt-3 border-t border-gray-700">
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-400 text-sm">Duración:</span>
                    <span className="ml-2 text-gray-200">{evento.duracion || "N/A"} minutos</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-400 text-sm">Capacidad:</span>
                    <span className="ml-2 text-gray-200">{evento.capacidad || "Sin límite"}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-gray-400 text-sm">Fecha:</span>
                    <span className="ml-2 text-gray-200">{evento.fechaFormateada}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-400 text-sm">Estado:</span>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full w-fit mt-1 ml-2 ${
                        evento.activo ? "text-white" : "bg-red-900 text-red-200"
                      }`}
                      style={evento.activo ? { backgroundColor: "#BF8D6B" } : {}}
                    >
                      {evento.activo ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between pt-2 mt-2 border-t border-gray-700">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
                    <button
                      className="p-2 rounded transition-colors flex items-center justify-center border-2 bg-black hover:text-black text-xs"
                      style={{ borderColor: "#BF8D6B", color: "#BF8D6B" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#BF8D6B"
                        e.currentTarget.style.color = "black"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "black"
                        e.currentTarget.style.color = "#BF8D6B"
                      }}
                      onClick={() => handleEditEvento(evento)}
                      title="Editar"
                    >
                      Editar
                    </button>
                    <button
                      className="p-2 rounded transition-colors flex items-center justify-center border-2 bg-black hover:text-black text-xs"
                      style={{ borderColor: "#BF8D6B", color: "#BF8D6B" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#BF8D6B"
                        e.currentTarget.style.color = "black"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "black"
                        e.currentTarget.style.color = "#BF8D6B"
                      }}
                      onClick={() => handleAddEntradas(evento)}
                      title="Agregar Entradas"
                    >
                      Entradas
                    </button>
                    <button
                      className="p-2 rounded transition-colors flex items-center justify-center border-2 bg-black hover:text-black text-xs disabled:opacity-50"
                      style={{ borderColor: "#BF8D6B", color: "#BF8D6B" }}
                      onMouseEnter={(e) => {
                        if (!loadingCompare) {
                          e.currentTarget.style.backgroundColor = "#BF8D6B"
                          e.currentTarget.style.color = "black"
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "black"
                        e.currentTarget.style.color = "#BF8D6B"
                      }}
                      onClick={() => handleCompareContract(evento.id)}
                      disabled={loadingCompare}
                      title="Comparar Contrato"
                    >
                      {loadingCompare ? "..." : "Contrato"}
                    </button>
                    <button
                      className="p-2 rounded transition-colors flex items-center justify-center border-2 text-xs"
                      style={{ color: "#BF8D6B", borderColor: "#BF8D6B" }}
                      onClick={() => handlePhysicalDelete(evento.id)}
                      title="Eliminar permanentemente"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#BF8D6B"
                        e.currentTarget.style.color = "white"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "black"
                        e.currentTarget.style.color = "#BF8D6B"
                      }}
                    >
                      Borrar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="text-center py-10 border border-gray-700 rounded-lg">
          <p className="text-gray-400 text-sm">No se encontraron eventos que coincidan con los criterios de búsqueda</p>
        </div>
      )}
    </>
  )
}

