import { X } from "lucide-react";

export default function ListaSubtipos({ subtipos, removeSubtipo }) {
  if (subtipos.length === 0) {
    return (
      <div className="text-gray-400 text-xs italic p-2 text-center">
        No hay subtipos agregados. La entrada tendrá disponibilidad general.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {subtipos.map((subtipo, index) => (
        <div
          key={index}
          className="bg-[#2a2a2a] p-2 rounded flex justify-between items-center"
        >
          <div>
            <div className="text-white text-sm font-medium">
              {subtipo.nombre}
            </div>
            <div className="text-[#BF8D6B] text-xs">
              ${subtipo.precio} - {subtipo.cantidad_disponible} unidades
            </div>
          </div>
          <button
            type="button"
            onClick={() => removeSubtipo(index)}
            className="text-red-400 hover:text-red-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
