export default function TaxRateModal({
  showTaxRateModal,
  setShowTaxRateModal,
  taxRateForm,
  setTaxRateForm,
  handleTaxRateSubmit,
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-2 md:p-4 bg-black bg-opacity-70">
      <div className="bg-[#1a1a1a] rounded-lg p-4 md:p-6 w-full max-w-xs md:max-w-md shadow-lg">
        <h3 className="text-base md:text-lg font-bold text-white mb-4">
          Agregar Tasa de Impuesto
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-white mb-2">
              Número de Cuotas
            </label>
            <input
              type="number"
              min="0"
              step="1"
              value={taxRateForm.cuotas}
              onChange={(e) =>
                setTaxRateForm((prev) => ({
                  ...prev,
                  cuotas: e.target.value,
                }))
              }
              className="w-full p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-[#BF8D6B]"
              placeholder="Ej: 3, 6, 12"
            />
          </div>

          <div>
            <label className="block text-sm text-white mb-2">
              Porcentaje de Impuesto (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={taxRateForm.porcentaje}
              onChange={(e) =>
                setTaxRateForm((prev) => ({
                  ...prev,
                  porcentaje: e.target.value,
                }))
              }
              className="w-full p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 focus:outline-none focus:ring-1 md:focus:ring-2 focus:ring-[#BF8D6B]"
              placeholder="Ej: 10.5"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={() => setShowTaxRateModal(false)}
            className="px-4 py-2 text-white bg-transparent border border-[#BF8D6B] rounded hover:bg-gray-700 transition-colors text-xs md:text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={handleTaxRateSubmit}
            className="px-4 py-2 bg-[#BF8D6B] text-white rounded hover:bg-[#a67454] transition-colors text-xs md:text-sm"
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}
