"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import apiUrls from "@/app/components/utils/apiConfig";
import FormFields from "./FormFields";
import ImageGallery from "./ImageGallery";
import ModalHeader from "./ModalHeader";
import FormActions from "./FormActions";

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
    image: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
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
    const { name, value } = e.target;

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
      setFormData((prev) => ({ ...prev, [name]: value }));
      return;
    }

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
        setSelectedImage(url);
        setFormData((prev) => ({ ...prev, image: url }));
      },
      (err) => {
        console.error("Error al copiar la URL:", err);
      }
    );
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
    <div className="fixed inset-0 flex items-center justify-center z-50 p-2 md:p-4">
      <div className="bg-[#1a1a1a] rounded-lg p-3 md:p-4 w-full max-w-4xl max-h-[95vh] overflow-y-auto shadow-lg">
        <ModalHeader onClose={onClose} title="Agregar Salón" />

        {error && (
          <div className="p-2 md:p-2 bg-red-900/50 text-red-300 text-xs rounded border border-red-700 mb-3 md:mb-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-2 md:space-y-3">
          <div className="flex flex-col md:flex-row md:space-x-4">
            <div className="w-full md:w-1/2">
              <FormFields
                formData={formData}
                handleChange={handleChange}
                handleBlur={handleBlur}
              />
            </div>
            <div className="w-full md:w-1/2">
              <ImageGallery
                images={images}
                selectedImage={selectedImage}
                copyToClipboard={copyToClipboard}
              />
            </div>
          </div>

          <div className="flex justify-center">
            <FormActions onClose={onClose} isSubmitting={isSubmitting} />
          </div>
        </form>
      </div>
    </div>
  );
}
