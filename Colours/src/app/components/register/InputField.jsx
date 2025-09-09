"use client";

export default function InputField({
  placeholder,
  type = "text",
  id,
  value,
  onChange,
  onBlur,
  required,
}) {
  return (
    <div className="relative">
      <input
        type={type}
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        required={required}
        className="w-full bg-gray-900/50 text-white border border-[#BF8D6B] focus:border-teal-400 rounded-xl py-3 px-4 focus:outline-none focus:ring-1 focus:ring-teal-300 text-sm md:text-base transition-all placeholder-gray-500"
      />
    </div>
  );
}
