import React from "react";

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
}

export default function CurrencyInput({ value, onChange, placeholder, className }: CurrencyInputProps) {
  // Jika nilai 0, tampilkan kosong (agar mudah diketik). Jika ada nilai, format dengan titik.
  const displayValue = value === 0 ? "" : value.toLocaleString("id-ID");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Hapus semua karakter selain angka (termasuk huruf dan titik)
    const rawValue = e.target.value.replace(/[^0-9]/g, "");
    onChange(Number(rawValue));
  };

  return <input type="text" value={displayValue} onChange={handleChange} placeholder={placeholder} className={className} />;
}
