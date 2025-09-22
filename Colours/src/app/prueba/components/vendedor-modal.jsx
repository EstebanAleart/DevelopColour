"use client";

import { X, Search } from "lucide-react";

export default function VendedorModal({ onClose }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-2 md:p-4 ">
      <div className="bg-[#1a1a1a] rounded-lg p-3 md:p-6 w-full max-w-xs md:max-w-md max-h-[95vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <h2 className="text-base md:text-xl font-semibold text-white">
            Agregar Vendedor
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 md:p-0"
          >
            <X className="h-4 w-4 md:h-5 md:w-5" />
          </button>
        </div>

        <div className="relative mb-3 md:mb-4">
          <input
            type="text"
            placeholder="Buscar Vendedor"
            className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs md:text-sm pl-8"
          />
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3 md:h-4 md:w-4" />
        </div>

        <button className="w-full mt-3 md:mt-4 font-bold py-2 md:py-2 px-2 rounded bg-[#BF8D6B] text-white text-xs md:text-sm">
          Asignar
        </button>
      </div>
    </div>
  );
}
