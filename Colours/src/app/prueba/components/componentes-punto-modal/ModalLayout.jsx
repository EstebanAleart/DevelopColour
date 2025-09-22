import { X } from "lucide-react";

export default function ModalLayout({ onClose, title, children }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-2 md:p-4">
      <div className="bg-[#1a1a1a] rounded-lg p-3 md:p-4 w-full max-w-xs md:max-w-2xl max-h-[95vh] overflow-y-auto shadow-lg">
        <div className="flex justify-between items-center mb-3 md:mb-3">
          <h2 className="text-base md:text-lg font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 md:p-0"
          >
            <X className="h-4 w-4 md:h-5 md:w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
