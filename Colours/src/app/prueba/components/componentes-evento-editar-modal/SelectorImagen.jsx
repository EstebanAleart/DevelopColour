"use client";

import { useState, useEffect } from "react";
import { Image, RefreshCw, Loader, Check } from "lucide-react";
import Swal from "sweetalert2";

export default function SelectorImagen({
  formData,
  setFormData,
  selectedImage,
  setActiveTab,
  API_URL,
}) {
  const [images, setImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [error, setError] = useState(null);
  const [currentSelectedImage, setCurrentSelectedImage] =
    useState(selectedImage);

  useEffect(() => {
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
      setImages(data);
    } catch (err) {
      console.error("Error al cargar imágenes:", err);
      setError("Error al obtener imágenes: " + err.message);
    } finally {
      setLoadingImages(false);
    }
  };

  const selectImage = (url) => {
    setCurrentSelectedImage(url);
  };

  const confirmSelection = () => {
    if (currentSelectedImage) {
      setFormData((prev) => ({ ...prev, image: currentSelectedImage }));
      setActiveTab("info");
    } else {
      Swal.fire({
        icon: "warning",
        title: "Ninguna imagen seleccionada",
        text: "Por favor seleccione una imagen o vuelva al formulario.",
      });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-sm md:text-base font-semibold text-white">
          Seleccionar imagen para el evento
        </h3>
        <button
          onClick={fetchImages}
          className="text-xs text-[#BF8D6B] hover:text-[#a67454] flex items-center"
        >
          <RefreshCw className="h-3 w-3 mr-1" /> Actualizar
        </button>
      </div>

      {formData.image && (
        <div className="p-2 bg-transparent rounded border border-[#BF8D6B] mb-3">
          <div className="text-xs text-[#BF8D6B] mb-1">
            URL actual de la imagen:
          </div>
          <div className="text-white text-xs break-all">{formData.image}</div>
        </div>
      )}

      {loadingImages ? (
        <div className="py-4 md:py-6 text-center text-[#BF8D6B]">
          <Loader className="animate-spin h-5 w-5 md:h-6 md:w-6 mx-auto mb-2" />
          <p className="text-xs">Cargando imágenes...</p>
        </div>
      ) : images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {images.map((image, index) => (
            <div key={image.id || index} className="relative">
              <img
                src={image.url}
                alt={`Imagen ${index + 1}`}
                className={`w-full h-16 md:h-20 object-cover rounded border cursor-pointer ${
                  currentSelectedImage === image.url
                    ? "border-green-500 ring-1 ring-green-500"
                    : "border-[#BF8D6B] hover:border-[#a67454]"
                }`}
                onClick={() => selectImage(image.url)}
              />
              {currentSelectedImage === image.url && (
                <div className="absolute top-1 right-1 bg-green-500 text-white rounded-full p-0.5">
                  <Check className="h-2 w-2 md:h-3 md:w-3" />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="py-4 md:py-6 text-center text-gray-400 border border-dashed border-gray-600 rounded text-xs md:text-sm">
          <Image className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-1 opacity-50" />
          <p>No hay imágenes disponibles</p>
        </div>
      )}

      <div className="flex justify-end mt-3 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("info")}
          className="px-2 py-1 md:px-3 md:py-1 text-[#BF8D6B] hover:text-[#a67454] border border-[#BF8D6B] rounded text-xs transition-colors"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={confirmSelection}
          className="px-2 py-1 md:px-3 md:py-1 bg-[#BF8D6B] hover:bg-[#a67454] text-white rounded border border-[#BF8D6B] text-xs flex items-center gap-1 transition-colors"
        >
          <Check className="h-3 w-3" />
          <span>Usar imagen seleccionada</span>
        </button>
      </div>
    </div>
  );
}
