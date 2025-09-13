"use client";

import { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import Swal from "sweetalert2";

export default function UploadImageModal({ onClose, API_URL }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [images, setImages] = useState([]); // Estado para almacenar imágenes existentes
  const [selectedImage, setSelectedImage] = useState(null); // Imagen seleccionada

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch(`${API_URL.replace("/image", "/images")}`); // Endpoint para obtener imágenes
        if (!response.ok) {
          throw new Error("Error al obtener las imágenes");
        }
        const data = await response.json();
        setImages(data);
      } catch (err) {
        console.error(err);
        setError("Error al cargar las imágenes existentes");
      }
    };

    fetchImages();
  }, [API_URL]);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setSelectedImage(null); // Desmarca cualquier imagen seleccionada
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Por favor selecciona una imagen");
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedFile);

    setIsUploading(true);
    setError(null);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Error al subir la imagen");
      }

      const data = await response.json();
      Swal.fire({
        icon: "success",
        title: "Imagen subida correctamente",
        text: `URL: ${data.imageUrl}`,
        confirmButtonColor: "#BF8D6B",
      });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageSelect = (image) => {
    setSelectedImage(image);
    setSelectedFile(null); // Desmarca cualquier archivo cargado
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] rounded-lg p-4 w-full max-w-md shadow-lg">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold text-white">Cargar Imagen</h2>
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

          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="mb-3 w-full text-white text-xs"
          />

          <button
            onClick={handleUpload}
            className="w-full font-bold py-2 px-2 rounded bg-[#BF8D6B] text-white text-sm"
            disabled={isUploading}
          >
            {isUploading ? "Subiendo..." : "Subir Imagen"}
          </button>

          <h3 className="text-sm font-semibold text-white mt-4 mb-2">
            Imágenes existentes
          </h3>

          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
            {images.map((image) => (
              <div
                key={image.id}
                className={`relative border rounded-lg cursor-pointer ${
                  selectedImage?.id === image.id
                    ? "border-green-500"
                    : "border-[#BF8D6B]"
                }`}
                onClick={() => handleImageSelect(image)}
              >
                <img
                  src={image.url}
                  alt="Imagen existente"
                  className="w-full h-24 object-cover rounded-lg"
                />
                {selectedImage?.id === image.id && (
                  <div className="absolute top-1 right-1 bg-green-500 text-white rounded-full p-1">
                    <Check className="h-3 w-3" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
