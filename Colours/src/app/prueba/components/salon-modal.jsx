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
      // console.log("Imágenes cargadas:", data);
      setImages(data);
    } catch (err) {
      // console.error("Error al cargar imágenes:", err);
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
      // console.error("Error checking salon:", error);
      return false;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 text-center flex items-center justify-center">
        {/* Overlay */}
        <div
          className="fixed inset-0  transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal container - increased max-width for two columns */}
        <div className="inline-block align-middle bg-gray-800 rounded-lg border-2 border-yellow-600 p-4 sm:p-6 w-full max-w-3xl shadow-lg shadow-yellow-800/20 text-left overflow-hidden transform transition-all my-8 z-10 relative max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">Agregar Salón</h2>
            <button
              onClick={onClose}
              className="text-yellow-500 hover:text-yellow-300 transition-colors"
              disabled={isSubmitting}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900/50 text-red-300 text-sm rounded-lg border border-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Grid container for two columns on larger screens */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Column 1 - Basic Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-yellow-400 mb-1">
                    Nombre del Salón
                  </label>
                  <input
                    type="text"
                    name="salon"
                    placeholder="Nombre del Salón *"
                    className="w-full p-3 bg-gray-700 text-white rounded-lg border border-yellow-600 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-500 outline-none transition-colors"
                    value={formData.salon}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-yellow-400 mb-1">
                    Nombre del Contacto
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    placeholder="Nombre del Contacto *"
                    className="w-full p-3 bg-gray-700 text-white rounded-lg border border-yellow-600 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-500 outline-none transition-colors"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-yellow-400 mb-1">
                    Capacidad
                  </label>
                  <input
                    type="number"
                    name="capacidad"
                    placeholder="Capacidad"
                    min="1"
                    className="w-full p-3 bg-gray-700 text-white rounded-lg border border-yellow-600 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-500 outline-none transition-colors"
                    value={formData.capacidad}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm text-yellow-400 mb-1">
                    CUIT
                  </label>
                  <input
                    type="text"
                    name="cuit"
                    placeholder="CUIT (11 dígitos) *"
                    className="w-full p-3 bg-gray-700 text-white rounded-lg border border-yellow-600 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-500 outline-none transition-colors"
                    value={formData.cuit}
                    onChange={handleChange}
                    maxLength="11"
                    required
                  />
                  {formData.cuit.length === 11 && (
                    <span className="absolute right-3 top-3 text-green-400 text-sm">
                      {formatCUIT(formData.cuit)}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-yellow-400 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email *"
                    className="w-full p-3 bg-gray-700 text-white rounded-lg border border-yellow-600 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-500 outline-none transition-colors"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Column 2 - Additional Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-yellow-400 mb-1">
                    WhatsApp
                  </label>
                  <input
                    type="tel"
                    name="whatsapp"
                    placeholder="WhatsApp (solo números, + opcional) *"
                    className="w-full p-3 bg-gray-700 text-white rounded-lg border border-yellow-600 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-500 outline-none transition-colors"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-yellow-400 mb-1">
                    Estatus
                  </label>
                  <select
                    name="estatus"
                    value={formData.estatus}
                    onChange={handleChange}
                    className="w-full p-3 bg-gray-700 text-white rounded-lg border border-yellow-600 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-500 outline-none transition-colors"
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-yellow-400 mb-1">
                    Clave Pública de MercadoPago
                  </label>
                  <input
                    type="text"
                    name="MercadopagoKeyP"
                    placeholder="Clave Pública de MercadoPago"
                    className="w-full p-3 bg-gray-700 text-white rounded-lg border border-yellow-600 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-500 outline-none transition-colors"
                    value={formData.MercadopagoKeyP}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm text-yellow-400 mb-1">
                    Token de MercadoPago
                  </label>
                  <input
                    type="text"
                    name="Mercadopago"
                    placeholder="Token de MercadoPago"
                    className="w-full p-3 bg-gray-700 text-white rounded-lg border border-yellow-600 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-500 outline-none transition-colors"
                    value={formData.Mercadopago}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm text-yellow-400 mb-1">
                    CBU
                  </label>
                  <input
                    type="text"
                    name="cbu"
                    placeholder="CBU"
                    className="w-full p-3 bg-gray-700 text-white rounded-lg border border-yellow-600 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-500 outline-none transition-colors"
                    value={formData.cbu}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm text-yellow-400 mb-1">
                Alias CBU
              </label>
              <input
                type="text"
                name="alias"
                placeholder="Alias CBU"
                className="w-full p-3 bg-gray-700 text-white rounded-lg border border-yellow-600 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-500 outline-none transition-colors"
                value={formData.alias}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              className="w-full mt-4 bg-yellow-700 hover:bg-yellow-600 text-white font-bold py-3 px-4 rounded-lg border border-yellow-600 transition-colors duration-300 flex items-center justify-center gap-2"
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
          </form>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">
              Imágenes disponibles
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((image) => (
                <div key={image.id} className="relative">
                  <img
                    src={image.url}
                    alt="Imagen subida"
                    className={`w-full h-auto rounded-lg border cursor-pointer ${
                      selectedImage === image.url
                        ? "border-green-500"
                        : "border-yellow-600"
                    }`} // Cambia el borde si está seleccionada
                    onClick={() => copyToClipboard(image.url)} // Actualiza formData.image al seleccionar
                    title="Haz clic para copiar la URL"
                  />
                  {selectedImage === image.url && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                      ✓
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
