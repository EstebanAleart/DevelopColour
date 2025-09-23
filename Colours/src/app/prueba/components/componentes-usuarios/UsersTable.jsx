import { Edit, Trash2 } from "lucide-react";
import { useState } from "react";

export default function UsersTable({
  currentItems,
  selectedUsers,
  toggleUserSelection,
  toggleSelectAll,
  setUsuarioEditar,
  borrarUsuario,
  isCurrentUser,
}) {
  const [activeTab, setActiveTab] = useState("administradores");

  const roleDisplayMap = {
    admin: "Administrador",
    vendor: "Vendedor",
    graduado: "Graduado",
  };

  const getRoleDisplay = (role) => {
    if (!role) return "-";
    return (
      roleDisplayMap[role.toLowerCase()] ||
      role.charAt(0).toUpperCase() + role.slice(1)
    );
  };

  // Split users by role
  const administradores = currentItems.filter(
    (user) => user.rol.toLowerCase() === "admin"
  );
  const vendedores = currentItems.filter(
    (user) => user.rol.toLowerCase() === "vendor"
  );
  const graduados = currentItems.filter(
    (user) => user.rol.toLowerCase() === "graduado"
  );

  const renderTable = (users) => (
    <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
      <thead className="bg-gray-900">
        <tr>
          <th className="w-6 px-2 py-2 text-left">
            <input
              type="checkbox"
              checked={
                users.length > 0 &&
                users.every((user) => selectedUsers.includes(user.id))
              }
              onChange={() => toggleSelectAll(users)}
              className="w-3 h-3 bg-gray-700 border-gray-600 rounded"
              style={{ accentColor: "#BF8D6B" }}
            />
          </th>
          <th className="px-2 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
            Usuario
          </th>
          <th className="px-2 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
            Nombre
          </th>
          <th className="px-2 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
            Email
          </th>
          <th className="px-2 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
            Rol
          </th>
          <th className="px-2 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
            Estado
          </th>
          <th className="px-2 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-32">
            Acciones
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-700">
        {users.length > 0 ? (
          users.map((user, index) => {
            const isActive = user.isActive ?? true;
            const userId = user.id || user._id;

            return (
              <tr
                key={userId}
                className={`${
                  index % 2 === 0 ? "bg-gray-800" : "bg-gray-750"
                } hover:bg-gray-700 transition-colors group ${
                  !isActive ? "opacity-70" : ""
                }`}
              >
                <td className="px-2 py-2" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(userId)}
                    onChange={() => toggleUserSelection(userId)}
                    disabled={isCurrentUser(userId)}
                    className="w-3 h-3 bg-gray-700 border-gray-600 rounded"
                    style={{ accentColor: "#BF8D6B" }}
                  />
                </td>
                <td className="px-2 py-2 text-xs text-gray-200">
                  {user.usuario || "-"}
                </td>
                <td className="px-2 py-2 text-xs text-gray-200">
                  {user.nombre} {user.apellido}
                </td>
                <td className="px-2 py-2 text-xs text-gray-200">
                  <a
                    href={`mailto:${user.email}`}
                    className="text-[#BF8D6B] hover:underline"
                  >
                    {user.email || "-"}
                  </a>
                </td>
                <td className="px-2 py-2 text-xs text-gray-200">
                  {getRoleDisplay(user.rol)}
                </td>
                <td className="px-2 py-2">
                  <span
                    className={`inline-flex px-1.5 py-0.5 text-xs font-semibold rounded-full ${
                      isActive ? "text-white" : "bg-red-900 text-red-200"
                    }`}
                    style={isActive ? { backgroundColor: "#BF8D6B" } : {}}
                  >
                    {isActive ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-2 py-2">
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      className="px-1.5 py-0.5 rounded transition-colors border bg-black hover:text-black text-xs"
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
                        setUsuarioEditar(user);
                      }}
                      title="Editar"
                    >
                      Editar
                    </button>
                    <button
                      className="px-1.5 py-0.5 rounded transition-colors border text-xs"
                      style={{ color: "#BF8D6B", borderColor: "#BF8D6B" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        borrarUsuario(userId);
                      }}
                      disabled={isCurrentUser(userId)}
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
            <td colSpan="7" className="text-center py-4">
              <p className="text-gray-400 text-xs">
                No se encontraron usuarios que coincidan con los criterios de
                búsqueda
              </p>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );

  return (
    <div className="hidden md:block">
      <div className="flex border-b border-gray-700 mb-4">
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "administradores"
              ? "border-b-2 border-[#BF8D6B] text-[#BF8D6B]"
              : "text-gray-400 hover:text-[#BF8D6B]"
          }`}
          onClick={() => setActiveTab("administradores")}
        >
          Administradores ({administradores.length})
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "vendedores"
              ? "border-b-2 border-[#BF8D6B] text-[#BF8D6B]"
              : "text-gray-400 hover:text-[#BF8D6B]"
          }`}
          onClick={() => setActiveTab("vendedores")}
        >
          Vendedores ({vendedores.length})
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "graduados"
              ? "border-b-2 border-[#BF8D6B] text-[#BF8D6B]"
              : "text-gray-400 hover:text-[#BF8D6B]"
          }`}
          onClick={() => setActiveTab("graduados")}
        >
          Graduados ({graduados.length})
        </button>
      </div>
      {activeTab === "administradores" && renderTable(administradores)}
      {activeTab === "vendedores" && renderTable(vendedores)}
      {activeTab === "graduados" && renderTable(graduados)}
    </div>
  );
}
