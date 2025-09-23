export default function DesktopTable({
  currentItems,
  selectedPuntos,
  togglePuntoSelection,
  toggleSelectAll,
  handleDeletePunto,
  setSelectedPunto,
  setShowEdicionCompleta,
  handleShowDetail,
}) {
  return (
    <div className="hidden md:block">
      <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
        <thead className="bg-gray-900">
          <tr>
            <th className="w-8 px-3 py-3 text-left">
              <input
                type="checkbox"
                checked={
                  selectedPuntos.length === currentItems.length &&
                  currentItems.length > 0
                }
                onChange={toggleSelectAll}
                className="w-4 h-4 bg-gray-700 border-gray-600 rounded"
                style={{ accentColor: "#BF8D6B" }}
              />
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Razón Social
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Nombre
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Dirección
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              CUIT
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Email
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Teléfono
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Tipo
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-48">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {currentItems.map((punto, index) => (
            <tr
              key={punto.id}
              className={`${
                index % 2 === 0 ? "bg-gray-800" : "bg-gray-750"
              } hover:bg-gray-700 transition-colors group`}
            >
              <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={selectedPuntos.includes(punto.id)}
                  onChange={() => togglePuntoSelection(punto.id)}
                  className="w-4 h-4 bg-gray-700 border-gray-600 rounded"
                  style={{ accentColor: "#BF8D6B" }}
                />
              </td>
              <td className="px-3 py-3 text-sm text-gray-200">{punto.razon}</td>
              <td className="px-3 py-3 text-sm text-gray-200">
                {punto.nombre}
              </td>
              <td className="px-3 py-3 text-sm text-gray-200">
                {punto.direccion}
              </td>
              <td className="px-3 py-3 text-sm text-gray-200">{punto.cuit}</td>
              <td className="px-3 py-3 text-sm text-gray-200">
                <a
                  href={`mailto:${punto.email}`}
                  className="text-[#BF8D6B] hover:underline"
                >
                  {punto.email}
                </a>
              </td>
              <td className="px-3 py-3 text-sm text-gray-200">
                {punto.telefono ? (
                  <a
                    href={`tel:${punto.telefono}`}
                    className="text-[#BF8D6B] hover:underline"
                  >
                    {punto.telefono}
                  </a>
                ) : (
                  "-"
                )}
              </td>
              <td className="px-3 py-3 text-sm text-gray-200">
                {punto.es_online ? "Online" : "Físico"}
              </td>
              <td className="px-3 py-3">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    punto.isActive ? "text-white" : "bg-red-900 text-red-200"
                  }`}
                  style={punto.isActive ? { backgroundColor: "#BF8D6B" } : {}}
                >
                  {punto.isActive ? "Activo" : "Inactivo"}
                </span>
              </td>
              <td className="px-3 py-3">
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    className="px-2 py-1 rounded transition-colors border-2 bg-black hover:text-black text-xs"
                    style={{ borderColor: "#BF8D6B", color: "#BF8D6B" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#BF8D6B";
                      e.currentTarget.style.color = "white";
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
                    title="Editar"
                  >
                    Editar
                  </button>
                  <button
                    className="px-2 py-1 rounded transition-colors border-2 text-xs"
                    style={{ color: "#BF8D6B", borderColor: "#BF8D6B" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePunto(punto.id);
                    }}
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
                  <button
                    className="px-2 py-1 rounded transition-colors border-2 text-xs"
                    style={{ color: "#BF8D6B", borderColor: "#BF8D6B" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShowDetail(punto.id);
                    }}
                    title="Ver detalles"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#BF8D6B";
                      e.currentTarget.style.color = "white";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "#BF8D6B";
                    }}
                  >
                    Detalles
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
