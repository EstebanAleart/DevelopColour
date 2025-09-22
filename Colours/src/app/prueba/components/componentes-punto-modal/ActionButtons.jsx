export default function ActionButtons({ onClose, onSubmit }) {
  return (
    <div className="flex flex-col-reverse md:flex-row gap-2 md:gap-2 mt-3 md:mt-4">
      <button
        type="button"
        onClick={onClose}
        className="w-full md:w-auto px-3 py-1.5 md:py-2 text-xs md:text-sm text-white bg-transparent border border-[#BF8D6B] rounded hover:bg-[#BF8D6B] hover:bg-opacity-20 transition-colors"
      >
        Cancelar
      </button>
      <button
        type="button"
        onClick={onSubmit}
        className="w-full md:w-auto px-3 py-1.5 md:py-2 text-xs md:text-sm font-bold rounded bg-[#BF8D6B] text-white hover:bg-[#a67454] transition-colors"
      >
        Crear
      </button>
    </div>
  );
}
