"use client";

import { X } from "lucide-react";

export default function GraduadoCrearModal({ onClose }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-2 md:p-4">
      <div className="bg-[#1a1a1a] rounded-lg p-3 md:p-6 w-full max-w-xs md:max-w-md max-h-[95vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <h2 className="text-base md:text-xl font-semibold text-white">
            Crear Graduado
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 md:p-0"
          >
            <X className="h-4 w-4 md:h-5 md:w-5" />
          </button>
        </div>

        <form className="space-y-3 md:space-y-4">
          <input
            type="text"
            placeholder="Juan Pérez"
            className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs md:text-sm"
          />

          <input
            type="text"
            placeholder="Código de Evento"
            className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs md:text-sm"
          />

          <input
            type="text"
            placeholder="36999888"
            className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs md:text-sm"
          />

          <input
            type="email"
            placeholder="juan@gmail.com"
            className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs md:text-sm"
          />

          <input
            type="text"
            placeholder="Calle Falsa 123"
            className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs md:text-sm"
          />

          <input
            type="text"
            placeholder="3413111888"
            className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs md:text-sm"
          />

          <input
            type="text"
            placeholder="Código de Usuario"
            className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs md:text-sm"
          />

          <div className="mt-3 md:mt-4 mb-3 md:mb-4">
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
                <span className="text-xs md:text-sm">3</span>
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
                <span className="text-xs md:text-sm">3</span>
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
                <span className="text-xs md:text-sm">3</span>
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
                <span className="text-xs md:text-sm">3</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-3 md:mt-4 font-bold py-2 md:py-2 px-2 rounded bg-[#BF8D6B] text-white text-xs md:text-sm"
          >
            Crear
          </button>
        </form>
      </div>
    </div>
  );
}
