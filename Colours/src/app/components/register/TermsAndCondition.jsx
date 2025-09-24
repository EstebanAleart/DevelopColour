// TermsAndConditions.js (corregido y actualizado con checkbox)
"use client";

import Link from "next/link";

export default function TermsAndConditions({ accepted, setAccepted }) {
  return (
    <div className="text-center flex items-center justify-center gap-2">
      <input
        type="checkbox"
        checked={accepted}
        onChange={(e) => setAccepted(e.target.checked)}
        className="h-4 w-4 text-[#BF8D6B] focus:ring-[#BF8D6B] border-gray-300 rounded"
      />
      <span className="text-gray-300 text-sm">
        Acepto los{" "}
        <Link
          href="/terms"
          className="text-white hover:text-teal-400 transition-colors"
        >
          términos, condiciones y políticas de privacidad
        </Link>
      </span>
    </div>
  );
}
