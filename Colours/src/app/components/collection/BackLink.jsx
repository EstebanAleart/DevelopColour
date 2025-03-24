import Link from "next/link";

export default function BackLink() {
  return (
    <div className="mt-8">
      <Link href="/" className="text-white-500 hover:underline">
        Volver Atrás
      </Link>
    </div>
  );
}
