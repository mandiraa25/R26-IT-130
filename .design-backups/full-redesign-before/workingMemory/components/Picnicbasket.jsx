import React from "react";

// Picnic Basket Vector Component for Instructions game
const PicnicBasket = ({ children, className = "" }) => {
  return (
    <div className={`relative w-full max-w-2xl bg-[#b07d50] border-4 border-[#8c613c] rounded-[1.8rem] md:rounded-[2rem] shadow-2xl p-3 sm:p-4 md:p-5 flex flex-wrap justify-center gap-2.5 sm:gap-3 min-h-[120px] sm:min-h-[140px] md:min-h-[160px] ${className}`}>
      {/* Wooden Top Rim Bar */}
      <div className="absolute -top-3 left-4 right-4 h-5 bg-[#c29062] border-2 border-[#8c613c] rounded-full shadow-md z-0 flex items-center justify-center">
        <div className="w-11/12 h-1.5 bg-[#d9ad7c] rounded-full" />
      </div>

      {/* Left Handle */}
      <div className="absolute top-1/2 -left-5 -translate-y-1/2 w-6 h-16 border-4 border-[#8c613c] rounded-l-full bg-[#99663d] shadow-md z-0" />
      {/* Right Handle */}
      <div className="absolute top-1/2 -right-5 -translate-y-1/2 w-6 h-16 border-4 border-[#8c613c] rounded-r-full bg-[#99663d] shadow-md z-0" />

      {/* Woven pattern background overlay */}
      <div
        className="absolute inset-0 opacity-15 rounded-[1.6rem] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(90deg, #000 50%, transparent 50%),
            linear-gradient(transparent 50%, #000 50%)
          `,
          backgroundSize: "20px 20px",
        }}
      />

      {/* Basket Contents Container */}
      <div className="relative z-10 flex flex-wrap justify-center gap-2.5 sm:gap-3 w-full items-center">
        {children}
      </div>
    </div>
  );
};

export default PicnicBasket;