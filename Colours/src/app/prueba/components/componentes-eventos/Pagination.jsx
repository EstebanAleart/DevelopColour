import { ChevronRight } from "lucide-react";

export default function Pagination({
  totalPages,
  currentPage,
  setCurrentPage,
}) {
  return (
    <div className="mt-6 flex justify-center gap-1">
      {[...Array(totalPages)].map((_, index) => (
        <button
          key={index}
          className={`px-3 py-2 text-sm rounded transition-colors border-2 ${
            currentPage === index + 1
              ? "text-black"
              : "bg-black hover:text-black"
          }`}
          style={
            currentPage === index + 1
              ? { backgroundColor: "#BF8D6B", borderColor: "#BF8D6B" }
              : { borderColor: "#BF8D6B", color: "#BF8D6B" }
          }
          onMouseEnter={(e) => {
            if (currentPage !== index + 1) {
              e.currentTarget.style.backgroundColor = "#BF8D6B";
              e.currentTarget.style.color = "black";
            }
          }}
          onMouseLeave={(e) => {
            if (currentPage !== index + 1) {
              e.currentTarget.style.backgroundColor = "black";
              e.currentTarget.style.color = "#BF8D6B";
            }
          }}
          onClick={() => setCurrentPage(index + 1)}
        >
          {index + 1}
        </button>
      ))}
      {currentPage < totalPages && (
        <button
          className="px-3 py-2 text-sm rounded transition-colors border-2 bg-black hover:text-black"
          style={{ borderColor: "#BF8D6B", color: "#BF8D6B" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#BF8D6B";
            e.currentTarget.style.color = "black";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "black";
            e.currentTarget.style.color = "#BF8D6B";
          }}
          onClick={() => setCurrentPage((prev) => prev + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
