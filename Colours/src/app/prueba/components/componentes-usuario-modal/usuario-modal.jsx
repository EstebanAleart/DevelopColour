"use client";

import { X } from "lucide-react";
import Swal from "sweetalert2";
import { useUsuarioForm } from "./useUsuarioForm";
import FormFields from "./FormFields";
import apiUrls from "@/app/components/utils/apiConfig";

const API_URL = apiUrls;

export default function UsuarioModal({ onClose, onSave, userData }) {
  const { formData, loading, handleChange, handleBlur, handleSubmit } =
    useUsuarioForm({ onClose, onSave, userData, API_URL });

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-2 md:p-4 ">
      <div className="bg-[#1a1a1a] rounded-lg p-3 md:p-6 w-full max-w-xs md:max-w-2xl max-h-[95vh] overflow-y-auto shadow-lg">
        <div className="flex justify-between items-center mb-3 md:mb-6">
          <h2 className="text-base md:text-xl font-bold text-white">
            {userData ? "Editar Usuario" : "Agregar Usuario"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 md:p-0"
          >
            <X className="h-4 w-4 md:h-5 md:w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2 md:space-y-4">
          <FormFields
            formData={formData}
            userData={userData}
            handleChange={handleChange}
            handleBlur={handleBlur}
          />

          <div className="flex flex-col-reverse md:flex-row md:justify-end gap-2 md:gap-3 mt-3 md:mt-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full md:w-auto px-3 py-1.5 md:py-2 text-xs md:text-sm text-white bg-gray-600 rounded hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`w-full md:w-auto px-3 py-1.5 md:py-2 text-xs md:text-sm font-bold rounded transition-colors ${
                loading
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-[#BF8D6B] text-white hover:bg-[#a67454]"
              }`}
            >
              {loading ? "Cargando..." : userData ? "Guardar" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
