"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Check } from "lucide-react";
import apiUrls from "@/app/components/utils/apiConfig";

export default function SalonImageSelector({
  selectedImage,
  onImageSelect,
  refreshTrigger,
}) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
  }, [refreshTrigger]);

  const refreshImages = () => {
    fetchImages();
  };

  return (
    <div className="mt-4 md:mt-6 space-y-3 md:space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xs md:text-sm font-semibold text-white">
          Imágenes disponibles
        </h3>
        {loading ? (
          <span className="text-[#BF8D6B] text-xs md:text-sm">Cargando...</span>
        ) : (
          <button
            onClick={refreshImages}
            className="text-xs md:text-sm text-[#BF8D6B] hover:text-[#a67454]"
          >
            Refrescar
          </button>
        )}
      </div>

      {images.length > 0 ? (
        <div className="overflow-y-auto max-h-40 md:max-h-48 pr-1">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 py-1">
            {images.map((image, index) => (
              <div key={image.id || index} className="relative flex-shrink-0">
                <img
                  src={image.url}
                  alt="Imagen subida"
                  className={`w-full h-16 md:h-20 object-cover rounded border-2 cursor-pointer ${
                    selectedImage === image.url
                      ? "border-green-500"
                      : "border-[#BF8D6B]"
                  }`}
                  onClick={() => onImageSelect(image.url)}
                  title="Seleccionar"
                />
                {selectedImage === image.url && (
                  <div className="absolute top-1 right-1 bg-green-500 text-white rounded-full p-0.5 md:p-1">
                    <Check className="h-2 w-2 md:h-3 md:w-3" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-2 md:py-3 text-gray-400 text-xs md:text-sm">
          {loading ? "Cargando..." : "No hay imágenes"}
        </div>
      )}
    </div>
  );
}
