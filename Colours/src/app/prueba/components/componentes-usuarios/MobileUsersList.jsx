import { Edit, Trash2, ChevronDown, ChevronUp } from "lucide-react";

export default function MobileUsersList({
  currentItems,
  selectedUsers,
  toggleUserSelection,
  expandedUser,
  setExpandedUser,
  setUsuarioEditar,
  borrarUsuario,
}) {
  return (
    <div className="md:hidden space-y-2">
      {currentItems.length > 0 ? (
        currentItems.map((user) => {
          const isActive = user.isActive ?? true;
          const userId = user.id || user._id;

          return (
            <div
              key={userId}
              className="bg-gray-800 border border-gray-700 rounded-lg p-2 text-xs"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 flex items-start gap-1">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(userId)}
                    onChange={() => toggleUserSelection(userId)}
                    className="mt-0.5 w-3 h-3 bg-gray-700 border-gray-600 rounded"
                    style={{ accentColor: "#BF8D6B" }}
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-200 text-sm">
                      {user.nombre} {user.apellido}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5 flex items-center">
                      <span
                        className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${
                          isActive ? "bg-green-500" : "bg-red-500"
                        }`}
                      ></span>
                      <span>{isActive ? "Activo" : "Inactivo"}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() =>
                    setExpandedUser(expandedUser === userId ? null : userId)
                  }
                  className="text-gray-400 flex items-center gap-0.5 ml-1"
                >
                  <span className="text-xs">
                    {expandedUser === userId ? "Cerrar" : "Detalles"}
                  </span>
                  {expandedUser === userId ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </button>
              </div>

              <div className="mt-1 text-xs text-gray-400">
                <div className="truncate">
                  <span className="font-medium">Usuario:</span>{" "}
                  {user.usuario || "No especificado"}
                </div>
              </div>

              {expandedUser === userId && (
                <div className="mt-2 space-y-2 overflow-x-hidden">
                  <div className="grid grid-cols-1 gap-1">
                    <div className="flex flex-col">
                      <span className="text-gray-400 text-xs">Email:</span>
                      <a
                        href={`mailto:${user.email}`}
                        className="break-words text-[#BF8D6B] hover:underline"
                      >
                        {user.email || "No especificado"}
                      </a>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-400 text-xs">Rol:</span>
                      <span className="text-gray-200">
                        {user.rol
                          ? user.rol.charAt(0).toUpperCase() + user.rol.slice(1)
                          : "No especificado"}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between pt-2 mt-1 border-t border-gray-700">
                    <div className="grid grid-cols-2 gap-1 w-full">
                      <button
                        className="p-1 rounded transition-colors flex items-center justify-center border bg-black hover:text-black text-xs"
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
                          setUsuarioEditar(user);
                        }}
                      >
                        Editar
                      </button>
                      <button
                        className="p-1 rounded transition-colors flex items-center justify-center border text-xs"
                        style={{ color: "#BF8D6B", borderColor: "#BF8D6B" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          borrarUsuario(userId);
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
        <div className="text-center py-4 border border-gray-700 rounded-lg">
          <p className="text-gray-400 text-xs">
            No se encontraron usuarios que coincidan con los criterios de
            búsqueda
          </p>
        </div>
      )}
    </div>
  );
}
