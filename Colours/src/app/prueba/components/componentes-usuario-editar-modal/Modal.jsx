export const Modal = ({ children, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-2 md:p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="bg-[#1a1a1a] rounded-lg p-3 md:p-4 w-full max-w-xs md:max-w-3xl max-h-[95vh] overflow-y-auto shadow-lg relative z-10">
        {children}
      </div>
    </div>
  );
};
