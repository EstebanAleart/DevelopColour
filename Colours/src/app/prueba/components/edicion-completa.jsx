"use client"

import { useState, useEffect } from "react"
import Swal from "sweetalert2"
import { X, Edit2, Save, XCircle, Plus } from "lucide-react"
import apiUrls from "@/app/components/utils/apiConfig"

const API_URL = apiUrls

export default function ColourRosarioModal({ punto, onClose, onUpdate }) {
  const [activeTab, setActiveTab] = useState("informacion")
  const [loadingSalones, setLoadingSalones] = useState(false)
  const [errorSalones, setErrorSalones] = useState(null)
  const [salones, setSalones] = useState([])
  const [validationError, setValidationError] = useState(null)
  const [usuarios, setUsuarios] = useState([])
  const [loadingUsuarios, setLoadingUsuarios] = useState(false)
  const [errorUsuarios, setErrorUsuarios] = useState(null)

  // Estados para métodos de pago
  const [paymentMethods, setPaymentMethods] = useState([])
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false)
  const [errorPaymentMethods, setErrorPaymentMethods] = useState(null)
  const [editingPaymentMethod, setEditingPaymentMethod] = useState(null)
  const [tempTipoCobro, setTempTipoCobro] = useState("")
  const [tempImpuesto, setTempImpuesto] = useState("")

  // Estados para agregar nuevo método de pago
  const [showAddForm, setShowAddForm] = useState(false)
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    tipo_de_cobro: "",
    impuesto: "",
  })

  const [data, setData] = useState({
    razon: punto?.razon || "",
    nombre: punto?.nombre || "",
    direccion: punto?.direccion || "",
    cuit: punto?.cuit || "",
    personaContacto: punto?.personaContacto || "",
    email: punto?.email || "",
    whatsapp: punto?.whatsapp || "",
    telefono: punto?.telefono || "",
    es_online: punto?.es_online || false,
    salonesHabilitados: punto?.salonesHabilitados || [],
    vendedoresAsignados: punto?.vendedoresAsignados || [],
    tiposCobro: {
      mercadoPago: {
        apiKey: punto?.tiposCobro?.mercadoPago?.apiKey || "",
        secretId: punto?.tiposCobro?.mercadoPago?.secretId || "",
      },
      transferencia: {
        cbu: punto?.tiposCobro?.transferencia?.cbu || "",
        entidadCobro: punto?.tiposCobro?.transferencia?.entidadCobro || "",
      },
    },
  })

  useEffect(() => {
    if (punto) {
      setData({
        razon: punto.razon || "",
        nombre: punto.nombre || "",
        direccion: punto.direccion || "",
        cuit: punto.cuit || "",
        personaContacto: punto.personaContacto || "",
        email: punto.email || "",
        whatsapp: punto.whatsapp || "",
        telefono: punto.telefono || "",
        es_online: punto.es_online || false,
        salonesHabilitados: punto.salonesHabilitados || [],
        vendedoresAsignados: punto.vendedoresAsignados || [],
        tiposCobro: {
          mercadoPago: {
            apiKey: punto.tiposCobro?.mercadoPago?.apiKey || "",
            secretId: punto.tiposCobro?.mercadoPago?.secretId || "",
          },
          transferencia: {
            cbu: punto.tiposCobro?.transferencia?.cbu || "",
            entidadCobro: punto.tiposCobro?.transferencia?.entidadCobro || "",
          },
        },
      })
    }
  }, [punto])

  // Función para cargar métodos de pago
  const fetchPaymentMethods = async () => {
    try {
      setLoadingPaymentMethods(true)
      setErrorPaymentMethods(null)

      const response = await fetch(`${API_URL}/api/paymentMethod/`)

      if (!response.ok) {
        throw new Error(`Error al obtener métodos de pago: ${response.status}`)
      }

      const result = await response.json()

      if (result.message === "Métodos de pago obtenidos exitosamente" && result.data) {
        setPaymentMethods(result.data)
      } else {
        throw new Error(result.error || "Error al obtener los métodos de pago")
      }
    } catch (err) {
      console.error("Error fetching payment methods:", err)
      setErrorPaymentMethods(err.message)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `No se pudieron cargar los métodos de pago: ${err.message}`,
      })
    } finally {
      setLoadingPaymentMethods(false)
    }
  }

  // Cargar métodos de pago cuando se monta el componente
  useEffect(() => {
    fetchPaymentMethods()
  }, [])

  // Función para actualizar un método de pago
  const updatePaymentMethod = async (id, newTipoCobro, newImpuesto) => {
    try {
      const impuestoNumber = newImpuesto === "" || newImpuesto === null ? null : Number.parseFloat(newImpuesto)

      const requestBody = {
        tipo_de_cobro: newTipoCobro.trim(),
        impuesto: impuestoNumber,
      }

      const response = await fetch(`${API_URL}/api/paymentMethod/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      const result = await response.json()

      if (!response.ok || result.error) {
        throw new Error(result.error || `Error al actualizar el método de pago. Status: ${response.status}`)
      }

      // Actualizar el estado local usando el Id correcto
      setPaymentMethods((prev) =>
        prev.map((method) =>
          method.Id === id
            ? {
                ...method,
                tipo_de_cobro: newTipoCobro.trim(),
                impuesto: impuestoNumber,
              }
            : method,
        ),
      )

      Swal.fire({
        icon: "success",
        title: "Actualizado",
        text: "Método de pago actualizado correctamente",
        timer: 2000,
        showConfirmButton: false,
      })

      setEditingPaymentMethod(null)
      setTempTipoCobro("")
      setTempImpuesto("")

      // Refrescar la lista para confirmar los cambios
      setTimeout(() => {
        fetchPaymentMethods()
      }, 1000)
    } catch (error) {
      console.error("Error updating payment method:", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
      })
    }
  }

  // Función para crear un nuevo método de pago
  const createPaymentMethod = async () => {
    try {
      if (!newPaymentMethod.tipo_de_cobro.trim()) {
        Swal.fire({
          icon: "warning",
          title: "Campo requerido",
          text: "El tipo de cobro es requerido",
        })
        return
      }

      const response = await fetch(`${API_URL}/api/paymentMethod/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tipo_de_cobro: newPaymentMethod.tipo_de_cobro,
          impuesto: Number.parseFloat(newPaymentMethod.impuesto) || null,
        }),
      })

      const result = await response.json()

      if (!response.ok || result.error) {
        throw new Error(result.error || "Error al crear el método de pago")
      }

      // Actualizar la lista
      await fetchPaymentMethods()

      // Limpiar el formulario
      setNewPaymentMethod({
        tipo_de_cobro: "",
        impuesto: "",
      })
      setShowAddForm(false)

      Swal.fire({
        icon: "success",
        title: "Creado",
        text: "Método de pago creado correctamente",
        timer: 2000,
        showConfirmButton: false,
      })
    } catch (error) {
      console.error("Error creating payment method:", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
      })
    }
  }

  // Función para iniciar la edición
  const startEditing = (method) => {
    setEditingPaymentMethod(method.Id) // Usar Id con mayúscula
    setTempTipoCobro(method.tipo_de_cobro || "")
    setTempImpuesto(method.impuesto?.toString() || "0")
  }

  // Función para cancelar la edición
  const cancelEditing = () => {
    setEditingPaymentMethod(null)
    setTempTipoCobro("")
    setTempImpuesto("")
  }

  // Función para guardar la edición
  const saveEditing = (id) => {
    // Validar que el tipo de cobro no esté vacío
    if (!tempTipoCobro.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Campo requerido",
        text: "El tipo de cobro no puede estar vacío",
      })
      return
    }

    // Validar que el impuesto sea un número válido si se proporciona
    if (tempImpuesto !== "" && tempImpuesto !== null) {
      const impuestoNum = Number.parseFloat(tempImpuesto)
      if (isNaN(impuestoNum) || impuestoNum < 0 || impuestoNum > 100) {
        Swal.fire({
          icon: "warning",
          title: "Valor inválido",
          text: "El impuesto debe ser un número entre 0 y 100",
        })
        return
      }
    }

    updatePaymentMethod(id, tempTipoCobro, tempImpuesto)
  }

  // Función para cancelar agregar nuevo
  const cancelAddNew = () => {
    setShowAddForm(false)
    setNewPaymentMethod({
      tipo_de_cobro: "",
      impuesto: "",
    })
  }

  // Cargar salones
  const fetchSalones = async () => {
    try {
      setLoadingSalones(true)
      const response = await fetch(`${API_URL}/api/salon?limit=100`)
      if (!response.ok) {
        throw new Error(`Error al obtener salones: ${response.status}`)
      }
      const result = await response.json()
      if (result.success && result.data) {
        const salonesActivos = result.data.filter((salon) => salon.estatus === true)
        setSalones(salonesActivos)
      } else {
        throw new Error(result.message || "Error al obtener los salones")
      }
    } catch (err) {
      console.error("Error fetching salones:", err)
      setErrorSalones(err.message)
    } finally {
      setLoadingSalones(false)
    }
  }

  useEffect(() => {
    fetchSalones()
  }, [])

  // Cargar usuarios vendedores
  useEffect(() => {
    const fetchUsuarios = async () => {
      setLoadingUsuarios(true)
      try {
        const res = await fetch(`${API_URL}/api/users/usuarios?`)
        const data = await res.json()
        const soloVendedores = Array.isArray(data) ? data.filter((u) => u.rol === "vendor") : []
        setUsuarios(soloVendedores)
      } catch (err) {
        setErrorUsuarios("Error al cargar usuarios")
      } finally {
        setLoadingUsuarios(false)
      }
    }

    fetchUsuarios()
  }, [])

  const handleBlur = (e) => {
    const { name, value } = e.target
    if (name === "telefono") {
      const numericValue = value.replace(/\D/g, "")
      if (numericValue.length > 0 && (numericValue.length < 9 || numericValue.length > 14)) {
        Swal.fire({
          icon: "warning",
          title: "Advertencia",
          text: "El teléfono debe tener entre 9 y 14 dígitos.",
        })
      }
    }

    if (name === "whatsapp") {
      const numericValue = value.replace(/\D/g, "")
      if (numericValue.length > 0 && (numericValue.length < 9 || numericValue.length > 14)) {
        Swal.fire({
          icon: "warning",
          title: "Advertencia",
          text: "El WhatsApp debe tener entre 9 y 14 dígitos.",
        })
      }
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    if (name === "telefono") {
      const validatedValue = value.replace(/[^0-9+]/g, "")
      if (validatedValue.includes("+")) {
        const parts = validatedValue.split("+")
        if (parts.length > 2 || (parts.length === 2 && parts[0] !== "")) {
          return
        }
      }
      setData((prev) => ({ ...prev, [name]: validatedValue }))
      return
    }

    if (name === "whatsapp") {
      const validatedValue = value.replace(/[^0-9+]/g, "")
      if (validatedValue.includes("+")) {
        const parts = validatedValue.split("+")
        if (parts.length > 2 || (parts.length === 2 && parts[0] !== "")) {
          return
        }
      }
      setData((prev) => ({ ...prev, [name]: validatedValue }))
      return
    }

    if (name === "cuit") {
      const digits = value.replace(/\D/g, "")
      setData((prev) => ({ ...prev, [name]: digits }))
      return
    }

    setData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const formatCUIT = (cuit) => {
    const digits = cuit.replace(/\D/g, "")
    if (digits.length === 11) {
      return `${digits.substring(0, 2)}-${digits.substring(2, 10)}-${digits.substring(10)}`
    }
    return digits
  }

  const validateForm = () => {
    const requiredFields = ["razon", "nombre", "direccion", "cuit", "email"]
    for (const field of requiredFields) {
      if (!data[field] || data[field].trim() === "") {
        return `El campo ${field} es requerido`
      }
    }

    if (data.telefono && !/^\+?\d+$/.test(data.telefono)) {
      return "El teléfono solo puede contener números y un + al inicio"
    }

    if (data.whatsapp && !/^\+?\d+$/.test(data.whatsapp)) {
      return "El WhatsApp solo puede contener números y un + al inicio"
    }

    const formattedCUIT = formatCUIT(data.cuit)
    const cuitPattern = /^\d{2}-\d{8}-\d{1}$/
    if (!cuitPattern.test(formattedCUIT)) {
      return "El CUIT debe tener 11 dígitos con formato XX-XXXXXXXX-X"
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(data.email)) {
      return "El formato del correo electrónico es inválido"
    }

    return null
  }

  const handleSubmit = async () => {
    const validationError = validateForm()
    if (validationError) {
      setValidationError(validationError)
      Swal.fire({
        icon: "error",
        title: "Error de validación",
        text: validationError,
      })
      return
    }

    try {
      const formattedCUIT = formatCUIT(data.cuit)
      const submitData = {
        ...data,
        cuit: formattedCUIT,
      }

      const endpoint = punto?.id ? `${API_URL}/api/puntodeventa/${punto.id}` : `${API_URL}/api/puntodeventa`
      const method = punto?.id ? "PUT" : "POST"

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      })

      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Error al guardar los datos")
      }

      setValidationError(null)
      onUpdate?.()
      onClose()
      Swal.fire({
        icon: "success",
        title: punto?.id ? "Actualizado" : "Creado",
        text: punto?.id ? "Punto de venta actualizado correctamente" : "Punto de venta creado correctamente",
      })
    } catch (error) {
      console.error("Error:", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
      })
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 transition-opacity" onClick={onClose}></div>
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="inline-block align-bottom bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full max-w-6xl border-2 border-yellow-600">
         
          <div className="sticky top-0 z-20 bg-gray-800 border-b border-yellow-600 px-4 py-3 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-yellow-500">
              {punto?.id ? "Editar Punto de Venta" : "Nuevo Punto de Venta"}
            </h2>
            <button
              onClick={onClose}
              className="text-yellow-500 hover:text-yellow-300 focus:outline-none transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Contenido con scroll */}
          <div className="p-4 sm:p-6 overflow-y-auto max-h-[70vh]">
            {validationError && (
              <div className="mb-4 p-3 bg-red-900/50 text-red-300 text-sm rounded-lg border border-red-700">
                {validationError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm text-yellow-400 mb-1">Razón Social</label>
                <input
                  type="text"
                  name="razon"
                  placeholder="Razón Social *"
                  value={data.razon}
                  onChange={handleChange}
                  className="bg-gray-700 border border-yellow-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-yellow-500 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-yellow-400 mb-1">Nombre</label>
                <input
                  type="text"
                  name="nombre"
                  placeholder="Nombre *"
                  value={data.nombre}
                  onChange={handleChange}
                  className="bg-gray-700 border border-yellow-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-yellow-500 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-yellow-400 mb-1">Dirección</label>
                <input
                  type="text"
                  name="direccion"
                  placeholder="Dirección *"
                  value={data.direccion}
                  onChange={handleChange}
                  className="bg-gray-700 border border-yellow-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-yellow-500 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-yellow-400 mb-1">CUIT</label>
                <div className="relative">
                  <input
                    type="text"
                    name="cuit"
                    placeholder="CUIT (11 dígitos) *"
                    value={data.cuit}
                    onChange={handleChange}
                    className="w-full bg-gray-700 border border-yellow-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-yellow-500 transition-colors"
                    maxLength="11"
                    required
                  />
                  {data.cuit.length === 11 && (
                    <span className="absolute right-3 top-3 text-green-400 text-sm">{formatCUIT(data.cuit)}</span>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm text-yellow-400 mb-1">E-mail</label>
                <input
                  type="email"
                  name="email"
                  placeholder="E-mail *"
                  value={data.email}
                  onChange={handleChange}
                  className="bg-gray-700 border border-yellow-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-yellow-500 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-yellow-400 mb-1">WhatsApp</label>
                <div className="relative">
                  <input
                    type="tel"
                    name="whatsapp"
                    placeholder="WhatsApp (solo números, + opcional)"
                    value={data.whatsapp}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="w-full bg-gray-700 border border-yellow-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-yellow-500 transition-colors"
                  />
                </div>
              </div>
              <div className="flex items-center">
                <label className="flex items-center space-x-2 text-white">
                  <input
                    type="checkbox"
                    name="es_online"
                    checked={data.es_online}
                    onChange={handleChange}
                    className="h-5 w-5 text-yellow-600 rounded focus:ring-yellow-500 border-yellow-600 bg-gray-700"
                  />
                  <span>Es Online</span>
                </label>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1 order-2 lg:order-1">
                <div className="mb-6">
                  <div className="flex space-x-2 mb-4">
                    <button
                      className={`rounded-lg px-4 py-2 text-sm sm:px-6 sm:text-base ${
                        activeTab === "informacion"
                          ? "bg-yellow-700 text-white"
                          : "bg-gray-700 text-white hover:bg-gray-600"
                      } transition-colors flex-1 sm:flex-none`}
                      onClick={() => setActiveTab("informacion")}
                    >
                      Información
                    </button>
                    <button
                      className={`rounded-lg px-4 py-2 text-sm sm:px-6 sm:text-base ${
                        activeTab === "cobros" ? "bg-yellow-700 text-white" : "bg-gray-700 text-white hover:bg-gray-600"
                      } transition-colors flex-1 sm:flex-none`}
                      onClick={() => setActiveTab("cobros")}
                    >
                      Métodos de Pago
                    </button>
                  </div>

                  {activeTab === "informacion" && (
                    <div>
                      <div className="mb-8">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                          <h3 className="text-lg font-semibold text-yellow-500">
                            Salones Habilitados ({salones.length})
                          </h3>
                          <div className="text-sm text-gray-400 mt-1 sm:mt-0">Mostrando todos los salones activos</div>
                        </div>
                        <div
                          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto p-2"
                          style={{ scrollbarWidth: "thin" }}
                        >
                          {loadingSalones ? (
                            <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4 h-32 flex items-center justify-center bg-gray-700 rounded-lg border border-yellow-600">
                              <p className="text-yellow-500">Cargando salones...</p>
                            </div>
                          ) : errorSalones ? (
                            <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4 h-32 flex items-center justify-center bg-gray-700 rounded-lg border border-yellow-600">
                              <p className="text-red-400">Error: {errorSalones}</p>
                            </div>
                          ) : salones.length > 0 ? (
                            salones.map((salon) => (
                              <div
                                key={salon.id}
                                className={`bg-gray-700 border border-yellow-600 rounded-lg overflow-hidden hover:bg-gray-600 transition-colors cursor-pointer ${
                                  data.salonesHabilitados.some((s) => s.id === salon.id)
                                    ? "bg-yellow-700/20 border-yellow-500"
                                    : ""
                                }`}
                                onClick={() => {
                                  const isSelected = data.salonesHabilitados.some((s) => s.id === salon.id)
                                  setData((prev) => ({
                                    ...prev,
                                    salonesHabilitados: isSelected
                                      ? prev.salonesHabilitados.filter((s) => s.id !== salon.id)
                                      : [...prev.salonesHabilitados, salon],
                                  }))
                                }}
                              >
                                <div className="h-40 bg-gray-800 overflow-hidden">
                                  <img
                                    src={salon.image || ""}
                                    alt={salon.nombre}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.onerror = null
                                      e.target.src = ""
                                      e.target.alt = "Imagen no disponible"
                                    }}
                                  />
                                </div>
                                <div className="p-2">
                                  <span className="text-sm font-light text-white">{salon.salon}</span>
                                  {data.salonesHabilitados.some((s) => s.id === salon.id) && (
                                    <span className="text-green-400 text-xs mt-1 block">Seleccionado</span>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4 h-32 flex items-center justify-center bg-gray-700 rounded-lg border border-yellow-600">
                              <p className="text-gray-400">No hay salones activos disponibles</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-yellow-500 mb-4">Vendedores asignados</h3>
                        {loadingUsuarios ? (
                          <div className="text-yellow-400 mb-4">Cargando usuarios...</div>
                        ) : errorUsuarios ? (
                          <div className="text-red-400 mb-4">{errorUsuarios}</div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {usuarios.length > 0 ? (
                              usuarios.map((vendedor) => {
                                const isSelected = data.vendedoresAsignados.some((v) => v.id === vendedor.id)
                                return (
                                  <div
                                    key={vendedor.id}
                                    className={`bg-gray-700 border border-yellow-600 rounded-lg overflow-hidden cursor-pointer ${
                                      isSelected ? "bg-yellow-700/20 border-yellow-500" : ""
                                    }`}
                                    onClick={() => {
                                      setData((prev) => ({
                                        ...prev,
                                        vendedoresAsignados: isSelected
                                          ? prev.vendedoresAsignados.filter((v) => v.id !== vendedor.id)
                                          : [...prev.vendedoresAsignados, vendedor],
                                      }))
                                    }}
                                  >
                                    <div className="p-4 h-32">
                                      <div className="space-y-1 text-white">
                                        <p className="font-medium">{vendedor.nombre}</p>
                                        <p className="text-xs text-gray-300">Teléfono: {vendedor.telefono}</p>
                                        <p className="text-xs text-gray-300">Email: {vendedor.email}</p>
                                        <p className="text-xs text-gray-300">WhatsApp: {vendedor.whatsapp}</p>
                                        {isSelected && (
                                          <span className="text-green-400 text-xs mt-1 block">Seleccionado</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )
                              })
                            ) : (
                              <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4 h-32 flex items-center justify-center bg-gray-700 rounded-lg border border-yellow-600">
                                <p className="text-gray-400">No hay vendedores disponibles</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === "cobros" && (
                    <div>
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-yellow-500">Métodos de Pago Disponibles</h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setShowAddForm(!showAddForm)}
                            className="px-3 py-1 bg-yellow-700 hover:bg-yellow-600 text-white text-sm rounded-lg transition-colors flex items-center gap-1"
                          >
                            <Plus className="h-4 w-4" />
                            Agregar
                          </button>
                        </div>
                      </div>

                      {/* Formulario para agregar nuevo método de pago */}
                      {showAddForm && (
                        <div className="mb-6 p-4 bg-gray-700 border border-yellow-600 rounded-lg">
                          <h4 className="text-white font-medium mb-3">Agregar Nuevo Método de Pago</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm text-gray-300 mb-1">Tipo de Cobro *</label>
                              <input
                                type="text"
                                placeholder="Ej: PayPal, Stripe, etc."
                                value={newPaymentMethod.tipo_de_cobro}
                                onChange={(e) =>
                                  setNewPaymentMethod((prev) => ({
                                    ...prev,
                                    tipo_de_cobro: e.target.value,
                                  }))
                                }
                                className="w-full bg-gray-800 border border-yellow-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-gray-300 mb-1">Impuesto (%)</label>
                              <input
                                type="number"
                                placeholder="0.00"
                                value={newPaymentMethod.impuesto}
                                onChange={(e) =>
                                  setNewPaymentMethod((prev) => ({
                                    ...prev,
                                    impuesto: e.target.value,
                                  }))
                                }
                                className="w-full bg-gray-800 border border-yellow-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
                                step="0.01"
                                min="0"
                                max="100"
                              />
                            </div>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={createPaymentMethod}
                              className="px-4 py-2 bg-yellow-700 hover:bg-yellow-600 text-white text-sm rounded-lg transition-colors flex items-center gap-1"
                            >
                              <Save className="h-4 w-4" />
                              Crear
                            </button>
                            <button
                              onClick={cancelAddNew}
                              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white text-sm rounded-lg transition-colors flex items-center gap-1"
                            >
                              <XCircle className="h-4 w-4" />
                              Cancelar
                            </button>
                          </div>
                        </div>
                      )}

                      {loadingPaymentMethods ? (
                        <div className="flex items-center justify-center h-32 bg-gray-700 rounded-lg border border-yellow-600">
                          <p className="text-yellow-500">Cargando métodos de pago...</p>
                        </div>
                      ) : errorPaymentMethods ? (
                        <div className="flex items-center justify-center h-32 bg-gray-700 rounded-lg border border-red-600">
                          <p className="text-red-400">Error: {errorPaymentMethods}</p>
                        </div>
                      ) : paymentMethods.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {paymentMethods.map((method) => (
                            <div
                              key={method.Id}
                              className="bg-gray-700 border border-yellow-600 rounded-lg p-4 hover:bg-gray-600 transition-colors"
                            >
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                  {editingPaymentMethod === method.Id ? (
                                    <input
                                      type="text"
                                      value={tempTipoCobro}
                                      onChange={(e) => setTempTipoCobro(e.target.value)}
                                      className="w-full bg-gray-800 border border-yellow-600 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500 mb-2"
                                      placeholder="Tipo de cobro"
                                    />
                                  ) : (
                                    <h4 className="text-white font-medium text-lg mb-2">{method.tipo_de_cobro}</h4>
                                  )}
                                </div>
                                <button
                                  onClick={() => startEditing(method)}
                                  className="text-gray-400 hover:text-gray-300 transition-colors ml-2"
                                  title="Editar"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                              </div>

                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-300 text-sm">Impuesto:</span>
                                  {editingPaymentMethod === method.Id ? (
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="number"
                                        value={tempImpuesto}
                                        onChange={(e) => setTempImpuesto(e.target.value)}
                                        className="w-20 bg-gray-800 border border-yellow-600 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
                                        step="0.01"
                                        min="0"
                                        max="100"
                                      />
                                      <span className="text-gray-300 text-sm">%</span>
                                      <button
                                        onClick={() => saveEditing(method.Id)}
                                        className="text-gray-400 hover:text-gray-300 transition-colors"
                                        title="Guardar"
                                      >
                                        <Save className="h-4 w-4" />
                                      </button>
                                      <button
                                        onClick={cancelEditing}
                                        className="text-gray-400 hover:text-gray-300 transition-colors"
                                        title="Cancelar"
                                      >
                                        <XCircle className="h-4 w-4" />
                                      </button>
                                    </div>
                                  ) : (
                                    <span className="text-yellow-400 font-medium">{method.impuesto || 0}%</span>
                                  )}
                                </div>

                                {method.comision !== null && method.comision !== undefined && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-gray-300 text-sm">Comisión:</span>
                                    <span className="text-blue-400 font-medium">{method.comision}%</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-32 bg-gray-700 rounded-lg border border-yellow-600">
                          <p className="text-gray-400">No hay métodos de pago disponibles</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="w-full lg:w-72 order-1 lg:order-2"></div>
            </div>
          </div>

          <div className="bg-gray-800 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-yellow-600">
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-yellow-700 text-base font-medium text-white hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-lg border border-yellow-600 shadow-sm px-4 py-2 bg-gray-800 text-base font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
