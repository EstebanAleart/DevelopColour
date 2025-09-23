import { ListFilter, ChevronUp, ChevronDown } from "lucide-react";

export default function FilterButtons({
  filterMode,
  setFilterMode,
  showFilters,
  setShowFilters,
}) {
  return (
    <>
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
          onClick={() => setFilterMode("active")}
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
          onClick={() => setFilterMode("inactive")}
        >
          <span className="text-xs md:text-sm">Inactivos</span>
        </button>
        <button
          className={`px-3 py-2 text-sm rounded-r flex items-center justify-center gap-1 transition-colors border-2 ${
            filterMode === "all"
              ? "text-[#BF8D6B]"
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
          onClick={() => setFilterMode("all")}
        >
          <span className="text-xs md:text-sm">Todos</span>
        </button>
      </div>
    </>
  );
}
