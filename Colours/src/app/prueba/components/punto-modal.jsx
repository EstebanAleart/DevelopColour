"use client";

import { X } from "lucide-react";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import apiUrls from "@/app/components/utils/apiConfig";

const API_URL = apiUrls;

export default function PuntoModal({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    razon: "",
    nombre: "",
    direccion: "",
    telefono: "",
    cuit: "",
    email: "",
    es_online: false,
  });

  const [error, setError] = useState(null);
  const [cuitFormatted, setCuitFormatted] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [usuarios, setUsuarios] = useState([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);

  useEffect(() => {
    setLoadingUsuarios(true);
    fetch(`${API_URL}/api/users/usuarios?`)
      .then((res) => res.json())
      .then((data) => {
        const soloVendors = Array.isArray(data)
          ? data.filter((usuario) => usuario.rol === "vendor")
          : [];
        setUsuarios(soloVendors);
      })
      .catch(() => setUsuarios([]))
      .finally(() => setLoadingUsuarios(false));
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
      setFormData((prev) => ({ ...prev, [name]: validatedValue }));
      return;
    }

    if (name === "cuit") {
      const digits = value.replace(/[^\d-]/g, "");
      const digitCount = digits.replace(/-/g, "").length;
      if (digitCount > 11) return;

      setFormData((prev) => ({ ...prev, [name]: digits }));

      const cleanDigits = digits.replace(/-/g, "");
      if (cleanDigits.length >= 2 && cleanDigits.length <= 10) {
        setCuitFormatted(
          `${cleanDigits.substring(0, 2)}-${cleanDigits.substring(2)}`
        );
      } else if (cleanDigits.length === 11) {
        setCuitFormatted(
          `${cleanDigits.substring(0, 2)}-${cleanDigits.substring(
            2,
            10
          )}-${cleanDigits.substring(10)}`
        );
      } else {
        setCuitFormatted(cleanDigits);
      }
      return;
    }

    if (name === "email") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateCUIT = (cuit) => {
    const digits = cuit.replace(/-/g, "");
    if (digits.length !== 11) return false;
    const cuitPattern = /^\d{2}-?\d{8}-?\d{1}$/;
    return cuitPattern.test(cuit);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.razon.trim()) {
      setError("La razón social es requerida");
      return;
    }

    if (!formData.nombre.trim()) {
      setError("El nombre es requerido");
      return;
    }

    if (!formData.direccion.trim()) {
      setError("La dirección es requerida");
      return;
    }

    if (!formData.telefono.trim()) {
      setError("El teléfono es requerido");
      return;
    }

    if (!/^\+?\d+$/.test(formData.telefono)) {
      setError("El teléfono solo puede contener números y un + al inicio");
      return;
    }

    if (!formData.cuit.trim()) {
      setError("El CUIT es requerido");
      return;
    }

    const cleanCUIT = formData.cuit.replace(/-/g, "");
    if (cleanCUIT.length !== 11) {
      setError("El CUIT debe tener exactamente 11 dígitos");
      return;
    }

    if (!validateCUIT(formData.cuit)) {
      setError("El formato del CUIT es inválido (debe ser XX-XXXXXXXX-X)");
      return;
    }

    if (!formData.email.trim()) {
      setError("El email es requerido");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(formData.email)) {
      setError("El formato del correo electrónico es inválido");
      return;
    }

    const formattedCUIT = cleanCUIT.replace(
      /(\d{2})(\d{8})(\d{1})/,
      "$1-$2-$3"
    );

    const puntoCreado = await onSubmit({
      ...formData,
      cuit: formattedCUIT,
    });

    if (selectedUser && puntoCreado && puntoCreado.id) {
      try {
        await fetch(`${API_URL}/api/puntodeventa/addvendedor`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: selectedUser,
            puntoId: puntoCreado.id,
          }),
        });
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo asociar el vendedor al punto.",
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] rounded-lg p-4 w-full max-w-2xl shadow-lg">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold text-white">
            Agregar Punto de Venta
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-2">
          {error && (
            <div className="p-2 bg-red-900/50 text-red-300 text-xs rounded border border-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <input
              type="text"
              name="razon"
              placeholder="Razón Social"
              value={formData.razon}
              onChange={handleChange}
              className="w-full p-1 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs"
              required
            />
            <input
              type="text"
              name="nombre"
              placeholder="Nombre"
              value={formData.nombre}
              onChange={handleChange}
              className="w-full p-1 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs"
              required
            />
            <input
              type="text"
              name="direccion"
              placeholder="Dirección"
              value={formData.direccion}
              onChange={handleChange}
              className="w-full p-1 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs"
              required
            />
            <input
              type="text"
              name="cuit"
              placeholder="CUIT (11 dígitos)"
              value={formData.cuit}
              onChange={handleChange}
              className="w-full p-1 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs"
              maxLength="11"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="E-mail"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-1 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs"
              required
            />
            <input
              type="tel"
              name="telefono"
              placeholder="Teléfono"
              value={formData.telefono}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full p-1 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs"
              required
            />
            <div className="flex items-center col-span-1">
              <label className="flex items-center space-x-1 text-white text-xs">
                <input
                  type="checkbox"
                  name="es_online"
                  checked={formData.es_online}
                  onChange={handleChange}
                  className="h-4 w-4 text-[#BF8D6B] rounded"
                />
                <span>Online</span>
              </label>
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-xs text-gray-300 mb-1">
              Asignar Vendedor
            </label>
            <select
              className="w-full p-1 bg-transparent text-white rounded border border-[#BF8D6B] text-xs"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              disabled={loadingUsuarios}
            >
              <option value="">
                {loadingUsuarios
                  ? "Cargando usuarios..."
                  : "Selecciona un vendedor"}
              </option>
              {usuarios.map((usuario) => (
                <option key={usuario.id} value={usuario.id}>
                  {usuario.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full font-bold py-2 px-2 rounded bg-[#BF8D6B] text-white text-sm"
          >
            Crear
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
    </div>
  );
}
