import { ChevronRight } from "lucide-react";

const Pagination = ({ totalPages, currentPage, setCurrentPage }) => {
  return (
    <div className="mt-6 flex justify-center gap-1">
      {[...Array(totalPages)].map((_, index) => (
        <PaginationButton
          key={index}
          pageNumber={index + 1}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      ))}

      {currentPage < totalPages && (
        <NextPageButton
          setCurrentPage={setCurrentPage}
          currentPage={currentPage}
        />
      )}
    </div>
  );
};

const PaginationButton = ({ pageNumber, currentPage, setCurrentPage }) => {
  const isActive = currentPage === pageNumber;

  return (
    <button
      className={`px-3 py-2 text-sm rounded transition-colors border-2 ${
        isActive ? "text-black" : "bg-black hover:text-black"
      }`}
      style={
        isActive
          ? { backgroundColor: "#BF8D6B", borderColor: "#BF8D6B" }
          : { borderColor: "#BF8D6B", color: "#BF8D6B" }
      }
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = "#BF8D6B";
          e.currentTarget.style.color = "black";
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = "black";
          e.currentTarget.style.color = "#BF8D6B";
        }
      }}
      onClick={() => setCurrentPage(pageNumber)}
    >
      {pageNumber}
    </button>
  );
};

const NextPageButton = ({ setCurrentPage, currentPage }) => {
  return (
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
      onClick={() => setCurrentPage(currentPage + 1)}
    >
      <ChevronRight className="h-4 w-4" />
    </button>
  );
};

export default Pagination;
