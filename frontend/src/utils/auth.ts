import Cookies from "js-cookie";

// Fungsi untuk membaca isi Token JWT dan mengambil Role-nya
export const getUserRole = (): string | null => {
  const token = Cookies.get("token");
  if (!token) return null;

  try {
    // JWT terdiri dari 3 bagian yang dipisah titik. Bagian ke-2 adalah data (payload)
    const payload = token.split(".")[1];
    // Decode data dari Base64 ke JSON
    const decoded = JSON.parse(atob(payload));

    // Asumsi: di Golang (utils.GenerateToken), kamu menyimpan role dengan key 'role'
    return decoded.role;
  } catch (error) {
    console.error("Gagal membaca token:", error);
    return null;
  }
};

// Fungsi bantuan agar lebih mudah dipakai di komponen
export const isAdminOrFounder = (): boolean => {
  const role = getUserRole();
  return role === "Admin" || role === "Founder";
};
