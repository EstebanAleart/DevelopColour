import { ChevronDown, ChevronUp } from "lucide-react";

const MobileUsersList = ({
  currentItems,
  selectedUsers,
  toggleUserSelection,
  expandedUser,
  setExpandedUser,
  setUsuarioEditar,
  borrarUsuario,
}) => {
  return (
    <div className="space-y-2">
      {currentItems.map((usuario) => (
        <MobileUserCard
          key={usuario.id}
          usuario={usuario}
          selectedUsers={selectedUsers}
          toggleUserSelection={toggleUserSelection}
          expandedUser={expandedUser}
          setExpandedUser={setExpandedUser}
          setUsuarioEditar={setUsuarioEditar}
          borrarUsuario={borrarUsuario}
        />
      ))}
    </div>
  );
};

const MobileUserCard = ({
  usuario,
  selectedUsers,
  toggleUserSelection,
  expandedUser,
  setExpandedUser,
  setUsuarioEditar,
  borrarUsuario,
}) => {
  const isExpanded = expandedUser === usuario.id;

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selectedUsers.includes(usuario.id)}
            onChange={() => toggleUserSelection(usuario.id)}
            className="w-4 h-4 bg-gray-700 border-gray-600 rounded mr-1"
            style={{ accentColor: "#BF8D6B" }}
          />
          <div>
            <div className="font-medium text-sm text-gray-200">
              {usuario.nombre} {usuario.apellido}
            </div>
            <div className="text-sm text-gray-400">
              {usuario.usuario || "-"}
            </div>
          </div>
        </div>
        <button
          onClick={() => setExpandedUser(isExpanded ? null : usuario.id)}
          className="text-gray-400 hover:text-gray-300 flex items-center gap-1 text-sm transition-colors"
        >
          {isExpanded ? (
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

      {isExpanded && (
        <ExpandedUserDetails
          usuario={usuario}
          setUsuarioEditar={setUsuarioEditar}
          borrarUsuario={borrarUsuario}
        />
      )}
    </div>
  );
};

const ExpandedUserDetails = ({ usuario, setUsuarioEditar, borrarUsuario }) => {
  return (
    <div className="mt-3 space-y-2 pt-3 border-t border-gray-700">
      <div className="grid grid-cols-1 gap-2">
        <DetailItem label="Email:" value={usuario.email} isEmail />
        <DetailItem label="Teléfono:" value={usuario.whatsapp} isPhone />
        <DetailItem label="Rol:" value={usuario.rol} isRole />
      </div>

      <div className="flex justify-between pt-2 mt-2 border-t border-gray-700">
        <div className="grid grid-cols-2 gap-2 w-full">
          <MobileButton
            onClick={() => setUsuarioEditar(usuario)}
            label="Editar"
          />
          <MobileButton
            onClick={() => borrarUsuario(usuario.id)}
            label="Borrar"
          />
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({
  label,
  value,
  isEmail = false,
  isPhone = false,
  isRole = false,
}) => {
  if (isRole) {
    return (
      <div className="flex flex-col">
        <span className="text-gray-400 text-sm">{label}</span>
        <UserRoleBadge rol={value} />
      </div>
    );
  }

  if (isEmail && value) {
    return (
      <div className="flex flex-col">
        <span className="text-gray-400 text-sm">{label}</span>
        <a
          href={`mailto:${value}`}
          className="break-words text-sm text-[#BF8D6B] hover:underline"
        >
          {value}
        </a>
      </div>
    );
  }

  if (isPhone && value) {
    return (
      <div className="flex flex-col">
        <span className="text-gray-400 text-sm">{label}</span>
        <a
          href={`https://wa.me/${value}`}
          target="_blank"
          rel="noopener noreferrer"
          className="break-words text-sm text-[#BF8D6B] hover:underline"
        >
          {value}
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <span className="text-gray-400 text-sm">{label}</span>
      <span className="break-words text-sm text-gray-200">{value || "-"}</span>
    </div>
  );
};

const MobileButton = ({ onClick, label }) => {
  return (
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
      onClick={onClick}
    >
      {label}
    </button>
  );
};

export default MobileUsersList;
