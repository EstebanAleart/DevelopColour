"use client";

import { X, Check } from "lucide-react";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import apiUrls from "@/app/components/utils/apiConfig";

const API_URL = apiUrls;

export default function SalonEditarModal({ salon, onClose }) {
  const [formData, setFormData] = useState({
    salon: salon?.salon || "",
    nombre: salon?.nombre || "",
    capacidad: salon?.capacidad || "",
    cuit: salon?.cuit || "",
    email: salon?.email || "",
    whatsapp: salon?.whatsapp || "",
    MercadopagoKeyP: salon?.MercadopagoKeyP || "",
    Mercadopago: salon?.Mercadopago || "",
    cbu: salon?.cbu || "",
    alias: salon?.alias || "",
    estatus: salon?.estatus ? true : false,
    image: salon?.image || "",
  });

  const [initialSalonName, setInitialSalonName] = useState(salon?.salon || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(salon?.image || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (salon) {
      setFormData({
        salon: salon.salon || "",
        nombre: salon.nombre || "",
        capacidad: salon.capacidad || "",
        cuit: salon.cuit || "",
        email: salon.email || "",
        whatsapp: salon.whatsapp || "",
        MercadopagoKeyP: salon.MercadopagoKeyP || "",
        Mercadopago: salon.Mercadopago || "",
        cbu: salon.cbu || "",
        alias: salon.alias || "",
        estatus: salon.estatus === true,
        image: salon.image || "",
      });
      setInitialSalonName(salon.salon || "");
      setSelectedImage(salon.image || "");
    }
  }, [salon]);

  const fetchImages = async () => {
    setLoading(true);
    setError(null);
    try {
      const imageUrl = apiUrls + "/api/upload/images";

      const res = await fetch(imageUrl, {
        cache: "no-store",
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(
          `No se pudieron obtener las imágenes: ${res.status} ${res.statusText}`
        );
      }

      const data = await res.json();
      console.log("Imágenes cargadas:", data);
      setImages(data);
    } catch (err) {
      console.error("Error al cargar imágenes:", err);
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

    if (name === "cuit") {
      const digits = value.replace(/\D/g, "");
      setFormData((prev) => ({ ...prev, [name]: digits }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const checkSalonExists = async (name) => {
    if (name.toLowerCase() === initialSalonName.toLowerCase()) {
      return false;
    }

    try {
      const response = await fetch(
        `${apiUrls.production}/api/salon?search=${encodeURIComponent(name)}`
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error checking salon:", errorText);
        throw new Error("Error al verificar disponibilidad del nombre");
      }

      const data = await response.json();
      const salones = data.data || [];

      return salones.some(
        (s) => s.salon && s.salon.toLowerCase() === name.toLowerCase()
      );
    } catch (error) {
      console.error("Error checking salon:", error);
      throw new Error("Error al verificar disponibilidad del nombre");
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const requiredFields = ["salon", "nombre", "cuit", "email", "whatsapp"];
      const missingFields = requiredFields.filter((field) => !formData[field]);

      if (missingFields.length > 0) {
        throw new Error("Todos los campos marcados con * son obligatorios");
      }

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

      if (formData.salon !== initialSalonName) {
        const exists = await checkSalonExists(formData.salon);
        if (exists) {
          throw new Error("Ya existe un salón con este nombre");
        }
      }

      const submissionData = {
        ...formData,
        cuit: formattedCUIT,
        capacidad: formData.capacidad
          ? Number.parseInt(formData.capacidad)
          : null,
        image: selectedImage,
      };

      console.log("Sending update to:", `${API_URL}/api/salon/${salon.Id}`);
      console.log("Update data:", submissionData);

      const response = await fetch(`${API_URL}/api/salon/${salon.Id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Server error:", errorData);
        throw new Error(
          errorData.message ||
            `Error al actualizar (${response.status}: ${response.statusText})`
        );
      }

      const result = await response.json();
      setSuccessMessage(result.message || "Salón actualizado correctamente");

      setTimeout(() => {
        onClose(true);
      }, 1500);
    } catch (error) {
      console.error("Submit error:", error);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageEdit = (url) => {
    setSelectedImage(url);
    setFormData((prev) => ({ ...prev, image: url }));
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] rounded-lg p-2 w-full max-w-xl shadow-lg">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-base font-bold text-white">Editar Salón</h2>
          <button
            onClick={() => onClose(false)}
            className="text-gray-400 hover:text-white"
            disabled={isSubmitting}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="mb-2 p-1 bg-red-900/50 text-red-300 text-xs rounded border border-red-700">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-2 p-1 bg-green-900/50 text-green-300 text-xs rounded border border-green-700">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="space-y-2">
              <div>
                <input
                  type="text"
                  name="salon"
                  placeholder="Nombre del Salón *"
                  className="w-full p-1 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs"
                  value={formData.salon}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <input
                  type="text"
                  name="nombre"
                  placeholder="Contacto *"
                  className="w-full p-1 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <input
                  type="number"
                  name="capacidad"
                  placeholder="Capacidad"
                  min="1"
                  className="w-full p-1 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs"
                  value={formData.capacidad}
                  onChange={handleChange}
                />
              </div>
              <div>
                <input
                  type="text"
                  name="cuit"
                  placeholder="CUIT (11 dígitos) *"
                  className="w-full p-1 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs"
                  value={formData.cuit}
                  onChange={handleChange}
                  maxLength="11"
                  required
                />
                {formData.cuit.length === 11 && (
                  <span className="text-green-400 text-xs">
                    {formatCUIT(formData.cuit)}
                  </span>
                )}
              </div>
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email *"
                  className="w-full p-1 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="checkbox"
                  name="estatus"
                  checked={formData.estatus}
                  onChange={handleChange}
                  className="h-3 w-3 text-[#BF8D6B] rounded"
                />
                <span className="text-xs text-white">Activo</span>
              </div>
            </div>

            <div className="space-y-2">
              <div>
                <input
                  type="tel"
                  name="whatsapp"
                  placeholder="WhatsApp *"
                  className="w-full p-1 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
              </div>
              <div>
                <input
                  type="text"
                  name="MercadopagoKeyP"
                  placeholder="Clave Pública MP"
                  className="w-full p-1 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs"
                  value={formData.MercadopagoKeyP}
                  onChange={handleChange}
                />
              </div>
              <div>
                <input
                  type="text"
                  name="Mercadopago"
                  placeholder="Token MP"
                  className="w-full p-1 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs"
                  value={formData.Mercadopago}
                  onChange={handleChange}
                />
              </div>
              <div>
                <input
                  type="text"
                  name="cbu"
                  placeholder="CBU"
                  className="w-full p-1 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs"
                  value={formData.cbu}
                  onChange={handleChange}
                />
              </div>
              <div>
                <input
                  type="text"
                  name="alias"
                  placeholder="Alias CBU"
                  className="w-full p-1 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs"
                  value={formData.alias}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 font-bold py-1 px-2 rounded bg-[#BF8D6B] text-white text-xs flex items-center justify-center gap-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              "Actualizando..."
            ) : (
              <>
                <Check className="h-3 w-3" />
                <span>Actualizar</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-2 space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-semibold text-white">
              Imágenes disponibles
            </h3>
            {loading ? (
              <span className="text-[#BF8D6B] text-xs">Cargando...</span>
            ) : (
              <button
                onClick={refreshImages}
                className="text-xs text-[#BF8D6B] hover:text-[#a67454]"
              >
                Refrescar
              </button>
            )}
          </div>

          {images.length > 0 ? (
            <div className="overflow-y-auto max-h-40 pr-1">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 py-1">
                {images.map((image, index) => (
                  <div
                    key={image.id || index}
                    className="relative flex-shrink-0"
                  >
                    <img
                      src={image.url}
                      alt="Imagen subida"
                      className={`w-full h-16 object-cover rounded border-2 cursor-pointer ${
                        selectedImage === image.url
                          ? "border-green-500"
                          : "border-[#BF8D6B]"
                      }`}
                      onClick={() => handleImageEdit(image.url)}
                      title="Seleccionar"
                    />
                    {selectedImage === image.url && (
                      <div className="absolute top-1 right-1 bg-green-500 text-white rounded-full p-0.5">
                        <Check className="h-2 w-2" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-1 text-gray-400 text-xs">
              {loading ? "Cargando..." : "No hay imágenes"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
