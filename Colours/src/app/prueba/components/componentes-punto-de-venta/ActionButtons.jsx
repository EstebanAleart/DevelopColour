export default function ActionButtons({ setShowModal, setShowUploadModal }) {
  return (
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
        onClick={() => setShowModal(true)}
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
        onClick={() => setShowUploadModal(true)}
      >
        <span className="text-xs md:text-sm">Cargar imágenes</span>
      </button>
    </div>
  );
}
