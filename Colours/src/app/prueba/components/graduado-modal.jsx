"use client";

import { X } from "lucide-react";

export default function GraduadoModal({ onClose }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-2 md:p-4 ">
      <div className="bg-[#1a1a1a] rounded-lg p-3 md:p-6 w-full max-w-xs md:max-w-md max-h-[95vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <h2 className="text-base md:text-xl font-semibold text-white">
            Graduado
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 md:p-0"
          >
            <X className="h-4 w-4 md:h-5 md:w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 md:gap-4 mb-4 md:mb-4">
          <input
            type="text"
            value="Juan Pérez"
            readOnly
            className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] text-xs md:text-sm"
          />
          <input
            type="text"
            value="Mercado Pago"
            readOnly
            className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] text-xs md:text-sm"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 md:gap-4 mb-4 md:mb-4">
          <input
            type="text"
            value="Sagrado Corazón Turno Mañana 2025"
            readOnly
            className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] text-xs md:text-sm"
          />
        </div>

        <div className="mb-4 md:mb-4">
          <p className="text-xs md:text-sm text-gray-400 mb-2">
            Máximo de Tarjetas
          </p>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div className="flex justify-between items-center">
              <span className="text-xs md:text-sm">Adultos</span>
              <div className="bg-[#1E2330] rounded px-2 py-1 w-8 md:w-10 text-center text-xs md:text-sm">
                10
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs md:text-sm">100.000$</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div className="flex justify-between items-center">
              <span className="text-xs md:text-sm">Menores</span>
              <div className="bg-[#1E2330] rounded px-2 py-1 w-8 md:w-10 text-center text-xs md:text-sm">
                5
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs md:text-sm">100.000$</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div className="flex justify-between items-center">
              <span className="text-xs md:text-sm">Adultos Sin Cargo</span>
              <div className="bg-[#1E2330] rounded px-2 py-1 w-8 md:w-10 text-center text-xs md:text-sm">
                3
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs md:text-sm">0$</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div className="flex justify-between items-center">
              <span className="text-xs md:text-sm">Menores Sin Cargo</span>
              <div className="bg-[#1E2330] rounded px-2 py-1 w-8 md:w-10 text-center text-xs md:text-sm">
                3
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs md:text-sm">0$</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:gap-4 mb-4 md:mb-4">
          <input
            type="text"
            value="Aires Eventos"
            readOnly
            className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] text-xs md:text-sm"
          />
          <input
            type="text"
            value="Colour Producciones"
            readOnly
            className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] text-xs md:text-sm"
          />
          <input
            type="text"
            value="Graduación"
            readOnly
            className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] text-xs md:text-sm"
          />
          <input
            type="text"
            value="20/12/2026"
            readOnly
            className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] text-xs md:text-sm"
          />
        </div>

        <div className="flex justify-between items-center mb-4 md:mb-4">
          <span className="font-semibold text-xs md:text-sm">
            Total Compra:
          </span>
          <div className="bg-[#1E2330] rounded px-3 md:px-4 py-1 md:py-2 text-center text-xs md:text-sm">
            200.000$
          </div>
        </div>

        <button
          className="w-full mt-3 md:mt-4 font-bold py-2 md:py-2 px-2 rounded bg-[#BF8D6B] text-white text-xs md:text-sm"
          onClick={onClose}
        >
          Volver
        </button>
      </div>
    </div>
  );
}
