import { X } from "lucide-react";

export default function ModalHeader({ onClose, title }) {
  return (
    <div className="flex justify-between items-center mb-3 md:mb-3">
      <h2 className="text-base md:text-lg font-bold text-white">{title}</h2>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-white p-1 md:p-0"
      >
        <X className="h-4 w-4 md:h-5 md:w-5" />
      </button>
    </div>
  );
}
