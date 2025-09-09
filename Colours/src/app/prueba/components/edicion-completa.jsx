"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { X, Edit2, Save, XCircle, Plus, Trash2 } from "lucide-react";
import apiUrls from "@/app/components/utils/apiConfig";

const API_URL = apiUrls;

export default function ColourRosarioModal({ punto, onClose, onUpdate }) {
  const [activeTab, setActiveTab] = useState("informacion");
  const [loadingSalones, setLoadingSalones] = useState(false);
  const [errorSalones, setErrorSalones] = useState(null);
  const [salones, setSalones] = useState([]);
  const [validationError, setValidationError] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [errorUsuarios, setErrorUsuarios] = useState(null);
  // Estados para métodos de pago
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false);
  const [errorPaymentMethods, setErrorPaymentMethods] = useState(null);
  const [editingPaymentMethod, setEditingPaymentMethod] = useState(null);
  const [tempTipoCobro, setTempTipoCobro] = useState("");
  const [tempImpuesto, setTempImpuesto] = useState({});
  // Estados para agregar nuevo método de pago
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    tipo_de_cobro: "",
    impuesto: {},
  });
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
  });

  const [showTaxRateModal, setShowTaxRateModal] = useState(false);
  const [taxRateForm, setTaxRateForm] = useState({
    cuotas: "",
    porcentaje: "",
  });
  const [isEditingTaxRate, setIsEditingTaxRate] = useState(false);

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
      });
    }
  }, [punto]);

  // Función para cargar métodos de pago
  const fetchPaymentMethods = async () => {
    try {
      setLoadingPaymentMethods(true);
      setErrorPaymentMethods(null);
      const response = await fetch(`${API_URL}/api/paymentMethod/`);
      if (!response.ok) {
        throw new Error(`Error al obtener métodos de pago: ${response.status}`);
      }
      const result = await response.json();
      if (
        result.message === "Métodos de pago obtenidos exitosamente" &&
        result.data
      ) {
        setPaymentMethods(result.data);
      } else {
        throw new Error(result.error || "Error al obtener los métodos de pago");
      }
    } catch (err) {
      console.error("Error fetching payment methods:", err);
      setErrorPaymentMethods(err.message);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `No se pudieron cargar los métodos de pago: ${err.message}`,
      });
    } finally {
      setLoadingPaymentMethods(false);
    }
  };

  // Cargar métodos de pago cuando se monta el componente
  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const updatePaymentMethod = async (id, newTipoCobro, newImpuesto) => {
    try {
      const requestBody = {
        tipo_de_cobro: newTipoCobro.trim(),
        impuesto: newImpuesto,
      };
      const response = await fetch(`${API_URL}/api/paymentMethod/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
      const result = await response.json();
      if (!response.ok || result.error) {
        throw new Error(
          result.error ||
            `Error al actualizar el método de pago. Status: ${response.status}`
        );
      }
      // Actualizar el estado local usando el Id correcto
      setPaymentMethods((prev) =>
        prev.map((method) =>
          method.Id === id
            ? {
                ...method,
                tipo_de_cobro: newTipoCobro.trim(),
                impuesto: newImpuesto,
              }
            : method
        )
      );
      Swal.fire({
        icon: "success",
        title: "Actualizado",
        text: "Método de pago actualizado correctamente",
        timer: 2000,
        showConfirmButton: false,
      });
      setEditingPaymentMethod(null);
      setTempTipoCobro("");
      setTempImpuesto({});
      // Refrescar la lista para confirmar los cambios
      setTimeout(() => {
        fetchPaymentMethods();
      }, 1000);
    } catch (error) {
      console.error("Error updating payment method:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
      });
    }
  };

  const createPaymentMethod = async () => {
    try {
      if (!newPaymentMethod.tipo_de_cobro.trim()) {
        Swal.fire({
          icon: "warning",
          title: "Campo requerido",
          text: "El tipo de cobro es requerido",
        });
        return;
      }
      const response = await fetch(`${API_URL}/api/paymentMethod/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tipo_de_cobro: newPaymentMethod.tipo_de_cobro,
          impuesto: newPaymentMethod.impuesto,
        }),
      });
      const result = await response.json();
      if (!response.ok || result.error) {
        throw new Error(result.error || "Error al crear el método de pago");
      }
      // Actualizar la lista
      await fetchPaymentMethods();
      // Limpiar el formulario
      setNewPaymentMethod({
        tipo_de_cobro: "",
        impuesto: {},
      });
      setShowAddForm(false);
      Swal.fire({
        icon: "success",
        title: "Creado",
        text: "Método de pago creado correctamente",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error creating payment method:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
      });
    }
  };

  // NEW: Función para eliminar un método de pago
  const deletePaymentMethod = async (id) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "¡No podrás revertir esto!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#BF8D6B",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      background: "#1F2937", // Fondo oscuro para que coincida con tu tema
      color: "#E5E7EB", // Color de texto claro
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Using the /delete/ path as per your provided example URL
          const response = await fetch(
            `${API_URL}/api/paymentMethod/delete/${id}`,
            {
              method: "DELETE",
            }
          );
          const resultData = await response.json();
          if (!response.ok || resultData.error) {
            throw new Error(
              resultData.error ||
                `Error al eliminar el método de pago. Status: ${response.status}`
            );
          }
          setPaymentMethods((prev) =>
            prev.filter((method) => method.Id !== id)
          );
          Swal.fire({
            title: "¡Eliminado!",
            icon: "success",
            text: "El método de pago ha sido eliminado.",
            confirmButtonColor: "#BF8D6B",
            background: "#1F2937",
            color: "#E5E7EB",
          });
        } catch (error) {
          console.error("Error deleting payment method:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: error.message,
            confirmButtonColor: "#BF8D6B",
            background: "#1F2937",
            color: "#E5E7EB",
          });
        }
      }
    });
  };

  const startEditing = (method) => {
    setEditingPaymentMethod(method.Id);
    setTempTipoCobro(method.tipo_de_cobro || "");
    setTempImpuesto(method.impuesto || {});
  };

  const cancelEditing = () => {
    setEditingPaymentMethod(null);
    setTempTipoCobro("");
    setTempImpuesto({});
  };

  const saveEditing = (id) => {
    // Validar que el tipo de cobro no esté vacío
    if (!tempTipoCobro.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Campo requerido",
        text: "El tipo de cobro no puede estar vacío",
      });
      return;
    }

    // Validar el formato del impuesto JSON
    for (const [cuotas, porcentaje] of Object.entries(tempImpuesto)) {
      const cuotasNum = Number.parseInt(cuotas);
      const porcentajeNum = Number.parseFloat(porcentaje);

      if (isNaN(cuotasNum) || cuotasNum < 0) {
        Swal.fire({
          icon: "warning",
          title: "Valor inválido",
          text: "Las cuotas deben ser números enteros no negativos",
        });
        return;
      }

      if (isNaN(porcentajeNum) || porcentajeNum < 0 || porcentajeNum > 100) {
        Swal.fire({
          icon: "warning",
          title: "Valor inválido",
          text: "Los porcentajes de impuesto deben estar entre 0 y 100",
        });
        return;
      }
    }

    updatePaymentMethod(id, tempTipoCobro, tempImpuesto);
  };

  const cancelAddNew = () => {
    setShowAddForm(false);
    setNewPaymentMethod({
      tipo_de_cobro: "",
      impuesto: {},
    });
  };

  const addTaxRate = (isEditing = false) => {
    setIsEditingTaxRate(isEditing);
    setTaxRateForm({ cuotas: "", porcentaje: "" });
    setShowTaxRateModal(true);
  };

  const removeTaxRate = (cuotas, isEditing = false) => {
    if (isEditing) {
      setTempImpuesto((prev) => {
        const newImpuesto = { ...prev };
        delete newImpuesto[cuotas];
        return newImpuesto;
      });
    } else {
      setNewPaymentMethod((prev) => ({
        ...prev,
        impuesto: Object.fromEntries(
          Object.entries(prev.impuesto).filter(
            ([key]) => key !== cuotas.toString()
          )
        ),
      }));
    }
  };

  const handleTaxRateSubmit = () => {
    const cuotasNum = Number.parseInt(taxRateForm.cuotas);
    const porcentajeNum = Number.parseFloat(taxRateForm.porcentaje);

    if (isNaN(cuotasNum) || cuotasNum < 0) {
      Swal.fire({
        icon: "warning",
        title: "Valor inválido",
        text: "Las cuotas deben ser un número entero no negativo",
      });
      return;
    }

    if (isNaN(porcentajeNum) || porcentajeNum < 0 || porcentajeNum > 100) {
      Swal.fire({
        icon: "warning",
        title: "Valor inválido",
        text: "El porcentaje debe estar entre 0 и 100",
      });
      return;
    }

    if (isEditingTaxRate) {
      setTempImpuesto((prev) => ({
        ...prev,
        [cuotasNum]: porcentajeNum,
      }));
    } else {
      setNewPaymentMethod((prev) => ({
        ...prev,
        impuesto: {
          ...prev.impuesto,
          [cuotasNum]: porcentajeNum,
        },
      }));
    }

    setShowTaxRateModal(false);
    setTaxRateForm({ cuotas: "", porcentaje: "" });
  };

  // Función para cargar salones
  const fetchSalones = async () => {
    try {
      setLoadingSalones(true);
      const response = await fetch(`${API_URL}/api/salon?limit=100`);
      if (!response.ok) {
        throw new Error(`Error al obtener salones: ${response.status}`);
      }
      const result = await response.json();
      if (result.success && result.data) {
        const salonesActivos = result.data.filter(
          (salon) => salon.estatus === true
        );
        setSalones(salonesActivos);
      } else {
        throw new Error(result.message || "Error al obtener los salones");
      }
    } catch (err) {
      console.error("Error fetching salones:", err);
      setErrorSalones(err.message);
    } finally {
      setLoadingSalones(false);
    }
  };

  useEffect(() => {
    fetchSalones();
  }, []);

  // Cargar usuarios vendedores
  useEffect(() => {
    const fetchUsuarios = async () => {
      setLoadingUsuarios(true);
      try {
        const res = await fetch(`${API_URL}/api/users/usuarios?`);
        const data = await res.json();
        const soloVendedores = Array.isArray(data)
          ? data.filter((u) => u.rol === "vendor")
          : [];
        setUsuarios(soloVendedores);
      } catch (err) {
        setErrorUsuarios("Error al cargar usuarios");
      } finally {
        setLoadingUsuarios(false);
      }
    };
    fetchUsuarios();
  }, []);

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (name === "telefono") {
      const numericValue = value.replace(/\D/g, "");
      if (
        numericValue.length > 0 &&
        (numericValue.length < 9 || numericValue.length > 14)
      ) {
        Swal.fire({
          icon: "warning",
          title: "Advertencia",
          text: "El teléfono debe tener entre 9 y 14 dígitos.",
        });
      }
    }
    if (name === "whatsapp") {
      const numericValue = value.replace(/\D/g, "");
      if (
        numericValue.length > 0 &&
        (numericValue.length < 9 || numericValue.length > 14)
      ) {
        Swal.fire({
          icon: "warning",
          title: "Advertencia",
          text: "El WhatsApp debe tener entre 9 y 14 dígitos.",
        });
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "telefono") {
      const validatedValue = value.replace(/[^0-9+]/g, "");
      if (validatedValue.includes("+")) {
        const parts = validatedValue.split("+");
        if (parts.length > 2 || (parts.length === 2 && parts[0] !== "")) {
          return;
        }
      }
      setData((prev) => ({ ...prev, [name]: validatedValue }));
      return;
    }
    if (name === "whatsapp") {
      const validatedValue = value.replace(/[^0-9+]/g, "");
      if (validatedValue.includes("+")) {
        const parts = validatedValue.split("+");
        if (parts.length > 2 || (parts.length === 2 && parts[0] !== "")) {
          return;
        }
      }
      setData((prev) => ({ ...prev, [name]: validatedValue }));
      return;
    }
    if (name === "cuit") {
      const digits = value.replace(/\D/g, "");
      setData((prev) => ({ ...prev, [name]: digits }));
      return;
    }
    setData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const formatCUIT = (cuit) => {
    const digits = cuit.replace(/\D/g, "");
    if (digits.length === 11) {
      return `${digits.substring(0, 2)}-${digits.substring(
        2,
        10
      )}-${digits.substring(10)}`;
    }
    return digits;
  };

  const validateForm = () => {
    const requiredFields = ["razon", "nombre", "direccion", "cuit", "email"];
    for (const field of requiredFields) {
      if (!data[field] || data[field].trim() === "") {
        return `El campo ${field} es requerido`;
      }
    }
    if (data.telefono && !/^\+?\d+$/.test(data.telefono)) {
      return "El teléfono solo puede contener números y un + al inicio";
    }
    if (data.whatsapp && !/^\+?\d+$/.test(data.whatsapp)) {
      return "El WhatsApp solo puede contener números y un + al inicio";
    }
    const formattedCUIT = formatCUIT(data.cuit);
    const cuitPattern = /^\d{2}-\d{8}-\d{1}$/;
    if (!cuitPattern.test(formattedCUIT)) {
      return "El CUIT debe tener 11 dígitos con formato XX-XXXXXXXX-X";
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(data.email)) {
      return "El formato del correo electrónico es inválido";
    }
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      setValidationError(validationError);
      Swal.fire({
        icon: "error",
        title: "Error de validación",
        text: validationError,
      });
      return;
    }
    try {
      const formattedCUIT = formatCUIT(data.cuit);
      const submitData = {
        ...data,
        cuit: formattedCUIT,
      };
      const endpoint = punto?.id
        ? `${API_URL}/api/puntodeventa/${punto.id}`
        : `${API_URL}/api/puntodeventa`;
      const method = punto?.id ? "PUT" : "POST";
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Error al guardar los datos");
      }
      setValidationError(null);
      onUpdate?.();
      onClose();
      Swal.fire({
        icon: "success",
        title: punto?.id ? "Actualizado" : "Creado",
        text: punto?.id
          ? "Punto de venta actualizado correctamente"
          : "Punto de venta creado correctamente",
      });
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
      });
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] rounded-lg p-4 w-full max-w-4xl shadow-lg">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold text-white">
            {punto?.id ? "Editar Punto de Venta" : "Agregar Punto de Venta"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-2">
          {validationError && (
            <div className="p-2 bg-red-900/50 text-red-300 text-xs rounded border border-red-700">
              {validationError}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <input
              type="text"
              name="razon"
              placeholder="Razón Social"
              value={data.razon}
              onChange={handleChange}
              className="w-full p-1 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs"
              required
            />
            <input
              type="text"
              name="nombre"
              placeholder="Nombre"
              value={data.nombre}
              onChange={handleChange}
              className="w-full p-1 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs"
              required
            />
            <input
              type="text"
              name="direccion"
              placeholder="Dirección"
              value={data.direccion}
              onChange={handleChange}
              className="w-full p-1 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs"
              required
            />
            <input
              type="text"
              name="cuit"
              placeholder="CUIT (11 dígitos)"
              value={data.cuit}
              onChange={handleChange}
              className="w-full p-1 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs"
              maxLength="11"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="E-mail"
              value={data.email}
              onChange={handleChange}
              className="w-full p-1 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs"
              required
            />
            <input
              type="tel"
              name="whatsapp"
              placeholder="WhatsApp"
              value={data.whatsapp}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full p-1 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs"
            />
            <div className="flex items-center col-span-1">
              <label className="flex items-center space-x-1 text-white text-xs">
                <input
                  type="checkbox"
                  name="es_online"
                  checked={data.es_online}
                  onChange={handleChange}
                  className="h-4 w-4 text-[#BF8D6B] rounded"
                />
                <span>Online</span>
              </label>
            </div>
          </div>

          <div className="flex space-x-1 mb-2 mt-2">
            <button
              className={`rounded px-2 py-1 text-xs ${
                activeTab === "informacion"
                  ? "bg-[#BF8D6B] text-white"
                  : "bg-transparent text-white border border-[#BF8D6B]"
              }`}
              onClick={() => setActiveTab("informacion")}
            >
              Información
            </button>
            <button
              className={`rounded px-2 py-1 text-xs ${
                activeTab === "cobros"
                  ? "bg-[#BF8D6B] text-white"
                  : "bg-transparent text-white border border-[#BF8D6B]"
              }`}
              onClick={() => setActiveTab("cobros")}
            >
              Métodos de Pago
            </button>
          </div>

          {activeTab === "cobros" && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-base font-semibold text-white">
                  Métodos de Pago
                </h3>
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="px-2 py-1 bg-[#BF8D6B] hover:bg-[#a67454] text-white text-xs rounded flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  Agregar
                </button>
              </div>
              {showAddForm && (
                <div className="mb-2 p-2 bg-gray-700 border border-[#BF8D6B] rounded">
                  <h4 className="text-white font-medium mb-3">
                    Agregar Nuevo Método de Pago
                  </h4>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">
                        Tipo de Cobro *
                      </label>
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
                        className="w-full p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#BF8D6B]"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm text-gray-300">
                          Impuestos por Cuotas
                        </label>
                        <button
                          onClick={() => addTaxRate(false)}
                          className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded transition-colors"
                        >
                          + Agregar
                        </button>
                      </div>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {Object.entries(newPaymentMethod.impuesto).map(
                          ([cuotas, porcentaje]) => (
                            <div
                              key={cuotas}
                              className="flex items-center justify-between bg-gray-800 p-2 rounded"
                            >
                              <span className="text-white text-sm">
                                {cuotas} cuota{cuotas !== "1" ? "s" : ""}:{" "}
                                {porcentaje}%
                              </span>
                              <button
                                onClick={() => removeTaxRate(cuotas, false)}
                                className="text-red-400 hover:text-red-300 text-xs"
                              >
                                Eliminar
                              </button>
                            </div>
                          )
                        )}
                        {Object.keys(newPaymentMethod.impuesto).length ===
                          0 && (
                          <p className="text-gray-400 text-sm">
                            No hay impuestos configurados
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={createPaymentMethod}
                      className="px-4 py-2 bg-[#BF8D6B] hover:bg-[#a67454] text-white text-sm rounded-lg transition-colors flex items-center gap-1"
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {paymentMethods.map((method) => (
                  <div
                    key={method.Id}
                    className="bg-gray-700 border border-[#BF8D6B] rounded p-2 text-xs"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-white">
                        {method.tipo_de_cobro}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => startEditing(method)}
                          className="text-gray-400 hover:text-gray-300"
                          title="Editar"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => deletePaymentMethod(method.Id)}
                          className="text-red-400 hover:text-red-300"
                          title="Eliminar"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <div className="text-gray-300">
                      {method.impuesto &&
                      Object.keys(method.impuesto).length > 0 ? (
                        Object.entries(method.impuesto).map(
                          ([cuotas, porcentaje]) => (
                            <div key={cuotas}>
                              {cuotas} cuota{cuotas !== "1" ? "s" : ""}:{" "}
                              {porcentaje}%
                            </div>
                          )
                        )
                      ) : (
                        <span className="text-gray-400">Sin impuestos</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "informacion" && (
            <div className="space-y-6">
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    Salones Habilitados ({salones.length})
                  </h3>
                  <div className="text-sm text-gray-400 mt-1 sm:mt-0">
                    Mostrando todos los salones activos
                  </div>
                </div>
                <div
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto p-2"
                  style={{ scrollbarWidth: "thin" }}
                >
                  {loadingSalones ? (
                    <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4 h-32 flex items-center justify-center bg-gray-700 rounded-lg border border-[#BF8D6B]">
                      <p className="text-[#BF8D6B]">Cargando salones...</p>
                    </div>
                  ) : errorSalones ? (
                    <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4 h-32 flex items-center justify-center bg-gray-700 rounded-lg border border-[#BF8D6B]">
                      <p className="text-red-400">Error: {errorSalones}</p>
                    </div>
                  ) : salones.length > 0 ? (
                    salones.map((salon) => (
                      <div
                        key={salon.id}
                        className={`bg-gray-700 border border-[#BF8D6B] rounded-lg overflow-hidden hover:bg-gray-600 transition-colors cursor-pointer ${
                          data.salonesHabilitados.some((s) => s.id === salon.id)
                            ? "bg-[#BF8D6B]/20 border-[#BF8D6B]"
                            : ""
                        }`}
                        onClick={() => {
                          const isSelected = data.salonesHabilitados.some(
                            (s) => s.id === salon.id
                          );
                          setData((prev) => ({
                            ...prev,
                            salonesHabilitados: isSelected
                              ? prev.salonesHabilitados.filter(
                                  (s) => s.id !== salon.id
                                )
                              : [...prev.salonesHabilitados, salon],
                          }));
                        }}
                      >
                        <div className="h-40 bg-gray-800 overflow-hidden">
                          <img
                            src={salon.image || ""}
                            alt={salon.nombre}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "";
                              e.target.alt = "Imagen no disponible";
                            }}
                          />
                        </div>
                        <div className="p-2">
                          <span className="text-sm font-light text-white">
                            {salon.salon}
                          </span>
                          {data.salonesHabilitados.some(
                            (s) => s.id === salon.id
                          ) && (
                            <span className="text-green-400 text-xs mt-1 block">
                              Seleccionado
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4 h-32 flex items-center justify-center bg-gray-700 rounded-lg border border-[#BF8D6B]">
                      <p className="text-gray-400">
                        No hay salones activos disponibles
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">
                  Vendedores asignados
                </h3>
                {loadingUsuarios ? (
                  <div className="text-[#BF8D6B] mb-4">
                    Cargando usuarios...
                  </div>
                ) : errorUsuarios ? (
                  <div className="text-red-400 mb-4">{errorUsuarios}</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {usuarios.length > 0 ? (
                      usuarios.map((vendedor) => {
                        const isSelected = data.vendedoresAsignados.some(
                          (v) => v.id === vendedor.id
                        );
                        return (
                          <div
                            key={vendedor.id}
                            className={`bg-gray-700 border border-[#BF8D6B] rounded-lg overflow-hidden cursor-pointer ${
                              isSelected
                                ? "bg-[#BF8D6B]/20 border-[#BF8D6B]"
                                : ""
                            }`}
                            onClick={() => {
                              setData((prev) => ({
                                ...prev,
                                vendedoresAsignados: isSelected
                                  ? prev.vendedoresAsignados.filter(
                                      (v) => v.id !== vendedor.id
                                    )
                                  : [...prev.vendedoresAsignados, vendedor],
                              }));
                            }}
                          >
                            <div className="p-4 h-32">
                              <div className="space-y-1 text-white">
                                <p className="font-medium">{vendedor.nombre}</p>
                                <p className="text-xs text-gray-300">
                                  Teléfono: {vendedor.telefono}
                                </p>
                                <p className="text-xs text-gray-300">
                                  Email: {vendedor.email}
                                </p>
                                <p className="text-xs text-gray-300">
                                  WhatsApp: {vendedor.whatsapp}
                                </p>
                                {isSelected && (
                                  <span className="text-green-400 text-xs mt-1 block">
                                    Seleccionado
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4 h-32 flex items-center justify-center bg-gray-700 rounded-lg border border-[#BF8D6B]">
                        <p className="text-gray-400">
                          No hay vendedores disponibles
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-4">
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full font-bold py-2 px-2 rounded bg-[#BF8D6B] text-white text-sm"
          >
            Guardar
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full font-bold py-2 px-2 rounded bg-transparent text-white border border-[#BF8D6B] text-sm"
          >
            Cancelar
          </button>
        </div>
      </div>

      {showTaxRateModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] rounded-lg p-6 w-full max-w-md shadow-lg">
            <h3 className="text-lg font-bold text-white mb-4">
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
                  className="w-full p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#BF8D6B]"
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
                  className="w-full p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#BF8D6B]"
                  placeholder="Ej: 10.5"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowTaxRateModal(false)}
                className="px-4 py-2 text-white bg-transparent border border-[#BF8D6B] rounded hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleTaxRateSubmit}
                className="px-4 py-2 bg-[#BF8D6B] text-white rounded hover:bg-[#a67454] transition-colors"
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
