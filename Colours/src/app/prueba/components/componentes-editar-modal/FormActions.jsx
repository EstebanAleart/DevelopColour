export default function FormActions({ onCancel, submitText }) {
  return (
    <div className="flex flex-col-reverse md:flex-row justify-end gap-2 md:gap-2">
      <button
        type="button"
        onClick={onCancel}
        className="w-full md:w-auto px-3 py-1.5 md:px-4 md:py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg border border-gray-500 transition-colors duration-300 text-xs md:text-sm"
      >
        Cancelar
      </button>
      <button
        type="submit"
        className="w-full md:w-auto px-3 py-1.5 md:px-4 md:py-2 bg-yellow-700 hover:bg-yellow-600 text-white rounded-lg border border-yellow-600 transition-colors duration-300 text-xs md:text-sm"
      >
        {submitText}
      </button>
    </div>
  );
}
