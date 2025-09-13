"use client";

import { X, Check } from "lucide-react";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import apiUrls from "@/app/components/utils/apiConfig";

const API_URL = apiUrls;

export default function SalonModal({ onClose, onAddSalon }) {
  const [formData, setFormData] = useState({
    salon: "",
    nombre: "",
    capacidad: "",
    cuit: "",
    email: "",
    whatsapp: "",
    MercadopagoKeyP: "",
    Mercadopago: "",
    cbu: "",
    alias: "",
    estatus: "true",
    image: "", // Nueva propiedad para la URL de la imagen
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("info");
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null); // Nueva variable de estado
  const [loading, setLoading] = useState(false);

  const fetchImages = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/upload/images`, {
        cache: "no-store",
      });

      if (!res.ok) throw new Error("No se pudieron obtener las imágenes");

      const data = await res.json();
      setImages(data);
    } catch (err) {
      setError(err.message);
      Swal.fire({
        icon: "error",
        title: "Error al obtener imágenes",
        text: err.message || "Ocurrió un error al obtener las imágenes",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const refreshImages = () => {
    fetchImages();
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;

    // Validación especial para WhatsApp al perder el foco
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
    const { name, value } = e.target;

    // Validación especial para WhatsApp
    if (name === "whatsapp") {
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

    // Validación especial para CUIT (acepta números y caracteres)
    if (name === "cuit") {
      setFormData((prev) => ({ ...prev, [name]: value }));
      return;
    }

    // Para los demás campos, actualizamos normalmente
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const requiredFields = ["salon", "nombre", "cuit", "email", "whatsapp"];
      const missingFields = requiredFields.filter((field) => !formData[field]);

      if (missingFields.length > 0) {
        throw new Error("Todos los campos marcados con * son obligatorios");
      }

      // Validación de WhatsApp
      if (formData.whatsapp && !/^\+?\d+$/.test(formData.whatsapp)) {
        throw new Error(
          "El WhatsApp solo puede contener números y un + al inicio"
        );
      }

      const formattedCUIT = formatCUIT(formData.cuit);
      const cuitPattern = /^\d{2}-\d{8}-\d{1}$/;
      if (!cuitPattern.test(formattedCUIT)) {
        throw new Error(
          "El CUIT debe tener 11 dígitos con formato XX-XXXXXXXX-X"
        );
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(formData.email)) {
        throw new Error("El formato del correo electrónico es inválido");
      }

      if (await checkSalonExists(formData.salon)) {
        throw new Error("Ya existe un salón con este nombre");
      }

      const submissionData = {
        ...formData,
        cuit: formattedCUIT,
      };

      // Eliminar la propiedad `image` si está vacía
      if (!submissionData.image) {
        delete submissionData.image;
      }

      await onAddSalon(submissionData);
      onClose();
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url).then(
      () => {
        setSelectedImage(url); // Marca la imagen como seleccionada
        setFormData((prev) => ({ ...prev, image: url })); // Actualiza la URL de la imagen en formData
      },
      (err) => {
        console.error("Error al copiar la URL:", err);
      }
    );
  };

  const formatCUIT = (cuit) => {
    const digits = cuit.replace(/\D/g, ""); // Elimina caracteres no numéricos
    if (digits.length === 11) {
      return `${digits.substring(0, 2)}-${digits.substring(
        2,
        10
      )}-${digits.substring(10)}`;
    }
    return digits; // Devuelve solo los dígitos si no está completo
  };

  const checkSalonExists = async (name) => {
    try {
      const response = await fetch(`${API_URL}?search=${name}`);
      if (!response.ok) {
        return false;
      }
      const data = await response.json();
      const salones = Array.isArray(data)
        ? data
        : data.data
        ? data.data
        : data.salones
        ? data.salones
        : [];

      return salones.some(
        (salon) =>
          salon.salon && salon.salon.toLowerCase() === name.toLowerCase()
      );
    } catch (error) {
      return false;
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] rounded-lg p-4 w-full max-w-3xl shadow-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold text-white">Agregar Salón</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="p-2 bg-red-900/50 text-red-300 text-xs rounded border border-red-700 mb-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <input
              type="text"
              name="salon"
              placeholder="Nombre del Salón *"
              value={formData.salon}
              onChange={handleChange}
              className="w-full p-1 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs"
              required
            />
            <input
              type="text"
              name="nombre"
              placeholder="Nombre del Contacto *"
              value={formData.nombre}
              onChange={handleChange}
              className="w-full p-1 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs"
              required
            />
            <input
              type="number"
              name="capacidad"
              placeholder="Capacidad"
              min="1"
              value={formData.capacidad}
              onChange={handleChange}
              className="w-full p-1 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs"
            />
            <input
              type="text"
              name="cuit"
              placeholder="CUIT (11 dígitos) *"
              value={formData.cuit}
              onChange={handleChange}
              className="w-full p-1 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs"
              maxLength="11"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email *"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-1 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs"
              required
            />
            <input
              type="tel"
              name="whatsapp"
              placeholder="WhatsApp *"
              value={formData.whatsapp}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-full p-1 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs"
              required
            />
            <input
              type="text"
              name="MercadopagoKeyP"
              placeholder="Clave Pública de MercadoPago"
              value={formData.MercadopagoKeyP}
              onChange={handleChange}
              className="w-full p-1 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs"
            />
            <input
              type="text"
              name="Mercadopago"
              placeholder="Token de MercadoPago"
              value={formData.Mercadopago}
              onChange={handleChange}
              className="w-full p-1 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs"
            />
            <input
              type="text"
              name="cbu"
              placeholder="CBU"
              value={formData.cbu}
              onChange={handleChange}
              className="w-full p-1 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs"
            />
            <input
              type="text"
              name="alias"
              placeholder="Alias CBU"
              value={formData.alias}
              onChange={handleChange}
              className="w-full p-1 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs"
            />
            <div className="flex items-center col-span-1">
              <label className="flex items-center space-x-1 text-white text-xs">
                <span>Estatus:</span>
                <select
                  name="estatus"
                  value={formData.estatus}
                  onChange={handleChange}
                  className="ml-1 p-1 bg-transparent text-white rounded border border-[#BF8D6B] text-xs"
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </label>
            </div>
          </div>

          <div className="mt-3">
            <h3 className="text-sm font-semibold text-white mb-2">
              Imágenes disponibles
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
              {images.map((image) => (
                <div key={image.id} className="relative">
                  <img
                    src={image.url}
                    alt="Imagen subida"
                    className={`w-full h-20 object-cover rounded border cursor-pointer ${
                      selectedImage === image.url
                        ? "border-green-500"
                        : "border-[#BF8D6B]"
                    }`}
                    onClick={() => copyToClipboard(image.url)}
                    title="Haz clic para copiar la URL"
                  />
                  {selectedImage === image.url && (
                    <div className="absolute top-1 right-1 bg-green-500 text-white rounded-full p-1">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              className="w-full font-bold py-2 px-2 rounded bg-[#BF8D6B] text-white text-sm flex items-center justify-center gap-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                "Guardando..."
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  <span>Guardar Salón</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full font-bold py-2 px-2 rounded bg-transparent text-white border border-[#BF8D6B] text-sm"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
