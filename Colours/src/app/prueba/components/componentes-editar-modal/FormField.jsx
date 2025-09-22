export default function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  maxLength,
  showFormattedValue = false,
  formattedValue = "",
}) {
  return (
    <div className={showFormattedValue ? "relative" : ""}>
      <label className="block text-xs md:text-sm text-yellow-400 mb-1">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        className="w-full p-2 md:p-3 bg-gray-700 text-white rounded-lg border border-yellow-600 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-500 outline-none transition-colors text-xs md:text-sm"
        required={required}
        maxLength={maxLength}
      />
      {showFormattedValue && (
        <span className="absolute right-2 md:right-3 top-7 md:top-8 text-green-400 text-xs">
          {formattedValue}
        </span>
      )}
    </div>
  );
}
