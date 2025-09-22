import { Check } from "lucide-react";

export default function ImageGallery({
  images,
  selectedImage,
  copyToClipboard,
}) {
  return (
    <div className="mt-2 md:mt-3">
      <h3 className="text-xs md:text-sm font-semibold text-white mb-2">
        Imágenes disponibles
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
        {images.map((image) => (
          <div key={image.id} className="relative">
            <img
              src={image.url}
              alt="Imagen subida"
              className={`w-full h-16 md:h-20 object-cover rounded border cursor-pointer ${
                selectedImage === image.url
                  ? "border-green-500"
                  : "border-[#BF8D6B]"
              }`}
              onClick={() => copyToClipboard(image.url)}
              title="Haz clic para copiar la URL"
            />
            {selectedImage === image.url && (
              <div className="absolute top-1 right-1 bg-green-500 text-white rounded-full p-1">
                <Check className="h-2 w-2 md:h-3 md:w-3" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
