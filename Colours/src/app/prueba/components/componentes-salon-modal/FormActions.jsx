import { Check } from "lucide-react";

export default function FormActions({ onClose, isSubmitting }) {
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
        type="submit"
        className="w-full md:w-auto px-3 py-1.5 md:py-2 text-xs md:text-sm font-bold rounded bg-[#BF8D6B] text-white hover:bg-[#a67454] transition-colors flex items-center justify-center gap-1"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          "Guardando..."
        ) : (
          <>
            <Check className="h-3 w-3 md:h-4 md:w-4" />
            <span>Guardar Salón</span>
          </>
        )}
      </button>
    </div>
  );
}
