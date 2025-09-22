export const FormGrid = ({ children }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
      {children}
    </div>
  );
};
