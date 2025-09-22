import { Search, ListFilter, ChevronDown, ChevronUp } from "lucide-react";

const SalonesFilters = ({
  searchTerm,
  handleSearch,
  filterMode,
  handleFilterChange,
  showFilters,
  setShowFilters,
  onAddSalon,
  onUploadImages,
  selectedSalones,
  onBulkActivate,
  onBulkDeactivate,
}) => {
  return (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row md:items-center gap-2 w-full mb-4">
        {/* Campo de búsqueda */}
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Buscar por nombre, contacto, email, WhatsApp o CUIT..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full md:w-64 py-2 px-8 text-sm bg-black border-2 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent rounded-full"
            style={{
              borderColor: "#BF8D6B",
              color: "#ffffffff",
              "--tw-ring-color": "#BF8D6B",
            }}
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <Search className="h-4 w-4" style={{ color: "#BF8D6B" }} />
          </div>
        </div>

        {/* Botones de filtro y acción */}
        <div className="flex flex-wrap gap-2 md:gap-2">
          {/* Botón para mostrar/ocultar filtros en móvil */}
          <div className="md:hidden w-full">
            <button
              className="w-full px-3 py-2 text-sm rounded flex items-center justify-center gap-1 transition-colors border-2 bg-black hover:text-black"
              style={{ borderColor: "#BF8D6B", color: "#ffffffff" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#BF8D6B";
                e.currentTarget.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "black";
                e.currentTarget.style.color = "#ffffffff";
              }}
              onClick={() => setShowFilters(!showFilters)}
            >
              <ListFilter className="h-4 w-4" />
              <span>Filtros</span>
              {showFilters ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Contenedor de filtros */}
          <div
            className={`${
              showFilters ? "flex" : "hidden"
            } md:flex flex-col md:flex-row gap-1 w-full md:w-auto`}
          >
            <button
              className={`px-3 py-2 text-sm rounded-l flex items-center justify-center gap-1 transition-colors border-2 ${
                filterMode === "active"
                  ? "text-[#BF8D6B]"
                  : "bg-black hover:text-white"
              }`}
              style={
                filterMode === "active"
                  ? { backgroundColor: "#000000ff", borderColor: "#BF8D6B" }
                  : { borderColor: "#BF8D6B", color: "#ffffffff" }
              }
              onMouseEnter={(e) => {
                if (filterMode !== "active") {
                  e.currentTarget.style.backgroundColor = "#000000ff";
                  e.currentTarget.style.color = "#BF8D6B";
                }
              }}
              onMouseLeave={(e) => {
                if (filterMode !== "active") {
                  e.currentTarget.style.backgroundColor = "black";
                  e.currentTarget.style.color = "#ffffffff";
                }
              }}
              onClick={() => {
                handleFilterChange("active");
                setShowFilters(false);
              }}
            >
              <span className="text-xs md:text-sm">Activos</span>
            </button>
            <button
              className={`px-3 py-2 text-sm flex items-center justify-center gap-1 transition-colors border-2 ${
                filterMode === "inactive"
                  ? "text-[#BF8D6B]"
                  : "bg-black hover:text-white"
              }`}
              style={
                filterMode === "inactive"
                  ? { backgroundColor: "#000000ff", borderColor: "#BF8D6B" }
                  : { borderColor: "#BF8D6B", color: "#ffffffff" }
              }
              onMouseEnter={(e) => {
                if (filterMode !== "inactive") {
                  e.currentTarget.style.backgroundColor = "#000000ff";
                  e.currentTarget.style.color = "#BF8D6B";
                }
              }}
              onMouseLeave={(e) => {
                if (filterMode !== "inactive") {
                  e.currentTarget.style.backgroundColor = "black";
                  e.currentTarget.style.color = "#ffffffff";
                }
              }}
              onClick={() => {
                handleFilterChange("inactive");
                setShowFilters(false);
              }}
            >
              <span className="text-xs md:text-sm">Inactivos</span>
            </button>
            <button
              className={`px-3 py-2 text-sm rounded-r flex items-center justify-center gap-1 transition-colors border-2 ${
                filterMode === "all"
                  ? "text-[#BF8D6B"
                  : "bg-black hover:text-white"
              }`}
              style={
                filterMode === "all"
                  ? { backgroundColor: "#000000ff", borderColor: "#BF8D6B" }
                  : { borderColor: "#BF8D6B", color: "#ffffffff" }
              }
              onMouseEnter={(e) => {
                if (filterMode !== "all") {
                  e.currentTarget.style.backgroundColor = "#000000ff";
                  e.currentTarget.style.color = "#BF8D6B";
                }
              }}
              onMouseLeave={(e) => {
                if (filterMode !== "all") {
                  e.currentTarget.style.backgroundColor = "black";
                  e.currentTarget.style.color = "#ffffffff";
                }
              }}
              onClick={() => {
                handleFilterChange("all");
                setShowFilters(false);
              }}
            >
              <span className="text-xs md:text-sm">Todos</span>
            </button>
          </div>

          {/* Botones de acción principales */}
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto ml-auto">
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
              onClick={onAddSalon}
            >
              <span className="text-xs md:text-sm">Agregar</span>
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
              onClick={onUploadImages}
            >
              <span className="text-xs md:text-sm">Cargar imágenes</span>
            </button>
          </div>
        </div>
      </div>

      {/* Botones de acciones masivas */}
      {selectedSalones.length > 0 && (
        <div className="flex flex-col md:flex-row gap-2">
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
            onClick={onBulkActivate}
          >
            <span className="text-xs md:text-sm">
              Activar {selectedSalones.length}
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
            onClick={onBulkDeactivate}
          >
            <span className="text-xs md:text-sm">
              Desactivar {selectedSalones.length}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default SalonesFilters;
