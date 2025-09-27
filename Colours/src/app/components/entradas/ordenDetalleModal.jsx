"use client"

import { useEffect, useRef, useState } from "react"
import { X, User, Calendar, Tag, CreditCard, FileText, ImageIcon, Download, AlertTriangle } from "lucide-react"
import { jsPDF } from "jspdf"

// Componente helper para manejar imágenes con fallback
const ImageWithFallback = ({ src, alt, className }) => {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  const handleImageLoad = () => {
    setImageLoading(false)
    setImageError(false)
  }

  const handleImageError = () => {
    console.error("Error cargando imagen:", src)
    setImageLoading(false)
    setImageError(true)
  }

  if (!src || src.trim() === "") {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-gray-100 text-gray-500">
        <ImageIcon className="h-12 w-12 mb-2" />
        <p>No hay comprobante disponible</p>
      </div>
    )
  }

  return (
    <div className="relative">
      {imageLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#BF8D6B]"></div>
        </div>
      )}
      {imageError ? (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-100 text-gray-500">
          <ImageIcon className="h-12 w-12 mb-2" />
          <p>Error al cargar la imagen</p>
          <p className="text-xs mt-1">URL: {src}</p>
          <button
            onClick={() => {
              setImageError(false)
              setImageLoading(true)
            }}
            className="mt-2 px-3 py-1 bg-[#BF8D6B] text-white rounded text-xs hover:bg-[#A67A5B]"
          >
            Reintentar
          </button>
        </div>
      ) : (
        <img
          src={src || "/placeholder.svg"}
          alt={alt}
          className={className}
          onLoad={handleImageLoad}
          onError={handleImageError}
          style={{ display: imageLoading ? "none" : "block" }}
        />
      )}
    </div>
  )
}

export default function OrdenDetalleModal({ orden, onClose }) {
  const modalRef = useRef(null)
  const [isOpen, setIsOpen] = useState(!!orden) // Controla si el modal está abierto
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  // Acceder al primer pago si existe
  const firstPayment = orden.Pagos && orden.Pagos.length > 0 ? orden.Pagos[0] : null

  const notasDebito = orden.NotaDebitos || []

  // Manejar cierre con Escape y click fuera del modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose()
        setIsOpen(false) // Cierra el modal al presionar Escape
      }
    }
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose()
        setIsOpen(false) // Cierra el modal al hacer clic fuera
      }
    }
    document.addEventListener("keydown", handleEscape)
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [onClose])

  // Si no hay orden, no renderizar nada
  if (!isOpen) return null

  const formatFecha = (fecha) => {
    if (!fecha) return "Sin fecha"
    return new Date(fecha).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatMonto = (monto) => {
    return `$${Number.parseFloat(monto || 0).toLocaleString("es-ES", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  const getEventoNombre = () => {
    if (orden.DetalleDeOrdens && orden.DetalleDeOrdens.length > 0) {
      return orden.DetalleDeOrdens[0]?.Entrada?.Evento?.nombre || "Sin evento"
    }
    return "Sin evento"
  }

  const getRealOrderTotal = (order) => {
    let baseTotal = 0
    if (order.Pagos && order.Pagos.length > 0) {
      baseTotal = Number.parseFloat(order.Pagos[0].total)
    } else {
      baseTotal = Number.parseFloat(order.total)
    }

    // Sumar las notas de débito al total
    const notasDebitoTotal = (order.NotaDebitos || []).reduce((sum, nota) => {
      return sum + Number.parseFloat(nota.valorTotal || 0)
    }, 0)

    return baseTotal + notasDebitoTotal
  }

  const getTipoNotaBadge = (tipo) => {
    const tipoUpper = tipo?.toUpperCase()
    switch (tipoUpper) {
      case "CAMBIO":
        return <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">Cambio</span>
      case "AJUSTE":
        return <span className="px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">Ajuste</span>
      case "RECARGO":
        return <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">Recargo</span>
      default:
        return <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">{tipo || "N/A"}</span>
    }
  }

  // Función para descargar PDF con imagen
  const downloadPDF = async () => {
    setIsGeneratingPDF(true)
    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      // Configurar fuentes
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(18)
      pdf.text("Detalle de Orden", 105, 20, { align: "center" })

      // ID de la orden
      pdf.setFontSize(12)
      pdf.setFont("helvetica", "normal")
      pdf.text(`Orden #${orden.id}`, 105, 30, { align: "center" })

      let yPosition = 45

      // Datos del Cliente
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(14)
      pdf.text("DATOS DEL CLIENTE", 20, yPosition)
      yPosition += 10
      pdf.setFont("helvetica", "normal")
      pdf.setFontSize(10)
      pdf.text(`Nombre: ${orden.nombre_cliente}`, 20, yPosition)
      pdf.text(`DNI: ${orden.dni_cliente}`, 110, yPosition)
      yPosition += 6
      pdf.text(`Teléfono: ${orden.telefono_cliente}`, 20, yPosition)
      pdf.text(`Email: ${orden.email_cliente}`, 110, yPosition)
      yPosition += 15

      // Información del Evento
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(14)
      pdf.text("INFORMACIÓN DEL EVENTO", 20, yPosition)
      yPosition += 10
      pdf.setFont("helvetica", "normal")
      pdf.setFontSize(10)
      pdf.text(`Evento: ${getEventoNombre()}`, 20, yPosition)
      yPosition += 6
      pdf.text(`Fecha de creación: ${formatFecha(orden.fecha_creacion)}`, 20, yPosition)
      // No hay fecha_pago directa en la orden, se obtiene del pago
      yPosition += 15

      // Entradas
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(14)
      pdf.text("ENTRADAS", 20, yPosition)
      yPosition += 10
      // Tabla de entradas
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(9)
      pdf.text("Tipo", 20, yPosition)
      pdf.text("Cantidad", 80, yPosition)
      pdf.text("Precio Unit.", 120, yPosition)
      pdf.text("Subtotal", 160, yPosition)
      yPosition += 5
      // Línea separadora
      pdf.line(20, yPosition, 190, yPosition)
      yPosition += 5
      pdf.setFont("helvetica", "normal")
      orden.DetalleDeOrdens?.forEach((detalle) => {
        pdf.text(detalle.Entrada?.tipo_entrada || "N/A", 20, yPosition)
        pdf.text(detalle.cantidad.toString(), 80, yPosition)
        pdf.text(formatMonto(detalle.precio_unitario), 120, yPosition)
        pdf.text(formatMonto(detalle.total), 160, yPosition)
        yPosition += 6
      })
      yPosition += 10

      if (notasDebito.length > 0) {
        pdf.setFont("helvetica", "bold")
        pdf.setFontSize(14)
        pdf.text("NOTAS DE DÉBITO", 20, yPosition)
        yPosition += 10

        //Tabla de notas de débito
        pdf.setFont("helvetica", "bold")
        pdf.setFontSize(9)
        pdf.text("Número", 20, yPosition)
        pdf.text("Tipo", 60, yPosition)
        pdf.text("Concepto", 90, yPosition)
        pdf.text("Valor Total", 160, yPosition)
        yPosition += 5
        pdf.line(20, yPosition, 190, yPosition)
        yPosition += 5

        pdf.setFont("helvetica", "normal")
        notasDebito.forEach((nota) => {
          pdf.text(nota.numeroNota?.toString() || "N/A", 20, yPosition)
          pdf.text(nota.tipoNota || "N/A", 60, yPosition)
          // Truncar concepto si es muy largo
          const concepto = nota.concepto || "N/A"
          const conceptoTruncado = concepto.length > 25 ? concepto.substring(0, 25) + "..." : concepto
          pdf.text(conceptoTruncado, 90, yPosition)
          pdf.text(formatMonto(nota.valorTotal), 160, yPosition)
          yPosition += 6
        })
        yPosition += 10
      }

      // Total de la Orden (usando el monto real)
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(12)
      pdf.text(`TOTAL DE LA ORDEN: ${formatMonto(getRealOrderTotal(orden))}`, 20, yPosition)
      yPosition += 15

      // Información del Pago
      if (firstPayment) {
        pdf.setFont("helvetica", "bold")
        pdf.setFontSize(14)
        pdf.text("INFORMACIÓN DEL PAGO", 20, yPosition)
        yPosition += 10
        pdf.setFont("helvetica", "normal")
        pdf.setFontSize(10)
        pdf.text(`Estado: ${firstPayment.estatus}`, 20, yPosition)
        pdf.text(`Referencia: ${firstPayment.referencia}`, 110, yPosition)
        yPosition += 6
        pdf.text(`Monto (sin impuestos): ${formatMonto(firstPayment.monto)}`, 20, yPosition)
        pdf.text(`Total (con impuestos): ${formatMonto(firstPayment.total)}`, 110, yPosition)
        yPosition += 6
        pdf.text(`Fecha de pago: ${formatFecha(firstPayment.fecha_pago)}`, 20, yPosition)
        if (firstPayment.descripcion) {
          yPosition += 6
          pdf.text(`Descripción: ${firstPayment.descripcion}`, 20, yPosition)
        }

        // AGREGAR IMAGEN DEL COMPROBANTE AL PDF
        if (firstPayment.imagen && firstPayment.imagen.trim() !== "") {
          yPosition += 15
          pdf.setFont("helvetica", "bold")
          pdf.setFontSize(12)
          pdf.text("COMPROBANTE DE PAGO", 20, yPosition)
          yPosition += 10
          try {
            const response = await fetch(firstPayment.imagen, { mode: "cors" })
            if (!response.ok) {
              throw new Error(`Error al cargar la imagen: ${response.status}`)
            }
            const blob = await response.blob()
            const imageUrl = URL.createObjectURL(blob)

            const img = new Image()
            img.crossOrigin = "anonymous" // Crucial for CORS
            const loadImage = new Promise((resolve, reject) => {
              img.onload = () => resolve(img)
              img.onerror = () => reject(new Error("No se pudo cargar la imagen"))
              img.src = imageUrl
            })

            const loadedImg = await loadImage

            const canvas = document.createElement("canvas")
            const ctx = canvas.getContext("2d")

            const maxWidth = 170
            const maxHeight = 100
            let { width, height } = loadedImg

            if (width > maxWidth) {
              height = (height * maxWidth) / width
              width = maxWidth
            }
            if (height > maxHeight) {
              width = (width * maxHeight) / height
              height = maxHeight
            }

            canvas.width = width * 2
            canvas.height = height * 2
            ctx.scale(2, 2)
            ctx.drawImage(loadedImg, 0, 0, width, height)

            const imgData = canvas.toDataURL("image/jpeg", 0.8)

            if (yPosition + height > 270) {
              pdf.addPage()
              yPosition = 20
              pdf.setFont("helvetica", "bold")
              pdf.setFontSize(12)
              pdf.text("COMPROBANTE DE PAGO (continuación)", 20, yPosition)
              yPosition += 10
            }

            pdf.addImage(imgData, "JPEG", 20, yPosition, width, height)
            yPosition += height + 10
            URL.revokeObjectURL(imageUrl)
            // console.log("✅ Imagen agregada al PDF correctamente")
          } catch (imageError) {
            // console.error("❌ Error al cargar imagen para PDF:", imageError)
            pdf.setFont("helvetica", "italic")
            pdf.setFontSize(10)
            pdf.text("⚠️ No se pudo cargar el comprobante de pago en el PDF", 20, yPosition)
            pdf.text(`URL: ${firstPayment.imagen.substring(0, 60)}...`, 20, yPosition + 5)
            yPosition += 15
          }
        }
      } else {
        pdf.setFont("helvetica", "bold")
        pdf.setFontSize(14)
        pdf.text("PAGO PENDIENTE", 20, yPosition)
        yPosition += 10
        pdf.setFont("helvetica", "normal")
        pdf.setFontSize(10)
        pdf.text("Esta orden aún no ha sido pagada", 20, yPosition)
      }

      // Pie de página
      pdf.setFont("helvetica", "italic")
      pdf.setFontSize(8)
      pdf.text(
        `Generado el ${new Date().toLocaleDateString("es-ES")} a las ${new Date().toLocaleTimeString("es-ES")}`,
        105,
        280,
        { align: "center" },
      )

      // Guardar el PDF
      const fileName = `Orden_${orden.id.slice(0, 8)}_${new Date().toISOString().slice(0, 10)}.pdf`
      pdf.save(fileName)
    } catch (error) {
      // console.error("Error generando PDF:", error)
      alert("Error al generar el PDF: " + error.message)
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  return (
    isOpen && (
      <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4 bg-black bg-opacity-50">
        <div
          ref={modalRef}
          className="bg-gray-800 rounded-lg border-2 border-[#BF8D6B] overflow-hidden flex flex-col w-full max-w-4xl h-full max-h-[90vh]"
        >
          {/* Header Sticky */}
          <div className="sticky top-0 z-10 bg-gray-800 p-4 sm:p-6 pb-2 border-b border-gray-700 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-white">Detalle de Orden</h2>
              <p className="text-sm text-gray-300">#{orden.id}</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Botón Descargar PDF */}
              <button
                onClick={downloadPDF}
                disabled={isGeneratingPDF}
                className={`px-3 py-2 ${
                  isGeneratingPDF ? "bg-gray-500 cursor-not-allowed" : "bg-[#BF8D6B] hover:bg-[#A67A5B]"
                } text-white rounded-lg transition-colors flex items-center gap-1`}
                title="Descargar PDF"
              >
                {isGeneratingPDF ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    <span className="hidden sm:inline">Generando...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">PDF</span>
                  </>
                )}
              </button>
              {/* Botón Cerrar */}
              <button
                onClick={() => {
                  onClose()
                  setIsOpen(false)
                }}
                className="text-[#BF8D6B] hover:text-[#A67A5B] transition-colors p-1"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          {/* Contenido Scrolleable */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 pt-4">
            <div className="grid grid-cols-1 gap-6">
              {/* Información de la Orden */}
              <div className="bg-white text-black p-6 rounded-lg">
                <div className="mb-4 border-b pb-3">
                  <div className="flex items-center mb-2">
                    <User className="h-5 w-5 mr-2 text-[#BF8D6B]" />
                    <h3 className="font-semibold">Datos del Cliente</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-600">Nombre:</p>
                      <p className="font-medium">{orden.nombre_cliente}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">DNI:</p>
                      <p className="font-medium">{orden.dni_cliente}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Teléfono:</p>
                      <p className="font-medium">{orden.telefono_cliente}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Email:</p>
                      <p className="font-medium truncate">{orden.email_cliente}</p>
                    </div>
                  </div>
                </div>
                <div className="mb-4 border-b pb-3">
                  <div className="flex items-center mb-2">
                    <Calendar className="h-5 w-5 mr-2 text-[#BF8D6B]" />
                    <h3 className="font-semibold">Información del Evento</h3>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-lg">{getEventoNombre()}</p>
                    <p className="text-gray-600 mt-1">
                      <strong>Fecha de creación:</strong> {formatFecha(orden.fecha_creacion)}
                    </p>
                    {firstPayment && ( // Mostrar fecha de pago si hay un pago
                      <p className="text-gray-600">
                        <strong>Fecha de pago:</strong> {formatFecha(firstPayment.fecha_pago)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mb-4 border-b pb-3">
                  <div className="flex items-center mb-2">
                    <Tag className="h-5 w-5 mr-2 text-[#BF8D6B]" />
                    <h3 className="font-semibold">Entradas</h3>
                  </div>
                  <div className="space-y-2">
                    {orden.DetalleDeOrdens?.map((detalle, index) => (
                      <div key={detalle.id} className="bg-gray-50 p-3 rounded border">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{detalle.Entrada?.tipo_entrada}</p>
                            <p className="text-sm text-gray-600">
                              Cantidad: {detalle.cantidad} × {formatMonto(detalle.precio_unitario)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{formatMonto(detalle.total)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {notasDebito.length > 0 && (
                  <div className="mb-4 border-b pb-3">
                    <div className="flex items-center mb-2">
                      <AlertTriangle className="h-5 w-5 mr-2 text-[#BF8D6B]" />
                      <h3 className="font-semibold">Notas de Débito</h3>
                    </div>
                    <div className="space-y-2">
                      {notasDebito.map((nota, index) => (
                        <div key={nota.id || index} className="bg-orange-50 p-3 rounded border border-orange-200">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium text-sm">Nota #{nota.numeroNota}</p>
                                {getTipoNotaBadge(nota.tipoNota)}
                              </div>
                              <p className="text-sm text-gray-700 mb-1">
                                <strong>Concepto:</strong> {nota.concepto}
                              </p>
                              <p className="text-xs text-gray-600">
                                <strong>Fecha:</strong> {formatFecha(nota.fechaEmision)}
                              </p>
                              {nota.detalle && (
                                <p className="text-xs text-gray-600 mt-1">
                                  <strong>Detalle:</strong> {nota.detalle}
                                </p>
                              )}
                            </div>
                            <div className="text-right ml-4">
                              <p className="font-bold text-orange-700">+{formatMonto(nota.valorTotal)}</p>
                              <p className="text-xs text-gray-600">Neto: {formatMonto(nota.ValorNeto)}</p>
                              <p className="text-xs text-gray-600">Impuesto: {formatMonto(nota.valorImpuesto)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center mb-2">
                    <FileText className="h-5 w-5 mr-2 text-[#BF8D6B]" />
                    <h3 className="font-semibold">Resumen</h3>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    {firstPayment && (
                      <div className="flex justify-between text-sm mb-1">
                        <span>Subtotal del Pago</span>
                        <span>{formatMonto(firstPayment.total)}</span>
                      </div>
                    )}
                    {notasDebito.length > 0 && (
                      <div className="flex justify-between text-sm mb-1 text-orange-700">
                        <span>Notas de Débito</span>
                        <span>
                          +
                          {formatMonto(
                            notasDebito.reduce((sum, nota) => sum + Number.parseFloat(nota.valorTotal || 0), 0),
                          )}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total Final</span>
                      <span>{formatMonto(getRealOrderTotal(orden))}</span> {/* Usar el monto real */}
                    </div>
                    <div className="mt-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          firstPayment
                            ? "bg-green-100 text-green-800"
                            : orden.estado === "pendiente"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {firstPayment ? "Pagado" : orden.estado}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Información del Pago */}
              <div className="bg-white text-black p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <CreditCard className="h-5 w-5 mr-2 text-[#BF8D6B]" />
                  <h3 className="font-semibold">Información del Pago</h3>
                </div>
                {firstPayment ? (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-600">Estado:</p>
                          <p className="font-medium text-green-700">{firstPayment.estatus}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Referencia:</p>
                          <p className="font-medium">{firstPayment.referencia}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Monto (sin impuestos):</p>
                          <p className="font-medium">{formatMonto(firstPayment.monto)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Total (con impuestos):</p>
                          <p className="font-bold text-lg">{formatMonto(firstPayment.total)}</p>
                        </div>
                        <div className="sm:col-span-2">
                          <p className="text-gray-600">Fecha de pago:</p>
                          <p className="font-medium">{formatFecha(firstPayment.fecha_pago)}</p>
                        </div>
                        {firstPayment.descripcion && (
                          <div className="sm:col-span-2">
                            <p className="text-gray-600">Descripción:</p>
                            <p className="font-medium">{firstPayment.descripcion}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Comprobante de Pago */}
                    {firstPayment.imagen && (
                      <div>
                        <div className="flex items-center mb-2">
                          <ImageIcon className="h-4 w-4 mr-2 text-[#BF8D6B]" />
                          <h4 className="font-medium">Comprobante de Pago</h4>
                        </div>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <ImageWithFallback
                            src={firstPayment.imagen || "/placeholder.svg"}
                            alt="Comprobante de pago"
                            className="w-full h-64 object-contain bg-gray-50"
                          />
                        </div>
                        {/* Debug info - remover en producción */}
                        <div className="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-600">
                          <p>
                            <strong>URL:</strong> {firstPayment.imagen}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-center">
                    <CreditCard className="h-12 w-12 mx-auto mb-2 text-yellow-500" />
                    <p className="text-yellow-700 font-medium">Pago Pendiente</p>
                    <p className="text-yellow-600 text-sm mt-1">Esta orden aún no ha sido pagada</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  )
}
