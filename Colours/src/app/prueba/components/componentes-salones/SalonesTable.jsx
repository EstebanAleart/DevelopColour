const SalonesTable = ({
  currentItems,
  selectedSalones,
  toggleSalonSelection,
  toggleAllSelection,
  onEditSalon,
  onDeleteSalon,
  onShowDetail,
}) => {
  return (
    <div className="hidden md:block">
      <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
        <thead className="bg-gray-900">
          <tr>
            <th className="w-8 px-3 py-3 text-left">
              <input
                type="checkbox"
                checked={
                  selectedSalones.length === currentItems.length &&
                  currentItems.length > 0
                }
                onChange={toggleAllSelection}
                className="w-4 h-4 bg-gray-700 border-gray-600 rounded"
                style={{ accentColor: "#BF8D6B" }}
              />
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Salón
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              CUIT
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Nombre del Contacto
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Email
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Telefono
            </th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Capacidad
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
          {currentItems.length > 0 ? (
            currentItems.map((salon, index) => {
              const isActive = salon.isActive ?? salon.estatus ?? true;
              const salonId = salon.id || salon._id || salon.Id;

              return (
                <tr
                  key={salonId}
                  className={`${
                    index % 2 === 0 ? "bg-gray-800" : "bg-gray-750"
                  } hover:bg-gray-700 transition-colors group ${
                    !isActive ? "opacity-70" : ""
                  }`}
                >
                  <td
                    className="px-3 py-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={selectedSalones.includes(salonId)}
                      onChange={() => toggleSalonSelection(salonId)}
                      className="w-4 h-4 bg-gray-700 border-gray-600 rounded"
                      style={{ accentColor: "#BF8D6B" }}
                    />
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-200">
                    {salon.salon || salon.nombre}
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-200">
                    {salon.cuit}
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-200">
                    {salon.contacto || salon.nombre}
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-200">
                    <a
                      href={`mailto:${salon.email}`}
                      className="text-[#BF8D6B] hover:underline"
                    >
                      {salon.email}
                    </a>
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-200">
                    {salon.whatsapp ? (
                      <a
                        href={`https://wa.me/${salon.whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#BF8D6B] hover:underline"
                      >
                        {salon.whatsapp}
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-200">
                    {salon.capacidad || "N/A"}
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        isActive ? "text-white" : "bg-red-900 text-red-200"
                      }`}
                      style={isActive ? { backgroundColor: "#BF8D6B" } : {}}
                    >
                      {isActive ? "Activo" : "Inactivo"}
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
                          onEditSalon(salon);
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
                          onDeleteSalon(salonId);
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
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="9" className="text-center py-10">
                <p className="text-gray-400">
                  No se encontraron salones que coincidan con los criterios de
                  búsqueda
                </p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SalonesTable;
