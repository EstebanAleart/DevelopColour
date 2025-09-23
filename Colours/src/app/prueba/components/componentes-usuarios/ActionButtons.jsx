import { Plus, UserPlus } from "lucide-react";

export default function ActionButtons({
  selectedUsers,
  handleAsignarVendedor,
  handleAsignarAdministrador,
  setShowModal,
  setShowGraduadoModal,
}) {
  return (
    <div className="flex flex-col md:flex-row gap-1 w-full md:w-auto">
      <button
        onClick={() => setShowModal(true)}
        className="px-2 py-1 text-xs rounded flex items-center justify-center gap-1 transition-colors border bg-black hover:text-black w-full md:w-auto"
        style={{ borderColor: "#BF8D6B", color: "#ffffffff" }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#BF8D6B";
          e.currentTarget.style.color = "white";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "black";
          e.currentTarget.style.color = "#ffffffff";
        }}
      >
        <span>Agregar</span>
      </button>

      <button
        onClick={() => setShowGraduadoModal(true)}
        className="px-2 py-1 text-xs rounded flex items-center justify-center gap-1 transition-colors border bg-black hover:text-black w-full md:w-auto"
        style={{ borderColor: "#BF8D6B", color: "#ffffffff" }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#BF8D6B";
          e.currentTarget.style.color = "white";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "black";
          e.currentTarget.style.color = "#ffffffff";
        }}
      >
        <span>Agregar Graduado</span>
      </button>

      <button
        onClick={handleAsignarVendedor}
        disabled={selectedUsers.length === 0}
        className={`px-2 py-1 text-xs rounded flex items-center justify-center gap-1 transition-colors border w-full md:w-auto ${
          selectedUsers.length === 0
            ? "bg-gray-600 text-gray-400 cursor-not-allowed"
            : "bg-black hover:text-black"
        }`}
        style={
          selectedUsers.length === 0
            ? { borderColor: "#BF8D6B" }
            : { borderColor: "#BF8D6B", color: "#ffffffff" }
        }
        onMouseEnter={(e) => {
          if (selectedUsers.length > 0) {
            e.currentTarget.style.backgroundColor = "#BF8D6B";
            e.currentTarget.style.color = "white";
          }
        }}
        onMouseLeave={(e) => {
          if (selectedUsers.length > 0) {
            e.currentTarget.style.backgroundColor = "black";
            e.currentTarget.style.color = "#ffffffff";
          }
        }}
      >
        <span>Asignar Vendedor</span>
      </button>

      <button
        onClick={handleAsignarAdministrador}
        disabled={selectedUsers.length === 0}
        className={`px-2 py-1 text-xs rounded flex items-center justify-center gap-1 transition-colors border w-full md:w-auto ${
          selectedUsers.length === 0
            ? "bg-gray-600 text-gray-400 cursor-not-allowed"
            : "bg-black hover:text-black"
        }`}
        style={
          selectedUsers.length === 0
            ? { borderColor: "#BF8D6B" }
            : { borderColor: "#BF8D6B", color: "#ffffffff" }
        }
        onMouseEnter={(e) => {
          if (selectedUsers.length > 0) {
            e.currentTarget.style.backgroundColor = "#BF8D6B";
            e.currentTarget.style.color = "white";
          }
        }}
        onMouseLeave={(e) => {
          if (selectedUsers.length > 0) {
            e.currentTarget.style.backgroundColor = "black";
            e.currentTarget.style.color = "#ffffffff";
          }
        }}
      >
        <span>Asignar Administrador</span>
      </button>
    </div>
  );
}
