// components/ImageGallery.js
"use client";

import { useState } from "react";
import { X } from "lucide-react";
import useImageFetcher from "./ImageFetcher";
import Swal from "sweetalert2";

const ImageGallery = ({ onClose, onImageSelected }) => {
  const { images, loading } = useImageFetcher();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Galería de Imágenes
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : images.length === 0 ? (
            <p className="text-center py-8 text-gray-500 dark:text-gray-400">
              No hay imágenes disponibles
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((image) => (
                <div
                  key={image._id || image.id}
                  className="group relative bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 cursor-pointer"
                  onClick={() => {
                    if (onImageSelected) {
                      onImageSelected(image.url);
                      onClose();
                    }
                  }}
                >
                  <img
                    src={image.url}
                    alt={`Imagen ${image._id || image.id}`}
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="flex flex-col space-y-2">
                      {onImageSelected && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onImageSelected(image.url);
                            onClose();
                          }}
                          className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
                        >
                          Seleccionar
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
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
  );
};

export default ImageGallery;
