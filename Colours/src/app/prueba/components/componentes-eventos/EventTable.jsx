"use client";

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
    <table className="min-w-full bg-gray-800 rounded-lg overflow-x-auto">
      <thead className="bg-gray-900">
        <tr>
          <th className="w-8 px-2 py-2 text-left">
            <input
              type="checkbox"
              checked={
                selectedEventos.length === currentItems.length &&
                currentItems.length > 0
              }
              onChange={toggleAllSelection}
              className="w-3 h-3 bg-gray-700 border-gray-600 rounded"
              style={{ accentColor: "#BF8D6B" }}
            />
          </th>
          <th className="px-2 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-tight">
            Nombre
          </th>
          <th className="px-2 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-tight">
            Salón
          </th>
          <th className="px-2 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-tight">
            Fecha y Hora
          </th>
          <th className="px-2 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-tight">
            Duración
          </th>
          <th className="px-2 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-tight">
            Capacidad
          </th>
          <th className="px-2 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-tight">
            Estado
          </th>
          {currentItems.length > 0 && (
            <th className="w-48 px-2 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-tight">
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
              <td className="px-2 py-2">
                <input
                  type="checkbox"
                  checked={selectedEventos.includes(evento.id)}
                  onChange={() => toggleEventoSelection(evento.id)}
                  className="w-3 h-3 bg-gray-700 border-gray-600 rounded"
                  style={{ accentColor: "#BF8D6B" }}
                />
              </td>
              <td className="px-2 py-2 text-xs text-gray-200 truncate max-w-[150px]">
                {evento.nombre}
              </td>
              <td className="px-2 py-2 text-xs text-gray-200">
                {evento.salon}
              </td>
              <td className="px-2 py-2 text-xs text-gray-200">
                {evento.fechaFormateada}
              </td>
              <td className="px-2 py-2 text-xs text-gray-200">
                {evento.duracion || "N/A"} min
              </td>
              <td className="px-2 py-2 text-xs text-gray-200">
                {evento.capacidad || "Sin límite"}
              </td>
              <td className="px-2 py-2">
                <span
                  className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${
                    evento.activo ? "text-white" : "bg-red-900 text-red-200"
                  }`}
                  style={evento.activo ? { backgroundColor: "#BF8D6B" } : {}}
                >
                  {evento.activo ? "Activo" : "Inactivo"}
                </span>
              </td>
              {currentItems.length > 0 && (
                <td className="px-2 py-2">
                  <div className="flex gap-1 flex-wrap opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      className="px-1.5 py-0.5 rounded border bg-black text-xs"
                      style={{ borderColor: "#BF8D6B", color: "#BF8D6B" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#BF8D6B";
                        e.currentTarget.style.color = "white";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "black";
                        e.currentTarget.style.color = "#BF8D6B";
                      }}
                      onClick={() => handleAddEntradas(evento)}
                      title="Agregar Entradas"
                    >
                      Entradas
                    </button>
                    <button
                      className="px-1.5 py-0.5 rounded border bg-black text-xs"
                      style={{ borderColor: "#BF8D6B", color: "#BF8D6B" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#BF8D6B";
                        e.currentTarget.style.color = "white";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "black";
                        e.currentTarget.style.color = "#BF8D6B";
                      }}
                      onClick={() => handleEditEvento(evento)}
                      title="Editar"
                    >
                      Editar
                    </button>
                    <button
                      className="px-1.5 py-0.5 rounded border bg-black text-xs disabled:opacity-50"
                      style={{ borderColor: "#BF8D6B", color: "#BF8D6B" }}
                      onMouseEnter={(e) => {
                        if (!loadingCompare) {
                          e.currentTarget.style.backgroundColor = "#BF8D6B";
                          e.currentTarget.style.color = "white";
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "black";
                        e.currentTarget.style.color = "#BF8D6B";
                      }}
                      onClick={() => handleCompareContract(evento.id)}
                      disabled={loadingCompare}
                      title="Comparar Contrato"
                    >
                      {loadingCompare ? "..." : "Contrato"}
                    </button>
                    <button
                      className="px-1.5 py-0.5 rounded border text-xs"
                      style={{ borderColor: "#BF8D6B", color: "#BF8D6B" }}
                      onClick={() => handlePhysicalDelete(evento.id)}
                      title="Eliminar permanentemente"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#BF8D6B";
                        e.currentTarget.style.color = "white";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "#BF8D6B";
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
            <td colSpan="8" className="text-center py-6 text-gray-400 text-xs">
              No se encontraron eventos
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
