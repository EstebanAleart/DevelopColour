"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { X, Edit2, Save, XCircle, Plus, Trash2 } from "lucide-react";
import apiUrls from "@/app/components/utils/apiConfig";

// Importar los componentes modularizados
import InformacionTab from "./InformacionTab";
import PaymentMethodsTab from "./PaymentMethodsTab";
import TaxRateModal from "./TaxRateModal";

const API_URL = apiUrls;

export default function ColourRosarioModal({ punto, onClose, onUpdate }) {
  const [activeTab, setActiveTab] = useState("informacion");
  const [validationError, setValidationError] = useState(null);
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

  const handleBlurField = (e) => {
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
    <div className="fixed inset-0 flex items-center justify-center z-50 p-2 md:p-4 ">
      <div className="bg-[#1a1a1a] rounded-lg p-3 md:p-4 w-full max-w-xs md:max-w-4xl max-h-[95vh] overflow-y-auto shadow-lg">
        <div className="flex justify-between items-center mb-3 md:mb-3">
          <h2 className="text-base md:text-lg font-bold text-white">
            {punto?.id ? "Editar Punto de Venta" : "Agregar Punto de Venta"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 md:p-0"
          >
            <X className="h-4 w-4 md:h-5 md:w-5" />
          </button>
        </div>

        <div className="space-y-2 md:space-y-2">
          {validationError && (
            <div className="p-2 md:p-2 bg-red-900/50 text-red-300 text-xs rounded border border-red-700">
              {validationError}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-2">
            <input
              type="text"
              name="razon"
              placeholder="Razón Social *"
              value={data.razon}
              onChange={handleChange}
              className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs md:text-sm"
              required
            />
            <input
              type="text"
              name="nombre"
              placeholder="Nombre *"
              value={data.nombre}
              onChange={handleChange}
              className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs md:text-sm"
              required
            />
            <input
              type="text"
              name="direccion"
              placeholder="Dirección *"
              value={data.direccion}
              onChange={handleChange}
              className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs md:text-sm"
              required
            />
            <input
              type="text"
              name="cuit"
              placeholder="CUIT (11 dígitos) *"
              value={data.cuit}
              onChange={handleChange}
              className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs md:text-sm"
              maxLength="11"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="E-mail *"
              value={data.email}
              onChange={handleChange}
              className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs md:text-sm"
              required
            />
            <input
              type="tel"
              name="whatsapp"
              placeholder="WhatsApp"
              value={data.whatsapp}
              onChange={handleChange}
              onBlur={handleBlurField}
              className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs md:text-sm"
            />
            <div className="flex items-center col-span-1 md:col-span-1">
              <label className="flex items-center space-x-1 text-white text-xs md:text-sm">
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
            <PaymentMethodsTab
              API_URL={API_URL}
              data={data}
              setData={setData}
            />
          )}

          {activeTab === "informacion" && (
            <InformacionTab API_URL={API_URL} data={data} setData={setData} />
          )}
        </div>

        <div className="flex flex-col-reverse md:flex-row gap-2 md:gap-2 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full md:w-auto px-3 py-1.5 md:py-2 text-xs md:text-sm text-white bg-transparent border border-[#BF8D6B] rounded hover:bg-[#BF8D6B] hover:bg-opacity-20 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full md:w-auto px-3 py-1.5 md:py-2 text-xs md:text-sm font-bold rounded bg-[#BF8D6B] text-white hover:bg-[#a67454] transition-colors"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
