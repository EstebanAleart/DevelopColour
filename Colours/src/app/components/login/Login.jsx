"use client";

import LoginForm from "./LoginForm";
import Image from "next/image";

export default function Login() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#12151f]/40 px-4 py-12">
      <div className="w-full max-w-md bg-[#1E2330]/70 p-6 rounded-xl shadow-lg">
        <div className="mb-8">
          <div className="text-center">
            <h1 className="text-[#FFFFFF] text-3xl font-bold">Bienvenido</h1>
            <h2 className="text-[#FFFFFF] text-3xl font-bold mb-4">
              a XeventApp
            </h2>
          </div>
          <div className="flex justify-center my-4">
            <Image
              src="https://res.cloudinary.com/dmjusy7sn/image/upload/v1753239784/Group_118_i3hj6p.png"
              alt="ColourApp Logo"
              width={150}
              height={100}
              className="object-contain"
            />
          </div>
          <p className="text-[#EDEEF0] text-sm"></p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
