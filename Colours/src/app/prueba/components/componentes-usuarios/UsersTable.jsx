const UsersTable = ({
  currentItems,
  selectedUsers,
  toggleUserSelection,
  toggleSelectAll,
  setUsuarioEditar,
  borrarUsuario,
}) => {
  return (
    <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
      <thead className="bg-gray-900">
        <tr>
          <th className="w-8 px-3 py-3 text-left">
            <input
              type="checkbox"
              checked={
                selectedUsers.length === currentItems.length &&
                currentItems.length > 0
              }
              onChange={() => toggleSelectAll(currentItems)}
              className="w-4 h-4 bg-gray-700 border-gray-600 rounded"
              style={{ accentColor: "#BF8D6B" }}
            />
          </th>
          <TableHeader>Usuario</TableHeader>
          <TableHeader>Nombre y Apellido</TableHeader>
          <TableHeader>Email</TableHeader>
          <TableHeader>Teléfono</TableHeader>
          <TableHeader>Tipo de Usuario</TableHeader>
          <TableHeader>Acciones</TableHeader>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-700">
        {currentItems.map((usuario, index) => (
          <TableRow
            key={usuario.id}
            usuario={usuario}
            index={index}
            selectedUsers={selectedUsers}
            toggleUserSelection={toggleUserSelection}
            setUsuarioEditar={setUsuarioEditar}
            borrarUsuario={borrarUsuario}
          />
        ))}
      </tbody>
    </table>
  );
};

const TableHeader = ({ children }) => (
  <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
    {children}
  </th>
);

const TableRow = ({
  usuario,
  index,
  selectedUsers,
  toggleUserSelection,
  setUsuarioEditar,
  borrarUsuario,
}) => {
  return (
    <tr
      className={`${index % 2 === 0 ? "bg-gray-800" : "bg-gray-750"} ${
        !usuario.isActive ? "opacity-70" : ""
      } hover:bg-gray-700 transition-colors group`}
    >
      <td className="px-3 py-3">
        <input
          type="checkbox"
          checked={selectedUsers.includes(usuario.id)}
          onChange={() => toggleUserSelection(usuario.id)}
          className="w-4 h-4 bg-gray-700 border-gray-600 rounded"
          style={{ accentColor: "#BF8D6B" }}
        />
      </td>
      <td className="px-3 py-3 text-sm text-gray-200">
        {usuario.usuario || "-"}
      </td>
      <td className="px-3 py-3 text-sm text-gray-200">
        {usuario.nombre} {usuario.apellido}
      </td>
      <td className="px-3 py-3 text-sm text-gray-200">
        <a
          href={`mailto:${usuario.email}`}
          className="text-[#BF8D6B] hover:underline"
        >
          {usuario.email}
        </a>
      </td>
      <td className="px-3 py-3 text-sm text-gray-200">
        {usuario.whatsapp ? (
          <a
            href={`https://wa.me/${usuario.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#BF8D6B] hover:underline"
          >
            {usuario.whatsapp}
          </a>
        ) : (
          "-"
        )}
      </td>
      <td className="px-3 py-3">
        <UserRoleBadge rol={usuario.rol} />
      </td>
      <td className="px-3 py-3">
        <ActionButtons
          setUsuarioEditar={() => setUsuarioEditar(usuario)}
          borrarUsuario={() => borrarUsuario(usuario.id)}
        />
      </td>
    </tr>
  );
};

const UserRoleBadge = ({ rol }) => {
  const roleConfig = {
    admin: { bg: "bg-gray-700", text: "Administrador" },
    vendor: { bg: "bg-gray-600", text: "Vendedor" },
    default: { bg: "bg-gray-900", text: "Común" },
  };

  const config = roleConfig[rol] || roleConfig.default;

  return (
    <span
      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${config.bg} text-gray-200`}
    >
      {config.text}
    </span>
  );
};

const ActionButtons = ({ setUsuarioEditar, borrarUsuario }) => {
  return (
    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button onClick={setUsuarioEditar} label="Editar" />
      <Button onClick={borrarUsuario} label="Borrar" />
    </div>
  );
};

const Button = ({ onClick, label }) => {
  return (
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
      onClick={onClick}
    >
      {label}
    </button>
  );
};

export default UsersTable;
