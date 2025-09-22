import { ChevronDown, ChevronUp } from "lucide-react";

const SalonesMobileList = ({
  currentItems,
  selectedSalones,
  toggleSalonSelection,
  expandedSalon,
  setExpandedSalon,
  onEditSalon,
  onDeleteSalon,
}) => {
  return (
    <div className="md:hidden space-y-4">
      {currentItems.length > 0 ? (
        currentItems.map((salon) => {
          const isActive = salon.isActive ?? salon.estatus ?? true;
          const salonId = salon.id || salon._id || salon.Id;

          return (
            <div
              key={salonId}
              className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={selectedSalones.includes(salonId)}
                    onChange={() => toggleSalonSelection(salonId)}
                    className="mt-1 w-4 h-4 bg-gray-700 border-gray-600 rounded"
                    style={{ accentColor: "#BF8D6B" }}
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-200 text-lg">
                      {salon.salon || salon.nombre}
                    </div>
                    <div className="text-sm text-gray-400 mt-1 flex items-center">
                      <span
                        className={`inline-block w-2 h-2 rounded-full mr-2 ${
                          isActive ? "bg-green-500" : "bg-red-500"
                        }`}
                      ></span>
                      <span>{isActive ? "Activo" : "Inactivo"}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() =>
                    setExpandedSalon(expandedSalon === salonId ? null : salonId)
                  }
                  className="text-gray-400 flex items-center gap-1 ml-2"
                >
                  {expandedSalon === salonId ? (
                    <>
                      <span className="text-xs">Cerrar</span>
                      <ChevronUp className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      <span className="text-xs">Detalles</span>
                      <ChevronDown className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Información básica siempre visible */}
              <div className="mt-2 text-sm text-gray-400">
                <div className="truncate">
                  <span className="font-medium">Contacto:</span>{" "}
                  {salon.contacto || "No especificado"}
                </div>
              </div>

              {expandedSalon === salonId && (
                <div className="mt-4 space-y-3 overflow-x-hidden">
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex flex-col">
                      <span className="text-gray-400 text-sm">CUIT:</span>
                      <span className="break-words text-gray-200">
                        {salon.cuit || "No especificado"}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-400 text-sm">Email:</span>
                      <a
                        href={`mailto:${salon.email}`}
                        className="break-words text-[#BF8D6B] hover:underline"
                      >
                        {salon.email || "No especificado"}
                      </a>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-400 text-sm">WhatsApp:</span>
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
                        <span className="text-gray-200">No especificado</span>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-400 text-sm">Capacidad:</span>
                      <span className="text-gray-200">
                        {salon.capacidad || "No especificado"}
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
                          onEditSalon(salon);
                        }}
                      >
                        Editar
                      </button>
                      <button
                        className="p-2 rounded transition-colors flex items-center justify-center border-2 text-xs"
                        style={{ color: "#BF8D6B", borderColor: "#BF8D6B" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSalon(salonId);
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
                </div>
              )}
            </div>
          );
        })
      ) : (
        <div className="text-center py-10 border border-gray-700 rounded-lg">
          <p className="text-gray-400">
            No se encontraron salones que coincidan con los criterios de
            búsqueda
          </p>
        </div>
      )}
    </div>
  );
};

export default SalonesMobileList;
