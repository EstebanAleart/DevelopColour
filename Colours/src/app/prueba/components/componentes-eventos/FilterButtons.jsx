export default function FilterButtons({
  filterMode,
  setFilterMode,
  setShowFilters,
}) {
  const filters = [
    { mode: "active", label: "Activos" },
    { mode: "inactive", label: "Inactivos" },
    { mode: "all", label: "Todos" },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-1 w-full md:w-auto">
      {filters.map((filter, index) => (
        <button
          key={filter.mode}
          className={`px-3 py-2 text-sm flex items-center justify-center gap-1 transition-colors border-2 ${
            filterMode === filter.mode
              ? "text-[#BF8D6B]"
              : "bg-black hover:text-white"
          } ${
            index === 0
              ? "rounded-l"
              : index === filters.length - 1
              ? "rounded-r"
              : ""
          }`}
          style={
            filterMode === filter.mode
              ? { backgroundColor: "#000000ff", borderColor: "#BF8D6B" }
              : { borderColor: "#BF8D6B", color: "#ffffffff" }
          }
          onMouseEnter={(e) => {
            if (filterMode !== filter.mode) {
              e.currentTarget.style.backgroundColor = "#000000ff";
              e.currentTarget.style.color = "#BF8D6B";
            }
          }}
          onMouseLeave={(e) => {
            if (filterMode !== filter.mode) {
              e.currentTarget.style.backgroundColor = "black";
              e.currentTarget.style.color = "#ffffffff";
            }
          }}
          onClick={() => {
            setFilterMode(filter.mode);
            setShowFilters(false);
          }}
        >
          <span className="text-xs md:text-sm">{filter.label}</span>
        </button>
      ))}
    </div>
  );
}
