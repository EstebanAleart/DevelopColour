// import React, { useState, useEffect } from "react";
// import Link from "next/link";
// import Login from "../login/Login"; // Importar el componente Login

// const Home = () => {
//   const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

//   useEffect(() => {
//     const handleMouseMove = (event) => {
//       setMousePosition({ x: event.clientX, y: event.clientY });
//     };

//     window.addEventListener("mousemove", handleMouseMove);

//     return () => {
//       window.removeEventListener("mousemove", handleMouseMove);
//     };
//   }, []);

//   return (
//     <div>
//       <Login />
//     </div>
//   );
// };

// export default Home;

"use client"
import Image from "next/image"
import OAuthButton from "../login/OAuthButton"
import Link from "next/link"

const Home = () => {

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#12151f] to-[#1a1d2e] px-4">
      <div className="text-center max-w-md mx-auto">
        {/* Logo */}
      

        {/* Welcome Text */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Bienvenido</h1>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            a <span className="text-[#BF8D6B]">XeventApp</span>
          </h2>
          <p className="text-[#EDEEF0]/80 text-lg">Tu plataforma de eventos favorita</p>
        </div>


        <OAuthButton/>
         
       
        <div className="mt-8 flex justify-center space-x-2">
          <div className="w-2 h-2 bg-[#BF8D6B]/30 rounded-full"></div>
          <div className="w-2 h-2 bg-[#BF8D6B]/50 rounded-full"></div>
          <div className="w-2 h-2 bg-[#BF8D6B] rounded-full"></div>
        </div>
         <div className="mb-8">
          <Image
            src="https://res.cloudinary.com/dmjusy7sn/image/upload/v1753239784/Group_118_i3hj6p.png"
            alt="XeventApp Logo"
            width={180}
            height={120}
            className="object-contain mx-auto"
          />
        </div>

        <div className="text-center mt-4">
        <span className="text-[#EDEEF0] text-sm">
          También puedes{" "}
        </span>
        <Link
          href="/register"
          className="text-[#FFFFFF] hover:underline text-sm font-medium"
        >
          Registrarte
        </Link>
      </div>
      </div>
    </div>
  )
}

export default Home
