"use client"
import { useState, useRef } from "react"
import { X, CreditCard, Check, AlertCircle, Camera, FileImage } from "lucide-react"
import Swal from "sweetalert2"
import apiUrls from "@/app/components/utils/apiConfig"
import useImageFetcher from "./imageFetcher"

const API_URL = apiUrls

export default function PagoModal({
  isOpen,
  onClose,
  orderId,
  total,
  isInline = false,
  metodoDeCobroId,
  taxDetails,
  onPaymentSuccess,
}) {
  const [formData, setFormData] = useState({
    referencia: "",
    descripcion: "",
    montoRecibido: total || 0,
    imagen: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [previewImage, setPreviewImage] = useState(null)
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)
  const { uploadImage, uploading: uploadingImage } = useImageFetcher()

  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: name === "montoRecibido" ? Number.parseFloat(value) || 0 : value,
    })
  }

  // FUNCIÓN CORREGIDA - ASEGURAR QUE SIEMPRE SEA STRING
  const handleImageUpload = async (file) => {
    try {
      const previewUrl = URL.createObjectURL(file)
      setPreviewImage(previewUrl)

      const imageResult = await uploadImage(file) // Esto llama a useImageFetcher

      // EXTRAER LA URL COMO STRING
      let imageUrl = ""
      if (typeof imageResult === "string") {
        imageUrl = imageResult
      } else if (typeof imageResult === "object" && imageResult !== null) {
        // Si es objeto, extraer la URL
        imageUrl =
          imageResult.url || imageResult.secure_url || imageResult.data?.url || imageResult.data?.secure_url || ""
      }

      // ASEGURAR QUE SEA STRING VÁLIDO
      if (!imageUrl || typeof imageUrl !== "string") {
        throw new Error("No se pudo obtener la URL de la imagen")
      }

      // GUARDAR SOLO EL STRING DE LA URL
      setFormData({
        ...formData,
        imagen: imageUrl,
      })
      setError(null)
      return imageUrl
    } catch (error) {
      setError(`Error al subir la imagen: ${error.message}`)
      setPreviewImage(null)
      return null
    }
  }

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("Por favor selecciona un archivo de imagen válido")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen es demasiado grande. Máximo 5MB.")
      return
    }

    try {
      await handleImageUpload(file)
      setError(null)
    } catch (error) {
      setError("Error al procesar la imagen")
    }
  }

  const handleSelectFile = () => {
    fileInputRef.current?.click()
  }

  const handleOpenCamera = () => {
    cameraInputRef.current?.click()
  }

  const handleRemoveImage = () => {
    setFormData({
      ...formData,
      imagen: "",
    })
    setPreviewImage(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
    if (cameraInputRef.current) cameraInputRef.current.value = ""
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.referencia.trim()) {
      setError("La referencia es obligatoria")
      return
    }
    if (formData.montoRecibido <= 0) {
      setError("El monto recibido debe ser mayor que cero")
      return
    }
    if (uploadingImage) {
      setError("Espera a que termine de subir la imagen")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // ASEGURAR QUE IMAGEN SEA STRING O NULL
      const imagenFinal =
        formData.imagen && typeof formData.imagen === "string" && formData.imagen.trim() !== ""
          ? formData.imagen.trim()
          : null

      const paymentData = {
        ordenId: orderId,
        metodoDeCobroId: metodoDeCobroId ? metodoDeCobroId : null,
        estatus: "completado",
        referencia: formData.referencia,
        descripcion: formData.descripcion,
        montoRecibido: formData.montoRecibido,
        imagen: imagenFinal, // SIEMPRE STRING O NULL
        error_message: null,
        fecha_cancelacion: null,
        motivo_cancelacion: null,
        taxPercentage: taxDetails?.taxPercentage || 0,
        taxAmount: taxDetails?.taxAmount || 0,
        baseAmount: taxDetails?.baseAmount || formData.montoRecibido,
        installments: taxDetails?.installments || 1,
      }

      console.log("[v0] Sending payment data:", paymentData)

      const response = await fetch(`${API_URL}/api/payment/pago`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      })

      console.log("[v0] Response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.log("[v0] Error response:", errorData)
        throw new Error(errorData.message || "Error al procesar el pago")
      }

      const result = await response.json()
      console.log("[v0] Success response:", result)

      setSuccess(true)
      await Swal.fire({
        icon: "success",
        title: "¡Pago Confirmado!",
        html: `
          <div style="text-align: left;">
            <p><strong>Orden:</strong> #${orderId}</p>
            <p><strong>Referencia:</strong> ${formData.referencia}</p>
            <p><strong>Monto:</strong> $${formData.montoRecibido.toLocaleString()}</p>
            ${formData.descripcion ? `<p><strong>Descripción:</strong> ${formData.descripcion}</p>` : ""}
            ${imagenFinal ? `<p><strong>Comprobante:</strong> ✅ Adjuntado</p>` : ""}
            ${taxDetails?.taxPercentage > 0 ? `<p><strong>Impuesto aplicado:</strong> ${taxDetails.taxPercentage}%</p>` : ""}
          </div>
        `,
        confirmButtonText: "Continuar",
        confirmButtonColor: "#BF8D6B",
      })

      // EJECUTAR CALLBACK DE ÉXITO ANTES DE CERRAR
      if (onPaymentSuccess) {
        onPaymentSuccess()
      }
      onClose()
    } catch (error) {
      console.error("[v0] Payment submission error:", error)
      const errorMessage = typeof error.message === "string" ? error.message : "No se pudo procesar el pago"
      setError(errorMessage)
      Swal.fire({
        icon: "error",
        title: "Error al procesar el pago",
        text: errorMessage,
        confirmButtonText: "Intentar de nuevo",
        confirmButtonColor: "#BF8D6B",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isInline) {
    return (
      <div className="h-full bg-gray-800 rounded-lg border-2 border-[#BF8D6B] p-4 sm:p-6 shadow-lg shadow-[#BF8D6B]/20 overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sm:mb-6 bg-gray-800 pb-2 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-white">Confirmar Pago</h2>
            <p className="text-sm text-gray-300">Orden #{orderId}</p>
          </div>
          <button
            onClick={onClose}
            className="text-[#BF8D6B] hover:text-[#A67A5B] transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded mb-4 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="bg-green-900/50 border border-green-700 text-green-300 px-4 py-3 rounded mb-4 flex items-start">
            <Check className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <span>¡Pago procesado correctamente!</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-gray-700/50 border border-[#BF8D6B] rounded-lg p-3 mb-4">
            <h3 className="text-[#BF8D6B] font-medium">Detalles de la Orden</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-sm text-gray-300">
              <div>
                Orden: <span className="text-[#BF8D6B]">#{orderId}</span>
              </div>
              <div>
                Total a pagar: <span className="text-[#BF8D6B]">${total?.toLocaleString()}</span>
              </div>
              {taxDetails?.taxPercentage > 0 && (
                <>
                  <div>
                    Subtotal: <span className="text-gray-300">${taxDetails.baseAmount?.toLocaleString()}</span>
                  </div>
                  <div>
                    Impuesto ({taxDetails.taxPercentage}%):{" "}
                    <span className="text-orange-400">+${taxDetails.taxAmount?.toLocaleString()}</span>
                  </div>
                  {taxDetails.installments > 1 && (
                    <div className="col-span-2">
                      Cuotas: <span className="text-[#BF8D6B]">{taxDetails.installments}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-white">
              Referencia / Comprobante <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="referencia"
                value={formData.referencia}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-[#BF8D6B] rounded-lg p-3 pl-10 text-white focus:outline-none focus:ring-1 focus:ring-[#BF8D6B] transition-colors"
                placeholder="Ej: Transferencia #12345 o 'Efectivo'"
                required
              />
              <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#BF8D6B] h-5 w-5" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-white">Descripción (opcional)</label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              className="w-full bg-gray-700 border border-[#BF8D6B] rounded-lg p-3 text-white focus:outline-none focus:ring-1 focus:ring-[#BF8D6B] transition-colors"
              placeholder="Detalles adicionales sobre el pago..."
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-white">
              Monto Recibido <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                name="montoRecibido"
                value={formData.montoRecibido}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-[#BF8D6B] rounded-lg p-3 pl-10 text-white focus:outline-none focus:ring-1 focus:ring-[#BF8D6B] transition-colors"
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#BF8D6B]">$</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-white">Comprobante de Pago (opcional)</label>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                type="button"
                onClick={handleSelectFile}
                disabled={uploadingImage}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg border border-[#BF8D6B] transition-colors flex items-center justify-center disabled:opacity-50"
              >
                <FileImage className="h-4 w-4 mr-2" />
                Seleccionar Archivo
              </button>
              <button
                type="button"
                onClick={handleOpenCamera}
                disabled={uploadingImage}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg border border-[#BF8D6B] transition-colors flex items-center justify-center disabled:opacity-50"
              >
                <Camera className="h-4 w-4 mr-2" />
                Tomar Foto
              </button>
            </div>
            {uploadingImage && (
              <div className="flex items-center justify-center py-4 text-[#BF8D6B]">
                <svg
                  className="animate-spin -ml-1 mr-2 h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Subiendo imagen...
              </div>
            )}
            {(previewImage || formData.imagen) && !uploadingImage && (
              <div className="mt-3 p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-green-400 text-sm flex items-center">
                    <Check className="h-4 w-4 mr-1" />
                    {formData.imagen ? "Imagen subida correctamente" : "Vista previa"}
                  </span>
                  <button type="button" onClick={handleRemoveImage} className="text-red-400 hover:text-red-300 text-sm">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <img
                  src={previewImage || formData.imagen || "/placeholder.svg"}
                  alt="Comprobante de pago"
                  className="w-full h-48 object-contain rounded border border-gray-600"
                />
                {formData.imagen && <p className="text-xs text-green-400 mt-1">✓ Imagen guardada en el servidor</p>}
              </div>
            )}
            <p className="text-xs text-gray-400 mt-2">
              Formatos soportados: JPG, PNG, GIF. Tamaño máximo: 5MB. Se sube automáticamente a tu servidor.
            </p>
          </div>
          <div className="flex justify-between pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-red-600 text-red-500 hover:bg-red-600/10 rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`px-4 py-2 ${
                isSubmitting || uploadingImage ? "bg-gray-500" : "bg-[#BF8D6B] hover:bg-[#A67A5B]"
              } text-white rounded-lg transition-colors flex items-center`}
              disabled={isSubmitting || uploadingImage}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Procesando...
                </>
              ) : uploadingImage ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Subiendo imagen...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Confirmar Pago
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    )
  }
  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-gray-800 rounded-lg border-2 border-[#BF8D6B] p-4 sm:p-6 w-full max-w-xl mx-auto shadow-lg shadow-[#BF8D6B]/20 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sm:mb-6 sticky top-0 bg-gray-800 pb-2 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-white">Confirmar Pago</h2>
            <p className="text-sm text-gray-300">Orden #{orderId}</p>
          </div>
          <button
            onClick={onClose}
            className="text-[#BF8D6B] hover:text-[#A67A5B] transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
