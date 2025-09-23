import { ChevronRight } from "lucide-react";

const Pagination = ({ totalPages, currentPage, setCurrentPage }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-4 flex justify-center gap-0.5">
      {currentPage > 1 && (
        <button
          className="px-2 py-1 text-xs rounded transition-colors border bg-black hover:text-black"
          style={{ borderColor: "#BF8D6B", color: "#BF8D6B" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#BF8D6B";
            e.currentTarget.style.color = "black";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "black";
            e.currentTarget.style.color = "#BF8D6B";
          }}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          <ChevronRight className="h-3 w-3 rotate-180" />
        </button>
      )}
      {[...Array(totalPages)].map((_, index) => {
        if (
          index === 0 ||
          index === totalPages - 1 ||
          (index >= currentPage - 2 && index <= currentPage + 0)
        ) {
          return (
            <button
              key={index}
              className={`px-2 py-1 text-xs rounded transition-colors border ${
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
          );
        } else if (
          (index === currentPage - 3 && currentPage > 3) ||
          (index === currentPage + 1 && currentPage < totalPages - 2)
        ) {
          return (
            <span
              key={index}
              className="flex items-center justify-center px-1 text-gray-400 text-xs"
            >
              ...
            </span>
          );
        }
        return null;
      })}
      {currentPage < totalPages && (
        <button
          className="px-2 py-1 text-xs rounded transition-colors border bg-black hover:text-black"
          style={{ borderColor: "#BF8D6B", color: "#BF8D6B" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#BF8D6B";
            e.currentTarget.style.color = "black";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "black";
            e.currentTarget.style.color = "#BF8D6B";
          }}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          <ChevronRight className="h-3 w-3" />
        </button>
      )}
    </div>
  );
};

export default Pagination;
