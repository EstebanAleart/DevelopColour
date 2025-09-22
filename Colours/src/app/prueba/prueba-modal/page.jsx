"use client";

import { useState } from "react";
import ImageUploaderModal from "../components/cloudinary/image-uploader-modal"; // Importamos el componente del modal
import ImageGallery from "../components/cloudinary/ImageGallery"; // Importamos el nuevo componente

export default function Page() {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Administrador de Imágenes</h1>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
        >
          Subir Imágenes
        </button>

        <button
          onClick={() => setShowGalleryModal(true)}
          className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded"
        >
          Ver Galería
        </button>
      </div>

      {showUploadModal && (
        <ImageUploaderModal onClose={() => setShowUploadModal(false)} />
      )}

      {showGalleryModal && (
        <ImageGallery onClose={() => setShowGalleryModal(false)} />
      )}

      {/* Estilos para los modales */}
      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        .modal {
          background-color: white;
          padding: 2rem;
          border-radius: 0.5rem;
          width: 90%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
}
