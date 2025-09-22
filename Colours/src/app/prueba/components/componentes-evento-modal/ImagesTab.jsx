import { Check, Image } from "lucide-react";

export default function ImagesTab({
  images,
  selectedImage,
  loadingImages,
  selectImage,
  loadImages,
  setActiveTab,
  setFormData,
}) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-sm md:text-base font-semibold text-white">
          Seleccionar imagen para el evento (opcional)
        </h3>
        <button
          onClick={loadImages}
          className="text-xs text-[#BF8D6B] hover:text-[#a67454] flex items-center"
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
        <div className="py-4 md:py-6 text-center text-[#BF8D6B]">
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
            className="animate-spin h-5 w-5 md:h-6 md:w-6 mx-auto mb-2"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
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
                  selectedImage === image.url
                    ? "border-green-500 ring-1 ring-green-500"
                    : "border-[#BF8D6B] hover:border-[#a67454]"
                }`}
                onClick={() => selectImage(image.url)}
              />
              {selectedImage === image.url && (
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
          onClick={() => {
            if (selectedImage) {
              setFormData((prev) => ({ ...prev, image: selectedImage }));
            }
            setActiveTab("info");
          }}
          className="px-2 py-1 md:px-3 md:py-1 bg-[#BF8D6B] hover:bg-[#a67454] text-white rounded border border-[#BF8D6B] text-xs flex items-center gap-1 transition-colors"
        >
          <Check className="h-3 w-3" />
          <span>
            {selectedImage
              ? "Usar imagen seleccionada"
              : "Continuar sin imagen"}
          </span>
        </button>
      </div>
    </div>
  );
}
