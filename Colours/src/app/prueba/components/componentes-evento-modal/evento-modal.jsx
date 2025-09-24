"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import apiUrls from "@/app/components/utils/apiConfig";
import Swal from "sweetalert2";
import InfoTab from "./InfoTab";
import ImagesTab from "./ImagesTab";
import { fetchSalones, fetchImages } from "./apiServices";
import { handleEventoAdded } from "../../eventos/api/api"; // Imported for POST

const API_URL = apiUrls;

export default function EventoModal({ onClose, onEventoAdded }) {
  const [formData, setFormData] = useState({
    nombre: "",
    fecha: "",
    duracion: 60,
    capacidad: 1,
    activo: true,
    salonId: "",
    image: "",
    descripcion: "",
  });

  const [salones, setSalones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingSalones, setFetchingSalones] = useState(true);
  const [error, setError] = useState(null);
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  const [capacidadError, setCapacidadError] = useState("");

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setFetchingSalones(true);
        const salonesData = await fetchSalones(API_URL);
        setSalones(salonesData);

        if (salonesData.length > 0) {
          setFormData((prev) => ({
            ...prev,
            salonId: salonesData[0].Id,
          }));
        }
      } catch (err) {
        setError("No se pudieron cargar los salones: " + err.message);
      } finally {
        setFetchingSalones(false);
      }
    };

    loadInitialData();
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      setImagesLoading(true);
      const imagesData = await fetchImages(API_URL);
      setImages(imagesData);
    } catch (err) {
      setError("Error al obtener imágenes: " + err.message);
    } finally {
      setImagesLoading(false);
    }
  };

  const selectImage = (url) => {
    setSelectedImage(url);
    setFormData((prev) => ({
      ...prev,
      image: url,
    }));
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let newValue;

    if (type === "number") {
      newValue = Number.parseInt(value) || 0;
    } else if (type === "checkbox") {
      newValue = e.target.checked;
    } else {
      newValue = value;
    }

    setFormData({
      ...formData,
      [name]: newValue,
    });

    validateCapacity(name, newValue);
  };

  const validateCapacity = (fieldName, newValue) => {
    if (fieldName === "capacidad" || fieldName === "salonId") {
      let capacidad = fieldName === "capacidad" ? newValue : formData.capacidad;
      let salonId = fieldName === "salonId" ? newValue : formData.salonId;

      const selectedSalon = salones.find((salon) => salon.Id === salonId);

      if (selectedSalon?.capacidad && capacidad > selectedSalon.capacidad) {
        setCapacidadError(
          `La capacidad del evento (${capacidad}) supera la capacidad máxima del salón (${selectedSalon.capacidad}).`
        );
      } else {
        setCapacidadError("");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true); // Added loading during submit

    const selectedSalon = salones.find(
      (salon) => salon.Id === formData.salonId
    );

    const data = {
      ...formData,
      salonId: selectedSalon.Id,
      salonNombre: selectedSalon.nombre,
      image: formData.image || null,
    };

    try {
      const success = await handleEventoAdded(data);
      if (success) {
        onEventoAdded(); // Call parent callback for re-fetch and close
      }
    } catch (err) {
      console.error("Error creating event:", err);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.nombre) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "El campo 'nombre' es obligatorio.",
      });
      return false;
    }

    const selectedSalon = salones.find(
      (salon) => salon.Id === formData.salonId
    );
    if (!selectedSalon) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Debe seleccionar un salón válido.",
      });
      return false;
    }

    if (
      selectedSalon.capacidad &&
      formData.capacidad > selectedSalon.capacidad
    ) {
      setCapacidadError(
        `La capacidad del evento (${formData.capacidad}) supera la capacidad máxima del salón (${selectedSalon.capacidad}).`
      );
      return false;
    }

    return true;
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-2 md:p-4">
      <div className="bg-[#1a1a1a] rounded-lg p-3 md:p-4 w-full max-w-xs md:max-w-3xl max-h-[95vh] overflow-y-auto shadow-lg">
        <div className="flex justify-between items-center mb-3 md:mb-3">
          <h2 className="text-base md:text-lg font-bold text-white">
            Agregar Evento
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 md:p-0"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4 md:h-5 md:w-5" />
          </button>
        </div>

        {error && (
          <div className="p-2 md:p-2 bg-red-900/50 text-red-300 text-xs md:text-sm rounded border border-red-700 mb-3 md:mb-3">
            {error}
          </div>
        )}

        <div className="flex border-b border-gray-700 mb-3 md:mb-3">
          <button
            onClick={() => setActiveTab("info")}
            className={`py-2 px-3 md:px-4 text-xs ${
              activeTab === "info"
                ? "text-[#BF8D6B] border-b-2 border-[#BF8D6B]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Información
          </button>
          <button
            onClick={() => setActiveTab("imagenes")}
            className={`py-2 px-3 md:px-4 text-xs flex items-center ${
              activeTab === "imagenes"
                ? "text-[#BF8D6B] border-b-2 border-[#BF8D6B]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Imágenes
          </button>
        </div>

        {activeTab === "info" ? (
          <InfoTab
            formData={formData}
            setFormData={setFormData}
            salones={salones}
            fetchingSalones={fetchingSalones}
            capacidadError={capacidadError}
            loading={loading}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            setActiveTab={setActiveTab}
          />
        ) : (
          <ImagesTab
            images={images}
            selectedImage={selectedImage}
            loadingImages={imagesLoading}
            selectImage={selectImage}
            loadImages={loadImages}
            setActiveTab={setActiveTab}
            setFormData={setFormData}
          />
        )}
      </div>
    </div>
  );
}
