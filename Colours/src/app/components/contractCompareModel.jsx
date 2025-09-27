"use client"
import { X, FileText, CheckCircle, XCircle } from "lucide-react"

export default function ContractCompareModal({ compareData, onClose }) {
  if (!compareData) return null

  const { comparacion, subtipos } = compareData

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6" style={{ color: "#BF8D6B" }} />
            <h2 className="text-xl font-semibold text-white">Comparación de Contrato</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Resumen General */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Resumen General</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold" style={{ color: "#BF8D6B" }}>
                  {comparacion.resumen.total_vendidas}
                </p>
                <p className="text-sm text-gray-300">Total Vendidas</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold" style={{ color: "#BF8D6B" }}>
                  {comparacion.resumen.total_minimo}
                </p>
                <p className="text-sm text-gray-300">Mínimo Contratado</p>
              </div>
              <div className="text-center">
                <p
                  className={`text-2xl font-bold ${
                    comparacion.resumen.diferencia_total >= 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {comparacion.resumen.diferencia_total >= 0 ? "+" : ""}
                  {comparacion.resumen.diferencia_total}
                </p>
                <p className="text-sm text-gray-300">Diferencia</p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-center gap-2">
              {comparacion.contrato_completo ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="text-green-400 font-medium">Contrato Cumplido</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-400" />
                  <span className="text-red-400 font-medium">Contrato Pendiente</span>
                </>
              )}
            </div>
          </div>

          {/* Detalles por Categoría */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cenas */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-white mb-3">Cenas</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Vendidas:</span>
                  <span className="text-white font-medium">{comparacion.cenas.vendidas}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Mínimo:</span>
                  <span className="text-white font-medium">{comparacion.cenas.minimo_contratado}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Diferencia:</span>
                  <span
                    className={`font-medium ${comparacion.cenas.diferencia >= 0 ? "text-green-400" : "text-red-400"}`}
                  >
                    {comparacion.cenas.diferencia >= 0 ? "+" : ""}
                    {comparacion.cenas.diferencia}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Cumplimiento:</span>
                  <span
                    className={`font-medium ${comparacion.cenas.cumple_minimo ? "text-green-400" : "text-red-400"}`}
                  >
                    {Number.parseFloat(comparacion.cenas.porcentaje_cumplimiento).toFixed(2)}%
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {comparacion.cenas.cumple_minimo ? (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-400" />
                  )}
                  <span className={`text-sm ${comparacion.cenas.cumple_minimo ? "text-green-400" : "text-red-400"}`}>
                    {comparacion.cenas.cumple_minimo ? "Cumplido" : "Pendiente"}
                  </span>
                </div>
              </div>
            </div>

            {/* Brindis */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-white mb-3">Brindis</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Vendidas:</span>
                  <span className="text-white font-medium">{comparacion.brindis.vendidas}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Mínimo:</span>
                  <span className="text-white font-medium">{comparacion.brindis.minimo_contratado}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Diferencia:</span>
                  <span
                    className={`font-medium ${comparacion.brindis.diferencia >= 0 ? "text-green-400" : "text-red-400"}`}
                  >
                    {comparacion.brindis.diferencia >= 0 ? "+" : ""}
                    {comparacion.brindis.diferencia}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Cumplimiento:</span>
                  <span
                    className={`font-medium ${comparacion.brindis.cumple_minimo ? "text-green-400" : "text-red-400"}`}
                  >
                    {Number.parseFloat(comparacion.brindis.porcentaje_cumplimiento).toFixed(2)}%
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {comparacion.brindis.cumple_minimo ? (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-400" />
                  )}
                  <span className={`text-sm ${comparacion.brindis.cumple_minimo ? "text-green-400" : "text-red-400"}`}>
                    {comparacion.brindis.cumple_minimo ? "Cumplido" : "Pendiente"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Disponibilidad por Subtipo */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-white mb-4">Disponibilidad por Subtipo</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {subtipos.map((subtipo, index) => (
                <div key={index} className="bg-gray-600 rounded-lg p-3">
                  <h5 className="font-medium text-white capitalize mb-2">{subtipo.subtipoNombre}</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Disponible:</span>
                      <span className="font-medium" style={{ color: "#BF8D6B" }}>
                        {subtipo.cantidad_disponible}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Vendida:</span>
                      <span className="text-green-400 font-medium">{subtipo.cantidad_vendida}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Restante:</span>
                      <span className="font-medium" style={{ color: "#BF8D6B" }}>
                        {subtipo.cantidad_disponible - subtipo.cantidad_vendida}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end p-6 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg transition-colors border-2 bg-black hover:text-black"
            style={{ borderColor: "#BF8D6B", color: "#BF8D6B" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#BF8D6B"
              e.currentTarget.style.color = "white"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "black"
              e.currentTarget.style.color = "#BF8D6B"
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

