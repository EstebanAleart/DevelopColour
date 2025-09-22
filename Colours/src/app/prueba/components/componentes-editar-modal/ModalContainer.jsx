import { X } from "lucide-react";

export default function ModalContainer({ children, onClose, title }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-2 md:p-4 bg-black bg-opacity-70">
      <div className="bg-gray-800 rounded-lg border-2 border-yellow-600 p-3 md:p-6 w-full max-w-xs md:max-w-3xl max-h-[95vh] overflow-y-auto shadow-lg shadow-yellow-800/20">
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <h2 className="text-base md:text-xl font-semibold text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-yellow-500 hover:text-yellow-300 transition-colors p-1 md:p-0"
          >
            <X className="h-4 w-4 md:h-5 md:w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
