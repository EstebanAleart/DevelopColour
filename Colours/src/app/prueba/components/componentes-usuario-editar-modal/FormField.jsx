export const FormField = ({
  type,
  name,
  placeholder,
  value,
  onChange,
  required = false,
}) => {
  return (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      className="w-full p-2 md:p-2 bg-transparent text-white rounded border border-[#BF8D6B] placeholder-gray-400 text-xs md:text-sm"
      value={value}
      onChange={onChange}
      required={required}
    />
  );
};
