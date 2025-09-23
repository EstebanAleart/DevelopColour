import { Search } from "lucide-react";

export default function SearchBar({ searchTerm, setSearchTerm }) {
  return (
    <div className="relative flex-grow">
      <input
        type="text"
        placeholder="Buscar por nombre, razón social, dirección, email, CUIT o teléfono..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
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
  );
}
