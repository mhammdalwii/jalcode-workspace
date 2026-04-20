import Cookies from "js-cookie";

// Fungsi untuk mendapatkan role pengguna saat ini
export const getUserRole = (): string | null => {
  return Cookies.get("role") || null;
};

// Fungsi bantuan untuk menyembunyikan/menampilkan tombol CRUD
export const isAdminOrFounder = (): boolean => {
  const role = Cookies.get("role");
  return role === "Founder" || role === "Admin";
};
