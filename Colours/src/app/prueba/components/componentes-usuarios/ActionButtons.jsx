const ActionButtons = ({
  selectedUsers,
  handleAsignarVendedor,
  handleAsignarAdministrador,
  setShowModal,
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto ml-auto">
      <div className="flex flex-col md:flex-row gap-2 w-full">
        <ActionButton
          onClick={handleAsignarVendedor}
          disabled={selectedUsers.length === 0}
          label="Vendedor"
        />

        <ActionButton
          onClick={handleAsignarAdministrador}
          disabled={selectedUsers.length === 0}
          label="Administrador"
        />
      </div>

      <ActionButton onClick={() => setShowModal(true)} label="Agregar" />
    </div>
  );
};

const ActionButton = ({ onClick, disabled = false, label }) => {
  return (
    <button
      className="px-3 py-2 text-sm rounded flex items-center justify-center gap-1 transition-colors border-2 bg-black hover:text-black w-full md:w-auto"
      style={{
        borderColor: "#BF8D6B",
        color: "#ffffffff",
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = "#BF8D6B";
          e.currentTarget.style.color = "white";
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = "black";
          e.currentTarget.style.color = "#ffffffff";
        }
      }}
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
    >
      <span className="text-xs md:text-sm">{label}</span>
    </button>
  );
};

export default ActionButtons;
