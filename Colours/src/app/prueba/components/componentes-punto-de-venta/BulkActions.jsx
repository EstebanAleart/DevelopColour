export default function BulkActions({
  selectedPuntos,
  bulkToggleStatus,
  bulkDeletePuntos,
}) {
  if (selectedPuntos.length === 0) return null;

  return (
    <div className="flex flex-col md:flex-row gap-3 mt-4">
      <button
        className="px-3 py-2 text-sm rounded flex items-center justify-center gap-1 transition-colors border-2 bg-black hover:text-black w-full md:w-auto"
        style={{ borderColor: "#BF8D6B", color: "#ffffffff" }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#BF8D6B";
          e.currentTarget.style.color = "white";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "black";
          e.currentTarget.style.color = "#ffffffff";
        }}
        onClick={() => bulkToggleStatus(true)}
      >
        <span className="text-xs md:text-sm">
          Activar {selectedPuntos.length}
        </span>
      </button>
      <button
        className="px-3 py-2 text-sm rounded flex items-center justify-center gap-1 transition-colors border-2 bg-black hover:text-black w-full md:w-auto"
        style={{ borderColor: "#BF8D6B", color: "#ffffffff" }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#BF8D6B";
          e.currentTarget.style.color = "white";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "black";
          e.currentTarget.style.color = "#ffffffff";
        }}
        onClick={() => bulkToggleStatus(false)}
      >
        <span className="text-xs md:text-sm">
          Desactivar {selectedPuntos.length}
        </span>
      </button>
      <button
        className="px-3 py-2 text-sm rounded flex items-center justify-center gap-1 transition-colors border-2 bg-black hover:text-black w-full md:w-auto"
        style={{ borderColor: "#BF8D6B", color: "#ffffffff" }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#BF8D6B";
          e.currentTarget.style.color = "white";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "black";
          e.currentTarget.style.color = "#ffffffff";
        }}
        onClick={bulkDeletePuntos}
      >
        <span className="text-xs md:text-sm">
          Eliminar {selectedPuntos.length}
        </span>
      </button>
    </div>
  );
}
