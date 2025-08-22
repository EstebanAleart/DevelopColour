"use client"
import { useRef, useState } from "react"
import { jsPDF } from "jspdf"
import { X, Download, FileText, User, Calendar, Tag, Loader, CreditCard } from "lucide-react"
import PagoModal from "./pagoModal"

export default function OrdenCompraModal({
  isOpen,
  onClose,
  buyerData,
  eventData,
  selectedTickets,
  subtotal,
  total,
  orderSuccess,
  orderError,
  orderId,
  // Nuevos props para método de pago
  selectedPaymentMethod,
  paymentMethodName,
  taxDetails,

  onPaymentSuccess,
}) {
  const summaryRef = useRef(null)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [pdfError, setPdfError] = useState(null)
  const [showPagoModal, setShowPagoModal] = useState(false)

  if (!isOpen) return null

  const finalOrderId =
    orderId || (typeof window !== "undefined" && localStorage.getItem("currentOrderId")) || "TEMP-" + Date.now()

  const downloadPDF = async () => {
    try {
      setIsGeneratingPDF(true)
      setPdfError(null)

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(18)
      pdf.text("Resumen de Orden", 105, 20, { align: "center" })

      if (finalOrderId) {
        pdf.setFontSize(12)
        pdf.text(`Orden #${finalOrderId}`, 105, 30, { align: "center" })
      }

      const fileName = `Orden_${finalOrderId}_${new Date().toISOString().slice(0, 10)}.pdf`
      pdf.save(fileName)
    } catch (error) {
      setPdfError(`Error al generar el PDF: ${error.message}`)
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const handleCrearPago = () => {
    setShowPagoModal(!showPagoModal)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="flex flex-col lg:flex-row gap-4 w-full h-full max-w-7xl">
        <div
          className={`bg-gray-800 rounded-lg border-2 border-[#BF8D6B] p-4 sm:p-6 overflow-y-auto ${
            showPagoModal ? "w-full lg:w-1/2 h-1/2 lg:h-full" : "w-full max-w-2xl mx-auto h-full max-h-[90vh]"
          }`}
        >
          <div className="flex justify-between items-center mb-4 sm:mb-6 bg-gray-800 pb-2 border-b border-gray-700">
            <div>
              <h2 className="text-xl font-semibold text-white">Resumen de Orden</h2>
              <p className="text-sm text-gray-300">Orden #{finalOrderId}</p>
            </div>
            <button onClick={onClose} className="text-[#BF8D6B] hover:text-[#A67A5B] transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="bg-white text-black p-6 rounded-lg">
            <div className="mb-4 border-b pb-3">
              <div className="flex items-center mb-2">
                <User className="h-5 w-5 mr-2 text-[#BF8D6B]" />
                <h3 className="font-semibold">Datos del Graduado</h3>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-gray-600">Nombre:</p>
                  <p>{buyerData?.name}</p>
                </div>
                <div>
                  <p className="text-gray-600">DNI:</p>
                  <p>{buyerData?.dni}</p>
                </div>
                <div>
                  <p className="text-gray-600">WhatsApp:</p>
                  <p>{buyerData?.whatsapp}</p>
                </div>
                <div>
                  <p className="text-gray-600">Email:</p>
                  <p className="truncate">{buyerData?.email}</p>
                </div>
              </div>
            </div>

            <div className="mb-4 border-b pb-3">
              <div className="flex items-center mb-2">
                <Calendar className="h-5 w-5 mr-2 text-[#BF8D6B]" />
                <h3 className="font-semibold">Evento</h3>
              </div>
              <p className="font-medium">{eventData?.nombre}</p>
              <p className="text-sm text-gray-600">{eventData?.lugar}</p>
              <p className="text-sm text-gray-600">{eventData?.fecha}</p>
            </div>

            <div className="mb-4 border-b pb-3">
              <div className="flex items-center mb-2">
                <Tag className="h-5 w-5 mr-2 text-[#BF8D6B]" />
                <h3 className="font-semibold">Entradas</h3>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-1">Tipo</th>
                    <th className="text-center py-1">Cant.</th>
                    <th className="text-right py-1">Precio</th>
                    <th className="text-right py-1">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedTickets?.map((ticket) => (
                    <tr key={ticket.id} className="border-b border-gray-100">
                      <td className="py-1">{ticket.tipo}</td>
                      <td className="text-center py-1">{ticket.cantidad}</td>
                      <td className="text-right py-1">${ticket.precio?.toLocaleString()}</td>
                      <td className="text-right py-1">${ticket.subtotal?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mostrar método de pago seleccionado */}
            {selectedPaymentMethod && (
              <div className="mb-4 border-b pb-3">
                <div className="flex items-center mb-2">
                  <CreditCard className="h-5 w-5 mr-2 text-[#BF8D6B]" />
                  <h3 className="font-semibold">Método de Pago</h3>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="font-medium text-blue-800">{paymentMethodName}</p>
                  {taxDetails?.taxPercentage > 0 && (
                    <p className="text-sm text-blue-700">Impuesto aplicado: {taxDetails.taxPercentage}%</p>
                  )}
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center mb-2">
                <FileText className="h-5 w-5 mr-2 text-[#BF8D6B]" />
                <h3 className="font-semibold">Resumen</h3>
              </div>
              <div className="flex justify-between mb-1">
                <span>Subtotal</span>
                <span>${subtotal?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span>Total Base</span>
                <span>${taxDetails?.baseAmount?.toLocaleString() || subtotal?.toLocaleString()}</span>
              </div>
              {/* Mostrar impuestos si los hay */}
              {taxDetails?.taxAmount > 0 && (
                <div className="flex justify-between mb-1 text-sm text-orange-600">
                  <span>Impuesto ({taxDetails.taxPercentage}%)</span>
                  <span>+${taxDetails.taxAmount?.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t">
                <span>Total Final</span>
                <span className={taxDetails?.taxAmount > 0 ? "text-orange-600" : ""}>${total?.toLocaleString()}</span>
              </div>
            </div>

            {orderSuccess && (
              <div className="mt-4 p-2 bg-green-100 text-green-800 rounded text-center">
                ¡Orden procesada correctamente!
              </div>
            )}

            {orderError && <div className="mt-4 p-2 bg-red-100 text-red-800 rounded text-center">{orderError}</div>}
          </div>

          {pdfError && <div className="mt-4 p-2 bg-red-100 text-red-800 rounded text-center">{pdfError}</div>}

          <div className="flex flex-col sm:flex-row justify-between gap-3 mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-[#BF8D6B] text-[#BF8D6B] hover:bg-[#BF8D6B]/10 rounded-lg transition-colors flex items-center justify-center"
              disabled={isGeneratingPDF}
            >
              <X className="h-4 w-4 mr-1" />
              Cerrar
            </button>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleCrearPago}
                className="px-4 py-2 bg-[#BF8D6B] hover:bg-[#A67A5B] text-white rounded-lg border border-[#BF8D6B] transition-colors flex items-center justify-center"
                disabled={isGeneratingPDF}
              >
                <CreditCard className="h-4 w-4 mr-1" />
                {showPagoModal ? "Ocultar Pago" : "Crear Pago"}
              </button>
              {/* <button
                onClick={downloadPDF}
                disabled={isGeneratingPDF}
                className={`px-4 py-2 ${
                  isGeneratingPDF ? "bg-gray-500" : "bg-[#BF8D6B] hover:bg-[#A67A5B]"
                } text-white rounded-lg border border-[#BF8D6B] transition-colors flex items-center justify-center`}
              >
                {isGeneratingPDF ? (
                  <>
                    <Loader className="h-4 w-4 mr-1 animate-spin" />
                    Generando PDF...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-1" />
                    Descargar PDF
                  </>
                )}
              </button> */}
            </div>
          </div>
        </div>

        {showPagoModal && (
          <div className="w-full lg:w-1/2 h-1/2 lg:h-full">
            <PagoModal
              isOpen={true}
              onClose={() => setShowPagoModal(false)}
              orderId={finalOrderId}
              total={total}
              metodoDeCobroId={selectedPaymentMethod || null}
              paymentMethodName={paymentMethodName}
              taxDetails={taxDetails}
              isInline={true}
              onPaymentSuccess={onPaymentSuccess}
            />
          </div>
        )}
      </div>
    </div>
  )
}
