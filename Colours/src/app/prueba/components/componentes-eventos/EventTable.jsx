"use client"

export default function EventTable({
  currentItems,
  selectedEventos,
  toggleAllSelection,
  toggleEventoSelection,
  handleEditEvento,
  handleAddEntradas,
  handlePhysicalDelete,
  handleCompareContract,
  loadingCompare,
}) {
  return (
    <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
      <thead className="bg-gray-900">
        <tr>
          <th className="w-8 px-3 py-3 text-left">
            <input
              type="checkbox"
              checked={selectedEventos.length === currentItems.length && currentItems.length > 0}
              onChange={toggleAllSelection}
              className="w-4 h-4 bg-gray-700 border-gray-600 rounded"
              style={{ accentColor: "#BF8D6B" }}
            />
          </th>
          <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
            Nombre del Evento
          </th>
          <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
            Descripción
          </th>
          <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Salón</th>
          <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
            Fecha y Hora
          </th>
          <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Duración</th>
          <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Capacidad</th>
          <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Estado</th>
          {currentItems.length > 0 && (
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-64">
              Acciones
            </th>
          )}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-700">
        {currentItems.length > 0 ? (
          currentItems.map((evento, index) => (
            <tr
              key={evento.id}
              className={`${index % 2 === 0 ? "bg-gray-800" : "bg-gray-750"} ${
                !evento.activo ? "opacity-70" : ""
              } hover:bg-gray-700 transition-colors group`}
            >
              <td className="px-3 py-3">
                <input
                  type="checkbox"
                  checked={selectedEventos.includes(evento.id)}
                  onChange={() => toggleEventoSelection(evento.id)}
                  className="w-4 h-4 bg-gray-700 border-gray-600 rounded"
                  style={{ accentColor: "#BF8D6B" }}
                />
              </td>
              <td className="px-3 py-3 text-sm text-gray-200">{evento.nombre}</td>
              <td className="px-3 py-3 text-sm text-gray-200">{evento.descripcion}</td>
              <td className="px-3 py-3 text-sm text-gray-200">{evento.salon}</td>
              <td className="px-3 py-3 text-sm text-gray-200">{evento.fechaFormateada}</td>
              <td className="px-3 py-3 text-sm text-gray-200">{evento.duracion || "N/A"} minutos</td>
              <td className="px-3 py-3 text-sm text-gray-200">{evento.capacidad || "Sin límite"}</td>
              <td className="px-3 py-3">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    evento.activo ? "text-white" : "bg-red-900 text-red-200"
                  }`}
                  style={evento.activo ? { backgroundColor: "#BF8D6B" } : {}}
                >
                  {evento.activo ? "Activo" : "Inactivo"}
                </span>
              </td>
              {currentItems.length > 0 && (
                <td className="px-3 py-3">
                  <div className="flex gap-1 flex-wrap opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      className="px-2 py-1 rounded transition-colors border-2 bg-black hover:text-black text-xs"
                      style={{ borderColor: "#BF8D6B", color: "#BF8D6B" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#BF8D6B"
                        e.currentTarget.style.color = "white"
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
                      className="px-2 py-1 rounded transition-colors border-2 bg-black hover:text-black text-xs"
                      style={{ borderColor: "#BF8D6B", color: "#BF8D6B" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#BF8D6B"
                        e.currentTarget.style.color = "white"
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
                      className="px-2 py-1 rounded transition-colors border-2 bg-black hover:text-black text-xs disabled:opacity-50"
                      style={{ borderColor: "#BF8D6B", color: "#BF8D6B" }}
                      onMouseEnter={(e) => {
                        if (!loadingCompare) {
                          e.currentTarget.style.backgroundColor = "#BF8D6B"
                          e.currentTarget.style.color = "white"
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
                      className="px-2 py-1 rounded transition-colors border-2 text-xs"
                      style={{ color: "#BF8D6B", borderColor: "#BF8D6B" }}
                      onClick={() => handlePhysicalDelete(evento.id)}
                      title="Eliminar permanentemente"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#BF8D6B"
                        e.currentTarget.style.color = "white"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent"
                        e.currentTarget.style.color = "#BF8D6B"
                      }}
                    >
                      Borrar
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="9" className="text-center py-10 text-gray-400 text-sm">
              No se encontraron eventos que coincidan con los criterios de búsqueda
            </td>
          </tr>
        )}
      </tbody>
    </table>
  )
}
