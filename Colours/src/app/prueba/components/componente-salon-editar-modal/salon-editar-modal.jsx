"use client";

import { X, Check } from "lucide-react";
import { useSalonForm } from "./hook/useSalonForm";
import SalonFormFields from "./SalonFormFields";
import SalonImageSelector from "./SalonImageSelector";

export default function SalonEditarModal({ salon, onClose }) {
  const {
    formData,
    isSubmitting,
    error,
    successMessage,
    selectedImage,
    handleBlur,
    handleChange,
    handleSubmit,
    handleImageEdit,
  } = useSalonForm(salon, onClose);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-2 md:p-4">
      <div className="bg-[#1a1a1a] rounded-lg p-3 md:p-4 w-full max-w-4xl max-h-[95vh] overflow-y-auto shadow-lg">
        <div className="flex justify-between items-center mb-3 md:mb-4">
          <h2 className="text-base md:text-lg font-bold text-white">
            Editar Salón
          </h2>
          <button
            onClick={() => onClose(false)}
            className="text-gray-400 hover:text-white p-1 md:p-0"
            disabled={isSubmitting}
          >
            <X className="h-4 w-4 md:h-5 md:w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-3 md:mb-4 p-2 md:p-3 bg-red-900/50 text-red-300 text-xs md:text-sm rounded border border-red-700">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-3 md:mb-4 p-2 md:p-3 bg-green-900/50 text-green-300 text-xs md:text-sm rounded border border-green-700">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-2 md:space-y-3">
          <div className="flex flex-col md:flex-row md:space-x-4">
            <div className="w-full md:w-1/2">
              <SalonFormFields
                formData={formData}
                handleChange={handleChange}
                handleBlur={handleBlur}
                selectedImage={selectedImage}
              />
            </div>
            <div className="w-full md:w-1/2">
              <SalonImageSelector
                selectedImage={selectedImage}
                onImageSelect={handleImageEdit}
              />
            </div>
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              className="w-full max-w-xs mt-4 md:mt-6 font-bold py-2 md:py-3 px-2 rounded bg-[#BF8D6B] text-white text-xs md:text-sm flex items-center justify-center gap-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                "Actualizando..."
              ) : (
                <>
                  <Check className="h-3 w-3 md:h-4 md:w-4" />
                  <span>Actualizar</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
