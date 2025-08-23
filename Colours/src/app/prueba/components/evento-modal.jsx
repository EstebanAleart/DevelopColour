"use client";

import { useState, useEffect } from "react";
import { X, Calendar, Clock, Users, Home, Check, Image } from "lucide-react";
import apiUrls from "@/app/components/utils/apiConfig";
import Swal from "sweetalert2";

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
  const [loadingImages, setLoadingImages] = useState(false);
  const [activeTab, setActiveTab] = useState("info");
  const [capacidadError, setCapacidadError] = useState("");

  useEffect(() => {
    const fetchSalones = async () => {
      try {
        setFetchingSalones(true);
        const response = await fetch(`${API_URL}/api/salon?limit=100`);
        if (!response.ok) {
          throw new Error("Error al cargar los salones");
        }

        const data = await response.json();
        let salonesData = [];

        if (data.success && Array.isArray(data.data)) {
          salonesData = data.data;
        } else if (Array.isArray(data)) {
          salonesData = data;
        } else if (data.salones && Array.isArray(data.salones)) {
          salonesData = data.salones;
        }

        const activeSalones = salonesData.filter(
          (salon) =>
            salon.estatus === true ||
            salon.isActive === true ||
            salon.activo === true
        );

        const validSalones = activeSalones.filter((salon) => {
          return salon.Id || salon.id || salon._id;
        });

        const normalizedSalones = validSalones.map((salon) => ({
          Id: salon.Id || salon.id || salon._id,
          nombre: salon.salon || salon.nombre || "Salón sin nombre",
          capacidad: salon.capacidad,
        }));

        setSalones(normalizedSalones);

        if (normalizedSalones.length === 0) {
          setError(
            "No hay salones disponibles o los salones no tienen IDs válidos"
          );
        } else {
          setFormData((prev) => ({
            ...prev,
            salonId: normalizedSalones[0].Id,
          }));
        }
      } catch (err) {
        console.error("Error fetching salones:", err);
        setError("No se pudieron cargar los salones: " + err.message);
      } finally {
        setFetchingSalones(false);
      }
    };

    fetchSalones();
    fetchImages();
  }, []);

  const fetchImages = async () => {
    setLoadingImages(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/upload/images`, {
        cache: "no-store",
      });

      if (!res.ok) throw new Error("No se pudieron obtener las imágenes");

      const data = await res.json();
      console.log("Imágenes cargadas:", data);
      setImages(data);
    } catch (err) {
      console.error("Error al cargar imágenes:", err);
      setError("Error al obtener imágenes: " + err.message);
    } finally {
      setLoadingImages(false);
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

    if (name === "capacidad" || name === "salonId") {
      let capacidad = name === "capacidad" ? newValue : formData.capacidad;
      let salonId = name === "salonId" ? newValue : formData.salonId;
      const selectedSalon = salones.find((salon) => salon.Id === salonId);
      if (
        selectedSalon &&
        selectedSalon.capacidad &&
        capacidad > selectedSalon.capacidad
      ) {
        setCapacidadError(
          `La capacidad del evento (${capacidad}) supera la capacidad máxima del salón (${selectedSalon.capacidad}).`
        );
      } else {
        setCapacidadError("");
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nombre) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "El campo 'nombre' es obligatorio.",
      });
      return;
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
      return;
    }

    if (
      selectedSalon.capacidad &&
      formData.capacidad > selectedSalon.capacidad
    ) {
      setCapacidadError(
        `La capacidad del evento (${formData.capacidad}) supera la capacidad máxima del salón (${selectedSalon.capacidad}).`
      );
      return;
    } else {
      setCapacidadError("");
    }

    onEventoAdded({
      ...formData,
      salonId: selectedSalon.Id,
      salonNombre: selectedSalon.nombre,
      image: formData.image || null,
    });
  };

  const getTodayString = () => {
    const today = new Date();
    // Ajustar a la zona horaria local
    const localDate = new Date(
      today.getTime() - today.getTimezoneOffset() * 60000
    );
    return localDate.toISOString().slice(0, 16);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg border-2 border-yellow-600 p-4 sm:p-6 w-full max-w-3xl mx-auto shadow-lg shadow-yellow-800/20 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sm:mb-6 sticky top-0 bg-gray-800 pb-2 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Agregar Evento</h2>
          <button
            onClick={onClose}
            className="text-yellow-500 hover:text-yellow-300 transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="flex border-b border-gray-700 mb-4">
          <button
            onClick={() => setActiveTab("info")}
            className={`py-2 px-4 text-sm font-medium ${
              activeTab === "info"
                ? "text-yellow-500 border-b-2 border-yellow-500"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Información del Evento
          </button>
          <button
            onClick={() => setActiveTab("imagenes")}
            className={`py-2 px-4 text-sm font-medium flex items-center ${
              activeTab === "imagenes"
                ? "text-yellow-500 border-b-2 border-yellow-500"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Image className="h-4 w-4 mr-1" />
            Seleccionar Imagen
          </button>
        </div>

        {activeTab === "info" ? (
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1 text-white">
                Nombre del Evento
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  className="w-full bg-gray-700 border border-yellow-600 rounded-lg p-3 pl-10 text-white focus:outline-none focus:ring-1 focus:ring-yellow-500 transition-colors"
                  value={formData.nombre || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                  required
                />
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-500 h-5 w-5" />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1 text-white">
                Salón
              </label>
              {fetchingSalones ? (
                <div className="p-3 text-center bg-gray-700 rounded-lg border border-yellow-600 text-yellow-500">
                  Cargando salones...
                </div>
              ) : (
                <>
                  {salones.length > 0 ? (
                    <div className="relative">
                      <select
                        name="salonId"
                        className="w-full bg-gray-700 border border-yellow-600 rounded-lg p-3 pl-10 text-white focus:outline-none focus:ring-1 focus:ring-yellow-500 transition-colors appearance-none"
                        value={formData.salonId}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Seleccionar Salón</option>
                        {salones.map((salon) => (
                          <option key={salon.Id} value={salon.Id}>
                            {salon.nombre}{" "}
                            {salon.capacidad
                              ? `(Capacidad: ${salon.capacidad})`
                              : ""}
                          </option>
                        ))}
                      </select>
                      <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-500 h-5 w-5" />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-5 w-5 text-yellow-500"
                        >
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-yellow-900/50 border border-yellow-600 text-yellow-300 px-4 py-3 rounded text-sm">
                      No hay salones disponibles. Por favor, agregue un salón
                      primero.
                    </div>
                  )}
                </>
              )}
              {formData.salonId && (
                <div className="text-xs mt-1 text-gray-400 truncate">
                  ID: {formData.salonId}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-white">
                Fecha y Hora
              </label>
              <div className="relative">
                <input
                  type="datetime-local"
                  name="fecha"
                  className="w-full bg-gray-700 border border-yellow-600 rounded-lg p-3 pl-10 text-white focus:outline-none focus:ring-1 focus:ring-yellow-500 transition-colors"
                  value={formData.fecha}
                  onChange={handleChange}
                  min={getTodayString()}
                  step="60"
                  required
                />
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-500 h-5 w-5" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-white">
                Duración (min)
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="duracion"
                  placeholder="Duración en minutos"
                  className="w-full bg-gray-700 border border-yellow-600 rounded-lg p-3 pl-10 text-white focus:outline-none focus:ring-1 focus:ring-yellow-500 transition-colors"
                  value={formData.duracion}
                  onChange={handleChange}
                  min="1"
                  required
                />
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-500 h-5 w-5" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-white">
                Capacidad
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="capacidad"
                  placeholder="Capacidad"
                  className="w-full bg-gray-700 border border-yellow-600 rounded-lg p-3 pl-10 text-white focus:outline-none focus:ring-1 focus:ring-yellow-500 transition-colors"
                  value={formData.capacidad}
                  onChange={handleChange}
                  min="1"
                  required
                />
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-500 h-5 w-5" />
              </div>
              {capacidadError && (
                <div className="text-xs text-red-400 mt-1">
                  {capacidadError}
                </div>
              )}
            </div>

            <div className="flex items-center">
              <label className="flex items-center cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    name="activo"
                    id="activo"
                    className="sr-only"
                    checked={formData.activo}
                    onChange={handleChange}
                  />
                  <div
                    className={`block w-14 h-8 rounded-full transition-colors ${
                      formData.activo ? "bg-yellow-600" : "bg-gray-600"
                    }`}
                  ></div>
                  <div
                    className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
                      formData.activo ? "transform translate-x-6" : ""
                    }`}
                  ></div>
                </div>
                <div className="ml-3 text-white text-sm">
                  {formData.activo ? "Evento Activo" : "Evento Inactivo"}
                </div>
              </label>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1 text-white flex justify-between">
                <span>URL de la Imagen (opcional)</span>
                <button
                  type="button"
                  className="text-xs text-yellow-500 hover:text-yellow-300"
                  onClick={() => setActiveTab("imagenes")}
                >
                  Seleccionar de la galería
                </button>
              </label>
              <div className="relative">
                <input
                  type="url"
                  name="image"
                  placeholder="https://example.com/imagen.jpg (opcional)"
                  className="w-full bg-gray-700 border border-yellow-600 rounded-lg p-3 pl-10 text-white focus:outline-none focus:ring-1 focus:ring-yellow-500 transition-colors"
                  value={formData.image}
                  onChange={handleChange}
                />
                <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-500 h-5 w-5" />
              </div>
              {formData.image && (
                <div className="mt-2">
                  <img
                    src={formData.image}
                    alt="Vista previa"
                    className="h-20 rounded-lg border border-yellow-600"
                  />
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1 text-white">
                Descripción del Evento (opcional)
              </label>
              <textarea
                name="descripcion"
                placeholder="Descripción detallada del evento"
                className="w-full bg-gray-700 border border-yellow-600 rounded-lg p-3 text-white focus:outline-none focus:ring-1 focus:ring-yellow-500 transition-colors"
                value={formData.descripcion}
                onChange={handleChange}
                rows="4"
              ></textarea>
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full mt-6 bg-yellow-700 hover:bg-yellow-600 text-white font-bold py-3 px-4 rounded-lg border border-yellow-600 transition-colors duration-300 flex items-center justify-center gap-2"
                disabled={loading || fetchingSalones || salones.length === 0}
              >
                {loading ? (
                  "Creando..."
                ) : (
                  <>
                    <Check className="h-5 w-5" />
                    <span>Crear Evento</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : activeTab === "imagenes" ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">
                Seleccionar imagen para el evento (opcional)
              </h3>
              <button
                onClick={fetchImages}
                className="text-xs text-yellow-500 hover:text-yellow-300 flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-3 w-3 mr-1"
                >
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                  <path d="M21 3v5h-5" />
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                  <path d="M8 16H3v5" />
                </svg>
                Actualizar
              </button>
            </div>

            {loadingImages ? (
              <div className="py-8 text-center text-yellow-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="animate-spin h-8 w-8 mx-auto mb-2"
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                <p>Cargando imágenes...</p>
              </div>
            ) : images.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {images.map((image, index) => (
                  <div key={image.id || index} className="relative">
                    <img
                      src={image.url}
                      alt={`Imagen ${index + 1}`}
                      className={`w-full h-32 object-cover rounded-lg border cursor-pointer ${
                        selectedImage === image.url
                          ? "border-green-500 ring-2 ring-green-500"
                          : "border-yellow-600 hover:border-yellow-400"
                      }`}
                      onClick={() => selectImage(image.url)}
                    />
                    {selectedImage === image.url && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-400 border border-dashed border-gray-600 rounded-lg">
                <Image className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No hay imágenes disponibles</p>
              </div>
            )}

            <div className="flex justify-end mt-4 space-x-3">
              <button
                type="button"
                onClick={() => setActiveTab("info")}
                className="px-4 py-2 text-yellow-500 hover:text-yellow-300 border border-yellow-600 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (selectedImage) {
                    setFormData((prev) => ({ ...prev, image: selectedImage }));
                  }
                  setActiveTab("info");
                }}
                className="px-4 py-2 bg-yellow-700 hover:bg-yellow-600 text-white rounded-lg border border-yellow-600 transition-colors flex items-center gap-2"
              >
                <Check className="h-4 w-4" />
                <span>
                  {selectedImage
                    ? "Usar imagen seleccionada"
                    : "Continuar sin imagen"}
                </span>
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
