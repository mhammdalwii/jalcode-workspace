/* eslint-disable @next/next/no-img-element */
import React from "react";

export default function Letterhead() {
  return (
    <div className="border-b-4 border-blue-700 pb-4 mb-6 flex justify-between items-end">
      {/* BAGIAN KIRI: LOGO & TAGLINE */}
      <div className="flex flex-col gap-1">
        <img src="/logo/logoRemove.png" alt="Jalcode Logo" className="h-30 w-auto object-contain" crossOrigin="anonymous" />
      </div>

      {/* BAGIAN KANAN: KONTAK */}
      <div className="text-right text-[10px] text-gray-500 leading-relaxed">
        <p>Makassar, Sulawesi Selatan</p>
        <p>WA: 088804207761 | Email: jalcodeid@gmail.com</p>
        <p>Website: www.jalcode.id</p>
      </div>
    </div>
  );
}
