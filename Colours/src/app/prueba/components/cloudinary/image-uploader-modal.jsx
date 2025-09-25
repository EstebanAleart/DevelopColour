// components/ImageUploaderModal.js
"use client";

import { X } from "lucide-react";
import { useState } from "react";
import Swal from "sweetalert2";
import useImageFetcher from "./ImageFetcher";
import apiUrls from "@/app/components/utils/apiConfig";

const API_URL = apiUrls;

const ImageUploaderModal = ({ onClose, onImageSelected }) => {
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const {
    images,
    loading: cargandoImagenes,
    refreshImages,
  } = useImageFetcher();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleImageUpload = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      Swal.fire({
        icon: "warning",
        title: "Sin imagen",
        text: "Por favor, selecciona una imagen antes de subirla.",
      });
      return;
    }

    setSubiendoImagen(true);

    const formData = new FormData();
    formData.append("image", imageFile);

    try {
      const res = await fetch(`${API_URL}/api/upload/image`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("No se pudo subir la imagen");

      const data = await res.json();
      // console.log("Imagen subida:", data);

      // En lugar de actualizar el estado local, refrescamos las imágenes
      refreshImages();

      Swal.fire({
        icon: "success",
        title: "Imagen subida",
        text: "La imagen se subió correctamente.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error al subir imagen:", error);
      Swal.fire({
        icon: "error",
        title: "Error al subir la imagen",
        text: error.message || "Ocurrió un error al subir la imagen",
      });
    } finally {
      setSubiendoImagen(false);
      setImageFile(null);
      setPreview("");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Subir Imágenes
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-4">
          <form onSubmit={handleImageUpload}>
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Seleccionar imagen
              </label>
              <input
                type="file"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100
                  dark:file:bg-blue-900 dark:file:text-blue-100
                  dark:hover:file:bg-blue-800"
                accept="image/*"
              />
              {preview && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Vista previa:
                  </h4>
                  <img
                    src={preview}
                    alt="Previsualización"
                    className="max-h-40 rounded object-contain border border-gray-200 dark:border-gray-600"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={subiendoImagen || !imageFile}
              className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                subiendoImagen || !imageFile
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {subiendoImagen ? "Subiendo..." : "Subir Imagen"}
            </button>
          </form>

          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Imágenes Subidas
            </h3>
            {cargandoImagenes ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : images.length === 0 ? (
              <p className="text-center py-8 text-gray-500 dark:text-gray-400">
                No hay imágenes subidas
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {images.map((image) => (
                  <div
                    key={image._id || image.id}
                    className="group relative bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 cursor-pointer"
                    onClick={() => {
                      // Pass the selected image URL back to the parent component
                      onImageSelected?.(image.url);
                    }}
                  >
                    <img
                      src={image.url}
                      alt={`Imagen ${image._id || image.id}`}
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent triggering the parent onClick
                            onImageSelected?.(image.url);
                            onClose();
                          }}
                          className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
                        >
                          Seleccionar
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent triggering the parent onClick
                            navigator.clipboard.writeText(image.url);
                            Swal.fire({
                              icon: "success",
                              title: "URL copiada",
                              text: "La URL de la imagen ha sido copiada al portapapeles",
                              timer: 1500,
                              showConfirmButton: false,
                            });
                          }}
                          className="text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm"
                        >
                          Copiar URL
                        </button>
                      </div>
                    </div>
                    <div className="p-2">
                      <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
                        {image.url}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUploaderModal;
