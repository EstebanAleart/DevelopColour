import { ListFilter, ChevronUp, ChevronDown } from "lucide-react";

const FilterButtons = ({
  filterMode,
  setFilterMode,
  showFilters,
  setShowFilters,
}) => {
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
        {["active", "inactive", "all"].map((mode) => (
          <FilterButton
            key={mode}
            mode={mode}
            filterMode={filterMode}
            setFilterMode={setFilterMode}
            setShowFilters={setShowFilters}
          />
        ))}
      </div>
    </>
  );
};

const FilterButton = ({ mode, filterMode, setFilterMode, setShowFilters }) => {
  const labels = {
    active: "Activos",
    inactive: "Inactivos",
    all: "Todos",
  };

  const isActive = filterMode === mode;

  return (
    <button
      className={`px-3 py-2 text-sm rounded flex items-center justify-center gap-1 transition-colors border-2 ${
        isActive ? "text-[#BF8D6B]" : "bg-black hover:text-white"
      }`}
      style={
        isActive
          ? { backgroundColor: "#000000ff", borderColor: "#BF8D6B" }
          : { borderColor: "#BF8D6B", color: "#ffffffff" }
      }
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = "#000000ff";
          e.currentTarget.style.color = "#BF8D6B";
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = "black";
          e.currentTarget.style.color = "#ffffffff";
        }
      }}
      onClick={() => {
        setFilterMode(mode);
        setShowFilters(false);
      }}
    >
      <span className="text-xs md:text-sm">{labels[mode]}</span>
    </button>
  );
};

export default FilterButtons;
