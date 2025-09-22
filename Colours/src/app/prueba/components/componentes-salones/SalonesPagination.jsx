import { ChevronRight } from "lucide-react";

const SalonesPagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-6 flex justify-center gap-1">
      {currentPage > 1 && (
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
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronRight className="h-4 w-4 rotate-180" />
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
              onClick={() => onPageChange(index + 1)}
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
              className="flex items-center justify-center px-2 text-gray-400"
            >
              ...
            </span>
          );
        }
        return null;
      })}
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
          onClick={() => onPageChange(currentPage + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default SalonesPagination;
